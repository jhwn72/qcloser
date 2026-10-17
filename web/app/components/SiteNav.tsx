import Link from "next/link";
import QMark from "./QMark";

// The other pages, in the order they appear on the right of the top bar. The playbook page has its own
// header with the same links, so keep the two in step.
const LINKS = [
  { href: "/playbook", label: "Playbook", key: "playbook" },
  { href: "/royalties", label: "Royalties", key: "royalties" },
  { href: "/pricing", label: "Pricing", key: "pricing" },
] as const;

// The top bar on the landing, royalties and pricing pages: the mark and tagline on the left, the other pages on the right.
export default function SiteNav({ current }: { current?: "royalties" | "pricing" }) {
  return (
    <nav className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pt-6 sm:px-8">
      <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Q home">
        <QMark size={34} font={14} />
        <span className="hidden min-[400px]:inline" style={{ font: "300 15px var(--tg-font)", color: "var(--tg-muted)" }}>
          your cue to close
        </span>
      </Link>
      <div className="flex items-center gap-4 sm:gap-5">
        {LINKS.map((l) => (
          <Link
            key={l.key}
            className="tg-link"
            href={l.href}
            aria-current={current === l.key ? "page" : undefined}
            style={current === l.key ? { color: "var(--tg-text)", textDecorationColor: "rgba(255,255,255,0.6)" } : undefined}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
