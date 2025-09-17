-- Enhanced Agent System Migration
-- Adds support for agents, enhanced deployments, subscription tracking, and performance metrics

-- Create agents table (separate from workflows for better organization)
CREATE TABLE IF NOT EXISTS agents (
    agent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    platform TEXT NOT NULL, -- 'Website Widget', 'API Webhook', 'WhatsApp', 'Telegram', 'X (Twitter)', 'Instagram'
    status TEXT DEFAULT 'draft', -- 'draft', 'deploying', 'active', 'inactive', 'error'
    credentials JSONB, -- Store platform-specific credentials securely
    configuration JSONB, -- Agent-specific configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update deployments table to reference agents instead of workflows directly
ALTER TABLE deployments ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE;
ALTER TABLE deployments ADD COLUMN IF NOT EXISTS deployment_config JSONB; -- Store deployment-specific configuration
ALTER TABLE deployments ALTER COLUMN workflow_id DROP NOT NULL; -- Make optional since we now have agent_id

-- Create user_subscriptions table for trial and subscription tracking
CREATE TABLE IF NOT EXISTS user_subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'pro', 'enterprise'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'canceled'
    trial_start_date TIMESTAMPTZ DEFAULT NOW(),
    trial_end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    limits JSONB DEFAULT '{"agents": 999, "deployments": 999}', -- Usage limits during trial
    stripe_customer_id TEXT, -- For Stripe integration
    stripe_subscription_id TEXT, -- For Stripe integration
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create agent_performance_metrics table for real-time tracking
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'response_time', 'success_rate', 'conversation_count', 'user_satisfaction'
    value NUMERIC NOT NULL,
    metadata JSONB, -- Additional metric data
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create agent_conversations table for tracking interactions
CREATE TABLE IF NOT EXISTS agent_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
    external_user_id TEXT, -- ID from the external platform (WhatsApp, Telegram, etc.)
    platform TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'ended', 'escalated'
    message_count INTEGER DEFAULT 0,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    metadata JSONB, -- Platform-specific data
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_messages table for message tracking
CREATE TABLE IF NOT EXISTS agent_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES agent_conversations(conversation_id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(agent_id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'user', 'agent'
    content TEXT NOT NULL,
    response_time_ms INTEGER, -- Response time for agent messages
    metadata JSONB, -- Message-specific data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create usage_analytics table for tracking usage patterns
CREATE TABLE IF NOT EXISTS usage_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'agent_created', 'deployment_created', 'message_sent', 'conversation_started'
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_deployments_agent_id ON deployments(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_agent_id ON agent_performance_metrics(agent_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON agent_performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON agent_conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON usage_analytics(created_at);

-- Create updated_at triggers for all new tables
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_agents_timestamp
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_user_subscriptions_timestamp
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security on all new tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents
CREATE POLICY "Users can manage their own agents"
    ON agents FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions"
    ON user_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update subscriptions"
    ON user_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for agent_performance_metrics
CREATE POLICY "Users can view metrics for their agents"
    ON agent_performance_metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM agents 
            WHERE agents.agent_id = agent_performance_metrics.agent_id 
            AND agents.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert performance metrics"
    ON agent_performance_metrics FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents 
            WHERE agents.agent_id = agent_performance_metrics.agent_id 
            AND agents.user_id = auth.uid()
        )
    );

-- RLS Policies for agent_conversations
CREATE POLICY "Users can view conversations for their agents"
    ON agent_conversations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM agents 
            WHERE agents.agent_id = agent_conversations.agent_id 
            AND agents.user_id = auth.uid()
        )
    );

-- RLS Policies for agent_messages
CREATE POLICY "Users can view messages for their agents"
    ON agent_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM agents 
            WHERE agents.agent_id = agent_messages.agent_id 
            AND agents.user_id = auth.uid()
        )
    );

-- RLS Policies for usage_analytics
CREATE POLICY "Users can view their own analytics"
    ON usage_analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage analytics"
    ON usage_analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create trial subscription for new users
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'trial', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create trial subscription on user signup
CREATE TRIGGER on_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_trial_subscription();

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION check_user_subscription_status(user_uuid UUID)
RETURNS TABLE(
    plan_type TEXT,
    status TEXT,
    days_remaining INTEGER,
    is_trial_active BOOLEAN,
    agents_created BIGINT,
    deployments_created BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.plan_type,
        us.status,
        CASE 
            WHEN us.plan_type = 'trial' AND us.status = 'active' 
            THEN GREATEST(0, EXTRACT(days FROM (us.trial_end_date - NOW()))::INTEGER)
            ELSE 0
        END as days_remaining,
        (us.plan_type = 'trial' AND us.status = 'active' AND us.trial_end_date > NOW()) as is_trial_active,
        (SELECT COUNT(*) FROM agents WHERE agents.user_id = user_uuid) as agents_created,
        (SELECT COUNT(*) FROM deployments WHERE deployments.user_id = user_uuid) as deployments_created
    FROM user_subscriptions us
    WHERE us.user_id = user_uuid
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log usage events
CREATE OR REPLACE FUNCTION log_usage_event(
    user_uuid UUID,
    agent_uuid UUID DEFAULT NULL,
    event_type_param TEXT,
    event_data_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    analytics_uuid UUID;
BEGIN
    INSERT INTO usage_analytics (user_id, agent_id, event_type, event_data)
    VALUES (user_uuid, agent_uuid, event_type_param, event_data_param)
    RETURNING analytics_id INTO analytics_uuid;
    
    RETURN analytics_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for agent performance dashboard
CREATE OR REPLACE VIEW agent_performance_dashboard AS
SELECT 
    a.agent_id,
    a.name as agent_name,
    a.platform,
    a.status,
    COUNT(DISTINCT ac.conversation_id) as total_conversations,
    COUNT(DISTINCT CASE WHEN ac.status = 'active' THEN ac.conversation_id END) as active_conversations,
    COUNT(am.message_id) as total_messages,
    AVG(am.response_time_ms) as avg_response_time_ms,
    AVG(ac.satisfaction_score) as avg_satisfaction_score,
    MAX(ac.last_activity_at) as last_activity_at
FROM agents a
LEFT JOIN agent_conversations ac ON a.agent_id = ac.agent_id
LEFT JOIN agent_messages am ON ac.conversation_id = am.conversation_id AND am.sender_type = 'agent'
GROUP BY a.agent_id, a.name, a.platform, a.status;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert sample data for testing (optional, can be removed in production)
-- This will help with development and testing
COMMENT ON TABLE agents IS 'Stores AI agents created by users';
COMMENT ON TABLE user_subscriptions IS 'Tracks user subscription status and trial periods';
COMMENT ON TABLE agent_performance_metrics IS 'Real-time performance metrics for agents';
COMMENT ON TABLE agent_conversations IS 'Tracks conversations between agents and users';
COMMENT ON TABLE agent_messages IS 'Individual messages within conversations';
COMMENT ON TABLE usage_analytics IS 'Tracks user behavior and feature usage';
