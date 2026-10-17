# Q: the path to $1B

**Every closer needs a Q.** Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. Every win teaches it something new. The category is **closing intelligence**: the moves that are winning right now, getting sharper with every deal. Every nudge comes from a playbook move, credited to whoever taught it and ranked by how often it wins.

> **Where we are, plainly:** Q is a hackathon build from SEP Hacks 2026. It runs on Google Meet. It has no users, no revenue and no traction yet. The starter playbook (its moves, names and records) is sample data for this demo; moves learned on live calls are real. Every number below is either measured in our build, cited in [Sources](#sources), or labeled as a projection.

## Say it in 20 seconds

> Every closer needs a Q. Q listens to your sales call and shows you, at a glance, what the best salespeople would do next. When anyone wins with a new move, every Q user gets it in seconds, so Q gets sharper with every deal. Each call costs about twelve cents to run on our standard model, against a $39 to $99 seat. About a hundred thousand seats is $100 million a year: a billion-dollar company at ten times revenue.

## Headline numbers

| | Number | Basis |
|---|---|---|
| Model cost per nudge | ~$0.0017 | Measured in our build, on our standard model |
| Model cost per 15-minute call | ~$0.12 | Measured in our build, on our standard model |
| Model cost per rep per month | ~$13.20 | Standard model; assumes 5 calls a day, 22 workdays |
| Margin after model cost | 66% Pro, 87% Team | ($39 or $99 minus $13.20) / price |
| US sellers in the occupations Q targets | ~4.04M | BLS, May 2025 [1] |
| Paid seats for $100M ARR | ~103,000 | Projection, $81 blended seat price |
| Paid seats for $1B ARR | ~1.03M | Projection, same blend |

## 1. The wedge: who feels it first

Q runs on Google Meet today, so the first customers must already sell on Meet. Our two starting segments (hypotheses we'd test with the first 50 users):

1. **Startup and SMB SaaS SDRs and AEs.** Meet comes with Google Workspace, so many startups already sell on it. They hear the same few objections (price, timing, "send me something") many times a week, so the playbook gets dense fast. A $39 to $99 seat is a manager's card swipe, not a procurement cycle.
2. **High-ticket remote closers** (coaching, course and agency sales). On video all day and paid on commission, so the ROI test is simple: did Q help win one more deal?

**Next, once phone dialers ship:** insurance (479,100 US agents), financial services sales (489,570) and real estate (239,470 payroll agents and brokers; BLS payroll counts leave out the self-employed) [1], plus home services. Much of that selling happens by phone or in person, so it follows dialer support.

**Not first:** large enterprises. Security reviews and long cycles come after the compliance features in section 5.

## 2. The network effect and data moat

**How it compounds.** Every call produces labeled data: which move was shown, for which objection and buyer type, and whether the call was won.

- **Outcome ranking (built).** Moves are scored by Bayesian win rate, (wins + 1) / (uses + 2), so new moves start near 50% and earn their place. 15% of nudges try a newer move so fresh ideas get a fair shot (skipped in sensitive moments). Moves that reach 8 uses with under a 25% win rate retire.
- **Failure detection (built).** After every call, Q judges each nudge it showed from what happened next: helped, neutral or hurt, with a reason. Verdicts adjust each move's ranking, and moves that keep hurting retire. So every call labels not just the outcome but every piece of advice in it.
- **Learning from wins (built).** On a won call, Q finds the seller's improvised line right before the buyer moved toward yes, turns it into a short, reusable move, credits the seller, and every other Q user can get it within seconds.
- **The loop.** More sellers, more calls, more confident win rates per objection and buyer type, better nudges, more wins, more sellers.
- **Projection:** at 10,000 seats and 5 calls a day, Q would log about 1.1 million outcome-labeled calls a month.

**Why a competitor can't copy it.**

- Anyone can copy the code and call the same model. Nobody can copy which moves actually closed: the win, loss and review history of every move. A new entrant starts at zero and needs real calls, not engineering, to learn what wins.
- Generic AI assistants guess what *sounds* persuasive. Q learns what actually closes, and catches itself when it's wrong.
- Credit and royalties give top closers a reason to contribute to Q, so the best supply stays here.
- The competitor firewall (built) lets companies contribute without leaking their moves to rivals: a seller can keep the moves Q learns from them private to their company.

## 3. Pricing and unit economics

Pricing: **$39/month Pro** (one seller, shared playbook), **$99/month Team seat** (adds a private team playbook and manager tools).

| Per seat, per month | Pro | Team |
|---|---|---|
| Price | $39.00 | $99.00 |
| Model cost on our standard model (5 calls/day x 22 days x $0.12) | $13.20 | $13.20 |
| **Margin after model cost** | **66%** | **87%** |
| Heavy user, 10 calls/day ($26.40) | 32% | 73% |

- At a 70% Team / 30% Pro mix (assumption), the blended price is $81 and the margin after model cost is about 84%.
- Not yet counted: hosting, database, payment fees and support. We have only measured model cost.
- The model cost above is our standard model (Claude Sonnet 5.5). The live demo runs live nudges on Claude Opus 5.5 in fast mode, for speed.
- Levers, not yet tested: a fair-use cap on Pro for heavy users, and a smaller model for the fast path.

## 4. The marketplace: royalties for moves

- **Credit (built).** Every nudge names who taught the move: "Learned from John · Los Angeles."
- **Share or keep private (built).** In the popup, a seller picks where moves Q learns from them go: Everyone (credited, and set to earn royalties) or My company only (private to their team, no royalties).
- **Royalties (proposal).** When your move wins on someone else's call, you earn account credit or a payout. Example design: a royalty pool of 10% of subscription revenue, split by attributed wins. That would take the blended margin from about 84% to about 74%.
- **Give-to-get (proposal).** Contribute moves to access the network.
- **Anti-gaming (proposal).** Pay only on other sellers' wins, never your own, and verify wins against CRM closed-won once integrations exist.
- **Why it matters.** Top closers become suppliers. The better your moves, the more you earn, so the best closers have a reason to teach the network instead of keeping their lines to themselves.

## 5. Expansion (roadmap, not built)

- **Platforms:** Zoom, Microsoft Teams, then phone dialers, which open insurance, financial services, real estate and home services.
- **Teams:** manager tools on top of the company-only playbook, which is built today.
- **Manager analytics:** which moves win for which reps, objection trends, ramp tracking.
- **CRM integrations** (Salesforce, HubSpot): mark calls won from closed-won deals instead of a Won/Lost button. Cleaner data and a stickier product.
- **Enterprise compliance:** consent controls, retention settings, SSO, audit logs, SOC 2. A higher price per seat.

## 6. Path to $1B (projection)

**ARR = paid seats x blended monthly price x 12**

Assumptions (all projections, none achieved):

- **Mix:** 70% Team ($99), 30% Pro ($39), so $81 per seat per month, $972 per year.
- **Valuation multiple:** 10x ARR. For reference, TechCrunch estimated Gong at roughly 24x ARR in 2025, using its 2021 valuation [2]. At 5x, double the seats.
- **Seats:** paid only. Free give-to-get users aren't counted.

| Milestone | Paid seats | ARR | Share of ~4.04M US target sellers [1] |
|---|---|---|---|
| First proof | 1,000 | ~$1M | 0.02% |
| Real business | 10,000 | ~$9.7M | 0.25% |
| **$1B valuation at 10x** | **~103,000** | **~$100M** | **~2.5%** |
| $1B valuation at 5x | ~206,000 | ~$200M | ~5.1% |
| $1B ARR | ~1.03M | ~$1B | ~25%, so it needs markets outside the US, phone and enterprise pricing |

**Proof that buyers pay for call AI:**

- **Gong:** valued at $7.25B in its 2021 Series E [3]; passed $300M ARR with 4,500 corporate customers in 2025 [2]. Q's $100M milestone is a third of that.
- **Chorus.ai:** acquired by ZoomInfo for $575M in 2021 [4].
- **Cluely:** raised a $15M Series A led by a16z in 2025 [5]; lists Pro at $19.99/month and Pro + Undetectability at $149.99/month [6].

## 7. Key risks and how Q handles them

| Risk | Today (built) | Next (planned) |
|---|---|---|
| **Wrong nudge** | A short nudge is easy to ignore and the seller stays in control. After every call Q judges each nudge it showed (helped, neutral or hurt); moves that keep hurting or losing lose rank and retire. Every nudge shows its source. | CRM-verified outcomes; playbooks per vertical; test nudges against no-nudge calls to prove lift. |
| **Noisy credit** (a won call credits every move shown) | Bayesian scoring means a move needs many uses before it's trusted; new moves come from the line right before the buyer turned. | Verify wins in the CRM; weight moves by when they landed. |
| **Latency** | Listen-ahead: Q starts thinking while the buyer is still talking, and the playbook is cached. Nudges land about a second after the buyer stops in our tests. Not yet benchmarked at scale. | A smaller tuned model on the fast path. |
| **Privacy and consent** | Q reads Meet's captions in the seller's browser and captures no audio. It does save the transcript when the seller ends a call. California requires every party's consent to record a confidential conversation [7]. | Treat Q as recording: a clear notice to the buyer, keep only extracted moves by default, redact personal data, retention controls, enterprise admin settings. |
| **Dependence on Meet's captions** | Detects when captions are off and asks the seller to turn them on. Typed fallback (Shift+B) if captions can't be read. | Google's real-time Meet Media API is in Developer Preview and closed to new signups [8], and the GA Meet REST API gives transcripts after the meeting [9]. So we'd add our own audio transcription, Zoom, Teams and dialers. The playbook is the moat, and it works on any platform. |
| **Cold start** | A starter playbook of 250 moves (sample data for this demo: moves, names and records). | Go deep in one segment so data gets dense fast; give-to-get. |

## Sources

1. U.S. Bureau of Labor Statistics, *Occupational Employment and Wages, May 2025*, Table 1 (released May 15, 2026). Sales and related occupations: 13,424,300. Target occupations summed: sales reps of services 1,256,010; wholesale and manufacturing reps 1,522,990; insurance sales agents 479,100; securities and financial services sales agents 489,570; real estate brokers and agents 239,470; sales engineers 51,790. https://www.bls.gov/news.release/ocwage.htm
2. TechCrunch, "Revenue prediction startup Gong surpasses $300M in annualized revenue, indicating potential IPO path" (March 5, 2025). https://techcrunch.com/2025/03/05/revenue-prediction-startup-gong-surpasses-300m-arr-indicating-potential-ipo-path
3. TechCrunch, "Gong going gangbusters, grabs $250M Series E on $7.25B valuation" (June 3, 2021). https://techcrunch.com/2021/06/03/gong-going-gangbusters-grabs-250m-series-e-on-7-25b-valuation/
4. SiliconANGLE, "ZoomInfo acquires Chorus.ai for $575M to expand its sales intelligence platform" (July 13, 2021). https://siliconangle.com/2021/07/13/zoominfo-acquires-chorus-ai-575m-expand-sales-intelligence-platform/
5. TechCrunch, "Cluely, a startup that helps 'cheat on everything,' raises $15M from a16z" (June 20, 2025). https://techcrunch.com/2025/06/20/cluely-a-startup-that-helps-cheat-on-everything-raises-15m-from-a16z
6. Cluely pricing page (viewed October 17, 2026). https://cluely.com/pricing
7. Reporters Committee for Freedom of the Press, *Reporter's Recording Guide: California* (updated August 2021). https://www.rcfp.org/reporters-recording-guide/california/
8. Google for Developers, *Meet Media API overview* (viewed October 17, 2026). https://developers.google.com/workspace/meet/media-api/guides/overview
9. Google Workspace Updates, "Google Meet API now generally available" (February 21, 2024). https://workspaceupdates.googleblog.com/2024/02/google-meet-api-now-generally-available.html

Measured costs come from our build on our standard model, Claude Sonnet 5.5, on Next.js (Vercel) with Supabase. The live demo runs live nudges on Claude Opus 5.5 in fast mode for speed. Analyst estimates of the conversation intelligence market disagree widely, so we size the market bottom-up from BLS headcounts instead.
