import { Cairo } from "next/font/google";
import "./globals.css";
import { SITE } from "./site-config";

// Cairo is the sheet's typeface. next/font self-hosts it at build time, so this
// costs no external request and cannot be blocked by a strict CSP later.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE.partnersUrl),
  title: "انضم إلى دكتور لعندك | فرص للأطباء والصيدليات ومقدمي الخدمة في ليبيا",
  description:
    "سجّل كطبيب أو ممرض أو صيدلية أو مندوب توصيل أو سائق إسعاف في منصة دكتور لعندك، واستقبل طلبات الرعاية المنزلية والأدوية والطوارئ من تطبيق واحد.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "دكتور لعندك للشركاء",
    locale: "ar_LY",
    url: "/",
    title: "انضم إلى شبكة دكتور لعندك",
    description:
      "استقبل طلبات الزيارات المنزلية والأدوية والطوارئ، وأدر عملك من لوحة تحكم واحدة.",
    images: [{ url: "/render/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "انضم إلى شبكة دكتور لعندك",
    description:
      "استقبل طلبات الزيارات المنزلية والأدوية والطوارئ، وأدر عملك من لوحة تحكم واحدة.",
    images: ["/render/og.jpg"],
  },
  robots: { index: true, follow: true },
};

// Split from `metadata`: themeColor there has been deprecated since Next 14.
export const viewport = {
  // --t-900, the canvas. Same value the hero renders were generated on, so the
  // browser chrome, the page and the artwork are all one colour.
  themeColor: "#0C1B21",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    // `data-scroll-behavior` is required from Next 16 on: the router stopped
    // overriding a global `scroll-behavior: smooth` during navigation, and
    // without this attribute an in-app navigation would smooth-scroll to the
    // top instead of arriving there.
    <html lang="ar" dir="rtl" className={cairo.className} data-scroll-behavior="smooth">
      <head>
        {/* The scroll-reveal system starts every animated element at zero
            opacity, which is correct only if the script that reveals them can
            run. Without JavaScript there is no observer and the page would be
            blank, so this hands the content straight back. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
