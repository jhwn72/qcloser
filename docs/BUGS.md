# Q bug hunt: Oct 17, about 2:10 AM PT

Ranked by risk to the 1:15 PM live demo. Line numbers are from the code at commit `63d2311`.

**Status labels**
- **Reproduced:** seen on the stand-in Meet page (`extension/dev/meet.html`), with curl, or in the server log.
- **Simulated:** the code was copied into node (`/tmp/qbugs/merge.test.mjs`) and fed Meet-like rewrites.
- **Suspected:** from reading the code only.

The stand-in tests used a mocked `/api/cue` with a set delay where timing mattered. Real Meet's caption DOM may differ from the stand-in, so the caption items marked "suspect for real Meet" should be checked once with Shift+D on a real call.

---

## Demo-breaking

### 1. The Anthropic credit ran out, and every nudge and every learn failed

**Status:** Reproduced (server log and curl, local and Vercel).

**Where:** `web/lib/claude.ts:227`, `web/app/api/cue/route.ts:127`.

**What happens:**
- From about 1:47 to 1:53 AM PT, every Claude call returned `400 "Your credit balance is too low"`. That was 154 errors in the dev log.
- `/api/cue` returned 502 on both localhost and q-cue-to-close.vercel.app, so the card would say "Can't reach Q" on every buyer line.
- `/api/learn` swallows both Claude failures (`Promise.allSettled`). It still saves the call and answers `ok: true, learned: []`. The card then toasts a plain "Win recorded.", so the learning moment silently fails.
- The heaviest caller in the log was `/api/dev/judge` (Opus, adaptive thinking, 8000 max tokens), driven by `scripts/compare-cues.py`: 136 failed judge calls after the balance hit zero.
- Credit was back by 1:55 AM PT; local and Vercel both returned nudges in 1.3 to 1.6 s.

**Fix:**
- Turn on auto-reload in the Anthropic console, and check the balance about an hour before 1:15.
- Don't run the compare scripts (the Opus judge) on demo day.
- Give the dev scripts their own API key, so evals can't drain the key Vercel uses.
- Optional: have the cue route answer `{ error: "ai_unavailable" }`, and have the card say "Q's AI is unavailable", so the cause is obvious on stage.

---

## Serious

### 2. A nudge that lands after End call replaces "How did it go?" and leaks into the next call

**Status:** Reproduced.

**Where:** `extension/content.js:231-268` (requestCue), `571-583` (endCall/askOutcome), `642` (startNewCall).

**What happens:**
- In the demo script, John clicks End call right after Jordan's last line, while that line's nudge is still in flight (about 1.6 s).
- The response calls `showCue` and replaces "How did it go?" with the nudge. Won/Lost stay up under it.
- If Won is clicked first, the late nudge appears on the fresh "Listening for the buyer…" card. Its `cue_id` and text then go into the *next* call's `shownCueIds` and `recentNudges`.
- A `q.again` follow-up request can fire after End call too.

**Repro:**
1. Shift+B, type a buyer line, press Enter.
2. Within the response time, click End call. "How did it go?" shows, then the nudge replaces it.
3. Click Won before the response lands: the nudge shows on the new idle card.

**Fix:** add a call generation counter, and ignore anything that comes back for an old one.

```js
// state: gen: 0
function askOutcome() { q.gen++; /* existing body */ }
function startNewCall() { q.gen++; /* existing body */ }

async function requestCue() {
  if (q.askingOutcome) return;
  if (q.busy) { q.again = true; return; }
  const gen = q.gen;
  q.busy = true;
  refreshStatus();
  const res = await api(/* unchanged */);
  q.busy = false;
  if (gen !== q.gen) { q.again = false; refreshStatus(); return; } // the call ended while Q was thinking
  // ...rest unchanged
}
```

### 3. The pacing timer counts silence as the seller talking, and it fires during "How did it go?"

**Status:** Reproduced.

**Where:** `extension/content.js:221` (streak), `442-445` (checkPacing).

**What happens:**
- `seller_streak_s` runs from the first seller turn of the current streak to *now*, so silence counts as talking.
- The demo plan joins about 4.5 minutes early. One sound-check line from John ("Jordan, can you hear me?") starts a pacing request every 30 s.
- Those requests tell Claude "seller has been talking for 200+ seconds straight". A phantom pacing nudge can then appear before the script starts. It goes into `recent_nudges`, steers later nudges, and is credited with the win.
- `checkPacing` doesn't check `q.askingOutcome` either. If Meet didn't actually leave (host "end for everyone" dialog, a missed click), the timer replaces "How did it go?" after 45 s.
- Skip doesn't help here, because it also restarts the clock the demo relies on.

**Repro:** type one "You" line, click End call, and wait 45 s. A request goes out with `seller_streak_s: 45` while nobody spoke, and its nudge replaces the outcome question.

**Fix:** only check pacing while the seller is actually speaking.

```js
function checkPacing() {
  if (!cap.inCallSince || q.busy || q.askingOutcome || !q.turns.length) return;
  if (!(q.live && q.live.speaker === "You" && Date.now() - q.live.at < 3000)) return; // seller talking right now
  if (callStats().seller_streak_s >= PACING_STREAK_S && Date.now() - q.lastCueAt > PACING_GAP_MS) requestCue();
}
```

### 4. If the popup name equals the buyer's Meet name, the buyer is filed as "You" and Q never nudges

**Status:** Reproduced.

**Where:** `extension/content.js:326-329` (isMe).

**What happens:**
- `isMe` treats any caption whose name equals the popup name as the seller.
- If both accounts show the same name (say John demos against his own second account, or the popup says "John Wang" and so does the other side), every buyer line becomes "You" and no `/api/cue` request is sent.
- Meet's English UI already labels your own captions "You", so the name match is only needed as a fallback.
- The current demo plan (John vs Jordan) is safe. Keep the names different.

**Fix:** use the name match only when Meet never shows "You".

```js
function isMe(name) {
  const n = (name || "").trim().toLowerCase();
  if (n === "you") return (cap.sawYou = true);
  return !cap.sawYou && !!q.name && n === q.name.trim().toLowerCase();
}
```

### 5. The Buyer/You toggle in the typing box ignores mouse clicks

**Status:** Reproduced.

**Where:** `extension/content.js:666-671`.

**What happens:**
- The fallback (Shift+B) is in the demo's "if something breaks" plan.
- `pointerdown` on the "You" segment starts a drag and calls `card.setPointerCapture`. The `pointerup` and `click` events are then retargeted to the card, so the `whoEl` click handler never runs.
- Event trace: `pointerdown target=SPAN You`, `pointerup target=q`, `click target=q`.
- Tab still toggles.

**Fix:**

```js
if (e.button !== 0 || e.target.closest("button, input, [data-who], .q-debug")) return;
```

### 6. Rejoining before answering wipes the call, and a single missed Leave-button check would too

**Status:** Reproduced.

**Where:** `extension/content.js:385-393`.

**What happens:**
- If you leave with Meet's own button and click Rejoin before answering Won/Lost, the next 1 s check calls `startNewCall()`. The question disappears and the transcript is dropped unrecorded.
- The same path runs if Meet's Leave call button is missing from the DOM for a single check (a toolbar re-render). That would mean an outcome prompt mid-call, then a wiped transcript one second later. This trigger is a suspicion for real Meet.

**Repro:** on the stand-in, remove `.bar i.end`. "How did it go?" appears. Put it back: the card is idle and the transcript is empty.

**Fix:**

```js
let missing = 0; // consecutive 1 s checks without Meet's Leave button
// in tickCaptions:
const calling = inCall();
missing = calling ? 0 : missing + 1;
if (calling && !cap.inCallSince) {
  cap.inCallSince = now;
  if (!q.askingOutcome) startNewCall(); // rejoined before answering: keep the question up
}
if (missing >= 3 && cap.inCallSince) {
  cap.inCallSince = 0;
  if (q.turns.length && !q.askingOutcome) askOutcome();
}
```

### 7. No timeouts on the live path: one hung Claude call stalls every later nudge

**Status:** Suspected.

**Where:** `web/lib/claude.ts:39` (`new Anthropic()`: 10 min timeout, 2 retries), `extension/background.js:6` (fetch with no timeout).

**What happens:** `q.busy` stays true until the call returns. If it hangs, the card shows "Thinking…" and every new buyer line only sets `q.again`. On Vercel the function itself can run up to its max duration.

**Fix:**

```ts
// claude.ts, readMoment
const res = await client.messages.parse({ /* unchanged */ }, { timeout: 10_000, maxRetries: 1 });
```

```js
// background.js
fetch(url, { /* unchanged */ signal: AbortSignal.timeout(msg.path.startsWith("/api/learn") ? 60000 : 12000) })
```

### 8. "Can't reach Q" sticks after one failed request, and the warm-up can't detect an AI outage

**Status:** Reproduced (the warm-up said "Listening" during the outage). The rest is from reading.

**Where:** `extension/content.js:248`, `713-716`, `609-621`.

**What happens:**
- A single failure (a 529, or a network blip) sets `q.error`, and only the next successful cue clears it. The red "Can't reach Q" stays up until the buyer speaks again.
- The warm-up GET only touches the database. It said "Listening" during the credit outage, so the presenter gets no warning before the call.

**Fix:**
- Clear `q.error` on a successful poll.
- Treat a single cue failure as a short note (`q.note = { text: "Missed that one", until: Date.now() + 4000 }`) and show the error only after 2 failures in a row.
- Optionally have the warm-up make a tiny Claude call, which also primes the prompt cache. The first nudge of a session currently pays an approximately 8k-token cache write: about 2.2 s instead of 1.4 s in the log.

### 9. After Meet rewrites and trims a long caption, new buyer words stop triggering nudges

**Status:** Simulated. Suspect for real Meet.

**Where:** `extension/content.js:335-345` (mergeCaption), `369-371`.

**What happens:**
- When Meet trims the front of a long block and also revises the first visible words (or their case), `mergeCaption` finds no 3-word overlap and falls back to `neu`. The turn text shrinks, but `sentWords` keeps the old, larger count.
- In the simulation, a buyer goes from 20 words to 10. The new objection ("…was my partner who handles the money") never fires a request. The trim also drops the earlier words from the transcript.
- A case change alone is enough: `"so we tried it. then it broke…"` followed by `"Then it broke and we quit…"` loses "so we tried it."

**Fix:**

```js
const n = words(merged);
if (n < st.turn.sentWords) st.turn.sentWords = n; // Meet rewrote the block: count new words from here
```

Also compare words case- and punctuation-insensitively in the overlap search, for example by matching `w.toLowerCase().replace(/[^\w']/g, "")`.

### 10. Caption edge cases: misattributed speaker, duplicate turns, an extra nudge

**Status:** Reproduced on the stand-in by editing its DOM. Suspect for real Meet.

**Where:** `extension/content.js:304-324`, `350-364`.

**What happens:**
- **Name-only block (≥0.5 s before words arrive).** `parseBlock` sees one text part, treats the *name* as the words, and creates the turn as "Buyer" with no name. When John's words arrive, the turn keeps speaker "Buyer". The seller's pitch goes to Claude and `/api/learn` as the buyer's line.
- **Avatar `<img>` replaced mid-sentence.** A second, duplicate turn is created: "I just don't think", then "I just don't think I can afford it right now".
- **Captions turned off and on, with Meet re-rendering recent lines.** "Captions off" shows correctly. On re-enable, both visible lines are re-read as new turns, and a duplicate cue request goes out.

**Fix:**
- For avatar blocks, return `text: ""` when there's only one text part. Real Meet blocks always have a name.
- Re-set `st.turn.speaker` whenever a name is present.
- Before `addTurn`, look back over the last 6 turns for the same speaker whose normalized text equals or starts this block's text, and adopt that turn instead of adding a new one.

### 11. On the public site, anyone can poison the playbook, retire moves, or burn the API budget

**Status:** Suspected (not exercised against production).

**Where:** `web/app/api/learn/route.ts`, `web/app/api/cue/route.ts`.

**What happens:**
- The backend URL is in the public repo (`extension/config.js`) and the install page.
- **Poisoning:** `POST /api/learn` with `outcome: "won"`, any transcript, and any `user_name`/`user_city` (no length limit). It inserts moves into the shared playbook, and every open card toasts "New move learned from <that name>". That could happen during the demo.
- **Retiring moves:** 8 or more cheap "lost" calls with `shown_cue_ids` retire any move whose id they know. `/api/cue` and `/api/updates` both return ids.
- **Cost:** `/api/cue` caps the number of turns at 80, but not their length. Up to about 4.5 MB per request reaches Sonnet. That ties directly to item 1.
- Admin routes are now gated by `ADMIN_KEY` in production; the deployed CORS headers already include `x-admin-key`. Confirm `ADMIN_KEY` is set in Vercel. If it isn't, reset from localhost, which uses the same database and is open in dev.

**Smallest fix:** caps and type checks (snippet in item 12), plus an Anthropic monthly spend limit. Post-hackathon: authenticate learn, or sign the cue ids the server hands out.

```ts
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");
const userName = clip(body.user_name, 40) || "A Q user";
const userCity = clip(body.user_city, 40) || null;
const shownIds = [...new Set((Array.isArray(body.shown_cue_ids) ? body.shown_cue_ids : []).filter((id) => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id)))].slice(0, 30);
```

---

## Minor

### 12. Odd input crashes the routes with 500s

**Status:** Reproduced.

**Where:** `cue/route.ts:99`, `143`; `learn/route.ts:30-33`, `49`.

**What happens:**
- These requests all return 500 with an empty body and no CORS headers: a `null` body, `turns`/`transcript` not an array, `exclude: 5`, `transcript[].text` not a string, `user_name: 5`.
- A non-array `shown_cue_ids` would crash *after* the call row is inserted, leaving a partial write.

**Fix:**

```ts
if (!body || typeof body !== "object") return json(req, { error: "Body must be a JSON object" }, 400);
const turns = (Array.isArray(body.turns) ? body.turns : [])
  .filter((t) => t && typeof t.text === "string" && t.text.trim())
  .slice(-MAX_TURNS)
  .map((t) => ({ speaker: t.speaker === "You" ? "You" : "Buyer", text: t.text.slice(0, 1000) }) as Turn);
const exclude = new Set(Array.isArray(body.exclude) ? body.exclude : []);
```

Use the same pattern for `transcript` in learn.

### 13. CORS accepts any origin that starts with `http://localhost`

**Status:** Reproduced on Vercel: `Origin: http://localhost.evil.example` is echoed back.

**Where:** `web/lib/cors.ts:7`.

**Fix:**

```ts
try { const u = new URL(origin); if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return origin; } catch {}
```

### 14. The "How did it go?" question appears dimmed when the last nudge is over a minute old

**Status:** Reproduced: computed opacity 0.45.

**Where:** `extension/content.js:423` sets `.stale`, and only `257` removes it.

**What happens:** the stale class also carries onto the idle text after Skip/Won.

**Fix:** call `cueEl.classList.remove("stale")` inside `showCue`'s timeout. Related: `q.live` isn't cleared in `startNewCall`, so the old call's last "heard" line lingers on the new card for up to 6 s.

### 15. Toasts for moves learned elsewhere can repeat, get lost, or be missed

**Status:** Suspected.

**Where:** `extension/content.js:609-621`, `web/app/api/updates/route.ts:10,31`.

**What happens:**
- Polls have no in-flight guard. If a poll takes over 3 s (cold start, slow DB), two polls share one `since` and the same toast fires twice.
- Several moves in one poll overwrite each other's toast, so only the last one shows.
- When nothing is returned, the cursor is the server's clock, not the database's. If the server clock is ahead, a move saved in that gap is skipped. This is small with Vercel and Supabase both on NTP.
- Own-move filtering is by name and city only, so two people both left as "A Q user" never see each other's moves.

**Fix:**
- Add a `polling` flag.
- Keep a `seen` Set of cue ids and queue the toasts.
- When no rows come back, have the server return `now` minus 5 s and rely on the client's id dedupe.

### 16. Reloading the extension while Meet is open leaves a dead card that says "Can't reach Q"

**Status:** Suspected.

**Where:** `extension/content.js:35-46`.

**What happens:** the old content script's `chrome.runtime` is invalidated, and MV3 doesn't re-inject into open tabs. The only fix is refreshing Meet, which drops you out of the call.

**Fix:** in `api()`, check `if (!chrome.runtime?.id)` and show "Q was updated. Refresh this tab." Remember not to reload the extension once the demo call has started.

### 17. Learn route races

**Status:** Suspected.

**Where:** `web/app/api/learn/route.ts:51-63`, `70-100`.

**What happens:**
- `uses`/`wins` are read, then written, so two calls finishing at once lose an increment.
- Two simultaneous won calls can both insert the same new move.
- Retired moves aren't in `known`, so a retired move can be re-learned as a duplicate.

**Fix:** do the increment as a single SQL `update … set uses = uses + 1, wins = wins + $won where id = any($ids)` through an `rpc`, and dedupe against all cues, not only active ones.

### 18. The popup can lose the last keystrokes

**Status:** Suspected.

**Where:** `extension/popup.js:28`.

**What happens:** saves are debounced by 250 ms. Closing the popup (clicking back into Meet) right after typing kills the pending timer, so "John" can save as "Joh".

**Fix:** save immediately on `input` (storage writes are cheap), or also save on `change`/`blur`.

### 19. The landing-page hero card is clipped on phones

**Status:** Reproduced at 375 px.

**Where:** `web/app/HeroDemo.tsx:41`, `61`.

**What happens:**
- The card overflows its 16:10 frame by 6 to 26 px, depending on the nudge, so the footer label gets cut off.
- The "You" tile label also shows through the glass card text.
- No horizontal page scroll, and no console errors or hydration warnings on `/`, `/playbook` or `/test`.

**Fix:** use `aspect-[4/3] sm:aspect-[16/10]` instead of the inline `aspectRatio`, or hide the "who · line" row below `sm`.

### 20. Turning Q off in the popup doesn't stop the pacing requests

**Status:** Suspected.

**Where:** `extension/content.js:381-400`.

**What happens:** the 1 s block (inCall, askOutcome, checkPacing) runs before the `q.enabled` check.

**Fix:** return early from `tickCaptions` when disabled.

### 21. Small items

**Status:** Suspected.

- **Every caption block is re-parsed every 200 ms** (`content.js:401-402`). If Meet keeps the whole caption history in the DOM ("Jump to bottom" suggests it does), the cost grows with call length. Process `blocks.slice(-6)`.
- **Reseed and reset are not atomic** (`lib/seed.ts:30-55`). They delete, then insert, and `/api/cue` caches the playbook for 5 s. A cue during a reset can see an empty or partial playbook, or return `cue_id`s that were just deleted (so learn silently skips them). Admin-only; don't reset mid-call.

---

## Checked and fine

- **Stand-in caption reading:** the gym call produced exactly 4 turns with correct You/Buyer labels and no duplicates. The second request carried the full transcript and `recent_nudges`.
- **Dev routes in production:** `/api/dev/learn` and `/api/dev/judge` return 404 on Vercel.
- **Secrets:** no `.env*` file was ever committed, and the service key is only imported server-side.
- **Rendering:** the card uses `textContent` or `escapeHtml` for all server text, so learned move text and names can't inject HTML into Meet.
- **Type check and lint:** `tsc --noEmit` and `eslint app lib` are clean.
- **`seed-data.json`:** 252 moves, every moment known, no duplicate texts, none over 6 words.
- **Learning speed:** about 2 s (`/api/dev/learn`), well under the MV3 30 s fetch limit.
- **`/api/updates` cursor:** re-polling with the returned `now` gives no repeats, including with µs timestamps and an unencoded `+`.

## Before 1:15

1. Check the Anthropic balance, turn on auto-reload, and stop eval scripts.
2. In the 4.5-minute wait, say nothing on the laptop (item 3).
3. Popup name differs from the buyer's Meet name (item 4).
4. After John's last line, wait about 2 s before clicking End call (item 2), until the fix lands.
5. On a real Meet, Shift+D once to confirm the lines read "You" and "Buyer · Jordan".
