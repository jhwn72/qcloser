# Devpost write-up: Q

> **For John, before posting (delete this box):**
> 1. **Deadline and links.** Devpost closes submissions at **11:00 AM PT**; submit by 10:45 AM. The GitHub repo must be public, with working links, before you submit. Fill in the video URL after upload.
> 2. **Prizes to select:** Grand Tech, Continual Failure Detection, Most Scalable To $1B, Best Visual Design. There is no Agents track.
> 3. **Thumbnail:** docs/devpost/q-devpost-tagline.png (3:2).

## Title

Q: your cue to close

## Tagline

Devpost's "Elevator pitch" field (200 characters max). Pick one:

- AI that feeds you lines is a tractor at the gym. Q is your spotter: live nudges on every sales call, from the moves closing deals right now. You lift. You get stronger. Every win makes Q sharper. (195)
- Every closer needs a Q. Live nudges on your sales call, pulled from the moves closing deals right now. You say it your way, you close, and your winning move goes out to every closer on Q. (187)
- Every closer needs a Q. It reads your sales call live and flashes the move that's closing deals right now. You say it your way. Win, and your move goes out to every closer on the network. (187)

## Links

- **Try it:** https://qcloser.vercel.app (landing, install steps, live playbook)
- **Code:** [GitHub URL]
- **Video:** [YouTube or Loom URL]

## Inspiration

"Sell me this pen" is the most famous sales test there is, and most people freeze. Millions of people take that test for real every year, and more of them are young, independent and learning the craft from TikTok and YouTube. They're thrown in cold, with nobody beside them on the call.

The AI they reach for feeds them lines to read. It sounds like a script, and they never learn to sell. When a great rep improvises something that closes, it disappears when the call ends.

James Bond never goes into the field without Q handing him the right gadget at the right moment. Every closer needs a Q: the right move at the right moment, at a glance, from a playbook that remembers what works.

## The market

- **Sellers keep coming.** The US fills about 1.67 million sales jobs every year, about 243,000 of them B2B sales roles. [1]
- **They're young and on their own.** About 30% of US B2B reps are under 35. [2] 74.9 million Americans work independently, and full-time independents are up 114% since 2020. [3] Sales and business development were the fastest-growing fully remote job categories in the first half of 2026. [4]
- **They learn from their feeds.** 63% of US adults under 30 use TikTok [5], and 63% of Gen Z workers have taken career advice from Reddit, YouTube or TikTok. [6]
- **And they're struggling.** 48% of account executives hit quota, and ramp is up to 6.2 months, the longest the Bridge Group has ever recorded. [7] SDR attrition runs 40% a year. [8] 46% of Gen Z reps rarely get feedback on their sales conversations. [9]
- **Guidance is what wins.** Sales orgs that give reps AI next-best-action guidance are 2.6x more likely to grow. [10] And buyers still want a person: by 2030, 75% of B2B buyers will prefer human-led sales over AI. [11] Q makes that person better instead of replacing them.
- **Buyers pay for call AI.** Gong passed $500M in annual recurring revenue, growing more than 55% a year. [12] Sales enablement platforms are a $6.0B market, projected to reach $21.2B by 2033. [13]

## Why nudges, not scripts

AI that feeds you the exact line is a tractor at the gym: the weight goes up, and you never get stronger. The research agrees.

- **A paragraph is too slow.** Adults read about 238 words a minute [14], so a 120-word AI answer takes 30 seconds to read while the buyer waits. A nudge takes a glance.
- **Answers make you weaker.** In a randomized trial with about 1,000 high school students, the ones given ChatGPT's answers scored 48% higher in practice, then 17% worse on the exam once the AI was gone. Students whose AI gave hints instead didn't take the hit. [15]
- **It happens to experts too.** After doctors got used to AI help, their unaided adenoma detection rate fell from 28.4% to 22.4%. [16]
- **And to developers.** In Anthropic's own randomized trial, developers who learned a new library with AI scored 50% on the follow-up quiz, against 67% without it. The ones who used AI to ask questions instead of handing over the work scored 65% or higher. [17]
- **Saying it yourself is how it sticks.** Generating an answer beats reading one, by almost half a standard deviation across 86 studies. As Bjork and Bjork put it, being told what you could work out yourself robs you of the learning. [18] [19]
- **Buyers can hear a script.** Customers detect script use in a conversation, and across more than 31,000 salespeople, reps who adapt to the buyer perform better on real sales numbers. [20] [21]
- **Live help makes new reps fast.** With a real-time AI assistant, support agents two months in performed like six-month veterans, and kept their edge when the AI went down. [22] Q delivers that ramp while the seller does the talking.
- **Coaching wins deals.** Teams with dynamic coaching win 66% of forecast deals; teams that leave coaching to chance win 44%. [23] Q coaches on every call, in the moment it matters.

So Q never hands you a line. It tells you where to steer, you say it your way, and every call makes you a better closer. Your best moves go out to every closer on Q.

## What it does

**Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new.**

We call it **closing intelligence**: the moves that are winning right now, getting sharper with every deal. Q is a Chrome extension that floats a card over Google Meet, with a playbook of 500 moves across 60 situations that grows with every win.

- **Hears both sides.** Q reads Meet's live captions (the seller's own are labeled "You"). No audio capture, no extra transcription service.
- **Nudges, never scripts.** When the buyer objects, warms up, or the call drifts, the card flashes a short nudge telling the seller where to steer. "I don't need a pen" becomes "Ask what contracts they sign". The seller says it their own way.
- **Every nudge has a source.** Each one comes from a playbook move and shows who it was learned from: "Learned from John · Los Angeles".
- **Fits this buyer and this company.** Claude reads the whole call, a saved company profile and an optional pre-call brief, tags the buyer (skeptical, rushed, price-focused or curious), picks the best move, and fits it to the buyer: "Offer 0% financing, about 190 monthly". Q starts thinking while the buyer is still talking, so nudges land about a second after they stop.
- **Watches the clock, and the clock follows the buyer.** The seller sets the call length (10, 15, 30 or 45 minutes). The card shows the phase (Discovery, Present and handle, Close window, Ask for the sale), and nudges push toward the close as time runs low. The target adapts: it extends when the buyer is engaged or says there's no rush, and pulls in when they're short on time or going quiet.
- **Learns from every call.** End call leaves Meet and asks Won or Lost. On a win, Claude extracts the seller's own winning move and adds it to the playbook, credited to them; every other Q card shows "New move learned from John · Los Angeles" within about 3 seconds. Moves that keep losing retire on their own. Every call, won or lost, leaves a lesson in the "What Q learned" feed.
- **Grades its own advice.** After every call, Q judges each nudge it showed from what happened next: helped, neutral or hurt, with a reason. The card says how its nudges did, a call report shows every verdict inline, and moves that keep hurting lose rank and retire.
- **You choose who gets your moves.** Everyone (credited, and earning royalties every time the move helps another seller close) or My company only, so a competitor never gets your best lines.
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

**Picking a nudge (`/api/cue`).** For each finished buyer line, Claude gets the playbook, the company profile, the brief, call stats (minutes used of the target, seller talk share, talking streak), the nudges already shown, and the whole call. It returns, in this order: the moment (one of 60 situation types, or none), the buyer type, the aim (probe, answer, acknowledge, calm or advance), and two picks, each a concrete nudge plus the playbook move it uses. The order is deliberate: Claude commits to what the nudge must do before writing it, and writes the nudge before naming the move, so it doesn't just echo the move. The server then:

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
- 60 situation types, including personal moments like grief, embarrassment and money trouble, each with its own rules.
- A card that feels alive without being noisy, built on John's own design system.

## What we learned

- Judge AI quality on cases that aren't in the prompt. Ours looked great on its own examples and generic on new ones.
- Relevance beats win rate. A move that wins often is still a bad nudge in the wrong moment, so Claude ranks fit first and win rate breaks ties.
- A short nudge forces a decision. A paragraph can hedge; a nudge you read at a glance has to pick a direction.
- Losses teach as much as wins. Every call now leaves a lesson.

## What's next

- Zoom, Microsoft Teams and phone dialers, with our own transcription so Q isn't tied to Meet's captions.
- Manager analytics for teams: which moves win for which reps, objection trends and ramp tracking.
- Win and loss verified from CRM closed-won deals instead of a button.
- Enterprise controls: buyer notice and consent, retention settings, SSO and audit logs.

## Prizes

Devpost judges every project on Functionality, Continual Learning and Pitch, with cross-eligibility for the prizes below.

### Grand Tech (Continual Learning)

The model stays fixed; the playbook is what learns, and it learns from outcomes. In Devpost's words, Q gets better as it's used and adapts as the world changes.

- **Every call updates the record.** Each move Q showed gets a use, and a win if the call was won. Ranking runs on a Bayesian win rate (Laplace's rule of succession), so new moves start near 50% and earn their place.
- **Wins teach new moves.** Claude finds the seller's own line that turned the call, turns the tactic into a reusable move, and credits the seller. It's live on every Q card within about 3 seconds.
- **Losing moves retire.** 8 or more uses and under a 25% win rate, automatically.
- **Losses teach too.** Every call leaves a lesson in the feed, for example "turned at: buyer said I never go; seller pivoted to amenities".
- **New ideas get a fair shot.** Epsilon-greedy exploration: 15% of nudges try a newly learned move, never in sensitive moments.
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

- **Why now:** sales orgs that give reps AI next-best-action guidance are 2.6x more likely to grow [10], fewer than half of AEs hit quota [7], and 74.9 million Americans now work independently [3]. Q is next-best-action guidance that also teaches.
- **Category:** closing intelligence. The product is the moves that are winning right now, and every deal on the network sharpens them.
- **Unit economics:** about $0.12 model cost per 15-minute call on our standard model, about $13.20 per rep per month at 5 calls a day. Against $39/month Pro and $99/month Team seats, that's 66% and 87% margin after model cost.
- **Market:** about 4.04M US sellers in the occupations Q targets (BLS, May 2025).
- **Path:** about 103,000 paid seats at an $81 blended price is about $100M ARR, a $1B company at 10x revenue.
- **Wedge:** startup and SMB SaaS reps on Google Meet first, then high-ticket remote closers. Insurance, financial services and real estate once phone dialers ship.
- **Moat:** anyone can call the same model; nobody can copy which moves actually closed. Every move carries its win, loss and review record, and every seller's win makes everyone's nudges better.
- **Marketplace:** closers earn royalties when their moves win on other sellers' calls (a pool of 10% of subscription revenue, split by attributed wins; wins on your own calls don't count). Give-to-get access brings in new moves, and a competitor firewall keeps a company's moves private to its team.

### Best Visual Design

- **Tango, John's own design system:** dark, monochrome glass and a glowing glass ring as the Q logo, used across the card, popup, landing page, playbook, call report and royalties page.
- **The nudge is the hero.** Short, big, readable at a glance mid-sentence. Under it, small: who the move was learned from, the situation, the buyer type.
- **A card that shows it's listening.** "Hearing Taylor…" and "Thinking…" states, a faint line of what it just heard, a glass ring that brightens when someone talks, a call clock with the phase (amber in the last 20%), and nudges that dim after a minute so an old one never looks current.
- **It tells you the next step.** Bright when you need to act ("Press C to turn on captions"), faint while it just listens ("Listening for the buyer…").
- **Built to live on top of Meet.** Shadow DOM so Meet can't break it, draggable, remembers where you left it, and Meet's own captions hidden. No bot joins the call.

## Sources

1. U.S. Bureau of Labor Statistics, Employment Projections 2025-35 (sales and related occupations; B2B total sums services sales reps, wholesale and manufacturing reps, and sales engineers). https://www.bls.gov/emp/tables/emp-by-detailed-occupation.htm
2. U.S. Bureau of Labor Statistics, Current Population Survey 2025, table 11b (employed persons by occupation and age). https://www.bls.gov/cps/cpsaat11b.htm
3. MBO Partners, State of Independence 2026 (Sept 28, 2026). https://www.mbopartners.com/blog/press/independent-workforce-reaches-74.9-million
4. FlexJobs, fastest-growing remote career categories, H1 2026, via Allwork.Space (July 24, 2026). https://allwork.space/2026/07/flexjobs-names-10-fastest-growing-careers-for-remote-jobs-this-summer/
5. Pew Research Center, "8 facts about Americans and TikTok" (March 2, 2026). https://www.pewresearch.org/short-reads/2026/03/02/8-facts-about-americans-and-tiktok/
6. Gateway Commercial Finance survey, via WorkLife (Oct 7, 2025). https://www.worklife.news/?p=87035
7. The Bridge Group, 2026 AE Models, Motions and Metrics (June 22, 2026). https://www.bridgegroupinc.com/research/2026-ae-models-motions-metrics
8. The Bridge Group, 2025 SDR Models and Metrics (Feb 6, 2025). https://www.bridgegroupinc.com/research/2025-sdr-models-metrics-report-the-bridge-group
9. Salesforce, State of Sales, 7th edition (Feb 3, 2026). https://www.salesforce.com/news/stories/state-of-sales-report-announcement-2026/
10. Gartner survey of 227 CSOs (May 20, 2026), via 01net. https://www.01net.it/gartner-survey-finds-sales-organizations-that-provide-ai-enabled-next-best-actions-are-2-6x-more-likely-to-achieve-commercial-growth/
11. Gartner (Aug 25, 2025), via IT-Online. https://it-online.co.za/?p=303242
12. Gong, "Gong growth accelerates past 55% YoY, ARR tops $500M" (May 12, 2026). https://www.gong.io/press/gong-growth-accelerates-past-55-yoy-arr-tops-500m
13. Grand View Research, Sales Enablement Platform Market Report (June 2026). https://www.grandviewresearch.com/industry-analysis/sales-enablement-platform-market-report
14. Brysbaert, "How many words do we read per minute?", Journal of Memory and Language 109 (2019). https://doi.org/10.1016/j.jml.2019.104047
15. Bastani et al., "Generative AI without guardrails can harm learning", PNAS 122(26) (2025). https://pmc.ncbi.nlm.nih.gov/articles/PMC12232635/
16. Budzyń et al., Lancet Gastroenterology & Hepatology 10(10) (2025). https://wrap.warwick.ac.uk/id/eprint/191005
17. Shen & Tamkin, Anthropic, AI assistance and coding skills (January 2026). https://www.anthropic.com/research/AI-assistance-coding-skills
18. Bertsch et al., "The generation effect: a meta-analytic review", Memory & Cognition 35(2) (2007). https://pubmed.ncbi.nlm.nih.gov/17645161/
19. Bjork & Bjork, "Making things hard on yourself, but in a good way" (2011). https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/04/EBjork_RBjork_2011.pdf
20. Victorino et al., Journal of Service Research 15(4) (2012). https://ecommons.cornell.edu/entities/publication/80100454-e7a3-4990-ae49-d21542ca4299
21. Franke & Park, "Salesperson adaptive selling behavior and customer orientation: a meta-analysis", Journal of Marketing Research 43(4) (2006). https://doi.org/10.1509/jmkr.43.4.693
22. Brynjolfsson, Li & Raymond, "Generative AI at Work", Quarterly Journal of Economics 140(2) (2025). https://arxiv.org/abs/2304.11771
23. CSO Insights, 2017 Sales Enablement Optimization Study. https://www.revenue.io/wp-content/uploads/2020/04/2017-Sales-Enablement-Optimization-Study.pdf

Business model numbers and their sources: [SCALE.md](SCALE.md).

## Built with

Chrome Extensions (Manifest V3), JavaScript, Shadow DOM, Next.js, React, TypeScript, Tailwind CSS, Vercel, Supabase, PostgreSQL, Anthropic API, Claude Opus 5.5, Claude Sonnet 5.5, Zod

## Team

John Wang
