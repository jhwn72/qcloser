"use client";

import { useState } from "react";

// Demo control: wipe calls and learned moves, reload the starting playbook.
export default function AdminPage() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [counts, setCounts] = useState<{ cues: number; insights: number } | null>(null);

  async function reset() {
    if (!window.confirm("Reset Q to the starting playbook? This deletes every call and every learned move.")) return;
    setState("busy");
    try {
      const r = await fetch("/api/admin/reset", { method: "POST" });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error();
      setCounts({ cues: d.cues, insights: d.insights });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="tg-title">Admin</h1>
      <p className="tg-body" style={{ margin: 0 }}>
        Puts Q back to the starting playbook, for re-recording the demo. Deletes every call and every move Q
        learned from them.
      </p>
      <div>
        <button className="tg-btn primary" onClick={reset} disabled={state === "busy"}>
          {state === "busy" ? "Resetting…" : "Reset to seed"}
        </button>
      </div>
      {state === "done" && counts && (
        <p className="tg-fine" style={{ fontSize: 13 }}>
          Done. Loaded {counts.cues} moves and {counts.insights} insights.
        </p>
      )}
      {state === "error" && (
        <p className="tg-fine" style={{ fontSize: 13 }}>
          Reset failed. Check the server.
        </p>
      )}
    </main>
  );
}
