-- EverBloom Supabase Schema (MVP)
-- Run this in Supabase SQL editor

create extension if not exists pgcrypto; -- for gen_random_uuid

-- Profiles (mirror of auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Couples and membership
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  pairing_code text unique,
  created_at timestamptz default now()
);

create table if not exists public.couple_members (
  couple_id uuid references public.couples(id) on delete cascade,
  user_id uuid references public.profiles(user_id) on delete cascade,
  created_at timestamptz default now(),
  primary key (couple_id, user_id)
);

-- Helper function: is user in couple
create or replace function public.is_couple_member(cpl uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists(
    select 1 from public.couple_members
    where couple_id = cpl and user_id = auth.uid()
  );
$$;

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
create index if not exists chat_messages_couple_idx on public.chat_messages (couple_id, created_at);

-- WebRTC signaling
create table if not exists public.rtc_signals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  from_user_id uuid not null references public.profiles(user_id) on delete cascade,
  type text not null check (type in ('offer','answer','ice')),
  payload jsonb not null,
  created_at timestamptz default now()
);
create index if not exists rtc_signals_couple_idx on public.rtc_signals (couple_id, created_at);

-- Games (TicTacToe)
create table if not exists public.games_tictactoe_matches (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  state jsonb not null default '{"board":["","","","","","","","",""],"xIsNext":true}'::jsonb,
  status text not null default 'ongoing' check (status in ('ongoing','x_won','o_won','draw')),
  created_at timestamptz default now()
);
create index if not exists ttt_couple_idx on public.games_tictactoe_matches (couple_id, created_at);

-- Shared calendar events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  event_date date not null,
  note text,
  created_at timestamptz default now()
);
create index if not exists events_couple_date_idx on public.events (couple_id, event_date);

-- Diary entries
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);
create index if not exists diary_couple_idx on public.diary_entries (couple_id, created_at);

-- Surprise vault / timed letters
create table if not exists public.surprises (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  title text,
  body text not null,
  release_at timestamptz not null,
  is_delivered boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists surprises_release_idx on public.surprises (couple_id, release_at, is_delivered);

-- Ads inventory (house ads)
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  position text not null check (position in ('banner','interstitial')),
  title text,
  body text,
  image_url text,
  link_url text,
  weight int not null default 1,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Subscriptions / entitlements
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  couple_id uuid references public.couples(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz
);
create index if not exists subs_user_idx on public.subscriptions (user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.rtc_signals enable row level security;
alter table public.games_tictactoe_matches enable row level security;
alter table public.events enable row level security;
alter table public.diary_entries enable row level security;
alter table public.surprises enable row level security;
alter table public.ads enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles: user can read own profile and update own
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = user_id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = user_id);
create policy "Profiles insert for self" on public.profiles
  for insert with check (auth.uid() = user_id);

-- Couples: only members can select, insert allowed to anyone to create new couple
create policy "Couples viewable to members" on public.couples
  for select using (public.is_couple_member(id));
create policy "Couples insert allowed" on public.couples for insert with check (true);

-- Couple members: members can select; anyone can insert membership for self
create policy "Couple membership viewable to members" on public.couple_members
  for select using (public.is_couple_member(couple_id));
create policy "Join couple for self" on public.couple_members
  for insert with check (auth.uid() = user_id);

-- Chat messages: only members; sender must be self
create policy "Chat selectable by members" on public.chat_messages
  for select using (public.is_couple_member(couple_id));
create policy "Chat insert by sender" on public.chat_messages
  for insert with check (auth.uid() = sender_id and public.is_couple_member(couple_id));

-- RTC signals
create policy "RTC selectable by members" on public.rtc_signals
  for select using (public.is_couple_member(couple_id));
create policy "RTC insert by sender" on public.rtc_signals
  for insert with check (auth.uid() = from_user_id and public.is_couple_member(couple_id));

-- Games
create policy "TTT selectable by members" on public.games_tictactoe_matches
  for select using (public.is_couple_member(couple_id));
create policy "TTT insert by members" on public.games_tictactoe_matches
  for insert with check (public.is_couple_member(couple_id));
create policy "TTT update by members" on public.games_tictactoe_matches
  for update using (public.is_couple_member(couple_id));

-- Events
create policy "Events selectable by members" on public.events
  for select using (public.is_couple_member(couple_id));
create policy "Events insert by members" on public.events
  for insert with check (public.is_couple_member(couple_id));
create policy "Events update by members" on public.events
  for update using (public.is_couple_member(couple_id));

-- Diary
create policy "Diary selectable by members" on public.diary_entries
  for select using (public.is_couple_member(couple_id));
create policy "Diary insert by members" on public.diary_entries
  for insert with check (auth.uid() = author_id and public.is_couple_member(couple_id));

-- Surprises
create policy "Surprises selectable by members" on public.surprises
  for select using (public.is_couple_member(couple_id));
create policy "Surprises insert by members" on public.surprises
  for insert with check (auth.uid() = author_id and public.is_couple_member(couple_id));
create policy "Surprises update by author" on public.surprises
  for update using (auth.uid() = author_id and public.is_couple_member(couple_id));

-- Ads: everyone can select, only service role inserts/updates typically
create policy "Ads publicly readable" on public.ads
  for select using (true);

-- Subscriptions: readable by owner, updatable by service role (webhook uses service key)
create policy "Subs readable by owner" on public.subscriptions
  for select using (auth.uid() = user_id);
