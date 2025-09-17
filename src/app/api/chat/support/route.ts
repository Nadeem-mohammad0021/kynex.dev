import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterClient } from '@/ai/openrouter-client';

// System prompt for the support chatbot
const SUPPORT_SYSTEM_PROMPT = `You are a helpful AI support assistant for KYNEX.dev, an AI agent development platform. 

KYNEX.dev is a platform where users can:
- Create AI agents using natural language prompts
- Build sophisticated workflows with a visual editor
- Deploy agents to multiple platforms (WhatsApp, Telegram, websites, etc.)
- Monitor and analyze agent performance
- Integrate with external APIs and services

Key features:
- AI-powered workflow generation from simple text descriptions
- Visual workflow builder with drag-and-drop interface
- Multi-platform deployment (WhatsApp Business API, Telegram, web widgets, API webhooks)
- Real-time analytics and monitoring
- Secure data handling with Supabase and RLS policies
- Integration with multiple AI models (Llama 3.3, Mistral, etc.)

Subscription plans:
- Free tier: Basic features with usage limits
- Starter: Enhanced features and higher limits 
- Pro: Advanced features and priority support
- Enterprise: Custom solutions

Common user questions:
- How to create first AI agent: Use "Generate with AI" feature on dashboard
- Deployment process: Select platform, configure credentials, one-click deploy
- Pricing: Free tier available, paid plans for advanced features
- Data security: Encrypted storage with RLS policies
- Support: Email support@kynex.dev, documentation, tutorials

Be helpful, concise, and professional. If you don't know something specific about KYNEX.dev, direct users to support@kynex.dev or the help documentation. Always maintain a friendly and supportive tone.

Answer in a conversational way, and feel free to ask clarifying questions to better help users.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Prepare conversation history
    const conversation: ChatMessage[] = [
      { role: 'system', content: SUPPORT_SYSTEM_PROMPT },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Use the OpenRouter client to get AI response
    const openRouterClient = new OpenRouterClient(process.env.OPENROUTER_API_KEY!);
    
    try {
      // Use Mistral for support chat (good for conversation and instruction following)
      const aiResponseContent = await openRouterClient.generateCompletion({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: conversation.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      });

      // The generateCompletion method returns the content directly as a string
      if (!aiResponseContent) {
        throw new Error('No response content received from AI');
      }

      // Update conversation history
      const updatedHistory = [
        ...history.slice(-10),
        { role: 'user' as const, content: message },
        { role: 'assistant' as const, content: aiResponseContent }
      ];

      return NextResponse.json({
        response: aiResponseContent,
        conversationId: body.conversationId || `chat_${Date.now()}`,
        history: updatedHistory
      });

    } catch (aiError) {
      console.error('AI response error:', aiError);
      
      // Fallback response if AI fails
      const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. For immediate assistance, please email us at support@kynex.dev or check out our help documentation. Is there something specific about KYNEX.dev I can help you with?";
      
      return NextResponse.json({
        response: fallbackResponse,
        conversationId: body.conversationId || `chat_${Date.now()}`,
        history: [
          ...history.slice(-10),
          { role: 'user' as const, content: message },
          { role: 'assistant' as const, content: fallbackResponse }
        ],
        fallback: true
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again or contact support@kynex.dev' },
      { status: 500 }
    );
  }
}
