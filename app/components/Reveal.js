"use client";

import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Scroll reveal.

   One IntersectionObserver for the whole page rather than one per element: a
   long landing page has fifty-odd revealed nodes, and fifty observers is fifty
   sets of callbacks the browser has to keep alive. Elements unobserve
   themselves once they have played, because a reveal that replays on the way
   back up reads as a glitch, not as polish.

   The styling lives in globals.css under `[data-reveal]` so a server component
   can opt in with a plain attribute and no wrapper element at all.
   ───────────────────────────────────────────────────────────────────────────── */

let observer = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      }
    },
    // Fires a little before the element is fully in view, so the animation is
    // finishing as it arrives rather than starting once it is already read.
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );
  return observer;
}

/**
 * Registers every `[data-reveal]` inside the subtree, including nodes added
 * later. Mount once, near the top of the page.
 */
export default function Reveal({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Reduced motion: mark everything revealed immediately. The content is the
    // point; the movement is not.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-revealed", ""));
      return;
    }

    const io = getObserver();
    const register = () =>
      root.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => io.observe(el));

    register();
    const mo = new MutationObserver(register);
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      root.querySelectorAll("[data-reveal]").forEach((el) => io.unobserve(el));
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
