import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { MOMENT_TYPES } from "@/lib/moments";
import { db } from "@/lib/supabase";
import ClockDemo from "./components/ClockDemo";
import CountUp from "./components/CountUp";
import LearnDemo from "./components/LearnDemo";
import QMark from "./components/QMark";
import Reveal from "./components/Reveal";
import SiteNav from "./components/SiteNav";
import HeroDemo from "./HeroDemo";

const STEPS = [
  {
    title: "Hears the call",
    body: "Q reads Google Meet's live captions, both sides, and keeps track of how far into the call you are.",
  },
  {
    title: "Nudges, never scripts",
    body: "When the buyer pushes back or warms up, a short nudge tells you where to steer. You say it your way.",
  },
  {
    title: "Learns from every call",
    body: "Win, and your best move joins everyone's playbook, credited to you. Lose, and Q keeps the lesson.",
  },
];

const SITUATIONS = [
  "Objection · Price",
  "Objection · Stall",
  "Objection · Partner decides",
  "Brush-off · Send me info",
  "Worry · Burned before",
  "Worry · Feeling judged",
  "Buying signal",
  "Closing · Yes too early",
  "Pacing · Talking too long",
  "Heads up · Hostile buyer",
];

// The learning loop, in four beats
const LOOP = [
  {
    title: "Wins teach it new moves",
    body: "Close with a move Q hasn't seen and it learns it, credits it to you, and every Q user has it within seconds.",
  },
  {
    title: "Losses teach it lessons",
    body: "When a deal slips away, Q finds where it turned and saves a lesson the next seller can use.",
  },
  {
    title: "It catches its own misfires",
    body: "After each call, Q checks whether every nudge it showed helped or hurt. Moves that keep hurting lose rank, then retire.",
  },
  {
    title: "The best moves rise",
    body: "Every move carries its record, so what's winning right now is what you see first.",
  },
];

const COMING = ["Zoom", "Microsoft Teams", "Slack huddles", "Webex", "Phone calls"];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Does Q record my calls?",
    a: "Q never records audio. It reads the live captions Google Meet already shows in your browser and sends the conversation to Q to pick a nudge. When you end a call, the transcript is saved so Q can learn from it. As with any call notes, let the people on the call know.",
  },
  {
    q: "Can the buyer see Q?",
    a: "No. The card lives in your own browser tab, not in the meeting. The only way they'd see it is if you share your whole screen, so share a window or tab instead.",
  },
  {
    q: "Is it going to put words in my mouth?",
    a: "No. A nudge tells you where to steer, like “Ask what got in the way”. How you say it is up to you, so you still sound like yourself.",
  },
  {
    q: "How fast is it?",
    a: "About two seconds from the buyer's last word to the nudge on your screen. If the buyer is just making small talk, Q stays quiet and simply shows that it heard.",
  },
  {
    q: "Where do the moves come from?",
    a: "Q starts with a playbook of closing moves. Every time a seller wins with a move Q hasn't seen, it's added and credited to them, and every Q user has it within seconds. Moves that keep losing retire on their own.",
  },
  {
    q: "Can I keep my company's moves private?",
    a: (
      <>
        Yes. In the Q popup, add your company name and choose &ldquo;My company only&rdquo;. Moves Q learns from you
        then stay with your team, and you still get the shared playbook. Shared moves are set to earn royalties after
        launch; private ones don&rsquo;t.{" "}
        <Link className="tg-link" href="/royalties" style={{ font: "inherit" }}>
          How royalties will work
        </Link>
      </>
    ),
  },
];

const label = { fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" as const, margin: "0 0 20px" };
const chip = { cursor: "default", padding: "8px 14px", fontSize: 14 };

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Soft light from above, so the page isn't flat black */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-25%] h-[80vh] w-[100vw] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
      />

      {/* Top bar: the mark and the tagline, so the hero can stay simple */}
      <SiteNav />

      {/* Hero: one line, one sentence, one action */}
      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-14 pt-20 text-center sm:px-8 sm:pt-28">
        <h1 className="tg-headline" style={{ fontSize: "clamp(44px, 8vw, 76px)", lineHeight: 1.02, letterSpacing: "-0.025em", textWrap: "balance" }}>
          Every closer needs a Q.
        </h1>
        <p className="tg-body max-w-xl" style={{ fontSize: 18, lineHeight: 1.5, margin: "24px 0 0" }}>
          Q listens to your sales call and shows you, at a glance, what the best salespeople would do next.
        </p>
        <div className="mt-8 flex items-center gap-5">
          <a className="tg-btn primary" href="#install">
            Download for Chrome
          </a>
          <Link className="tg-link" href="/playbook">
            See the playbook
          </Link>
        </div>
      </section>

      {/* The card, on its own */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8">
        <HeroDemo />
      </section>

      {/* How it works */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-8">
        <Reveal>
          <p className="tg-label" style={label}>
            Closing intelligence
          </p>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <div className="tg-fine" style={{ letterSpacing: "0.08em" }}>0{i + 1}</div>
              <h2 className="tg-headline" style={{ fontSize: 22, marginTop: 8 }}>
                {s.title}
              </h2>
              <p className="tg-body" style={{ margin: "8px 0 0" }}>
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Feature: the moment and the clock */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <h2 className="tg-headline" style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, textWrap: "balance" }}>
            It knows the moment, and the clock.
          </h2>
          <p className="tg-body" style={{ fontSize: 16, margin: "20px 0 0" }}>
            Q recognizes {MOMENT_TYPES.length} situations, from price pushback and &ldquo;let me think about it&rdquo; to a buyer
            who just got personal. It also watches the time: early on it helps you find the need, and near the end it
            pushes you to ask for the sale.
          </p>
          <p className="tg-body" style={{ fontSize: 16, margin: "12px 0 0" }}>
            Tell Q what you sell once, add a quick brief before a call, and every nudge fits your offer.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SITUATIONS.map((s) => (
              <span key={s} className="tg-chip" style={{ cursor: "default" }}>
                {s}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150} className="flex justify-center lg:justify-end">
          <ClockDemo />
        </Reveal>
      </section>

      {/* Feature: the playbook learns */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-2">
        <Reveal delay={150} className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <LearnDemo />
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal>
            <h2 className="tg-headline" style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, textWrap: "balance" }}>
              It gets better with every call.
            </h2>
            <p className="tg-body" style={{ fontSize: 16, margin: "20px 0 0" }}>
              The playbook doesn&rsquo;t just grow. After every call, won or lost, Q looks back at what happened, so the
              moves you see keep getting sharper.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {LOOP.map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <div style={{ borderTop: "1px solid var(--tg-line)", paddingTop: 14 }}>
                  <h3 style={{ font: "300 17px/1.3 var(--tg-font)", color: "var(--tg-text-soft)", margin: 0 }}>{b.title}</h3>
                  <p className="tg-body" style={{ margin: "6px 0 0" }}>
                    {b.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <p className="tg-body" style={{ fontSize: 16, margin: "32px 0 0", color: "var(--tg-text-soft)" }}>
              Generic AI guesses what sounds persuasive. Q learns what actually closes, and catches itself when it&rsquo;s
              wrong.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Numbers that are true today */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
        <Suspense fallback={<div style={{ height: 96 }} />}>
          <Numbers />
        </Suspense>
      </section>

      {/* Works with */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
        <Reveal>
          <div style={{ borderBottom: "1px solid var(--tg-line)" }}>
            <div className="q-works-row">
              <p className="tg-label" style={{ ...label, margin: 0 }}>
                Works with
              </p>
              <div className="flex flex-wrap gap-2.5">
                <span className="tg-chip on" style={chip}>
                  <span className="tg-dot small" /> Google Meet
                </span>
              </div>
            </div>
            <div className="q-works-row">
              <p className="tg-label" style={{ ...label, margin: 0 }}>
                Coming soon
              </p>
              <div className="flex flex-wrap gap-2.5">
                {COMING.map((c) => (
                  <span key={c} className="tg-chip q-chip-soon" style={chip}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Questions people ask */}
      <section className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-8">
        <Reveal>
          <p className="tg-label" style={label}>
            Questions
          </p>
        </Reveal>
        <div>
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="q-faq">
                <summary>{f.q}</summary>
                <p className="tg-body">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Download: one button, one line on how to load it */}
      <section id="install" className="relative mx-auto w-full max-w-6xl scroll-mt-8 px-4 pb-24 pt-12 sm:px-8">
        <Reveal>
          <div
            className="q-card mx-auto flex flex-col items-center text-center"
            style={{ width: "100%", maxWidth: 600, padding: "36px 24px 22px", textAlign: "center" }}
          >
            <QMark size={56} font={22} />
            <h2 className="tg-headline" style={{ fontSize: "clamp(26px, 4vw, 32px)", lineHeight: 1.15, margin: "20px 0 0" }}>
              Get Q for Chrome
            </h2>
            <p className="tg-body" style={{ margin: "8px 0 0", fontSize: 15 }}>
              For Google Meet, in your own browser tab.
            </p>
            <a className="tg-btn primary q-download mt-7" href="/q-extension.zip" download>
              Download for Chrome
            </a>
            <p className="tg-body" style={{ margin: "20px 0 0", maxWidth: 430, fontSize: 14 }}>
              Unzip it, turn on Developer mode at <span style={{ color: "var(--tg-text-soft)" }}>chrome://extensions</span>,
              and drag the q-extension folder onto the page.
            </p>
            <p className="tg-fine" style={{ margin: "6px 0 0" }}>
              Chrome Web Store listing coming soon.
            </p>
            <p className="tg-fine" style={{ margin: "26px 0 0", paddingTop: 14, width: "100%", borderTop: "1px solid var(--tg-line)" }}>
              Shortcuts on the call: Shift+D shows what Q hears, Shift+B types a line, Shift+C shows Meet&rsquo;s captions.
            </p>
          </div>
        </Reveal>
      </section>

      <footer className="relative mx-auto w-full max-w-6xl px-4 pb-10 sm:px-8">
        <p className="tg-fine">Q · SEP Hacks 2026 · Built by John Wang</p>
      </footer>
    </main>
  );
}

// Three numbers that are true right now: the playbook's size (live), the situations Q knows, and its speed.
async function Numbers() {
  const { count } = await db().from("cues").select("*", { count: "exact", head: true }).eq("status", "active").eq("visibility", "public");
  const stats = [
    { node: <CountUp to={count ?? 0} />, label: "moves in the playbook" },
    { node: <CountUp to={MOMENT_TYPES.length} />, label: "situations Q recognizes" },
    { node: <CountUp to={2} prefix="~" suffix=" s" />, label: "from the buyer's words to your nudge" },
  ];
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 120}>
          <div style={{ font: "300 56px/1 var(--tg-font)", textShadow: "0 0 24px rgba(255,255,255,0.25)" }}>{s.node}</div>
          <div className="tg-fine mt-3" style={{ fontSize: 13 }}>
            {s.label}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
