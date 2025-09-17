-- Create conversations table for maintaining context across messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  agent_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT conversations_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES agents(agent_id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_compound ON conversations(conversation_id, agent_id, created_at DESC);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_conversations_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own agent's conversations
CREATE OR REPLACE POLICY "Users can access conversations for their agents" ON conversations
    FOR ALL
    USING (
        agent_id IN (
            SELECT a.agent_id 
            FROM agents a
            JOIN workflows w ON a.workflow_id = w.workflow_id
            WHERE w.user_id = auth.uid()
        )
    );

-- Create a function to clean up old conversation messages (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_conversations(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM conversations 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE conversations IS 'Stores conversation messages for AI agents to maintain context across interactions';
COMMENT ON COLUMN conversations.conversation_id IS 'Unique identifier for a conversation session (format: deploymentId_userId_platform)';
COMMENT ON COLUMN conversations.agent_id IS 'Reference to the agent handling this conversation';
COMMENT ON COLUMN conversations.role IS 'Message role: system, user, or assistant';
COMMENT ON COLUMN conversations.content IS 'The actual message content';
COMMENT ON FUNCTION cleanup_old_conversations(INTEGER) IS 'Utility function to remove old conversation messages for storage optimization';
