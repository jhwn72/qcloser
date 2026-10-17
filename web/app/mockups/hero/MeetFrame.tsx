"use client";

import { useEffect, useState } from "react";
import QMark from "../../components/QMark";

// Same example moments as the landing hero (HeroDemo), copied here so the mockup doesn't touch that file.
const MOMENTS = [
  { who: "Taylor", line: "I've paid for gyms before and never go.", nudge: "Ask what got in the way", from: "From the Q starter playbook", label: "Worry · Burned before" },
  { who: "Linda", line: "Our AC still works. We'll wait until it breaks.", nudge: "Ask what a July breakdown costs", from: "Learned from Ana · Los Angeles", label: "Objection · Timing" },
  { who: "Marco", line: "Another company quoted me $2,000 less.", nudge: "Ask what that quote leaves out", from: "Learned from Leo · Boston", label: "Objection · Shopping around" },
  { who: "Sam", line: "How do I know that'll happen for me?", nudge: "Name the 30-day money-back guarantee", from: "From the Q starter playbook", label: "Objection · Trust" },
  { who: "Priya", line: "Oh nice, so how does the lease work?", nudge: "Explain the lease, then ask to start", from: "Learned from Jules · San Diego", label: "Buying signal" },
];
const STEP_MS = 4200;
// The caption changes first, then the nudge follows a beat later, the way Q reacts to what it hears.
const NUDGE_LAG_MS = 650;

const fadeStyle = (shown: boolean) => ({
  opacity: shown ? 1 : 0,
  transform: shown ? "none" : "translateY(6px)",
  filter: shown ? "none" : "blur(4px)",
  transition: "opacity .3s var(--tg-ease), transform .3s var(--tg-ease), filter .3s",
});

// A quiet browser tab on meet.google.com: an address pill, Meet's caption line, and the Q card in its real spot (top right).
// No participant tiles and no control bar, so it stays calm.
export default function MeetFrame() {
  const [cap, setCap] = useState(0);
  const [nudge, setNudge] = useState(0);
  const [capShown, setCapShown] = useState(true);
  const [nudgeShown, setNudgeShown] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const id = setInterval(() => {
      setCapShown(false);
      setNudgeShown(false);
      timers.push(
        setTimeout(() => {
          setCap((n) => (n + 1) % MOMENTS.length);
          setCapShown(true);
        }, 300),
      );
      timers.push(
        setTimeout(() => {
          setNudge((n) => (n + 1) % MOMENTS.length);
          setNudgeShown(true);
        }, 300 + NUDGE_LAG_MS),
      );
    }, STEP_MS);
    return () => {
      clearInterval(id);
      timers.forEach(clearTimeout);
    };
  }, []);

  const c = MOMENTS[cap];
  const m = MOMENTS[nudge];

  return (
    <div
      className="mx-auto w-full max-w-[720px] overflow-hidden"
      style={{
        borderRadius: 18,
        border: "1px solid var(--tg-line)",
        background: "#0b0b0b",
        boxShadow: "var(--tg-shadow-window), 0 0 60px rgba(255,255,255,0.03)",
      }}
      aria-label="An example: Q's card on a Google Meet call, with the buyer's caption below"
    >
      {/* Browser toolbar: window dots, the address, and Q pinned as an extension */}
      <div
        className="flex items-center gap-3 px-3 sm:px-4"
        style={{ height: 44, borderBottom: "1px solid var(--tg-line)", background: "rgba(255,255,255,0.025)" }}
      >
        <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
          {[0, 1, 2].map((d) => (
            <i key={d} style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "block" }} />
          ))}
        </div>
        <div
          className="flex min-w-0 flex-1 items-center gap-2 sm:ml-2"
          style={{
            height: 28,
            padding: "0 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--tg-line)",
            font: "var(--tg-text-small)",
          }}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden style={{ flex: "none", opacity: 0.55 }}>
            <rect x="1" y="5" width="8" height="6.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.1" />
            <path d="M3 5V3.4a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          <span className="truncate">
            <span style={{ color: "var(--tg-text-soft)" }}>meet.google.com</span>
            <span style={{ color: "var(--tg-faint)" }}>/qrt-mxpd-kwa</span>
          </span>
        </div>
        <span className="flex-none" aria-hidden title="Q, pinned in Chrome">
          <QMark size={22} font={9} />
        </span>
      </div>

      {/* The call: dark, with soft light, the card top right like the real extension, Meet's caption at the bottom */}
      <div
        className="relative flex flex-col gap-5 p-3 sm:block sm:p-0"
        style={{
          minHeight: 360,
          background: "radial-gradient(90% 70% at 30% 55%, rgba(255,255,255,0.045), transparent 70%), #0b0b0b",
        }}
      >
        <div className="sm:aspect-[16/9]" aria-hidden />

        {/* Q card */}
        <div className="q-card sm:absolute sm:right-5 sm:top-5" style={{ width: "100%", maxWidth: 340, alignSelf: "flex-end", padding: "16px 18px 14px" }}>
          <div className="flex items-center gap-2">
            <QMark size={24} font={10} />
            <span className="tg-dot small" />
            <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>
              Listening
            </span>
          </div>
          <div style={fadeStyle(nudgeShown)}>
            <div className="q-cue mt-3" style={{ fontSize: "clamp(22px, 5.4vw, 26px)" }}>
              {m.nudge}
            </div>
            <div className="tg-fine mt-2">{m.from}</div>
          </div>
          <div className="mt-3 pt-3 tg-fine" style={{ borderTop: "1px solid var(--tg-line)", ...fadeStyle(nudgeShown) }}>
            {m.label}
          </div>
        </div>

        {/* Meet's live caption: what Q reads */}
        <div className="mt-auto sm:absolute sm:inset-x-0 sm:bottom-6 sm:mt-0 sm:flex sm:justify-center sm:px-6">
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              minHeight: 74,
              padding: "10px 14px 12px",
              borderRadius: 10,
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.05)",
              ...fadeStyle(capShown),
            }}
          >
            <div className="tg-fine" style={{ color: "var(--tg-muted)" }}>
              {c.who}
            </div>
            <div style={{ font: "300 16px/1.4 var(--tg-font)", color: "var(--tg-text-soft)", marginTop: 2 }}>{c.line}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
