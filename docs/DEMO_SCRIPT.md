# Q: the live demo call

The exact call to film for the live demo: what the buyer (your helper, on the phone in Meet, playing a brokerage owner named John) says, roughly what you say as the seller, and the nudges Q gave when we tested each line. The names mirror the film's call in the hook: the buyer is John, and your Q card goes by Jordan (city Long Island), so the move you teach Q is credited "Jordan · Long Island", the same as the hook's toast. Nobody plays Belfort (the film clip covers him), so no costume and no impression; "Sell me this pen" stays as the nod to the film.

> **Schedule (confirmed):** Devpost closes submissions at **11:00 AM PT**. Film around **8:30 to 9:45 AM** and **submit by 10:45 AM**.
>
> **Status:** the test log below ran Oct 17, about 1:55 AM PT, on Claude Sonnet 5.5. Live nudges now run on **Claude Opus 5.5 in fast mode** (Sonnet 5.5 as fallback) with listen-ahead, so on the live site nudges land about a second after the buyer stops, and the wording may differ a little. John's lines were also changed so he acts on each nudge. Run [Re-run the checks](#re-run-the-checks) once before filming if there's time.
>
> **Reset before filming.** The learning test below added the move "Flip roles, let them sell it" (credited to John · Los Angeles, the popup's old name and city) to the shared database, which local and Vercel both use. If you don't reset, Q will skip learning it on camera because it's already in the playbook.

## Before you film

1. **API credits:** open /test (or any Meet call) and get one nudge. If nothing comes back, the Anthropic credits ran out again.
2. **Reset:** /admin, enter the passcode, **Reset to seed**. This clears test calls, learned moves and lessons.
3. **Rehearse once and end it as Lost.** Run the call below with your helper, acting on the nudges as you go, fumble the close on purpose, click End call, then **Lost**. It's your rehearsal, and it gives the "What Q learned" feed a real "From a loss" lesson and the review a real call to judge. A lost call never adds moves, so the flip stays new for the real take. Whatever the review says about the rehearsal's nudges is what shows in "What Q got wrong"; don't try to force a result.
4. **Q popup on the laptop:** name `Jordan`, city `Long Island`, call length `10 min`, paste the company profile and brief below. Your learned move then shows "Learned from Jordan · Long Island", and the second card's toast reads "New move learned from Jordan · Long Island", matching the hook.
5. **Second Q card:** a second Chrome profile with Q loaded (Load unpacked from the extension folder), any name other than Jordan. Open meet.google.com in a window you can show on screen. It has to be visible when the move lands, because Q pauses checking for new moves in hidden tabs.
6. **The phone:** joins the Meet as the buyer from another room, with the display name `John`, so the card says "Hearing John…" (the same name as the buyer Jordan calls in the film). The phone doesn't need captions on.
7. **Captions on the laptop:** press C, English.
8. **Join early.** Join the Meet on the laptop about 4.5 minutes before the first scripted line. The call clock starts when you join, so the stall lands in the Close window. Stay quiet (or muted) until you roll: everything said becomes part of the call Q reads.
9. **Recorder:** captures computer audio (see VIDEO.md). Earbuds on the laptop. Do Not Disturb on.
10. **Helper tip:** say each line in one breath. Meet finalizes a line after a short pause, so a long pause mid-line splits it in two.

## Paste into the Q popup

**Your company**

```text
Signer Pen Co. sells one product: The Signer, a solid brass refillable ballpoint made for signing things that matter. Price: $40. Teams of 10 or more: $30 each. This week only: free engraving (initials or a name). Lifetime free refills. 30-day money-back guarantee, no questions asked. Ships in 2 business days; next-day delivery in Los Angeles. Ideal customer: people who sign contracts, leases, offers and checks. Never trash other brands. Never pressure.
```

**Brief for your next call**

```text
Buyer: John, runs a brokerage and signs deals all day. Skeptical, impatient, hates being pitched. Goal: sell one engraved Signer on this call.
```

## The call, beat by beat

Call length 10 minutes. Clock times assume you joined about 4.5 minutes early.

**How to play it:**
- **Act on every nudge Q gives, in your own words.** That's how Q is meant to be used, and it's the honest way to a good review: the after-call review only counts a nudge as helped if you used it and the buyer moved forward. The one exception is beat 4, where you go off the playbook on purpose.
- **Give the card a beat.** The nudge lands about a second after John stops. Glance at it, then answer.
- Your lines below are a guide. If the card shows a different nudge from the one in the table, act on the one the card shows.
- **Play the whole call, even though the video shows part of it.** The edit keeps John's "Sell me this pen", beat 2 and your answer, the lease line, beat 4 with the flip, and beat 5 (see VIDEO.md, 0:47 to 1:10). Your opener, the price beat and the "J. B." exchange are cut from the video, but they still feed the call report, and the lease line sets up the flip.

| # | Clock | John (buyer) says | You say (roughly) | Nudge in testing (3 runs) |
|---|---|---|---|---|
| | | | "Hey John, good to see you." | |
| 1 | ~4:30 | "Sell me this pen." | "Sure. First, what do you sign in a normal week?" (acts on the nudge if one shows; still a good opener if none does) | 1 of 2 runs: `Ask what contracts they sign` (from Ana · Los Angeles). The other: no nudge. Don't count on one here. |
| 2 | ~4:45 | "I run a brokerage. I don't need a pen. I've got a drawer full of them." | "Fair. So which pen closes your deals? What's the next big one you're signing?" | 3 of 3, same idea: `Ask what pen closes their deals` / `Ask which pen closes deals` / `Ask which pen closes his deals`, all from Ana · Los Angeles. Objection · No need. |
| | | "A ten-year lease on our new office. I sign it Friday." | "Then this is your Friday pen. Solid brass, refills for life, and we engrave your initials free this week." (If a nudge shows here, act on it instead.) | Not tested. Q may stay quiet or nudge toward Friday. |
| 3 | ~5:20 | "Forty bucks for a pen? I get twenty for five dollars." | "You can. But it's forty bucks against a ten-year lease. One of those twenty skips on Friday, right in front of your landlord." | 3 of 3: `Compare $40 to ten-year lease` (twice) / `Compare $40 to that ten-year lease`, from Maya · Chicago. Objection · Price. |
| 4 | ~5:40 (Close window) | "Look, it's a nice pen. Let me think about it." | **Don't follow the nudge. Improvise the flip (below).** The review will mark this nudge Neutral, because you didn't use it. That's expected. | 3 of 3 push to close: `Offer Friday's delivery, free engraving, guarantee` / `Offer to ship engraved before Friday` / `Offer to ship before Friday`, from Raj · San Jose. Objection · Stall. |
| 5 | | (long beat) "Because it's the signature people remember. It should feel like the deal. Fine. Can you get it to me before Friday?" | "Thursday, engraved. What initials?" (fits all three tested nudges: say yes, confirm delivery, ask for the initials) | 3 of 3 close: `Say yes, ships in two days` / `Walk them through ordering now` / `Confirm Friday delivery, ask initials`, from Theo · Houston and Jules · San Diego. Closing · Ready to buy. |
| | | "J. B." | "Done. I'm sending the link now." | |

Then click **End call** on the card, then **Won**.

**Speed:** on the live site (Claude Opus 5.5 in fast mode, with listen-ahead), nudges landed about a second after the buyer stopped (1.0 to 1.3 s in a realistic-pace test call). The test log below is older: Sonnet 5.5, server time only, 1.4 to 2.2 seconds.

## Optional: show the clock adapt

John is the rushed type, so one extra line lets the card's clock visibly follow him. **Untested with the full call:** try it in the rehearsal first. If the nudges get worse, drop it, and the video uses the landing page's clock demo instead.

- At beat 1, John says: **"I've only got three minutes. Sell me this pen."**
- About two seconds after he stops, the card should show something like `Buyer's short on time · wrap up by 8 min`, and the clock paces toward the new target from then on. With an 8-minute target, the stall still lands in the Close window (the clock reads `Close window · 5 of 8 min`), and the bar turns amber about 6.5 minutes in.
- Everything else stays as written. Don't use "five minutes": at about 4:30 into a 10-minute target, five more minutes doesn't move the clock.

## The verdicts are real

- After the call, Q's review judges every nudge from what happened right after it (did you use it, did John move toward yes or pull back). Never stage, fake or edit a verdict, the result toast or the call report.
- If a take ends with most nudges ignored (a missed line, a fumble), **reshoot the call** rather than editing around the report. Reset at /admin first.

## The winning move John improvises

At beat 4, the stall, John ignores the nudge and flips the famous test back on the buyer:

> "Let me flip it. You sell it to me. Why would you sign a ten-year lease with a two-dollar pen?"

Why this one: it's a real tactic (the buyer argues the case, so the reasons are his own), it isn't in the starting playbook, it hands the film's "Sell me this pen" back to the buyer, and it turns the stall straight into "Can you get it to me before Friday?"

**Verified with one learn call**, run before the names changed (the full transcript, with John's earlier wording at beats 1 and 2 and the buyer named Jordan; outcome won, as John · Los Angeles). Claude learned exactly one move:

- **Move:** `Flip roles, let them sell it` (situation: Stall)
- **Lesson saved:** "Asking the buyer to argue the case made them voice their own reasons for buying, so they talked themselves out of the stall and into asking about delivery."
- **Call review:** turning point "After 'Let me think about it,' seller flipped the pitch and Jordan argued the signature should 'feel like the deal.'"
- The learn call returned in about 3 seconds, and the move showed up in `/api/updates` (what every other Q card checks every 3 seconds) on both localhost and the Vercel site.

So on camera expect John's card to toast `Q learned a new move from you: Flip roles, let them sell it` and the second card to toast `New move learned from Jordan · Long Island`. The wording can vary a little between runs.

## After the call (keep recording)

1. End call → Meet leaves → card asks "How did it go?" → **Won**.
2. Wait for John's toast: `Q learned a new move from you: …` (a few seconds). About 3 seconds later a second toast says how Q's nudges did on this call. Film it as it is.
3. Bring the second Chrome window on screen. Within about 3 seconds: `New move learned from Jordan · Long Island`.
4. Back on John's card, click **See the call report**. Scroll slowly: where the call turned, the lesson, and each nudge at the line where it appeared, with its verdict (Helped, Neutral or Hurt) and reason.
5. Open /playbook: the new move under Stall with the **New** chip, `Jordan · Long Island` and John's real line; the "What Q learned" feed with this call's lesson (From a win) and the rehearsal's lesson (From a loss); the "What Q got wrong" panel; scroll past a **Retired** move.

## If something breaks

| Problem | Fix |
|---|---|
| Card says "Press C to turn on captions" | Press C on the laptop. |
| Card doesn't seem to hear John | Shift+D shows what Q hears. Check John isn't muted and captions are English. |
| Captions won't read at all | Shift+B opens a box to type John's lines. Label that take on screen. |
| A weak nudge | Keep going. Never edit a nudge in the video. Reshoot the beat if it matters. |
| Learning toast never comes | Check the API credits, then /playbook. If the move already exists, you forgot the reset. |
| No result toast or call report link | The review may still be running or may have failed. Open /playbook: "What Q got wrong" shows how many nudges were checked. Don't fake the shot; reshoot if it matters. |
| Most nudges ignored on the take | Reshoot the call (reset at /admin first). Don't edit around the report. |
| Second card shows nothing | Its window must be visible, and its Q name must be something other than Jordan. |

## Test log

All runs: Claude Sonnet 5.5 via `/api/cue` on localhost with the profile and brief above, `target_s` 600, and the nudges from earlier beats passed as `recent_nudges`, the way the card does. This was before live nudges moved to Claude Opus 5.5 in fast mode, before John's lines at beats 1 and 2 changed, and before the names changed (the brief then said "Buyer: Jordan" and the opener "Hey Jordan"); times are server time only.

| Beat | Clock sent | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| 1 Sell me this pen | 270 s | `Ask what contracts they sign` (tough question, 2.1 s) | no nudge (1.2 s) | not run (budget) |
| 2 No need | 285 s | `Ask what pen closes their deals` (1.5 s) | `Ask which pen closes deals` (1.4 s) | `Ask which pen closes his deals` (1.7 s) |
| 3 Price | 320 s | `Compare $40 to ten-year lease` (1.7 s) | `Compare $40 to that ten-year lease` (1.6 s) | `Compare $40 to ten-year lease` (1.6 s) |
| 4 Stall | 340 s | `Offer Friday's delivery, free engraving, guarantee` (1.7 s) | `Offer to ship engraved before Friday` (1.6 s) | `Offer to ship before Friday` (1.5 s) |
| 5 Ready | 360 s | `Say yes, ships in two days` (1.7 s) | `Walk them through ordering now` (2.2 s) | `Confirm Friday delivery, ask initials` (1.5 s) |

Notes:
- Credits like Ana · Los Angeles and Maya · Chicago come from the starter playbook, which is sample data for this demo (moves, names and records), as the site says. The move John teaches Q on camera is the real one.
- Buyer tag: Skeptical on every beat except Price (Price-focused).
- Beats 4 and 5 were tested with a shorter version of John's price answer ("You can. And one of those twenty skips on Friday, right in front of your landlord."). The buyer lines are identical. The re-run commands use the script version.
- Spend: 15 cue calls and 1 learn call in total.

## Re-run the checks

Paste into a terminal. Each cue call costs about $0.0017 on our standard model, more on the live Opus fast-mode setup; the loop makes 15. Change `API` to test the live site.

```bash
API=http://localhost:3000   # or https://qcloser.vercel.app
D=$(mktemp -d)
cat > "$D/profile.txt" <<'TXT'
Signer Pen Co. sells one product: The Signer, a solid brass refillable ballpoint made for signing things that matter. Price: $40. Teams of 10 or more: $30 each. This week only: free engraving (initials or a name). Lifetime free refills. 30-day money-back guarantee, no questions asked. Ships in 2 business days; next-day delivery in Los Angeles. Ideal customer: people who sign contracts, leases, offers and checks. Never trash other brands. Never pressure.
TXT
cat > "$D/brief.txt" <<'TXT'
Buyer: John, runs a brokerage and signs deals all day. Skeptical, impatient, hates being pitched. Goal: sell one engraved Signer on this call.
TXT
cat > "$D/call.json" <<'JSON'
[
 {"speaker":"You","text":"Hey John, good to see you."},
 {"speaker":"Buyer","text":"Sell me this pen."},
 {"speaker":"You","text":"Sure. First, what do you sign in a normal week?"},
 {"speaker":"Buyer","text":"I run a brokerage. I don't need a pen. I've got a drawer full of them."},
 {"speaker":"You","text":"Fair. So which pen closes your deals? What's the next big one you're signing?"},
 {"speaker":"Buyer","text":"A ten-year lease on our new office. I sign it Friday."},
 {"speaker":"You","text":"Then this is your Friday pen. Solid brass, refills for life, and we engrave your initials free this week."},
 {"speaker":"Buyer","text":"Forty bucks for a pen? I get twenty for five dollars."},
 {"speaker":"You","text":"You can. But it's forty bucks against a ten-year lease. One of those twenty skips on Friday, right in front of your landlord."},
 {"speaker":"Buyer","text":"Look, it's a nice pen. Let me think about it."},
 {"speaker":"You","text":"Let me flip it. You sell it to me. Why would you sign a ten-year lease with a two-dollar pen?"},
 {"speaker":"Buyer","text":"Because it's the signature people remember. It should feel like the deal. Fine. Can you get it to me before Friday?"},
 {"speaker":"You","text":"Thursday, engraved. What initials?"},
 {"speaker":"Buyer","text":"J. B."},
 {"speaker":"You","text":"Done. I'm sending the link now."}
]
JSON

# cue TURNS ELAPSED_S 'NUDGES_ALREADY_SHOWN': sends the first TURNS lines of the call, like the card would
cue() {
  jq -n --rawfile p "$D/profile.txt" --rawfile b "$D/brief.txt" --argjson t "$(jq -c ".[0:$1]" "$D/call.json")" --argjson el "$2" --argjson r "$3" \
    '{turns:$t, stats:{elapsed_s:$el, target_s:600}, profile:$p, brief:$b, recent_nudges:$r}' |
  curl -s -X POST "$API/api/cue" -H 'Content-Type: application/json' -d @- |
  jq -c '{nudge: .cue.cue_text, move: .cue.move, from: .cue.author_name, moment: .objection_type, ms}'
}

echo "1 Sell me this pen";  for i in 1 2 3; do cue 2  270 '[]'; done
echo "2 No need";           for i in 1 2 3; do cue 4  285 '["Ask what contracts they sign"]'; done
echo "3 Price";             for i in 1 2 3; do cue 8  320 '["Ask what contracts they sign","Ask which pen closes deals"]'; done
echo "4 Stall";             for i in 1 2 3; do cue 10 340 '["Ask what contracts they sign","Ask which pen closes deals","Compare $40 to ten-year lease"]'; done
echo "5 Ready";             for i in 1 2 3; do cue 12 360 '["Ask what contracts they sign","Ask which pen closes deals","Compare $40 to ten-year lease","Offer to ship engraved before Friday"]'; done
```

Learning check (one call, run after the block above so `$D` and `$API` are set). **It writes to the shared database: reset at /admin before filming.**

```bash
jq -n --slurpfile t "$D/call.json" '{outcome:"won", user_name:"Jordan", user_city:"Long Island", shown_cue_ids:[], transcript:$t[0]}' |
  curl -s -X POST "$API/api/learn" -H 'Content-Type: application/json' -d @- |
  jq '{learned, lesson, turning_point}'
```

Pass: `learned` has one move along the lines of "Flip roles, let them sell it" under `stall`. If `learned` is empty, check whether the move is already in the playbook (reset) before blaming the brain.
