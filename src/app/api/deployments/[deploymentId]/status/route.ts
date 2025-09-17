import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export const runtime = 'edge';

// Get deployment status and health metrics
export async function GET(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const supabase = await createServerClient();

    // Get deployment details with metrics
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .select(`
        deployment_id,
        agent_id,
        status,
        created_at,
        url,
        environment,
        agents (
          agent_id,
          name,
          config,
          workflow_id,
          workflows (
            user_id,
            name,
            config
          )
        )
      `)
      .eq('deployment_id', params.deploymentId)
      .single();

    if (deploymentError || !deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      );
    }

    // Get recent activity logs (last 24 hours)
    const { data: recentLogs, error: logsError } = await supabase
      .from('logs')
      .select('level, message, created_at, metadata')
      .eq('agent_id', deployment.agent_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    // Get conversation activity metrics
    const { data: conversationMetrics, error: metricsError } = await supabase
      .rpc('get_conversation_metrics', { 
        agent_id_param: deployment.agent_id,
        hours_back: 24 
      });

    // Calculate health metrics
    const totalMessages = recentLogs?.length || 0;
    const errorMessages = recentLogs?.filter(log => log.level === 'error')?.length || 0;
    const inboundMessages = recentLogs?.filter(log => 
      log.metadata?.direction === 'inbound'
    )?.length || 0;
    const outboundMessages = recentLogs?.filter(log => 
      log.metadata?.direction === 'outbound'
    )?.length || 0;

    const successRate = totalMessages > 0 ? 
      ((totalMessages - errorMessages) / totalMessages * 100) : 100;

    const averageResponseTime = calculateAverageResponseTime(recentLogs || []);

    // Determine overall health status
    let healthStatus: 'healthy' | 'warning' | 'error' | 'inactive' = 'healthy';
    const issues: string[] = [];

    if (deployment.status !== 'active') {
      healthStatus = 'inactive';
      issues.push(`Deployment status is ${deployment.status}`);
    } else if (successRate < 80) {
      healthStatus = 'error';
      issues.push(`Low success rate: ${successRate.toFixed(1)}%`);
    } else if (successRate < 95) {
      healthStatus = 'warning';
      issues.push(`Success rate below optimal: ${successRate.toFixed(1)}%`);
    }

    if (totalMessages === 0 && isOlderThan(deployment.created_at, 1)) {
      healthStatus = healthStatus === 'healthy' ? 'warning' : healthStatus;
      issues.push('No recent activity detected');
    }

    if (averageResponseTime > 10000) { // 10+ seconds
      healthStatus = healthStatus === 'healthy' ? 'warning' : healthStatus;
      issues.push(`Slow response time: ${averageResponseTime / 1000}s`);
    }

    // Test endpoint connectivity
    const connectivityStatus = await testEndpointConnectivity(deployment);

    return NextResponse.json({
      deploymentId: params.deploymentId,
      agentName: deployment.agents.name || deployment.agents.workflows?.name || 'AI Agent',
      status: deployment.status,
      health: {
        status: healthStatus,
        issues,
        score: Math.max(0, Math.min(100, successRate)),
        lastChecked: new Date().toISOString()
      },
      metrics: {
        uptime: calculateUptime(deployment.created_at),
        totalMessages,
        inboundMessages,
        outboundMessages,
        errorCount: errorMessages,
        successRate: parseFloat(successRate.toFixed(2)),
        averageResponseTime: Math.round(averageResponseTime),
        last24Hours: {
          messages: totalMessages,
          errors: errorMessages,
          uniqueUsers: getUniqueUsers(recentLogs || [])
        }
      },
      connectivity: connectivityStatus,
      endpoints: {
        webhook: deployment.url,
        direct: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.dev'}/api/agents/${params.deploymentId}/message`,
        status: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.dev'}/api/deployments/${params.deploymentId}/status`
      },
      configuration: {
        environment: deployment.environment || 'production',
        platform: deployment.agents.config?.platform || 'unknown',
        model: deployment.agents.config?.model || 'default'
      },
      timestamps: {
        deployed: deployment.created_at,
        lastActivity: recentLogs?.[0]?.created_at || null,
        checked: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Deployment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get deployment status' },
      { status: 500 }
    );
  }
}

// Test a deployment's responsiveness
export async function POST(
  request: NextRequest,
  { params }: { params: { deploymentId: string } }
) {
  try {
    const body = await request.json();
    const { testMessage = 'Health check test message' } = body;

    const startTime = Date.now();

    // Send test message to deployment
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.dev'}/api/agents/${params.deploymentId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        userId: 'health-check',
        platform: 'test',
        metadata: {
          healthCheck: true,
          timestamp: new Date().toISOString()
        }
      })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    let testResult: any = {
      success: false,
      responseTime,
      timestamp: new Date().toISOString()
    };

    if (response.ok) {
      const data = await response.json();
      testResult = {
        success: true,
        responseTime,
        response: data.reply || 'No reply received',
        timestamp: new Date().toISOString(),
        data
      };
    } else {
      testResult.error = `HTTP ${response.status}: ${response.statusText}`;
    }

    return NextResponse.json({
      deploymentId: params.deploymentId,
      test: testResult,
      performance: {
        responseTime,
        status: responseTime < 5000 ? 'good' : responseTime < 10000 ? 'slow' : 'poor'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      deploymentId: params.deploymentId,
      test: {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// Helper functions
function calculateAverageResponseTime(logs: any[]): number {
  const responseTimes: number[] = [];
  
  for (let i = 0; i < logs.length - 1; i++) {
    const currentLog = logs[i];
    const nextLog = logs[i + 1];
    
    if (currentLog.metadata?.direction === 'outbound' && 
        nextLog.metadata?.direction === 'inbound') {
      const responseTime = new Date(currentLog.created_at).getTime() - 
                          new Date(nextLog.created_at).getTime();
      if (responseTime > 0 && responseTime < 60000) { // Max 1 minute
        responseTimes.push(responseTime);
      }
    }
  }
  
  return responseTimes.length > 0 ? 
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 
    0;
}

function calculateUptime(deployedAt: string): string {
  const deployed = new Date(deployedAt);
  const now = new Date();
  const diffMs = now.getTime() - deployed.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getUniqueUsers(logs: any[]): number {
  const users = new Set();
  logs.forEach(log => {
    if (log.metadata?.user_id) {
      users.add(log.metadata.user_id);
    }
  });
  return users.size;
}

function isOlderThan(dateString: string, hours: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return (now.getTime() - date.getTime()) > (hours * 60 * 60 * 1000);
}

async function testEndpointConnectivity(deployment: any): Promise<any> {
  const tests: any[] = [];
  
  // Test direct API endpoint
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://kynex.dev'}/api/agents/${deployment.deployment_id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'connectivity test',
        userId: 'test',
        platform: 'test'
      })
    });
    
    tests.push({
      endpoint: 'direct_api',
      status: response.ok ? 'healthy' : 'error',
      responseCode: response.status,
      responseTime: 'measured_separately'
    });
  } catch (error: any) {
    tests.push({
      endpoint: 'direct_api',
      status: 'error',
      error: error.message
    });
  }
  
  return {
    overall: tests.every(t => t.status === 'healthy') ? 'healthy' : 'error',
    tests,
    lastTested: new Date().toISOString()
  };
}
