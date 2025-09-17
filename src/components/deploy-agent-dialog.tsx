
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Rocket } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Workflow } from '@/types/agent';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { DeploymentDetailDialog } from './deployment-detail-dialog';

interface DeployAgentDialogProps {
  platform: string;
  workflows: Workflow[];
  onSuccess: () => void;
}

export function DeployAgentDialog({ platform, workflows, onSuccess }: DeployAgentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [newlyDeployed, setNewlyDeployed] = useState<any>(null);
  const { toast } = useToast();

  const handleDeploy = async () => {
    if (!selectedWorkflowId) {
      toast({
        title: 'Workflow required',
        description: 'Please select an agent (workflow) to deploy.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const workflow = workflows.find(w => w.workflow_id === selectedWorkflowId);
    if (!workflow) {
        toast({ title: 'Error', description: 'Selected workflow not found.', variant: 'destructive'});
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/workflows/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWorkflowId,
          platform: platform,
          name: workflow.spec.name || 'Unnamed Agent',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to deploy to ${platform}.`);
      }

      toast({
        title: 'Deployment Successful!',
        description: `${workflow.spec.name} is now active on ${platform}.`,
      });
      
      // We need to construct a deployment-like object to show the detail dialog
      setNewlyDeployed({
          deployment_id: result.deploymentId,
          agent_id: result.agentId,
          webhook_url: result.webhookUrl,
          deployed_at: new Date().toISOString(),
          agent: {
              platform: platform,
              workflow: {
                  spec: {
                      name: workflow.spec.name,
                  }
              }
          }
      });

      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      console.error('Deployment error:', error);
      toast({
        title: 'Deployment Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPlatformSpecificFields = () => {
      return (
          <p className="text-sm text-muted-foreground">This agent will be deployed to the {platform} channel.</p>
      )
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          Connect
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy to {platform}</DialogTitle>
          <DialogDescription>
            Select an agent to connect to this platform. This will create a new deployment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-select">Select Agent (Workflow)</Label>
            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
              <SelectTrigger id="workflow-select">
                <SelectValue placeholder="Choose an agent to deploy..." />
              </SelectTrigger>
              <SelectContent>
                {workflows.length > 0 ? (
                    workflows.map(wf => (
                        <SelectItem key={wf.workflow_id} value={wf.workflow_id}>
                            {wf.spec?.name || `Untitled (${wf.workflow_id.substring(0, 8)})`}
                        </SelectItem>
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        You have no agents to deploy. <a href="/agents/editor/new" className="text-primary underline">Create one first</a>.
                    </div>
                )}
              </SelectContent>
            </Select>
          </div>
          {getPlatformSpecificFields()}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleDeploy} disabled={isLoading || !selectedWorkflowId}>
            {isLoading ? (
              <>
                <Loader variant="inline" size="xs" className="mr-2" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    {newlyDeployed && (
        <DeploymentDetailDialog
            deployment={newlyDeployed}
            isOpen={!!newlyDeployed}
            onClose={() => setNewlyDeployed(null)}
        />
    )}
    </>
  );
}
