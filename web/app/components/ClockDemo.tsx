"use client";

import { useEffect, useState } from "react";
import QMark from "./QMark";

// A slow loop through a call planned for 15 minutes: the clock fills, the nudge turns toward the close,
// and when the buyer gets engaged the clock stretches to 20, the way the real card does.
const BEATS = [
  { min: 2, total: 15, nudge: "Ask what they use today", label: "Objection · No need", note: "" },
  { min: 6, total: 15, nudge: "Show what waiting costs them", label: "Objection · Timing", note: "" },
  { min: 10, total: 15, nudge: "Offer to start this week", label: "Objection · Stall", note: "" },
  { min: 11, total: 20, nudge: "Go one level deeper on the need", label: "Pacing · Buyer engaged", note: "Buyer's engaged · extended to 20 min" },
  { min: 17, total: 20, nudge: "Ask for the sale now", label: "Buying signal", note: "Buyer's engaged · extended to 20 min" },
];
const phaseOf = (share: number) =>
  share < 0.2 ? "Discovery" : share < 0.55 ? "Present and handle" : share < 0.8 ? "Close window" : "Ask for the sale";

export default function ClockDemo() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setShown(false);
      setTimeout(() => {
        setI((n) => (n + 1) % BEATS.length);
        setShown(true);
      }, 300);
    }, 3600);
    return () => clearInterval(id);
  }, []);
  const b = BEATS[i];
  const share = b.min / b.total;
  const fade = { opacity: shown ? 1 : 0, filter: shown ? "none" : "blur(3px)", transition: "opacity .3s var(--tg-ease), filter .3s" };
  return (
    <div className="q-card" style={{ width: "100%", maxWidth: 400 }} aria-label="The call clock moving through a call, stretching from 15 to 20 minutes when the buyer gets engaged">
      <div className="flex items-center gap-2">
        <QMark size={24} font={10} />
        <span className="tg-dot small" />
        <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>Listening</span>
      </div>
      <div className="q-cue mt-4" style={{ fontSize: 26, ...fade }}>{b.nudge}</div>
      <div className="relative mt-5" style={{ height: 1, background: "var(--tg-line)" }}>
        <i
          className="absolute left-0 top-0 block"
          style={{
            height: 1,
            width: `${share * 100}%`,
            background: share >= 0.8 ? "var(--tg-amber-hi)" : "rgba(255,255,255,.55)",
            boxShadow: share >= 0.8 ? "0 0 10px 1px var(--tg-amber)" : "0 0 8px 1px rgba(255,255,255,.35)",
            transition: "width 1.2s var(--tg-ease), background .6s",
          }}
        />
      </div>
      <div className="mt-3 flex justify-between tg-fine" style={fade}>
        <span>{phaseOf(share)} · {b.min} of {b.total} min</span>
        <span>{b.label}</span>
      </div>
      <div className="mt-3 tg-fine" style={{ minHeight: 17, color: "var(--tg-faint)", ...fade }}>
        {b.note}
      </div>
    </div>
  );
}
