'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AgentTester } from './agent-tester';
import type { WorkflowSpec } from '@/types/agent';
import { Button } from './ui/button';
import { Bot, RefreshCw, Zap, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AgentEditorTestingTabProps {
  agentId: string;
  workflowSpec: WorkflowSpec;
  userName: string;
}

export function AgentEditorTestingTab({ agentId, workflowSpec, userName }: AgentEditorTestingTabProps) {
  const [isTestingEnabled, setIsTestingEnabled] = useState(false);
  const [testingMode, setTestingMode] = useState<'chat' | 'step-by-step'>('chat');

  const enableTesting = () => {
    setIsTestingEnabled(true);
  };

  // Sample step-by-step data for visualization - in a real app this would come from backend
  const workflowVisualizer = () => {
    return (
      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-4">
          {workflowSpec.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                {index + 1}
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{step.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Alert className="mt-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Workflow Testing</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Test your workflow by sending messages to see how your agent will respond at each step.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  if (!isTestingEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-300" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Test Your Agent Workflow</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          This testing interface allows you to interact with your agent workflow as if you were a user.
          See how your workflow steps respond to different inputs.
        </p>
        <Button onClick={enableTesting} className="mt-4">
          <Bot className="mr-2 h-4 w-4" />
          Start Testing
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="chat" className="h-full flex flex-col">
        <div className="px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
          <TabsList className="mb-4">
            <TabsTrigger value="chat" onClick={() => setTestingMode('chat')}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat Testing
            </TabsTrigger>
            <TabsTrigger value="workflow" onClick={() => setTestingMode('step-by-step')}>
              <Zap className="h-4 w-4 mr-2" />
              Workflow Steps
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">
          <TabsContent value="chat" className="h-full m-0 p-4">
            <AgentTester workflowSpec={workflowSpec} userName={userName} />
          </TabsContent>
          
          <TabsContent value="workflow" className="h-full m-0 overflow-auto">
            {workflowVisualizer()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
