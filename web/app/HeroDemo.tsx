"use client";

import { useEffect, useState } from "react";
import QMark from "./components/QMark";

// Example moments: what the buyer said, the nudge Q gave, and who taught Q that move.
// The starter playbook's names are sample data for this demo.
const MOMENTS = [
  { who: "Taylor", line: "I've paid for gyms before and never go.", nudge: "Ask what got in the way", from: "From the Q starter playbook", label: "Worry · Burned before" },
  { who: "Linda", line: "Our AC still works. We'll wait until it breaks.", nudge: "Ask what a July breakdown costs", from: "Learned from Ana · Los Angeles", label: "Objection · Timing" },
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
      {/* Always room for two lines (2 x 1.35em), so a longer line never pushes the card down as it rotates in */}
      <div
        className="flex w-full items-end justify-center"
        style={{ font: "300 clamp(17px, 4.6vw, 20px)/1.35 var(--tg-font)", minHeight: "2.7em" }}
      >
        <p
          className="text-center"
          style={{ margin: 0, font: "inherit", letterSpacing: "-0.005em", color: "var(--tg-text-soft)", textWrap: "balance", ...fade }}
        >
          <span style={{ color: "var(--tg-muted)" }}>{m.who}:</span> &ldquo;{m.line}&rdquo;
        </p>
      </div>
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
