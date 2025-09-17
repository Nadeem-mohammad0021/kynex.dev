-- Create Deployments Table
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'Website Widget', 'API Webhook', 'WhatsApp', 'Telegram', 'X', 'Instagram'
    status TEXT DEFAULT 'draft', -- 'draft', 'deployed', 'error'
    credentials JSONB, -- Store platform-specific credentials securely
    webhook_url TEXT, -- For API webhook deployments
    embed_code TEXT, -- For website widget deployments
    performance_metrics JSONB, -- Store real-time performance data
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add triggers to update the updated_at column on deployments table
CREATE TRIGGER set_deployments_timestamp
BEFORE UPDATE ON deployments
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Deployments table
CREATE POLICY "Users can manage their own deployments"
ON deployments FOR ALL
USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'))
WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'));