// The popup: who you are, your company, a brief for the next call, and the on/off switch.
// Everything saves as you type into chrome.storage.local, and the card on Meet picks it up live.
const FIELDS = ["name", "city", "profile", "brief"];
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
  const s = await chrome.storage.local.get([...FIELDS, "enabled", "callLength"]);
  for (const f of FIELDS) document.getElementById(f).value = s[f] || "";
  setToggle(s.enabled !== false);

  for (const f of FIELDS) {
    let t;
    document.getElementById(f).addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => chrome.storage.local.set({ [f]: e.target.value }).then(flashSaved), 250);
    });
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

  document.getElementById("clear-brief").addEventListener("click", () => {
    document.getElementById("brief").value = "";
    chrome.storage.local.set({ brief: "" }).then(flashSaved);
  });

  document.getElementById("playbook").addEventListener("click", () => {
    chrome.tabs.create({ url: `${self.Q_CONFIG.BACKEND_URL}/playbook` });
  });
}
init();
