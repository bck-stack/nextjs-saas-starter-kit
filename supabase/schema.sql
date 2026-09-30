-- Subscriptions: one row per user, written only by the server (Stripe webhook, service role).
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users (id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id     text,
  status                 text not null default 'inactive',
  price_id               text,
  cancel_at_period_end   boolean not null default false,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Users can read their own subscription. There are intentionally NO insert/update/delete
-- policies: only the service-role key (which bypasses RLS) may change billing data.
drop policy if exists "Users see own subscription" on public.subscriptions;
create policy "Users see own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
