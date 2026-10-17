import { isAdmin } from "@/lib/admin";
import { json, preflight } from "@/lib/cors";
import { resetToSeed } from "@/lib/seed";
import { db } from "@/lib/supabase";

export const OPTIONS = preflight;

// "Reset to seed" for re-recording the demo: clears calls and learned moves, reloads the starting playbook.
export async function POST(req: Request) {
  if (!isAdmin(req)) return json(req, { error: "Admin passcode required" }, 401);
  try {
    const counts = await resetToSeed(db());
    return json(req, { ok: true, ...counts });
  } catch (e) {
    console.error("reset failed", e);
    return json(req, { error: "Reset failed" }, 500);
  }
}
