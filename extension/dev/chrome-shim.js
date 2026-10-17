// Dev only: stands in for Chrome's extension features so the card and popup can be previewed in a normal tab.
// Not part of the extension (nothing in manifest.json loads it).
(() => {
  const BACKEND = "http://localhost:3000";
  const listeners = [];
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem("q-ext") || "{}");
    } catch {
      return {};
    }
  };
  const write = (o) => {
    try {
      localStorage.setItem("q-ext", JSON.stringify(o));
    } catch {}
  };
  window.chrome = {
    runtime: {
      id: "dev-preview",
      getURL: (p) => new URL("../" + p, location.href).href,
      sendMessage(msg, cb) {
        fetch(BACKEND + msg.path, {
          method: msg.method || "GET",
          headers: { "Content-Type": "application/json" },
          body: msg.body ? JSON.stringify(msg.body) : undefined,
        })
          .then(async (r) => cb({ ok: r.ok, status: r.status, data: await r.json().catch(() => null) }))
          .catch((e) => cb({ ok: false, error: String(e) }));
      },
    },
    storage: {
      local: {
        async get(keys) {
          const all = read();
          const out = {};
          for (const k of [].concat(keys)) if (k in all) out[k] = all[k];
          return out;
        },
        async set(obj) {
          const all = read();
          const changes = {};
          for (const [k, v] of Object.entries(obj)) {
            changes[k] = { oldValue: all[k], newValue: v };
            all[k] = v;
          }
          write(all);
          listeners.forEach((l) => l(changes, "local"));
        },
      },
      onChanged: { addListener: (fn) => listeners.push(fn) },
    },
    tabs: { create: ({ url }) => window.open(url, "_blank") },
  };
})();
