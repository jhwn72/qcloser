import Link from "next/link";
import type { CSSProperties } from "react";
import Reveal from "../components/Reveal";
import SiteNav from "../components/SiteNav";
import ShareDemo from "./ShareDemo";

export const metadata = {
  title: "Royalties · Q",
  description: "Share the moves Q learns from your wins with everyone and earn royalties when they help other sellers close. Payouts start after launch.",
};

const CHOICES = [
  {
    name: "Everyone",
    chip: "Public · earns royalties",
    live: true,
    body: "It joins the shared playbook with your name on it, so every Q user can use it. When it helps another seller close, you earn royalties.",
  },
  {
    name: "My company only",
    chip: "Company only",
    live: false,
    body: "It stays private to your team, so a competitor never gets your best lines. Private moves don’t earn royalties.",
  },
];

const HOW = [
  {
    title: "A pool of 10% of subscription revenue",
    body: "A tenth of what Q earns from subscriptions is set aside for the sellers who teach it.",
  },
  {
    title: "Split by attributed wins",
    body: "When Q shows your public move on another seller’s call and that call closes, the win is attributed to you.",
  },
  {
    title: "Your share follows your wins",
    body: "If your moves were behind 5% of all attributed wins in a payout period, you’d get 5% of the pool.",
  },
];

// An example split of the pool. The names are sample data, not real payouts.
const SPLIT = [
  { who: "Ana", pct: 31, tone: "rgba(255,255,255,0.34)" },
  { who: "Leo", pct: 19, tone: "rgba(255,255,255,0.24)" },
  { who: "You", pct: 22, tone: "#fff", you: true },
  { who: "Jules", pct: 16, tone: "rgba(255,255,255,0.18)" },
  { who: "Everyone else", pct: 12, tone: "rgba(255,255,255,0.11)" },
];

const FAQ = [
  {
    q: "When do payouts start?",
    a: "After launch. Q is a hackathon build today, so no royalties are being paid yet. Moves you share are still credited to you by name in the playbook.",
  },
  {
    q: "Can I switch a move to private later?",
    a: "That’s planned. For now, the choice in the Q popup sets where the moves Q learns from you go from then on.",
  },
  {
    q: "Do I need to share to use Q?",
    a: "No. Q works the same either way, and you still get the shared playbook. With My company only, your moves stay with your team; they just don’t earn royalties.",
  },
  {
    q: "What counts as helping someone close?",
    a: "Q shows your public move on another seller’s call, and that call ends in a win. That’s an attributed win, and the pool is split by those.",
  },
];

const label = { fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" as const, margin: "0 0 20px" };
const h2 = { fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, textWrap: "balance" as const };

export default function RoyaltiesPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-25%] h-[80vh] w-[100vw] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
      />

      <SiteNav current="royalties" />

      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
        <span className="tg-chip" style={{ cursor: "default" }}>
          <span className="tg-dot small off" />
          Planned · payouts start after launch
        </span>
        <h1
          className="tg-headline"
          style={{ fontSize: "clamp(38px, 7vw, 64px)", lineHeight: 1.04, letterSpacing: "-0.025em", textWrap: "balance", marginTop: 28 }}
        >
          Get paid when your moves help others close.
        </h1>
        <p className="tg-body max-w-xl" style={{ fontSize: 18, lineHeight: 1.5, margin: "24px auto 0", textWrap: "balance" }}>
          When Q learns a move from your win, you choose where it goes. Share it with everyone, and you&rsquo;ll earn
          royalties when it helps other sellers close.
        </p>
      </section>

      {/* The choice */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2">
        <Reveal delay={150} className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <ShareDemo />
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="tg-label" style={label}>
              Where your moves go
            </p>
            <h2 className="tg-headline" style={h2}>
              You choose who gets them.
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6">
            {CHOICES.map((c, i) => (
              <Reveal key={c.name} delay={i * 90}>
                <div style={{ borderTop: "1px solid var(--tg-line)", paddingTop: 16 }}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 style={{ font: "300 19px/1.3 var(--tg-font)", color: "var(--tg-text-soft)", margin: 0 }}>{c.name}</h3>
                    <span className={`tg-chip ${c.live ? "on" : ""}`} style={{ cursor: "default", padding: "3px 10px" }}>
                      <span className={`tg-dot small ${c.live ? "" : "off"}`} />
                      {c.chip}
                    </span>
                  </div>
                  <p className="tg-body" style={{ margin: "8px 0 0", fontSize: 15 }}>
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="tg-fine" style={{ margin: "20px 0 0", fontSize: 12.5 }}>
              Set it in the Q popup, under &ldquo;Share moves Q learns from you&rdquo;.
            </p>
          </Reveal>
        </div>
      </section>

      {/* How royalties will work */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="tg-label" style={label}>
              The proposal
            </p>
            <h2 className="tg-headline" style={h2}>
              How royalties will work.
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6">
            {HOW.map((b, i) => (
              <Reveal key={b.title} delay={i * 90}>
                <div className="flex gap-4" style={{ borderTop: "1px solid var(--tg-line)", paddingTop: 16 }}>
                  <span className="tg-fine" style={{ letterSpacing: "0.08em", paddingTop: 3 }}>
                    0{i + 1}
                  </span>
                  <div>
                    <h3 style={{ font: "300 19px/1.3 var(--tg-font)", color: "var(--tg-text-soft)", margin: 0 }}>{b.title}</h3>
                    <p className="tg-body" style={{ margin: "6px 0 0", fontSize: 15 }}>
                      {b.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150} className="flex justify-center lg:justify-end">
          <Pool />
        </Reveal>
      </section>

      {/* Why it matters */}
      <section className="relative mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-8">
        <Reveal>
          <p className="tg-label" style={label}>
            Why it matters
          </p>
          <h2 className="tg-headline" style={h2}>
            Top closers get a reason to share.
          </h2>
          <p className="tg-body mx-auto max-w-xl" style={{ fontSize: 16, margin: "20px auto 0" }}>
            A great closer&rsquo;s best lines usually stay in their head, because teaching them to everyone else has
            never paid. Royalties change that. The more your public moves help other sellers win, the bigger your share,
            so the best closers keep teaching Q and the playbook keeps getting better for everyone.
          </p>
        </Reveal>
      </section>

      {/* Questions */}
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

      {/* Get started */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-12 sm:px-8">
        <Reveal>
          <div className="q-card mx-auto flex flex-col items-center text-center" style={{ width: "100%", maxWidth: 600, padding: "32px 24px 28px", textAlign: "center" }}>
            <h2 className="tg-headline" style={{ fontSize: "clamp(24px, 4vw, 30px)", lineHeight: 1.15 }}>
              Start teaching Q.
            </h2>
            <p className="tg-body" style={{ margin: "10px 0 0", fontSize: 15, maxWidth: 420 }}>
              Install Q, add your company name in the popup, and pick where your moves go.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <a className="tg-btn primary q-download" href="/q-extension.zip" download>
                Download for Chrome
              </a>
              <Link className="tg-link" href="/playbook">
                See the playbook
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="relative mx-auto w-full max-w-6xl px-4 pb-10 sm:px-8">
        <p className="tg-fine">Q · SEP Hacks 2026 · Built by John Wang</p>
      </footer>
    </main>
  );
}

// Subscription revenue, the 10% set aside, and an example of how that pool splits by attributed wins.
function Pool() {
  return (
    <div
      className="q-card"
      style={{ width: "100%", maxWidth: 460 }}
      role="img"
      aria-label="10% of subscription revenue goes into a royalty pool. In this example, the pool splits by attributed wins: Ana 31%, Leo 19%, you 22%, Jules 16%, everyone else 12%."
    >
      <div className="flex justify-between tg-fine">
        <span>Subscription revenue</span>
        <span style={{ color: "var(--q-warm)" }}>Royalty pool · 10%</span>
      </div>
      <div className="q-bar mt-3">
        <i style={{ "--w": "90%", background: "rgba(255,255,255,0.16)" } as CSSProperties} />
        <i className="q-bar-pool" style={{ "--w": "10%", "--d": "500ms" } as CSSProperties} />
      </div>

      {/* The pool, opened up */}
      <svg className="q-pool-fan" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="q-fan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(255,190,130)" stopOpacity="0.28" />
            <stop offset="1" stopColor="rgb(255,190,130)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <polygon points="90,0 100,0 100,30 0,30" fill="url(#q-fan)" />
      </svg>

      <div className="q-bar">
        {SPLIT.map((s, i) => (
          <i
            key={s.who}
            className={s.you ? "q-bar-you" : ""}
            style={{ "--w": `${s.pct}%`, "--d": `${900 + i * 110}ms`, background: s.tone } as CSSProperties}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 tg-fine">
        {SPLIT.map((s) => (
          <span key={s.who} className="flex items-center gap-1.5" style={s.you ? { color: "var(--tg-text)" } : undefined}>
            <i className="inline-block rounded-full" style={{ width: 7, height: 7, background: s.tone, boxShadow: s.you ? "0 0 8px rgba(255,255,255,.7)" : "none" }} />
            {s.who} {s.pct}%
          </span>
        ))}
      </div>
      <p className="tg-fine" style={{ margin: "16px 0 0", paddingTop: 12, borderTop: "1px solid var(--tg-line)" }}>
        Example split by attributed wins. Names are sample data; no royalties are paid yet.
      </p>
    </div>
  );
}
