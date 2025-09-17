
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Bot, Play } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkflowViewer } from '@/components/workflow-viewer';
import { DeployAgentController } from '@/components/workflow-to-agent-converter';
import { templates } from '@/data/agent-templates';
import { useEffect, useState } from 'react';
import { Agent, AgentTemplate } from '@/types/agent';
import { Loader } from '@/components/ui/loader';

function AgentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  
  const [agent, setAgent] = useState<AgentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundAgent = templates.find(t => t.templateId === slug);
    if (foundAgent) {
        setAgent(foundAgent);
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
        <div className="flex flex-col h-full items-center justify-center">
            <Loader />
        </div>
    )
  }

  if (!agent) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Agent Not Found</CardTitle>
                    <CardDescription>The agent you are looking for does not exist.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/agents">Explore Other Agents</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">{agent.spec.name}</h1>
                <p className="text-muted-foreground mt-1">{agent.spec.description}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href={`/agents/editor/new`}>
                        Use this Agent
                    </Link>
                </Button>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Workflow</CardTitle>
                    <CardDescription>This is the sequence of steps the agent will follow.</CardDescription>
                </CardHeader>
                <CardContent className="h-[500px]">
                    <WorkflowViewer spec={agent.spec} />
                </CardContent>
            </Card>
          </div>
          <div>
            <DeployAgentController 
              workflowId={agent.templateId!} 
              workflowName={agent.spec.name} 
              onSuccess={(deploymentId) => {
                router.push(`/deployments?highlight=${deploymentId}`);
              }}
            />
          </div>
        </div>
    </div>
  );
}

export default AgentDetailPage;
