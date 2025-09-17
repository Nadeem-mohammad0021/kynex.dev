'use server';

import { WorkflowExecutor, WorkflowExecutionResult } from '@/ai/workflow-executor';
import type { WorkflowSpec } from '@/types/agent';

interface ExecuteWorkflowActionInput {
    workflowSpec: WorkflowSpec;
    userMessage: string;
    userName?: string;
}

type ExecuteWorkflowActionOutput = Partial<WorkflowExecutionResult> & {
    error?: string;
};


export async function executeWorkflowAction(input: ExecuteWorkflowActionInput): Promise<ExecuteWorkflowActionOutput> {
    const { workflowSpec, userMessage, userName } = input;
    
    if (!workflowSpec || !userMessage) {
        return { error: 'Invalid input: workflowSpec and userMessage are required.' };
    }

    try {
        const executor = new WorkflowExecutor(workflowSpec);
        const result = await executor.executeWorkflow(userMessage, userName);
        return result;
    } catch (error: any) {
        console.error('Error executing workflow action:', error);
        return { error: error.message || 'An unknown error occurred during workflow execution.' };
    }
}
