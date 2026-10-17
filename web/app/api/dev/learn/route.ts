import { extractWinningMoves, type Turn } from "@/lib/claude";
import seed from "@/lib/seed-data.json";

// Development only: runs end-of-call learning on a won call without saving anything, and applies the
// same skip rules as /api/learn (over 6 words, or already in the playbook). Used by scripts/compare-learn.py.
const MAX_MOVE_WORDS = 6;
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const { turns } = (await req.json()) as { turns?: Turn[] };
  const known = (seed.cues as { cue_text: string; status?: string }[])
    .filter((c) => c.status !== "retired")
    .map((c) => c.cue_text);
  const knownNorm = new Set(known.map(norm));
  const started = Date.now();
  const moves = await extractWinningMoves(turns ?? [], known);
  return Response.json({
    ms: Date.now() - started,
    moves: moves.map((m) => {
      const text = m.move.replace(/["“”]/g, "").trim();
      const skip = text.split(/\s+/).length > MAX_MOVE_WORDS ? "too long" : knownNorm.has(norm(text)) ? "already in playbook" : "";
      return { ...m, skip };
    }),
  });
}
