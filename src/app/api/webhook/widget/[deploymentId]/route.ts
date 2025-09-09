import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export const runtime = 'edge';

// Handle website widget messages
export async function POST(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const body = await request.json();
    const { input, userId = 'anonymous', sessionId } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input message is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get deployment info
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select(`
        deployment_id,
        agent_id,
        status,
        agents (
          agent_id,
          name,
          workflow_id,
          workflows (
            user_id,
            name,
            config
          )
        )
      `)
      .eq('deployment_id', params.deploymentId)
      .eq('status', 'active')
      .single();

    if (deploymentError || !deployment) {
      console.error('Deployment not found:', deploymentError);
      return NextResponse.json(
        { error: 'Deployment not found or inactive' },
        { status: 404 }
      );
    }

    // Process through AI agent
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.dev'}/api/agents/${params.deploymentId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input,
        userId,
        platform: 'widget',
        metadata: {
          sessionId,
          widget: true,
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer')
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI processing failed with status ${response.status}`);
    }

    const aiData = await response.json();

    if (aiData.error) {
      throw new Error(aiData.message || 'AI processing error');
    }

    // Return widget-compatible response
    return NextResponse.json({
      result: aiData.reply,
      agentName: aiData.agentName,
      success: true,
      conversationId: aiData.conversationId,
      timestamp: aiData.timestamp,
      platform: 'widget'
    });

  } catch (error: any) {
    console.error('Widget webhook error:', error);
    
    return NextResponse.json({
      result: "I'm currently experiencing technical difficulties. Please try again in a moment!",
      error: true,
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle GET requests for widget configuration
export async function GET(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const supabase = await createServerClient();

    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select(`
        deployment_id,
        agents (
          name,
          workflows (
            name,
            config
          )
        )
      `)
      .eq('deployment_id', params.deploymentId)
      .eq('status', 'active')
      .single();

    if (deploymentError || !deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Return widget configuration
    return NextResponse.json({
      deploymentId: params.deploymentId,
      agentName: deployment.agents.name || deployment.agents.workflows?.name || 'AI Assistant',
      status: 'active',
      greeting: `Hi! I'm ${deployment.agents.name || 'your AI assistant'}. How can I help you today?`,
      configuration: {
        theme: 'auto',
        position: 'bottom-right',
        primaryColor: '#0891b2'
      }
    });

  } catch (error: any) {
    console.error('Widget config error:', error);
    return NextResponse.json(
      { error: 'Failed to get widget configuration' },
      { status: 500 }
    );
  }
}
