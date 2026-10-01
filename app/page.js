import Image from "next/image";
import s from "./page.module.css";
import { SITE } from "./site-config";
import OrbitScene from "./components/OrbitScene";
import SiteNav from "./components/SiteNav";
import Reveal from "./components/Reveal";
import TiltCard from "./components/TiltCard";
import MagneticLink from "./components/MagneticLink";
import CountUp from "./components/CountUp";
import StatScene from "./components/StatScene";
import Parallax from "./components/Parallax";
import ScrollProgress from "./components/ScrollProgress";
import Faq from "./components/Faq";
import HowItWorks from "./components/HowItWorks";
import { getPlatformStats } from "./lib/stats";
import {
  COMPANY,
  HERO_FACTS,
  ABOUT,
  VISION,
  SERVICES,
  CHAIN,
  PATIENT_STEPS,
  ROLES,
  PARTNER_BENEFITS,
  TRUST,
  ROADMAP,
  FAQ,
  COUNTERS,
  PROFILE_PDF,
} from "./content";
import {
  IconStethoscope,
  IconPharmacy,
  IconBox,
  IconScooter,
  IconAmbulance,
  IconCheck,
  IconCrescent,
  IconHome,
  IconWallet,
  IconRecord,
  IconPhone,
  IconChat,
  IconDownload,
  IconArrow,
} from "./icons";

// Latin digits, not Arabic-Indic. Both are correct Arabic typography; Libya
// and the Maghreb generally set Latin numerals ("الأرقام الغبارية"), while the
// Mashriq sets ٠١٢. The whole page uses one set, so the index numerals, the
// step numbers and the counters all agree.
const idx = (n) => String(n).padStart(2, "0");

// Icons live here rather than in content.js, so the content file stays plain
// data that the printable profile can read too.
const SERVICE_ICON = {
  visit: <IconHome />,
  pharmacy: <IconPharmacy />,
  delivery: <IconScooter />,
  emergency: <IconAmbulance />,
};
const ROLE_ICON = {
  medical: <IconStethoscope />,
  pharmacy: <IconPharmacy />,
  staff: <IconBox />,
  courier: <IconScooter />,
  ambulance: <IconAmbulance />,
};
const CHAIN_ICON = [<IconHome key="a" />, <IconRecord key="b" />, <IconPharmacy key="c" />, <IconScooter key="d" />, <IconRecord key="e" />];

// The marquee needs its list twice for a seamless loop. It names every service
// and every partner role the page goes on to describe.
const TICKER_ITEMS = [
  ...SERVICES.map((x) => ({ key: `s-${x.key}`, icon: SERVICE_ICON[x.key], title: x.title })),
  ...ROLES.map((x) => ({ key: `r-${x.key}`, icon: ROLE_ICON[x.key], title: x.title })),
];
const TICKER = [...TICKER_ITEMS, ...TICKER_ITEMS];


/* Latin numerals inside an Arabic date, in Tripoli time. */
const stampFmt = new Intl.DateTimeFormat("ar-LY-u-nu-latn", {
  timeZone: "Africa/Tripoli",
  dateStyle: "medium",
  timeStyle: "short",
});

function stamp(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : stampFmt.format(d);
}

/** Section label: index numeral, caption, hairline. */
function Label({ no, children, mid = false }) {
  return (
    <div className={`label ${mid ? "labelMid" : ""}`} data-reveal="fade">
      {mid ? <i aria-hidden="true" /> : null}
      <b>{idx(no)}</b>
      <span>{children}</span>
      <i aria-hidden="true" />
    </div>
  );
}

function Checks({ items }) {
  return (
    <ul className={s.checks}>
      {items.map((t, i) => (
        <li key={t} data-reveal="" style={{ "--i": i + 2 }}>
          <IconCheck />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProfilePage() {
  // Live counts, read on the server. Null means the backend did not answer,
  // and the numbers section is then not rendered at all (see lib/stats.js).
  const stats = await getPlatformStats();
  const updated = stats ? stamp(stats.updatedAt) : null;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: COMPANY.name,
      description: COMPANY.oneLine,
      url: SITE.partnersUrl,
      areaServed: "LY",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: COMPANY.phone,
        contactType: "customer support",
        availableLanguage: "Arabic",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      {/* JSON-LD data blocks, not executed script, so a strict CSP does not
          block them and crawlers read them straight out of the served HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <a className="skipLink" href="#about">
        تخطّي إلى المحتوى
      </a>
      <div id="scroll-progress" aria-hidden="true" />
      <ScrollProgress />
      <SiteNav />

      <Reveal>
        {/* ── Hero: who we are ─────────────────────────────────────────── */}
        <div className={s.stage} id="top">
          <span className={`rings ${s.stageRings}`} aria-hidden="true" />
          <div className={`wrap ${s.stageInner}`}>
            <header className={s.hero}>
              <div className={s.heroCopy}>
                <span className="eyebrow" data-reveal="fade">
                  <i /> منصة رعاية صحية ليبية
                </span>
                <h1 className="pageTitle" data-reveal="rise" style={{ "--i": 1 }}>
                  الرعاية الصحية
                  <br />
                  <span className={s.heroAccent}>تصل إلى بابك</span>
                </h1>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 2 }}>
                  {COMPANY.oneLine}
                </p>
                <div className={s.heroCtas} data-reveal="" style={{ "--i": 3 }}>
                  <MagneticLink className="btn btnPrimary" href={SITE.appUrl}>
                    افتح التطبيق
                  </MagneticLink>
                  <MagneticLink className="btn btnGhost" href="#partners">
                    انضم كشريك
                  </MagneticLink>
                </div>
                <div className={s.stats} data-reveal="" style={{ "--i": 4 }}>
                  {HERO_FACTS.map((f) => (
                    <div key={f.label} className={s.stat}>
                      <b>
                        <CountUp to={f.value} />
                      </b>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* The emblem is the page's one focal object, with the WebGL
                  orbit mounted inside it: five satellites, one per partner
                  role, converging on the mark. */}
              <Parallax className={s.heroArt} speed={0.05} tilt={2} data-reveal="scale" style={{ "--i": 2 }}>
                <div className={s.heroEmblem}>
                  <span className={s.heroGlow} aria-hidden="true" />
                  <Image
                    src="/render/hero-doctor.webp"
                    alt="طبيب دكتور لعندك مجسّمًا بأسلوب ثلاثي الأبعاد، يحمل لوحًا طبيًا ويحيط به خاتم معدني"
                    width={928}
                    height={1152}
                    priority
                    sizes="(max-width: 900px) 66vw, 38vw"
                  />
                  <OrbitScene />
                  <div className={s.heroBadge}>
                    <IconCrescent /> طبيب، دواء، إسعاف، في تطبيق واحد
                  </div>
                </div>
              </Parallax>
            </header>
          </div>

          <div className={`marquee ${s.ticker}`} aria-hidden="true">
            <div className="marqueeTrack">
              {TICKER.map((r, i) => (
                <span key={`${r.key}-${i}`} className={s.tickerItem}>
                  {r.icon}
                  {r.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Live numbers ─────────────────────────────────────────────── */}
        {stats && (
          <section id="numbers" className={`${s.bandA} section`}>
            <div className="wrap">
              <div className="sectionHead mid">
                {/* An eyebrow rather than an indexed Label: this section is
                    conditional on the backend answering, and a numeral that
                    shifts depending on a fetch is not an index. */}
                <span className="eyebrow" data-reveal="fade">
                  <i /> المنصة اليوم
                </span>
                <h2 className="sectionTitle" data-reveal="">
                  أرقام <span className="accent">من قاعدة البيانات</span>
                </h2>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                  أرقام حقيقية من المنصة نفسها، لا تقديرات، وتُحدَّث تلقائيًا
                  على مدار اليوم.
                </p>
              </div>

              <div className={s.counters}>
                {COUNTERS.map((c, i) => (
                  <TiltCard key={c.key} max={4} className={s.counter} data-reveal="" style={{ "--i": i }}>
                    <span className={s.counterGlow} aria-hidden="true" />
                    <StatScene model={c.model} phase={i * 1.7} />
                    <b className={s.counterValue}>
                      <CountUp to={stats[c.key]} />
                    </b>
                    <h3 className={s.counterUnit}>{c.unit}</h3>
                    <p className={s.counterNote}>{c.note}</p>
                  </TiltCard>
                ))}
              </div>

              {updated && (
                <p className={s.countersMeta} data-reveal="fade">
                  آخر تحديث للأرقام: {updated}
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── 01 About: the problem and our answer ─────────────────────── */}
        <section id="about" className={`${s.bandB} section`}>
          <div className="aurora" aria-hidden="true" />
          <div className="wrap">
            <div className="sectionHead">
              <Label no={1}>من نحن</Label>
              <h2 className="sectionTitle" data-reveal="">
                رعاية لا تعتمد على <span className="accent">من تعرف</span>
              </h2>
            </div>

            <div className={s.about}>
              <div className={s.aboutStory}>
                <blockquote className={s.quote} data-reveal="">
                  <IconCrescent />
                  <p>{ABOUT.quote}</p>
                </blockquote>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                  {ABOUT.lead}
                </p>
                <p className={s.idea} data-reveal="" style={{ "--i": 2 }}>
                  الفكرة كلها: {COMPANY.idea}
                </p>
              </div>

              <div className={s.aboutSide}>
                <div className={s.problemCard} data-reveal="" style={{ "--i": 1 }}>
                  <h3>ما الذي يحدث اليوم</h3>
                  <ol>
                    {ABOUT.problems.map((p, i) => (
                      <li key={p}>
                        <b>{idx(i + 1)}</b>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className={s.answerCard} data-reveal="" style={{ "--i": 2 }}>
                  <h3>{ABOUT.answerTitle}</h3>
                  <p>{ABOUT.answer}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 Vision, mission, values ───────────────────────────────── */}
        <section id="vision" className={`${s.bandA} section`}>
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={2} mid>
                الرؤية والرسالة
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                من دقائق، <span className="accent">لا من أيام</span>
              </h2>
            </div>

            <div className={s.vmGrid}>
              <article className={s.vmCard} data-reveal="">
                <span className={s.vmTag}>الرؤية</span>
                <p>{VISION.vision}</p>
              </article>
              <article className={s.vmCard} data-reveal="" style={{ "--i": 1 }}>
                <span className={s.vmTag}>الرسالة</span>
                <p>{VISION.mission}</p>
              </article>
            </div>

            <h3 className={s.subHead} data-reveal="">قيمنا</h3>
            <div className={s.benefits}>
              {VISION.values.map((b, i) => (
                <article key={b.title} className={s.benefit} data-reveal="" style={{ "--i": i }}>
                  <span className={s.benefitNo}>{idx(i + 1)}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 Services + the chain ──────────────────────────────────── */}
        <section id="services" className={`${s.bandB} section`}>
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={3} mid>
                خدماتنا
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                أربع خدمات، <span className="accent">تطبيق واحد</span>
              </h2>
              <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                كل ما يحتاجه المريض من لحظة شعوره بالتعب حتى يصله الدواء.
              </p>
            </div>

            <div className={s.services}>
              {SERVICES.map((x, i) => (
                <TiltCard
                  key={x.key}
                  max={4}
                  className={`${s.role} ${s.service} ${x.urgent ? s.urgent : ""}`}
                  data-reveal=""
                  style={{ "--i": i }}
                >
                  <div className={s.roleTop}>
                    <div className={s.roleIcon}>{SERVICE_ICON[x.key]}</div>
                    <span className={s.roleNo}>{idx(i + 1)}</span>
                  </div>
                  <h3>{x.title}</h3>
                  <p>{x.text}</p>
                </TiltCard>
              ))}
            </div>

            <div className={`${s.split} ${s.chainSplit}`}>
              <div className={s.splitTxt}>
                <h3 className="sectionTitle" data-reveal="">
                  الحلقات <span className="accent">تعرف بعضها</span>
                </h3>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                  {CHAIN.lead}
                </p>
                <ol className={s.chain} data-reveal="" style={{ "--i": 2 }}>
                  {CHAIN.links.map((l, i) => (
                    <li key={l}>
                      <span className={s.chainNode}>
                        {CHAIN_ICON[i]}
                        {l}
                      </span>
                      {i < CHAIN.links.length - 1 && (
                        <span className={s.chainArrow} aria-hidden="true">
                          <IconArrow />
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                <div className={s.chainPoints}>
                  {CHAIN.points.map((p, i) => (
                    <div key={p.title} className={s.chainPoint} data-reveal="" style={{ "--i": i + 3 }}>
                      {i === 2 ? <IconWallet /> : <IconCheck />}
                      <div>
                        <h4>{p.title}</h4>
                        <p>{p.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Parallax className={s.splitArt} speed={0.09} data-reveal="scale">
                <span className={s.splitGlow} aria-hidden="true" />
                <Image
                  src="/render/request-flow.webp"
                  alt="هاتف زجاجي مجسّم تطفو أمامه بطاقتا طلب، يرمزان لانتقال الطلب بين حلقات الخدمة"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 900px) 74vw, 44vw"
                />
              </Parallax>
            </div>
          </div>
        </section>

        {/* ── 04 How it works for a patient ────────────────────────────── */}
        <section id="how" className={`${s.bandA} section`}>
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={4} mid>
                كيف تعمل
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                أربع خطوات{" "}
                <span className="accent">{"حتى تصلك الرعاية"}</span>
              </h2>
            </div>
            {/* Steps on the right with a rail, a sticky phone on the left that
                shows each step's screen. See components/HowItWorks.js. */}
            <HowItWorks steps={PATIENT_STEPS} />
          </div>
        </section>

        {/* ── 05 Partners ──────────────────────────────────────────────── */}
        <section id="partners" className={`${s.bandB} section`}>
          <div className="aurora" aria-hidden="true" />
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={5} mid>
                شركاؤنا
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                خمسة حسابات، <span className="accent">خمس واجهات</span>
              </h2>
              <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                دكتور لعندك لا توظّف الأطباء ولا تملك الصيدليات ولا تشغّل
                سيارات الإسعاف. هي الطبقة التي تنظّم اللقاء بينهم وبين المريض،
                ولكل شريك واجهة مصمّمة لعمله.
              </p>
            </div>

            <div className={s.roles} data-reveal="">
              {ROLES.map((r, i) => (
                <TiltCard key={r.key} max={4} className={`${s.role} ${r.urgent ? s.urgent : ""}`}>
                  <div className={s.roleTop}>
                    <div className={s.roleIcon}>{ROLE_ICON[r.key]}</div>
                    <span className={s.roleNo}>{idx(i + 1)}</span>
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.lead}</p>
                  <ul className={s.roleList}>
                    {r.points.map((p) => (
                      <li key={p}>
                        <IconCheck />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </TiltCard>
              ))}
            </div>

            <h3 className={s.subHead} data-reveal="">لماذا ينضم الشركاء</h3>
            <div className={s.benefits}>
              {PARTNER_BENEFITS.map((b, i) => (
                <article key={b.title} className={s.benefit} data-reveal="" style={{ "--i": i }}>
                  <span className={s.benefitNo}>{idx(i + 1)}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </article>
              ))}
            </div>

            <div className={s.partnerCta} data-reveal="">
              <p>
                التسجيل لا يتطلب رسوم اشتراك. اختر نوع حسابك وأرسل بياناتك
                للمراجعة.
              </p>
              <MagneticLink className="btn btnPrimary" href={SITE.appUrl}>
                سجّل كشريك
              </MagneticLink>
            </div>
          </div>
        </section>

        {/* ── 06 Trust ─────────────────────────────────────────────────── */}
        <section id="trust" className={`${s.bandA} section`}>
          <div className="wrap">
            <div className={`${s.split} ${s.splitFlip}`}>
              <Parallax className={s.splitArt} speed={0.09} data-reveal="scale">
                <span className={s.splitGlow} aria-hidden="true" />
                <Image
                  src="/render/trust-shield.webp"
                  alt="درع زجاجي مجسّم بداخله قفل، يرمز إلى التحقق من المزودين وحماية السجل الطبي"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 900px) 74vw, 44vw"
                />
              </Parallax>
              <div className={s.splitTxt}>
                <Label no={6}>الثقة والخصوصية</Label>
                <h3 className="sectionTitle" data-reveal="">
                  موثوقة <span className="accent">من الطرفين</span>
                </h3>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                  {TRUST.statement}
                </p>
                <Checks items={TRUST.points} />
              </div>
            </div>
          </div>
        </section>

        {/* ── 07 Roadmap ───────────────────────────────────────────────── */}
        <section id="roadmap" className={`${s.bandB} section`}>
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={7} mid>
                ما القادم
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                خارطة <span className="accent">التطوير</span>
              </h2>
              <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                خطط معلنة نعمل عليها، وليست متاحة في التطبيق بعد.
              </p>
            </div>
            <div className={s.roadmap}>
              {ROADMAP.map((r, i) => (
                <article key={r.title} className={s.roadItem} data-reveal="" style={{ "--i": i }}>
                  <span className={s.soon}>قريبًا</span>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 08 FAQ ───────────────────────────────────────────────────── */}
        <section id="faq" className={`${s.bandA} section`}>
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={8} mid>
                أسئلة شائعة
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                ما يسأل عنه <span className="accent">الناس</span>
              </h2>
            </div>
            <Faq items={FAQ} />
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────────────────── */}
        <section id="contact" className={`${s.bandB} ${s.finalWrap} section`}>
          <div className="aurora" aria-hidden="true" />
          <div className="wrap">
            <div className={s.finalPanel}>
              <span className={`rings ${s.finalRings}`} aria-hidden="true" />
              {/* The Red Crescent, closing the page: the correct medical mark
                  for a Libyan audience, and the one place --danger is large. */}
              <Parallax className={s.finalMark} speed={0.06} data-reveal="scale">
                <span className={s.finalGlow} aria-hidden="true" />
                <Image
                  src="/render/red-crescent.webp"
                  alt="الهلال الأحمر مجسّمًا، رمز الخدمات الطبية والطوارئ"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 900px) 46vw, 260px"
                />
              </Parallax>
              <h2 className="sectionTitle" data-reveal="" style={{ "--i": 1 }}>
                تواصل <span className="accent">معنا</span>
              </h2>
              <p className="bodyLarge" data-reveal="" style={{ "--i": 2 }}>
                مريضًا كنت أو مقدّم خدمة أو جهة تريد أن تعرف عنا أكثر، فريق
                الدعم يرد عليك هاتفيًا وعلى واتساب.
              </p>
              <div className={s.contactRow} data-reveal="" style={{ "--i": 3 }}>
                <a className={s.contactChip} href={`tel:${COMPANY.phone}`}>
                  <IconPhone />
                  <span dir="ltr">{COMPANY.phoneDisplay}</span>
                </a>
                <a className={s.contactChip} href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer">
                  <IconChat />
                  واتساب
                </a>
              </div>
              <div className={s.finalCtas} data-reveal="" style={{ "--i": 4 }}>
                <MagneticLink className="btn btnPrimary" href={SITE.appUrl}>
                  افتح التطبيق
                </MagneticLink>
                <MagneticLink className="btn btnGhost" href={PROFILE_PDF}>
                  <IconDownload /> الملف التعريفي PDF
                </MagneticLink>
              </div>
            </div>
          </div>
        </section>

        <footer className={s.footer}>
          <div className="wrap">
            <div className={s.footerGrid}>
              <div className={s.footerBrand}>
                <span className={s.footerName}>{COMPANY.name}</span>
                <p>{COMPANY.oneLine}</p>
              </div>
              <div className={s.footerCol}>
                <h4>الصفحة</h4>
                <a href="#about">من نحن</a>
                <a href="#services">خدماتنا</a>
                <a href="#partners">شركاؤنا</a>
                <a href="#faq">أسئلة شائعة</a>
              </div>
              <div className={s.footerCol}>
                <h4>روابط</h4>
                <a href={SITE.appUrl}>فتح التطبيق</a>
                <a href={SITE.appUrl}>تسجيل حساب شريك</a>
                <a href={PROFILE_PDF}>الملف التعريفي PDF</a>
              </div>
              <div className={s.footerCol}>
                <h4>تواصل</h4>
                <a href={`tel:${COMPANY.phone}`} dir="ltr" className={s.footerPhone}>
                  {COMPANY.phoneDisplay}
                </a>
                <a href={COMPANY.whatsapp} target="_blank" rel="noopener noreferrer">
                  واتساب
                </a>
              </div>
            </div>
            <div className={`${s.footerBar} bodySm`}>
              <span>
                {COMPANY.name} · {COMPANY.tagline}
              </span>
              <span>{COMPANY.country}</span>
            </div>
          </div>
        </footer>
      </Reveal>

      {/* On a phone the header CTA is dropped for room, so the primary action
          returns as a bar pinned to the thumb. */}
      <div className={s.mobileBar}>
        <a className="btn btnPrimary btnFull" href={SITE.appUrl}>
          افتح التطبيق
        </a>
      </div>
    </>
  );
}
