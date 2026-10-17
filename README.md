# Q: your cue to close

**Every closer needs a Q.**

Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.

[Live site](https://qcloser.vercel.app) · [Download for Chrome](https://qcloser.vercel.app/q-extension.zip) · [Live playbook](https://qcloser.vercel.app/playbook) · [Try a buyer line](https://qcloser.vercel.app/test) · Demo video: _add link_

> Built at SEP Hacks 2026 (USC SEP x LA Tech Week). Q runs on Google Meet today. It has no users or revenue yet. The starter playbook (its moves, names and win records) is sample data for the demo; moves learned on live calls are real.

## Team

John Wang

## Summary

### The problem

- **There's no time to read on a live call.** In conversation, people reply about 0.2 seconds after the other person stops, on average ([Stivers et al., PNAS 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2705608/)). AI tools that hand you a paragraph, or a line to read aloud, don't fit in that gap, and they make you sound scripted.
- **They don't learn what closes.** Generic AI guesses what sounds persuasive. In-call cards in sales tools show whatever someone set up in advance.
- **Coaching doesn't scale.** Managers can't join every call, and new reps keep arriving: SDRs take 3.0 months to ramp, stay 1.9 years on average, and median SDR attrition was 40% in 2024 ([Bridge Group, 2025](https://www.bridgegroupinc.com/research/2025-sdr-models-metrics-report-the-bridge-group)).
- **Winning lines disappear.** When a rep improvises something that closes, it's gone when the call ends.

### The solution

Q is **closing intelligence**: the moves that are winning right now, getting sharper with every deal. Today it's a Chrome extension that floats a card over Google Meet.

- **Hears both sides.** Q reads Meet's live captions in the seller's browser. No bot joins the call and no audio is captured.
- **Nudges, never scripts.** When the buyer objects, warms up, or the call drifts, the card shows a short nudge on where to steer, about a second after the buyer stops talking. "I've paid for gyms before and never go" becomes "Ask what got in the way". The seller says it their own way.
- **Knows the moment and the buyer.** 60 situations (objections, worries like feeling judged, buying signals, pacing such as talking too long) and a buyer tag (skeptical, rushed, price-focused, curious).
- **Paces toward the close.** A call clock that follows the buyer: it extends when they're engaged or say there's no rush, and pulls in when they're short on time or going quiet.
- **Fits your offer.** A saved company profile and a per-call brief make nudges specific ("Offer 0% financing, about 190 monthly").
- **Every nudge has a source.** Each comes from a playbook move credited to whoever taught it: "Learned from John · Los Angeles".
- **Learns from every call.** End call leaves Meet and asks Won or Lost. On a win, Q turns the seller's own winning move into a new playbook move, credited to them, and every other Q card shows "New move learned from..." within about 3 seconds. A loss leaves a lesson. Then Q grades each nudge it showed (helped, neutral or hurt) and retires moves that keep losing or keep hurting.

## How Q addresses each track and prize

SEP Hacks judges every project on Functionality, Continual Learning and Pitch, with cross-eligibility for the prizes below.

### Grand Tech: Continual Learning

The model stays fixed. The playbook is what learns, and it learns from outcomes.

- **Gets better as it's used.** Every move Q shows gets a use, and a win if the call was won. Moves are ranked with a Bayesian win rate, (wins + 1) / (uses + 2), so new moves start near 50% and earn their place.
- **Wins teach new moves.** After a won call, Claude finds the seller's own line right before the buyer moved toward yes, names the tactic as a short reusable move, keeps the real line and a one-sentence lesson, and skips anything already in the playbook. It's live for every Q card on the next poll, about 3 seconds later. In testing, one improvised line taught Q "Flip roles, let them sell it".
- **Losses teach lessons.** Every call gets a turning point and a lesson in the "What Q learned" feed.
- **Adapts as the world changes.** What's winning now rises; moves with 8 or more uses and under a 25% win rate retire. About 15% of the time a newly learned move gets a fair try, never in sensitive moments (grief, feeling judged, money trouble, hostility) or when the buyer asked a direct question.
- **Evolves with the user.** Your wins become your moves, credited by name. Choose "My company only" and the moves Q learns from you stay with your team, a private playbook that grows from your own wins.

### Continual Failure Detection

A nudge can read well and still lose the room, and nothing throws an error. Q catches those silent misfires itself.

- After every call, won or lost, Claude reviews the transcript with each nudge placed at the line where the seller saw it. For each nudge it records whether the seller used it, what the buyer did right after, a verdict (helped, neutral or hurt) and a one-line reason. It's calibrated: an unused nudge is always neutral, and a win doesn't make a nudge helpful.
- The verdicts feed back into ranking. A move's score moves by at most 0.2 either way, so one bad call can't sink a good move. A move that has hurt at least twice, and more than twice as often as it helped, is flagged "Often misfires", and after 4 or more reviews it retires.
- It's visible: the card shows how many nudges helped right after the call, each call has a report page with every verdict inline ([web/app/call/[id]/page.tsx](web/app/call/%5Bid%5D/page.tsx)), and the playbook has a "What Q got wrong" panel.

### Best Visual Design

- **Tango, John's own design system:** dark monochrome glass and a glowing glass-ring Q, used across the card, popup, landing page, playbook, call report and royalties page.
- **The nudge is the hero.** Short, big, readable at a glance mid-sentence. Under it, small: who the move came from, the situation, the buyer type.
- **A card that shows it's listening.** "Hearing Jordan…" and "Thinking…" states, a faint line of what it just heard, a ring that brightens when someone talks, a call clock that turns amber in the last 20%, and nudges that dim after a minute so an old one never looks current.
- **Built to live on top of Meet.** Shadow DOM so Meet's CSS can't touch it, draggable, remembers where you left it, and Meet's own caption bar hidden (Shift+C brings it back).

### Most Scalable To $1B

Full numbers, assumptions and sources: [docs/SCALE.md](docs/SCALE.md).

- **Moat:** anyone can call the same model; nobody can copy the win, loss and review record of every move. Every seller's win makes every seller's nudges better.
- **Unit economics:** about $0.12 of model cost per 15-minute call on our standard model, against planned $39/month Pro and $99/month Team seats.
- **Market:** about 4.04M US sellers in the occupations Q targets (BLS, May 2025).
- **Path (projection):** about 103,000 paid seats at an $81 blended price is about $100M ARR, a $1B company at 10x revenue.
- **Marketplace:** sellers choose whether moves Q learns from them go to everyone (credited, and set to earn royalties when they help others close) or stay private to their company (the competitor firewall). Royalties are a plan, not live: the proposal is a pool of 10% of subscription revenue, split by attributed wins on other sellers' calls ([/royalties](https://qcloser.vercel.app/royalties)).

## How it works

```
Google Meet live captions (both sides)
  -> the card finalizes each line; listen-ahead asks Q while the buyer is still talking
  -> POST /api/cue: Claude reads the call, the company profile, the brief and the call clock
       names the moment, the buyer type and the aim, then writes two nudges, each tied to a playbook move
  -> the server checks each pick against a real move and its record, then picks one
  -> the card shows the nudge, credited ("Learned from Ana · Los Angeles")

End call -> Won or Lost -> POST /api/learn
  -> every move shown gets a use (and a win)
  -> Claude reviews the call: turning point, lesson, a verdict on every nudge
  -> on a win, Claude turns the seller's winning line into a new move
  -> every other Q card polls GET /api/updates every 3 s: "New move learned from John · Los Angeles"
```

## The AI component

- **The transcript is Meet's own captions.** A MutationObserver watches Meet's captions region, found through ARIA roles and page structure rather than Meet's obfuscated class names. Meet rewrites a caption while the person is still talking, so a line counts as final once it stops changing for a moment or the speaker changes. The seller's own captions are labeled "You"; everyone else is the buyer.
- **Reading the moment, picking and fitting a move.** For each buyer line, Claude gets the playbook, the company profile, the brief, call stats (minutes used of the target, the seller's talk share and talking streak), the nudges already shown and the whole call. With structured outputs it returns, in order, the moment (one of 60 situations, or none), the buyer type, the aim (probe, answer, acknowledge, calm or advance) and two picks, each a concrete nudge plus the move it uses. Claude commits to what the nudge must do before writing it, and writes the nudge before naming the move, so it doesn't just echo the move. Live nudges run on Claude Opus 5.5 in fast mode at low effort, falling back to Claude Sonnet 5.5 on any error.
- **Outcome-ranked shared playbook, with exploration.** The server maps each pick to a real playbook move, so every nudge traces to a credited source. A nudge that just repeats a move loses to a specific one. Claude's first pick stands unless the other has a clearly better record: its after-call reviews, plus a win-rate edge (with a bonus when it won with this buyer type) once both moves have real use. About 15% of the time a newly learned move gets a fair try, never in sensitive moments or when the buyer asked a direct question.
- **Learning winning moves.** On a won call, Claude Sonnet 5.5 finds the seller's lines right before the buyer moved toward yes, names the tactic behind them as a short reusable move, keeps the seller's real line and a one-sentence lesson, and learns it only if it's new or a meaningfully sharper version of a move already in the playbook.
- **Reviewing calls and judging each nudge.** Claude Sonnet 5.5 reads the transcript with every nudge marked where it appeared and returns the turning point, a lesson, and for each nudge: did the seller use it, what the buyer did next, helped, neutral or hurt, and why.
- **Listen-ahead.** While the buyer is still talking, the card asks Q about the words so far. Requests overlap and only the newest answer shows, so by the time the buyer stops, the nudge is ready or nearly ready. In our tests nudges land about a second after the buyer stops.
- **Prompt caching.** The instructions, the playbook and the company profile are cached, so each nudge sends only what changed. The server keeps the playbook in memory and refreshes it every few seconds, and the card warms the cache when a call starts.
- **Behaving well.** Q never uses an insecurity, grief or money trouble as leverage, never pushes someone who is struggling, and is told to use only facts from the call, the profile or the brief.

## How we built it

| Piece | Tech |
|---|---|
| Caption reader and overlay card | Chrome extension, Manifest V3, plain JavaScript with no build step. The card lives in a Shadow DOM so Meet's CSS can't touch it. |
| Backend and web pages | Next.js (App Router, TypeScript, Tailwind) on Vercel |
| Shared playbook | Supabase Postgres: moves, calls, lessons and nudge reviews. The extension only talks to our API. |
| Brain | Claude via the Anthropic API: Claude Opus 5.5 (fast mode) for live nudges with Claude Sonnet 5.5 as fallback; Claude Sonnet 5.5 for learning and call reviews. Structured outputs with Zod schemas, prompt caching. |
| Live updates | Every Q card polls `/api/updates` every 3 seconds |

## Install (for judges)

1. Download the extension: [q-extension.zip](https://qcloser.vercel.app/q-extension.zip). (Or clone this repo and use the `extension/` folder.)
2. Unzip it.
3. In Chrome, open `chrome://extensions`, turn on **Developer mode** (top right), and drag the `q-extension` folder onto the page. (Or click **Load unpacked** and choose the folder.)
4. Click the Q icon in the toolbar (pin it from the puzzle-piece menu). Add your name and city, your company name and what you sell, your typical call length (10, 15, 30 or 45 minutes), and where moves Q learns from you should go. A brief for the next call is optional.
5. Join a Google Meet call with someone playing the buyer, and press **C** to turn on English captions. The Q card appears over the call. When the buyer pushes back, a nudge appears.
6. Click **End call** on the card, then **Won** or **Lost**. Q learns from the call; open **See the call report** to see how each nudge landed.

Shortcuts on the call: **Shift+D** shows what Q hears, **Shift+B** types a buyer line (if captions fail), **Shift+C** shows Meet's captions.

No call handy? Type a buyer line at [/test](https://qcloser.vercel.app/test) and get a real nudge back.

## Run it locally

You need Node.js (20 or newer), a [Supabase](https://supabase.com) project and an Anthropic API key.

1. **Database.** In Supabase, open SQL Editor and run, in order: [supabase/schema.sql](supabase/schema.sql), [supabase/migration-2-reviews-and-sharing.sql](supabase/migration-2-reviews-and-sharing.sql), [supabase/migration-3-call-review.sql](supabase/migration-3-call-review.sql).
2. **Environment.** Create `web/.env.local` (it's git-ignored) with:
   ```
   ANTHROPIC_API_KEY=
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   ADMIN_KEY=
   ```
   `ADMIN_KEY` is the passcode for /admin on a deployed site; locally, /admin is open.
3. **Run the web app.**
   ```
   cd web
   npm install
   npm run dev
   ```
4. **Load the starter playbook.** Open http://localhost:3000/admin and click **Reset to seed**. This loads [web/lib/seed-data.json](web/lib/seed-data.json) and clears calls and learned moves.
5. **Point the extension at it.** In [extension/config.js](extension/config.js), set `BACKEND_URL` to `"http://localhost:3000"`, then load the `extension/` folder unpacked as in Install.
6. To rebuild the downloadable zip after changing the extension, run [web/scripts/pack-extension.sh](web/scripts/pack-extension.sh).

## Key files

| File | What it does |
|---|---|
| [extension/content.js](extension/content.js) | Caption reader, listen-ahead, the adaptive call clock and the overlay card |
| [extension/popup.html](extension/popup.html), [extension/popup.js](extension/popup.js) | Name, city, company profile, call length, sharing choice, call brief |
| [extension/config.js](extension/config.js) | Which backend the extension talks to |
| [web/app/api/cue/route.ts](web/app/api/cue/route.ts) | Picks a nudge: playbook in memory, maps Claude's picks to moves, ranking, exploration |
| [web/lib/claude.ts](web/lib/claude.ts) | Prompts, structured outputs and model settings for live nudges and learning; prompt caching |
| [web/app/api/learn/route.ts](web/app/api/learn/route.ts) | End of call: records, retirements, call review, learning new moves |
| [web/lib/review.ts](web/lib/review.ts) | The after-call review: turning point, lesson, a verdict on every nudge |
| [web/lib/ranking.ts](web/lib/ranking.ts) | Turns helped and hurt verdicts into ranking and retirement |
| [web/app/api/updates/route.ts](web/app/api/updates/route.ts) | What every Q card polls for new moves and lessons |
| [web/lib/moments.ts](web/lib/moments.ts) | The 60 situations Q recognizes |
| [web/lib/seed-data.json](web/lib/seed-data.json) | The starter playbook (sample data) |
| [web/app/playbook/page.tsx](web/app/playbook/page.tsx) | The live playbook: moves, records, "What Q learned", "What Q got wrong" |
| [web/app/call/[id]/page.tsx](web/app/call/%5Bid%5D/page.tsx) | Call report: the transcript with every nudge and its verdict |
| [supabase/schema.sql](supabase/schema.sql) | Tables for moves, calls and lessons (plus the two migrations) |
| [docs/SCALE.md](docs/SCALE.md) | The business case, with sources |

## Honest status

- A hackathon build. No users, revenue or traction yet.
- The starter playbook (about 500 moves, their authors such as "Ana · Los Angeles", and their win records) is sample data written from established closing methods. Moves learned on live calls are real and start their own record.
- Google Meet only. Zoom, Microsoft Teams, Slack huddles, Webex and phone calls are on the roadmap. Q depends on Meet's live captions being on.
- Won or Lost is a button the seller presses, not a CRM deal, and a won call credits every move shown, so attribution is noisy until CRM outcomes are wired in.
- Royalties are a proposal; no payouts exist yet.
- Not in the Chrome Web Store yet; it loads unpacked.

## Privacy

Q never records audio and no bot joins the call. It reads the captions Google Meet already shows in the seller's browser and sends the conversation to Q's API to pick a nudge. When the seller ends a call, the transcript is saved so Q can learn from it. Let the people on the call know, as you would with any call notes; some places, including California, require everyone's consent to record a confidential conversation. A buyer notice and consent flow, retention controls and redaction are planned, not built.
