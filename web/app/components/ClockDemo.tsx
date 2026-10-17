"use client";

import { useEffect, useState } from "react";
import QMark from "./QMark";

// A slow loop through a 15-minute call: the clock fills, the phase changes, and the nudge turns
// from discovery toward the close for the same kind of pushback.
const BEATS = [
  { min: 2, phase: "Discovery", nudge: "Ask what they use today", label: "Objection · No need" },
  { min: 6, phase: "Present and handle", nudge: "Show what waiting costs them", label: "Objection · Timing" },
  { min: 10, phase: "Close window", nudge: "Offer to start this week", label: "Objection · Stall" },
  { min: 13, phase: "Ask for the sale", nudge: "Ask for the sale now", label: "Buying signal" },
];
const TOTAL = 15;

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
  const share = b.min / TOTAL;
  const fade = { opacity: shown ? 1 : 0, filter: shown ? "none" : "blur(3px)", transition: "opacity .3s var(--tg-ease), filter .3s" };
  return (
    <div className="q-card" style={{ width: "100%", maxWidth: 400 }} aria-label="The call clock moving through a 15-minute call">
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
        <span>{b.phase} · {b.min} of {TOTAL} min</span>
        <span>{b.label}</span>
      </div>
    </div>
  );
}
