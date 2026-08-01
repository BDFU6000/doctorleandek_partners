"use client";

import { useEffect, useRef, useState } from "react";

/* Counts a stat up when it first scrolls into view.

   Two details that matter for an Arabic page:

   1. The digits render as Arabic-Indic (٠..٩) to match the hand-set numerals
      already on the page. Rather than convert per frame, the component holds a
      number in state and formats with `ar-EG`, which is what Intl is for.
   2. The final value is in the server-rendered HTML, not zero. A crawler, a
      reader with JS off, and the moment before hydration all show the real
      number — the animation only ever replaces a correct value with the same
      correct value.  */

const fmt = new Intl.NumberFormat("ar-EG", { useGrouping: false });

export default function CountUp({ to, suffix = "", duration = 1100 }) {
  const [value, setValue] = useState(to);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          // easeOutExpo: fast out of the gate, long settle. A linear count
          // looks like a loading spinner; this looks like a tally landing.
          const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setValue(Math.round(to * e));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        setValue(0);
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref}>
      {fmt.format(value)}
      {suffix}
    </span>
  );
}
