"use client";

import { useId, useState } from "react";
import s from "./Faq.module.css";

/* The old markup was `<details>`, which cannot be animated open: the browser
   flips `display` and the panel appears instantly. This is the same interaction
   built from a button and a region so the height can be transitioned.

   The animation is `grid-template-rows: 0fr → 1fr`, which is the only way to
   animate to an unknown content height without measuring it in JS and without
   the max-height hack, where a guessed maximum makes short answers snap and
   long ones clip.

   Accessibility is not lost in the swap: the trigger is a real button with
   `aria-expanded`, the panel is labelled by it, and a closed panel is
   `hidden`-equivalent via `visibility` so it stays out of the tab order. */

export default function Faq({ items }) {
  const [open, setOpen] = useState(0);
  const uid = useId();

  return (
    <div className={s.list}>
      {items.map((f, i) => {
        const isOpen = open === i;
        const btnId = `${uid}-q${i}`;
        const panelId = `${uid}-a${i}`;
        return (
          <div key={f.q} className={s.item} data-open={isOpen ? "" : undefined} data-reveal="" style={{ "--i": i }}>
            <h3 className={s.head}>
              <button
                type="button"
                id={btnId}
                className={s.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{f.q}</span>
                <span className={s.sign} aria-hidden="true">
                  <i />
                  <i />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className={s.panel}>
              <div className={s.panelInner}>
                <p>{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
