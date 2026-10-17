import Link from "next/link";
import QMark from "./components/QMark";

const INSTALL_URL = "https://github.com/jhwn72/q#install";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      {/* Soft light from above, so the page isn't flat black */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-20%] h-[70vh] w-[90vw] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.07), transparent)" }}
      />

      <QMark size={112} font={44} />

      <h1 className="tg-headline mt-8" style={{ fontSize: 44, lineHeight: 1.1 }}>
        your cue to close
      </h1>
      <p className="tg-body mt-4 max-w-md" style={{ fontSize: 16 }}>
        Q hears the buyer&rsquo;s objection, reads what kind of buyer they are, and flashes a five-word cue
        learned from deals real people actually won.
      </p>

      <div className="tg-actions mt-6">
        <a className="tg-btn primary" href={INSTALL_URL}>
          Add to Chrome
        </a>
        <Link className="tg-btn" href="/playbook">
          See the playbook
        </Link>
      </div>

      <div className="q-card mt-16">
        <div className="flex items-center gap-2">
          <span className="tg-dot small" />
          <span className="tg-fine" style={{ color: "var(--tg-muted)" }}>Listening</span>
          <span className="tg-chip on ml-auto" style={{ cursor: "default" }}>Skeptical buyer</span>
        </div>
        <div className="q-cue mt-5">What would change your mind?</div>
        <div className="tg-fine mt-2">
          Learned from <span style={{ color: "var(--tg-muted)" }}>Marcus · Atlanta</span> · 4 days ago
        </div>
      </div>
    </main>
  );
}
