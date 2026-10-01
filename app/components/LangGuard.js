"use client";

import { useEffect } from "react";

/**
 * Keeps <html lang="ar" dir="rtl"> true after load.
 *
 * Translation and reader extensions (and Chrome's own translate bar in some
 * profiles) rewrite these two attributes to en/ltr before React hydrates. The
 * layout survives that, because globals.css sets `direction: rtl` on html and
 * body, but `lang="en"` on Arabic text is still wrong for screen readers and
 * search engines. So whenever something rewrites them, they are put back. The
 * Tamayoz site uses the same guard.
 */
export default function LangGuard() {
  useEffect(() => {
    const html = document.documentElement;
    const fix = () => {
      if (html.lang !== "ar") html.lang = "ar";
      if (html.dir !== "rtl") html.dir = "rtl";
    };
    fix();
    const mo = new MutationObserver(fix);
    mo.observe(html, { attributes: true, attributeFilter: ["lang", "dir"] });
    return () => mo.disconnect();
  }, []);
  return null;
}
