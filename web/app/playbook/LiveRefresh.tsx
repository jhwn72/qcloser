"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Keeps the playbook live: checks for newly learned moves every few seconds and re-renders when one lands.
export default function LiveRefresh({ everyMs = 3000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    let since: string | null = null;
    const check = async () => {
      try {
        const r = await fetch(`/api/updates${since ? `?since=${encodeURIComponent(since)}` : ""}`);
        const d = await r.json();
        const changed = since !== null && (d.cues?.length || d.insights?.length);
        since = d.now ?? since;
        if (changed) router.refresh();
      } catch {}
    };
    check();
    const id = setInterval(check, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs]);
  return null;
}
