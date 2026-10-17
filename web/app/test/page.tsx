"use client";

import { useState, useSyncExternalStore } from "react";
import { momentLabel } from "@/lib/moments";

type CueResponse = {
  cue: { cue_text: string; move: string; author_name: string; author_city: string | null } | null;
  buyer_type?: string | null;
  objection_type?: string;
  ms?: number;
  error?: string;
};

const label = (s?: string | null) => (s ? s.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()) : "");

// The company profile is filled in once and remembered in this browser (in memory if storage is blocked).
let profileMemory = "";
function readProfile() {
  try {
    return localStorage.getItem("q-profile") ?? profileMemory;
  } catch {
    return profileMemory;
  }
}
function saveProfile(v: string) {
  profileMemory = v;
  try {
    localStorage.setItem("q-profile", v);
  } catch {}
  window.dispatchEvent(new Event("q-profile"));
}
function onProfileChange(cb: () => void) {
  window.addEventListener("q-profile", cb);
  return () => window.removeEventListener("q-profile", cb);
}

// A quick way to try /api/cue without the extension: type what the buyer says.
export default function TestPage() {
  const profile = useSyncExternalStore(onProfileChange, readProfile, () => "");
  const [brief, setBrief] = useState("");
  const [pitch, setPitch] = useState("Hi! Thanks for hopping on. I wanted to show you this pen.");
  const [line, setLine] = useState("I don't need a pen.");
  const [minutes, setMinutes] = useState(2);
  const [res, setRes] = useState<CueResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  async function send() {
    setBusy(true);
    const t0 = performance.now();
    try {
      const r = await fetch("/api/cue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turns: [
            { speaker: "You", text: pitch },
            { speaker: "Buyer", text: line },
          ],
          stats: { elapsed_s: minutes * 60 },
          brief,
          profile,
        }),
      });
      setRes(await r.json());
    } catch {
      setRes({ cue: null, error: "Couldn't reach the server" });
    }
    setElapsed(Math.round(performance.now() - t0));
    setBusy(false);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="tg-title">Test a buyer line</h1>
      <label className="flex flex-col gap-2">
        <span className="tg-label" style={{ margin: 0 }}>Company profile (saved, used on every call)</span>
        <textarea
          className="tg-input"
          rows={3}
          placeholder="Company name, what you sell, prices, standard offers, ideal customer, anything Q should never suggest…"
          value={profile}
          onChange={(e) => saveProfile(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="tg-label" style={{ margin: 0 }}>Brief for this call (optional)</span>
        <textarea
          className="tg-input"
          rows={3}
          placeholder="Who the buyer is, what they care about, anything special about this call…"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="tg-label" style={{ margin: 0 }}>What you said (your pitch so far)</span>
        <textarea className="tg-input" rows={3} value={pitch} onChange={(e) => setPitch(e.target.value)} />
      </label>
      <span className="tg-label" style={{ margin: "0 0 -16px" }}>What the buyer says</span>
      <div className="flex gap-2">
        <input
          className="tg-input flex-1"
          value={line}
          onChange={(e) => setLine(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="tg-btn primary whitespace-nowrap" onClick={send} disabled={busy}>
          {busy ? "…" : "Get cue"}
        </button>
      </div>
      <label className="tg-row" style={{ margin: 0 }}>
        <span>Minutes into the call</span>
        <input
          className="tg-input"
          style={{ width: 80, textAlign: "center", padding: "6px 10px" }}
          type="number"
          min={0}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value) || 0)}
        />
      </label>

      {res && (
        <div className="q-card">
          {res.error ? (
            <div className="tg-body" style={{ margin: 0 }}>{res.error}</div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="tg-dot small" />
                <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>
                  {elapsed} ms
                </span>
                {res.buyer_type && (
                  <span className="tg-chip on ml-auto" style={{ cursor: "default" }}>
                    {label(res.buyer_type)} buyer
                  </span>
                )}
              </div>
              <div className="q-cue mt-5">{res.cue ? res.cue.cue_text : "Listening…"}</div>
              {res.cue && (
                <div className="tg-fine mt-2">
                  Learned from{" "}
                  <span style={{ color: "var(--tg-muted)" }}>
                    {res.cue.author_name}
                    {res.cue.author_city ? ` · ${res.cue.author_city}` : ""}
                  </span>
                </div>
              )}
              {res.cue && (
                <div className="tg-fine mt-4" style={{ borderTop: "1px solid var(--tg-line)", paddingTop: 12 }}>
                  {momentLabel(res.objection_type)} · Move: {res.cue.move}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
