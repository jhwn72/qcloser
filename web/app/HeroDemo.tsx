"use client";

import { useEffect, useState } from "react";
import QMark from "./components/QMark";

// Real moments from Q's tests: what the buyer said, the nudge Q gave, and who taught Q that move.
const MOMENTS = [
  { who: "Taylor", line: "I've paid for gyms before and never go.", nudge: "Ask what got in the way", from: "Q starter playbook", label: "Worry · Burned before" },
  { who: "Linda", line: "We'll just wait until it breaks.", nudge: "Ask how last summer went", from: "Learned from Ana · Los Angeles", label: "Objection · Timing" },
  { who: "Marco", line: "Another company quoted me $2,000 less.", nudge: "Ask what that quote leaves out", from: "Learned from Leo · Boston", label: "Objection · Shopping around" },
  { who: "Sam", line: "How do I know that'll happen for me?", nudge: "Name the 30-day money-back guarantee", from: "Q starter playbook", label: "Objection · Trust" },
  { who: "Priya", line: "Oh nice, so how does the lease work?", nudge: "Explain the lease, then ask to start", from: "Learned from Jules · San Diego", label: "Buying signal" },
];
const STEP_MS = 4200;

// A stand-in Meet call with the Q card cycling through those moments.
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
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "16 / 10", borderRadius: "var(--tg-radius-window)", border: "1px solid var(--tg-line)", background: "#141414", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}
      aria-label="Q's card over a video call, showing a nudge for what the buyer just said"
    >
      {/* The call: two people, a control bar */}
      <div className="absolute inset-0 grid grid-cols-2 gap-2 p-3 pb-14">
        <div className="relative rounded-xl" style={{ background: "radial-gradient(90% 90% at 50% 40%, #3b3d42, #1a1b1e)" }}>
          <span className="tg-fine absolute bottom-2 left-3" style={{ color: "#fff" }}>{m.who}</span>
        </div>
        <div className="relative rounded-xl" style={{ background: "radial-gradient(90% 90% at 50% 40%, #44403b, #1d1b19)" }}>
          <span className="tg-fine absolute bottom-2 left-3" style={{ color: "#fff" }}>You</span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2" aria-hidden>
        {[0, 1, 2].map((k) => (
          <i key={k} className="block h-7 w-7 rounded-full" style={{ background: "#3c4043" }} />
        ))}
        <i className="block h-7 w-10 rounded-full" style={{ background: "#ea4335" }} />
      </div>

      {/* The Q card */}
      <div className="q-card absolute right-[3%] top-[5%]" style={{ width: "min(340px, 58%)", padding: "14px 16px 12px" }}>
        <div className="flex items-center gap-2">
          <QMark size={26} font={11} />
          <span className="tg-dot small" />
          <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>Listening</span>
        </div>
        <div style={fade}>
          <div className="q-cue mt-3" style={{ fontSize: "clamp(18px, 2.4vw, 28px)" }}>{m.nudge}</div>
          <div className="tg-fine mt-1">{m.from}</div>
          <div className="tg-fine mt-2" style={{ color: "var(--tg-faint)" }}>
            {m.who} · {m.line}
          </div>
        </div>
        <div className="mt-3 pt-2 tg-fine" style={{ borderTop: "1px solid var(--tg-line)", ...fade }}>
          {m.label}
        </div>
      </div>
    </div>
  );
}
