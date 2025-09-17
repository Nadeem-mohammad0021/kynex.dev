
-- Step 1: Add user_id columns if they don't exist. This ensures workflows and deployments
-- can be tied to the user who created them.
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.deployments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS workflow_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE public.deployments ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(workflow_id) ON DELETE CASCADE;


-- Step 2: Enable Row-Level Security on the necessary tables.
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Step 3: Remove any old, incorrect policies to start clean.
DROP POLICY IF EXISTS "Allow individual read access" ON public.workflows;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.workflows;
DROP POLICY IF EXISTS "Allow individual update access" ON public.workflows;
DROP POLICY IF EXISTS "Allow individual delete access" ON public.workflows;

DROP POLICY IF EXISTS "Allow individual read access" ON public.deployments;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.deployments;
DROP POLICY IF EXISTS "Allow individual update access" ON public.deployments;
DROP POLICY IF EXISTS "Allow individual delete access" ON public.deployments;

-- Step 4: Create the correct RLS policies for `workflows`.
-- This ensures users can only manage their own workflows.
CREATE POLICY "Allow individual read access" ON public.workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual insert access" ON public.workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow individual update access" ON public.workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow individual delete access" ON public.workflows FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Create the correct RLS policies for `deployments`.
-- This ensures users can only manage their own deployments.
CREATE POLICY "Allow individual read access" ON public.deployments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual insert access" ON public.deployments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow individual update access" ON public.deployments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow individual delete access" ON public.deployments FOR DELETE USING (auth.uid() = user_id);
