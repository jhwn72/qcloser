import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/supabase";
import QMark from "./components/QMark";
import HeroDemo from "./HeroDemo";

const STEPS = [
  {
    title: "Hears the call",
    body: "Q reads Google Meet's live captions, both sides, and tracks how far into the call you are.",
  },
  {
    title: "Nudges, never scripts",
    body: "When the buyer pushes back or warms up, a five-word nudge tells you where to steer. You say it your way.",
  },
  {
    title: "Learns from every call",
    body: "Win, and your best move joins everyone's playbook, credited to you. Lose, and Q keeps the lesson.",
  },
];

const INSTALL = [
  "Download this project and find the extension folder.",
  "In Chrome, open chrome://extensions and turn on Developer mode.",
  "Click Load unpacked and choose the extension folder.",
  "Click the Q icon: add your name, city and what you sell.",
  "Join a Google Meet call and press C to turn on captions.",
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Soft light from above, so the page isn't flat black */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-25%] h-[80vh] w-[100vw] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
      />

      {/* Hero */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-16 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:pt-24">
        <div className="text-center lg:text-left">
          <QMark size={96} font={38} />
          <h1 className="tg-headline mt-8" style={{ fontSize: "clamp(40px, 6vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            your cue to close
          </h1>
          <p className="tg-body mx-auto mt-5 max-w-md lg:mx-0" style={{ fontSize: 17 }}>
            A live closing coach for sales calls. Q hears the objection, reads the buyer, and flashes a five-word
            nudge from moves real closers won with.
          </p>
          <div className="tg-actions mt-7 lg:justify-start">
            <a className="tg-btn primary" href="#install">
              Install the extension
            </a>
            <Link className="tg-btn" href="/playbook">
              See the playbook
            </Link>
          </div>
        </div>
        <HeroDemo />
      </section>

      {/* How it works */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="tg-fine" style={{ letterSpacing: "0.08em" }}>0{i + 1}</div>
              <h2 className="tg-headline mt-2" style={{ fontSize: 22 }}>
                {s.title}
              </h2>
              <p className="tg-body mt-2" style={{ margin: "8px 0 0" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live numbers from the playbook */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-8">
        <Suspense fallback={<div style={{ height: 96 }} />}>
          <PlaybookNumbers />
        </Suspense>
      </section>

      {/* Install, for judges */}
      <section id="install" className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-12 sm:px-8">
        <div className="q-card" style={{ width: "100%", maxWidth: 620, padding: "24px 26px" }}>
          <h2 className="tg-title" style={{ marginBottom: 14 }}>
            Install Q
          </h2>
          <ol className="grid gap-3">
            {INSTALL.map((step, i) => (
              <li key={step} className="flex gap-3 tg-body" style={{ margin: 0 }}>
                <span className="tg-fine" style={{ minWidth: 18, paddingTop: 2 }}>
                  {i + 1}
                </span>
                <span style={{ color: "var(--tg-text-soft)" }}>{step}</span>
              </li>
            ))}
          </ol>
          <p className="tg-fine mt-5" style={{ fontSize: 12.5 }}>
            Works on Google Meet in Chrome. Shortcuts on the call: Shift+D shows what Q hears, Shift+B types a line,
            Shift+C shows Meet&rsquo;s captions.
          </p>
        </div>
      </section>

      <footer className="relative mx-auto w-full max-w-6xl px-4 pb-10 sm:px-8">
        <p className="tg-fine">Q · SEP Hacks 2026 · Built by John Wang</p>
      </footer>
    </main>
  );
}

async function PlaybookNumbers() {
  const supabase = db();
  const rows = (table: string) => supabase.from(table).select("*", { count: "exact", head: true });
  const [moves, learned, calls, lessons] = (
    await Promise.all([
      rows("cues").eq("status", "active"),
      rows("cues").eq("is_seed", false),
      rows("calls"),
      rows("insights"),
    ])
  ).map((r) => r.count ?? 0);
  const stats = [
    { n: moves, label: "moves in the playbook" },
    { n: learned, label: "learned from live calls" },
    { n: calls, label: "calls Q learned from" },
    { n: lessons, label: "lessons kept" },
  ];
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label}>
          <div style={{ font: "var(--tg-text-display)", textShadow: "0 0 24px rgba(255,255,255,0.25)" }}>{s.n}</div>
          <div className="tg-fine mt-2" style={{ fontSize: 12.5 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
