-- KYNEX AI Agent Platform - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT auth.uid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_expires_at TIMESTAMPTZ,
    trial_started_at TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT users_email_unique UNIQUE (email)
);

-- ============================================================================
-- WORKFLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflows (
    workflow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    spec JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AGENTS TABLE  
-- ============================================================================
CREATE TABLE IF NOT EXISTS agents (
    agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflows(workflow_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'suspended')),
    api_credentials JSONB DEFAULT '{}',
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEPLOYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployments (
    deployment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'deployed', 'failed', 'stopped', 'suspended')),
    webhook_url TEXT,
    embed_code TEXT,
    deployment_config JSONB DEFAULT '{}',
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- External user ID from platform
    message TEXT,
    platform VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'sent', 'error', 'processing')),
    response_time_ms INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTION_USAGE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_usage (
    usage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    message_count INTEGER DEFAULT 0,
    deployment_count INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT usage_user_month_unique UNIQUE (user_id, month_year)
);

-- ============================================================================
-- WEBHOOK_EVENTS TABLE (for debugging and monitoring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deployment_id UUID REFERENCES deployments(deployment_id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'processed', 'error')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);

CREATE INDEX IF NOT EXISTS idx_agents_workflow_id ON agents(workflow_id);
CREATE INDEX IF NOT EXISTS idx_agents_platform ON agents(platform);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);

CREATE INDEX IF NOT EXISTS idx_deployments_agent_id ON deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_deployed_at ON deployments(deployed_at);

CREATE INDEX IF NOT EXISTS idx_logs_agent_id ON logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_platform ON logs(platform);
CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_month_year ON subscription_usage(month_year);

CREATE INDEX IF NOT EXISTS idx_webhook_events_deployment_id ON webhook_events(deployment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_platform ON webhook_events(platform);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON deployments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Workflows table policies
CREATE POLICY "Users can view their own workflows" ON workflows
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" ON workflows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" ON workflows
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" ON workflows
    FOR DELETE USING (auth.uid() = user_id);

-- Agents table policies
CREATE POLICY "Users can view their own agents" ON agents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workflows 
            WHERE workflows.workflow_id = agents.workflow_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create agents for their workflows" ON agents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workflows 
            WHERE workflows.workflow_id = agents.workflow_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own agents" ON agents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workflows 
            WHERE workflows.workflow_id = agents.workflow_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own agents" ON agents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workflows 
            WHERE workflows.workflow_id = agents.workflow_id 
            AND workflows.user_id = auth.uid()
        )
    );

-- Deployments table policies
CREATE POLICY "Users can view their own deployments" ON deployments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agents 
            JOIN workflows ON workflows.workflow_id = agents.workflow_id
            WHERE agents.agent_id = deployments.agent_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create deployments for their agents" ON deployments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents 
            JOIN workflows ON workflows.workflow_id = agents.workflow_id
            WHERE agents.agent_id = deployments.agent_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own deployments" ON deployments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM agents 
            JOIN workflows ON workflows.workflow_id = agents.workflow_id
            WHERE agents.agent_id = deployments.agent_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own deployments" ON deployments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM agents 
            JOIN workflows ON workflows.workflow_id = agents.workflow_id
            WHERE agents.agent_id = deployments.agent_id 
            AND workflows.user_id = auth.uid()
        )
    );

-- Logs table policies
CREATE POLICY "Users can view logs for their agents" ON logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agents 
            JOIN workflows ON workflows.workflow_id = agents.workflow_id
            WHERE agents.agent_id = logs.agent_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert logs for any agent" ON logs
    FOR INSERT WITH CHECK (true);

-- Subscription usage policies
CREATE POLICY "Users can view their own subscription usage" ON subscription_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription usage" ON subscription_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription usage" ON subscription_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Webhook events policies (mainly for system use and debugging)
CREATE POLICY "Users can view webhook events for their deployments" ON webhook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deployments
            JOIN agents ON agents.agent_id = deployments.agent_id
            JOIN workflows ON workflows.workflow_id = agents.workflow_id
            WHERE deployments.deployment_id = webhook_events.deployment_id 
            AND workflows.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert webhook events" ON webhook_events
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to check if user's subscription is active
CREATE OR REPLACE FUNCTION is_subscription_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    expires_at TIMESTAMPTZ;
    has_deployments BOOLEAN;
BEGIN
    -- Get subscription expiry date
    SELECT subscription_expires_at INTO expires_at
    FROM users WHERE user_id = user_uuid;
    
    -- Check if user has any deployments
    SELECT EXISTS(
        SELECT 1 FROM deployments d
        JOIN agents a ON a.agent_id = d.agent_id
        JOIN workflows w ON w.workflow_id = a.workflow_id
        WHERE w.user_id = user_uuid
    ) INTO has_deployments;
    
    -- If no deployments, no active subscription needed
    IF NOT has_deployments THEN
        RETURN TRUE;
    END IF;
    
    -- If subscription exists and hasn't expired, it's active
    RETURN expires_at IS NOT NULL AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend deployments when subscription expires
CREATE OR REPLACE FUNCTION suspend_expired_deployments()
RETURNS INTEGER AS $$
DECLARE
    suspended_count INTEGER := 0;
BEGIN
    -- Update deployments to suspended for expired subscriptions
    UPDATE deployments 
    SET status = 'suspended', stopped_at = NOW()
    WHERE status = 'deployed'
    AND agent_id IN (
        SELECT a.agent_id 
        FROM agents a
        JOIN workflows w ON w.workflow_id = a.workflow_id
        JOIN users u ON u.user_id = w.user_id
        WHERE u.subscription_expires_at IS NOT NULL 
        AND u.subscription_expires_at < NOW()
    );
    
    GET DIAGNOSTICS suspended_count = ROW_COUNT;
    RETURN suspended_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reactivate deployments when subscription is renewed
CREATE OR REPLACE FUNCTION reactivate_suspended_deployments(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    reactivated_count INTEGER := 0;
BEGIN
    -- Update suspended deployments back to deployed for renewed subscription
    UPDATE deployments 
    SET status = 'deployed', stopped_at = NULL
    WHERE status = 'suspended'
    AND agent_id IN (
        SELECT a.agent_id 
        FROM agents a
        JOIN workflows w ON w.workflow_id = a.workflow_id
        WHERE w.user_id = user_uuid
    );
    
    GET DIAGNOSTICS reactivated_count = ROW_COUNT;
    RETURN reactivated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Note: Uncomment the following if you want some sample data for testing

/*
-- Insert a sample user (this will use the actual auth.uid() when a real user signs up)
INSERT INTO users (user_id, email, name, subscription_plan) 
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID, 
    'demo@example.com', 
    'Demo User', 
    'free'
) ON CONFLICT (user_id) DO NOTHING;

-- Insert sample workflow
INSERT INTO workflows (workflow_id, user_id, name, description, spec) 
VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Customer Support Bot',
    'AI agent for handling customer support queries',
    '{"name": "Customer Support Bot", "description": "Helpful customer service assistant", "instructions": "You are a helpful customer service representative."}'::JSONB
) ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- FINAL NOTES
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_subscription_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION suspend_expired_deployments() TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_suspended_deployments(UUID) TO authenticated;

-- Create a scheduled job to check for expired subscriptions (run this separately if needed)
-- This would typically be set up as a cron job or scheduled function in Supabase
/*
SELECT cron.schedule(
    'suspend-expired-deployments',
    '0 * * * *', -- Run every hour
    'SELECT suspend_expired_deployments();'
);
*/

-- End of schema
SELECT 'KYNEX Database Schema Created Successfully!' as status;
