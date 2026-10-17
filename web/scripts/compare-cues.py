"""Runs the same sales moments through each Claude setting and prints the nudges side by side.
Development only. Usage: python3 -I scripts/compare-cues.py [--fresh | --new | --time | --all] [-v] [--judge] [--save F | --load F] [variant ...]
--fresh, --new and --time are held-out sets: none of their lines appear as examples in the prompt.
--judge grades every nudge 1 to 5 with a strong model (web/app/api/dev/judge) and prints the worst ones.
--save writes the results to a JSON file; --load reads them back instead of calling Q (to judge old runs).
Speed: --only A:B runs a slice of the chosen set, --repeat N runs it N times (latency stats use every run; the
table and the judge use the first), --url BASE targets another backend (a Vercel preview: run under
`vercel env run --` so VERCEL_OIDC_TOKEN gets past deployment protection). Latency is reported as median and p90,
with the server's own breakdown when the backend sends a Server-Timing header."""
import json, math, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

JUDGE_URL = "http://localhost:3000/api/dev/judge"
PEN = "Selling a premium pen, 40 dollars, lifetime warranty."
HVAC = "Cool Breeze HVAC, Phoenix. Carrier heat pumps and AC, 8,000 to 14,000 installed. 0% financing for 60 months, 10-year parts and labor warranty, price match on any written quote."
COURSE = "FreelanceLaunch: 12-week live coaching program to land your first freelance design client. 2,000 dollars or 4 payments of 525. 30-day money-back guarantee."
SAAS = "Shiftly: scheduling software for restaurants. 199 a month per location. 14-day free trial, setup done for you."
GYM = "IronHouse Gym: 89 a month, includes 2 personal training sessions a month. First week free. No contract, cancel anytime."
SOLAR = "SunPeak Solar: rooftop solar, about 18,000 before the 30% federal tax credit. 25-year warranty. Lease option with 0 down."
CRM = "PipeDesk: CRM for small marketing agencies. 49 per seat per month, 10% off with an annual plan. Free migration from spreadsheets or HubSpot. SOC 2 Type II."
PAYROLL = "Brightline Payroll: payroll and HR for small businesses. 40 a month plus 6 per employee. Free setup, cancel anytime."
PIANO = "Keys & Co: piano lessons for adult beginners. Weekly 45-minute lessons, 160 a month. First lesson free. Online or in our studio."
MEALS = "GreenPlate: healthy meal kits delivered weekly, 3 dinners for 2 people at 72 a week. Skip or pause any week. Dietitian-designed menus, including low-sodium options."
HOME = "SafeNest: home security with cameras and door sensors. 25 a month for monitoring, free installation, 30-day returns."
CYBER = "Vaultline: endpoint security for mid-size companies. About 40,000 a year for 500 devices. 30-day pilot available."
BOOTS = "Northfield Outdoor (store): waterproof hiking boots, 189. Free fitting by staff, free returns within 60 days."
ROOF = "BrightRoof: roof repair and replacement. Free inspection with photos, 10-year workmanship warranty, financing from 99 a month."
COACH = "LiftOff: 6-month one-on-one business coaching for new founders. 6,000 upfront or 1,100 a month. Two calls a week. 30-day refund."

S, B = "You", "Buyer"


# A case: the company profile, the call so far (in order, last line last), call stats, the moments a good
# coach would call it (shown next to Claude's answer so mislabels stand out), the nudges the card already
# showed on this call (oldest first), and an optional brief.
def case(profile, turns, stats=None, expect=(), recent=(), brief=""):
    return {"profile": profile, "turns": turns, "stats": stats or {"elapsed_s": 300}, "expect": list(expect), "recent": list(recent), "brief": brief}


# The original one-pitch, one-reply moments.
def simple(profile, seller, buyer, expect=()):
    return case(profile, seller + [(B, buyer)], expect=expect)


CASES = [
    simple(PEN, [(S, "I want to show you this pen.")], "I don't need a pen.", ["no_need"]),
    simple(PEN, [(S, "I want to show you this pen.")], "Why would I want this?", ["no_need"]),
    simple(PEN, [(S, "It's 40 dollars and comes with a lifetime warranty.")], "Forty bucks for a pen? Come on.", ["price"]),
    simple(HVAC, [(S, "Your AC is 18 years old. I'd recommend a heat pump, 11,500 installed.")], "We'll just wait until it breaks.", ["timing"]),
    simple(HVAC, [(S, "Your AC is 18 years old. I'd recommend a heat pump, 11,500 installed.")], "Another company quoted me 2,000 less.", ["competitor", "shopping", "price"]),
    simple(COURSE, [(S, "The program is 12 weeks of live coaching to land your first client.")], "I can probably learn this free on YouTube.", ["competitor", "no_need"]),
    simple(COURSE, [(S, "It's 2,000 dollars.")], "I need to talk to my parents first.", ["partner", "authority"]),
    simple(SAAS, [(S, "Shiftly builds your restaurant's schedule in minutes.")], "We just use a spreadsheet, it's fine.", ["competitor", "no_need"]),
    simple(SAAS, [(S, "It's 199 a month per location.")], "That's a lot for a small place like ours.", ["price"]),
]

# Fresh moments that don't match the instructions' examples, for a fair check.
FRESH = [
    simple(GYM, [(S, "Membership is 89 a month and includes two PT sessions.")], "I've signed up for gyms before and never go.", ["fear", "burned"]),
    simple(GYM, [(S, "Membership is 89 a month and includes two PT sessions.")], "Planet Fitness is like ten bucks.", ["competitor", "price"]),
    simple(SOLAR, [(S, "A system for your roof would be about 18,000 before the tax credit.")], "I might be moving in a few years.", ["timing", "no_need"]),
    simple(SOLAR, [(S, "A system for your roof would be about 18,000 before the tax credit.")], "Oh nice, so how does the lease work?", ["buying_signal"]),
    simple(COURSE, [(S, "Students usually land their first client by week 8.")], "How do I know that'll happen for me?", ["trust", "fear"]),
    simple(SAAS, [(S, "Shiftly builds your restaurant's schedule in minutes.")], "My manager does all the scheduling, not me.", ["authority"]),
]

# A bigger held-out set: normal and niche moments, multi-turn calls, per-case stats, many products.
NEW = [
    # John's real gym call: four buyer lines in a row. The heart is the last one.
    case(GYM, [(B, "I hate going to the gym."), (B, "I dunno, I'm a gamer."), (B, "I never went"), (B, "I felt judged by others because I'm fat")], {"elapsed_s": 180}, ["judged"]),
    case(GYM, [(S, "Membership is 89 a month and includes two PT sessions."), (B, "I got laid off last month, so money's really tight right now.")], expect=["hardship"]),
    case(MEALS, [(S, "GreenPlate sends three healthy dinners a week, ready in 20 minutes."), (B, "My wife just started chemo, so I'm suddenly doing all the cooking, and I can barely boil pasta.")], expect=["health_loss"]),
    case(HOME, [(S, "SafeNest covers your doors, windows and cameras with 24/7 monitoring."), (B, "My husband passed in March. It's just me in the house now.")], expect=["health_loss"]),
    case(PAYROLL, [(S, "Hi, this is Sam from Brightline Payroll, do you have a minute?"), (B, "Seriously? This is the third call this week. You people are relentless. Why should I give you a single second?")], {"elapsed_s": 20}, ["hostile"]),
    case(CRM, [(S, "PipeDesk is a CRM built for agencies like yours, so your whole pipeline lives in one place."), (B, "Look, just send me something by email and I'll take a look.")], {"elapsed_s": 120}, ["send_info"]),
    case(CYBER, [(S, "Vaultline protects every laptop and server from one dashboard."), (B, "Does it support our Linux build servers running on ARM?"), (S, "Uh, I think so? Let me, um..."), (B, "You think so? I need a real answer here.")], {"elapsed_s": 600}, ["tough_question", "trust"]),
    case(PAYROLL, [
        (B, "Sure, go ahead, tell me about it."),
        (S, "So Brightline started in 2015 and we now run payroll for over 12,000 businesses across all 50 states, and our founders came from ADP and Intuit, so they really know the space."),
        (S, "We handle federal, state and local taxes, we do direct deposit, we do contractor payments, we file W-2s and 1099s, and we also have an HR module with onboarding, PTO tracking and document storage."),
        (S, "And on top of that there's time tracking, benefits administration, workers' comp, and an app your employees can use to see their pay stubs, plus we integrate with QuickBooks, Xero and about forty other tools."),
    ], {"elapsed_s": 420, "seller_talk_share": 0.88, "seller_streak_s": 150}, ["pacing"]),
    case(CRM, [(S, "For your eight seats that comes to 392 a month."), (B, "If you can knock 25% off, I'll sign this week.")], expect=["discount"]),
    case(CRM, [(S, "PipeDesk keeps every client, deal and follow-up in one place."), (B, "We're locked into HubSpot until next August, so there's not much I can do.")], expect=["locked_in"]),
    case(SOLAR, [(S, "Your roof gets great sun. A system would be about 18,000 before the tax credit."), (B, "We're getting quotes from two other installers this week.")], expect=["shopping"]),
    case(PIANO, [(S, "Lessons are 160 a month, and the first one is free."), (B, "I'd have to check with my wife. She keeps a pretty tight budget.")], expect=["partner"]),
    case(CRM, [(S, "Agencies usually save about five hours a week on follow-ups."), (B, "Can I talk to a couple of agencies that actually use it?")], expect=["proof"]),
    case(CYBER, [(S, "The pilot is free for 30 days, then about 40,000 a year."), (B, "Anything over 25k goes through procurement and legal. That's usually a two-month slog.")], expect=["process"]),
    case(SAAS, [(S, "Shiftly builds your schedule in minutes and texts it to your staff."), (B, "We run a hospital cafeteria. Does this store any employee health info? Our compliance team is brutal.")], expect=["compliance"]),
    case(CRM, [(S, "You can bring in leads from anywhere."), (B, "How does your API handle rate limits, and can we push leads in through webhooks from our own forms?")], expect=["technical"]),
    case(SAAS, [(S, "Shiftly builds your schedule in minutes and texts it to your staff."), (B, "Honestly, it's just me and my brother running one food truck. We don't really have shifts.")], expect=["not_fit"]),
    case(SOLAR, [(S, "We'd need a deposit to lock in your install date."), (B, "The last solar guys took a 2,000 dollar deposit and vanished. So forgive me if I'm wary.")], expect=["burned"]),
    case(MEALS, [(S, "You'd pick three dinners each week from our menu."), (B, "I'm sorry, I have three kids and a new job and I'm drowning. I can't add one more thing to figure out.")], expect=["overwhelmed"]),
    case(PIANO, [(S, "Most of our students are complete beginners."), (B, "What if I'm just not musical? I'm 52, I'd feel silly.")], expect=["fear", "judged"]),
    case(GYM, [(S, "First week's free, then 89 a month, cancel anytime."), (B, "Okay, I'm in. What do I need to bring tomorrow?")], expect=["ready"]),
    case(SOLAR, [
        (S, "With the lease there's nothing down."),
        (B, "My husband thinks solar is a scam, honestly."),
        (S, "Plenty of people feel that way until they see the first bill."),
        (B, "Yeah, okay, sure, whatever. Let's just sign."),
    ], {"elapsed_s": 900}, ["early_yes"]),
    case(CRM, [
        (S, "So that's the pipeline view, the reminders and the client portal."),
        (B, "Yeah, it's nice."),
        (S, "So what do you think?"),
        (B, "This was really helpful. I'll circle back with you at some point."),
    ], {"elapsed_s": 1800}, ["ghost_risk", "stall"]),
    case(PAYROLL, [
        (S, "How many people are on payroll right now?"),
        (B, "Mm-hm, like twelve."),
        (S, "Got it. And how do you run payroll today?"),
        (B, "Sure."),
        (S, "Would it help to have taxes filed for you automatically?"),
        (B, "Yeah."),
    ], {"elapsed_s": 480, "seller_talk_share": 0.8}, ["disengaged"]),
    case(SOLAR, [(S, "With net metering and the ITC you'd hit payback around year seven, assuming a 4% escalator."), (B, "Sorry, you lost me. What's net metering?")], expect=["confused"]),
    case(PIANO, [
        (S, "So you'd mostly want to play for fun?"),
        (B, "Oh, did I mention we just got back from Italy? The food in Bologna, unreal."),
        (S, "That sounds amazing!"),
        (B, "And the wine, my god. We toured three vineyards and my brother-in-law got so drunk he fell asleep on the bus."),
    ], {"elapsed_s": 900}, ["tangent"]),
    case(CYBER, [
        (B, "Okay, honestly, this sounds like exactly what we need."),
        (S, "Great! And let me also show you the reporting module, the threat map and the custom alerts."),
        (B, "Sure."),
        (S, "And then here's the admin console, where you can set roles and policies for every team."),
        (B, "Yeah, that's cool too."),
    ], {"elapsed_s": 2400, "seller_talk_share": 0.72}, ["dragging"]),
    case(SOLAR, [(S, "The panels come with a 25-year warranty."), (B, "Could you get it installed before summer?")], expect=["buying_signal"]),
    case(CRM, [(S, "For your eight seats that's 392 a month."), (B, "That's way more than we budgeted for software this year.")], expect=["price"]),
    case(PAYROLL, [(S, "Brightline runs payroll and files your taxes automatically."), (B, "We already use Gusto and it's fine.")], expect=["competitor"]),
    case(MEALS, [(S, "Every meal is designed by a dietitian."), (B, "Meal kits always look better in the ads than in the box.")], expect=["trust", "burned"]),
    case(CYBER, [(S, "We could start the pilot next week."), (B, "Reach back out after Q1. We're in the middle of an audit.")], expect=["timing"]),
    case(GYM, [(S, "Hey, thanks for coming in!"), (B, "Yeah of course. Parking was a nightmare though, haha.")], {"elapsed_s": 30}, ["none"]),
    case(PIANO, [(S, "So, want to book your free first lesson?"), (B, "Let me sleep on it.")], expect=["stall"]),
    case(MEALS, [(S, "GreenPlate takes dinner planning off your plate."), (B, "We like cooking ourselves. It's kind of our thing.")], expect=["no_need", "competitor"]),
    case(PAYROLL, [(S, "Setup is free and takes about a day."), (B, "Our office manager handles all of that. I just sign the checks.")], expect=["authority"]),
    # A pacing check sent on a timer, on a healthy call: nothing to coach.
    case(PIANO, [(S, "Do you have a piano at home?"), (B, "Just a little keyboard, but it works."), (S, "Perfect. What's your schedule like on weekday evenings?")], {"elapsed_s": 360, "seller_talk_share": 0.45, "seller_streak_s": 8}, ["none"]),
    # Follow-ups: the seller already acted on a nudge, so the next one should build on the answer.
    case(GYM, [(B, "I've tried gyms before, never stuck with it."), (S, "Totally fair. What made you stop going last time?"), (B, "Honestly I never saw results, so I got bored and quit after a month.")], {"elapsed_s": 240}, ["fear", "burned", "pain"], recent=["Ask what stopped them before"]),
    case(CRM, [(B, "Just send me something by email."), (S, "Happy to. So I send the right thing, what would you look for first?"), (B, "Pricing, mostly. And whether it works with Gmail.")], {"elapsed_s": 150}, ["send_info", "buying_signal", "technical"], recent=["Ask what they'd look for"]),
    case(SOLAR, [(B, "The last solar guys took a deposit and vanished."), (S, "That's awful. With us you could do the lease, nothing down."), (B, "Leases are how they get you. I'd rather own it outright.")], {"elapsed_s": 700}, ["trust", "burned", "price"], recent=["Offer the 0-down lease instead"]),
    case(PAYROLL, [(B, "Seriously? Third call this week. You people are relentless."), (S, "You're right, that's too many calls, and I'm sorry about that."), (B, "Fine. You've got one minute.")], {"elapsed_s": 40}, ["opening", "hostile"], recent=["Agree three calls is too many"]),
    case(PIANO, [(B, "What if I'm just not musical? I'm 52."), (S, "Honestly, most of our students are adults starting from zero."), (B, "Okay, but I really can't read music at all. Like, nothing.")], {"elapsed_s": 420}, ["fear", "judged"], recent=["Normalize the feeling"]),
    case(CYBER, [(B, "Okay, this sounds like what we need."), (S, "So, want to kick off the 30-day pilot?"), (B, "Yeah, let's do the pilot.")], {"elapsed_s": 1900}, ["ready"], recent=["Stop demoing, ask to start pilot"]),
    case(SAAS, [(S, "How do you build the schedule today?"), (B, "Honestly, Sunday nights I spend like five hours on it, and someone always calls out anyway.")], {"elapsed_s": 260}, ["pain"]),
    case(SAAS, [(B, "Sunday nights I spend like five hours on the schedule."), (S, "Five hours, wow. What does that cost you?"), (B, "I miss dinner with my kids every Sunday. My wife's pretty over it.")], {"elapsed_s": 380}, ["pain"], recent=["Ask what those Sundays cost"]),
    case(CRM, [(S, "Your renewal's coming up next month, so I wanted to check in."), (B, "We're thinking of dropping to five seats. Budget's tight this year.")], {"elapsed_s": 200}, ["price"], brief="Existing customer since last year, 8 seats, renewal in 30 days."),
    case(BOOTS, [(S, "These are our best-selling waterproof boots."), (B, "They're nice, but I'll probably just order something cheaper online.")], {"elapsed_s": 120}, ["price", "competitor", "shopping"]),
    case(ROOF, [(S, "I took photos up there. You've got three cracked shingles and some soft decking near the chimney."), (B, "Can't you just patch it? I don't want to replace the whole roof.")], {"elapsed_s": 900}, ["price", "no_need"]),
    case(COACH, [(S, "So the program is 6,000, or 1,100 a month."), (B, "That's a lot. I'd need to see results before I put in that kind of money.")], {"elapsed_s": 1500}, ["trust", "price", "fear"]),
    case(CYBER, [(S, "Who else would weigh in on a decision like this?"), (B, "Our CISO, but she's slammed and honestly hates vendor calls.")], {"elapsed_s": 900}, ["authority"]),
    case(PIANO, [
        (B, "Let me think about it."),
        (S, "Totally. What's the part you'd be thinking about?"),
        (B, "I don't know. It's just a big decision."),
        (S, "Is it the price?"),
        (B, "Not really. I just want to sleep on it."),
    ], {"elapsed_s": 1300}, ["stall"], recent=["Ask what's holding them back", "Name the worry for them"]),
    case(CYBER, [(S, "Thanks for hopping on!"), (B, "Sure. I've only got about 15 minutes, so let's keep it quick.")], {"elapsed_s": 25}, ["opening"]),
]

# The live demo (docs/DEMO_SCRIPT.md): John's Pen Co., a 10-minute call, the nudges the card showed before each beat.
PENCO = "John's Pen Co. sells one product: The Signer, a solid brass refillable ballpoint made for signing things that matter. Price: $40. Teams of 10 or more: $30 each. This week only: free engraving (initials or a name). Lifetime free refills. 30-day money-back guarantee, no questions asked. Ships in 2 business days; next-day delivery in Los Angeles. Ideal customer: people who sign contracts, leases, offers and checks. Never trash other brands. Never pressure."
JORDAN = "Buyer: Jordan, runs a brokerage and signs deals all day. Skeptical, impatient, hates being pitched. Goal: sell one engraved Signer on this call."
DEMO_CALL = [
    (S, "Hey Jordan, good to see you."),
    (B, "Sell me this pen."),
    (S, "Sure. What's your day like?"),
    (B, "I run a brokerage. I don't need a pen. I've got a drawer full of them."),
    (S, "Fair. What's the last thing you signed that actually mattered?"),
    (B, "A ten-year lease on our new office. I sign it Friday."),
    (S, "Then this is your Friday pen. Solid brass, refills for life, and we engrave your initials free this week."),
    (B, "Forty bucks for a pen? I get twenty for five dollars."),
    (S, "You can. But it's forty bucks against a ten-year lease. One of those twenty skips on Friday, right in front of your landlord."),
    (B, "Look, it's a nice pen. Let me think about it."),
    (S, "Let me flip it. You sell it to me. Why would you sign a ten-year lease with a two-dollar pen?"),
    (B, "Because it's the signature people remember. It should feel like the deal. Fine. Can you get it to me before Friday?"),
]
SHOWN = ["Ask what contracts they sign", "Ask which pen closes deals", "Compare $40 to ten-year lease", "Offer to ship before Friday"]


def beat(upto, elapsed, shown, expect):
    return case(PENCO, DEMO_CALL[:upto], {"elapsed_s": elapsed, "target_s": 600}, expect, SHOWN[:shown], JORDAN)


DEMO = [
    beat(2, 270, 0, ["opening", "no_need"]),
    beat(4, 285, 1, ["no_need"]),
    beat(8, 320, 2, ["price"]),
    beat(10, 340, 3, ["stall"]),
    beat(12, 380, 4, ["ready", "buying_signal"]),
    # A direct question must be answered first (seen live: "Ask which warranty worry sparked this").
    case(PEN, [(S, "It's 40 dollars and comes with a lifetime warranty."), (B, "So how does the warranty work?")], expect=["buying_signal", "proof", "trust", "technical"]),
    case(PENCO, DEMO_CALL[:7] + [(B, "So how does the warranty work?")], {"elapsed_s": 310, "target_s": 600}, ["buying_signal", "proof", "trust", "technical"], SHOWN[:2], JORDAN),
    case(HVAC, [(S, "Your AC is 18 years old. I'd recommend a heat pump, 11,500 installed."), (B, "So how does the warranty work?")], expect=["buying_signal", "proof", "trust", "technical"]),
]

# The same buyer line at different points of the call (target length in stats): early it can be probed,
# late it should be answered in a beat and turned toward a close or a dated next step.
def at(minute, target_min=15, **extra):
    return {"elapsed_s": minute * 60, "target_s": target_min * 60, **extra}


TIME = [
    case(GYM, [(S, "With the two PT sessions, you'd have a coach building your plan."), (B, "Eighty-nine a month is more than I wanted to spend.")], at(m), ["price"])
    for m in (2, 7, 11, 14)
] + [
    case(CRM, [(S, "So that's the pipeline view and the follow-up reminders."), (B, "Let me think about it and get back to you.")], at(m), ["stall", "ghost_risk"])
    for m in (2, 7, 11, 14)
] + [
    case(SOLAR, [(S, "We'd handle permits and install in about three weeks."), (B, "How do I know you won't disappear like the last guys?")], at(m, 30), ["trust", "burned"])
    for m in (4, 14, 22, 28)
] + [
    # The seller already asked two discovery questions: the next nudge should advance.
    case(SAAS, [(S, "How do you build the schedule today?"), (B, "Spreadsheet, Sunday nights."), (S, "And when someone calls out?"), (B, "I scramble. Usually I end up covering the shift myself.")], at(8), ["pain"], recent=["Ask how they build schedules", "Ask what call-outs cost them"]),
    case(PIANO, [(B, "I always wanted to play Clair de Lune."), (S, "Love that. What stopped you before?"), (B, "Never had time, and honestly I was nervous.")], at(10), ["fear", "pain"], recent=["Ask what music they love", "Ask what stopped them before"]),
    case(CYBER, [(S, "How many devices are you managing?"), (B, "About 500 laptops."), (S, "And what would a breach cost you?"), (B, "Honestly? Probably our biggest client.")], at(25, 30), ["pain"], recent=["Ask how many devices they manage", "Ask what a breach would cost"]),
]


def flag(name, takes_value=False):
    if name not in sys.argv:
        return None
    i = sys.argv.index(name)
    value = sys.argv[i + 1] if takes_value else True
    del sys.argv[i : i + (2 if takes_value else 1)]
    return value


VERBOSE = flag("-v")  # also print both of Claude's picks
URL = (flag("--url", True) or "http://localhost:3000").rstrip("/") + "/api/cue"
ONLY = flag("--only", True)
REPEAT = int(flag("--repeat", True) or 1)
JUDGE = flag("--judge")
JUDGE_PICKS = flag("--judge-picks")  # grade each of Claude's two picks on its own, to compare ways of choosing between them
SAVE, LOAD = flag("--save", True), flag("--load", True)
if flag("--fresh"):
    CASES = FRESH
elif flag("--new"):
    CASES = NEW
elif flag("--time"):
    CASES = TIME
elif flag("--demo"):
    CASES = DEMO
elif flag("--all"):
    CASES = CASES + FRESH + NEW + TIME + DEMO
if ONLY:
    a, _, b = ONLY.partition(":")
    CASES = CASES[int(a or 0) : int(b) if b else None]

# Nudges that are just a playbook move word for word count as generic.
norm = lambda t: re.sub(r"[^a-z0-9 ]", "", (t or "").lower()).strip()
seed_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib", "seed-data.json")
with open(seed_path) as f:
    PLAYBOOK = {norm(c["cue_text"]) for c in json.load(f)["cues"]}


def post(url, payload, timeout=60, meta=None):
    headers = {"Content-Type": "application/json"}
    if os.environ.get("VERCEL_OIDC_TOKEN") and "localhost" not in url:
        headers["x-vercel-trusted-oidc-idp-token"] = os.environ["VERCEL_OIDC_TOKEN"]  # gets past preview protection
    req = urllib.request.Request(url, json.dumps(payload).encode(), headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        if meta is not None:
            meta["timing"] = resp.headers.get("Server-Timing") or ""
            meta["region"] = resp.headers.get("x-vercel-id") or ""
        return json.load(resp)


# 'db;dur=3, ttft;dur=610, tok;desc="in=90 cached=8100 write=0 out=70"' -> {"db": 3, "ttft": 610, "in": 90, ...}
def server_timing(header):
    out = {}
    for part in (header or "").split(","):
        m = re.match(r"\s*([\w-]+)\s*;\s*dur=([\d.]+)", part)
        if m:
            out[m.group(1)] = float(m.group(2))
        for k, x in re.findall(r"(\w+)=(\d+)", part.split("desc=", 1)[1] if "desc=" in part else ""):
            out[k] = float(x)
    return out


def pct(values, p):
    v = sorted(values)
    return v[max(0, math.ceil(p * len(v)) - 1)] if v else None


def turns_of(c):
    return [{"speaker": s, "text": t} for s, t in c["turns"]]


def run(variant, c):
    # share: False so repeated runs time a real Claude call instead of reusing the answer to an identical request
    body = {"turns": turns_of(c), "profile": c["profile"], "brief": c["brief"], "stats": c["stats"], "recent_nudges": c["recent"], "variant": variant,
            "share": False, **({"org": c["org"]} if c.get("org") else {})}
    t0 = time.time()
    meta = {}
    try:
        d = post(URL, body, meta=meta)
    except Exception as e:  # keep going so one failure doesn't hide the rest
        return {"ms": int((time.time() - t0) * 1000), "moment": "error", "nudge": str(e), "move": "", "generic": False, "picks": []}
    ms = int((time.time() - t0) * 1000)
    timing = server_timing(meta.get("timing"))
    if d.get("ms") is not None and "total" not in timing:
        timing["total"] = d["ms"]
    cue = d.get("cue") or {}
    nudge = cue.get("cue_text") or d.get("error") or "(none)"
    move = cue.get("move") or ""
    generic = bool(cue) and (norm(nudge) == norm(move) or norm(nudge) in PLAYBOOK)
    return {"ms": ms, "moment": d.get("objection_type") or "none", "nudge": nudge, "move": move, "generic": generic, "picks": d.get("picks") or [],
            "timing": timing, "region": meta.get("region", "").split("::")[1:2]}


# The route shows Claude's nudge if it has six words or fewer, otherwise the move as written.
def nudge_or_move(nudge, move):
    clean = re.sub(r'["\u201c\u201d]', "", nudge or "").strip()
    return clean if clean and len(clean.split()) <= 6 else move


def judge(c, r, pick=None):
    if r["moment"] == "error":
        return {"score": None, "reason": "error", "better": ""}
    nudge, move = (nudge_or_move(pick.get("nudge"), pick.get("move")), pick.get("move")) if pick else (r["nudge"], r["move"])
    silent = nudge == "(none)"
    body = {"profile": c["profile"], "brief": c["brief"], "turns": turns_of(c), "stats": c["stats"], "recent_nudges": c["recent"],
            "moment": r["moment"], "nudge": None if silent else nudge, "move": move}
    for _ in range(2):
        try:
            return post(JUDGE_URL, body, timeout=300)
        except Exception as e:
            err = str(e)
    return {"score": None, "reason": f"judge failed: {err}", "better": ""}


if LOAD:
    with open(LOAD) as f:
        results = json.load(f)
    variants = list(results)
else:
    variants = sys.argv[1:] or ["haiku-fast", "haiku-think", "sonnet-fast", "sonnet-think"]
    results = {v: [] for v in variants}
    for v in variants:
        run(v, simple(PEN, [(S, "hi")], "hello"))  # warm up this model's cache
        for c in CASES:
            results[v].append(run(v, c))
        for _ in range(REPEAT - 1):  # extra runs only feed the latency stats
            for r, c in zip(results[v], CASES):
                r.setdefault("again", []).append({k: x[k] for x in [run(v, c)] for k in ("ms", "timing", "moment")})
if JUDGE_PICKS:  # one grade per pick; the shown nudge takes its pick's grade (no extra call), else gets its own
    with ThreadPoolExecutor(8) as pool:
        for v in variants:
            jobs = [(i, k) for i, r in enumerate(results[v]) for k in range(len(r.get("picks") or []))]
            for (i, k), verdict in zip(jobs, pool.map(lambda ik: judge(CASES[ik[0]], results[v][ik[0]], results[v][ik[0]]["picks"][ik[1]]), jobs)):
                results[v][i].setdefault("pick_judges", [None, None])[k] = verdict
            for c, r in zip(CASES, results[v]):
                shown = [j for p, j in zip(r.get("picks") or [], r.get("pick_judges") or []) if j and norm(nudge_or_move(p.get("nudge"), p.get("move"))) in (norm(r["nudge"]), norm(r["move"]))]
                r["judge"] = shown[0] if shown else judge(c, r)
elif JUDGE:
    with ThreadPoolExecutor(8) as pool:
        for v in variants:
            for r, verdict in zip(results[v], pool.map(lambda cr: judge(*cr), zip(CASES, results[v]))):
                r["judge"] = verdict
if SAVE:
    with open(SAVE, "w") as f:
        json.dump(results, f, indent=1)

for i, c in enumerate(CASES):
    speaker, line = c["turns"][-1]
    recent = f'   after: {" > ".join(c["recent"])}' if c["recent"] else ""
    clock = f'   [min {c["stats"].get("elapsed_s", 0) // 60} of {c["stats"].get("target_s", 900) // 60}]'
    print(f'\n{"Seller" if speaker == S else "Buyer"}: "{line}"   (expect {" / ".join(c["expect"]) or "?"}){clock}{recent}')
    for v in variants:
        if i >= len(results[v]):  # a loaded run from before this case existed
            continue
        r = results[v][i]
        flag_ = "" if not c["expect"] or r["moment"] in c["expect"] else "  <- moment?"
        tag = "  <- generic" if r["generic"] else ""
        move = f'   (move: {r["move"]})' if r["move"] else ""
        j = r.get("judge")
        score = f'[{j["score"]}] ' if j and j.get("score") else ""
        print(f'  {v:13} {r["ms"]:5} ms  {score}[{r["moment"]}] {r["nudge"]}{move}{tag}{flag_}')
        if VERBOSE or JUDGE_PICKS:
            for p, pj in zip(r.get("picks", []), r.get("pick_judges") or [None, None]):
                grade = f'[{pj["score"]}] ' if pj and pj.get("score") else ""
                print(f'  {"":13}            pick: {grade}{p.get("nudge")}   (move: {p.get("move")})')
        if j and j.get("score") and j["score"] <= 3:
            print(f'  {"":13}            judge: {j["reason"]}  Better: {j.get("better") or "-"}')
print()
for v in variants:
    rs = results[v]
    runs = [x for r in rs for x in [r] + r.get("again", []) if x["moment"] != "error"]
    times = sorted(r["ms"] for r in runs) or [0]
    generic = sum(r["generic"] for r in rs)
    off = sum(1 for c, r in zip(CASES, rs) if c["expect"] and r["moment"] not in c["expect"])  # zip stops at the shorter list
    errors = sum(1 for r in rs for x in [r] + r.get("again", []) if x["moment"] == "error")
    line = f"{v:13} median {pct(times, .5)} ms, p90 {pct(times, .9)} ms, slowest {times[-1]} ms ({len(runs)} runs, {errors} errors), generic {generic}/{len(rs)}, moment off {off}/{len(rs)}"
    parts = {}
    for r in runs:
        for k, x in (r.get("timing") or {}).items():
            parts.setdefault(k, []).append(x)
    if parts:
        line += "\n    server: " + ", ".join(f"{k} {pct(x, .5):.0f}/{pct(x, .9):.0f}" for k, x in parts.items()) + " ms (median/p90)"
    scores = [r["judge"]["score"] for r in rs if r.get("judge") and r["judge"].get("score")]
    firsts = [r["pick_judges"][0]["score"] for r in rs if r.get("pick_judges") and r["pick_judges"][0] and r["pick_judges"][0].get("score")]
    if firsts:
        line += f", first pick alone avg {sum(firsts)/len(firsts):.2f} (4-5: {sum(x >= 4 for x in firsts)}/{len(firsts)})"
    if scores:
        good = sum(s >= 4 for s in scores)
        line += f", judge avg {sum(scores)/len(scores):.2f}, 4-5: {good}/{len(scores)} ({100*good//len(scores)}%)"
    print(line)
    if scores:
        worst = sorted((r["judge"]["score"], i) for i, r in enumerate(rs) if r.get("judge") and r["judge"].get("score"))[:6]
        for sc, i in worst:
            print(f'    {sc}  "{CASES[i]["turns"][-1][1][:60]}" -> {rs[i]["nudge"]}  | {rs[i]["judge"]["reason"]}')
