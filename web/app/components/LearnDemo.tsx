"use client";

import { useEffect, useState } from "react";

// The learning loop in miniature: a win teaches a new move (the toast every card sees), a loss leaves a
// lesson, and the after-call review catches a move that misfired and ranks it down. Names here are examples.
const EVENTS = [
  { toast: "New move learned from Priya · Seattle", title: "Have them show their work", chip: "New", note: "From a win · Seeing their own work as client-ready turned a fear into a yes." },
  { toast: "New move learned from Dev · Austin", title: "Recruit their loudest critic", chip: "New", note: "From a win · Putting the skeptic in the demo made their approval the close." },
  { toast: "Lesson saved from a lost call", title: "Book the first session before they leave", chip: "Lesson", note: "From a loss · When the buyer said they never go, pitching amenities lost the room." },
  { toast: "Misfire caught · \u201cOffer a discount\u201d came too early", title: "Offer a discount", chip: "Misfire", note: "From call reviews · Offered before the buyer saw the value, it hurt on 3 calls. Ranked down.", misfire: true },
];

export default function LearnDemo() {
  const [i, setI] = useState(0);
  const [on, setOn] = useState(false);
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    const cycle = () => {
      setOn(true);
      t1 = setTimeout(() => setOn(false), 3200);
    };
    const t0 = setTimeout(cycle, 600);
    const id = setInterval(() => {
      setI((n) => (n + 1) % EVENTS.length);
      cycle();
    }, 4800);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearInterval(id);
    };
  }, []);
  const e = EVENTS[i];
  const misfire = "misfire" in e;
  return (
    <div className="relative w-full" style={{ maxWidth: 420 }} aria-label="How the playbook learns: a move from a won call, a lesson from a lost one, and a misfire caught after a call">
      <div
        className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full px-4 py-2 text-center tg-fine"
        style={{
          background: "var(--tg-float)",
          border: "1px solid var(--tg-line)",
          color: "var(--tg-text)",
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(-8px)",
          transition: "opacity .45s var(--tg-ease), transform .45s var(--tg-ease)",
        }}
      >
        <span className="tg-orb" />
        {e.toast}
      </div>
      <div className="mt-5 rounded-[var(--tg-radius-card)] border p-5" style={{ borderColor: "var(--tg-line)", background: "rgba(255,255,255,0.025)" }}>
        <div className="flex items-start justify-between gap-3">
          <span
            style={{
              font: "300 19px/1.3 var(--tg-font)",
              color: misfire ? "var(--tg-muted)" : "#fff",
              textShadow: on && !misfire ? "0 0 18px rgba(255,255,255,.45)" : "none",
              transition: "text-shadow .6s, color .6s",
            }}
          >
            {e.title}
          </span>
          <span className={`tg-chip shrink-0 ${misfire ? "" : "on"}`} style={{ cursor: "default", padding: "2px 9px" }}>
            {e.chip}
          </span>
        </div>
        <p className="tg-fine mt-3" style={{ color: "var(--tg-muted)" }}>
          {e.note}
        </p>
      </div>
    </div>
  );
}
