-- ========================
-- KYNEX Database Schema
-- ========================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- DROP EXISTING TABLES (Safe Cleanup)
-- ========================
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS subscription_usage CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS deployments CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================
-- USERS TABLE
-- ========================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT auth.uid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    avatar_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'free' 
        CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMPTZ,
    trial_started_at TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- WORKFLOWS TABLE
-- ========================
CREATE TABLE workflows (
    workflow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- AGENTS TABLE
-- ========================
CREATE TABLE agents (
    agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model VARCHAR(100),
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- DEPLOYMENTS TABLE
-- ========================
CREATE TABLE deployments (
    deployment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE,
    environment VARCHAR(50) CHECK (environment IN ('dev', 'prod')),
    status VARCHAR(50) CHECK (status IN ('active', 'inactive')),
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- LOGS TABLE
-- ========================
CREATE TABLE logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE,
    level VARCHAR(50) CHECK (level IN ('info', 'warning', 'error')),
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- SUBSCRIPTION USAGE TABLE
-- ========================
CREATE TABLE subscription_usage (
    usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    tokens_used BIGINT DEFAULT 0,
    requests_made BIGINT DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- WEBHOOK EVENTS TABLE
-- ========================
CREATE TABLE webhook_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- PERFORMANCE METRICS TABLE
-- ========================
CREATE TABLE performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE,
    latency_ms INT,
    success_rate DECIMAL(5,2),
    error_rate DECIMAL(5,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- UPDATED_AT TRIGGER FUNCTION
-- ========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at 
    BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deployments_updated_at ON deployments;
CREATE TRIGGER update_deployments_updated_at 
    BEFORE UPDATE ON deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================
-- INDEXES
-- ========================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires ON users(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agents_workflow_id ON agents(workflow_id);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployments_agent_id ON deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_logs_agent_id ON logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_agent_id ON performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at DESC);

-- ========================
-- ENABLE ROW LEVEL SECURITY
-- ========================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- ========================
-- RLS POLICIES
-- ========================

-- USERS POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = user_id);

-- WORKFLOWS POLICIES
DROP POLICY IF EXISTS "Users can view own workflows" ON workflows;
CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workflows" ON workflows;
CREATE POLICY "Users can insert own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workflows" ON workflows;
CREATE POLICY "Users can update own workflows" ON workflows
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workflows" ON workflows;
CREATE POLICY "Users can delete own workflows" ON workflows
  FOR DELETE USING (auth.uid() = user_id);

-- AGENTS POLICIES
DROP POLICY IF EXISTS "Users can view agents from own workflows" ON agents;
CREATE POLICY "Users can view agents from own workflows" ON agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert agents for own workflows" ON agents;
CREATE POLICY "Users can insert agents for own workflows" ON agents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update agents from own workflows" ON agents;
CREATE POLICY "Users can update agents from own workflows" ON agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete agents from own workflows" ON agents;
CREATE POLICY "Users can delete agents from own workflows" ON agents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workflows 
      WHERE workflows.workflow_id = agents.workflow_id 
      AND workflows.user_id = auth.uid()
    )
  );

-- DEPLOYMENTS POLICIES
DROP POLICY IF EXISTS "Users can view deployments of own agents" ON deployments;
CREATE POLICY "Users can view deployments of own agents" ON deployments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert deployments for own agents" ON deployments;
CREATE POLICY "Users can insert deployments for own agents" ON deployments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update deployments of own agents" ON deployments;
CREATE POLICY "Users can update deployments of own agents" ON deployments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete deployments of own agents" ON deployments;
CREATE POLICY "Users can delete deployments of own agents" ON deployments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = deployments.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

-- LOGS POLICIES
DROP POLICY IF EXISTS "Users can view logs of own agents" ON logs;
CREATE POLICY "Users can view logs of own agents" ON logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = logs.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert logs for own agents" ON logs;
CREATE POLICY "Users can insert logs for own agents" ON logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = logs.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

-- SUBSCRIPTION USAGE POLICIES
DROP POLICY IF EXISTS "Users can view own subscription usage" ON subscription_usage;
CREATE POLICY "Users can view own subscription usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription usage" ON subscription_usage;
CREATE POLICY "Users can insert own subscription usage" ON subscription_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription usage" ON subscription_usage;
CREATE POLICY "Users can update own subscription usage" ON subscription_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- WEBHOOK EVENTS POLICIES
DROP POLICY IF EXISTS "Users can view own webhook events" ON webhook_events;
CREATE POLICY "Users can view own webhook events" ON webhook_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own webhook events" ON webhook_events;
CREATE POLICY "Users can insert own webhook events" ON webhook_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PERFORMANCE METRICS POLICIES
DROP POLICY IF EXISTS "Users can view metrics of own agents" ON performance_metrics;
CREATE POLICY "Users can view metrics of own agents" ON performance_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = performance_metrics.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert metrics for own agents" ON performance_metrics;
CREATE POLICY "Users can insert metrics for own agents" ON performance_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      JOIN workflows ON workflows.workflow_id = agents.workflow_id
      WHERE agents.agent_id = performance_metrics.agent_id 
      AND workflows.user_id = auth.uid()
    )
  );

-- ========================
-- GRANT PERMISSIONS
-- ========================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- Grant permissions to service_role for system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Final success message
SELECT 'KYNEX Database Schema Updated Successfully! 🚀' as status,
       'Schema updated according to chat-sql.txt specifications.' as message;
