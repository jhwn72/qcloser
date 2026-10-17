import Link from "next/link";
import HeroDemo from "../../HeroDemo";
import SiteNav from "../../components/SiteNav";
import MeetFrame from "./MeetFrame";

export const metadata = { title: "Hero mockups · Q", robots: { index: false } };

const TODAY_SUB =
  "Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.";
const MEET_SUB =
  "Q sits on your Google Meet calls and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.";

type Option = {
  id: string;
  tag: string;
  name: string;
  why: string;
  recommended?: boolean;
  chip?: string;
  sub: string;
  button: string;
  fine?: string;
  visual: "card" | "meet";
};

const OPTIONS: Option[] = [
  {
    id: "today",
    tag: "Today",
    name: "The live hero, for reference",
    why: "What the landing page shows now. Google Meet first comes up in the section below the card.",
    sub: TODAY_SUB,
    button: "Download for Chrome",
    visual: "card",
  },
  {
    id: "a",
    tag: "Option A",
    name: "A chip above the headline",
    why: "The smallest change: a label people read before the headline, in the same style as the royalties and pricing chips.",
    chip: "Chrome extension for Google Meet",
    sub: TODAY_SUB,
    button: "Download for Chrome",
    visual: "card",
  },
  {
    id: "b",
    tag: "Option B",
    name: "Say it in the words",
    why: "The sentence and the button both say Google Meet, and one fine line answers “what about Zoom?” The picture stays as it is.",
    sub: MEET_SUB,
    button: "Get Q for Google Meet",
    fine: "A Chrome extension · Zoom and Teams coming soon",
    visual: "card",
  },
  {
    id: "c",
    tag: "Option C",
    name: "Show the card on a Meet tab",
    why: "Showing beats telling: a meet.google.com address and Meet’s own caption line put the card on a call before anyone reads a word.",
    sub: TODAY_SUB,
    button: "Download for Chrome",
    visual: "meet",
  },
  {
    id: "d",
    tag: "Option D",
    name: "One sentence and one picture",
    why: "The subline names Google Meet for readers, the Meet tab shows it to skimmers. Still one headline, one sentence, one action.",
    recommended: true,
    sub: MEET_SUB,
    button: "Download for Chrome",
    visual: "meet",
  },
];

export default function HeroMockups() {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-hidden">
      {/* What this page is, and quick links to each option */}
      <header className="mx-auto w-full max-w-6xl px-4 pb-10 pt-10 sm:px-8">
        <p className="tg-label" style={{ margin: 0, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Mockups · not linked from the site
        </p>
        <h1 className="tg-headline" style={{ fontSize: "clamp(28px, 4vw, 36px)", lineHeight: 1.15, marginTop: 10 }}>
          Hero options: say Google Meet at a glance
        </h1>
        <p className="tg-body" style={{ fontSize: 15, margin: "10px 0 0", maxWidth: "60ch" }}>
          The live hero first, then four ways to make it obvious that Q works on Google Meet. The real landing page is
          unchanged.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {OPTIONS.map((o) => (
            <a key={o.id} href={`#${o.id}`} className={`tg-chip ${o.recommended ? "on" : ""}`} style={{ textDecoration: "none" }}>
              {o.recommended && <span className="tg-dot small" />}
              {o.tag}
              {o.recommended ? " · recommended" : ""}
            </a>
          ))}
        </div>
      </header>

      {OPTIONS.map((o) => (
        <section key={o.id} id={o.id} className="relative scroll-mt-4" style={{ borderTop: "1px solid var(--tg-line-strong)" }}>
          <OptionLabel o={o} />
          <Hero o={o} />
        </section>
      ))}

      <footer className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8" style={{ borderTop: "1px solid var(--tg-line)" }}>
        <Link className="tg-link" href="/">
          Back to the live landing page
        </Link>
      </footer>
    </main>
  );
}

function OptionLabel({ o }: { o: Option }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", borderBottom: "1px solid var(--tg-line)" }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span style={{ font: "400 15px var(--tg-font)", color: "var(--tg-text)" }}>
            {o.tag}: {o.name}
          </span>
          {o.recommended && (
            <span className="tg-chip on" style={{ cursor: "default", padding: "2px 9px" }}>
              <span className="tg-dot small" />
              Recommended
            </span>
          )}
        </div>
        <p className="tg-body" style={{ margin: 0, fontSize: 14 }}>
          {o.why}
        </p>
      </div>
    </div>
  );
}

// One full hero, built the same way as the landing page's top section, with this option's copy and picture.
function Hero({ o }: { o: Option }) {
  return (
    <div className="relative overflow-hidden">
      {/* Soft light from above, as on the landing page */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-25%] h-[80vh] w-[100vw] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
      />

      <SiteNav />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-14 pt-20 text-center sm:px-8 sm:pt-28">
        {o.chip && (
          <span className="tg-chip on" style={{ cursor: "default", marginBottom: 28 }}>
            <span className="tg-dot small" />
            {o.chip}
          </span>
        )}
        <h2 className="tg-headline" style={{ fontSize: "clamp(44px, 8vw, 76px)", lineHeight: 1.02, letterSpacing: "-0.025em", textWrap: "balance" }}>
          Every closer needs a Q.
        </h2>
        <p className="tg-body max-w-xl" style={{ fontSize: 18, lineHeight: 1.5, margin: "24px 0 0" }}>
          {o.sub}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <Link className="tg-btn primary" href="/#install" style={{ textDecoration: "none" }}>
            {o.button}
          </Link>
          <Link className="tg-link" href="/playbook">
            See the playbook
          </Link>
        </div>
        {o.fine && (
          <p className="tg-fine" style={{ margin: "16px 0 0", fontSize: 12.5 }}>
            {o.fine}
          </p>
        )}
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8">{o.visual === "meet" ? <MeetFrame /> : <HeroDemo />}</div>
    </div>
  );
}
