
-- workflows table
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text,
  description text,
  spec jsonb,
  status text, -- e.g., 'Draft', 'Active'
  version text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- deployments table
create table if not exists deployments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  workflow_id uuid references workflows(id) on delete cascade,
  name text not null,
  platform text not null, -- 'Website Widget', 'API Webhook', 'WhatsApp', 'Telegram', 'X', 'Instagram'
  status text default 'draft', -- 'draft', 'deployed', 'error'
  credentials jsonb, -- Store platform-specific credentials securely
  webhook_url text, -- For API webhook deployments
  embed_code text, -- For website widget deployments
  performance_metrics jsonb, -- Store real-time performance data
  deployed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- users table to sync with Clerk
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- Function to get the current user's ID from Clerk JWT
create or replace function auth.get_clerk_user_id()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::text;
$$;

-- RLS policy for workflows
alter table workflows enable row level security;

drop policy if exists "Users can view and manage their own workflows." on workflows;
create policy "Users can view and manage their own workflows." on workflows
  for all
  using (auth.uid() = user_id);

-- RLS policy for deployments
alter table deployments enable row level security;

drop policy if exists "Users can view and manage their own deployments." on deployments;
create policy "Users can view and manage their own deployments." on deployments
  for all
  using (auth.uid() = user_id);

-- RLS policy for users table
alter table users enable row level security;

drop policy if exists "Users can view their own user data." on users;
create policy "Users can view their own user data." on users
  for select
  using (auth.get_clerk_user_id() = clerk_id);

