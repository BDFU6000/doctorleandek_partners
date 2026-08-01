"use client";

import { useEffect, useRef } from "react";

/* Depth on scroll: the element drifts against the page at a fraction of the
   scroll speed and tips very slightly in 3D as it crosses the viewport.

   The whole effect is two CSS custom properties written from one shared rAF
   loop — not a listener per element — and the loop only runs while at least one
   registered element is on screen. `speed` is deliberately small; anything past
   about 0.2 and the image visibly lags the text it belongs to, which reads as a
   rendering fault rather than as depth. */

export default function Parallax({ as: Tag = "div", speed = 0.12, tilt = 3, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = false;

    const frame = () => {
      raf = 0;
      if (!visible) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 when the element is entering from the bottom, +1 as it leaves the
      // top, 0 dead centre.
      const t = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
      el.style.setProperty("--par-y", `${(-t * speed * vh).toFixed(2)}px`);
      el.style.setProperty("--par-tilt", `${(t * tilt).toFixed(2)}deg`);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) request();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(el);

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    request();

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [speed, tilt]);

  return (
    <Tag ref={ref} className={`parallax ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
