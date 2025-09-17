
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Code, Copy, Webhook, MessageCircle, Send } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Deployment {
    deployment_id: string;
    agent_id: string;
    webhook_url: string | null;
    deployed_at: string;
    agent: {
        platform?: string;
        workflow?: {
            config?: {
                name?: string;
            };
            spec?: {
                name?: string;
            };
        }
    }
}

interface DeploymentDetailDialogProps {
    deployment: Deployment;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    // Legacy props for backward compatibility
    isOpen?: boolean;
    onClose?: () => void;
}

export function DeploymentDetailDialog({ 
  deployment, 
  children, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange,
  // Legacy props
  isOpen: legacyIsOpen, 
  onClose: legacyOnClose 
}: DeploymentDetailDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { toast } = useToast();

  // Prioritize new props over legacy props
  const isOpen = externalOpen !== undefined ? externalOpen : (legacyIsOpen ?? internalOpen);
  const setIsOpen = externalOnOpenChange || (legacyOnClose ? (open: boolean) => !open && legacyOnClose() : setInternalOpen);
  
  // Add safety checks for deployment data
  if (!deployment || !deployment.agent) {
    return null;
  }
  
  const { agent, webhook_url, agent_id, deployment_id } = deployment;
  const platform = agent?.platform || 'Unknown Platform';
  const agentName = agent?.workflow?.config?.name || agent?.workflow?.spec?.name || 'Unnamed Agent';
  
  // Debug logging for development (remove in production)
  console.log('DeploymentDetailDialog - Platform:', platform, 'Deployment ID:', deployment_id);
  

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({
        title: "Copied to Clipboard!",
    });
  }

  const getWebsiteWidgetDetails = () => {
    // Use window.location for client-side URL detection, with fallback to kynex.dev
    const baseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}` 
      : 'https://kynex.dev';
    const localUrl = 'http://localhost:9002';
    const widgetUrl = `${baseUrl}/api/webhook/widget/${deployment_id}`;
    const widgetUrlLocal = `${localUrl}/api/webhook/widget/${deployment_id}`;
    
    // Professional embed code for website widgets
    const embedCode = `<!-- KYNEX AI Agent Widget -->
<div id="kynex-agent-${deployment_id}"></div>
<script>
  (function() {
    // Create widget container and styles
    const container = document.getElementById('kynex-agent-${deployment_id}');
    if (!container) return;
    
    // Basic styling
    const style = document.createElement('style');
    style.textContent = \`
      .kynex-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 400px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .kynex-header {
        padding: 12px 16px;
        background: #0891b2;
        color: white;
        font-weight: 600;
        border-radius: 8px 8px 0 0;
      }
      .kynex-chat {
        height: 300px;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .kynex-message {
        padding: 8px 12px;
        border-radius: 8px;
        max-width: 80%;
        word-wrap: break-word;
      }
      .kynex-user { 
        background: #0891b2;
        color: white;
        align-self: flex-end;
      }
      .kynex-agent { 
        background: #f1f5f9;
        color: #334155;
        align-self: flex-start;
      }
      .kynex-input-area {
        display: flex;
        padding: 12px 16px;
        border-top: 1px solid #e2e8f0;
        gap: 8px;
      }
      .kynex-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        outline: none;
      }
      .kynex-button {
        padding: 8px 16px;
        background: #0891b2;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }
      .kynex-button:hover { background: #0e7490; }
      .kynex-button:disabled { background: #9ca3af; cursor: not-allowed; }
    \`;
    document.head.appendChild(style);
    
    // Create widget HTML
    container.innerHTML = \`
      <div class="kynex-widget">
        <div class="kynex-header">${agentName}</div>
        <div class="kynex-chat" id="kynex-chat-${deployment_id}">
          <div class="kynex-message kynex-agent">
            👋 Hi! I'm ${agentName}. How can I help you today?
          </div>
        </div>
        <div class="kynex-input-area">
          <input 
            type="text" 
            class="kynex-input" 
            id="kynex-input-${deployment_id}" 
            placeholder="Type your message..."
            onkeypress="if(event.key==='Enter') sendMessage${deployment_id}()"
          />
          <button class="kynex-button" onclick="sendMessage${deployment_id}()">Send</button>
        </div>
      </div>
    \`;
    
    // Message sending function
    window.sendMessage${deployment_id} = async function() {
      const input = document.getElementById('kynex-input-${deployment_id}');
      const chat = document.getElementById('kynex-chat-${deployment_id}');
      const message = input.value.trim();
      
      if (!message) return;
      
      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'kynex-message kynex-user';
      userMsg.textContent = message;
      chat.appendChild(userMsg);
      
      // Clear input and scroll
      input.value = '';
      chat.scrollTop = chat.scrollHeight;
      
      // Show typing indicator
      const typing = document.createElement('div');
      typing.className = 'kynex-message kynex-agent';
      typing.innerHTML = '💭 ${agentName} is typing...';
      typing.id = 'typing-indicator';
      chat.appendChild(typing);
      chat.scrollTop = chat.scrollHeight;
      
      try {
        const response = await fetch('${widgetUrl}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            input: message, 
            userId: 'widget-user-' + Date.now(),
            sessionId: 'session-' + Date.now()
          })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) typingEl.remove();
        
        // Add agent response
        const agentMsg = document.createElement('div');
        agentMsg.className = 'kynex-message kynex-agent';
        agentMsg.textContent = data.result || 'Sorry, I had trouble processing that.';
        chat.appendChild(agentMsg);
        
      } catch (error) {
        // Remove typing indicator and show error
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) typingEl.remove();
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'kynex-message kynex-agent';
        errorMsg.textContent = 'Sorry, I\'m having technical difficulties. Please try again.';
        chat.appendChild(errorMsg);
      }
      
      chat.scrollTop = chat.scrollHeight;
    };
  })();
</script>`;
    
    // Also provide the widget endpoint URL
    const apiExample = `// Direct API call example
fetch('${widgetUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: 'Hello!',
    userId: 'unique-user-id',
    sessionId: 'optional-session-id'
  })
})
.then(res => res.json())
.then(data => console.log(data.result));`;

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose how to integrate your AI agent into your website:</p>
            
            <div className="space-y-2">
                <Label htmlFor="widget-url">Production Widget API Endpoint</Label>
                <div className="flex items-center gap-2">
                    <Input id="widget-url" readOnly value={widgetUrl} className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(widgetUrl)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Use this URL for production deployments</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="widget-url-local">Local Development API Endpoint</Label>
                <div className="flex items-center gap-2">
                    <Input id="widget-url-local" readOnly value={widgetUrlLocal} className="font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(widgetUrlLocal)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Use this URL for local testing and development</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="embed-code">Complete Widget Embed Code</Label>
                <div className="relative">
                    <Textarea 
                        id="embed-code" 
                        readOnly 
                        value={embedCode} 
                        className="pr-12 min-h-[300px] font-mono text-xs" 
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleCopy(embedCode)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    This creates a complete chat widget with styling. Just paste it into your HTML.
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="api-example">API Integration Example</Label>
                <div className="relative">
                    <Textarea 
                        id="api-example" 
                        readOnly 
                        value={apiExample} 
                        className="pr-12 min-h-[150px] font-mono text-xs" 
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleCopy(apiExample)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    For custom integrations, use this API endpoint directly.
                </p>
        </div>
      </div>
    );
  };

  const getIntegrationDetails = () => {
    // Normalize platform name for matching
    const normalizedPlatform = platform?.toLowerCase().trim();
    
    // Check for Website Widget variations (handles case variations and partial matches)
    if (normalizedPlatform?.includes('website') || normalizedPlatform?.includes('widget')) {
      console.log('DeploymentDetailDialog - Using Website Widget integration');
      return getWebsiteWidgetDetails();
    }
    
    switch (platform) {
      case 'API Webhook':
        // Use window.location for client-side URL detection, with fallback to kynex.dev
        const prodBaseUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
          ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}` 
          : 'https://kynex.dev';
        const localBaseUrl = 'http://localhost:9002';
        
        const webhookUrl = `${prodBaseUrl}/api/webhook/generic/${deployment_id}`;
        const directApiUrl = `${prodBaseUrl}/api/agents/${deployment_id}/message`;
        
        const webhookUrlLocal = `${localBaseUrl}/api/webhook/generic/${deployment_id}`;
        const directApiUrlLocal = `${localBaseUrl}/api/agents/${deployment_id}/message`;
        
        const curlExample = `curl -X POST '${webhookUrl}' \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: optional-your-api-key" \\
  -d '{
    "message": "Hello! Can you help me?",
    "userId": "user123",
    "metadata": {
      "source": "my-app",
      "version": "1.0"
    }
  }'`;
        
        const jsExample = `// JavaScript/Node.js example
const response = await fetch('${webhookUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'optional-your-api-key'
  },
  body: JSON.stringify({
    message: 'Hello! Can you help me?',
    userId: 'user123',
    metadata: {
      source: 'my-app',
      version: '1.0'
    }
  })
});

const data = await response.json();
console.log('Agent reply:', data.result);`;
        
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Use these endpoints to send messages to your AI agent programmatically:</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">🌐 Production URLs (kynex.dev)</h4>
                
                <div className="space-y-2">
                    <Label htmlFor="webhook-url">Generic Webhook URL</Label>
                    <div className="flex items-center gap-2">
                        <Input id="webhook-url" readOnly value={webhookUrl} className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(webhookUrl)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="direct-api-url">Direct API Endpoint</Label>
                    <div className="flex items-center gap-2">
                        <Input id="direct-api-url" readOnly value={directApiUrl} className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(directApiUrl)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-sm">🏠 Local Development URLs</h4>
                
                <div className="space-y-2">
                    <Label htmlFor="webhook-url-local">Generic Webhook URL</Label>
                    <div className="flex items-center gap-2">
                        <Input id="webhook-url-local" readOnly value={webhookUrlLocal} className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(webhookUrlLocal)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="direct-api-url-local">Direct API Endpoint</Label>
                    <div className="flex items-center gap-2">
                        <Input id="direct-api-url-local" readOnly value={directApiUrlLocal} className="font-mono text-xs" />
                        <Button variant="outline" size="icon" onClick={() => handleCopy(directApiUrlLocal)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
                <Label>cURL Example</Label>
                 <div className="relative">
                    <Textarea 
                        readOnly 
                        value={curlExample} 
                        className="pr-12 min-h-[120px] font-mono text-xs"
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleCopy(curlExample)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                 </div>
            </div>
            
            <div className="space-y-2">
                <Label>JavaScript Example</Label>
                 <div className="relative">
                    <Textarea 
                        readOnly 
                        value={jsExample} 
                        className="pr-12 min-h-[200px] font-mono text-xs"
                    />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleCopy(jsExample)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                 </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Response Format:</strong> All endpoints return JSON with <code>result</code> containing the AI agent's reply.
              </p>
            </div>
          </div>
        );
        
      case 'Telegram':
        const telegramProdUrl = `${typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
          ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}` 
          : 'https://kynex.dev'}/api/webhook/telegram/${deployment_id}`;
        const telegramLocalUrl = `http://localhost:9002/api/webhook/telegram/${deployment_id}`;
        
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your Telegram bot is deployed and ready to receive messages.</p>
            
            <div className="space-y-2">
              <Label htmlFor="telegram-webhook">Production Webhook URL</Label>
              <div className="flex items-center gap-2">
                <Input id="telegram-webhook" readOnly value={telegramProdUrl} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(telegramProdUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use this for production Telegram bot deployment</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegram-webhook-local">Local Development Webhook URL</Label>
              <div className="flex items-center gap-2">
                <Input id="telegram-webhook-local" readOnly value={telegramLocalUrl} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(telegramLocalUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use this for local testing and development</p>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>🤖 Bot Status:</strong> Your {agentName} is active and responding to messages on Telegram.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Bot Commands</Label>
              <div className="text-sm space-y-1">
                <div><code>/start</code> - Start conversation with the agent</div>
                <div><code>/help</code> - Get help and available commands</div>
                <div><code>/reset</code> - Reset conversation context</div>
              </div>
            </div>
          </div>
        );
        
      case 'WhatsApp':
        const whatsappProdUrl = `${typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
          ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}` 
          : 'https://kynex.dev'}/api/webhook/whatsapp/${deployment_id}`;
        const whatsappLocalUrl = `http://localhost:9002/api/webhook/whatsapp/${deployment_id}`;
        const verifyToken = `kynex_${deployment_id}`;
        
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your WhatsApp Business API integration is configured.</p>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp-webhook">Production Webhook URL</Label>
              <div className="flex items-center gap-2">
                <Input id="whatsapp-webhook" readOnly value={whatsappProdUrl} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(whatsappProdUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use this for production WhatsApp Business API</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp-webhook-local">Local Development Webhook URL</Label>
              <div className="flex items-center gap-2">
                <Input id="whatsapp-webhook-local" readOnly value={whatsappLocalUrl} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(whatsappLocalUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use this for local testing and development</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verify-token">Webhook Verify Token</Label>
              <div className="flex items-center gap-2">
                <Input id="verify-token" readOnly value={verifyToken} className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(verifyToken)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use this token in your WhatsApp Business API webhook configuration</p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>💬 WhatsApp Status:</strong> Your {agentName} is ready to handle WhatsApp Business messages.
              </p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center py-4">Integration details for "{platform}" are not yet available.</p>
            
            {/* Debug information */}
            <div className="p-3 bg-muted rounded-lg text-xs">
              <p><strong>Debug Info:</strong></p>
              <p><strong>Platform:</strong> {platform}</p>
              <p><strong>Deployment ID:</strong> {deployment_id}</p>
              <p><strong>Agent Platform:</strong> {agent?.platform || 'undefined'}</p>
              <p><strong>Available Cases:</strong> API Webhook, Website Widget, Telegram, WhatsApp</p>
            </div>
          </div>
        );
    }
  };

  const getIcon = () => {
    switch (platform) {
      case 'API Webhook': return Webhook;
      case 'Website Widget': return Code;
      case 'Telegram': return Send;
      case 'WhatsApp': return MessageCircle;
      default: return Code;
    }
  };
  
  const Icon = getIcon();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">{platform} Integration</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Use the details below to integrate the "{agentName}" agent.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {getIntegrationDetails()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
