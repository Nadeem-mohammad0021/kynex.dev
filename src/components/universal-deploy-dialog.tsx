'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Copy, MessageCircle, Send, X, Instagram, Webhook, Globe, Plus, Rocket, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Workflow } from '@/types/agent';
import Link from 'next/link';

interface UniversalDeployDialogProps {
  workflows: Workflow[];
  onSuccess: () => void;
}

const platformConfigs = {
  'Website Widget': {
    icon: Code,
    color: 'bg-blue-500',
    fields: [],
    prompt: 'Deploy my {agent_name} to Website Widget. Generate the embed code so I can paste it into my landing page.',
    resultType: 'embed_code'
  },
  'API Webhook': {
    icon: Webhook,
    color: 'bg-green-500',
    fields: [],
    prompt: 'Deploy my {agent_name} to API Webhook. Create a webhook endpoint so external apps can send data.',
    resultType: 'webhook_url'
  },
  'WhatsApp': {
    icon: MessageCircle,
    color: 'bg-green-600',
    fields: [
      { name: 'business_api_key', label: 'WhatsApp Business API Key', type: 'password', required: true, placeholder: 'EAAJ...XYZ' }
    ],
    prompt: 'Deploy my {agent_name} to WhatsApp. Use my Business API key {business_api_key} and register the webhook automatically.',
    resultType: 'webhook_registration'
  },
  'Telegram': {
    icon: Send,
    color: 'bg-blue-600',
    fields: [
      { name: 'bot_token', label: 'Bot Token', type: 'password', required: true, placeholder: '12345:ABC-DEF...' }
    ],
    prompt: 'Deploy my {agent_name} to Telegram. Use my bot token {bot_token} and set the webhook.',
    resultType: 'bot_setup'
  },
  'X (Twitter)': {
    icon: X,
    color: 'bg-black',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'API Key' },
      { name: 'api_secret', label: 'API Secret', type: 'password', required: true, placeholder: 'API Secret' },
      { name: 'bearer_token', label: 'Bearer Token', type: 'password', required: true, placeholder: 'Bearer Token' }
    ],
    prompt: 'Deploy my {agent_name} to X (Twitter). Use my API Key, Secret, and Bearer token to connect.',
    resultType: 'twitter_setup'
  },
  'Instagram': {
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    fields: [
      { name: 'app_id', label: 'App ID', type: 'text', required: true, placeholder: 'Instagram App ID' },
      { name: 'access_token', label: 'Access Token', type: 'password', required: true, placeholder: 'Access Token' }
    ],
    prompt: 'Deploy my {agent_name} to Instagram. Use my App ID and Token, connect it, and make it live.',
    resultType: 'instagram_setup'
  }
};

export function UniversalDeployDialog({ workflows, onSuccess }: UniversalDeployDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const { toast } = useToast();

  const selectedConfig = selectedPlatform ? platformConfigs[selectedPlatform as keyof typeof platformConfigs] : null;
  const selectedWorkflowData = workflows.find(w => w.workflow_id === selectedWorkflow);

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const generatePrompt = () => {
    if (!selectedConfig || !selectedWorkflowData) return '';
    
    let prompt = selectedConfig.prompt.replace('{agent_name}', selectedWorkflowData.config?.name || selectedWorkflowData.name || 'Agent');
    
    // Replace credential placeholders
    selectedConfig.fields.forEach(field => {
      prompt = prompt.replace(`{${field.name}}`, credentials[field.name] || `{${field.name}}`);
    });
    
    return prompt;
  };

  const getIntegrationPreview = () => {
    if (!selectedPlatform || !selectedWorkflowData) return null;
    
    const agentName = selectedWorkflowData.config?.name || selectedWorkflowData.name || 'Agent';
    const deploymentId = 'YOUR_DEPLOYMENT_ID'; // Will be replaced after deployment
    
    switch (selectedPlatform) {
      case 'Website Widget':
        const embedCode = `<!-- KYNEX AI Agent Widget -->
<div id="kynex-agent-${deploymentId}"></div>
<script>
  (function() {
    // Complete widget with styling and functionality
    const container = document.getElementById('kynex-agent-${deploymentId}');
    if (!container) return;
    
    // Widget styles and HTML will be inserted here
    // Full chat interface with ${agentName}
    // Message handling and API calls
    // After deployment, replace ${deploymentId} with actual ID
  })();
</script>`;
        
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">📄 Website Embed Code</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Copy this code into your website HTML to embed the chat widget:
              </p>
              <div className="relative">
                <Textarea 
                  readOnly 
                  value={embedCode} 
                  className="pr-12 min-h-[150px] font-mono text-xs"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(embedCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>🚀 After Deployment:</strong> You'll get the complete embed code with actual deployment ID and full functionality.
              </p>
            </div>
          </div>
        );
        
      case 'API Webhook':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">🔗 API Endpoints</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Webhook:</span>
                  <code className="flex-1 text-xs bg-muted p-1 rounded">https://kynex.dev/api/webhook/generic/{deploymentId}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Direct API:</span>
                  <code className="flex-1 text-xs bg-muted p-1 rounded">https://kynex.dev/api/agents/{deploymentId}/message</code>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">💻 Usage Example</h4>
              <div className="relative">
                <Textarea 
                  readOnly 
                  value={`// Send message to your agent
fetch('https://kynex.dev/api/agents/${deploymentId}/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    userId: 'user123'
  })
})
.then(res => res.json())
.then(data => console.log(data.result));`} 
                  className="pr-12 min-h-[120px] font-mono text-xs"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(`// API example code...`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>🎯 Ready to Deploy:</strong> Your API endpoints will be configured automatically.
              </p>
            </div>
          </div>
        );
        
      case 'Telegram':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">🤖 Telegram Bot</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Bot Token:</span>
                  <code className="flex-1 text-xs bg-muted p-1 rounded">{credentials.bot_token || 'Configure above'}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Webhook:</span>
                  <code className="flex-1 text-xs bg-muted p-1 rounded">https://kynex.dev/api/webhook/telegram/{deploymentId}</code>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>✨ Features:</strong> Auto-responds to messages, supports /start, /help, and /reset commands.
              </p>
            </div>
          </div>
        );
        
      case 'WhatsApp':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">💬 WhatsApp Business</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">API Key:</span>
                  <code className="flex-1 text-xs bg-muted p-1 rounded">{credentials.business_api_key || 'Configure above'}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Webhook:</span>
                  <code className="flex-1 text-xs bg-muted p-1 rounded">https://kynex.dev/api/webhook/whatsapp/{deploymentId}</code>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>🔧 Setup:</strong> Configure your WhatsApp Business App with the webhook URL after deployment.
              </p>
            </div>
          </div>
        );
        
      case 'X (Twitter)':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">🐦 Twitter Integration</h4>
              <div className="space-y-1 text-xs">
                <div>• Responds to @mentions automatically</div>
                <div>• Handles direct messages</div>
                <div>• Monitors brand mentions</div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Note:</strong> Requires Twitter Account Activity API subscription ($99+/month).
              </p>
            </div>
          </div>
        );
        
      case 'Instagram':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">📸 Instagram Integration</h4>
              <div className="space-y-1 text-xs">
                <div>• Auto-respond to Instagram DMs</div>
                <div>• Reply to comments on posts</div>
                <div>• Handle story mentions</div>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>📝 Requirements:</strong> Instagram Business Account connected to Facebook Page.
              </p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <p>Select a platform to see integration details</p>
          </div>
        );
    }
  };

  const handleDeploy = async () => {
    if (!selectedWorkflow || !selectedPlatform) {
      toast({
        title: 'Missing Information',
        description: 'Please select both an agent and platform.',
        variant: 'destructive',
      });
      return;
    }

    // Validate required credentials
    if (selectedConfig?.fields) {
      for (const field of selectedConfig.fields) {
        if (field.required && !credentials[field.name]) {
          toast({
            title: 'Missing Credentials',
            description: `Please provide ${field.label}.`,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    setIsDeploying(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No active session');
      }

      // Use Supabase user ID directly (no clerk_id needed)
      const userId = session.user.id;
      
      // Get or create user in users table if needed
      const { data: existingUser, error: userLookupError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (userLookupError && userLookupError.code === 'PGRST116') {
        // User doesn't exist, create them
        const { error: userCreateError } = await supabase
          .from('users')
          .insert({
            user_id: userId,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || ''
          });
        
        if (userCreateError) {
          console.error('Error creating user:', userCreateError);
          throw new Error('Failed to create user profile');
        }
      } else if (userLookupError) {
        console.error('Error looking up user:', userLookupError);
        throw new Error('Failed to verify user profile');
      }

      // Get workflow details for agent name
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('name, config')
        .eq('workflow_id', selectedWorkflow)
        .single();

      if (workflowError) {
        console.error('Workflow fetch error:', workflowError);
        throw new Error(`Could not find workflow: ${workflowError.message}`);
      }

      const agentName = workflowData?.name || workflowData?.config?.name || 'Unnamed Agent';

      // First create the agent
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .insert({
          workflow_id: selectedWorkflow,
          name: `${agentName} - ${selectedPlatform}`,
          description: `Agent deployed on ${selectedPlatform}`,
          config: {
            platform: selectedPlatform,
            credentials: selectedConfig?.fields.length ? credentials : null,
            status: 'active'
          }
        })
        .select()
        .single();

      if (agentError) {
        console.error('Agent creation error:', agentError);
        console.error('Full agent error details:', JSON.stringify(agentError, null, 2));
        throw agentError;
      }

      // Import and use enhanced deployment generator
      const { deploymentGenerator } = await import('@/lib/deployment-generator');
      
      // Generate comprehensive deployment configuration
      const deploymentConfig = {
        platform: selectedPlatform,
        agentId: agentData.agent_id,
        agentName: agentName,
        credentials,
        deploymentId: undefined // Will be generated
      };
      
      const result = deploymentGenerator.generateDeployment(deploymentConfig);

      // Then create the deployment (this triggers the trial subscription)
      const { data: deploymentData, error: deploymentError } = await supabase
        .from('deployments')
        .insert({
          agent_id: agentData.agent_id,
          environment: 'prod',
          status: 'active',
          url: result.webhook_url || result.embed_code
        })
        .select()
        .single();

      if (deploymentError) throw deploymentError;
      
      // Update result with actual deployment ID by regenerating with real ID
      const finalConfig = {
        platform: selectedPlatform,
        agentId: agentData.agent_id,
        agentName: agentName,
        credentials,
        deploymentId: deploymentData.deployment_id // Use actual deployment ID
      };
      
      const finalResult = deploymentGenerator.generateDeployment(finalConfig);
      
      // Merge the final result with any other data
      Object.assign(result, finalResult);
      
      // Debug logging to help troubleshoot
      console.log('Final deployment result:', result);
      console.log('Has embed_code:', !!result.embed_code);
      console.log('Has integration_code:', !!result.integration_code);
      console.log('Has setup_instructions:', !!result.setup_instructions);

      setDeploymentResult(result);
      
      toast({
        title: 'Deployment Successful!',
        description: `Your agent has been deployed to ${selectedPlatform}.`,
      });

      onSuccess();

    } catch (error: any) {
      console.error('Deployment error:', error);
      console.error('Full deployment error details:', JSON.stringify(error, null, 2));
      console.error('Error properties:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      let errorMessage = 'An unexpected error occurred during deployment.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        errorMessage = `Database error (${error.code}): ${error.details || 'Check console for details'}`;
      }
      
      toast({
        title: 'Deployment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard.',
    });
  };

  const resetDialog = () => {
    setSelectedWorkflow('');
    setSelectedPlatform('');
    setCredentials({});
    setDeploymentResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Deploy Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deploy Agent to Any Platform</DialogTitle>
          <DialogDescription>
            Choose your agent and platform, then preview the integration code and setup instructions before deployment.
          </DialogDescription>
        </DialogHeader>

        {!deploymentResult ? (
          <Tabs defaultValue="select" className="space-y-4">
            <TabsList>
              <TabsTrigger value="select">1. Choose Agent & Platform</TabsTrigger>
              <TabsTrigger value="configure" disabled={!selectedWorkflow || !selectedPlatform}>2. Preview Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workflow">Select Agent to Deploy</Label>
                  <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                    <SelectTrigger>
                      <SelectValue placeholder={workflows.length === 0 ? "No agents available - create one first" : "Choose an agent..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          <div className="mb-2">No agents available</div>
                          <div className="text-xs">Create an agent first to deploy it</div>
                        </div>
                      ) : (
                        workflows.map((workflow) => (
                          <SelectItem key={workflow.workflow_id} value={workflow.workflow_id}>
                            {workflow.name || workflow.spec?.name || 'Unnamed Workflow'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {workflows.length === 0 && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>No agents to deploy</strong>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        You need to create an agent before you can deploy it to any platform.
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/agents/editor/new">
                          Create Your First Agent
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Select Deployment Platform</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {Object.entries(platformConfigs).map(([platform, config]) => {
                      const Icon = config.icon;
                      const isSelected = selectedPlatform === platform;
                      
                      return (
                        <Card 
                          key={platform}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedPlatform(platform)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-md ${config.color} text-white`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-sm">{platform}</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configure" className="space-y-4">
              {selectedConfig && selectedWorkflowData && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <selectedConfig.icon className="h-5 w-5" />
                        {selectedPlatform} Integration
                      </CardTitle>
                      <CardDescription>
                        Here's how to integrate your "{selectedWorkflowData.config?.name || selectedWorkflowData.name || 'Agent'}" with {selectedPlatform}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Credentials Section */}
                      {selectedConfig.fields.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Required Credentials</h4>
                          {selectedConfig.fields.map((field) => (
                            <div key={field.name}>
                              <Label htmlFor={field.name}>
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              <Input
                                id={field.name}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={credentials[field.name] || ''}
                                onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Integration Preview Section */}
                      {getIntegrationPreview()}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Deployment Successful!</h3>
              <p className="text-muted-foreground">Your agent is now live on {selectedPlatform}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Integration Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deploymentResult.embed_code && (
                  <div>
                    <Label>Website Widget Embed Code</Label>
                    <div className="relative mt-1">
                      <Textarea 
                        value={deploymentResult.embed_code} 
                        readOnly 
                        rows={12}
                        className="font-mono text-xs pr-10"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(deploymentResult.embed_code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Copy and paste this complete widget code into your website HTML to embed the chat interface.
                    </p>
                  </div>
                )}

                {deploymentResult.integration_code && (
                  <div>
                    <Label>Integration Examples</Label>
                    <div className="relative mt-1">
                      <Textarea 
                        value={deploymentResult.integration_code} 
                        readOnly 
                        rows={15}
                        className="font-mono text-xs pr-10"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(deploymentResult.integration_code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Multiple integration examples for different frameworks (React, Vue, WordPress).
                    </p>
                  </div>
                )}

                {deploymentResult.webhook_url && (
                  <div>
                    <Label>Webhook URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={deploymentResult.webhook_url} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(deploymentResult.webhook_url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {deploymentResult.setup_instructions && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Setup Instructions</h4>
                    <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
                      {deploymentResult.setup_instructions}
                    </div>
                  </div>
                )}

                {deploymentResult.testing_guide && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Testing Guide</h4>
                    <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                      {deploymentResult.testing_guide}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Agent is active and ready to receive requests
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {!deploymentResult ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeploy}
                disabled={!selectedWorkflow || !selectedPlatform || isDeploying}
              >
                {isDeploying ? 'Deploying...' : 'Deploy Agent'}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setOpen(false)}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
