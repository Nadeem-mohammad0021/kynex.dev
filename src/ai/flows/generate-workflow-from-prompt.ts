
/**
 * @fileOverview A Genkit flow that generates a workflow specification from a natural language prompt.
 *
 * - generateWorkflowFromPrompt - A function that takes a user's prompt and generates and saves a workflow.
 * - GenerateWorkflowFromPromptInput - The input type for the flow.
 * - GenerateWorkflowFromPromptOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { llamaClient } from '@/ai/openrouter-client';
import { z } from 'genkit';
import { createServerClient } from '@/lib/supabase/server-client';

// Define the schema for a single step in the workflow.
const WorkflowStepSchema = z.object({
  label: z.string().describe('A short, user-friendly label for this step (e.g., "Classify Email Intent").'),
  description: z.string().describe('A brief explanation of what this step does.'),
});

// Define the schema for the workflow trigger.
const WorkflowTriggerSchema = z.object({
  label: z.string().describe('A short, user-friendly label for the trigger (e.g., "On New Email").'),
  description: z.string().describe('A brief explanation of what starts the workflow.'),
});

// Define the overall schema for the generated workflow specification.
// This matches the `config` column in the `workflows` table.
const WorkflowSpecSchema = z.object({
  name: z.string().describe("A concise and descriptive name for the entire workflow (e.g., 'Customer Support Email Triage')."),
  description: z.string().describe('A one-sentence summary of the workflow purpose.'),
  trigger: WorkflowTriggerSchema.describe('The event that initiates the workflow.'),
  steps: z.array(WorkflowStepSchema).describe('The sequence of steps to be executed in the workflow.'),
});

// Define the input schema for the flow.
const GenerateWorkflowFromPromptInputSchema = z.object({
  prompt: z.string().describe('The natural language description of the desired workflow.'),
  userId: z.string().describe("The user's unique ID."),
});
export type GenerateWorkflowFromPromptInput = z.infer<typeof GenerateWorkflowFromPromptInputSchema>;

// Define the output schema for the flow, which includes the generated spec and the new workflow ID.
const GenerateWorkflowFromPromptOutputSchema = z.object({
    workflowId: z.string(),
    spec: WorkflowSpecSchema,
});
export type GenerateWorkflowFromPromptOutput = z.infer<typeof GenerateWorkflowFromPromptOutputSchema>;


/**
 * Main exported function that generates a workflow and saves it to the database.
 * @param input The user's prompt and user ID.
 * @returns The new workflow's ID and its generated specification.
 */
export async function generateWorkflowFromPrompt(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  console.log('Generating workflow for input:', input);
  
  const spec = await generateWorkflowSpecFlow(input);
  
  const supabase = await createServerClient();

  // Use the userId passed from the authenticated API route
  if (!input.userId) {
    throw new Error('User ID is required. Please sign in and try again.');
  }
  
  const authenticatedUserId = input.userId;
  console.log('Processing workflow generation for user:', authenticatedUserId);
  console.log('Attempting to insert workflow with spec:', spec);

  // Insert workflow with the correct schema
  let result = await supabase
    .from('workflows')
    .insert({
      user_id: authenticatedUserId,
      name: spec.name,
      description: spec.description,
      config: spec as any, // Use 'config' instead of 'spec'
    })
    .select('workflow_id')
    .single();
  
  const { data, error } = result;

  if (error) {
    console.error('Supabase insert error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error('Permission denied: User does not have access to create workflows. Please check your authentication status and RLS policies.');
    }
    
    throw new Error(`Failed to save workflow to database: ${error.message}`);
  }

  if (!data || !data.workflow_id) {
      throw new Error('Failed to retrieve workflow_id after insert.');
  }

  // Use workflow_id from the successful insert
  const workflowId = data.workflow_id;
  console.log('Successfully created workflow:', workflowId);

  return {
    workflowId: workflowId,
    spec,
  }
}

// Direct prompt template for workflow generation
const workflowPromptTemplate = `
You are an expert in designing automated business workflows. A user will provide a description of a workflow they want to create. Your task is to break down this description into a structured JSON format with a name, a description, a trigger, and a sequence of logical steps.

The user's prompt is: "{prompt}"

Generate the JSON object for the workflow now. Return ONLY the JSON, no other text.
`;


// Define the internal flow that only generates the specification.
const generateWorkflowSpecFlow = ai.defineFlow(
  {
    name: 'generateWorkflowSpecFlow',
    inputSchema: GenerateWorkflowFromPromptInputSchema,
    outputSchema: WorkflowSpecSchema,
  },
  async (input) => {
    try {
      console.log('Generating workflow for prompt:', input.prompt);
      
      // Use direct OpenRouter client to bypass Genkit model issues
      const responseText = await llamaClient.generateWorkflow(input.prompt);
      
      if (!responseText) {
        throw new Error('The AI failed to generate a workflow specification.');
      }
      
      console.log('Raw AI response:', responseText);
      
      // Try to parse the JSON response
      let parsedOutput;
      try {
        // Clean up the response text (remove any markdown formatting)
        let cleanText = responseText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        parsedOutput = JSON.parse(cleanText);
        console.log('Parsed workflow:', parsedOutput);
      } catch (parseError) {
        console.error('Failed to parse AI response:', responseText);
        throw new Error('The AI response was not valid JSON.');
      }
      
      return parsedOutput;
    } catch (error: any) {
      console.error('Error in generateWorkflowSpecFlow:', error);
      throw new Error(`Workflow generation failed: ${error.message}`);
    }
  }
);
