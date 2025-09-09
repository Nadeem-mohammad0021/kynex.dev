
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Rocket } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { DeploymentDetailDialog } from './deployment-detail-dialog';


interface DeployAgentControllerProps {
  workflowId: string;
  workflowName: string;
  onSuccess?: (deploymentId: string) => void;
}

const platforms = [
  { id: 'website', name: 'Website Widget' },
  { id: 'api', name: 'API Webhook' },
];

export function DeployAgentController({ workflowId, workflowName, onSuccess }: DeployAgentControllerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('');
  const [name, setName] = useState(workflowName || '');
  const [newlyDeployed, setNewlyDeployed] = useState<any>(null);

  const { toast } = useToast();
  const router = useRouter();

  const handleDeploy = async () => {
    if (!platform || !name) {
      toast({
        title: 'Fields required',
        description: 'Please provide an agent name and select a platform.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
       const response = await fetch('/api/workflows/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflowId,
          platform: platform,
          name: name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deploy agent.');
      }
      
      toast({
        title: 'Deployment Successful!',
        description: `Your agent "${name}" has been deployed to ${platform}.`,
      });

      setNewlyDeployed({
          deployment_id: result.deploymentId,
          agent_id: result.agentId,
          webhook_url: result.webhookUrl,
          deployed_at: new Date().toISOString(),
          agent: {
              platform: platform,
              workflow: {
                  spec: {
                      name: name,
                  }
              }
          }
      });
      
      if (onSuccess) {
        onSuccess(result.deploymentId);
      }

    } catch (error: any) {
      console.error('Error initiating deployment:', error);
      toast({
        title: 'Deployment Failed',
        description: error.message || 'An unknown error occurred while trying to start the deployment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Deploy Agent
        </CardTitle>
        <CardDescription>
          Deploy this workflow to a live channel by selecting a platform below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="agent-name">Agent Name</Label>
          <Input
            id="agent-name"
            placeholder="Enter agent name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Deployment Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleDeploy} 
          disabled={isLoading || !platform || !name}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader variant="inline" size="xs" className="mr-2" />
              Deploying...
            </>
          )
          : 'Deploy Agent'}
        </Button>
      </CardFooter>
    </Card>
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
