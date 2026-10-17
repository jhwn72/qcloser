import type { Verdict as V } from "@/lib/review";

// How the after-call review judged a nudge. Helped glows, neutral stays quiet, hurt is the one warm color.
const STYLE: Record<V, { label: string; color: string; border: string; background: string }> = {
  helped: { label: "Helped", color: "var(--tg-text)", border: "rgba(255, 255, 255, 0.28)", background: "rgba(255, 255, 255, 0.09)" },
  neutral: { label: "Neutral", color: "var(--tg-faint)", border: "var(--tg-line)", background: "transparent" },
  hurt: { label: "Hurt", color: "rgb(255, 205, 160)", border: "rgba(255, 170, 95, 0.45)", background: "rgba(255, 170, 95, 0.1)" },
};

export default function Verdict({ verdict }: { verdict: V | null }) {
  const s = verdict ? STYLE[verdict] : { label: "Not reviewed", color: "var(--tg-faint)", border: "var(--tg-line)", background: "transparent" };
  return (
    <span className="tg-chip shrink-0" style={{ cursor: "default", padding: "2px 9px", color: s.color, borderColor: s.border, background: s.background }}>
      {s.label}
    </span>
  );
}
