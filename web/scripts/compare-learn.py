"""Runs end-of-call learning on won calls and prints what Q would add to the playbook.
Development only; nothing is saved (web/app/api/dev/learn). Usage: python3 -I scripts/compare-learn.py
Each case lists the moments its moves should answer, how many new moves it should add, and in words
what a good move would capture (for a person to check)."""
import json, urllib.request
from concurrent.futures import ThreadPoolExecutor

URL = "http://localhost:3000/api/dev/learn"
S, B = "You", "Buyer"

CASES = [
    {
        "name": "HVAC: future pace on the stake, then a dated close",
        "turns": [
            (S, "Thanks for having me out. How's the house holding up in this heat?"),
            (B, "Honestly, rough. Upstairs gets to like 90 by the afternoon."),
            (S, "Ninety upstairs. Who's up there?"),
            (B, "Our daughter's room. She's been sleeping on the couch since June."),
            (S, "That's a long summer on a couch. If you picture this August with the new system, what's the first thing that's different?"),
            (B, "She could sleep upstairs again. Yeah. That would be huge."),
            (S, "Then let's get you on the schedule before the next heat wave. Does Tuesday work?"),
            (B, "Tuesday works. Let's do it."),
        ],
        "moments": ["pain", "buying_signal", "ready", "stall", "timing", "no_need"],
        "added": (1, 3),
        "want": "anchoring on the stake they named (the daughter), and tying the close to their deadline (the heat wave)",
    },
    {
        "name": "CRM: mirror a vague 'fine', then price the loss",
        "turns": [
            (B, "We're pretty much fine with spreadsheets."),
            (S, "Pretty much fine?"),
            (B, "Well, we lost a client last month because a follow-up slipped through."),
            (S, "Ouch. What was that client worth to you?"),
            (B, "About 40 grand a year."),
            (S, "So the spreadsheet cost you 40 grand last month. What would it be worth to never lose one that way again?"),
            (B, "Okay, fair point. What would it take to get started?"),
            (S, "I'll do your migration this week. You just send me the sheet."),
            (B, "Deal."),
        ],
        "moments": ["no_need", "pain", "competitor"],
        "added": (1, 3),
        "want": "turning the loss they admitted into a number (the 40k), ideally sharper than 'Put a number on it'",
    },
    {
        "name": "Clinic software: accusation audit on a hostile opener",
        "turns": [
            (B, "Ugh, another sales call. Make it fast."),
            (S, "You're probably expecting me to waste your time and push something you don't need."),
            (B, "Pretty much, yeah."),
            (S, "Fair. Give me sixty seconds. If it's not useful, hang up on me, no hard feelings."),
            (B, "Fine. Go."),
            (S, "Most clinics your size lose about four appointments a week to no-shows. Is that you?"),
            (B, "More like six, honestly. Okay, what do you do about it?"),
            (S, "We text reminders patients confirm with one tap. Want to try it free for two weeks?"),
            (B, "Yeah, let's try it."),
        ],
        "moments": ["hostile", "opening", "trust", "pain", "no_need"],
        "added": (1, 3),
        "want": "naming their worst assumption first (accusation audit), and/or leading with a likely problem as a question",
    },
    {
        "name": "Solar: get the partner's answer while still on the call",
        "turns": [
            (B, "I need to talk to my husband first."),
            (S, "Of course. When you tell him tonight, what do you think he'll ask first?"),
            (B, "Whether we can afford it with the new baby."),
            (S, "Let's work that out right now so you have the answer ready. What monthly number feels comfortable?"),
            (B, "Maybe 150."),
            (S, "The lease comes in at 129, so that fits with room to spare. Want to text him that number while we're on?"),
            (B, "Ha, okay. He says go for it."),
        ],
        "moments": ["partner", "price"],
        "added": (1, 3),
        "want": "solving the partner's first question together, then getting the partner's answer live",
    },
    {
        "name": "Software: silence, then trade term length for a price lock",
        "turns": [
            (B, "Can you do 20% off?"),
            (S, "What's driving the 20?"),
            (B, "Our other quote was cheaper."),
            (S, "I can't do 20. But if you sign for two years, I'll lock this year's price and add the training package."),
            (B, "Two years at a locked price. Okay, that works."),
        ],
        "moments": ["discount", "shopping", "competitor", "price"],
        "added": (0, 2),
        "want": "close to existing discount moves; a new move only if sharper (trading term length for a price lock)",
    },
    {
        "name": "Grief handled with care, then the buyer chose to continue",
        "turns": [
            (B, "Sorry, I'm a bit scattered. My dad passed last week."),
            (S, "I'm so sorry. We don't have to do this today. Want to pick it up next week?"),
            (B, "No, honestly it helps to focus on something. Let's keep going."),
            (S, "Okay. We'll go at your pace, and you can stop me anytime."),
            (B, "Thanks. This all looks good, let's sign up."),
        ],
        "moments": ["health_loss"],
        "added": (0, 1),
        "want": "mostly covered by existing empathy moves; at most one sharper move (letting them choose to continue)",
    },
    {
        "name": "Nothing to learn: the buyer had already decided",
        "turns": [
            (B, "Hi, I already decided. I just want to buy the annual plan."),
            (S, "Great, I'll send you the link."),
            (B, "Got it, thanks. Paid."),
        ],
        "moments": [],
        "added": (0, 0),
        "want": "nothing",
    },
]


def learn(c):
    body = json.dumps({"turns": [{"speaker": s, "text": t} for s, t in c["turns"]]}).encode()
    req = urllib.request.Request(URL, body, {"Content-Type": "application/json"})
    try:
        return json.load(urllib.request.urlopen(req, timeout=300))
    except Exception as e:
        return {"error": str(e), "moves": [], "ms": 0}


with ThreadPoolExecutor(len(CASES)) as pool:
    results = list(pool.map(learn, CASES))

passed = 0
for c, r in zip(CASES, results):
    added = [m for m in r["moves"] if not m["skip"]]
    lo, hi = c["added"]
    ok_count = lo <= len(added) <= hi
    ok_moment = all(m["moment"] in c["moments"] for m in added) if c["moments"] else True
    ok = ok_count and ok_moment and "error" not in r
    passed += ok
    print(f'\n{"PASS" if ok else "FAIL"}  {c["name"]}  ({r.get("ms", 0)} ms; added {len(added)}, wanted {lo} to {hi})')
    print(f'      want: {c["want"]}')
    if "error" in r:
        print(f'      error: {r["error"]}')
    for m in r["moves"]:
        status = f'skipped: {m["skip"]}' if m["skip"] else "added"
        print(f'      [{m["moment"]}/{m["buyer_type"]}] {m["move"]}  ({status})')
        print(f'          said: {m["full_line"]}')
        print(f'          lesson: {m["lesson"]}')
print(f"\n{passed}/{len(CASES)} learning cases pass")
