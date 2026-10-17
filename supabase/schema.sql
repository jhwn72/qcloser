-- Q: tables.
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run.
-- Running it again wipes everything Q has learned. To reset between demo takes, use /admin instead.
-- The starting playbook lives in web/lib/seed-data.json and is loaded by /admin "Reset to seed".

drop table if exists insights;
drop table if exists calls;
drop table if exists cues;

-- A cue is a move from the playbook: a nudge on where to steer, never a script.
create table cues (
  id uuid primary key default gen_random_uuid(),
  objection_type text not null,  -- the moment type; the full list (36) is in web/lib/moments.ts
  buyer_type text,               -- skeptical | rushed | price_focused | curious
  cue_text text not null,        -- the move as a nudge, five words max
  full_line text,                -- how the seller actually said it
  author_name text not null,
  author_city text,
  uses int not null default 0,
  wins int not null default 0,
  status text not null default 'active',  -- active | retired
  is_seed boolean not null default false,
  seed_uses int,                 -- unused; kept so older setups still match
  seed_wins int,
  seed_status text,
  created_at timestamptz default now()
);

create table calls (
  id uuid primary key default gen_random_uuid(),
  user_name text,
  user_city text,
  outcome text,
  transcript jsonb,
  created_at timestamptz default now()
);

create table insights (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author_name text,
  source_call uuid references calls(id) on delete set null,
  is_seed boolean not null default false,
  created_at timestamptz default now()
);

create index cues_lookup on cues (objection_type, status);
create index cues_created on cues (created_at);
create index insights_created on insights (created_at);

-- Only the server (with the secret key) can read or write. Nobody else can.
alter table cues enable row level security;
alter table calls enable row level security;
alter table insights enable row level security;
