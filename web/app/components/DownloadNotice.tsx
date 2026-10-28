"use client";

import { useEffect, useRef, useState } from "react";
import { LIVE_AI_PAUSED, PROJECT_URL } from "@/lib/paused";

// While the live AI is paused, any link to the extension download opens this notice first.
// "Download anyway" then starts the same download.
export default function DownloadNotice() {
  const [href, setHref] = useState<string | null>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!LIVE_AI_PAUSED) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!link || link.hasAttribute("data-skip-notice")) return;
      const url = link.getAttribute("href") || "";
      if (!url.includes("q-extension.zip")) return;
      e.preventDefault();
      setHref(url);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!href) return;
    downloadRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setHref(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [href]);

  if (!href) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={() => setHref(null)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-notice-title"
        className="q-card relative w-full"
        style={{ maxWidth: 420, padding: "22px 22px 20px", background: "rgb(20, 20, 20)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setHref(null)}
          className="absolute"
          style={{ top: 12, right: 14, color: "var(--tg-muted)", fontSize: 20, lineHeight: 1, background: "none", border: 0, cursor: "pointer" }}
        >
          ×
        </button>
        <div className="flex items-center gap-2">
          <span className="tg-orb" style={{ background: "rgb(255, 205, 160)", width: 7, height: 7 }} aria-hidden />
          <h2 id="download-notice-title" style={{ font: "400 19px/1.3 var(--tg-font)", color: "var(--tg-text)", margin: 0 }}>
            Heads up: Q&rsquo;s AI is paused
          </h2>
        </div>
        <p className="tg-body mt-3" style={{ color: "var(--tg-text-soft)", margin: "12px 0 0" }}>
          Q won 1st place in Grand Tech at SEP Hacks 2026, and its live AI is switched off for now. You can still install
          it and look around, but the card won&rsquo;t give nudges on calls.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            ref={downloadRef}
            className="tg-btn primary"
            href={href}
            download
            data-skip-notice
            onClick={() => setTimeout(() => setHref(null), 0)}
          >
            Download anyway
          </a>
          <a className="tg-btn" href={PROJECT_URL}>
            See the project
          </a>
        </div>
      </div>
    </div>
  );
}
