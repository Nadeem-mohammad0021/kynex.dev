
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Copy, Code, Webhook, Send, Instagram, AlertCircle, X, Eye, MessageCircle, Hash, Globe, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Loader } from '@/components/ui/loader';
import type { User } from '@supabase/supabase-js';
import { UniversalDeployDialog } from '@/components/universal-deploy-dialog';
import type { Workflow } from '@/types/agent';
import { DeploymentDetailDialog } from '@/components/deployment-detail-dialog';
import { DeleteAgentDialog } from '@/components/delete-agent-dialog';

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
        platform: string;
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

  const fetchInitialData = useCallback(async (userId: string) => {
      const supabase = getSupabaseBrowserClient();
      setIsLoading(true);
      setError(null);
      
      try {
        // Use Supabase Auth user ID directly
        const supabaseUserId = userId;
        
        // Get or create user in users table if needed
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('user_id', supabaseUserId)
          .single();

        // If user doesn't exist in users table, create them
        if (userError && userError.code === 'PGRST116') {
          const { data: session } = await supabase.auth.getSession();
          if (session?.session?.user) {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                user_id: supabaseUserId,
                email: session.session.user.email || '',
                name: session.session.user.user_metadata?.full_name || session.session.user.email || ''
              });
            
            if (createError) {
              console.error('Error creating user:', createError);
              setError('Error creating user profile');
              setIsLoading(false);
              return;
            }
          }
        } else if (userError) {
          console.error('Error fetching user:', userError);
          setError('Error loading user profile');
          setIsLoading(false);
          return;
        }

        const internalUserId = supabaseUserId;

        // First get user's workflows
        const { data: workflowsData, error: workflowsError } = await supabase
          .from('workflows')
          .select('workflow_id, name, config')
          .eq('user_id', internalUserId);
        
        if (workflowsError) {
          console.error('Workflows error:', workflowsError);
          setError(`Failed to load workflows: ${workflowsError.message}`);
          setIsLoading(false);
          return;
        }
        
        const workflowIds = workflowsData?.map(w => w.workflow_id) || [];
        
        let deploymentsData: any[] = [];
        let deploymentsError = null;
        
        if (workflowIds.length > 0) {
          // Get agents for user's workflows
          const { data: agentsData, error: agentsError } = await supabase
            .from('agents')
            .select('agent_id, workflow_id, name, model, config')
            .in('workflow_id', workflowIds);
          
          if (agentsError) {
            console.error('Agents error:', agentsError);
            setError(`Failed to load agents: ${agentsError.message}`);
            setIsLoading(false);
            return;
          }
          
          const agentIds = agentsData?.map(a => a.agent_id) || [];
          
          if (agentIds.length > 0) {
            // Get deployments for these agents
            const { data: rawDeployments, error: deployError } = await supabase
              .from('deployments')
              .select('deployment_id, agent_id, url, status, created_at')
              .in('agent_id', agentIds)
              .order('created_at', { ascending: false });
            
            if (deployError) {
              deploymentsError = deployError;
            } else {
              // Transform to match expected structure
              deploymentsData = (rawDeployments || []).map(deployment => {
                const agent = agentsData?.find(a => a.agent_id === deployment.agent_id);
                const workflow = workflowsData?.find(w => w.workflow_id === agent?.workflow_id);
                
                  // Determine platform from agent config with enhanced detection
                  const agentConfig = agent?.config || {};
                  console.log('Agent config for deployment:', deployment.deployment_id, ':', agentConfig); // Enhanced debug log
                  
                  // Try multiple ways to detect the platform
                  let detectedPlatform = agentConfig.platform;
                  
                  // Fallback: try to detect from agent name or model
                  if (!detectedPlatform) {
                    const agentName = agent?.name?.toLowerCase() || '';
                    if (agentName.includes('widget') || agentName.includes('website')) {
                      detectedPlatform = 'Website Widget';
                    } else if (agentName.includes('telegram')) {
                      detectedPlatform = 'Telegram';
                    } else if (agentName.includes('whatsapp')) {
                      detectedPlatform = 'WhatsApp';
                    } else if (agentName.includes('twitter') || agentName.includes('x (twitter)')) {
                      detectedPlatform = 'X (Twitter)';
                    } else if (agentName.includes('instagram')) {
                      detectedPlatform = 'Instagram';
                    } else {
                      detectedPlatform = 'API Webhook'; // Default fallback
                    }
                  }
                  
                  console.log('Detected platform for deployment:', deployment.deployment_id, ':', detectedPlatform);

                  return {
                    deployment_id: deployment.deployment_id,
                    agent_id: deployment.agent_id,
                    webhook_url: deployment.url, // Map url to webhook_url for compatibility
                    embed_code: null, // Not in new schema
                    status: deployment.status,
                    deployed_at: deployment.created_at, // Map created_at to deployed_at for compatibility
                    agents: {
                      name: agent?.name,
                      platform: detectedPlatform,
                      status: 'active', // Default status since not in new schema
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

        setDeployments((deploymentsData || []) as unknown as DeploymentWithAgents[]);
        setMyWorkflows(completeWorkflowsData || []);

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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setUser(session.user);
            fetchInitialData(session.user.id);
        } else {
            setIsLoading(false);
            setError("No active session. Please sign in.");
        }
    };
    checkUserAndFetch();
  }, [fetchInitialData]);

  const onDeploymentSuccess = () => {
      if(user) {
        fetchInitialData(user.id);
      }
  }
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold mb-2">Agent Deployments</h1>
                <p className="text-muted-foreground">Deploy your agents to any platform with a single prompt.</p>
            </div>
            <UniversalDeployDialog 
                workflows={myWorkflows} 
                onSuccess={onDeploymentSuccess}
            />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Channels</CardTitle>
                <CardDescription>Connect your agents to different platforms to interact with users.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                {channels.map(channel => {
                    const Icon = platformIcons[channel.name] || Code;
                    const connectedCount = deployments.filter(d => d.agents?.platform === channel.name).length;
                    return (
                        <Card key={channel.name} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <div>
                                        <h3 className="text-lg font-semibold">{channel.name}</h3>
                                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                                    </div>
                                </div>
                                <UniversalDeployDialog 
                                    workflows={myWorkflows} 
                                    onSuccess={onDeploymentSuccess}
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <Badge variant={connectedCount > 0 ? 'default' : 'outline'}>
                                        {connectedCount} deployed
                                    </Badge>
                                    {connectedCount > 0 && (
                                        <span className="text-xs text-green-600">● Active</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>

        <Card>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Deployed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deployments.map((deployment) => {
                      const agentName = deployment.agents?.name || deployment.agents?.workflows?.name || deployment.agents?.workflows?.config?.name || 'Unnamed Agent';
                      const platform = deployment.agents?.platform || 'N/A';
                      const status = deployment.status || deployment.agents?.status || 'deployed';

                      return (
                        <TableRow key={deployment.deployment_id}>
                            <TableCell className="font-medium">{agentName}</TableCell>
                            <TableCell>{platform}</TableCell>
                            <TableCell>
                            <Badge variant={status === 'deployed' || status === 'active' ? 'default' : 'destructive'} className="capitalize">
                                {status}
                            </Badge>
                            </TableCell>
                            <TableCell>{new Date(deployment.deployed_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <DeploymentDetailDialog deployment={{
                                    deployment_id: deployment.deployment_id,
                                    agent_id: deployment.agent_id,
                                    webhook_url: deployment.webhook_url || null,
                                    deployed_at: deployment.deployed_at,
                                    agent: {
                                        platform: deployment.agents?.platform || 'Unknown',
                                        workflow: {
                                            config: {
                                                name: deployment.agents?.workflows?.config?.name || deployment.agents?.workflows?.name || 'Unnamed Agent'
                                            }
                                        }
                                    }
                                }}>
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View Integration</span>
                                    </Button>
                                </DeploymentDetailDialog>
                                <DeleteAgentDialog
                                  agentId={deployment.agent_id}
                                  agentName={agentName}
                                  platform={platform}
                                  onDeleted={onDeploymentSuccess}
                                >
                                  <Button variant="ghost" size="icon" title="Delete agent">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete agent</span>
                                  </Button>
                                </DeleteAgentDialog>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More actions</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
             )}
          </CardContent>
        </Card>
    </div>
  );
}
