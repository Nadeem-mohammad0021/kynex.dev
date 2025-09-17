"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, 
  CheckCircle, 
  Code, 
  Webhook, 
  Settings, 
  TestTube, 
  ExternalLink,
  Download,
  MessageSquare,
  Globe,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DeploymentResult } from '@/lib/deployment-generator';

interface DeploymentResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: string;
  agentName: string;
  result: DeploymentResult;
  onClose: () => void;
}

export function DeploymentResultsDialog({
  open,
  onOpenChange,
  platform,
  agentName,
  result,
  onClose
}: DeploymentResultsDialogProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(label));
      
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard.`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(label);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy to clipboard. Please select and copy manually.',
        variant: 'destructive',
      });
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded',
      description: `${filename} downloaded successfully.`,
    });
  };

  const CodeBlock = ({ code, language, title, filename }: { 
    code: string; 
    language: string; 
    title: string; 
    filename?: string;
  }) => (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <CardTitle className="text-sm">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">{language}</Badge>
          </div>
          <div className="flex gap-1">
            {filename && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadAsFile(code, filename)}
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(code, title)}
            >
              {copiedItems.has(title) ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32 w-full rounded border bg-muted p-3">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const InstructionStep = ({ number, title, children }: { 
    number: number; 
    title: string; 
    children: React.ReactNode;
  }) => (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-medium mb-1">{title}</h4>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Deployment Successful!
          </DialogTitle>
          <DialogDescription>
            Your agent "{agentName}" has been deployed to {platform}. 
            Follow the instructions below to complete the integration.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <div className="mt-4 h-[60vh]">
            <TabsContent value="overview" className="h-full overflow-y-auto">
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <Zap className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    🎉 Your agent is now deployed and ready to use! The deployment has been configured 
                    automatically and your subscription timer has started.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  {result.webhook_url && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Webhook className="h-4 w-4" />
                          Webhook URL
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-muted p-2 rounded truncate">
                            {result.webhook_url}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.webhook_url!, 'Webhook URL')}
                          >
                            {copiedItems.has('Webhook URL') ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.api_endpoint && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          API Endpoint
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-muted p-2 rounded truncate">
                            {result.api_endpoint}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.api_endpoint!, 'API Endpoint')}
                          >
                            {copiedItems.has('API Endpoint') ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {result.platform_specific_config && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Platform Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 text-xs">
                        {Object.entries(result.platform_specific_config).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-1">
                            <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                            <code className="bg-muted px-2 py-1 rounded">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </code>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="setup" className="h-full overflow-y-auto">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Setup Instructions
                    </CardTitle>
                    <CardDescription>
                      Follow these steps to complete your {platform} integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-line text-sm">
                        {result.setup_instructions}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {result.webhook_verification && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Webhook className="h-4 w-4" />
                        Webhook Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32 w-full rounded border bg-muted p-3">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          <code>{result.webhook_verification}</code>
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="code" className="h-full overflow-y-auto">
              <div className="space-y-4">
                {result.embed_code && (
                  <CodeBlock
                    code={result.embed_code}
                    language="html"
                    title="Website Embed Code"
                    filename={`${agentName}-widget.html`}
                  />
                )}

                {result.integration_code && (
                  <CodeBlock
                    code={result.integration_code}
                    language={platform.includes('WhatsApp') ? 'javascript' : 
                             platform.includes('Telegram') ? 'javascript' :
                             platform.includes('Twitter') ? 'javascript' :
                             platform.includes('Instagram') ? 'javascript' :
                             'javascript'}
                    title={`${platform} Integration Code`}
                    filename={`${agentName}-${platform.toLowerCase().replace(/\s+/g, '-')}-integration.js`}
                  />
                )}

                {platform === 'API Webhook' && result.integration_code && (
                  <>
                    <CodeBlock
                      code={result.integration_code.split('// Python Example')[1]?.split('// cURL Example')[0] || ''}
                      language="python"
                      title="Python Integration Example"
                      filename={`${agentName}-python-client.py`}
                    />
                    <CodeBlock
                      code={result.integration_code.split('// cURL Example')[1] || ''}
                      language="bash"
                      title="cURL Example"
                      filename={`${agentName}-curl-example.sh`}
                    />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="testing" className="h-full overflow-y-auto">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Testing Guide
                    </CardTitle>
                    <CardDescription>
                      How to test and verify your {platform} integration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-line text-sm">
                        {result.testing_guide || 'Testing guide not available for this platform.'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Test</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <InstructionStep number={1} title="Send Test Message">
                        Use the integration above to send a test message to your agent
                      </InstructionStep>
                      <InstructionStep number={2} title="Verify Response">
                        Check that the agent responds according to its configuration
                      </InstructionStep>
                      <InstructionStep number={3} title="Monitor Logs">
                        Check your deployment dashboard for conversation logs and metrics
                      </InstructionStep>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            Need help? Check our documentation
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/docs/deployments" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Docs
              </a>
            </Button>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
