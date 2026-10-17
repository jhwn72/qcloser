// The extension calls these routes from meet.google.com and from its own pages,
// so every API response allows those origins.
function allowed(origin: string | null) {
  if (!origin) return null;
  if (origin.startsWith("chrome-extension://")) return origin;
  if (origin === "https://meet.google.com") return origin;
  if (origin.startsWith("http://localhost")) return origin;
  return null;
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = allowed(req.headers.get("origin"));
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
  };
}

export function json(req: Request, body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders(req) });
}

export function preflight(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}
