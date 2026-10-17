-- Q update 3: the call report. Run after migration-2.
-- Paste into Supabase > SQL Editor > New query, then Run. Safe: it only adds a column, and running it twice does no harm.

-- The after-call review, kept with the call for its report page: turning point, lesson, and every nudge Q
-- showed with where it appeared and its verdict (helped | neutral | hurt)
alter table calls add column if not exists review jsonb;
