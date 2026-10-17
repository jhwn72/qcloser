import Link from "next/link";
import QMark from "./QMark";

// The top bar on the landing and royalties pages: the mark and tagline on the left, the other pages on the right.
export default function SiteNav({ current }: { current?: "royalties" }) {
  return (
    <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-8">
      <Link href="/" className="flex items-center gap-3" aria-label="Q home">
        <QMark size={34} font={14} />
        <span style={{ font: "300 15px var(--tg-font)", color: "var(--tg-muted)" }}>your cue to close</span>
      </Link>
      <div className="flex items-center gap-5">
        <Link className="tg-link" href="/playbook">
          Playbook
        </Link>
        <Link
          className="tg-link"
          href="/royalties"
          aria-current={current === "royalties" ? "page" : undefined}
          style={current === "royalties" ? { color: "var(--tg-text)", textDecorationColor: "rgba(255,255,255,0.6)" } : undefined}
        >
          Royalties
        </Link>
      </div>
    </nav>
  );
}
