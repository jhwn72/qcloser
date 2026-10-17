"use client";

import { useEffect, useRef, useState } from "react";

// Counts up to a number once it scrolls into view. Shows the final number right away for reduced motion.
export default function CountUp({ to, prefix = "", suffix = "", decimals = 0, ms = 1400 }: { to: number; prefix?: string; suffix?: string; decimals?: number; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (still) return setN(to);
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / ms);
        setN(to * (1 - Math.pow(1 - p, 3))); // ease out
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, ms]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}
