
'use server';
/**
 * @fileOverview Generates a detailed AI agent behavior (system prompt) from a short description.
 *
 * - generateAgentBehavior - A function that generates a system prompt for an AI agent.
 * - GenerateAgentBehaviorInput - The input type for the generateAgentBehavior function.
 * - GenerateAgentBehaviorOutput - The return type for the generateAgentBehavior function.
 */

import { ai } from '@/ai/genkit';
import { llamaClient } from '@/ai/openrouter-client';
import { z } from 'genkit';

const GenerateAgentBehaviorInputSchema = z.object({
  description: z.string().describe('A short description of the desired agent behavior.'),
});
export type GenerateAgentBehaviorInput = z.infer<typeof GenerateAgentBehaviorInputSchema>;

export type GenerateAgentBehaviorOutput = string;

export async function generateAgentBehavior(input: GenerateAgentBehaviorInput): Promise<GenerateAgentBehaviorOutput> {
  return generateAgentBehaviorFlow(input);
}

const promptTemplate = `SYSTEM: You are an expert at creating detailed system prompts for AI agents. Based on the user's brief description, generate a comprehensive and effective system prompt that defines the agent's persona, capabilities, and constraints. Output only the generated prompt text, without any additional explanation or formatting.

USER: {{description}}`;


const generateAgentBehaviorFlow = ai.defineFlow(
  {
    name: 'generateAgentBehaviorFlow',
    inputSchema: GenerateAgentBehaviorInputSchema,
    outputSchema: z.string(),
  },
  async ({ description }) => {
    try {
        console.log('Generating agent behavior for description:', description);
        
        // Use direct OpenRouter client to bypass Genkit model issues
        const output = await llamaClient.generateAgentBehavior(description);
        
        if (!output) {
            throw new Error("AI failed to generate a behavior prompt. The model returned no output.");
        }

        console.log('Raw AI response for agent behavior:', output);

        // The model might return the string wrapped in quotes or markdown. Clean it up.
        let cleanOutput = output.trim();
        
        // Remove markdown formatting if present
        if (cleanOutput.startsWith('```')) {
            cleanOutput = cleanOutput.replace(/```[\s\S]*?\n/, '').replace(/\n```$/, '');
        }
        
        // If it starts and ends with a quote, remove them.
        if (cleanOutput.startsWith('"') && cleanOutput.endsWith('"')) {
            cleanOutput = cleanOutput.substring(1, cleanOutput.length - 1);
        }
        
        // Unescape any escaped characters from JSON stringification.
        cleanOutput = cleanOutput.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        
        if (!cleanOutput) {
            throw new Error("AI generated an empty or invalid behavior prompt.");
        }

        console.log('Cleaned agent behavior:', cleanOutput);
        return cleanOutput;
    } catch (error: any) {
        console.error("Error in generateAgentBehaviorFlow: ", error);
        // Pass a more specific error message to the client.
        const specificError = error.message || 'An unknown error occurred during generation.';
        throw new Error(`Could not generate agent behavior: ${specificError}`);
    }
  }
);
