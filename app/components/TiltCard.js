"use client";

import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Pointer-parallax card: real perspective, a specular sweep that tracks the
   cursor, and children lifted off the surface on the Z axis.

   Three things keep it from being the janky version of this effect:
   · the pointer handler only writes CSS custom properties and never reads
     layout, so it cannot force a synchronous reflow mid-scroll
   · the rect is measured on enter, not on every move
   · `(hover: hover)` gates it entirely — a touch device gets a flat card, since
     a tilt driven by a finger that is covering the card is pointless
   ───────────────────────────────────────────────────────────────────────────── */

export default function TiltCard({
  as: Tag = "article",
  className = "",
  max = 7,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rect = null;

    const enter = () => {
      rect = el.getBoundingClientRect();
      el.setAttribute("data-tilting", "");
    };
    const move = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    };
    const leave = () => {
      rect = null;
      el.removeAttribute("data-tilting");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);

  return (
    <Tag ref={ref} className={`tilt ${className}`} {...rest}>
      <span className="tiltGlare" aria-hidden="true" />
      {children}
    </Tag>
  );
}
