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
    images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "انضم إلى شبكة دكتور لعندك",
    description:
      "استقبل طلبات الزيارات المنزلية والأدوية والطوارئ، وأدر عملك من لوحة تحكم واحدة.",
    images: ["/img/og.jpg"],
  },
  robots: { index: true, follow: true },
};

// Split from `metadata`: themeColor there has been deprecated since Next 14.
export const viewport = {
  themeColor: "#122331",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body>{children}</body>
    </html>
  );
}
