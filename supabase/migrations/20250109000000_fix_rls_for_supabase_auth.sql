-- Fix RLS policies to work with Supabase auth only (remove Clerk dependencies)

-- Drop existing RLS policies that depend on Clerk
DROP POLICY IF EXISTS "users_own_data" ON public.users;
DROP POLICY IF EXISTS "subscriptions_own_data" ON public.subscriptions;
DROP POLICY IF EXISTS "workflows_own_data" ON public.workflows;
DROP POLICY IF EXISTS "workflow_versions_own_data" ON public.workflow_versions;
DROP POLICY IF EXISTS "agents_own_data" ON public.agents;
DROP POLICY IF EXISTS "deployments_own_data" ON public.deployments;
DROP POLICY IF EXISTS "logs_own_data" ON public.logs;
DROP POLICY IF EXISTS "performance_metrics_own_data" ON public.performance_metrics;

-- Create simplified RLS policies that work with Supabase auth only
-- Users can manage their own data
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own subscriptions
CREATE POLICY "subscriptions_own_data" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own workflows
CREATE POLICY "workflows_own_data" ON public.workflows
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own workflow versions
CREATE POLICY "workflow_versions_own_data" ON public.workflow_versions
  FOR ALL USING (
    workflow_id IN (
      SELECT workflow_id FROM public.workflows 
      WHERE auth.uid() = user_id
    )
  );

-- Users can manage their own agents
CREATE POLICY "agents_own_data" ON public.agents
  FOR ALL USING (
    workflow_id IN (
      SELECT workflow_id FROM public.workflows 
      WHERE auth.uid() = user_id
    )
  );

-- Users can manage their own deployments
CREATE POLICY "deployments_own_data" ON public.deployments
  FOR ALL USING (
    agent_id IN (
      SELECT a.agent_id FROM public.agents a
      JOIN public.workflows w ON a.workflow_id = w.workflow_id
      WHERE auth.uid() = w.user_id
    )
  );

-- Users can view their own logs
CREATE POLICY "logs_own_data" ON public.logs
  FOR ALL USING (
    agent_id IN (
      SELECT a.agent_id FROM public.agents a
      JOIN public.workflows w ON a.workflow_id = w.workflow_id
      WHERE auth.uid() = w.user_id
    )
  );

-- Users can view their own performance metrics
CREATE POLICY "performance_metrics_own_data" ON public.performance_metrics
  FOR ALL USING (
    agent_id IN (
      SELECT a.agent_id FROM public.agents a
      JOIN public.workflows w ON a.workflow_id = w.workflow_id
      WHERE auth.uid() = w.user_id
    )
  );

-- Remove clerk_id column from users table if it exists (since we're not using Clerk)
ALTER TABLE public.users DROP COLUMN IF EXISTS clerk_id;

-- Make sure user_id is UUID type to match auth.uid()
-- (this should already be the case, but just to be sure)
ALTER TABLE public.users ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
