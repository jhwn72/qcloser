import { LIVE_AI_PAUSED, PROJECT_URL } from "@/lib/paused";

// A notice across the top of every page while Q's live AI is switched off after the hackathon.
export default function PausedBanner() {
  if (!LIVE_AI_PAUSED) return null;
  return (
    <div
      role="status"
      className="tg-fine px-4 py-2.5 text-center"
      style={{ borderBottom: "1px solid var(--tg-line)", background: "rgba(255, 170, 95, 0.06)", color: "var(--tg-text-soft)" }}
    >
      {/* The dot sits inline with the text, so it stays on the first line when the notice wraps on a phone */}
      <span
        className="tg-orb"
        style={{ background: "rgb(255, 205, 160)", width: 7, height: 7, marginRight: 8, verticalAlign: "middle" }}
        aria-hidden
      />
      Q won 1st place in Grand Tech at SEP Hacks 2026. The live AI is paused for now, so the extension won&rsquo;t show
      nudges.{" "}
      <a className="tg-link" href={PROJECT_URL} style={{ fontSize: "inherit", marginLeft: 4, whiteSpace: "nowrap" }}>
        See the project
      </a>
    </div>
  );
}
