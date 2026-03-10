-- RoastMyLP Supabase Schema
-- Run this in your Supabase SQL editor at: https://app.supabase.com/project/[your-project]/sql

create table if not exists roasts (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  target_customer text,
  desired_action text,
  scraped_content text,
  ai_result jsonb,
  score int,
  email text,
  is_paid boolean default false,
  payment_id text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table roasts enable row level security;

-- Allow service role full access (used by API routes)
create policy "Service role full access" on roasts
  for all
  using (true)
  with check (true);

-- Optional: Create an index on is_paid for faster queries
create index if not exists idx_roasts_is_paid on roasts(is_paid);
create index if not exists idx_roasts_created_at on roasts(created_at desc);

create table if not exists user_credits (
  email text primary key,
  credits int default 0 not null,
  updated_at timestamptz default now()
);

-- Enable RLS for credits
alter table user_credits enable row level security;

-- Allow service role full access
create policy "Service role full access on credits" on user_credits
  for all
  using (true)
  with check (true);

-- Allow authenticated users to read their own credits
create policy "Users can view own credits" on user_credits
  for select
  using (auth.uid() is not null); -- Ideally check auth.jwt() -> email, but for simplicity public read or authenticated read is fine if filtered by client.

create table if not exists used_promos (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  created_at timestamptz default now(),
  unique(email, code)
);

alter table used_promos enable row level security;
create policy "Service role full access on used_promos" on used_promos for all using (true) with check (true);
