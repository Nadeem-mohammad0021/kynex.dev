
import { createServerClient } from '@/lib/supabase/server-client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to handle converting a workflow into a deployed agent.
 * This is called directly from the client.
 * POST /api/workflows/convert
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
        return NextResponse.json({ error: 'Unauthorized: No active session found.' }, { status: 401 });
    }

    const { workflowId, platform, name } = await request.json();
    
    if (!workflowId || !platform || !name) {
        return NextResponse.json({ error: 'Missing required fields: workflowId, platform, and name are required.' }, { status: 400 });
    }

    // Step 1: Create the Agent record
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        workflow_id: workflowId,
        name: name,
        description: `Agent for ${platform} deployment`,
        config: {
          platform: platform,
          status: 'active',
          credentials: {} // Placeholder for future use
        }
      })
      .select('agent_id')
      .single();
    
    if (agentError) {
        console.error('Agent creation error:', agentError);
        throw agentError;
    }

    // Step 2: Create the initial Deployment record
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployments')
      .insert({
        agent_id: agent.agent_id,
        environment: 'prod',
        status: 'active'
      })
      .select('deployment_id')
      .single();

    if (deploymentError) {
      console.error('Initial Deployment creation error:', deploymentError);
      // Clean up the created agent if deployment fails
      await supabase.from('agents').delete().eq('agent_id', agent.agent_id);
      throw deploymentError;
    }
    
    // Step 3: Construct the Supabase Function Webhook URL
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    const projectRef = supabaseUrl.hostname.split('.')[0];
    const functionUrl = `https://${projectRef}.supabase.co/functions/v1/agent`;
    
    // The final webhook URL includes the deployment_id as a query parameter
    // Note: The Edge function will need to extract this from the query string, not the body.
    const webhookUrl = `${functionUrl}?deployment_id=${deployment.deployment_id}`;
    
    // Step 4: Update the deployment record with the generated webhook URL
    const { error: updateError } = await supabase
      .from('deployments')
      .update({ url: webhookUrl })
      .eq('deployment_id', deployment.deployment_id);

    if (updateError) {
      console.error('Deployment webhook update error:', updateError);
      // Clean up agent and deployment records on failure
      await supabase.from('deployments').delete().eq('deployment_id', deployment.deployment_id);
      await supabase.from('agents').delete().eq('agent_id', agent.agent_id);
      throw updateError;
    }
    
    console.log(`Successfully created deployment for workflow ${workflowId}. Deployment ID: ${deployment.deployment_id}`);

    // Return all the details the client needs to show the integration dialog
    return NextResponse.json({
      success: true,
      deploymentId: deployment.deployment_id,
      agentId: agent.agent_id,
      webhookUrl: webhookUrl,
      message: `Deployment successful for ${name} to ${platform}.`
    });

  } catch (error: any) {
    console.error('Error in convert workflow route:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
