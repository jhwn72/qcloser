// Admin routes (reset, reseed) on the live site need the passcode in ADMIN_KEY, sent as the
// x-admin-key header. Locally in development they're open, for testing.
export function isAdmin(req: Request) {
  if (process.env.NODE_ENV !== "production") return true;
  const key = process.env.ADMIN_KEY;
  return !!key && req.headers.get("x-admin-key") === key;
}
