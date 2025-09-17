-- Enable Row-Level Security on the deployments table
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to ensure a clean slate
DROP POLICY IF EXISTS "Allow individual read access on deployments" ON public.deployments;
DROP POLICY IF EXISTS "Allow individual insert access on deployments" ON public.deployments;
DROP POLICY IF EXISTS "Allow individual update access on deployments" ON public.deployments;
DROP POLICY IF EXISTS "Allow individual delete access on deployments" ON public.deployments;

-- Policy: Allow users to read their own deployments
-- This policy allows a user to SELECT rows from the deployments table
-- where the user_id column matches their own authenticated user ID.
CREATE POLICY "Allow individual read access on deployments"
ON public.deployments
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to create their own deployments
-- This policy allows a user to INSERT new rows into the deployments table,
-- automatically setting the user_id to their own authenticated user ID.
CREATE POLICY "Allow individual insert access on deployments"
ON public.deployments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own deployments
-- This policy allows a user to UPDATE rows in the deployments table
-- where the user_id column matches their own authenticated user ID.
CREATE POLICY "Allow individual update access on deployments"
ON public.deployments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own deployments
-- This policy allows a user to DELETE rows from the deployments table
-- where the user_id column matches their own authenticated user ID.
CREATE POLICY "Allow individual delete access on deployments"
ON public.deployments
FOR DELETE
USING (auth.uid() = user_id);
