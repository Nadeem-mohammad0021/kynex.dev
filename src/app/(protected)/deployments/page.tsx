
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Copy, Code, Webhook, Send, Instagram, AlertCircle, X, Eye, MessageCircle, Hash, Globe, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Loader } from '@/components/ui/loader';
import type { User } from '@supabase/supabase-js';
import { UniversalDeployDialog } from '@/components/universal-deploy-dialog';
import { DeploymentDetailDialog } from '@/components/deployment-detail-dialog';
import { DeleteAgentDialog } from '@/components/delete-agent-dialog';
import { TutorialButton } from '@/components/tutorial/tutorial-button';

const platformIcons: { [key: string]: React.ElementType } = {
    'Website Widget': Code,
    'API Webhook': Webhook,
    'WhatsApp': MessageCircle,
    'Telegram': Send,
    'X (Twitter)': X,
    'Instagram': Instagram,
};

const channels = [
    { name: 'Website Widget', description: 'Embed agent on your website' },
    { name: 'API Webhook', description: 'Connect via REST API' },
    { name: 'WhatsApp', description: 'WhatsApp Business integration' },
    { name: 'Telegram', description: 'Telegram bot integration' },
    { name: 'X (Twitter)', description: 'Twitter/X bot integration' },
    { name: 'Instagram', description: 'Instagram messaging' },
];

interface DeploymentWithAgents {
    deployment_id: string;
    agent_id: string;
    webhook_url?: string;
    embed_code?: string;
    status: string;
    deployed_at: string;
    agents: {
        name?: string;
        platform: string; // Derived from config or default
        status: string;
        workflows: {
            user_id: string;
            name?: string;
            spec?: {
                name?: string;
            }
        }
    }
}

export default function DeploymentsPage() {
  const { toast } = useToast();
  const [deployments, setDeployments] = useState<DeploymentWithAgents[]>([]);
  const [myWorkflows, setMyWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDeploymentForView, setSelectedDeploymentForView] = useState<DeploymentWithAgents | null>(null);
  const [selectedDeploymentForDelete, setSelectedDeploymentForDelete] = useState<{deployment: DeploymentWithAgents; agentName: string; platform: string} | null>(null);

  const fetchInitialData = useCallback(async (userId: string) => {
      console.log('fetchInitialData called for userId:', userId);
      const supabase = getSupabaseBrowserClient();
      setIsLoading(true);
      setError(null);
      
      try {
        // Use Supabase Auth user ID directly
        const supabaseUserId = userId;
        
        // Use Supabase Auth user ID directly - skip the public.users table for now
        const internalUserId = supabaseUserId;
        console.log('Using user ID:', internalUserId);

        // First get user's workflows
        console.log('Fetching workflows for user:', internalUserId);
        const { data: workflowsData, error: workflowsError } = await supabase
          .from('workflows')
          .select('workflow_id, name, config')
          .eq('user_id', internalUserId);
        
        console.log('Workflows query result:', { workflowsData, workflowsError });
        
        if (workflowsError) {
          console.error('Workflows error:', workflowsError);
          setError(`Failed to load workflows: ${workflowsError.message}`);
          setIsLoading(false);
          return;
        }
        
        const workflowIds = workflowsData?.map(w => w.workflow_id) || [];
        console.log('Found workflow IDs:', workflowIds);
        
        let deploymentsData: any[] = [];
        let deploymentsError = null;
        
        if (workflowIds.length > 0) {
          // Test basic agents table access first
          console.log('Testing agents table access...');
          const { data: testAgents, error: testError } = await supabase
            .from('agents')
            .select('agent_id')
            .limit(1);
          
          console.log('Agents table test result:', { testAgents, testError });
          
          if (testError) {
            console.error('Cannot access agents table:', testError);
            setError(`Cannot access agents table: ${testError.message || 'Unknown error'}`);
            setIsLoading(false);
            return;
          }
          
          // Get agents for user's workflows (no platform field in schema)
          console.log('Fetching agents for workflow IDs:', workflowIds);
          const { data: agentsData, error: agentsError } = await supabase
            .from('agents')
            .select('agent_id, workflow_id, name, description, model, config')
            .in('workflow_id', workflowIds);
          
          console.log('Agents query result:', { agentsData, agentsError });
          
          if (agentsError) {
            console.error('Agents error:', agentsError);
            console.error('Agents error details:', {
              message: agentsError.message,
              code: agentsError.code,
              details: agentsError.details,
              hint: agentsError.hint,
              workflowIds: workflowIds
            });
            setError(`Failed to load agents: ${agentsError.message || 'Unknown error'}`);
            setIsLoading(false);
            return;
          }
          
          const agentIds = agentsData?.map(a => a.agent_id) || [];
          
          if (agentIds.length > 0) {
            // Get deployments for these agents (schema: deployment_id, agent_id, environment, status, url, created_at, updated_at)
            const { data: rawDeployments, error: deployError } = await supabase
              .from('deployments')
              .select('deployment_id, agent_id, environment, status, url, created_at, updated_at')
              .in('agent_id', agentIds)
              .order('created_at', { ascending: false });
            
            if (deployError) {
              deploymentsError = deployError;
            } else {
              // Transform to match expected structure
              deploymentsData = (rawDeployments || []).map(deployment => {
                const agent = agentsData?.find(a => a.agent_id === deployment.agent_id);
                const workflow = workflowsData?.find(w => w.workflow_id === agent?.workflow_id);
                
                // Determine platform from agent config with detailed logging
                const agentConfigPlatform = agent?.config?.platform;
                const agentConfigDeploymentType = agent?.config?.deployment_type;
                const platform = agentConfigPlatform || agentConfigDeploymentType || 'API Webhook';
                
                console.log('Platform detection for deployment:', deployment.deployment_id, {
                  agent_name: agent?.name,
                  agent_config: agent?.config,
                  config_platform: agentConfigPlatform,
                  config_deployment_type: agentConfigDeploymentType,
                  final_platform: platform,
                  environment: deployment.environment
                });

                return {
                  deployment_id: deployment.deployment_id,
                  agent_id: deployment.agent_id,
                  webhook_url: deployment.url, // Map url to webhook_url for compatibility
                  embed_code: null, // Not in schema
                  status: deployment.status,
                  deployed_at: deployment.created_at, // Map created_at to deployed_at for compatibility
                  agents: {
                    name: agent?.name,
                    platform: platform, // Determined from config or default
                    status: deployment.status || 'active',
                    workflows: {
                      user_id: internalUserId,
                      name: workflow?.name,
                      spec: workflow?.config,
                      config: workflow?.config
                    }
                  }
                };
              });
            }
          }
        }

        if (deploymentsError) {
          console.error('Deployments error:', deploymentsError);
          setError(`Failed to load deployments: ${deploymentsError.message}`);
          return;
        }

        // Get complete workflow data for the deployment dialog
        const { data: completeWorkflowsData, error: completeWorkflowsError } = await supabase
          .from('workflows')
          .select('*')
          .eq('user_id', internalUserId)
          .order('updated_at', { ascending: false });
        
        if (completeWorkflowsError) {
          console.error('Complete workflows error:', completeWorkflowsError);
          setError(`Failed to load complete workflows: ${completeWorkflowsError.message}`);
          return;
        }

        console.log('Setting deployments data:', deploymentsData);
        setDeployments((deploymentsData || []) as unknown as DeploymentWithAgents[]);
        setMyWorkflows(completeWorkflowsData || []);
        console.log('Deployments state updated, total deployments:', deploymentsData?.length || 0);

      } catch (e: any) {
        console.error("Error fetching data:", e);
        setError(`Failed to load data: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    const checkUserAndFetch = async () => {
        const supabase = getSupabaseBrowserClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check:', { session: !!session, user: !!session?.user, sessionError });
        
        if (sessionError) {
            console.error('Session error:', sessionError);
            setError("Session error. Please try refreshing.");
            setIsLoading(false);
            return;
        }
        
        if (session?.user) {
            console.log('User found:', session.user.id);
            setUser(session.user);
            fetchInitialData(session.user.id);
        } else {
            console.log('No active session found');
            setIsLoading(false);
            setError("No active session. Please sign in.");
        }
    };
    checkUserAndFetch();
  }, [fetchInitialData]);

  const onDeploymentSuccess = () => {
      console.log('onDeploymentSuccess called, refreshing data...');
      if(user) {
        console.log('User exists, calling fetchInitialData for user:', user.id);
        fetchInitialData(user.id);
      } else {
        console.error('No user found, cannot refresh data');
      }
  }
  
  const copyDeploymentId = (deploymentId: string) => {
    navigator.clipboard.writeText(deploymentId);
    toast({
      title: "Copied!",
      description: "Deployment ID copied to clipboard.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 deployments-header">
            <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold mb-2">Agent Deployments</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Deploy your agents to any platform with a single prompt.</p>
            </div>
            <div className="flex-shrink-0 flex gap-2">
              <div data-tutorial="deploy-btn">
                <UniversalDeployDialog 
                    workflows={myWorkflows} 
                    onSuccess={onDeploymentSuccess}
                />
              </div>
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Channels</CardTitle>
                <CardDescription>Connect your agents to different platforms to interact with users.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-tutorial="platform-cards">
                {channels.map(channel => {
                    const Icon = platformIcons[channel.name] || Code;
                    const connectedCount = deployments.filter(d => d.agents?.platform === channel.name).length;
                    return (
                        <Card key={channel.name} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 space-y-2 sm:space-y-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-primary/10">
                                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-semibold">{channel.name}</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground">{channel.description}</p>
                                    </div>
                                </div>
                                <div className="sm:flex-shrink-0 w-full sm:w-auto">
                                  <UniversalDeployDialog 
                                      workflows={myWorkflows} 
                                      onSuccess={onDeploymentSuccess}
                                  />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <Badge variant={connectedCount > 0 ? 'default' : 'outline'} className="text-xs">
                                        {connectedCount} deployed
                                    </Badge>
                                    {connectedCount > 0 && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                          Active
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>

        <Card data-tutorial="deployment-history">
          <CardHeader>
            <CardTitle>Deployment History</CardTitle>
            <CardDescription>An overview of all agent deployments and their status.</CardDescription>
          </CardHeader>
          <CardContent>
             {error ? (
                <div className="text-destructive text-center p-4 flex items-center gap-2 justify-center"><AlertCircle/> {error}</div>
             ) : deployments.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">No deployments found.</div>
             ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Agent</TableHead>
                        <TableHead className="hidden sm:table-cell">Platform</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Last Deployed</TableHead>
                        <TableHead className="text-right w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {deployments.map((deployment) => {
                      const agentName = deployment.agents?.name || deployment.agents?.workflows?.name || deployment.agents?.workflows?.config?.name || 'Unnamed Agent';
                      const platform = deployment.agents?.platform || 'N/A';
                      const status = deployment.status || deployment.agents?.status || 'deployed';

                      return (
                        <TableRow key={deployment.deployment_id}>
                            <TableCell className="font-medium">
                              <div className="space-y-1">
                                <div className="truncate max-w-[120px] sm:max-w-none">{agentName}</div>
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  {platform} • 
                                  <Badge variant={status === 'deployed' || status === 'active' ? 'default' : 'destructive'} className="capitalize text-[10px] px-1 py-0">
                                    {status}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{platform}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant={status === 'deployed' || status === 'active' ? 'default' : 'destructive'} className="capitalize">
                                  {status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">{new Date(deployment.deployed_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">More actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => copyDeploymentId(deployment.deployment_id)}>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Deployment ID
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedDeploymentForView(deployment);
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Integration
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedDeploymentForDelete({deployment, agentName, platform});
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Agent
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
             )}
          </CardContent>
        </Card>
        
        {/* State-managed dialogs */}
        {selectedDeploymentForView && (
          <DeploymentDetailDialog 
            deployment={{
              deployment_id: selectedDeploymentForView.deployment_id,
              agent_id: selectedDeploymentForView.agent_id,
              webhook_url: selectedDeploymentForView.webhook_url || null,
              deployed_at: selectedDeploymentForView.deployed_at,
              agent: {
                platform: selectedDeploymentForView.agents?.platform || 'Unknown',
                workflow: {
                  config: {
                    name: selectedDeploymentForView.agents?.workflows?.config?.name || selectedDeploymentForView.agents?.workflows?.name || 'Unnamed Agent'
                  }
                }
              }
            }}
            open={!!selectedDeploymentForView}
            onOpenChange={(open) => !open && setSelectedDeploymentForView(null)}
          />
        )}
        
        {selectedDeploymentForDelete && (
          <DeleteAgentDialog
            agentId={selectedDeploymentForDelete.deployment.agent_id}
            deploymentId={selectedDeploymentForDelete.deployment.deployment_id}
            agentName={selectedDeploymentForDelete.agentName}
            platform={selectedDeploymentForDelete.platform}
            onDeleted={() => {
              setSelectedDeploymentForDelete(null);
              onDeploymentSuccess();
            }}
            open={!!selectedDeploymentForDelete}
            onOpenChange={(open) => !open && setSelectedDeploymentForDelete(null)}
          />
        )}
    </div>
  );
}
