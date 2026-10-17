// Talks to Q's backend for the card on Meet, so Meet's own security rules can't block the requests.
importScripts("config.js");

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "api") return;
  fetch(self.Q_CONFIG.BACKEND_URL + msg.path, {
    method: msg.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: msg.body ? JSON.stringify(msg.body) : undefined,
  })
    .then(async (r) => sendResponse({ ok: r.ok, status: r.status, data: await r.json().catch(() => null) }))
    .catch((e) => sendResponse({ ok: false, error: String(e) }));
  return true; // keeps the channel open for the async reply
});
