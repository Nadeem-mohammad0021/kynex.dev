
-- Enable RLS for all tables
alter table "public"."users" enable row level security;
alter table "public"."workflows" enable row level security;
alter table "public"."deployments" enable row level security;

-- USERS table policies
-- Users can view their own profile.
create policy "Allow individual users to view their own profile"
on "public"."users" for select
using (auth.uid() = user_id);

-- Users can update their own profile.
create policy "Allow individual users to update their own profile"
on "public"."users" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- WORKFLOWS table policies
-- Users can view their own workflows.
create policy "Allow individual users to view their own workflows"
on "public"."workflows" for select
using (auth.uid() = user_id);

-- Users can create workflows for themselves.
create policy "Allow individual users to create their own workflows"
on "public"."workflows" for insert
with check (auth.uid() = user_id);

-- Users can update their own workflows.
create policy "Allow individual users to update their own workflows"
on "public"."workflows" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete their own workflows.
create policy "Allow individual users to delete their own workflows"
on "public"."workflows" for delete
using (auth.uid() = user_id);

-- DEPLOYMENTS table policies
-- Users can view their own deployments.
create policy "Allow individual users to view their own deployments"
on "public"."deployments" for select
using (auth.uid() = user_id);

-- Users can create deployments for themselves.
create policy "Allow individual users to create their own deployments"
on "public"."deployments" for insert
with check (auth.uid() = user_id);

-- Users can update their own deployments.
create policy "Allow individual users to update their own deployments"
on "public"."deployments" for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete their own deployments.
create policy "Allow individual users to delete their own deployments"
on "public"."deployments" for delete
using (auth.uid() = user_id);
