import Link from "next/link";
import { Fragment, Suspense } from "react";
import type { Turn } from "@/lib/claude";
import type { JudgedNudge, SavedReview } from "@/lib/review";
import { db } from "@/lib/supabase";
import QMark from "../../components/QMark";
import Verdict from "../../components/Verdict";

export const metadata = { title: "Call report · Q" };

type CallRow = {
  id: string;
  user_name: string | null;
  user_city: string | null;
  outcome: string | null;
  transcript: Turn[] | null;
  review?: SavedReview | null; // from supabase/migration-3
  created_at: string;
};

const WHEN = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Los_Angeles",
  timeZoneName: "short",
});

// One call, after the fact: how it ended, where it turned, the lesson, then the whole conversation with
// each of Q's nudges where the seller saw it and the review's verdict on it.
export default function CallPage({ params }: PageProps<"/call/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
      <header className="mb-10 flex items-center gap-4">
        <Link href="/" aria-label="Q home">
          <QMark size={52} font={20} />
        </Link>
        <div>
          <h1 className="tg-title" style={{ margin: 0 }}>
            Call report
          </h1>
          <p className="tg-sub" style={{ marginTop: 4 }}>
            After every call, Q checks each nudge it showed against what happened next.
          </p>
        </div>
      </header>
      <Suspense fallback={<p className="tg-body">Loading the call…</p>}>{params.then(({ id }) => <Report id={id} />)}</Suspense>
    </main>
  );
}

async function Report({ id }: { id: string }) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return <Missing />;
  const supabase = db();
  const { data, error } = await supabase.from("calls").select("*").eq("id", id).maybeSingle();
  if (error) return <p className="tg-body">Couldn&rsquo;t load this call. Is the database reachable?</p>;
  if (!data) return <Missing />;
  const call = data as CallRow;
  const turns = call.transcript ?? [];
  let review = call.review ?? null;
  if (!review) {
    // Before supabase/migration-3 the call keeps no review: list its verdicts, without where each nudge appeared
    const { data: rows } = await supabase.from("nudge_reviews").select("cue_id, nudge_text, verdict, reason").eq("call_id", id);
    if (rows?.length) {
      review = {
        turning_point: null,
        turning_line: null,
        lesson: null,
        nudges: rows.map((r) => ({ cue_id: r.cue_id, text: r.nudge_text, at_turn: null, verdict: r.verdict, reason: r.reason })),
      };
    }
  }
  const nudges = review?.nudges ?? [];
  // Older calls have no saved review: the lesson in the feed came from the same review
  let lesson = review?.lesson ?? null;
  if (!lesson) {
    const { data: insight } = await supabase.from("insights").select("text").eq("source_call", id).order("created_at").limit(1);
    lesson = insight?.[0]?.text ?? null;
  }

  // Each nudge goes right after the line it answered
  const after = new Map<number, JudgedNudge[]>();
  const unplaced: JudgedNudge[] = [];
  for (const n of nudges) {
    if (n.at_turn == null) unplaced.push(n);
    else after.set(n.at_turn, [...(after.get(n.at_turn) ?? []), n]);
  }
  const won = call.outcome === "won";

  return (
    <>
      <section className="q-card mb-12" style={{ width: "100%" }}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="q-cue" style={{ fontSize: 34 }}>
            {won ? "Won" : call.outcome === "lost" ? "Lost" : "Not recorded"}
          </span>
          <span className="tg-fine">
            {[call.user_name, call.user_city].filter(Boolean).join(" · ")}
            {call.user_name || call.user_city ? " · " : ""}
            {WHEN.format(new Date(call.created_at))}
          </span>
        </div>
        {review?.turning_point && (
          <>
            <p className="tg-label">Where it turned</p>
            <p className="tg-headline" style={{ fontSize: 20 }}>
              {review.turning_point}
            </p>
          </>
        )}
        {lesson && (
          <>
            <p className="tg-label">Lesson</p>
            <p className="tg-body" style={{ margin: 0, color: "var(--tg-text-soft)" }}>
              {lesson}
            </p>
          </>
        )}
        <p className="tg-label">Q&rsquo;s nudges</p>
        {review ? (
          <NudgeSummary nudges={nudges} />
        ) : (
          <p className="tg-body" style={{ margin: 0 }}>
            This call was recorded before Q started checking its nudges.
          </p>
        )}
      </section>

      <h2 className="tg-label" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        The call
      </h2>
      {turns.length ? (
        <ol className="grid gap-3">
          {(after.get(0) ?? []).map((n, k) => (
            <NudgeRow key={`n0-${k}`} n={n} />
          ))}
          {turns.map((t, i) => (
            <Fragment key={i}>
              <TurnRow turn={t} turning={review?.turning_line === i + 1} />
              {(after.get(i + 1) ?? []).map((n, k) => (
                <NudgeRow key={`n${i + 1}-${k}`} n={n} />
              ))}
            </Fragment>
          ))}
        </ol>
      ) : (
        <p className="tg-body">No transcript was saved for this call.</p>
      )}
      {unplaced.length > 0 && (
        <>
          <h2 className="tg-label mt-10" style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {unplaced.length === nudges.length ? "Q’s nudges on this call" : "Also shown, at a point Q didn’t record"}
          </h2>
          <ol className="grid gap-3">
            {unplaced.map((n, k) => (
              <NudgeRow key={k} n={n} />
            ))}
          </ol>
        </>
      )}
      <p className="tg-fine mt-10">
        <Link href="/playbook" className="tg-link">
          See the playbook
        </Link>{" "}
        &nbsp;Every verdict counts toward its move&rsquo;s record, and moves that keep misfiring get retired.
      </p>
    </>
  );
}

function NudgeSummary({ nudges }: { nudges: JudgedNudge[] }) {
  if (!nudges.length) return <p className="tg-body" style={{ margin: 0 }}>Q didn&rsquo;t show any nudges on this call.</p>;
  const n = (v: string) => nudges.filter((x) => x.verdict === v).length;
  const reviewed = nudges.filter((x) => x.verdict).length;
  if (!reviewed) return <p className="tg-body" style={{ margin: 0 }}>{nudges.length} shown. The review didn&rsquo;t finish for this call.</p>;
  return (
    <p className="tg-body" style={{ margin: 0, color: "var(--tg-text-soft)" }}>
      {n("helped")} of {reviewed} helped
      {n("hurt") ? ` · ${n("hurt")} hurt` : ""}
      {n("neutral") ? ` · ${n("neutral")} had no clear effect` : ""}
    </p>
  );
}

function TurnRow({ turn, turning }: { turn: Turn; turning: boolean }) {
  const seller = turn.speaker === "You";
  return (
    <li
      className="grid grid-cols-[56px_1fr] gap-3 rounded-[var(--tg-radius-row)] px-3 py-2"
      style={turning ? { background: "rgba(255,255,255,0.04)", boxShadow: "inset 2px 0 0 rgba(255,255,255,0.7)" } : undefined}
    >
      <span className="tg-fine" style={{ paddingTop: 2 }}>
        {seller ? "Seller" : "Buyer"}
      </span>
      <div className="min-w-0">
        <p className="tg-body" style={{ margin: 0, color: seller ? "var(--tg-muted)" : "var(--tg-text-soft)" }}>
          {turn.text}
        </p>
        {turning && <p className="tg-fine mt-1">The call turned here</p>}
      </div>
    </li>
  );
}

function NudgeRow({ n }: { n: JudgedNudge }) {
  return (
    <li
      className="ml-[68px] rounded-[var(--tg-radius-card)] border px-4 py-3 max-sm:ml-4"
      style={{ borderColor: n.verdict === "hurt" ? "rgba(255, 170, 95, 0.3)" : "var(--tg-line)", background: "rgba(18,18,18,0.62)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="tg-orb shrink-0" style={{ width: 7, height: 7 }} />
          <span style={{ font: "300 19px/1.25 var(--tg-font)", color: "var(--tg-text)" }}>{n.text.replace(/\.$/, "")}</span>
        </div>
        <Verdict verdict={n.verdict} />
      </div>
      {n.reason && (
        <p className="tg-fine mt-1" style={{ color: "var(--tg-muted)" }}>
          {n.reason}
        </p>
      )}
    </li>
  );
}

function Missing() {
  return (
    <p className="tg-body">
      There&rsquo;s no call here. It may have been cleared.{" "}
      <Link href="/playbook" className="tg-link">
        See the playbook
      </Link>
    </p>
  );
}
