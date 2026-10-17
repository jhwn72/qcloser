"use client";

import { useEffect, useState } from "react";
import QMark from "./components/QMark";

// Example moments: what the buyer said, the nudge Q gave, and who taught Q that move.
// The starter playbook's names are sample data for this demo.
const MOMENTS = [
  { who: "Taylor", line: "I've paid for gyms before and never go.", nudge: "Ask what got in the way", from: "From the Q starter playbook", label: "Worry · Burned before" },
  { who: "Linda", line: "We'll just wait until it breaks.", nudge: "Ask how last summer went", from: "Learned from Ana · Los Angeles", label: "Objection · Timing" },
  { who: "Marco", line: "Another company quoted me $2,000 less.", nudge: "Ask what that quote leaves out", from: "Learned from Leo · Boston", label: "Objection · Shopping around" },
  { who: "Sam", line: "How do I know that'll happen for me?", nudge: "Name the 30-day money-back guarantee", from: "From the Q starter playbook", label: "Objection · Trust" },
  { who: "Priya", line: "Oh nice, so how does the lease work?", nudge: "Explain the lease, then ask to start", from: "Learned from Jules · San Diego", label: "Buying signal" },
];
const STEP_MS = 4200;

// The Q card on its own: the buyer's line above it, the nudge Q shows for it.
export default function HeroDemo() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setShown(false);
      setTimeout(() => {
        setI((n) => (n + 1) % MOMENTS.length);
        setShown(true);
      }, 300);
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);
  const m = MOMENTS[i];
  const fade = {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(6px)",
    filter: shown ? "none" : "blur(4px)",
    transition: "opacity .3s var(--tg-ease), transform .3s var(--tg-ease), filter .3s",
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5" aria-label="An example: what the buyer said, and the nudge Q showed">
      <p className="text-center tg-body" style={{ margin: 0, minHeight: 26, color: "var(--tg-muted)", ...fade }}>
        <span style={{ color: "var(--tg-faint)" }}>{m.who}:</span> &ldquo;{m.line}&rdquo;
      </p>
      <div className="q-card" style={{ width: "100%" }}>
        <div className="flex items-center gap-2">
          <QMark size={26} font={11} />
          <span className="tg-dot small" />
          <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>Listening</span>
        </div>
        <div style={fade}>
          <div className="q-cue mt-4" style={{ fontSize: "clamp(24px, 6vw, 32px)" }}>{m.nudge}</div>
          <div className="tg-fine mt-2">{m.from}</div>
        </div>
        <div className="mt-4 pt-3 tg-fine" style={{ borderTop: "1px solid var(--tg-line)", ...fade }}>
          {m.label}
        </div>
      </div>
    </div>
  );
}
