
-- Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Workflows Table
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    spec JSONB,
    status TEXT DEFAULT 'draft',
    version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update the updated_at column on users table
CREATE TRIGGER set_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Add triggers to update the updated_at column on workflows table
CREATE TRIGGER set_workflows_timestamp
BEFORE UPDATE ON workflows
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;


-- RLS Policies for Users table
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (clerk_id = auth.jwt()->>'sub');

-- RLS Policies for Workflows table
CREATE POLICY "Users can manage their own workflows"
ON workflows FOR ALL
USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'))
WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'));

