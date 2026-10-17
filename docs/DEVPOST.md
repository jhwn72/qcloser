# Devpost write-up: Q

> **For John, before posting (delete this box):**
> 1. **Sample data.** "Honest status" below uses the site's exact wording about the starter playbook. Keep it if you edit.
> 2. **Deadline and links.** Devpost closes submissions at **11:00 AM PT**; submit by 10:45 AM. The GitHub repo isn't pushed yet (no remote), and it must be public, with working links, before you submit. Fill in the video URL after upload.
> 3. **Prizes to select:** Grand Tech, Continual Failure Detection, Most Scalable To $1B, Best Visual Design. There is no Agents track.

## Title

Q: your cue to close

## Tagline

Every closer needs a Q. Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.

(Short version for any field with a tight limit: "Every closer needs a Q." The product tagline stays "your cue to close".)

## Links

- **Try it:** https://qcloser.vercel.app (landing, install steps, live playbook)
- **Code:** [GitHub URL]
- **Video:** [YouTube or Loom URL]

## Honest status

- Hackathon build from SEP Hacks 2026. No users or revenue yet. Every number below is measured in our build or labeled as a projection.
- The starter playbook (its moves, names and records) is sample data for this demo: 250 moves across 36 situation types, written from established closing methods. Moves learned on live calls are real, credited to the seller who taught them, and start their own record.

## Inspiration

"Sell me this pen" is the most famous sales test there is, and it's easy to freeze on. Real sales calls are the same: the objection lands, and in conversation people expect an answer within a fraction of a second (the average gap between turns is about 0.2 seconds, Stivers et al., PNAS 2009). AI sales tools answer with paragraphs you can't read mid-call, full of lines buyers have heard before. And when a great rep improvises something that actually closes, it disappears when the call ends. James Bond never goes into the field without Q handing him the right gadget at the right moment. Every closer needs a Q: the right move at the right moment, at a glance, from a playbook that remembers what works.

## What it does

**Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.**

We call it **closing intelligence**: the moves that are winning right now, getting sharper with every deal. Today Q is a Chrome extension that floats a card over Google Meet.

- **Hears both sides.** Q reads Meet's live captions (the seller's own are labeled "You"). No audio capture, no extra transcription service.
- **Nudges, never scripts.** When the buyer objects, warms up, or the call drifts, the card flashes a short nudge telling the seller where to steer. "I don't need a pen" becomes "Ask what contracts they sign". The seller says it their own way.
- **Every nudge has a source.** Each one comes from a playbook move and shows who it was learned from: "Learned from John · Los Angeles".
- **Fits this buyer and this company.** Claude reads the whole call, a saved company profile and an optional pre-call brief, tags the buyer (skeptical, rushed, price-focused or curious), picks the best move, and fits it to the buyer: "Offer 0% financing, about 190 monthly". Q starts thinking while the buyer is still talking, so nudges land about a second after they stop.
- **Watches the clock, and the clock follows the buyer.** The seller sets the call length (10, 15, 30 or 45 minutes). The card shows the phase (Discovery, Present and handle, Close window, Ask for the sale), and nudges push toward the close as time runs low. The target adapts: it extends when the buyer is engaged or says there's no rush, and pulls in when they're short on time or going quiet.
- **Learns from every call.** End call leaves Meet and asks Won or Lost. On a win, Claude extracts the seller's own winning move and adds it to the playbook, credited to them; every other Q card shows "New move learned from John · Los Angeles" within about 3 seconds. Moves that keep losing retire on their own. Every call, won or lost, leaves a lesson in the "What Q learned" feed.
- **Grades its own advice.** After every call, Q judges each nudge it showed from what happened next: helped, neutral or hurt, with a reason. The card says how its nudges did, a call report shows every verdict inline, and moves that keep hurting lose rank and retire.
- **You choose who gets your moves.** Everyone (credited, and set to earn royalties when they help other sellers close, once payouts start) or My company only, so a competitor never gets your best lines.
- **A playbook you can browse.** /playbook shows every move grouped by situation (objections, emotional worries, closing moments, pacing), with its win and loss record, how often it helped or hurt, the line behind it, New and Retired tags, the lessons feed and a "What Q got wrong" panel.

## How we built it

| Piece | Tech |
|---|---|
| Overlay and caption reader | Chrome extension, Manifest V3, plain JavaScript, no build step. The card lives in a Shadow DOM so Meet's CSS can't touch it. |
| Backend and web pages | Next.js 16 (App Router, TypeScript, Tailwind) on Vercel |
| Shared playbook | Supabase Postgres: moves, calls, lessons and nudge reviews. The extension only talks to our API. |
| Brain | Claude through the Anthropic API: Claude Opus 5.5 in fast mode for live nudges, with Claude Sonnet 5.5 as the fallback; Claude Sonnet 5.5 for learning and call reviews. Structured outputs (Zod schemas) and prompt caching. |
| Live updates | Every Q card polls `/api/updates` every 3 seconds |

**Hearing the call.** A MutationObserver watches Meet's captions region, found through ARIA roles and page structure rather than Meet's obfuscated class names. Meet rewrites a caption while the person is still talking, so a line counts as final once it stops changing for a moment or the speaker changes. Meet's own caption bar is hidden with opacity (so Meet keeps rendering it) and Shift+C brings it back. Shift+D shows what Q hears; Shift+B types a buyer line if captions fail.

**Picking a nudge (`/api/cue`).** For each finished buyer line, Claude gets the playbook, the company profile, the brief, call stats (minutes used of the target, seller talk share, talking streak), the nudges already shown, and the whole call. It returns, in this order: the moment (one of 36 situation types, or none), the buyer type, the aim (probe, answer, acknowledge, calm or advance), and two picks, each a concrete nudge plus the playbook move it uses. The order is deliberate: Claude commits to what the nudge must do before writing it, and writes the nudge before naming the move, so it doesn't just echo the move. The server then:

- maps each pick to a real playbook move, so every nudge traces to a credited source;
- prefers a specific nudge over one that repeats a move word for word or repeats an earlier nudge;
- keeps Claude's first pick (its best fit) unless the other has a clearly better record: its after-call reviews, plus a Bayesian win-rate edge, (wins + 1) / (uses + 2), with a bonus when the move won with this buyer type, once both moves have real use;
- about 15% of the time gives a newly learned move a fair try, except in sensitive moments (grief, feeling judged, money trouble, hostility) or when the buyer asked a direct question, where the best-fitting move always wins.

**Speed.** Listen-ahead: while the buyer is still talking, the card asks Q about the words so far; requests overlap and only the newest answer shows, so the nudge is ready or nearly ready when the buyer stops. Live nudges run on Claude Opus 5.5 in fast mode at low effort, falling back to Claude Sonnet 5.5 if fast mode errors or stalls. The instructions, playbook and company profile are cached, so each nudge only sends what changed; the playbook is kept in memory and refreshed every 5 seconds, and the card warms the cache when a call starts. On the live site, nudges land about a second after the buyer stops. Model cost on our standard model: about $0.0017 per nudge, about $0.12 per 15-minute call.

**Learning (`/api/learn`).** When a call ends, Q saves it, adds a use (and on a win, a win) to every move it showed, and retires any move with 8 or more uses and under a 25% win rate. In parallel, Claude Sonnet 5.5 reviews the call and, on a win, finds the seller's own lines right before the buyer moved toward yes. It names the tactic behind them as a short, reusable move, keeps the seller's real line and a one-sentence lesson, and skips anything already in the playbook. New moves go live for every Q card on the next poll.

**Catching its own misfires (`web/lib/review.ts`).** The review reads the transcript with every nudge marked at the line where it appeared, and returns the turning point, one lesson (for wins and losses alike) and, for each nudge: whether the seller used it, what the buyer did right after, a verdict (helped, neutral or hurt) and a one-line reason. It's told to be calibrated, not generous: an unused nudge is always neutral, and a win doesn't make a nudge helpful. Each verdict goes on the move's record and nudges its ranking by at most 0.2 either way, so one bad call can't sink a good move. A move that has hurt at least twice, and more than twice as often as it helped, is flagged "Often misfires" and retires after 4 or more reviews.

**Behaving well.** Q never uses an insecurity, grief or money trouble as leverage, never pushes someone who is struggling, and only uses facts from the call, the profile or the brief (no invented prices, offers or claims).

## Challenges we ran into

- **Meet's captions.** Obfuscated class names, and captions that rewrite themselves mid-sentence. We anchored on ARIA and structure and finalize lines on a short settle time.
- **Generic nudges.** Our first fast setting kept copying the generic move ("Ask what would convince them"). We compared model settings with a script on cases that weren't in the prompt's examples. Claude Sonnet 5.5 with thinking off gave clearly more specific nudges at about 1.5 seconds median, so it became the default. Later, on held-out cases plus the demo beats, Claude Opus 5.5 in fast mode scored higher in our judged comparison and answered faster, so it now runs live nudges, with Sonnet as the fallback. Making Claude write the nudge before naming the move, and penalizing echoes, cut generic copies further.
- **Too slow to feel live.** Waiting for the buyer to finish before asking Q added a visible pause. Listen-ahead asks while they're still talking, so the nudge lands about a second after they stop.
- **The therapist problem.** Once Q got emotionally smarter, it started asking feelings question after feelings question and forgot to close. Now empathy is one beat, then a pivot to commitment; Q never stacks probing questions, and the right move depends on the clock.
- **Learning too little.** The first learning prompt rejected a sharper version of a known tactic as a duplicate. We calibrated it to learn a move when it's new or meaningfully sharper.

## Accomplishments we're proud of

- It works on real Google Meet calls, both sides, with no audio capture.
- The whole learning loop runs live: in our test, one won call taught Q "Flip roles, let them sell it" from a single improvised line in about 3 seconds, and it showed up in the feed every other Q card reads.
- Nudges stay specific to the call. On our demo call, the same buyer line got the same idea 3 out of 3 times ("Ask which pen closes deals"; "Compare $40 to ten-year lease").
- Q grades its own advice. Every nudge gets a verdict and a reason after the call, and the ranking and retirement rules act on them, with no person in the loop.
- 36 situation types, including personal moments like grief, embarrassment and money trouble, each with its own rules.
- A card that feels alive without being noisy, built on John's own design system.

## What we learned

- Judge AI quality on cases that aren't in the prompt. Ours looked great on its own examples and generic on new ones.
- Relevance beats win rate. A move that wins often is still a bad nudge in the wrong moment, so Claude ranks fit first and win rate breaks ties.
- A short nudge forces a decision. A paragraph can hedge; a nudge you read at a glance has to pick a direction.
- Losses teach as much as wins. Every call now leaves a lesson.

## What's next

- Zoom, Microsoft Teams and phone dialers, with our own transcription so Q isn't tied to Meet's captions.
- Manager tools for teams, on top of the company-only playbook setting that's built today.
- Royalty payouts for winning moves (planned: a pool of 10% of subscription revenue, split by attributed wins) and give-to-get access to the network.
- Win and loss verified from CRM closed-won deals instead of a button.
- A clear notice and consent flow for buyers, retention controls, and the Chrome Web Store.

## Prizes

Devpost judges every project on Functionality, Continual Learning and Pitch, with cross-eligibility for the prizes below.

### Grand Tech (Continual Learning)

The model stays fixed; the playbook is what learns, and it learns from outcomes. In Devpost's words, Q gets better as it's used and adapts as the world changes.

- **Every call updates the record.** Each move Q showed gets a use, and a win if the call was won. Ranking runs on a Bayesian win rate, so new moves start near 50% and earn their place.
- **Wins teach new moves.** Claude finds the seller's own line that turned the call, turns the tactic into a reusable move, and credits the seller. It's live on every Q card within about 3 seconds.
- **Losing moves retire.** 8 or more uses and under a 25% win rate, automatically.
- **Losses teach too.** Every call leaves a lesson in the feed, for example "turned at: buyer said I never go; seller pivoted to amenities".
- **New ideas get a fair shot.** 15% exploration for newly learned moves, never in sensitive moments.
- **It adapts inside a call, too.** The call clock follows the buyer, extending when they're engaged and pulling in when they're short on time or going quiet, and Q re-reads the buyer type on every line.
- **It evolves with the user.** Your wins become your moves, credited by name. With "My company only", the moves Q learns from you stay with your team, a private playbook that grows from your own wins.
- **In the video (1:10):** John improvises a move Q has never seen, wins, Q learns "Flip roles, let them sell it", and a second Q card shows "New move learned from John · Los Angeles".

### Continual Failure Detection

A nudge can read well and still lose the room, and nothing throws an error. Q catches those silent misfires itself, from evidence in the call.

- **Every nudge gets judged.** After every call, won or lost, Claude reads the transcript with each nudge placed where the seller saw it and records whether the seller used it, what the buyer did right after, a verdict (helped, neutral or hurt) and a one-line reason.
- **Calibrated, not generous.** An unused nudge is always neutral, and a win doesn't make a nudge helpful.
- **It fixes itself.** Verdicts go on each move's record and move its ranking by at most 0.2 either way, so one bad call can't sink a good move. A move that keeps hurting is flagged "Often misfires", then retires after 4 or more reviews.
- **You can see it.** The card says how its nudges did right after the call, every call has a report with each verdict inline, and the playbook has a "What Q got wrong" panel with the reasons.
- **In the video (1:19):** the result toast, the call report's verdicts, and "What Q got wrong".

### Most Scalable To $1B

Full numbers, assumptions and sources: [SCALE.md](SCALE.md).

- **Category:** closing intelligence. The product is the moves that are winning right now, and every deal on the network sharpens them.
- **Unit economics (measured):** about $0.12 model cost per 15-minute call on our standard model, about $13.20 per rep per month at 5 calls a day. Against $39/month Pro and $99/month Team seats, that's 66% and 87% margin after model cost. Hosting, database, payments and support aren't counted yet.
- **Market:** about 4.04M US sellers in the occupations Q targets (BLS, May 2025).
- **Path (projection):** about 103,000 paid seats at an $81 blended price is about $100M ARR, a $1B company at 10x revenue.
- **Wedge:** startup and SMB SaaS reps on Google Meet first, then high-ticket remote closers. Insurance, financial services and real estate once phone dialers ship.
- **Moat:** anyone can call the same model; nobody can copy which moves actually closed. Every move carries its win, loss and review record, and every seller's win makes everyone's nudges better.
- **Marketplace:** the competitor firewall is built (a seller can keep the moves Q learns from them private to their company). Proposals: royalties for moves that win on other sellers' calls (a pool of 10% of subscription revenue, split by attributed wins; wins on your own calls don't count) and give-to-get access.

### Best Visual Design

- **Tango, John's own design system:** dark, monochrome glass and a glowing glass ring as the Q logo, used across the card, popup, landing page, playbook, call report and royalties page.
- **The nudge is the hero.** Short, big, readable at a glance mid-sentence. Under it, small: who the move was learned from, the situation, the buyer type.
- **A card that shows it's listening.** "Hearing Taylor…" and "Thinking…" states, a faint line of what it just heard, a glass ring that brightens when someone talks, a call clock with the phase (amber in the last 20%), and nudges that dim after a minute so an old one never looks current.
- **It tells you the next step.** Bright when you need to act ("Press C to turn on captions"), faint while it just listens ("Listening for the buyer…").
- **Built to live on top of Meet.** Shadow DOM so Meet can't break it, draggable, remembers where you left it, and Meet's own captions hidden. No bot joins the call.

## Built with

Chrome Extensions (Manifest V3), JavaScript, Shadow DOM, Next.js, React, TypeScript, Tailwind CSS, Vercel, Supabase, PostgreSQL, Anthropic API, Claude Opus 5.5, Claude Sonnet 5.5, Zod

## Team

John Wang
