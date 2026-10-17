import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "../components/Reveal";
import SiteNav from "../components/SiteNav";

export const metadata = {
  title: "Pricing · Q",
  description: "Q is free during the beta. At launch, Pro is $39 a month for one seller and Team is $99 per seat per month.",
};

type Feature = { text: string; soon?: boolean };
type Plan = { name: string; who: string; price: string; unit: string; tag?: string; features: Feature[] };

// Planned launch pricing. Nothing is billed today: every plan's button is the free beta download.
const PLANS: Plan[] = [
  {
    name: "Pro",
    who: "For one seller.",
    price: "$39",
    unit: "per month",
    features: [
      { text: "Live nudges on Google Meet" },
      { text: "The shared playbook" },
      { text: "Your company profile and a brief before each call" },
      { text: "An adaptive call clock" },
      { text: "Call reports that grade every nudge: helped, neutral or hurt" },
      { text: "Learning from your wins and losses" },
      { text: "Moves you share earn royalties once payouts start" },
    ],
  },
  {
    name: "Team",
    who: "For a sales team.",
    price: "$99",
    unit: "per seat, per month",
    tag: "Best for teams",
    features: [
      { text: "Everything in Pro" },
      { text: "A private company playbook, so moves your team learns stay with your team" },
      { text: "Team-wide learning from every rep’s wins" },
      { text: "Manager views", soon: true },
    ],
  },
  {
    name: "Enterprise",
    who: "For larger sales orgs.",
    price: "Let’s talk",
    unit: "Enterprise plans coming soon",
    features: [
      { text: "Everything in Team" },
      { text: "Security review", soon: true },
      { text: "SSO", soon: true },
      { text: "Custom playbooks", soon: true },
      { text: "More meeting platforms", soon: true },
    ],
  },
];

const COMING = ["Zoom", "Microsoft Teams", "Slack huddles", "Webex", "Phone calls"];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Can I use Q for free now?",
    a: "Yes. During the beta, anyone can install Q and use it on their Google Meet calls at no cost. There’s nothing to pay and no card to enter.",
  },
  {
    q: "When does pricing start?",
    a: "At launch. The plans on this page are what we plan to charge then, and they may change before launch. Until then, Q is free.",
  },
  {
    q: "What are royalties?",
    a: (
      <>
        When a move you shared helps another seller close, you earn a share of a royalty pool. The plan is to set aside
        10% of subscription revenue and split it by attributed wins. Payouts start after launch.{" "}
        <Link className="tg-link" href="/royalties" style={{ font: "inherit" }}>
          How royalties will work
        </Link>
      </>
    ),
  },
  {
    q: "Do private moves cost extra?",
    a: "Private moves come with the Team plan, so there’s no add-on. A private company playbook keeps the moves your team learns with your team, out of a competitor’s reach. Private moves don’t earn royalties. During the beta, anyone can choose “My company only” in the Q popup.",
  },
];

const label = { fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" as const, margin: "0 0 20px" };
const chip = { cursor: "default", padding: "8px 14px", fontSize: 14 };

export default function PricingPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-25%] h-[80vh] w-[100vw] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
      />

      <SiteNav current="pricing" />

      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-10 pt-20 text-center sm:px-8 sm:pt-24">
        <span className="tg-chip on" style={{ cursor: "default" }}>
          <span className="tg-dot small" />
          Free during the beta · launch pricing below
        </span>
        <h1
          className="tg-headline"
          style={{ fontSize: "clamp(38px, 7vw, 64px)", lineHeight: 1.04, letterSpacing: "-0.025em", textWrap: "balance", marginTop: 28 }}
        >
          Free today. Simple pricing at launch.
        </h1>
        <p className="tg-body max-w-xl" style={{ fontSize: 18, lineHeight: 1.5, margin: "24px auto 0", textWrap: "balance" }}>
          Anyone can install Q and use it now at no cost. At launch, Q will be $39 a month for one seller and $99 a seat
          for teams. Nothing is billed today.
        </p>
      </section>

      {/* The plans */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-8">
        <div className="mx-auto grid max-w-md gap-6 lg:max-w-none lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 110}>
              <PlanCard plan={p} />
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <p className="tg-fine text-center" style={{ margin: "24px 0 0", fontSize: 12.5 }}>
            Prices are planned for launch and may change. There&rsquo;s no billing or checkout during the beta.
          </p>
        </Reveal>
      </section>

      {/* Where every plan works */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-8">
        <Reveal>
          <p className="tg-label" style={label}>
            On every plan
          </p>
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
              Try Q free while it&rsquo;s in beta.
            </h2>
            <p className="tg-body" style={{ margin: "10px 0 0", fontSize: 15, maxWidth: 420 }}>
              Install Q, add your company name in the popup, and take it on your next Google Meet call.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <a className="tg-btn primary q-download" href="/q-extension.zip" download>
                Download for Chrome
              </a>
              <Link className="tg-link" href="/royalties">
                How royalties will work
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

// One plan: name and who it's for, the planned launch price, the free beta download, then what's included.
function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className={`q-card q-plan ${plan.tag ? "q-plan-team" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="tg-headline" style={{ fontSize: 24 }}>
          {plan.name}
        </h2>
        {plan.tag && (
          <span className="tg-chip on" style={{ cursor: "default", padding: "3px 10px" }}>
            {plan.tag}
          </span>
        )}
      </div>
      <p className="tg-body" style={{ margin: "4px 0 0", fontSize: 14 }}>
        {plan.who}
      </p>

      <div className="tg-fine" style={{ marginTop: 22 }}>
        At launch
      </div>
      <div className="q-plan-price">{plan.price}</div>
      <div className="tg-fine" style={{ marginTop: 8, fontSize: 12.5 }}>
        {plan.unit}
      </div>

      <a className="tg-btn primary q-download q-plan-cta" href="/q-extension.zip" download>
        Download for Chrome
      </a>
      <p className="tg-fine text-center" style={{ margin: "8px 0 0" }}>
        Free during the beta
      </p>

      <ul className="q-plan-list">
        {plan.features.map((f) => (
          <li key={f.text} className={f.soon ? "soon" : ""}>
            <span className={`tg-dot small ${f.soon ? "off" : ""}`} aria-hidden />
            <span>
              {f.text}
              {f.soon && <span className="q-plan-soon">Coming soon</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
