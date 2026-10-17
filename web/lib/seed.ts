import type { SupabaseClient } from "@supabase/supabase-js";
import seed from "./seed-data.json";

type SeedCue = (typeof seed.cues)[number] & { buyer_type?: string; full_line?: string; author_city?: string; status?: string };

const ago = (days: number) => new Date(Date.now() - days * 864e5).toISOString();
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

// The starting playbook and its insights, as database rows.
function seedRows() {
  const cues = (seed.cues as SeedCue[]).map(({ days, ...c }) => ({
    ...c,
    status: c.status ?? "active",
    is_seed: true,
    created_at: ago(days),
  }));
  const insights = seed.insights.map(({ days, ...i }) => ({ ...i, is_seed: true, created_at: ago(days) }));
  return { cues, insights };
}

async function insertRows(db: SupabaseClient, cues: object[], insights: object[]) {
  const a = await db.from("cues").insert(cues);
  if (a.error) throw a.error;
  const b = await db.from("insights").insert(insights);
  if (b.error) throw b.error;
}

// Wipes calls, learned moves and insights, then loads the starting playbook.
// Used by the admin "Reset to seed" button and the setup script.
export async function resetToSeed(db: SupabaseClient) {
  for (const table of ["insights", "calls", "cues"]) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw error;
  }
  const { cues, insights } = seedRows();
  await insertRows(db, cues, insights);
  return { cues: cues.length, insights: insights.length };
}

// Reloads only the starting playbook after seed-data.json changes: replaces the seed moves and seed insights,
// and keeps calls and everything learned on real calls. A seed move whose text matches a learned move is
// skipped, so the same move never shows up twice. Seed moves restart from their seed uses and wins.
export async function reloadSeedMoves(db: SupabaseClient) {
  for (const table of ["cues", "insights"]) {
    const { error } = await db.from(table).delete().eq("is_seed", true);
    if (error) throw error;
  }
  const { data: learned, error } = await db.from("cues").select("cue_text").eq("is_seed", false);
  if (error) throw error;
  const taken = new Set((learned ?? []).map((c: { cue_text: string }) => norm(c.cue_text)));
  const rows = seedRows();
  const cues = rows.cues.filter((c) => !taken.has(norm(c.cue_text)));
  await insertRows(db, cues, rows.insights);
  return { cues: cues.length, insights: rows.insights.length, skipped: rows.cues.length - cues.length };
}
