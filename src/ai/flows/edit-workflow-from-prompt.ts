
'use server';
/**
 * @fileOverview A Genkit flow that edits a workflow specification based on a natural language prompt.
 *
 * - editWorkflowFromPrompt - A function that takes a workflow, a user's prompt, and modifies the workflow.
 * - EditWorkflowFromPromptInput - The input type for the flow.
 * - EditWorkflowFromPromptOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { llamaClient } from '@/ai/openrouter-client';
import { z } from 'genkit';

// Re-define schemas to be self-contained in this file.
const WorkflowStepSchema = z.object({
  label: z.string().describe('A short, user-friendly label for this step (e.g., "Classify Email Intent").'),
  description: z.string().describe('A brief explanation of what this step does.'),
});

const WorkflowTriggerSchema = z.object({
  label: z.string().describe('A short, user-friendly label for the trigger (e.g., "On New Email").'),
  description: z.string().describe('A brief explanation of what starts the workflow.'),
});

const WorkflowSpecSchema = z.object({
  name: z.string().describe("A concise and descriptive name for the entire workflow (e.g., 'Customer Support Email Triage')."),
  description: z.string().describe('A one-sentence summary of the workflow purpose.'),
  trigger: WorkflowTriggerSchema.describe('The event that initiates the workflow.'),
  steps: z.array(WorkflowStepSchema).describe('The sequence of steps to be executed in the workflow.'),
});

// Define the input schema for the editing flow.
const EditWorkflowFromPromptInputSchema = z.object({
  prompt: z.string().describe('The natural language instruction for how to modify the workflow.'),
  currentWorkflow: WorkflowSpecSchema.describe('The JSON representation of the workflow to be edited.'),
  userId: z.string().describe("The user's unique ID."),
  workflowId: z.string().describe("The ID of the workflow being edited."),
});
export type EditWorkflowFromPromptInput = z.infer<typeof EditWorkflowFromPromptInputSchema>;

// The output is the newly modified workflow specification.
export type EditWorkflowFromPromptOutput = z.infer<typeof WorkflowSpecSchema>;


/**
 * Main exported function that edits a workflow and saves it to the database.
 * @param input The user's prompt, the current workflow, user ID, and workflow ID.
 * @returns The modified workflow specification.
 */
export async function editWorkflowFromPrompt(input: EditWorkflowFromPromptInput): Promise<EditWorkflowFromPromptOutput> {
  const updatedSpec = await editWorkflowSpecFlow(input);
  
  // In a real implementation, you would save the updatedSpec to Supabase here,
  // updating the record with the matching workflowId.

  return updatedSpec;
}

// Define the internal flow that performs the edit.
const editWorkflowSpecFlow = ai.defineFlow(
  {
    name: 'editWorkflowSpecFlow',
    inputSchema: EditWorkflowFromPromptInputSchema,
    outputSchema: WorkflowSpecSchema,
  },
  async (input) => {
    const systemPrompt = `You are an expert in modifying automated business workflows. A user will provide their current workflow as a JSON object and an instruction on how to change it. Your task is to apply the change and return the new, complete workflow as a JSON object.

IMPORTANT: Your output MUST be the full, modified JSON object for the entire workflow. Do not output only the changed parts or any other text.`;
    
    const userPrompt = `Current Workflow:
\`\`\`json
${JSON.stringify(input.currentWorkflow, null, 2)}
\`\`\`

User's Edit Instruction: "${input.prompt}"

Now, generate the new, complete JSON for the modified workflow.`;

    try {
        const responseText = await llamaClient.generateCompletion({
            model: 'meta-llama/Llama-3.3-8B-Instruct:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 2048,
            temperature: 0.5
        });

        if (!responseText) {
            throw new Error('The AI failed to generate an updated workflow specification.');
        }

        console.log('Raw AI response for edit:', responseText);
        
        let cleanText = responseText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsedOutput = JSON.parse(cleanText);
        return parsedOutput;

    } catch (error: any) {
      console.error('Error in editWorkflowSpecFlow:', error);
      throw new Error(`Workflow editing failed: ${error.message}`);
    }
  }
);
