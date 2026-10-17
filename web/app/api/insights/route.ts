import { json, preflight } from "@/lib/cors";
import { db } from "@/lib/supabase";

export const OPTIONS = preflight;

// The latest lessons Q has learned, for the "What Q learned" feed.
export async function GET(req: Request) {
  const { data, error } = await db()
    .from("insights")
    .select("id, text, author_name, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) return json(req, { error: "Database lookup failed" }, 502);
  return json(req, { insights: data });
}
