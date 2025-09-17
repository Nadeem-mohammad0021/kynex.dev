
// Workflow execution engine for testing agents

import { llamaClient, mistralClient } from './openrouter-client';
import type { WorkflowSpec } from '@/types/agent';

export interface TestMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  step?: string;
  stepIndex?: number;
}

export interface WorkflowExecutionResult {
  response: string;
  step: {
    label: string;
    description: string;
  };
  stepIndex: number;
  executionTime: number;
}

export class WorkflowExecutor {
  private workflowSpec: WorkflowSpec;

  constructor(workflowSpec: WorkflowSpec) {
    this.workflowSpec = workflowSpec;
  }

  async executeWorkflow(userMessage: string, userName?: string): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    
    try {
      // For testing, we'll execute the first step that seems most relevant
      // In a real implementation, this would be more sophisticated workflow routing
      const relevantStep = this.findRelevantStep(userMessage);
      const response = await this.executeStep(relevantStep, userMessage, userName);
      
      const executionTime = Date.now() - startTime;
      
      return {
        response,
        step: relevantStep.step,
        stepIndex: relevantStep.index,
        executionTime
      };
      
    } catch (error: any) {
      console.error('Workflow execution error:', error);
      return {
        response: `I apologize, but I encountered an error while processing your request: ${error.message}`,
        step: this.workflowSpec.steps[0] || { label: 'Error', description: 'Error handling' },
        stepIndex: 0,
        executionTime: Date.now() - startTime
      };
    }
  }

  private findRelevantStep(userMessage: string): { step: { label: string; description: string }; index: number } {
    const message = userMessage.toLowerCase();
    
    // Simple keyword matching to determine which step to execute
    // This is a simplified version - real implementation would be more sophisticated
    
    for (let i = 0; i < this.workflowSpec.steps.length; i++) {
      const step = this.workflowSpec.steps[i];
      const stepDescription = step.description.toLowerCase();
      const stepLabel = step.label.toLowerCase();
      
      // Check if user message relates to this step
      if (
        stepDescription.includes('analyze') && (message.includes('help') || message.includes('question') || message.includes('problem')) ||
        stepDescription.includes('support') && (message.includes('support') || message.includes('help') || message.includes('assistance')) ||
        stepDescription.includes('route') && (message.includes('transfer') || message.includes('escalate') || message.includes('human')) ||
        stepDescription.includes('guide') && (message.includes('how') || message.includes('show') || message.includes('guide')) ||
        stepLabel.includes('analyze') && (message.includes('help') || message.includes('question'))
      ) {
        return { step, index: i };
      }
    }
    
    // Default to first step if no specific match
    return { step: this.workflowSpec.steps[0], index: 0 };
  }

  private async executeStep(stepInfo: { step: { label: string; description: string }; index: number }, userMessage: string, userName?: string): Promise<string> {
    const { step } = stepInfo;
    
    // Create a context-aware prompt based on the workflow and step
    const systemPrompt = `You are an AI agent executing the "${this.workflowSpec.name}" workflow.
Your goal is to be helpful, concise, and professional.

You are speaking with a user named ${userName || 'User'}. Please address them by their name when appropriate.

Workflow Description: ${this.workflowSpec.description}

Current Step: ${step.label}
Step Description: ${step.description}

Guidelines:
- Respond as if you are performing this specific workflow step.
- If the user's message doesn't relate to this step, gently guide them to relevant information.
- Maintain the context of being a ${this.workflowSpec.name.toLowerCase()}.

User Message: "${userMessage}"

Provide a helpful response now, remembering to be personable and use the user's name.`;

    try {
      // Use Mistral for runtime execution (classification/transforms)
      console.log('Attempting to execute step with Mistral...');
      const response = await mistralClient.generateCompletion({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 512
      });

      return response.trim();
      
    } catch (error: any) {
      console.error('Mistral client failed:', error.message, 'Falling back to Llama.');
      
      // Fallback to Llama if Mistral fails
      try {
        console.log('Attempting to execute step with Llama fallback...');
        const fallbackResponse = await llamaClient.generateCompletion({
          model: 'meta-llama/Llama-3.3-8B-Instruct:free',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 512
        });

        return fallbackResponse.trim();
        
      } catch (fallbackError: any) {
        console.error('Llama client fallback also failed:', fallbackError.message);
        throw new Error(`Both AI models failed: ${fallbackError.message}`);
      }
    }
  }

  getWorkflowInfo(): WorkflowSpec {
    return this.workflowSpec;
  }

  getStepByIndex(index: number): { label: string; description: string } | null {
    return this.workflowSpec.steps[index] || null;
  }

  getAllSteps(): { label: string; description: string }[] {
    return this.workflowSpec.steps;
  }
}
