
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Supabase sends a pre-flight OPTIONS request, so we need to handle that
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    } });
  }

  const url = new URL(req.url);
  const deployment_id = url.searchParams.get("deployment_id");
  
  let input = "No input provided";
  try {
    const body = await req.json();
    if (body.input) {
      input = body.input;
    }
  } catch (e) {
    // Ignore error if body is empty or not valid JSON
  }
  
  if (!deployment_id) {
    return new Response(JSON.stringify({ error: "deployment_id is required" }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Load workflow spec from the deployment
  const { data: deploymentData, error: deploymentError } = await supabase
    .from("deployments")
    .select(`
      agent_id, 
      agents (
        workflow_id, 
        workflows (
          spec
        )
      )
    `)
    .eq("deployment_id", deployment_id)
    .single();

  if (deploymentError || !deploymentData) {
    console.error('Error fetching deployment:', deploymentError);
    return new Response(JSON.stringify({ error: "Agent not found or error fetching deployment." }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
  
  // Type guards to satisfy TypeScript
  if (!deploymentData.agents || !deploymentData.agents.workflows) {
     return new Response(JSON.stringify({ error: "Invalid agent or workflow structure." }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const workflowSpec = deploymentData.agents.workflows.spec;

  // Here you would run your actual workflow interpreter.
  // For now, we'll just mock a response using the workflow name.
  const agentName = workflowSpec.name || 'Unnamed Agent';
  const output = { result: `Agent '${agentName}' processed your input: '${input}'` };

  return new Response(JSON.stringify(output), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
