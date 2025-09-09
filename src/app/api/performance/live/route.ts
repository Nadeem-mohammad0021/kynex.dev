import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server-client';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Function to send data
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial connection message
      send({ type: 'connected', message: 'Real-time performance tracking started' });

      // Function to fetch and send performance data
      const fetchPerformanceData = async () => {
        try {
          // Use Supabase Auth user ID directly
          const supabaseUserId = user.id;
          
          // Get or create user in users table if needed
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('user_id')
            .eq('user_id', supabaseUserId)
            .single();

          // If user doesn't exist in users table, create them
          if (userError && userError.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('users')
              .insert({
                user_id: supabaseUserId,
                email: user.email || '',
                name: user.user_metadata?.full_name || user.email || ''
              });
            
            if (createError) {
              console.error('Error creating user:', createError);
              send({
                type: 'error',
                message: 'Error creating user profile',
                error: createError.message,
              });
              return;
            }
          } else if (userError) {
            console.error('Error fetching user:', userError);
            send({
              type: 'error',
              message: 'Error loading user profile',
              error: userError.message,
            });
            return;
          }

          const internalUserId = supabaseUserId;

          // Fetch user's workflows first
          const { data: workflows, error: workflowsError } = await supabase
            .from('workflows')
          .select('workflow_id, name, config')
            .eq('user_id', internalUserId);
          
          if (workflowsError) {
            console.error('Error fetching workflows:', workflowsError);
            send({
              type: 'error',
              message: 'Error loading workflows',
              error: workflowsError.message,
            });
            return;
          }
          
          const workflowIds = workflows?.map(w => w.workflow_id) || [];
          
          let deployments: any[] = [];
          
          if (workflowIds.length > 0) {
            // Get agents for user's workflows
            const { data: agents, error: agentsError } = await supabase
              .from('agents')
              .select('agent_id, workflow_id, name, platform, status')
              .in('workflow_id', workflowIds);
            
            if (agentsError) {
              console.error('Error fetching agents:', agentsError);
              send({
                type: 'error',
                message: 'Error loading agents',
                error: agentsError.message,
              });
              return;
            }
            
            const agentIds = agents?.map(a => a.agent_id) || [];
            
            if (agentIds.length > 0) {
              // Get deployments for these agents
              const { data: rawDeployments, error: deploymentsError } = await supabase
                .from('deployments')
                .select('deployment_id, agent_id, status, deployed_at')
                .in('agent_id', agentIds)
                .order('deployed_at', { ascending: false });
              
              if (deploymentsError) {
                console.error('Error fetching deployments:', deploymentsError);
                send({
                  type: 'error',
                  message: 'Error loading deployments',
                  error: deploymentsError.message,
                });
                return;
              } else {
                // Transform to match expected structure
                deployments = (rawDeployments || []).map(deployment => {
                  const agent = agents?.find(a => a.agent_id === deployment.agent_id);
                  const workflow = workflows?.find(w => w.workflow_id === agent?.workflow_id);
                  
                  return {
                    ...deployment,
                    agents: [{
                      name: agent?.name,
                      platform: agent?.platform,
                      status: agent?.status,
                      workflows: {
                        user_id: internalUserId,
                        name: workflow?.name,
                        config: workflow?.config
                      }
                    }]
                  };
                });
              }
            }
          }

          // Generate mock performance data for active deployments
          const mockPerformanceData = (deployments || []).map((deployment: any) => {
            const isActive = deployment.status === 'deployed';
            const daysSinceDeployment = deployment.deployed_at 
              ? Math.floor((Date.now() - new Date(deployment.deployed_at).getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            
            // Access first agent from the array
            const agent = deployment.agents?.[0] || {};
            
            return {
              agentId: deployment.deployment_id,
              name: agent.name || agent.workflows?.name || agent.workflows?.config?.name || 'Unnamed Agent',
              platform: agent.platform || 'Unknown',
              status: deployment.status,
              conversations: isActive ? Math.floor(Math.random() * 50) + daysSinceDeployment : 0,
              activeConversations: isActive ? Math.floor(Math.random() * 5) : 0,
              avgResponseTime: isActive ? Math.floor(Math.random() * 2000) + 500 : 0,
              satisfactionScore: isActive ? Math.round((Math.random() * 2 + 3) * 10) / 10 : 0,
              lastActivity: isActive ? new Date(Date.now() - Math.random() * 3600000).toISOString() : null,
            };
          });

          // Generate recent activity data
          const recentActivity = mockPerformanceData
            .filter(agent => agent.status === 'deployed')
            .slice(0, 5)
            .map(agent => ({
              conversationId: `conv_${Math.random().toString(36).substr(2, 9)}`,
              agentName: agent.name,
              platform: agent.platform,
              status: Math.random() > 0.3 ? 'active' : 'ended',
              messageCount: Math.floor(Math.random() * 20) + 1,
              satisfactionScore: Math.random() > 0.2 ? Math.floor(Math.random() * 5) + 1 : null,
              duration: Math.floor(Math.random() * 120) + 1,
              lastActivity: new Date(Date.now() - Math.random() * 1800000).toISOString(),
            }));

          // Calculate summary statistics
          const activeAgents = mockPerformanceData.filter(agent => agent.status === 'deployed');
          const totalActiveConversations = activeAgents.reduce((sum, agent) => sum + agent.activeConversations, 0);
          const avgResponseTime = activeAgents.length > 0 
            ? Math.round(activeAgents.reduce((sum, agent) => sum + agent.avgResponseTime, 0) / activeAgents.length)
            : 0;
          const avgSatisfactionScore = activeAgents.length > 0
            ? Math.round((activeAgents.reduce((sum, agent) => sum + agent.satisfactionScore, 0) / activeAgents.length) * 10) / 10
            : 0;

          // Send performance data
          send({
            type: 'performance_update',
            timestamp: new Date().toISOString(),
            data: {
              summary: {
                totalAgents: mockPerformanceData.length,
                activeConversations: totalActiveConversations,
                avgResponseTime: avgResponseTime,
                avgSatisfactionScore: avgSatisfactionScore,
              },
              agents: mockPerformanceData,
              recentActivity: recentActivity,
              metrics: {}, // Will be populated when enhanced schema is applied
            },
          });
        } catch (error) {
          console.error('Error in fetchPerformanceData:', error);
          send({
            type: 'error',
            message: 'Error fetching performance data',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      };

      // Fetch initial data
      fetchPerformanceData();

      // Set up interval to fetch data every 5 seconds
      const interval = setInterval(fetchPerformanceData, 5000);

      // Set up a timeout to close the connection after 10 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
        send({ type: 'timeout', message: 'Connection timed out after 10 minutes' });
        controller.close();
      }, 10 * 60 * 1000);

      // Cleanup function
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    },
  });

  // Return the response with appropriate headers for Server-Sent Events
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
    },
  });
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
    },
  });
}
