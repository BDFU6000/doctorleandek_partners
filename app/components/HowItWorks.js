"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import s from "./HowItWorks.module.css";
import { IconCheck } from "../icons";

/* ─────────────────────────────────────────────────────────────────────────────
   "كيف تعمل", built for right to left reading, shown with the app's own
   screens.

   Desktop: the steps sit on the RIGHT, where an Arabic reader starts, with
   their progress rail on the right edge filling downward. The phone sits on
   the LEFT and is sticky: it shows the real screen for whichever step you are
   reading, with a floating card quoting that screen (Bevel's pattern). Each
   step carries a tag and short chips (Function Health's pattern).

   Phone: the sticky phone is dropped and every step carries its own screen
   under its text, so nothing depends on scroll position.

   The screens are frames of the app's screen recording, cleaned by
   tools/make-how-shots.py. See the note on PATIENT_STEPS in app/content.js.
   ───────────────────────────────────────────────────────────────────────────── */

const idx = (n) => String(n).padStart(2, "0");

function Shot({ step, sizes, priority = false }) {
  return (
    <Image
      src={step.shot}
      alt={step.shotAlt}
      width={396}
      height={836}
      sizes={sizes}
      priority={priority}
      className={s.shot}
    />
  );
}

export default function HowItWorks({ steps }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  // The active step is the last one whose top has passed the reading line,
  // 45% down the viewport. Computed from positions on every scroll event
  // rather than with an IntersectionObserver: an observer only reports
  // crossings, so a jump (an anchor link, a fast fling) could skip a step and
  // leave the wrong one lit. Four rect reads per event is cheap, and React
  // skips the render when the index has not changed.
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.45;
      let next = 0;
      refs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) next = i;
      });
      setActive(next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={s.how}>
      <ol className={s.list}>
        {steps.map((st, i) => (
          <li
            key={st.title}
            ref={(el) => (refs.current[i] = el)}
            className={s.step}
            data-active={i === active ? "" : undefined}
            data-done={i < active ? "" : undefined}
          >
            <span className={s.dot}>{i + 1}</span>
            <span className={s.tag}>
              الخطوة {idx(i + 1)} <i /> {st.tag}
            </span>
            <h3>{st.title}</h3>
            <p>{st.text}</p>
            <ul className={s.chips}>
              {st.chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            {/* Phone layouts: the step's own screen, inline. */}
            <div className={s.inlineShot}>
              <div className={s.miniPhone}>
                <Shot step={st} sizes="(max-width: 900px) 240px, 1px" />
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Desktop: one sticky phone that follows the reader. The screens are
          stacked and cross-fade; all four load up front so a switch never
          waits on the network. */}
      <div className={s.stage} aria-hidden="true">
        <div className={s.stageInner}>
          <span className={s.glow} />
          <div className={s.phone}>
            {steps.map((st, i) => (
              <div key={st.shot} className={s.screen} data-on={i === active ? "" : undefined}>
                <Shot step={st} sizes="260px" priority={i === 0} />
              </div>
            ))}
          </div>
          {steps.map((st, i) => (
            <div key={st.toast} className={s.toast} data-on={i === active ? "" : undefined}>
              <span className={s.toastIcon}>
                <IconCheck />
              </span>
              <div>
                <small>دكتور لعندك · من التطبيق</small>
                <b>{st.toast}</b>
              </div>
            </div>
          ))}
          <div className={s.progress}>
            {steps.map((st, i) => (
              <i key={st.title} data-on={i <= active ? "" : undefined} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
