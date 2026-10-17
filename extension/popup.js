// The popup: who you are, your company, who gets the moves Q learns from you, a brief for the next call,
// and the on/off switch. Everything saves as you type into chrome.storage.local, and the card on Meet picks it up live.
const FIELDS = ["name", "city", "org", "profile", "brief"];
const savedEl = document.getElementById("saved");
const toggle = document.getElementById("enabled");

let savedTimer;
function flashSaved() {
  savedEl.textContent = "Saved";
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => (savedEl.textContent = ""), 1200);
}

function setToggle(on) {
  toggle.classList.toggle("on", on);
  toggle.setAttribute("aria-checked", String(on));
}

async function init() {
  const s = await chrome.storage.local.get([...FIELDS, "enabled", "callLength", "share"]);
  for (const f of FIELDS) document.getElementById(f).value = s[f] || "";
  setToggle(s.enabled !== false);

  for (const f of FIELDS) {
    let t;
    const el = document.getElementById(f);
    el.addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => chrome.storage.local.set({ [f]: e.target.value }).then(flashSaved), 250);
    });
    el.addEventListener("change", () => chrome.storage.local.set({ [f]: el.value })); // closing the popup mid-typing
  }

  const flip = () => {
    const on = !toggle.classList.contains("on");
    setToggle(on);
    chrome.storage.local.set({ enabled: on }).then(flashSaved);
  };
  toggle.addEventListener("click", flip);
  toggle.addEventListener("keydown", (e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), flip()));

  // Call length: one of 10, 15, 30, 45 minutes (15 by default)
  const lengthEl = document.getElementById("callLength");
  const showLength = (min) => {
    for (const el of lengthEl.children) {
      const on = Number(el.dataset.min) === min;
      el.classList.toggle("on", on);
      el.setAttribute("aria-checked", String(on));
    }
  };
  showLength(Number(s.callLength) || 15);
  lengthEl.addEventListener("click", (e) => {
    const min = Number(e.target.closest("[data-min]")?.dataset.min);
    if (!min) return;
    showLength(min);
    chrome.storage.local.set({ callLength: min }).then(flashSaved);
  });

  // Sharing: moves Q learns from your wins go to everyone ("public", earns royalties) or stay with your company ("org")
  const shareEl = document.getElementById("share");
  const shareHint = document.getElementById("share-hint");
  const orgEl = document.getElementById("org");
  let share = s.share === "org" ? "org" : "public";
  const showShare = () => {
    for (const el of shareEl.children) {
      const on = el.dataset.share === share;
      el.classList.toggle("on", on);
      el.setAttribute("aria-checked", String(on));
      el.tabIndex = on ? 0 : -1;
    }
    const org = orgEl.value.trim();
    shareHint.textContent =
      share === "public"
        ? "Joins the shared playbook, credited to you. Royalties start after launch."
        : org
          ? `Stays with your team at ${org}. Private moves don't earn royalties.`
          : "Add your company name above so your moves stay with your team.";
  };
  const pickShare = (value) => {
    if (value === share) return;
    share = value;
    showShare();
    chrome.storage.local.set({ share }).then(flashSaved);
  };
  showShare();
  shareEl.addEventListener("click", (e) => {
    const value = e.target.closest("[data-share]")?.dataset.share;
    if (value) pickShare(value);
  });
  shareEl.addEventListener("keydown", (e) => {
    if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      pickShare(share === "public" ? "org" : "public");
      shareEl.querySelector(".on").focus();
    } else if (e.key === " " || e.key === "Enter") {
      const value = e.target.dataset?.share;
      if (value) (e.preventDefault(), pickShare(value));
    }
  });
  orgEl.addEventListener("input", showShare);

  document.getElementById("clear-brief").addEventListener("click", () => {
    document.getElementById("brief").value = "";
    chrome.storage.local.set({ brief: "" }).then(flashSaved);
  });

  document.getElementById("playbook").addEventListener("click", () => {
    chrome.tabs.create({ url: `${self.Q_CONFIG.BACKEND_URL}/playbook` });
  });
}
init();
