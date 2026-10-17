import { isAdmin } from "@/lib/admin";
import { json, preflight } from "@/lib/cors";
import { reloadSeedMoves } from "@/lib/seed";
import { db } from "@/lib/supabase";

export const OPTIONS = preflight;

// Reloads the starting playbook after seed-data.json changes, without touching calls or learned moves.
// (The full "Reset to seed" for the demo is /api/admin/reset.)
export async function POST(req: Request) {
  if (!isAdmin(req)) return json(req, { error: "Admin passcode required" }, 401);
  try {
    const counts = await reloadSeedMoves(db());
    return json(req, { ok: true, ...counts });
  } catch (e) {
    console.error("reseed failed", e);
    const detail = process.env.NODE_ENV !== "production" ? { detail: (e as { message?: string })?.message ?? String(e) } : {};
    return json(req, { error: "Reseed failed", ...detail }, 500);
  }
}
