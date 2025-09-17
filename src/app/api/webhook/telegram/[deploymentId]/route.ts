import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export const runtime = 'edge';

// Handle Telegram bot updates
export async function POST(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const update = await request.json();
    const supabase = await createServerClient();

    console.log('Telegram webhook received:', JSON.stringify(update, null, 2));

    // Get deployment info
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select(`
        deployment_id,
        agent_id,
        agents (
          agent_id,
          name,
          workflow_id,
          config,
          workflows (
            user_id,
            name,
            spec
          )
        )
      `)
      .eq('deployment_id', params.deploymentId)
      .single();

    if (deploymentError || !deployment) {
      console.error('Deployment not found:', deploymentError);
      return new NextResponse('Deployment not found', { status: 404 });
    }

    // Process different types of Telegram updates
    if (update.message) {
      await processTelegramMessage(update.message, deployment, supabase);
    } else if (update.callback_query) {
      await processTelegramCallback(update.callback_query, deployment, supabase);
    } else if (update.inline_query) {
      await processTelegramInlineQuery(update.inline_query, deployment, supabase);
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

async function processTelegramMessage(message: any, deployment: any, supabase: any) {
  try {
    const chatId = message.chat.id;
    const userId = message.from.id;
    const messageText = message.text || message.caption || '';
    const messageType = message.photo ? 'photo' : message.document ? 'document' : 'text';

    // Handle bot commands
    if (messageText.startsWith('/')) {
      await handleTelegramCommand(message, deployment, supabase);
      return;
    }

    // Skip empty messages
    if (!messageText.trim()) {
      console.log('Skipping empty Telegram message');
      return;
    }

    // Log the incoming message
    const { error: logError } = await supabase
      .from('logs')
      .insert({
        agent_id: deployment.agent_id,
        level: 'info',
        message: `Received ${messageType} message from user ${userId}`,
        metadata: {
          platform: 'telegram',
          status: 'received',
          user_id: userId.toString(),
          message_text: messageText,
          telegram_message_id: message.message_id,
          chat_id: chatId,
          message_type: messageType,
          username: message.from.username,
          first_name: message.from.first_name
        }
      });

    if (logError) {
      console.error('Error logging Telegram message:', logError);
    }

    // Process message through agent
    const agentResponse = await processMessageThroughAgent(
      messageText,
      userId.toString(),
      deployment.agents,
      'telegram',
      { chatId, messageId: message.message_id, deploymentId: deployment.deployment_id }
    );

    if (agentResponse) {
      await sendTelegramMessage(chatId, agentResponse, deployment.agents.config?.credentials);
      
      // Log the response
      await supabase
        .from('logs')
        .insert({
          agent_id: deployment.agent_id,
          level: 'info',
          message: `Sent response to user ${userId}`,
          metadata: {
            platform: 'telegram',
            status: 'sent',
            user_id: userId.toString(),
            response_text: agentResponse,
            original_message_id: message.message_id,
            chat_id: chatId,
            response_type: 'text'
          }
        });
    }

  } catch (error) {
    console.error('Error processing Telegram message:', error);
  }
}

async function handleTelegramCommand(message: any, deployment: any, supabase: any) {
  const chatId = message.chat.id;
  const command = message.text.split(' ')[0].toLowerCase();
  const agentName = deployment.agents.name || deployment.agents.workflows?.name || 'AI Agent';

  let responseText = '';

  switch (command) {
    case '/start':
      responseText = `👋 Hello! I'm ${agentName}, your AI assistant. How can I help you today?`;
      break;
    case '/help':
      responseText = `🤖 I'm ${agentName} - here's what I can do:
      
• Answer your questions
• Provide information and assistance
• Have conversations with you
• Help with various tasks

Just send me a message and I'll do my best to help! 

Type /reset to start a new conversation.`;
      break;
    case '/reset':
      responseText = `🔄 Conversation reset! I'm ${agentName} and I'm ready for a fresh start. What would you like to talk about?`;
      break;
    default:
      responseText = `❓ Unknown command. Type /help to see available commands.`;
  }

  await sendTelegramMessage(chatId, responseText, deployment.agents.config?.credentials);
}

async function processTelegramCallback(callbackQuery: any, deployment: any, supabase: any) {
  // Handle inline keyboard button presses
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  console.log('Telegram callback query:', { chatId, userId, data });

  // Process callback through agent if needed
  // This would depend on your specific use case
}

async function processTelegramInlineQuery(inlineQuery: any, deployment: any, supabase: any) {
  // Handle inline queries (when bot is used in inline mode)
  const query = inlineQuery.query;
  const userId = inlineQuery.from.id;

  console.log('Telegram inline query:', { query, userId });

  // Process inline query through agent if needed
}

async function processMessageThroughAgent(
  message: string,
  userId: string,
  agent: any,
  platform: string,
  context: any = {}
): Promise<string | null> {
  try {
    // Get the deployment ID from agent data
    const deploymentId = context.deploymentId;
    if (!deploymentId) {
      throw new Error('Deployment ID not available for AI processing');
    }

    // Call our real AI agent processing API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.dev'}/api/agents/${deploymentId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId,
        platform,
        chatId: context.chatId,
        metadata: {
          messageId: context.messageId,
          telegram: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.message || 'AI processing error');
    }

    return data.reply || null;

  } catch (error) {
    console.error('Error processing message through agent:', error);
    
    // Fallback to a contextual error message
    const agentName = agent.name || agent.workflows?.name || 'your AI assistant';
    return `Hi! I'm ${agentName} 🤖. I'm experiencing some technical difficulties right now, but I'm here to help! Could you please try again?`;
  }
}

async function sendTelegramMessage(chatId: string | number, message: string, credentials: any) {
  try {
    const botToken = credentials?.bot_token;
    if (!botToken) {
      console.error('Telegram bot token not found in credentials');
      return;
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML', // Support HTML formatting
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      throw new Error(`Telegram API error: ${error.description}`);
    }

    const result = await response.json();
    console.log('Telegram message sent successfully:', result.message_id);

  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}
