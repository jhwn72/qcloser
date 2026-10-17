"use client";

import { useEffect, useState } from "react";
import QMark from "../components/QMark";

// A move Q just learned from your win, and the choice of where it goes. It flips between the two options
// on its own until the viewer picks one. The move and name are examples.
const OPTIONS = [
  { seg: "Everyone", chip: "Public · earns royalties", live: true, note: "Every Q user gets it, credited to you." },
  { seg: "My company only", chip: "Company only", live: false, note: "Only your team sees it. No royalties." },
];
const STEP_MS = 4200;

export default function ShareDemo() {
  const [pick, setPick] = useState(0);
  const [auto, setAuto] = useState(true);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (!auto) return;
    let t: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setShown(false);
      t = setTimeout(() => {
        setPick((n) => (n + 1) % OPTIONS.length);
        setShown(true);
      }, 300);
    }, STEP_MS);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [auto]);

  const choose = (n: number) => {
    setAuto(false);
    setShown(true);
    setPick(n);
  };
  const o = OPTIONS[pick];
  const fade = {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(4px)",
    filter: shown ? "none" : "blur(3px)",
    transition: "opacity .3s var(--tg-ease), transform .3s var(--tg-ease), filter .3s",
  };

  return (
    <div className="q-card" style={{ width: "100%", maxWidth: 420 }}>
      <div className="flex items-center gap-2">
        <QMark size={24} font={10} />
        <span className="tg-orb" />
        <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>
          Q learned a move from your win
        </span>
      </div>
      <div className="q-cue mt-4" style={{ fontSize: "clamp(22px, 6vw, 28px)" }}>
        Recruit their loudest critic
      </div>
      <div className="tg-fine mt-2">Learned from Dev · Austin</div>

      <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--tg-line)" }}>
        <div className="tg-fine" style={{ marginBottom: 8 }}>
          Share it with
        </div>
        <div className="tg-seg q-share-seg" role="radiogroup" aria-label="Share it with">
          {OPTIONS.map((opt, n) => (
            <button key={opt.seg} type="button" role="radio" aria-checked={pick === n} className={pick === n ? "on" : ""} onClick={() => choose(n)}>
              {opt.seg}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2" style={fade}>
          <span className={`tg-chip ${o.live ? "on" : ""}`} style={{ cursor: "default" }}>
            <span className={`tg-dot small ${o.live ? "" : "off"}`} />
            {o.chip}
          </span>
          <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>
            {o.note}
          </span>
        </div>
      </div>
    </div>
  );
}
