-- Q update 2: failure detection and move sharing.
-- Paste into Supabase > SQL Editor > New query, then Run. Safe: it only adds things and deletes nothing,
-- and running it twice does no harm.

-- Failure detection: how often each move helped or hurt when Q showed it
alter table cues add column if not exists helped int not null default 0;
alter table cues add column if not exists hurt int not null default 0;

-- Sharing: a learned move is public (everyone, earns royalties) or private to the seller's company
alter table cues add column if not exists visibility text not null default 'public'; -- public | org
alter table cues add column if not exists org text; -- the company that owns a private move

-- One row per nudge Q showed on a call, with the verdict from the after-call review
create table if not exists nudge_reviews (
  id uuid primary key default gen_random_uuid(),
  call_id uuid references calls(id) on delete cascade,
  cue_id uuid references cues(id) on delete set null,
  nudge_text text not null,
  verdict text not null, -- helped | neutral | hurt
  reason text,
  created_at timestamptz default now()
);
create index if not exists nudge_reviews_cue on nudge_reviews (cue_id);
alter table nudge_reviews enable row level security;
