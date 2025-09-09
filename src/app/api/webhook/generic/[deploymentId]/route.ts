import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export const runtime = 'edge';

// Handle generic API webhook requests
export async function POST(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const body = await request.json();
    const { message, input, userId = 'anonymous', timestamp, metadata } = body;

    // Accept both 'message' and 'input' for flexibility
    const messageText = message || input;

    if (!messageText) {
      return NextResponse.json(
        { error: 'Message or input is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Validate API key if provided (optional for this endpoint)
    const apiKey = request.headers.get('x-api-key');
    const authorization = request.headers.get('authorization');

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
          description,
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
        message: messageText,
        userId,
        platform: 'api',
        metadata: {
          webhook: true,
          apiKey: apiKey ? 'provided' : 'none',
          userAgent: request.headers.get('user-agent'),
          contentType: request.headers.get('content-type'),
          timestamp: timestamp || new Date().toISOString(),
          ...metadata
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

    // Return comprehensive API response
    return NextResponse.json({
      success: true,
      result: aiData.reply,
      response: aiData.reply, // Alternative key for compatibility
      data: {
        agentName: aiData.agentName,
        conversationId: aiData.conversationId,
        platform: 'api',
        timestamp: aiData.timestamp,
        processedAt: new Date().toISOString()
      },
      metadata: {
        deploymentId: params.deploymentId,
        userId,
        model: 'ai-agent',
        version: '1.0'
      }
    });

  } catch (error: any) {
    console.error('Generic webhook error:', error);
    
    return NextResponse.json({
      success: false,
      error: true,
      result: "I'm currently experiencing technical difficulties. Please try again in a moment.",
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handle GET requests for API documentation
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
        created_at,
        agents (
          name,
          description,
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
        { error: 'Deployment not found or inactive' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.dev';
    const agentName = deployment.agents.name || deployment.agents.workflows?.name || 'AI Agent';

    // Return API documentation
    return NextResponse.json({
      deploymentId: params.deploymentId,
      agentName,
      description: deployment.agents.description || `API endpoint for ${agentName}`,
      status: 'active',
      createdAt: deployment.created_at,
      endpoints: {
        production: {
          webhook: `${baseUrl}/api/webhook/generic/${params.deploymentId}`,
          direct: `${baseUrl}/api/agents/${params.deploymentId}/message`
        },
        local: {
          webhook: `http://localhost:9002/api/webhook/generic/${params.deploymentId}`,
          direct: `http://localhost:9002/api/agents/${params.deploymentId}/message`
        }
      },
      usage: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'optional-api-key'
        },
        body: {
          message: 'Your message here',
          userId: 'unique-user-identifier',
          metadata: {
            source: 'your-app',
            version: '1.0'
          }
        }
      },
      response: {
        success: true,
        result: 'AI agent response',
        data: {
          agentName: agentName,
          conversationId: 'conversation-identifier',
          timestamp: new Date().toISOString()
        }
      },
      examples: {
        curl: `curl -X POST '${baseUrl}/api/webhook/generic/${params.deploymentId}' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: YOUR_API_KEY' \\
  -d '{
    "message": "Hello, can you help me?",
    "userId": "user123",
    "metadata": {"source": "website"}
  }'`,
        javascript: `const response = await fetch('${baseUrl}/api/webhook/generic/${params.deploymentId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    message: 'Hello, can you help me?',
    userId: 'user123',
    metadata: { source: 'website' }
  })
});

const data = await response.json();
console.log(data.result);`
      },
      rateLimit: 'No rate limiting currently applied',
      authentication: 'API key optional but recommended for production use'
    });

  } catch (error: any) {
    console.error('API documentation error:', error);
    return NextResponse.json(
      { error: 'Failed to get API documentation' },
      { status: 500 }
    );
  }
}
