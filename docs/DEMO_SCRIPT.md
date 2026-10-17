# Q: the live demo call

The exact call to film for Take 2: what Jordan Belfort (the buyer, on the phone in Meet) says, roughly what John says, and the nudges Q gave when we tested each line.

> **Status: tested Oct 17, about 1:55 AM PT, on localhost:3000 (same code as q-cue-to-close.vercel.app, finalized brain). Re-verify after the final brain update** with the commands in [Re-run the checks](#re-run-the-checks).
>
> **Reset before filming.** The learning test below added the move "Flip roles, let them sell it" (credited to John · Los Angeles) to the shared database, which local and Vercel both use. If you don't reset, Q will skip learning it on camera because it's already in the playbook.

## Before you film

1. **API credits:** open /test (or any Meet call) and get one nudge. If nothing comes back, the Anthropic credits ran out again.
2. **Reset:** /admin, enter the passcode, **Reset to seed**. This clears test calls, learned moves and lessons.
3. **Rehearse once and end it as Lost.** Run the call below with your helper, fumble the close on purpose, click End call, then **Lost**. It's your rehearsal, and it gives the "What Q learned" feed a real "From a loss" lesson to show. A lost call never adds moves, so the flip stays new for the real take.
4. **Q popup on the laptop:** name `John`, city `Los Angeles`, call length `10 min`, paste the company profile and brief below.
5. **Second Q card:** a second Chrome profile with Q loaded (Load unpacked from the extension folder), any name other than John. Open meet.google.com in a window you can show on screen. It has to be visible when the move lands, because Q pauses checking for new moves in hidden tabs.
6. **The phone:** joins the Meet as the buyer from another room. If you can, make its display name `Jordan` so the card says "Hearing Jordan…". The phone doesn't need captions on.
7. **Captions on the laptop:** press C, English.
8. **Join early.** Join the Meet on the laptop about 4.5 minutes before the first scripted line. The call clock starts when you join, so the stall lands in the Close window. Stay quiet (or muted) until you roll: everything said becomes part of the call Q reads.
9. **Recorder:** captures computer audio (see VIDEO.md). Earbuds on the laptop. Do Not Disturb on.
10. **Helper tip:** say each line in one breath. Meet finalizes a line after a short pause, so a long pause mid-line splits it in two.

## Paste into the Q popup

**Your company**

```text
John's Pen Co. sells one product: The Signer, a solid brass refillable ballpoint made for signing things that matter. Price: $40. Teams of 10 or more: $30 each. This week only: free engraving (initials or a name). Lifetime free refills. 30-day money-back guarantee, no questions asked. Ships in 2 business days; next-day delivery in Los Angeles. Ideal customer: people who sign contracts, leases, offers and checks. Never trash other brands. Never pressure.
```

**Brief for your next call**

```text
Buyer: Jordan, runs a brokerage and signs deals all day. Skeptical, impatient, hates being pitched. Goal: sell one engraved Signer on this call.
```

## The call, beat by beat

Call length 10 minutes. Clock times assume you joined about 4.5 minutes early. John's lines are a guide: say them your way, the way the nudge suggests.

| # | Clock | Jordan says | John says (roughly) | Nudge in testing (3 runs) |
|---|---|---|---|---|
| | | | "Hey Jordan, good to see you." | |
| 1 | ~4:30 | "Sell me this pen." | "Sure. What's your day like?" | 1 of 2 runs: `Ask what contracts they sign` (from Ana · Los Angeles). The other: no nudge. Don't count on one here. |
| 2 | ~4:45 | "I run a brokerage. I don't need a pen. I've got a drawer full of them." | "Fair. What's the last thing you signed that actually mattered?" | 3 of 3, same idea: `Ask what pen closes their deals` / `Ask which pen closes deals` / `Ask which pen closes his deals`, all from Ana · Los Angeles. Objection · No need. |
| | | "A ten-year lease on our new office. I sign it Friday." | "Then this is your Friday pen. Solid brass, refills for life, and we engrave your initials free this week." | Not tested. Q may stay quiet or nudge toward Friday. |
| 3 | ~5:20 | "Forty bucks for a pen? I get twenty for five dollars." | "You can. But it's forty bucks against a ten-year lease. One of those twenty skips on Friday, right in front of your landlord." | 3 of 3: `Compare $40 to ten-year lease` (twice) / `Compare $40 to that ten-year lease`, from Maya · Chicago. Objection · Price. |
| 4 | ~5:40 (Close window) | "Look, it's a nice pen. Let me think about it." | **Don't follow the nudge. Improvise the flip (below).** | 3 of 3 push to close: `Offer Friday's delivery, free engraving, guarantee` / `Offer to ship engraved before Friday` / `Offer to ship before Friday`, from Raj · San Jose. Objection · Stall. |
| 5 | | (long beat) "Because it's the signature people remember. It should feel like the deal. Fine. Can you get it to me before Friday?" | "Thursday, engraved. What initials?" | 3 of 3 close: `Say yes, ships in two days` / `Walk them through ordering now` / `Confirm Friday delivery, ask initials`, from Theo · Houston and Jules · San Diego. Closing · Ready to buy. |
| | | "J. B." | "Done. I'm sending the link now." | |

Then click **End call** on the card, then **Won**.

Tested speed: the server answered in 1.4 to 2.2 seconds (median about 1.6 s) across the 14 runs. The card adds Meet's caption settle (about half a second) on top.

## The winning move John improvises

At beat 4, the stall, John ignores the nudge and flips the famous test back on Belfort:

> "Let me flip it. You sell it to me. Why would you sign a ten-year lease with a two-dollar pen?"

Why this one: it's a real tactic (the buyer argues the case, so the reasons are his own), it isn't in the starting playbook, it calls back to the cold open, and it turns the stall straight into "Can you get it to me before Friday?"

**Verified with one learn call** (the full transcript above, outcome won, as John · Los Angeles). Claude learned exactly one move:

- **Move:** `Flip roles, let them sell it` (situation: Stall)
- **Lesson saved:** "Asking the buyer to argue the case made them voice their own reasons for buying, so they talked themselves out of the stall and into asking about delivery."
- **Call review:** turning point "After 'Let me think about it,' seller flipped the pitch and Jordan argued the signature should 'feel like the deal.'"
- The learn call returned in about 3 seconds, and the move showed up in `/api/updates` (what every other Q card checks every 3 seconds) on both localhost and the Vercel site.

So on camera expect John's card to toast `Q learned a new move from you: Flip roles, let them sell it` and the second card to toast `New move learned from John · Los Angeles`. The wording can vary a little between runs.

## After the call (keep recording)

1. End call → Meet leaves → card asks "How did it go?" → **Won**.
2. Wait for John's toast: `Q learned a new move from you: …` (a few seconds).
3. Bring the second Chrome window on screen. Within about 3 seconds: `New move learned from John · Los Angeles`.
4. Open /playbook: the new move under Stall with the **New** chip and John's real line; the "What Q learned" feed with this call's lesson (From a win) and the rehearsal's lesson (From a loss); scroll past a **Retired** move.

## If something breaks

| Problem | Fix |
|---|---|
| Card says "Press C to turn on captions" | Press C on the laptop. |
| Card doesn't seem to hear Jordan | Shift+D shows what Q hears. Check Jordan isn't muted and captions are English. |
| Captions won't read at all | Shift+B opens a box to type Jordan's lines. Label that take on screen. |
| A weak nudge | Keep going. Never edit a nudge in the video. Reshoot the beat if it matters. |
| Learning toast never comes | Check the API credits, then /playbook. If the move already exists, you forgot the reset. |
| Second card shows nothing | Its window must be visible, and its Q name must differ from John's. |

## Test log

All runs: Claude Sonnet 5.5 via `/api/cue` on localhost with the profile and brief above, `target_s` 600, and the nudges from earlier beats passed as `recent_nudges`, the way the card does.

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

Paste into a terminal. Each cue call costs about $0.0017; the loop makes 15. Change `API` to test the live site.

```bash
API=http://localhost:3000   # or https://q-cue-to-close.vercel.app
D=$(mktemp -d)
cat > "$D/profile.txt" <<'TXT'
John's Pen Co. sells one product: The Signer, a solid brass refillable ballpoint made for signing things that matter. Price: $40. Teams of 10 or more: $30 each. This week only: free engraving (initials or a name). Lifetime free refills. 30-day money-back guarantee, no questions asked. Ships in 2 business days; next-day delivery in Los Angeles. Ideal customer: people who sign contracts, leases, offers and checks. Never trash other brands. Never pressure.
TXT
cat > "$D/brief.txt" <<'TXT'
Buyer: Jordan, runs a brokerage and signs deals all day. Skeptical, impatient, hates being pitched. Goal: sell one engraved Signer on this call.
TXT
cat > "$D/call.json" <<'JSON'
[
 {"speaker":"You","text":"Hey Jordan, good to see you."},
 {"speaker":"Buyer","text":"Sell me this pen."},
 {"speaker":"You","text":"Sure. What's your day like?"},
 {"speaker":"Buyer","text":"I run a brokerage. I don't need a pen. I've got a drawer full of them."},
 {"speaker":"You","text":"Fair. What's the last thing you signed that actually mattered?"},
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
jq -n --slurpfile t "$D/call.json" '{outcome:"won", user_name:"John", user_city:"Los Angeles", shown_cue_ids:[], transcript:$t[0]}' |
  curl -s -X POST "$API/api/learn" -H 'Content-Type: application/json' -d @- |
  jq '{learned, lesson, turning_point}'
```

Pass: `learned` has one move along the lines of "Flip roles, let them sell it" under `stall`. If `learned` is empty, check whether the move is already in the playbook (reset) before blaming the brain.
