// Q on Google Meet: the floating cue card.
// Plain JavaScript, no build step. Everything Q draws lives inside a Shadow DOM.
(() => {
  if (window.__qLoaded) return;
  window.__qLoaded = true;

  const MAX_TURNS = 80;
  const BUYERS = { skeptical: "Skeptical", rushed: "Rushed", price_focused: "Price-focused", curious: "Curious" };
  const MOMENT_LABELS = self.Q_MOMENT_LABELS || {}; // from moments.js, generated from the web app's list

  // ---------- State ----------
  const q = {
    enabled: true,
    name: "",
    city: "",
    brief: "",
    profile: "",
    callLength: 15, // minutes, from the popup
    idle: true, // the card is showing a "what to do next" message, not a nudge
    askingOutcome: false, // the call ended and the card is asking "How did it go?"
    live: null, // the words being spoken right now: { speaker, name, text, at }
    note: null, // a short status after a reply with no nudge: { text, until }
    cueAt: 0, // when the current nudge appeared
    turns: [], // { speaker: "You" | "Buyer", name, text, t }
    callStart: Date.now(),
    shownCueIds: [],
    recentNudges: [],
    busy: false,
    again: false,
    error: false,
    lastCueAt: 0,
  };

  // ---------- Backend (through the background worker) ----------
  function api(path, method = "GET", body) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ type: "api", path, method, body }, (res) => {
          if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
          else resolve(res || { ok: false, error: "No response" });
        });
      } catch (e) {
        resolve({ ok: false, error: String(e) }); // extension was reloaded; this page needs a refresh
      }
    });
  }

  // ---------- Build the card ----------
  // The glass ring animates two angles; register them on the page so the shadow styles can use them.
  for (const [name, initialValue] of [
    ["--tg-a1", "0deg"],
    ["--tg-a2", "140deg"],
  ]) {
    try {
      CSS.registerProperty({ name, syntax: "<angle>", inherits: true, initialValue });
    } catch {}
  }

  const host = document.createElement("div");
  host.id = "q-coach";
  Object.assign(host.style, { position: "fixed", top: "20px", right: "20px", zIndex: "2147483647" });
  const root = host.attachShadow({ mode: "open" });

  root.innerHTML = `
    <div class="q tg idle" part="card">
      <div class="q-top">
        <div class="q-mark">
          <div class="tg-glass-ring"><i class="bloom"></i><i class="track"></i><i class="ch red"></i><i class="ch green"></i><i class="ch blue"></i><i class="hot"></i><i class="streaks"></i></div>
          <b>Q</b>
        </div>
        <div class="q-status"><span class="tg-dot small"></span><span class="q-status-text">Listening</span></div>
        <span class="tg-chip on q-buyer" hidden></span>
      </div>
      <div class="q-cue"></div>
      <div class="q-src"></div>
      <div class="q-heard"></div>
      <div class="q-type" hidden>
        <div class="tg-seg q-who"><span class="on" data-who="Buyer">Buyer</span><span data-who="You">You</span></div>
        <input class="tg-input" placeholder="What the buyer said, then Enter" />
      </div>
      <div class="q-debug" hidden>
        <div class="q-debug-head"><span>What Q hears</span><button class="tg-link" data-act="copy-captions">Copy caption code</button></div>
        <div class="q-debug-lines tg-scroll"></div>
      </div>
      <div class="q-clock"><i></i></div>
      <div class="q-foot">
        <span class="q-moment"></span>
        <div class="q-end"></div>
      </div>
    </div>
    <div class="tg-toast"><span class="tg-orb"></span><span class="q-toast-text"></span></div>
  `;

  const $ = (sel) => root.querySelector(sel);
  const card = $(".q");
  const cueEl = $(".q-cue");
  const srcEl = $(".q-src");
  const buyerEl = $(".q-buyer");
  const momentEl = $(".q-moment");
  const statusDot = $(".q-status .tg-dot");
  const statusText = $(".q-status-text");
  const typeBox = $(".q-type");
  const typeInput = $(".q-type input");
  const whoEl = $(".q-who");
  let typingAs = "Buyer";
  const endBox = $(".q-end");
  const heardEl = $(".q-heard");
  const clockBar = $(".q-clock i");
  const debugBox = $(".q-debug");
  const debugLines = $(".q-debug-lines");
  const toastEl = $(".tg-toast");

  async function loadStyles() {
    const texts = await Promise.all(
      ["tango.css", "card.css"].map((f) => fetch(chrome.runtime.getURL(f)).then((r) => r.text())),
    );
    // Tango's tokens are written for the page root; inside the shadow they belong on the host.
    const css = texts.join("\n").replace(/:root/g, ":host").replace(/@property[^}]+}/g, "");
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    root.adoptedStyleSheets = [sheet];
  }

  // ---------- Status, cue, toast ----------
  function setStatus(kind, text) {
    if (statusText.textContent !== text) statusText.textContent = text;
    statusDot.classList.toggle("off", kind !== "live");
    card.classList.toggle("idle", kind !== "live");
  }

  // Most important problem first: backend down, then captions off. Otherwise say what Q is doing.
  const HEARING_MS = 1200; // someone counts as speaking if their words changed this recently
  function refreshStatus() {
    if (q.error) return setStatus("off", "Can't reach Q");
    if (cap.inCallSince && !cap.region) return setStatus("off", "Captions off");
    const now = Date.now();
    const speaking = q.live && now - q.live.at < HEARING_MS;
    card.classList.toggle("speaking", !!speaking);
    if (q.busy) return setStatus("live", "Thinking…");
    if (speaking) return setStatus("live", q.live.speaker === "You" ? "Hearing you…" : `Hearing ${firstName(q.live.name) || "the buyer"}…`);
    if (q.note && now < q.note.until) return setStatus("live", q.note.text);
    setStatus("live", "Listening");
  }

  const firstName = (n) => (n || "").trim().split(/\s+/)[0];

  function timeAgo(iso) {
    if (!iso) return "";
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} hr ago`;
    const d = Math.round(s / 86400);
    return d === 1 ? "yesterday" : `${d} days ago`;
  }

  function sourceHtml(cue) {
    if (!cue) return "";
    if (cue.author_name === "Q Starter") return "From the Q starter playbook";
    const who = [cue.author_name, cue.author_city].filter(Boolean).join(" · ");
    const when = timeAgo(cue.created_at);
    return `Learned from <em>${escapeHtml(who)}</em>${when ? ` · ${when}` : ""}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function momentLabel(m) {
    if (!m || m === "none") return "";
    return MOMENT_LABELS[m] || m.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  }

  function setBuyer(type) {
    buyerEl.hidden = !type;
    if (type) buyerEl.textContent = `${BUYERS[type] || type} buyer`;
  }

  // Fade the old nudge out, swap in the new one, fade back in.
  function showCue(text, { source = "", moment = "", muted = false } = {}) {
    cueEl.classList.add("out");
    srcEl.classList.add("out");
    setTimeout(() => {
      cueEl.textContent = text;
      cueEl.classList.toggle("muted", muted);
      srcEl.innerHTML = source;
      momentEl.textContent = moment;
      momentEl.dataset.moment = moment;
      cueEl.classList.remove("out");
      srcEl.classList.remove("out");
    }, 220);
  }

  let toastTimer;
  function toast(text) {
    $(".q-toast-text").textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  // ---------- Transcript and call stats ----------
  function addTurn(speaker, text, name = "", t = Date.now()) {
    const turn = { speaker, name, text, t, sentWords: 0 };
    q.turns.push(turn);
    if (q.turns.length > MAX_TURNS * 2) q.turns.splice(0, q.turns.length - MAX_TURNS);
    renderDebug();
    return turn;
  }

  function callStats() {
    const now = Date.now();
    let you = 0;
    let all = 0;
    for (const t of q.turns) {
      all += t.text.length;
      if (t.speaker === "You") you += t.text.length;
    }
    // How long the seller has been talking without the buyer getting a word in
    let streakStart = null;
    for (let i = q.turns.length - 1; i >= 0 && q.turns[i].speaker === "You"; i--) streakStart = q.turns[i].t;
    return {
      elapsed_s: Math.round((now - q.callStart) / 1000),
      target_s: q.callLength * 60,
      seller_talk_share: all ? Math.round((you / all) * 100) / 100 : undefined,
      seller_streak_s: streakStart ? Math.round((now - streakStart) / 1000) : 0,
    };
  }

  // ---------- Ask Q for a nudge ----------
  async function requestCue() {
    if (q.busy) {
      q.again = true; // a newer line arrived; ask again as soon as this answer lands
      return;
    }
    q.busy = true;
    refreshStatus();
    const res = await api("/api/cue", "POST", {
      turns: q.turns.slice(-MAX_TURNS).map(({ speaker, text }) => ({ speaker, text })),
      stats: callStats(),
      brief: q.brief,
      profile: q.profile,
      user_name: q.name,
      recent_nudges: q.recentNudges.slice(-3), // so Q builds on what you already tried
    });
    q.busy = false;
    q.lastCueAt = Date.now();
    q.error = !res.ok || !res.data || !!res.data.error;
    refreshStatus();

    if (!q.error) {
      const d = res.data;
      setBuyer(d.buyer_type);
      if (!d.cue) q.note = { text: "Heard it · nothing to coach yet", until: Date.now() + 4000 };
      if (d.cue) {
        q.cueAt = Date.now();
        cueEl.classList.remove("stale");
        q.idle = false;
        q.shownCueIds.push(d.cue.cue_id);
        q.recentNudges.push(d.cue.cue_text);
        showCue(d.cue.cue_text, { source: sourceHtml(d.cue), moment: momentLabel(d.objection_type) });
      }
    }
    if (q.again) {
      q.again = false;
      requestCue();
    }
  }

  // ---------- Reading Meet's live captions ----------
  // Meet's class names are scrambled and change often, so Q finds the captions by the label Meet
  // gives them for screen readers, and reads each block as "speaker name, then what they said".
  const SETTLE_MS = 500; // a caption counts as finished once it stops changing this long
  const PACING_STREAK_S = 45; // seller talking this long without the buyer: ask for a pacing nudge
  const PACING_GAP_MS = 30000; // and not more often than this
  const cap = { region: null, visible: false, inCallSince: 0, states: new WeakMap(), lastLookup: 0 };

  function findCaptionRegion() {
    for (const el of document.querySelectorAll('[role="region"][aria-label], [aria-live][aria-label]')) {
      if (/caption/i.test(el.getAttribute("aria-label"))) return el;
    }
    return null;
  }

  function inCall() {
    return !!document.querySelector('[aria-label*="Leave call" i], [data-tooltip*="Leave call" i]');
  }

  // Visible words only: skips buttons and icon glyphs (Meet draws icons as text like "more_vert").
  function textParts(el) {
    const parts = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest('button, [role="button"], [aria-hidden="true"]')) continue;
      const t = n.textContent.replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    }
    return parts;
  }

  // One block per stretch of speech: the speaker's avatar, their name, then the words.
  // Each block is tracked by its avatar image, which stays put while the words around it change.
  function captionBlocks(region) {
    const blocks = [];
    for (const img of region.querySelectorAll("img")) {
      let el = img;
      while (el.parentElement && el.parentElement !== region && el.parentElement.querySelectorAll("img").length === 1) {
        el = el.parentElement;
      }
      blocks.push({ key: img, el });
    }
    if (blocks.length) return blocks;
    // No avatars: use the innermost list of children that hold text
    let box = region;
    while (box.children.length === 1) box = box.children[0];
    return [...box.children].filter((el) => textParts(el).length).map((el) => ({ key: el, el }));
  }

  function parseBlock(block) {
    const parts = textParts(block);
    if (parts.length < 2) return { name: "", text: parts[0] || "" };
    return { name: parts[0], text: parts.slice(1).join(" ").replace(/\s+/g, " ").trim() };
  }

  function isMe(name) {
    const n = (name || "").trim().toLowerCase();
    return n === "you" || (!!q.name && n === q.name.trim().toLowerCase());
  }

  const words = (t) => (t ? t.split(/\s+/).filter(Boolean).length : 0);

  // Meet rewrites a caption as the person keeps talking and drops old words off the front of long
  // blocks. Keep everything heard so far: extend when the new text continues the old, stitch on overlap.
  function mergeCaption(old, neu) {
    if (!old || neu.startsWith(old)) return neu;
    const a = old.split(" ");
    const b = neu.split(" ");
    for (let k = Math.min(a.length, b.length); k >= 3; k--) {
      if (a.slice(-k).join(" ") === b.slice(0, k).join(" ")) return a.concat(b.slice(k)).join(" ");
    }
    const at = old.lastIndexOf(b.slice(0, 3).join(" "));
    if (at >= 0) return old.slice(0, at) + neu;
    return neu; // Meet revised the words it had shown: trust the newer version
  }

  function readBlock(block, now, isLatest) {
    const { name, text } = parseBlock(block.el);
    if (!text) return;
    let st = cap.states.get(block.key);
    if (st?.ignore) return;
    if (!st) {
      st = { turn: null, seen: "", changedAt: now, firstSeen: now };
      cap.states.set(block.key, st);
    }
    if (text !== st.seen) {
      st.seen = text;
      st.changedAt = now;
      if (isLatest) q.live = { speaker: isMe(name) ? "You" : "Buyer", name, text, at: now };
    }
    // Finished when it stops changing, or as soon as someone else starts talking.
    if (isLatest && now - st.changedAt < SETTLE_MS) return;
    const speaker = isMe(name) ? "You" : "Buyer";
    if (!st.turn) st.turn = addTurn(speaker, "", speaker === "You" ? "" : name, st.firstSeen);
    const merged = mergeCaption(st.turn.text, text);
    if (merged === st.turn.text) return;
    st.turn.text = merged;
    renderDebug();
    if (speaker === "Buyer" && words(merged) - st.turn.sentWords >= 2) {
      st.turn.sentWords = words(merged);
      requestCue();
    }
  }

  function hideCaptions() {
    if (!cap.region) return;
    if (cap.visible) cap.region.style.removeProperty("opacity");
    else cap.region.style.setProperty("opacity", "0", "important"); // never display:none, or Meet stops rendering it
  }

  function tickCaptions() {
    const now = Date.now();
    if (now - cap.lastLookup > 1000) {
      cap.lastLookup = now;
      const calling = inCall();
      if (calling && !cap.inCallSince) {
        cap.inCallSince = now;
        startNewCall(); // the clock starts when you join
      }
      if (!calling && cap.inCallSince) {
        cap.inCallSince = 0;
        if (q.turns.length && !q.askingOutcome) askOutcome(); // you left with Meet's own button
      }
      if (!cap.region?.isConnected) cap.region = findCaptionRegion();
      hideCaptions();
      refreshStatus();
      refreshIdle();
      checkPacing();
    }
    if (!cap.region || !q.enabled) return renderLive(now);
    const blocks = captionBlocks(cap.region);
    blocks.forEach((b, i) => readBlock(b, now, i === blocks.length - 1));
    renderLive(now);
  }

  // ---------- The card's live feel: what was just heard, the call clock, stale nudges ----------
  const HEARD_FOR_MS = 6000; // the heard line fades this long after the words stop
  const STALE_AFTER_MS = 60000; // a nudge this old dims, so it doesn't look current
  let heardShown = "";
  function renderLive(now) {
    refreshStatus();
    // The last few words, from whoever is talking
    const l = q.live;
    const fresh = l && now - l.at < HEARD_FOR_MS && !q.askingOutcome;
    const words = fresh ? l.text.split(" ").slice(-12).join(" ") : "";
    const line = fresh ? `${l.speaker === "You" ? "You" : firstName(l.name) || "Buyer"} · ${l.text.split(" ").length > 12 ? "…" : ""}${words}` : "";
    if (line !== heardShown) {
      heardShown = line;
      if (line) heardEl.textContent = line;
      heardEl.classList.toggle("on", !!line);
    }
    // Old nudges dim
    if (!q.idle && q.cueAt && now - q.cueAt > STALE_AFTER_MS) cueEl.classList.add("stale");
    // Call clock: how far into the call, and which phase that is
    if (cap.inCallSince && !q.askingOutcome) {
      const share = (now - q.callStart) / (q.callLength * 60000);
      clockBar.style.width = `${Math.min(100, share * 100)}%`;
      clockBar.parentElement.classList.toggle("late", share >= 0.8);
      if (q.idle || !momentEl.dataset.moment) momentEl.textContent = phaseLabel(now, share);
    } else {
      clockBar.style.width = "0%";
    }
  }

  function phaseLabel(now, share) {
    const min = Math.floor((now - q.callStart) / 60000);
    const phase = share < 0.2 ? "Discovery" : share < 0.55 ? "Present and handle" : share < 0.8 ? "Close window" : share < 1 ? "Ask for the sale" : "Over time";
    return `${phase} · ${min} of ${q.callLength} min`;
  }

  // If you've been talking a long time without the buyer getting a word in, ask for a pacing nudge.
  function checkPacing() {
    if (!cap.inCallSince || q.busy || !q.turns.length) return;
    if (callStats().seller_streak_s >= PACING_STREAK_S && Date.now() - q.lastCueAt > PACING_GAP_MS) requestCue();
  }

  // ---------- Debug view (Shift+D): what Q hears, and a way to send Meet's caption code ----------
  function renderDebug() {
    if (debugBox.hidden) return;
    const lines = q.turns.slice(-8).map((t) => {
      const who = t.speaker === "You" ? "You" : `Buyer${t.name ? ` · ${t.name}` : ""}`;
      return `<div><b>${escapeHtml(who)}</b>${escapeHtml(t.text)}</div>`;
    });
    debugLines.innerHTML = lines.join("") || `<div>Nothing heard yet${cap.region ? "" : " (no captions found)"}</div>`;
    debugLines.scrollTop = debugLines.scrollHeight;
  }

  function toggleDebug() {
    debugBox.hidden = !debugBox.hidden;
    renderDebug();
  }

  async function copyCaptionCode() {
    const region = cap.region || findCaptionRegion();
    let out;
    if (region) {
      out = region.outerHTML;
    } else {
      const candidates = [...document.querySelectorAll('[aria-live], [role="region"]')];
      out = "NO CAPTIONS AREA FOUND. Candidates:\n\n" + candidates.map((el) => el.outerHTML.slice(0, 3000)).join("\n\n");
    }
    out = out.slice(0, 30000);
    try {
      await navigator.clipboard.writeText(out);
    } catch {
      const ta = document.createElement("textarea"); // older way to copy, if the clipboard API is blocked
      ta.value = out;
      root.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast("Caption code copied. Paste it into the chat.");
  }
  debugBox.addEventListener("click", (e) => {
    if (e.target.closest("[data-act]")?.dataset.act === "copy-captions") copyCaptionCode();
  });

  // ---------- Typed lines (Shift+B): the fallback if captions can't be read ----------
  // Buyer lines ask Q for a nudge; your own lines give Q context about what you're selling.
  function setTypingAs(who) {
    typingAs = who;
    for (const el of whoEl.children) el.classList.toggle("on", el.dataset.who === who);
    typeInput.placeholder = who === "Buyer" ? "What the buyer said, then Enter" : "What you said, then Enter";
  }
  whoEl.addEventListener("click", (e) => {
    const who = e.target.closest("[data-who]")?.dataset.who;
    if (who) setTypingAs(who);
    typeInput.focus();
  });
  function toggleTypeBox(open = typeBox.hidden) {
    typeBox.hidden = !open;
    if (open) setTimeout(() => typeInput.focus(), 0);
  }
  typeInput.addEventListener("keydown", (e) => {
    e.stopPropagation(); // keep Meet's shortcuts from firing while typing here
    if (e.key === "Escape") toggleTypeBox(false);
    if (e.key === "Tab") {
      e.preventDefault();
      setTypingAs(typingAs === "Buyer" ? "You" : "Buyer");
    }
    if (e.key === "Enter" && typeInput.value.trim()) {
      addTurn(typingAs, typeInput.value.trim());
      q.live = { speaker: typingAs, name: "", text: typeInput.value.trim(), at: Date.now() - HEARING_MS }; // show it as heard
      typeInput.value = "";
      if (typingAs === "Buyer") requestCue();
      else setTypingAs("Buyer"); // after your line, the next one is usually the buyer's
    }
  });

  function toggleCaptions() {
    cap.visible = !cap.visible;
    hideCaptions();
    toast(cap.visible ? "Meet captions shown" : "Meet captions hidden");
  }

  function isTypingInPage(e) {
    const el = e.composedPath()[0];
    return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  }
  window.addEventListener(
    "keydown",
    (e) => {
      if (!q.enabled || isTypingInPage(e)) return;
      if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
      const action = { KeyB: toggleTypeBox, KeyD: toggleDebug, KeyC: toggleCaptions }[e.code];
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    },
    true,
  );

  // ---------- End call: leave Meet, then "How did it go?" ----------
  function renderEnd(step = "start") {
    if (step === "start") {
      endBox.innerHTML = `<button class="tg-btn small" data-act="end" title="Leaves the Meet call, then asks how it went">End call</button>`;
    } else {
      endBox.innerHTML =
        `<button class="tg-link" data-act="skip" title="Don't record this call">Skip</button>` +
        `<button class="tg-btn small" data-act="lost">Lost</button>` +
        `<button class="tg-btn small primary" data-act="won">Won</button>`;
    }
  }
  endBox.addEventListener("click", (e) => {
    const act = e.target.closest("button")?.dataset.act;
    if (act === "end") endCall();
    if (act === "won" || act === "lost") finishCall(act);
    if (act === "skip") {
      startNewCall();
      toast("Call skipped. Nothing recorded.");
    }
  });

  function leaveButton() {
    return document.querySelector('button[aria-label*="Leave call" i], [role="button"][aria-label*="Leave call" i]');
  }

  function endCall() {
    askOutcome();
    leaveButton()?.click(); // Meet may ask "leave or end for everyone" first; the card waits either way
  }

  function askOutcome() {
    q.askingOutcome = true;
    q.idle = false;
    toggleTypeBox(false);
    renderEnd("outcome");
    setBuyer(null);
    showCue("How did it go?", { source: "Won or lost, Q learns from every call", moment: "Call ended" });
  }

  // Send the call to Q: shown moves get their win or loss, and on a win Q learns your own moves.
  async function finishCall(outcome) {
    const transcript = q.turns.filter((t) => t.text.trim()).map(({ speaker, text }) => ({ speaker, text }));
    const shown = q.shownCueIds.filter(Boolean);
    startNewCall();
    if (!transcript.length) return toast(outcome === "won" ? "Nice close." : "On to the next one.");
    toast(outcome === "won" ? "Nice close. Learning from your call…" : "Learning from this one…");
    const res = await api("/api/learn", "POST", {
      transcript,
      outcome,
      shown_cue_ids: shown,
      user_name: q.name,
      user_city: q.city,
    });
    if (!res.ok || !res.data?.ok) return toast("Couldn't save the call");
    const learned = res.data.learned || [];
    if (learned.length) toast(`Q learned a new move from you: ${learned[0].cue_text}${learned.length > 1 ? ` (+${learned.length - 1} more)` : ""}`);
    else if (res.data.lesson) toast(`${outcome === "won" ? "Win" : "Loss"} recorded. Lesson saved to the playbook.`);
    else toast(`${outcome === "won" ? "Win" : "Loss"} recorded.`);
  }

  // ---------- New moves from everyone (checked every few seconds) ----------
  const POLL_MS = 3000;
  let since = null; // server time of the last check
  async function pollUpdates() {
    if (!q.enabled || document.hidden) return;
    const res = await api(`/api/updates${since ? `?since=${encodeURIComponent(since)}` : ""}`);
    if (!res.ok || !res.data?.now) return;
    const first = since === null;
    since = res.data.now;
    if (first) return; // the first check only sets the starting point
    for (const c of res.data.cues || []) {
      const mine = c.author_name === (q.name.trim() || "A Q user") && (c.author_city || "") === q.city.trim();
      if (mine) continue; // your own card already said what it learned
      toast(`New move learned from ${[c.author_name, c.author_city].filter(Boolean).join(" · ")}`);
    }
  }

  // What the card says before the first nudge: the next thing you need to do.
  function idleView() {
    // Steps you need to take are shown bright; passive listening stays faint.
    if (!cap.inCallSince) return { text: "Join a call to start", source: "Then press C to turn on captions", action: true };
    if (!cap.region) return { text: "Press C to turn on captions", source: "Q listens through Meet's captions", action: true };
    if (!q.profile.trim()) return { text: "Listening for the buyer…", source: "Tip: add your company in the Q popup for sharper nudges" };
    return { text: "Listening for the buyer…", source: "Shift+D shows what Q hears · Shift+B to type a line" };
  }

  let shownIdle = "";
  function refreshIdle(force = false) {
    if (!q.idle) return;
    const v = idleView();
    const key = v.text + v.source;
    if (!force && key === shownIdle) return;
    shownIdle = key;
    showCue(v.text, { muted: !v.action, source: escapeHtml(v.source) });
  }

  function startNewCall() {
    q.askingOutcome = false;
    q.turns = [];
    q.shownCueIds = [];
    q.callStart = Date.now();
    q.recentNudges = [];
    cap.states = new WeakMap(); // captions already on screen belong to the old call
    if (cap.region) for (const b of captionBlocks(cap.region)) cap.states.set(b.key, { ignore: true });
    renderEnd("start");
    setBuyer(null);
    q.idle = true;
    refreshIdle(true);
    renderDebug();
  }

  // ---------- Drag, and remember where it was left ----------
  function placeAt(left, top) {
    const r = host.getBoundingClientRect();
    const x = Math.min(Math.max(8, left), window.innerWidth - r.width - 8);
    const y = Math.min(Math.max(8, top), window.innerHeight - r.height - 8);
    Object.assign(host.style, { left: `${x}px`, top: `${y}px`, right: "auto" });
    return { left: x, top: y };
  }

  card.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest("button, input")) return;
    const r = host.getBoundingClientRect();
    const dx = e.clientX - r.left;
    const dy = e.clientY - r.top;
    card.setPointerCapture(e.pointerId);
    card.classList.add("dragging");
    let pos = { left: r.left, top: r.top };
    const move = (ev) => (pos = placeAt(ev.clientX - dx, ev.clientY - dy));
    const up = () => {
      card.removeEventListener("pointermove", move);
      card.classList.remove("dragging");
      chrome.storage.local.set({ qPos: pos });
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up, { once: true });
    card.addEventListener("pointercancel", up, { once: true });
  });

  window.addEventListener("resize", () => {
    if (host.style.left) placeAt(parseFloat(host.style.left), parseFloat(host.style.top));
  });

  // ---------- Settings from the popup ----------
  function applySettings(s) {
    if ("enabled" in s) q.enabled = s.enabled !== false;
    for (const k of ["name", "city", "brief", "profile"]) if (k in s) q[k] = s[k] || "";
    host.hidden = !q.enabled;
    if ("callLength" in s) q.callLength = Number(s.callLength) || 15;
    if ("profile" in s) refreshIdle();
  }
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    const s = {};
    for (const [k, v] of Object.entries(changes)) s[k] = v.newValue;
    applySettings(s);
  });

  // ---------- Start ----------
  async function start() {
    await loadStyles();
    const saved = await chrome.storage.local.get(["enabled", "name", "city", "brief", "profile", "callLength", "qPos"]);
    applySettings({ enabled: saved.enabled ?? true, ...saved });
    document.documentElement.appendChild(host);
    if (saved.qPos) placeAt(saved.qPos.left, saved.qPos.top);
    startNewCall();
    refreshStatus();
    api("/api/cue").then((r) => {
      q.error = !r.ok; // warm up the backend so the first real nudge is quick, and spot it being down
      refreshStatus();
    });
    setInterval(tickCaptions, 200);
    pollUpdates();
    setInterval(pollUpdates, POLL_MS);
  }
  start();
})();
