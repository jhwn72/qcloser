import Link from "next/link";
import { Suspense } from "react";
import { MOMENT_LABELS, type Moment } from "@/lib/moments";
import { db, type Cue } from "@/lib/supabase";
import QMark from "../components/QMark";
import LiveRefresh from "./LiveRefresh";

export const metadata = { title: "Playbook · Q" };

// How moments are grouped on the page. Anything not listed lands in "More".
const GROUPS: { title: string; moments: Moment[] }[] = [
  {
    title: "Objections",
    moments: ["no_need", "price", "discount", "timing", "trust", "proof", "authority", "partner", "competitor", "shopping", "locked_in", "stall", "send_info", "process", "compliance", "technical", "tough_question", "not_fit"],
  },
  { title: "Worries and personal moments", moments: ["judged", "fear", "burned", "overwhelmed", "hardship", "health_loss"] },
  { title: "Closing", moments: ["buying_signal", "ready", "early_yes", "ghost_risk"] },
  { title: "Flow of the call", moments: ["pacing", "dragging", "disengaged", "confused", "tangent", "hostile"] },
];
const NEW_FOR_MS = 24 * 3600 * 1000;

type Insight = {
  id: string;
  text: string;
  author_name: string | null;
  created_at: string;
  calls: { outcome: string | null } | null; // the call it came from, if any
};

function timeAgo(iso: string, now: number) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hr ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

// The part after "Objection · " reads better as a section title inside its group.
const shortLabel = (m: string) => (MOMENT_LABELS[m as Moment] ?? m.replace(/_/g, " ")).split(" · ").pop()!;

export default function PlaybookPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8">
      <header className="mb-10 flex items-center gap-4">
        <Link href="/" aria-label="Q home">
          <QMark size={52} font={20} />
        </Link>
        <div>
          <h1 className="tg-title" style={{ margin: 0 }}>
            The playbook
          </h1>
          <p className="tg-sub" style={{ marginTop: 4 }}>
            Moves from closers who won with them. It grows every time someone does.
          </p>
        </div>
      </header>
      <Suspense fallback={<p className="tg-body">Loading the playbook…</p>}>
        <Playbook />
      </Suspense>
    </main>
  );
}

async function Playbook() {
  const supabase = db();
  const [cuesRes, insightsRes] = await Promise.all([
    supabase.from("cues").select("*").order("created_at", { ascending: false }),
    supabase
      .from("insights")
      .select("id, text, author_name, created_at, calls(outcome)")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  if (cuesRes.error) return <p className="tg-body">Couldn&rsquo;t load the playbook. Is the database reachable?</p>;
  const cues = cuesRes.data as Cue[];
  const insights = (insightsRes.data ?? []) as unknown as Insight[];
  const now = Date.now(); // eslint-disable-line react-hooks/purity -- rendered per request, for "5 min ago"

  const byMoment = new Map<string, Cue[]>();
  for (const c of cues) byMoment.set(c.objection_type, [...(byMoment.get(c.objection_type) ?? []), c]);
  const known = new Set(GROUPS.flatMap((g) => g.moments as string[]));
  const groups = [...GROUPS, { title: "More", moments: [...byMoment.keys()].filter((m) => !known.has(m)) as Moment[] }];

  const active = cues.filter((c) => c.status === "active");
  const closers = new Set(cues.filter((c) => c.author_name !== "Q Starter").map((c) => c.author_name)).size;
  const learned = cues.filter((c) => !c.is_seed);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <LiveRefresh />
      <div>
        <p className="tg-fine mb-8" style={{ fontSize: 13 }}>
          {active.length} active moves from {closers} closers
          {learned.length ? ` · ${learned.length} learned from live calls` : ""}
        </p>
        {groups.map((g) => {
          const moments = g.moments.filter((m) => byMoment.has(m));
          if (!moments.length) return null;
          return (
            <section key={g.title} className="mb-12">
              <h2 className="tg-label" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {g.title}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {moments.map((m) => (
                  <MomentCard key={m} moment={m} cues={byMoment.get(m)!} now={now} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="q-card" style={{ width: "100%" }}>
          <div className="flex items-center gap-2">
            <span className="tg-orb" />
            <span className="tg-label" style={{ margin: 0 }}>
              What Q learned
            </span>
          </div>
          {insights.length ? (
            <ul className="mt-4 grid gap-4">
              {insights.map((i) => (
                <li key={i.id}>
                  <p className="tg-body" style={{ margin: 0, color: "var(--tg-text-soft)" }}>
                    {i.text}
                  </p>
                  <p className="tg-fine mt-1">
                    {i.calls?.outcome === "won" ? "From a win · " : i.calls?.outcome === "lost" ? "From a loss · " : ""}
                    {i.author_name ? `${i.author_name} · ` : ""}
                    {timeAgo(i.created_at, now)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tg-body mt-4">Nothing yet. End a call as won or lost and Q will learn from it.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function MomentCard({ moment, cues, now }: { moment: string; cues: Cue[]; now: number }) {
  const rate = (c: Cue) => (c.wins + 1) / (c.uses + 2);
  const sorted = [...cues].sort((a, b) => (a.status === b.status ? rate(b) - rate(a) : a.status === "active" ? -1 : 1));
  return (
    <div className="rounded-[var(--tg-radius-card)] border p-5" style={{ borderColor: "var(--tg-line)", background: "rgba(255,255,255,0.025)" }}>
      <h3 className="tg-headline" style={{ fontSize: 19 }}>
        {shortLabel(moment)}
      </h3>
      <ul className="mt-4 grid gap-4">
        {sorted.map((c) => {
          const isNew = !c.is_seed && now - new Date(c.created_at).getTime() < NEW_FOR_MS;
          const retired = c.status !== "active";
          return (
            <li key={c.id} style={{ opacity: retired ? 0.45 : 1 }}>
              <div className="flex items-start justify-between gap-3">
                <span style={{ font: "300 17px/1.3 var(--tg-font)", textDecoration: retired ? "line-through" : undefined, color: isNew ? "#fff" : "var(--tg-text-soft)", textShadow: isNew ? "0 0 18px rgba(255,255,255,0.45)" : undefined }}>
                  {c.cue_text.replace(/\.$/, "")}
                </span>
                {isNew && <span className="tg-chip on shrink-0" style={{ cursor: "default", padding: "2px 9px" }}>New</span>}
                {retired && <span className="tg-chip shrink-0" style={{ cursor: "default", padding: "2px 9px" }}>Retired</span>}
              </div>
              <p className="tg-fine mt-1">
                {c.author_name === "Q Starter" ? "Q starter playbook" : [c.author_name, c.author_city].filter(Boolean).join(" · ")}
                {c.author_name !== "Q Starter" ? ` · ${timeAgo(c.created_at, now)}` : ""} · {c.wins} won · {c.uses - c.wins} lost
              </p>
              {c.full_line && (
                <p className="tg-fine mt-1" style={{ color: "var(--tg-muted)" }}>
                  &ldquo;{c.full_line}&rdquo;
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
