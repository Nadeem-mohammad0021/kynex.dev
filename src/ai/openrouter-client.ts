
// Direct OpenRouter API client to bypass Genkit model recognition issues

export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }
  
  export interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }
  
  export interface OpenRouterResponse {
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }
  
  export class OpenRouterClient {
    private apiKey: string;
    private baseURL = 'https://openrouter.ai/api/v1';
  
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("OpenRouter API key is missing. Please set it in your environment variables.");
        }
        this.apiKey = apiKey;
    }
  
    async generateCompletion(request: OpenRouterRequest, retries = 2): Promise<string> {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          console.log(`OpenRouter API attempt ${attempt + 1}/${retries + 1} for model:`, request.model);
          
          const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
              'X-Title': 'AI Agent Flow Studio',
            },
            body: JSON.stringify({
              ...request,
              stream: false,
            }),
            // Add timeout of 30 seconds
            signal: AbortSignal.timeout(30000),
          });
  
          if (!response.ok) {
            const errorText = await response.text();
            let apiError;
            try {
                const errorJson = JSON.parse(errorText);
                apiError = new Error(`OpenRouter API error (${response.status}): ${errorJson.error?.message || errorText}`);
            } catch {
                apiError = new Error(`OpenRouter API error (${response.status}): ${errorText}`);
            }
            
            // If it's a timeout (408) or rate limit (429), retry
            if ((response.status === 408 || response.status === 429) && attempt < retries) {
              console.log(`Retrying after ${response.status} error, attempt ${attempt + 1}`);
              await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1))); // Exponential backoff
              continue;
            }
            
            throw apiError;
          }
  
          const data: OpenRouterResponse = await response.json();
          
          if (!data.choices || data.choices.length === 0) {
            throw new Error('No response choices returned from OpenRouter API');
          }
  
          const content = data.choices[0].message.content;
          if (!content) {
            throw new Error('Empty content returned from OpenRouter API');
          }
  
          console.log('✅ OpenRouter API call successful');
          return content;
          
        } catch (error: any) {
          console.error(`OpenRouter API attempt ${attempt + 1} failed:`, error.message);
          
          // If it's a timeout or network error and we have retries left, continue
          if ((error.name === 'AbortError' || error.message.includes('timeout')) && attempt < retries) {
            console.log(`Retrying after timeout, attempt ${attempt + 1}`);
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
            continue;
          }
          
          // If this is the last attempt, throw the error
          if (attempt === retries) {
            throw new Error(`Failed to generate completion after ${retries + 1} attempts: ${error.message}`);
          }
        }
      }
      
      // This should never be reached
      throw new Error('Unexpected error in generateCompletion');
    }
  
    async generateWorkflow(prompt: string): Promise<string> {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: 'You are an expert in designing automated business workflows. Generate structured JSON workflows based on user descriptions. Return ONLY valid JSON, no other text.',
        },
        {
          role: 'user',
          content: `Create a workflow for: ${prompt}\n\nReturn a JSON object with: name, description, trigger (with label and description), and steps array (each with label and description).`,
        },
      ];
  
      return this.generateCompletion({
          model: 'meta-llama/Llama-3.3-8B-Instruct:free',
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        });
    }
  
    async generateAgentBehavior(description: string): Promise<string> {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: 'You are an expert at creating detailed system prompts for AI agents. Generate comprehensive and effective system prompts based on brief descriptions. Output only the generated prompt text, without any additional explanation or formatting.',
        },
        {
          role: 'user',
          content: description,
        },
      ];
  
      return this.generateCompletion({
        model: 'meta-llama/Llama-3.3-8B-Instruct:free',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });
    }
  }
  
  // Export client instances
export const llamaClient = new OpenRouterClient(process.env.OPENROUTER_API_KEY!);
export const mistralClient = new OpenRouterClient(process.env.OPENROUTER_API_KEY!);
  
