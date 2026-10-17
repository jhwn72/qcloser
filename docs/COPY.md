# Q: copy and positioning

For John. Written Oct 17, 2026, around 3 AM PT, from the local files (the live site lags them) and the sources at the bottom. These are proposals only: nothing on the site or in VIDEO.md was edited. Every "Before" is quoted from the current local file.

## 0. Read this first

1. **Confirmed: the Devpost form closes at 11:00 AM PT, not 2 PM.** Devpost's Dates tab lists Submissions ending Oct 17 at 11:00 AM PT, then Judging from 11:00 AM to 2:00 PM and Winners announced at 2:00 PM [1c]. At 2:41 AM PDT, Devpost's own listing said "about 8 hours left" [1d]. The Rules tab's "Oct 16 5 PM - Oct 17 2 PM" [1b] is the event window. New plan: film around 8:30 to 9:45 AM and submit by 10:45 AM. VIDEO.md, DEMO_SCRIPT.md and DEVPOST.md now say so.
2. **Live nudges run on Claude Opus 5.5 in fast mode, not Sonnet 5.5.** `web/lib/claude.ts` sets `DEFAULT_VARIANT = "opus-low-fast"` with Sonnet 5.5 as the fallback; learning and call reviews use Sonnet 5.5. John is keeping Opus fast as the live brain. VIDEO.md, DEVPOST.md and SCALE.md still say Sonnet for live nudges, so update them. The README describes the code as it is now.
3. **Keep the cost numbers, attribute them exactly.** John's call: keep $0.12 per 15-minute call, $39 Pro / $99 Team and the margins. That $0.12 was measured on Sonnet 5.5 before listen-ahead, not on the setup the demo runs. So everywhere it appears, say "about $0.12 per call on our standard model", never "the demo costs $0.12".
4. **Speed: say "about a second".** On the live site, nudges landed about 1.0 to 1.3 s after the buyer stopped in a realistic-pace test call. Never claim sub-second, and retire the old "~2 s" and "1.5 to 2 s" everywhere.
5. **No a16z judges are listed, and there is no Agents track.** Devpost lists four judges and five prizes [1a]. The event is part of a16z's Tech Week [16], and a16z led Cluely's Series A [7], so treat Cluely with respect on stage. One judge works at OpenAI, so "generic AI" is a better foil than naming ChatGPT.
6. **The live site is behind the local files.** On qcloser.vercel.app right now, /royalties and /q-extension.zip return 404, and the FAQ still says private team playbooks are on the roadmap. The README's install link and the eligibility rule "ensure your project AND GitHub links work" [1a] both depend on a deploy. The repo also has no git remote yet.

## 1. The hackathon, confirmed

**SEPHacks 2026: USC SEP x LA Tech Week**, run by Sigma Eta Pi, described as "USC's premier AI hackathon and an official LA Tech Week event" [1a].

| Prize | Amount | What Q enters with |
|---|---|---|
| Grand Tech Winner | $1,500 | The whole product, scored on the criteria below |
| Grand Tech Runner-Up | $500 | Same |
| Continual Failure Detection | $500 | The after-call review that grades every nudge and retires the ones that hurt |
| Most Scalable To $1B | $500 | SCALE.md |
| Best Visual Design | $300 + Figma merch | Tango and the card |

**Judging criteria** (Devpost wording) [1a]:
- Eligibility: "Be a team of at MAX 4 people, ensure your project AND GitHub links work, ensure your demo is legible"
- Functionality: "How functional is the prototype or demo?"
- Continual Learning: "Does your product get better as it's used, or adapt as the world changes?"
- Pitch: "Tell a story with your demo, put the judges into the shoes of your consumer and demonstrate why your product is valuable"
- Rules tab [1b]: "Scored per criteria, with cross-eligibility" and "A big focus on continual learning (products that evolve with the user), creativity and feasibility". Projects must be built during the hackathon by the team.

**What to submit** [1a]: "A 2 min demo + pitch video", "Github project link", "Project link (eg. deployed on vercel)".

**Judges** [1a]: Michelle Liu (Studio Michelle Liu), Kaushal Patel (OpenAI), Jerry Zhang (Lemma), ShiaoFong Yin (Lloyd Greif). **Sponsors:** AfterQuery, SideShift, Lemma, OutcastVentures, Figma.

**Worth knowing:** Jerry Zhang co-founded Lemma, a startup that watches production AI agents for "silent" failures, where the app runs normally "while an AI agent quietly does the wrong thing", and suggests fixes [15]. That is Q's failure detection, applied to sales advice. Lemma is also a sponsor, so the failure-detection prize is probably theirs (not confirmed).

**Not confirmed anywhere I could find:** the 5 to 7 PM closing ceremony and the must-attend rule (Devpost only says winners are announced at 2 PM), a README requirement (Devpost doesn't list one; ship it anyway, judges open the repo), a16z judges, and an Agents track.

## 2. Messaging framework

### The lines (approved; keep them exactly)

- Hero: **Every closer needs a Q.** (Q is the quartermaster who hands the agent the right gadget at the right moment.)
- Tagline: **your cue to close**
- Plain line: **Q listens to your sales call and shows you, at a glance, what the best salespeople would do next.**
- The wow, right after it: **Every win teaches it something new.**
- Category: **closing intelligence**

### Positioning in one paragraph

For sellers who live on video calls, Q is closing intelligence: a card over Google Meet that reads the call, spots the moment (an objection, a worry, a buying signal, a call running long) and shows a short nudge on where to steer, about a second after the buyer stops talking. Unlike call tools that analyze calls afterward or show cards someone wrote in advance, Q learns from results. A seller's winning move joins the playbook within seconds, credited to them. Every move carries its record. After each call, Q grades its own nudges and retires the ones that hurt.

### The problem

| Pain | What's true | Source |
|---|---|---|
| No time to read mid-call | In conversation, people reply on average about 0.2 s after the other person stops (mean +208 ms across 10 languages). A paragraph of AI advice can't be read in that gap. | Stivers et al., PNAS 2009 [12] |
| Freezing on objections | Everyone has a Take 1; the Belfort skit shows it. I found no credible number, so don't put one on it. | none |
| Scripted AI sounds scripted | Assistants that hand you answers to read put words in your mouth. Cluely's homepage leads with "#1 Undetectable AI for Meetings" and "real-time answers" [6]. Q gives direction, never lines. | [6] |
| Coaching doesn't scale | Sales tools sell on this pain themselves: Outreach pitches Kaia as "reducing reliance on manager's availability to support reps that are ramping up" [9]. | [9] |
| Slow ramp, high churn | SDRs take 3.0 months to ramp and stay 1.9 years on average; median annual SDR attrition was 40% in 2024; only 60% hit quota, the lowest in the study's history (351 B2B companies). | Bridge Group, Feb 2025 [13] |
| Winning lines walk out the door | Follows from the churn: a line a rep improvised that closed lives in their head, and leaves when the call ends or the rep does. | [13] |
| AI that never learns what closes | The real-time tools I checked fire guidance someone set up: Trellus says managers write it [10]; Balto answers from your knowledge base, with playbooks set up before launch [8]; Revenue.io's help pages have admins create Moments templates [18]. None of the product pages I read describes learning a new move from a single won call. | [8] [10] [18] |

Don't use: the "9% of a manager's time goes to coaching" figure (only found secondhand), vendor win-rate lifts, or analyst market-size estimates.

### Why Q is unique: three pillars, in this order

1. **It learns what closes.** Moves come from sellers' real wins, not from someone's script. One won call can teach a move, credited by name and live on every Q card about 3 seconds later. Every move carries a win and loss record: the best rise, the losers retire, and new ones still get a fair try (15% exploration, never in sensitive moments).
2. **It catches its own mistakes.** After every call, Q judges each nudge it showed from what happened next (did the seller use it, did the buyer move toward yes or pull back): helped, neutral or hurt, with a reason. Moves that keep hurting lose rank, then retire. Most tools grade the rep. Q grades its own advice.
3. **It nudges, never scripts, right on the call.** A short line on where to steer, about a second after the buyer stops, credited to whoever taught it. It knows 36 situations, reads the buyer, and paces toward the close on a clock that follows the buyer. No bot joins the call; it runs in the seller's own browser tab.

The line that ties them together, already on the site, and the spine of the pitch: **Generic AI guesses what sounds persuasive. Q learns what actually closes, and catches itself when it's wrong.**

### Head-to-head, honestly

| | What it is | Strong at | Where Q is different | Where it beats Q today |
|---|---|---|---|---|
| **Cluely** | Desktop AI meeting assistant: "#1 Undetectable AI for Meetings", "real-time answers", notes; "never joins your meetings" [6]. a16z led its Series A [7]. | General help in any meeting, notes, distribution, brand. | Built for one job, closing. Gives direction instead of answers to read, and learns from outcomes which moves win. Q is meant to be disclosed, not hidden. | Breadth, notes, reach. Not tied to Meet's captions. |
| **Gong; Chorus by ZoomInfo** | Conversation intelligence for revenue teams: capture, transcribe and analyze calls, coaching, CRM updates [3] [5]. Gong passed $300M ARR [4] and launched AI agents for revenue teams in 2025 [2]. | Post-call analytics, deal risk, forecasting, enterprise trust. | They show a manager what happened after the call. Q helps the seller during it, and each outcome changes the next nudge automatically. | Everything enterprise: integrations, CRM-backed outcomes, analytics, security, every platform. |
| **Balto, Cresta, Observe.AI** | Real-time agent assist for enterprise contact centers: checklists, prompts, knowledge answers, compliance [8] [11] [14]. Cresta's hints "reinforce top-performer behaviors" and its models are "trained on your enterprise data" [11]. | Contact-center scale, telephony, compliance, supervisors. | Deployed per enterprise and set up per call flow. Q installs in a minute for one seller on a video call, and one won call can add a move for every user. | Telephony, compliance, proven deployments. Cresta also learns from top performers, at the enterprise level. |
| **Outreach Kaia, Trellus, Revenue.io Moments** | In-call cards inside sales stacks. Kaia "joins and records live meetings" with live battlecards and content cards [9]; Trellus shows "the next useful coaching suggestion", written by managers [10]; Moments notifications are set up by admins and supervisors [18]. | Built into dialers, sequencers and CRMs. | Their cards say what a manager set up. Q's moves come from sellers' wins, are ranked by results and judged after every call. No bot joins. | Integrations, dialers, adoption, maturity. |
| **Asking a chatbot** | Prep and role-play before a call. | Free, flexible, great for prep. | Not on the call, not timed, no outcome data. | Prep, breadth. |

**Where Q is weaker (say it before a judge does):** Google Meet only, and it depends on Meet's captions. Won or Lost is a button, not a CRM deal. A won call credits every move shown, so attribution is noisy. The starter playbook is sample data. A buyer notice and consent flow isn't built. No users yet.

### Proof points that are true today

- Runs on real Google Meet calls, both sides, from Meet's live captions. No audio capture, no bot.
- Nudges land about a second after the buyer stops talking (1.0 to 1.3 s in a realistic-pace test call on the live site; a fresh full request takes about 1.0 to 1.9 s, typically about 1.2 s). Q starts thinking while the buyer is still talking (listen-ahead).
- One won call taught Q "Flip roles, let them sell it" from one improvised line. The learn call took about 3 s and the move showed up in the feed every card polls (DEMO_SCRIPT.md).
- Every Q card polls for new moves every 3 s, so other sellers see "New move learned from..." within about 3 s.
- On the demo call, beats 2 to 4 got the same idea 3 out of 3 runs (for example "Compare $40 to ten-year lease").
- 36 situations; about 250 starter moves (sample data).
- Failure detection: a verdict and reason for every nudge; a move's ranking moves by at most 0.2 either way from its reviews; a move retires after 4 or more reviews if it hurt at least twice and more than twice as often as it helped. Separately, moves retire at 8 or more uses under a 25% win rate.
- Model cost about $0.12 per 15-minute call on our standard model (Sonnet 5.5, measured before listen-ahead; see 0.3). Quote it with that attribution.

### Words

- **Use:** closing intelligence, nudge, move, playbook, learned from, record, misfire, helped and hurt, the clock, steer.
- **Avoid:** copilot, five words, script (except "never scripts"), AI-powered, revolutionary, undetectable, real closers, users or traction, guaranteed.

### How Q maps to each prize

**Grand Tech (Functionality, Continual Learning, Pitch)**
- *Functionality:* a real Meet call on camera, both sides, live nudges, End call, Won, and the toast on a second card. Judges can try /test without a call, or install the zip.
- *Continual Learning* ("get better as it's used, or adapt as the world changes"): Q does both. Better as it's used: wins add moves, every call updates the records, misfires get ranked down. Adapts as the world changes: rank follows what's winning now, stale moves retire, new moves get a fair try; inside a single call, the clock adapts to the buyer. For "products that evolve with the user": your wins become your moves, credited to you, and with "My company only" your team's playbook grows from your own wins.
- *Pitch:* Belfort, Take 1 against Take 2, the stopwatch payoff.

**Continual Failure Detection.** Use Lemma's frame: a silent failure. A nudge can read well and still lose the room, and nothing throws an error. Q catches it from evidence in the transcript (what the buyer did next), names the reason, and applies the fix itself (rank down, then retire), with guardrails so one bad call can't sink a good move. The call report is the trace: every nudge at the line where it appeared, with its verdict. Give it at least 4 seconds in the video (section 4).

**Best Visual Design.** Tango, John's own design system: dark monochrome glass and one glowing ring. Show the card's states (Hearing Jordan…, Thinking…, the ring brightening as someone talks, the clock turning amber in the last 20%, old nudges dimming), the call report and the royalties pool chart. If Tango lives in Figma, a one-second shot of the file is a nice nod to the sponsor.

**Most Scalable to $1B.** The category (closing intelligence), the moat (an outcome record nobody can copy), royalties that turn top closers into suppliers, the competitor firewall, model cost per call on our standard model (attributed as such), the bottom-up BLS market, and every projection labeled.

**Agents.** No such prize on Devpost. Keep one sentence about the perceive, decide, act, learn loop under Functionality and delete the Agents section from DEVPOST.md.

## 3. Website copy

Format: **Before** (quoted from the local file), **After**, **Intent**. "Keep" means it already does its job.

### Top bar (components/SiteNav.tsx)

Keep: the mark, "your cue to close", Playbook, Royalties.

### Hero (page.tsx)

**Headline.** Keep: "Every closer needs a Q."

**Subline**
- Before: "Q listens to your sales call and shows you, at a glance, what the best salespeople would do next."
- After: "Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new."
- Intent: the hero explains the live half and stops. The learning loop, the main judging criterion, first appears several scrolls down. The added sentence is already approved in VIDEO.md and DEVPOST.md.

**Eyebrow (new, optional).** A small chip above the headline, styled like the royalties hero chip.
- After: "Closing intelligence · live on Google Meet"
- Intent: category and platform before the first scroll. A judge knows what it is and where it runs in five words.

**Secondary link**
- Before: "See the playbook"
- After: "See the live playbook"
- Intent: the page refreshes itself; "live" tells judges real learned moves show up there.

### Hero card (HeroDemo.tsx)

Add a fine line under the card.
- After: "Examples from the starter playbook. Names are sample data."
- Intent: the card shows "Learned from Ana · Los Angeles" with no disclaimer on the landing page. Judges shouldn't take Ana for a user.

### Three steps (STEPS in page.tsx)

Section label "Closing intelligence": keep.

**01 Hears the call**
- Before: "Q reads Google Meet's live captions, both sides, and keeps track of how far into the call you are."
- After: "Q reads Google Meet's live captions for both sides, right in your browser. No bot joins the call and no audio is recorded."
- Intent: "is it recording me?" is the first question any seller, buyer or judge asks. Answering it here also sets Q apart from tools that join and record meetings [9]. The clock has its own section below.

**02 Nudges, never scripts.** Keep.

**03 Learns from every call**
- Before: "Win, and your best move joins everyone's playbook, credited to you. Lose, and Q keeps the lesson."
- After: "Win, and your best move joins everyone's playbook, credited to you. Lose, and Q keeps the lesson. Either way, Q checks which of its own nudges helped."
- Intent: puts failure detection in the summary judges read first.

### Feature: "It knows the moment, and the clock."

Headline: keep.

**First paragraph**
- Before: "Q recognizes 36 situations, from price pushback and "let me think about it" to a buyer who just got personal. It also watches the time: early on it helps you find the need, and near the end it pushes you to ask for the sale."
- After: "Q recognizes 36 situations, from price pushback and "let me think about it" to a buyer who just got personal, and it reads the buyer too: skeptical, rushed, price-focused or curious. It also watches the time. Early on it helps you find the need; near the end it pushes you to ask for the sale. And the clock follows the buyer: it stretches when they're engaged or say there's no rush, and pulls in when they're short on time or going quiet."
- Intent: buyer tagging and the adaptive clock are built and visible on the card, but the page mentions neither. The adaptive clock is the clearest "adapts as the world changes" behavior inside a single call.

**Second paragraph**
- Before: "Tell Q what you sell once, add a quick brief before a call, and every nudge fits your offer."
- After: "Tell Q what you sell once, add a quick brief before a call, and nudges use your real offer, like "Offer 0% financing, about 190 monthly"."
- Intent: one concrete nudge proves this isn't generic advice.

**ClockDemo (optional).** Add one beat that uses the card's real text so the demo shows the clock adapting, not just filling, for example `{ min: 11, phase: "Buyer's engaged · extended to 20 min", nudge: "Go one level deeper on the need", label: "Pacing · Call dragging" }`. The card's real strings are "Buyer has time · extended to N min", "Buyer's engaged · extended to N min", "Buyer's short on time · wrap up by N min" and "Buyer's going quiet · aim to close by N min". TOTAL would need to follow the extension.

Situation chips: keep.

### Feature: "It gets better with every call."

Headline and opening paragraph: keep.

**Wins teach it new moves**
- Before: "Close with a move Q hasn't seen and it learns it, credits it to you, and every Q user has it within seconds."
- After: "Close with a move Q hasn't seen and it learns it, credits it to you, and every Q card has it about 3 seconds later."
- Intent: a measured number beats "within seconds", and it matches the stopwatch in the video.

**Losses teach it lessons.** Keep.

**It catches its own misfires**
- Before: "After each call, Q checks whether every nudge it showed helped or hurt. Moves that keep hurting lose rank, then retire."
- After: "After each call, Q judges every nudge it showed by what the buyer did next: helped, neutral or hurt, with a reason. Moves that keep hurting lose rank, then retire."
- Intent: says how it judges (evidence from the call, not a guess), which is what the failure-detection judges will probe.

**The best moves rise**
- Before: "Every move carries its record, so what's winning right now is what you see first."
- After: "Every move carries its win and loss record, so what's winning right now comes first, and new moves still get a fair try."
- Intent: exploration is what ML-minded judges look for. Without it, a ranked playbook just locks in the starter moves.

Closing line: keep. "Generic AI guesses what sounds persuasive. Q learns what actually closes, and catches itself when it's wrong."

### Stats (Numbers in page.tsx)

- "{count} moves in the playbook": keep.
- "36 situations Q recognizes": keep.
- **Speed**
  - Before: `<CountUp to={2} prefix="~" suffix=" s" />` and "from the buyer's words to your nudge"
  - After: `<CountUp to={1} prefix="~" suffix=" s" />` and "from the buyer's last word to your nudge"
  - Intent: "about a second" is what the live tests show (1.0 to 1.3 s), and it's better than the old "~2 s". The "~" keeps it from reading as a sub-second claim.
- **New fine line under the row:** "Starter moves are sample data for this demo. Moves learned on live calls are real."
  - Intent: the live count is mostly sample moves. The line already sits on /playbook and should travel with the number.
- **Optional fourth stat** (only if the grid goes to four columns): "~3 s" and "from a won call to every Q card".

### Works with

Keep. Optional fine line under the chips: "Q only needs the words of the call, so the playbook goes wherever you sell." Intent: tells the Scale judges Meet is the start, not the limit. Skip it if space is tight.

### FAQ

**"Does Q record my calls?"** Keep. It's honest and ends on telling the people on the call.

**"Can the buyer see Q?"**
- Before: Q "Can the buyer see Q?" A "No. The card lives in your own browser tab, not in the meeting. The only way they'd see it is if you share your whole screen, so share a window or tab instead."
- After: Q "Does Q join the meeting?" A "No. No bot joins and nothing is added to the call. The card lives in your own browser tab, so if you present, share a window or a tab instead of your whole screen."
- Intent: same facts, framed as unobtrusive rather than hidden. "Undetectable" is Cluely's pitch and the part critics go after. Q's story is consent and getting better.

**"Is it going to put words in my mouth?"** Keep.

**"How fast is it?"**
- Before: "About two seconds from the buyer's last word to the nudge on your screen. If the buyer is just making small talk, Q stays quiet and simply shows that it heard."
- After: "About a second from the buyer's last word to the nudge on your screen. Q starts thinking while the buyer is still talking, so the nudge is nearly ready when they stop. If it's just small talk, Q stays quiet and shows that it heard."
- Intent: the true number, plus listen-ahead, a real engineering choice worth naming.

**"Where do the moves come from?"**
- Before: "Q starts with a playbook of closing moves. Every time a seller wins with a move Q hasn't seen, it's added and credited to them, and every Q user has it within seconds. Moves that keep losing retire on their own."
- After: "Q starts with a playbook of closing moves written from established closing methods. That starter set, with its names and records, is sample data for this demo. Every time a seller wins with a move Q hasn't seen, it's added and credited to them, and every Q card has it within seconds. Moves that keep losing, or keep misfiring, retire on their own."
- Intent: the honesty line belongs where people ask the question; it also adds failure detection.

**New, after "Where do the moves come from?"**
- Q: "How does Q know a nudge was wrong?"
- A: "After each call, Q reads what happened right after every nudge it showed: did you use it, and did the buyer move toward yes or pull back? Each one gets helped, neutral or hurt, with a reason, in the call report. One bad call can't sink a move, but moves that keep hurting drop in rank and then retire."
- Intent: the failure-detection prize, answered in plain words.

**New, optional, first or last**
- Q: "How is Q different from other AI sales tools?"
- A: "Most call tools either analyze the call afterward or show cards someone wrote in advance. Q coaches during the call and learns from results: moves come from sellers' real wins, carry their record, and drop out when they stop working."
- Intent: answers the first question a judge has, without naming anyone.

**"Can I keep my company's moves private?"** Keep. (The live site still shows the older roadmap answer; deploy.)

### Install

Headline "Get Q for Chrome" and "For Google Meet, in your own browser tab.": keep.

- Before: "Unzip it, turn on Developer mode at chrome://extensions, and drag the q-extension folder onto the page."
- After: "Unzip it, turn on Developer mode at chrome://extensions, and drag the q-extension folder onto the page. Then click the Q icon, add your name, city and company, join a Meet and press C to turn on captions."
- Intent: judges score Functionality on whether they can get a nudge. "Press C" is the step people miss.
- Optional line under it: "No call handy? Try a buyer line at /test." Intent: a judge sees a real nudge in ten seconds.

### Footer

Keep "Q · SEP Hacks 2026 · Built by John Wang". Add the GitHub link once the repo is public.

### Playbook page (playbook/page.tsx)

**Subtitle**
- Before: "Every move credited to whoever taught it, with its record. It grows every time someone wins."
- After: "Every move is credited to whoever taught it and ranked by its record. It grows with every win and drops what keeps losing or misfiring."
- Intent: shows both directions of the learning, growing and pruning.

**Counts line**
- Before: "{active} active moves from {closers} closers · {learned} learned from live calls"
- After: "{active} active moves · {learned} learned from live calls"
- Intent: "closers" counts sample names, which reads like real people. The sample-data line comes right after, but the number lands first.

"What Q learned" and "What Q got wrong": keep.

### Call report (call/[id]/page.tsx)

Keep. "After every call, Q checks each nudge it showed against what happened next." is the right subtitle.

### Royalties page (royalties/page.tsx)

Hero chip ("Planned · payouts start after launch"), headline and subline: keep. The chip does the honesty work.

**"Everyone"**
- Before: "It joins the shared playbook with your name on it, so every Q user can use it. When it helps another seller close, you earn royalties."
- After: "It joins the shared playbook with your name on it, so every Q user can use it. When it helps another seller close, you'll earn royalties once payouts start."
- Intent: the present tense reads as live. Same idea for the chip "Public · earns royalties", here and in the popup ("Everyone · earns royalties"): "Public · royalties after launch" if it fits.

**"My company only".** Keep. Optional: add "This is Q's competitor firewall." Intent: gives investors the term from SCALE.md.

**How it works, step 02**
- Before: "When Q shows your public move on another seller's call and that call closes, the win is attributed to you."
- After: "When Q shows your public move on another seller's call and that call closes, the win is attributed to you. Wins on your own calls don't count."
- Intent: gaming the payout is the first question an investor asks.

**"Why it matters"**
- Append: "It's also why Q is hard to copy: anyone can call the same model, but nobody can copy the record of which moves actually closed."
- Intent: the moat, in front of the Scale judges.

Royalties FAQ: keep.

## 4. Video (docs/VIDEO.md)

Keep: the Belfort hook, the deadpan tone, the stopwatch payoff, real nudges only, the disclaimers.

### Changes

**0:19 Problem, voiceover**
- Before: "Everyone freezes. AI tools give you paragraphs to read mid-call."
- After: "Everyone freezes. AI tools hand you paragraphs mid-call, and they never learn what actually closed."
- Intent: names the pain the Continual Learning judges score and sets up the 1:10 payoff. Timing: about +1.5 s.

**0:19 Problem, on-screen (new, small, under THE PROBLEM)**
- After: `Average gap between turns in a conversation: 0.2 s` with a tiny `Stivers et al., PNAS 2009`
- Intent: turns "you can't read a paragraph mid-call" into a fact. Costs no voiceover time.

**0:44 Demo stopwatch.** Keep. Expect about a second now; use the real number from the footage.

**1:10 to 1:28 Q learns, plus failure detection (was 1:10 to 1:25)**
- 1:10 and 1:16: keep.
- 1:19, new picture: John's card after Won shows its review line ("N of M nudges helped", whatever the card actually says) and "See the call report". Click into the report: verdict chips next to each nudge.
  - Voiceover before: "Lose, and Q keeps the lesson. Moves that keep losing retire."
  - Voiceover after: "Then Q grades its own nudges by what the buyer did next. The ones that keep hurting drop, then retire."
  - On-screen: `FAILURE DETECTION · every nudge judged: helped, neutral or hurt`
- 1:24, /playbook: the new move with its New chip, the "What Q learned" feed (From a win, From a loss) and the "What Q got wrong" panel.
  - Voiceover: "Lose, and Q keeps the lesson."
  - On-screen: keep `250 moves · 36 situations · every call leaves a lesson` and the sample-data note.
- Intent: the $500 failure-detection prize has no screen time today.
- Honesty note: in the demo call John ignores the stall nudge, so the review will mark it neutral (an unused nudge always is). A real Hurt is more likely to come from the rehearsal that ends Lost. Show whatever the review actually says. If nothing hurt, show the verdicts you got and the panel's checked count. Never stage one.
- Timing: +3 s.

**1:28 to 1:37 How it works (was 1:25 to 1:37)**
- Voiceover before: "Q reads Meet's live captions. Claude reads the whole call, my company profile and the clock, picks the best move, and fits it to this buyer in about two seconds."
- Voiceover after: "Claude reads the call, my company profile and the clock, then picks a move from the playbook and fits it to this buyer." (Let it run over the card close-up, as now.)
- On-screen before: `THE AI · Claude Sonnet 5.5 · prompt caching · ~1.5 to 2 s per nudge`
- On-screen after: `THE AI · Claude Opus 5.5 · listens ahead · prompt caching · about a second per nudge`
- Intent: the diagram already shows the captions and the stopwatch already showed the speed, so the shorter line buys the failure-detection beat. The model and the numbers are now true. Timing: -3 s.

**1:37 Scale, card 1**
- Before: "This is closing intelligence, and it's cheap to run: about twelve cents a call, against a $39 to $99 seat."
- After: "This is closing intelligence, and it's cheap to run: about twelve cents a call on our standard model, against a $39 to $99 seat." If the Scale section runs long, drop "and it's cheap to run".
- On-screen before: `~$0.12 model cost per 15-min call (measured)`
- On-screen after: `~$0.12 model cost per 15-min call on our standard model (measured)`; the margins line stays as is.
- Intent: the number stays (John's call), but the demo runs a faster, pricier setup, so the attribution has to be exact. Four extra words, about a second.

**1:44 Scale, card 2**
- Before: "A hundred thousand seats is $100 million a year, and that's a billion-dollar company."
- After: "About a hundred thousand seats is $100 million a year: a billion-dollar company at ten times revenue."
- Intent: the projection's assumption lives in the voiceover, not only in the fine print.

**1:49 Scale, card 3 (was room tone)**
- After, voiceover: "Anyone can call the same model. Nobody can copy which moves actually closed."
- On-screen: keep `Royalties · Give-to-get · Competitor firewall · Private team playbooks` and the no-users line; drop the `Start: ...` line if it's crowded.
- Intent: the moat in one breath. Timing: card 3 runs 1:49 to 1:53 (+1 s).

**1:53 Payoff (was 1:52).** Hold black for 2 s instead of 3. End card and stinger unchanged.

**Demo trim.** Cut the "J. B." exchange (already optional) and tighten the jump cuts by about 1 s to pay for the problem line.

### New timing

| Time | Section | Change |
|---|---|---|
| 0:00-0:19 | Cold open: Take 1 | None |
| 0:19-0:30 | The problem | +1.5 s voiceover, on-screen stat |
| 0:30-0:41 | Title | Starts 1 s later, same content |
| 0:41-1:10 | Take 2: live demo | -1 s (cut "J. B.") |
| 1:10-1:28 | Q learns + failure detection | +3 s, call report and "What Q got wrong" |
| 1:28-1:37 | How it works + design | -3 s, shorter voiceover |
| 1:37-1:53 | Path to $1B | +1 s, moat line on card 3 |
| 1:53-2:00 | Payoff and end card | -1 s of black |

### Requirements checklist additions

| Requirement | Where |
|---|---|
| Continual Failure Detection | 1:19 (call report verdicts) and 1:24 ("What Q got wrong") |
| Devpost: Functionality | 0:41 to 1:28 (real call, live nudges, learning, review) |
| Devpost: Continual Learning | 1:10 to 1:28 |
| Devpost: Pitch | 0:00 to 0:41 and the 1:53 payoff |
| Devpost: "demo is legible" | Burned-in captions, push in on the card for every nudge |

## 5. Other docs to bring in line (not edited here)

- **DEVPOST.md:** "Nudges land in about 1.5 to 2 seconds" and "1.4 to 2.2 seconds server time across 14 runs" should become "about a second". The brain row, the "Generic nudges" challenge and Built with say Sonnet 5.5 for live nudges; add Opus 5.5 fast mode (Sonnet stays for learning, reviews and fallback). The "$0.12 model cost per 15-minute call" lines need "on our standard model". Tracks has no Continual Failure Detection section; add one (section 2 above has the text). Delete "Agents (if entering)".
- **SCALE.md:** keep the numbers; label the cost rows "on our standard model (Sonnet 5.5)". "Generic AI (ChatGPT, Cluely) guesses what *sounds* persuasive" reads better as "Generic AI assistants guess what sounds persuasive", given the OpenAI judge and a16z's stake in Cluely. The latency risk row can now say about a second in our tests.
- **VIDEO.md landing page map:** the speed stat is ~1 s, not ~2 s.

## Sources

- [1a] Devpost, SEPHacks 2026 overview (viewed Oct 17, 2026, about 2:45 AM PT): https://sephacks-2026.devpost.com/
- [1b] Devpost, SEPHacks 2026 rules: https://sephacks-2026.devpost.com/rules
- [1c] Devpost, SEPHacks 2026 dates: https://sephacks-2026.devpost.com/details/dates
- [1d] Devpost hackathon listing, "time_left_to_submission": "about 8 hours left" at 2:41 AM PDT, organizer Sigma Eta Pi: https://devpost.com/api/hackathons?search=sephacks
- [2] Gong, "Gong redefines AI agents to deliver real revenue impact" (April 2025): https://www.gong.io/press/gong-redefines-ai-agents-to-deliver-real-revenue-impact
- [3] Gong, Conversation intelligence: https://www.gong.io/conversation-intelligence/
- [4] TechCrunch, "Revenue prediction startup Gong surpasses $300M in annualized revenue" (Mar 5, 2025): https://techcrunch.com/2025/03/05/revenue-prediction-startup-gong-surpasses-300m-arr-indicating-potential-ipo-path
- [5] ZoomInfo, Chorus: https://www.zoominfo.com/products/chorus
- [6] Cluely homepage (viewed Oct 17, 2026): https://cluely.com
- [7] TechCrunch, "Cluely, a startup that helps 'cheat on everything,' raises $15M from a16z" (Jun 20, 2025): https://techcrunch.com/2025/06/20/cluely-a-startup-that-helps-cheat-on-everything-raises-15m-from-a16z
- [8] Balto homepage: https://www.balto.ai/
- [9] Outreach, Kaia: https://www.outreach.ai/product/kaia
- [10] Trellus, Real-time coaching: https://www.trellus.ai/realtime-coaching
- [11] Cresta, Agent Assist: https://cresta.com/agent-assist
- [12] Stivers et al., "Universals and cultural variation in turn-taking in conversation", PNAS 106(26), 2009: https://pmc.ncbi.nlm.nih.gov/articles/PMC2705608/
- [13] The Bridge Group, 2025 SDR Models & Metrics Report (Feb 6, 2025): https://www.bridgegroupinc.com/research/2025-sdr-models-metrics-report-the-bridge-group
- [14] SiliconANGLE, "Observe.AI debuts real-time AI conversational prompts for call center agents" (Jan 31, 2023): https://siliconangle.com/2023/01/31/observe-ai-debuts-real-time-ai-conversational-prompts-call-center-agents/
- [15] VentureBeat, "Lemma is building the layer that watches what AI agents actually do" (Oct 8, 2026): https://venturebeat.com/business/lemma-is-building-the-layer-that-watches-what-ai-agents-actually-do
- [16] Tech Week, "a16z's Tech Week": https://www.tech-week.com/
- [18] Revenue.io help center, Moments overview (admin "Create a Moments Template", supervisor "Create and Manage Notifications for Your Team"): https://support.revenue.io/getting-started/revenueio-platform/moments-overview/
