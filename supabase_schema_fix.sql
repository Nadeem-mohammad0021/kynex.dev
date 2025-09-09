-- KYNEX Database Schema Fix
-- Run this in your Supabase SQL Editor to ensure all tables and relationships are correctly set up

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Users can view own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can create own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete own workflows" ON workflows;

DROP POLICY IF EXISTS "Users can view agents from own workflows" ON agents;
DROP POLICY IF EXISTS "Users can create agents for own workflows" ON agents;
DROP POLICY IF EXISTS "Users can update agents from own workflows" ON agents;
DROP POLICY IF EXISTS "Users can delete agents from own workflows" ON agents;

DROP POLICY IF EXISTS "Users can view deployments of own agents" ON deployments;
DROP POLICY IF EXISTS "Users can create deployments for own agents" ON deployments;
DROP POLICY IF EXISTS "Users can update deployments of own agents" ON deployments;
DROP POLICY IF EXISTS "Users can delete deployments of own agents" ON deployments;

-- Create proper RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = user_id OR auth.uid()::text = clerk_id);

CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid()::text = clerk_id);

-- Create proper RLS policies for workflows table
CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own workflows" ON workflows
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own workflows" ON workflows
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create proper RLS policies for agents table
CREATE POLICY "Users can view agents from own workflows" ON agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create agents for own workflows" ON agents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update agents from own workflows" ON agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete agents from own workflows" ON agents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

-- Create proper RLS policies for deployments table
CREATE POLICY "Users can view deployments of own agents" ON deployments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create deployments for own agents" ON deployments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update deployments of own agents" ON deployments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete deployments of own agents" ON deployments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

-- Create proper RLS policies for subscriptions table
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create proper RLS policies for logs table
CREATE POLICY "Users can view logs of own agents" ON logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = logs.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create logs for own agents" ON logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = logs.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

-- Create proper RLS policies for performance_metrics table
CREATE POLICY "Users can view metrics of own agents" ON performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = performance_metrics.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create metrics for own agents" ON performance_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = performance_metrics.agent_id 
      AND workflows.user_id = auth.uid()::text
    )
  );
