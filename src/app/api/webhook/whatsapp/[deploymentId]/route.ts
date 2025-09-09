import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export const runtime = 'edge';

// Webhook verification for WhatsApp Business API
export async function GET(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const expectedToken = `kynex_${params.deploymentId}`;

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('WhatsApp webhook verified for deployment:', params.deploymentId);
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('WhatsApp webhook verification failed:', { mode, token, expectedToken });
    return new NextResponse('Verification failed', { status: 403 });
  }
}

// Handle incoming WhatsApp messages
export async function POST(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const body = await request.json();
    const supabase = await createServerClient();

    // Verify webhook signature (implement based on WhatsApp's requirements)
    // const signature = request.headers.get('x-hub-signature-256');
    // if (!verifyWhatsAppSignature(body, signature)) {
    //   return new NextResponse('Invalid signature', { status: 403 });
    // }

    // Log the incoming webhook for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

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

    // Process WhatsApp webhook entries
    if (body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value.messages) {
              for (const message of change.value.messages) {
                await processWhatsAppMessage(message, deployment, supabase);
              }
            }
            
            // Handle delivery receipts and read receipts
            if (change.field === 'messages' && change.value.statuses) {
              for (const status of change.value.statuses) {
                await processWhatsAppStatus(status, deployment, supabase);
              }
            }
          }
        }
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

async function processWhatsAppMessage(message: any, deployment: any, supabase: any) {
  try {
    const userId = message.from;
    const messageText = message.text?.body || message.button?.text || message.interactive?.button_reply?.title || '';
    const messageType = message.type;

    // Skip processing for unsupported message types
    if (!messageText && messageType !== 'text' && messageType !== 'button' && messageType !== 'interactive') {
      console.log('Skipping unsupported message type:', messageType);
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
          platform: 'whatsapp',
          status: 'received', 
          user_id: userId,
          message_text: messageText,
          whatsapp_message_id: message.id,
          message_type: messageType,
          timestamp: message.timestamp
        }
      });

    if (logError) {
      console.error('Error logging WhatsApp message:', logError);
    }

    // Process message through the agent (in a real implementation, this would call your AI agent)
    const agentResponse = await processMessageThroughAgent(
      messageText, 
      userId, 
      deployment.agents, 
      'whatsapp',
      deployment.deployment_id
    );

    if (agentResponse) {
      // Send response back to WhatsApp (would need WhatsApp Business API credentials)
      await sendWhatsAppMessage(userId, agentResponse, deployment.agents.config?.credentials);
      
      // Log the response
      await supabase
        .from('logs')
        .insert({
          agent_id: deployment.agent_id,
          level: 'info',
          message: `Sent response to user ${userId}`,
          metadata: {
            platform: 'whatsapp',
            status: 'sent',
            user_id: userId,
            response_text: agentResponse,
            original_message_id: message.id,
            response_type: 'text'
          }
        });
    }

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
  }
}

async function processWhatsAppStatus(status: any, deployment: any, supabase: any) {
  // Handle message delivery and read receipts
  const { error } = await supabase
    .from('logs')
    .update({ 
      metadata: { 
        delivery_status: status.status,
        timestamp: status.timestamp 
      }
    })
    .eq('agent_id', deployment.agent_id)
    .eq('metadata->>whatsapp_message_id', status.id);

  if (error) {
    console.error('Error updating WhatsApp status:', error);
  }
}

async function processMessageThroughAgent(
  message: string,
  userId: string,
  agent: any,
  platform: string,
  deploymentId?: string
): Promise<string | null> {
  try {
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
        metadata: {
          whatsapp: true
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
    
    // Fallback response for WhatsApp
    const agentName = agent.name || agent.workflows?.name || 'your AI assistant';
    return `Hello! This is ${agentName} 💬. I'm having some technical difficulties right now, but I'd love to help you. Please try sending your message again!`;
  }
}

async function sendWhatsAppMessage(recipientId: string, message: string, credentials: any) {
  try {
    // This would integrate with WhatsApp Business API
    // You would need to implement the actual API call here using the credentials
    console.log('Sending WhatsApp message:', { recipientId, message });
    
    // Example implementation would be:
    // const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${credentials.business_api_key}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: recipientId,
    //     text: { body: message }
    //   })
    // });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}
