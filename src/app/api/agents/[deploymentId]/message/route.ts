import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';
import { OpenRouterClient } from '@/ai/openrouter-client';

export const runtime = 'edge';

interface MessageRequest {
  message: string;
  userId: string;
  platform?: string;
  chatId?: string;
  metadata?: any;
  timestamp?: string;
}

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Main message processing endpoint
export async function POST(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const body: MessageRequest = await request.json();
    const { message, userId, platform = 'api', chatId, metadata } = body;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get deployment and agent configuration
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select(`
        deployment_id,
        agent_id,
        status,
        agents (
          agent_id,
          name,
          description,
          config,
          workflow_id,
          workflows (
            user_id,
            name,
            config,
            spec
          )
        )
      `)
      .eq('deployment_id', params.deploymentId)
      .eq('status', 'active')
      .single();

    if (deploymentError || !deployment) {
      console.error('Deployment not found or inactive:', deploymentError);
      return NextResponse.json(
        { error: 'Deployment not found or inactive' },
        { status: 404 }
      );
    }

    const agent = deployment.agents;
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent configuration not found' },
        { status: 404 }
      );
    }

    // Log incoming message
    await logMessage(supabase, {
      agentId: agent.agent_id,
      userId,
      message,
      direction: 'inbound',
      platform,
      metadata: { chatId, ...metadata }
    });

    // Get or create conversation context
    const conversationId = `${params.deploymentId}_${userId}_${platform}`;
    const conversationHistory = await getConversationHistory(supabase, conversationId, agent.agent_id);

    // Process message through AI agent
    const aiResponse = await processMessageWithAI(
      message,
      agent,
      conversationHistory,
      platform,
      { userId, chatId }
    );

    if (!aiResponse) {
      throw new Error('Failed to generate AI response');
    }

    // Save conversation messages
    await saveConversationMessages(supabase, conversationId, agent.agent_id, [
      {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant', 
        content: aiResponse,
        timestamp: new Date().toISOString()
      }
    ]);

    // Log outgoing message
    await logMessage(supabase, {
      agentId: agent.agent_id,
      userId,
      message: aiResponse,
      direction: 'outbound',
      platform,
      metadata: { chatId, ...metadata, originalMessage: message }
    });

    return NextResponse.json({
      reply: aiResponse,
      agentName: agent.name || agent.workflows?.name || 'AI Agent',
      platform,
      conversationId,
      timestamp: new Date().toISOString(),
      success: true
    });

  } catch (error: any) {
    console.error('Agent message processing error:', error);
    
    // Return a fallback error response
    return NextResponse.json({
      reply: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      error: true,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function processMessageWithAI(
  message: string,
  agent: any,
  conversationHistory: ConversationMessage[],
  platform: string,
  context: { userId: string; chatId?: string }
): Promise<string> {
  try {
    // Get agent configuration
    const workflow = agent.workflows;
    const agentName = agent.name || workflow?.name || 'AI Assistant';
    const agentDescription = agent.description || workflow?.config?.description || 'A helpful AI assistant';
    
    // Build system prompt from agent configuration
    let systemPrompt = `You are ${agentName}, ${agentDescription}.

Platform Context: You are communicating via ${platform}. Adjust your responses appropriately for this platform.

Key Instructions:
- Be helpful, friendly, and professional
- Keep responses concise and relevant
- Use appropriate formatting for ${platform}
- Maintain consistency with your role as ${agentName}`;

    // Add any specific agent instructions from workflow config
    if (workflow?.config?.instructions) {
      systemPrompt += `\n\nSpecific Instructions:\n${workflow.config.instructions}`;
    }

    if (workflow?.spec?.prompt) {
      systemPrompt += `\n\nAgent Behavior:\n${workflow.spec.prompt}`;
    }

    // Prepare conversation messages for AI model
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      // Include recent conversation history (limit to last 10 messages)
      ...conversationHistory.slice(-10),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Initialize OpenRouter client for AI processing
    const openRouterClient = new OpenRouterClient(process.env.OPENROUTER_API_KEY!);

    // Use appropriate model based on platform and requirements
    const modelName = platform === 'telegram' || platform === 'whatsapp' 
      ? 'mistralai/mistral-7b-instruct:free'  // Fast responses for messaging
      : 'meta-llama/Llama-3.3-8B-Instruct:free'; // More capable for API/web

    const response = await openRouterClient.generateCompletion({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: platform === 'telegram' || platform === 'whatsapp' ? 300 : 600, // Shorter for messaging platforms
    });

    if (!response || typeof response !== 'string') {
      throw new Error('Invalid response from AI model');
    }

    return response.trim();

  } catch (error: any) {
    console.error('AI processing error:', error);
    
    // Provide contextual fallback responses
    const fallbackResponses = {
      telegram: `Hi! I'm ${agent.name || 'your AI assistant'} 🤖. I'm currently experiencing some technical issues, but I'm here to help! Could you please try again?`,
      whatsapp: `Hello! This is ${agent.name || 'your AI assistant'}. I'm having some technical difficulties right now, but I'd love to help you. Please try sending your message again!`,
      instagram: `Hey! ${agent.name || 'Your AI assistant'} here 📸. Having some tech issues at the moment, but I'm working on it! Try again in a bit?`,
      api: `I'm ${agent.name || 'your AI assistant'} and I apologize for the technical difficulty. Please try your request again.`,
      default: `Hello! I'm experiencing some technical issues but I'm here to help. Please try again!`
    };

    return fallbackResponses[platform as keyof typeof fallbackResponses] || fallbackResponses.default;
  }
}

async function getConversationHistory(
  supabase: any,
  conversationId: string,
  agentId: string
): Promise<ConversationMessage[]> {
  try {
    const { data: messages, error } = await supabase
      .from('conversations')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true })
      .limit(20); // Keep recent context

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return messages?.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at
    })) || [];

  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

async function saveConversationMessages(
  supabase: any,
  conversationId: string,
  agentId: string,
  messages: ConversationMessage[]
) {
  try {
    const conversationMessages = messages.map(msg => ({
      conversation_id: conversationId,
      agent_id: agentId,
      role: msg.role,
      content: msg.content,
      created_at: msg.timestamp
    }));

    const { error } = await supabase
      .from('conversations')
      .insert(conversationMessages);

    if (error) {
      console.error('Error saving conversation messages:', error);
    }

  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

async function logMessage(
  supabase: any,
  logData: {
    agentId: string;
    userId: string;
    message: string;
    direction: 'inbound' | 'outbound';
    platform: string;
    metadata?: any;
  }
) {
  try {
    const { error } = await supabase
      .from('logs')
      .insert({
        agent_id: logData.agentId,
        level: 'info',
        message: `${logData.direction === 'inbound' ? 'Received' : 'Sent'} message via ${logData.platform}`,
        metadata: {
          direction: logData.direction,
          platform: logData.platform,
          user_id: logData.userId,
          message_content: logData.message,
          timestamp: new Date().toISOString(),
          ...logData.metadata
        }
      });

    if (error) {
      console.error('Error logging message:', error);
    }

  } catch (error) {
    console.error('Error in message logging:', error);
  }
}
