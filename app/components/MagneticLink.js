"use client";

import { useEffect, useRef } from "react";

/* A call to action that leans toward the cursor as it approaches, and snaps
   back when it leaves. The pull is capped at a few pixels: enough that the
   button feels alive, small enough that the hit target never moves out from
   under a click, which is the failure mode of every overdone version of this.

   Pointer-fine only, and off under reduced motion. */

export default function MagneticLink({ href, className = "", strength = 9, children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rect = null;
    const enter = () => { rect = el.getBoundingClientRect(); };
    const move = (e) => {
      if (!rect) return;
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      el.style.setProperty("--pull-x", `${Math.max(-1, Math.min(1, dx)) * strength}px`);
      el.style.setProperty("--pull-y", `${Math.max(-1, Math.min(1, dy)) * strength * 0.6}px`);
      el.style.setProperty("--sheen-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    };
    const leave = () => {
      rect = null;
      el.style.setProperty("--pull-x", "0px");
      el.style.setProperty("--pull-y", "0px");
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <a ref={ref} href={href} className={`magnetic ${className}`} {...rest}>
      <span className="magneticLabel">{children}</span>
    </a>
  );
}
