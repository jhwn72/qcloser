import type { SupabaseClient } from "@supabase/supabase-js";
import seed from "./seed-data.json";

type SeedCue = (typeof seed.cues)[number] & { buyer_type?: string; full_line?: string; author_city?: string; status?: string };

const ago = (days: number) => new Date(Date.now() - days * 864e5).toISOString();

// Wipes calls, learned moves and insights, then loads the starting playbook.
// Used by the admin "Reset to seed" button and the setup script.
export async function resetToSeed(db: SupabaseClient) {
  for (const table of ["insights", "calls", "cues"]) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw error;
  }
  const cues = (seed.cues as SeedCue[]).map(({ days, ...c }) => ({
    ...c,
    status: c.status ?? "active",
    is_seed: true,
    created_at: ago(days),
  }));
  const insights = seed.insights.map(({ days, ...i }) => ({ ...i, is_seed: true, created_at: ago(days) }));
  const a = await db.from("cues").insert(cues);
  if (a.error) throw a.error;
  const b = await db.from("insights").insert(insights);
  if (b.error) throw b.error;
  return { cues: cues.length, insights: insights.length };
}
