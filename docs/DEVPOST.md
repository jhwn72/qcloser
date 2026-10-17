# Devpost write-up: Q

> **For John, before posting (delete this box):**
> 1. **Sample data.** "Honest status" below uses the site's exact wording about the starter playbook. Keep it if you edit.
> 2. **Links.** The GitHub repo isn't pushed yet (no remote). It must be public before 2 PM. Fill in the video URL after upload.
> 3. **Agents track.** Keep or delete that section depending on whether you enter it.

## Title

Q: your cue to close

## Tagline

Every closer needs a Q. Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.

(Short version for any field with a tight limit: "Every closer needs a Q." The product tagline stays "your cue to close".)

## Links

- **Try it:** https://q-cue-to-close.vercel.app (landing, install steps, live playbook)
- **Code:** [GitHub URL]
- **Video:** [YouTube or Loom URL]

## Honest status

- Hackathon build from SEP Hacks 2026. No users or revenue yet. Every number below is measured in our build or labeled as a projection.
- The starter playbook (its moves, names and records) is sample data for this demo: 250 moves across 36 situation types, written from established closing methods. Moves learned on live calls are real, credited to the seller who taught them, and start their own record.

## Inspiration

"Sell me this pen" is the most famous sales test there is, and it's easy to freeze on. Real sales calls are the same: the objection lands and you have about two seconds. AI sales tools answer with paragraphs you can't read mid-call, full of lines buyers have heard before. And when a great rep improvises something that actually closes, it disappears when the call ends. James Bond never goes into the field without Q handing him the right gadget at the right moment. Every closer needs a Q: the right move at the right moment, at a glance, from a playbook that remembers what works.

## What it does

**Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.**

We call it **closing intelligence**: the moves that are winning right now, getting sharper with every deal. Today Q is a Chrome extension that floats a card over Google Meet.

- **Hears both sides.** Q reads Meet's live captions (the seller's own are labeled "You"). No audio capture, no extra transcription service.
- **Nudges, never scripts.** When the buyer objects, warms up, or the call drifts, the card flashes a short nudge telling the seller where to steer. "I don't need a pen" becomes "Ask what contracts they sign". The seller says it their own way.
- **Every nudge has a source.** Each one comes from a playbook move and shows who it was learned from: "Learned from John · Los Angeles".
- **Fits this buyer and this company.** Claude reads the whole call, a saved company profile and an optional pre-call brief, picks the best move, and fits it to the buyer. Nudges land in about 1.5 to 2 seconds.
- **Watches the clock.** The seller sets the call length (10, 15, 30 or 45 minutes). The card shows the phase (Discovery, Present and handle, Close window, Ask for the sale), and nudges push toward the close as time runs low.
- **Learns from every call.** End call leaves Meet and asks Won or Lost. On a win, Claude extracts the seller's own winning move and adds it to everyone's playbook, credited to them; every other Q card shows "New move learned from John · Los Angeles" within about 3 seconds. Moves that keep losing retire on their own. Every call, won or lost, leaves a lesson in the "What Q learned" feed.
- **A playbook you can browse.** /playbook shows every move grouped by situation (objections, emotional worries, closing moments, pacing), with its win and loss record, the line behind it, New and Retired tags, and the lessons feed.

## How we built it

| Piece | Tech |
|---|---|
| Overlay and caption reader | Chrome extension, Manifest V3, plain JavaScript, no build step. The card lives in a Shadow DOM so Meet's CSS can't touch it. |
| Backend and web pages | Next.js 16 (App Router, TypeScript, Tailwind) on Vercel |
| Shared playbook | Supabase Postgres: moves, calls and lessons. The extension only talks to our API. |
| Brain | Claude Sonnet 5.5 through the Anthropic API, with structured outputs (Zod schemas) and prompt caching |
| Live updates | Every Q card polls `/api/updates` every 3 seconds |

**Hearing the call.** A MutationObserver watches Meet's captions region, found through ARIA roles and page structure rather than Meet's obfuscated class names. Meet rewrites a caption while the person is still talking, so a line counts as final once it stops changing for half a second or the speaker changes. Meet's own caption bar is hidden with opacity (so Meet keeps rendering it) and Shift+C brings it back. Shift+D shows what Q hears; Shift+B types a buyer line if captions fail.

**Picking a nudge (`/api/cue`).** For each finished buyer line, Claude gets the playbook, the company profile, the brief, call stats (minutes used of the target, seller talk share, talking streak), the nudges already shown, and the whole call. It returns, in this order: the moment (one of 36 situation types, or none), the buyer type, the aim (probe, answer, acknowledge, calm or advance), and two picks, each a concrete nudge plus the playbook move it uses. The order is deliberate: Claude commits to what the nudge must do before writing it, and writes the nudge before naming the move, so it doesn't just echo the move. The server then:

- maps each pick to a real playbook move, so every nudge traces to a credited source;
- penalizes a nudge that repeats a move word for word or repeats an earlier nudge;
- ranks by Bayesian win rate, (wins + 1) / (uses + 2), plus Claude's fit order and a bonus when the move won with this buyer type;
- 15% of the time gives a newly learned move a fair try, except in sensitive moments (grief, feeling judged, money trouble, hostility), where the best-fitting move always wins.

**Speed.** Thinking off and low effort for live nudges. The instructions, playbook and company profile are cached, so each nudge only sends what changed. The playbook is kept in memory for 5 seconds, and the card warms the backend up when a call starts. Measured on our demo call: 1.4 to 2.2 seconds server time across 14 runs. Model cost: about $0.0017 per nudge, about $0.12 per 15-minute call.

**Learning (`/api/learn`).** When a call ends, Q saves it, adds a use (and on a win, a win) to every move it showed, and retires any move with 8 or more uses and under a 25% win rate. In parallel, Claude reviews the call (the turning point and one lesson, for wins and losses alike) and, on a win, finds the seller's own lines right before the buyer moved toward yes. It names the tactic behind them as a short, reusable move, keeps the seller's real line and a one-sentence lesson, and skips anything already in the playbook. New moves go live for every Q card on the next poll.

**Behaving well.** Q never uses an insecurity, grief or money trouble as leverage, never pushes someone who is struggling, and only uses facts from the call, the profile or the brief (no invented prices, offers or claims).

## Challenges we ran into

- **Meet's captions.** Obfuscated class names, and captions that rewrite themselves mid-sentence. We anchored on ARIA and structure and finalize lines on a short settle time.
- **Generic nudges.** Our first fast setting kept copying the generic move ("Ask what would convince them"). We compared model settings with a script on cases that weren't in the prompt's examples. Claude Sonnet 5.5 with thinking off gave clearly more specific nudges at about 1.5 seconds median, so it became the default. Making Claude write the nudge before naming the move, and penalizing echoes, cut generic copies further.
- **The therapist problem.** Once Q got emotionally smarter, it started asking feelings question after feelings question and forgot to close. Now empathy is one beat, then a pivot to commitment; Q never stacks probing questions, and the right move depends on the clock.
- **Learning too little.** The first learning prompt rejected a sharper version of a known tactic as a duplicate. We calibrated it to learn a move when it's new or meaningfully sharper.

## Accomplishments we're proud of

- It works on real Google Meet calls, both sides, with no audio capture.
- The whole learning loop runs live: in our test, one won call taught Q "Flip roles, let them sell it" from a single improvised line in about 3 seconds, and it showed up in the feed every other Q card reads.
- Nudges stay specific to the call. On our demo call, the same buyer line got the same idea 3 out of 3 times ("Ask which pen closes deals"; "Compare $40 to ten-year lease").
- 36 situation types, including personal moments like grief, embarrassment and money trouble, each with its own rules.
- A card that feels alive without being noisy, built on John's own design system.

## What we learned

- Judge AI quality on cases that aren't in the prompt. Ours looked great on its own examples and generic on new ones.
- Relevance beats win rate. A move that wins often is still a bad nudge in the wrong moment, so Claude ranks fit first and win rate breaks ties.
- A short nudge forces a decision. A paragraph can hedge; a nudge you read at a glance has to pick a direction.
- Losses teach as much as wins. Every call now leaves a lesson.

## What's next

- Zoom, Microsoft Teams and phone dialers, with our own transcription so Q isn't tied to Meet's captions.
- Private team playbooks on top of the shared one, plus a competitor firewall.
- Royalties for winning moves and give-to-get access to the network.
- Win and loss verified from CRM closed-won deals instead of a button.
- A clear notice and consent flow for buyers, retention controls, and the Chrome Web Store.

## Tracks

### Continual Learning (Grand Tech)

The model stays fixed; the playbook is what learns, and it learns from outcomes.

- **Every call updates the record.** Each move Q showed gets a use, and a win if the call was won. Ranking runs on a Bayesian win rate, so new moves start near 50% and earn their place.
- **Wins teach new moves.** Claude finds the seller's own line that turned the call, turns the tactic into a reusable move, and credits the seller. It's live on every Q card within about 3 seconds.
- **Losing moves retire.** 8 or more uses and under a 25% win rate, automatically.
- **Losses teach too.** Every call leaves a lesson in the feed, for example "turned at: buyer said I never go; seller pivoted to amenities".
- **New ideas get a fair shot.** 15% exploration for newly learned moves, never in sensitive moments.
- **In the video (1:07):** John improvises a move Q has never seen, wins, Q learns "Flip roles, let them sell it", and a second Q card shows "New move learned from John · Los Angeles".

### Scale (Most Scalable to $1B)

Full numbers, assumptions and sources: [SCALE.md](SCALE.md).

- **Category:** closing intelligence. The product is the moves that are winning right now, and every deal on the network sharpens them.
- **Unit economics (measured):** about $0.12 model cost per 15-minute call, about $13.20 per rep per month at 5 calls a day. Against $39/month Pro and $99/month Team seats, that's 66% and 87% margin after model cost. Hosting, database, payments and support aren't counted yet.
- **Market:** about 4.04M US sellers in the occupations Q targets (BLS, May 2025).
- **Path (projection):** about 103,000 paid seats at an $81 blended price is about $100M ARR, a $1B company at 10x revenue.
- **Wedge:** startup and SMB SaaS reps on Google Meet first, then high-ticket remote closers. Insurance, financial services and real estate once phone dialers ship.
- **Moat:** anyone can call the same model; nobody can copy the win and loss history of every move. Every seller's win makes everyone's nudges better.
- **Marketplace (proposals):** royalties for moves that win on other sellers' calls, give-to-get access, a competitor firewall so a company's moves stay private from rivals, and private team playbooks on top of the shared one.

### Design (Best Visual Design)

- **Tango, John's own design system:** dark, monochrome glass and a glowing glass ring as the Q logo, used across the card, popup, landing page and playbook.
- **The nudge is the hero.** Short, big, readable at a glance mid-sentence. Under it, small: who the move was learned from, the situation, the buyer type.
- **A card that shows it's listening.** "Hearing Taylor…" and "Thinking…" states, a faint line of what it just heard, a glass ring that brightens when someone talks, a call clock with the phase (amber in the last 20%), and nudges that dim after a minute so an old one never looks current.
- **It tells you the next step.** Bright when you need to act ("Press C to turn on captions"), faint while it just listens ("Listening for the buyer…").
- **Built to live on top of Meet.** Shadow DOM so Meet can't break it, draggable, remembers where you left it, and Meet's own captions hidden.

### Agents (if entering)

Q runs a perceive, decide, act, learn loop on its own for the whole call: it watches the captions, decides whether a moment is worth coaching (and stays quiet when it isn't), picks a tactic for this moment and this point on the clock, checks pacing on a timer when the seller monologues, leaves Meet when the seller ends the call, then reviews the call and writes new moves to a shared playbook that every other Q instance picks up. It doesn't call outside tools; the actions are the nudges, the Meet exit and the playbook writes.

## Built with

Chrome Extensions (Manifest V3), JavaScript, Shadow DOM, Next.js, React, TypeScript, Tailwind CSS, Vercel, Supabase, PostgreSQL, Anthropic API, Claude Sonnet 5.5, Zod

## Team

John Wang
