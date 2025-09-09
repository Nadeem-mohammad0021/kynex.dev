
import { openAI } from 'genkitx-openai';
import { genkit } from 'genkit';

// Configure single OpenAI plugin for OpenRouter (using Llama key as primary)
const openAIPlugin = openAI({
    apiKey: process.env.LLAMA_3_3_8B_INSTRUCT_FREE_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

// Primary OpenRouter instance
export const openrouter = genkit({
    plugins: [openAIPlugin],
});

// For now, use same instance for both (can be separated later)
export const openrouterMistral = openrouter;

// Model configurations
export const MODELS = {
    AGENT_BUILDER: 'meta-llama/Llama-3.3-8B-Instruct:free',
    AGENT_RUNTIME: 'mistralai/mistral-7b-instruct:free',
};

// Model references using raw model names for OpenRouter
export const llamaModel = 'meta-llama/Llama-3.3-8B-Instruct:free';
export const mistralModel = 'mistralai/mistral-7b-instruct:free';
