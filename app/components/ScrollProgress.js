"use client";

import { useEffect } from "react";

/* A reading-progress rail across the top of the page.

   It writes one CSS custom property and lets the compositor scale the bar, so
   the scroll handler does no layout work. The read of `scrollY` and
   `scrollHeight` is coalesced into a rAF, because a passive scroll listener can
   fire many times per frame and there is no point measuring twice for one
   paint. */

export default function ScrollProgress() {
  useEffect(() => {
    const el = document.getElementById("scroll-progress");
    if (!el) return;

    let ticking = false;
    const measure = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
