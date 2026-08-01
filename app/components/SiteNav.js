"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "../site-config";
import s from "./SiteNav.module.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Fixed header with three jobs the old inline nav did not do:

   · it stays reachable — on a long page, a link bar that scrolled away two
     screens ago is not navigation
   · it says where you are — the section observer underlines the current one
   · it works on a phone — the previous version wrapped its five links onto
     three lines under the logo, which is a menu only by accident

   It starts transparent over the hero gradient and fades to glass on scroll,
   so it never looks like a bar bolted across the artwork.
   ───────────────────────────────────────────────────────────────────────────── */

const LINKS = [
  { href: "#roles", label: "من ينضم إلينا" },
  { href: "#benefits", label: "لماذا المنصة" },
  { href: "#how", label: "خطوات الانضمام" },
  { href: "#faq", label: "أسئلة شائعة" },
];

export default function SiteNav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    if (!targets.length) return;
    // The top band is discounted so a section only counts as "current" once it
    // is genuinely occupying the screen rather than just peeking under the bar.
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("a")?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className={s.bar} data-stuck={stuck ? "" : undefined}>
        <div className={`wrap ${s.inner}`}>
          <a className={s.brand} href="#top">
            <span className={s.mark} aria-hidden="true">
              <i />
              <i />
            </span>
            <span className={s.brandText}>
              <span className={s.brandName}>دكتور لعندك</span>
              <span className={s.brandTag}>صحتك تهمنا</span>
            </span>
          </a>

          <nav className={s.links} aria-label="أقسام الصفحة">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={s.link}
                data-active={active === l.href ? "" : undefined}
                aria-current={active === l.href ? "true" : undefined}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className={s.actions}>
            <a className={s.ghostCta} href={SITE.mainUrl}>
              موقع المرضى
            </a>
            <a className={s.solidCta} href={SITE.appUrl}>
              سجّل الآن
            </a>
            <button
              type="button"
              className={s.burger}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={s.scrim}
        data-open={open ? "" : undefined}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div id="site-menu" ref={panelRef} className={s.panel} data-open={open ? "" : undefined}>
        <nav aria-label="القائمة">
          {LINKS.map((l, i) => (
            <a key={l.href} href={l.href} style={{ "--i": i }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            href={SITE.mainUrl}
            style={{ "--i": LINKS.length }}
            onClick={() => setOpen(false)}
          >
            موقع المرضى
          </a>
        </nav>
        <a className={`btn btnLight btnFull ${s.panelCta}`} href={SITE.appUrl}>
          سجّل حسابك الآن
        </a>
      </div>
    </>
  );
}
