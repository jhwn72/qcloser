import { json, preflight } from "@/lib/cors";
import { db } from "@/lib/supabase";

export const OPTIONS = preflight;

// Polled by every Q card every few seconds: moves and insights learned since the last check,
// so cards can show "New move learned from Maya". Times come from the server to avoid clock drift.
export async function GET(req: Request) {
  const since = new URL(req.url).searchParams.get("since");
  const now = new Date().toISOString();
  if (!since || Number.isNaN(Date.parse(since))) return json(req, { now, cues: [], insights: [] });

  const supabase = db();
  const [cues, insights] = await Promise.all([
    supabase
      .from("cues")
      .select("id, cue_text, objection_type, author_name, author_city, created_at")
      .eq("is_seed", false)
      .gt("created_at", since)
      .order("created_at", { ascending: true }),
    supabase
      .from("insights")
      .select("id, text, author_name, created_at")
      .gt("created_at", since)
      .order("created_at", { ascending: true }),
  ]);
  if (cues.error || insights.error) return json(req, { error: "Database lookup failed" }, 502);

  // Next check starts from the newest item seen (or now), so nothing is missed or repeated.
  const latest = [...(cues.data ?? []), ...(insights.data ?? [])].map((r) => r.created_at).sort().pop();
  return json(req, { now: latest ?? now, cues: cues.data ?? [], insights: insights.data ?? [] });
}
