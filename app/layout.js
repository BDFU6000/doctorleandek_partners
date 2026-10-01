import { Cairo } from "next/font/google";
import "./globals.css";
import { SITE } from "./site-config";
import LangGuard from "./components/LangGuard";

// Cairo is the sheet's typeface. next/font self-hosts it at build time, so this
// costs no external request and cannot be blocked by a strict CSP later.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE.partnersUrl),
  title: "دكتور لعندك | منصة رعاية صحية ليبية: طبيب ودواء وإسعاف في تطبيق واحد",
  description:
    "دكتور لعندك منصة رعاية صحية ليبية توصل الطبيب والممرض والدواء والإسعاف إلى باب المريض، عبر تطبيق واحد ومحفظة واحدة وسجل طبي واحد. تعرّف علينا وانضم كشريك.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "دكتور لعندك",
    locale: "ar_LY",
    url: "/",
    title: "دكتور لعندك | الرعاية الصحية تصل إلى بابك",
    description:
      "طبيب وممرض ودواء وإسعاف عبر تطبيق واحد ومحفظة واحدة وسجل طبي واحد.",
    images: [{ url: "/render/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "دكتور لعندك | الرعاية الصحية تصل إلى بابك",
    description:
      "طبيب وممرض ودواء وإسعاف عبر تطبيق واحد ومحفظة واحدة وسجل طبي واحد.",
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
    // suppressHydrationWarning covers this one element's attributes only, not
    // its children. Extensions rewrite lang/dir before hydration (see
    // LangGuard), and that is not a mismatch in our own render.
    <html
      lang="ar"
      dir="rtl"
      translate="no"
      className={cairo.className}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* The page is already Arabic for an Arabic audience; an automatic
            translation pass is what flips lang and dir in the first place. */}
        <meta name="google" content="notranslate" />
        {/* The scroll-reveal system starts every animated element at zero
            opacity, which is correct only if the script that reveals them can
            run. Without JavaScript there is no observer and the page would be
            blank, so this hands the content straight back. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <LangGuard />
        {children}
      </body>
    </html>
  );
}
