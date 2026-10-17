import { createClient } from "@supabase/supabase-js";

// Server-only. Uses the secret key, so never import this from a client component.
export function db() {
  // Accept the URL with or without the /rest/v1/ suffix the dashboard sometimes shows
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase keys are missing from .env.local");
  return createClient(url, key, { auth: { persistSession: false } });
}

export type Cue = {
  id: string;
  objection_type: string;
  buyer_type: string | null;
  cue_text: string;
  full_line: string | null;
  author_name: string;
  author_city: string | null;
  uses: number;
  wins: number;
  status: string;
  is_seed: boolean;
  created_at: string;
};
