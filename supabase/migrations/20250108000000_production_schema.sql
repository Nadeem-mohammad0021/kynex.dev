-- Production Database Schema for AIAgentFlow
-- This migration creates the final production schema with trial subscription flow

-- Drop existing tables to start fresh (use with caution in production)
DROP TABLE IF EXISTS public.deployments CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE; 
DROP TABLE IF EXISTS public.workflow_versions CASCADE;
DROP TABLE IF EXISTS public.workflows CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;

-- Users
CREATE TABLE public.users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  clerk_id text UNIQUE, -- For Clerk auth integration
  created_at timestamptz DEFAULT now()
);

-- Subscriptions (trial starts on first deployment)
CREATE TABLE public.subscriptions (
  subscription_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('free_trial','basic','pro')),
  status text CHECK (status IN ('active','canceled','expired')) DEFAULT 'active',
  start_date timestamptz DEFAULT now(),
  end_date timestamptz
);

-- Workflows
CREATE TABLE public.workflows (
  workflow_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  name text, -- Add name field for better UX
  description text,
  status text CHECK (status IN ('draft','confirmed')) DEFAULT 'draft',
  spec jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workflow version history
CREATE TABLE public.workflow_versions (
  version_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.workflows(workflow_id) ON DELETE CASCADE,
  spec jsonb NOT NULL,
  edited_by uuid NOT NULL REFERENCES public.users(user_id),
  timestamp timestamptz DEFAULT now()
);

-- Agents
CREATE TABLE public.agents (
  agent_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.workflows(workflow_id) ON DELETE CASCADE,
  name text, -- Agent display name
  platform text NOT NULL,          -- telegram, whatsapp, x, website_widget, api_webhook, instagram
  api_credentials jsonb,            -- Make nullable for platforms that don't need creds
  status text CHECK (status IN ('inactive','active','deploying','error')) DEFAULT 'inactive',
  created_at timestamptz DEFAULT now()
);

-- Deployments (first insert starts trial)
CREATE TABLE public.deployments (
  deployment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  webhook_url text,
  embed_code text,                  -- For website widget deployments
  deployment_config jsonb,          -- Additional deployment configuration
  status text DEFAULT 'deployed',
  deployed_at timestamptz DEFAULT now()
);

-- Run logs for performance tracking
CREATE TABLE public.logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  platform_message jsonb NOT NULL,
  workflow_run jsonb NOT NULL,
  response_time_ms integer,         -- Track response times
  status text CHECK (status IN ('success','error')) DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

-- Performance metrics aggregation table
CREATE TABLE public.performance_metrics (
  metric_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(agent_id) ON DELETE CASCADE,
  date_recorded date DEFAULT current_date,
  total_runs integer DEFAULT 0,
  successful_runs integer DEFAULT 0,
  avg_response_time_ms integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_agents_workflow_id ON public.agents(workflow_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_deployments_agent_id ON public.deployments(agent_id);
CREATE INDEX idx_logs_agent_id ON public.logs(agent_id);
CREATE INDEX idx_logs_created_at ON public.logs(created_at);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_performance_metrics_agent_id ON public.performance_metrics(agent_id);

-- Trigger function to start trial on first deployment
CREATE OR REPLACE FUNCTION start_trial_on_first_deployment()
RETURNS trigger AS $$
DECLARE 
  v_user_id uuid;
BEGIN
  -- Get the user_id from the workflow through the agent
  SELECT w.user_id INTO v_user_id
  FROM public.workflows w
  JOIN public.agents a ON a.workflow_id = w.workflow_id
  WHERE a.agent_id = NEW.agent_id;

  -- Only create trial if no subscription exists for this user
  IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = v_user_id) THEN
    INSERT INTO public.subscriptions (user_id, plan, status, start_date, end_date)
    VALUES (v_user_id, 'free_trial', 'active', now(), now() + INTERVAL '1 month');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trial subscription
CREATE TRIGGER trigger_start_trial
  AFTER INSERT ON public.deployments
  FOR EACH ROW 
  EXECUTE FUNCTION start_trial_on_first_deployment();

-- Function to update workflow updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workflow updates
CREATE TRIGGER trigger_update_workflow_timestamp
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW 
  EXECUTE FUNCTION update_workflow_timestamp();

-- Function to aggregate performance metrics daily
CREATE OR REPLACE FUNCTION aggregate_performance_metrics()
RETURNS void AS $$
BEGIN
  -- Aggregate daily metrics for all agents
  INSERT INTO public.performance_metrics (agent_id, date_recorded, total_runs, successful_runs, avg_response_time_ms)
  SELECT 
    agent_id,
    current_date,
    COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE status = 'success') as successful_runs,
    AVG(response_time_ms)::integer as avg_response_time_ms
  FROM public.logs 
  WHERE DATE(created_at) = current_date - INTERVAL '1 day'
  GROUP BY agent_id
  ON CONFLICT (agent_id, date_recorded) DO UPDATE SET
    total_runs = EXCLUDED.total_runs,
    successful_runs = EXCLUDED.successful_runs,
    avg_response_time_ms = EXCLUDED.avg_response_time_ms;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view and update their own data
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (
    auth.jwt() ->> 'sub' = clerk_id OR 
    auth.uid()::text = user_id::text
  );

-- Users can manage their own subscriptions
CREATE POLICY "subscriptions_own_data" ON public.subscriptions
  FOR ALL USING (
    user_id IN (
      SELECT user_id FROM public.users 
      WHERE auth.jwt() ->> 'sub' = clerk_id OR auth.uid()::text = user_id::text
    )
  );

-- Users can manage their own workflows
CREATE POLICY "workflows_own_data" ON public.workflows
  FOR ALL USING (
    user_id IN (
      SELECT user_id FROM public.users 
      WHERE auth.jwt() ->> 'sub' = clerk_id OR auth.uid()::text = user_id::text
    )
  );

-- Users can manage their own workflow versions
CREATE POLICY "workflow_versions_own_data" ON public.workflow_versions
  FOR ALL USING (
    workflow_id IN (
      SELECT workflow_id FROM public.workflows w
      JOIN public.users u ON w.user_id = u.user_id
      WHERE auth.jwt() ->> 'sub' = u.clerk_id OR auth.uid()::text = u.user_id::text
    )
  );

-- Users can manage their own agents
CREATE POLICY "agents_own_data" ON public.agents
  FOR ALL USING (
    workflow_id IN (
      SELECT workflow_id FROM public.workflows w
      JOIN public.users u ON w.user_id = u.user_id
      WHERE auth.jwt() ->> 'sub' = u.clerk_id OR auth.uid()::text = u.user_id::text
    )
  );

-- Users can manage their own deployments
CREATE POLICY "deployments_own_data" ON public.deployments
  FOR ALL USING (
    agent_id IN (
      SELECT a.agent_id FROM public.agents a
      JOIN public.workflows w ON a.workflow_id = w.workflow_id
      JOIN public.users u ON w.user_id = u.user_id
      WHERE auth.jwt() ->> 'sub' = u.clerk_id OR auth.uid()::text = u.user_id::text
    )
  );

-- Users can view their own logs
CREATE POLICY "logs_own_data" ON public.logs
  FOR ALL USING (
    agent_id IN (
      SELECT a.agent_id FROM public.agents a
      JOIN public.workflows w ON a.workflow_id = w.workflow_id
      JOIN public.users u ON w.user_id = u.user_id
      WHERE auth.jwt() ->> 'sub' = u.clerk_id OR auth.uid()::text = u.user_id::text
    )
  );

-- Users can view their own performance metrics
CREATE POLICY "performance_metrics_own_data" ON public.performance_metrics
  FOR ALL USING (
    agent_id IN (
      SELECT a.agent_id FROM public.agents a
      JOIN public.workflows w ON a.workflow_id = w.workflow_id
      JOIN public.users u ON w.user_id = u.user_id
      WHERE auth.jwt() ->> 'sub' = u.clerk_id OR auth.uid()::text = u.user_id::text
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.users IS 'Application users with Clerk authentication integration';
COMMENT ON TABLE public.subscriptions IS 'User subscription plans with automatic trial creation';
COMMENT ON TABLE public.workflows IS 'AI workflow definitions created by users';
COMMENT ON TABLE public.agents IS 'Deployed agents based on workflows';
COMMENT ON TABLE public.deployments IS 'Agent deployment records that trigger trial subscriptions';
COMMENT ON TABLE public.logs IS 'Runtime logs for performance tracking';
COMMENT ON TABLE public.performance_metrics IS 'Daily aggregated performance metrics';

-- Create a view for easy dashboard queries
CREATE VIEW public.agent_dashboard AS
SELECT 
  a.agent_id,
  a.name as agent_name,
  a.platform,
  a.status,
  w.name as workflow_name,
  u.name as user_name,
  u.email as user_email,
  d.webhook_url,
  d.deployed_at,
  COUNT(l.log_id) as total_runs,
  COUNT(l.log_id) FILTER (WHERE l.status = 'success') as successful_runs,
  AVG(l.response_time_ms)::integer as avg_response_time
FROM public.agents a
JOIN public.workflows w ON a.workflow_id = w.workflow_id
JOIN public.users u ON w.user_id = u.user_id
LEFT JOIN public.deployments d ON a.agent_id = d.agent_id
LEFT JOIN public.logs l ON a.agent_id = l.agent_id
GROUP BY a.agent_id, a.name, a.platform, a.status, w.name, u.name, u.email, d.webhook_url, d.deployed_at;

-- Enable RLS on the view
ALTER VIEW public.agent_dashboard SET (security_invoker = on);

COMMENT ON VIEW public.agent_dashboard IS 'Dashboard view showing agent performance and status';
