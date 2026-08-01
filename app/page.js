import Image from "next/image";
import s from "./page.module.css";
import { SITE } from "./site-config";
import OrbitScene from "./components/OrbitScene";
import SiteNav from "./components/SiteNav";
import Reveal from "./components/Reveal";
import TiltCard from "./components/TiltCard";
import MagneticLink from "./components/MagneticLink";
import CountUp from "./components/CountUp";
import Parallax from "./components/Parallax";
import ScrollProgress from "./components/ScrollProgress";
import Faq from "./components/Faq";
import {
  IconStethoscope,
  IconPharmacy,
  IconBox,
  IconScooter,
  IconAmbulance,
  IconCheck,
  IconCrescent,
} from "./icons";

// Latin digits, not Arabic-Indic. Both are correct Arabic typography — Libya
// and the Maghreb generally set Latin numerals ("الأرقام الغبارية"), while the
// Mashriq sets ٠١٢. The whole page uses one set, so the index numerals, the
// step numbers and the counters all agree.
const idx = (n) => String(n).padStart(2, "0");

// The five partner roles are the ones that actually exist in the app's UserType
// enum (lib/core/constants/enums.dart): medicalStaff, pharmacyAdmin,
// pharmacyEmployee, deliverer, ambulanceDriver. Nothing here advertises a role
// the product cannot actually create an account for.
const ROLES = [
  {
    key: "medical",
    icon: <IconStethoscope />,
    title: "الأطباء والممرضون",
    lead: "استقبل طلبات الزيارات المنزلية في المنطقة التي تخدمها، وأنت من يقرر متى تكون متاحًا.",
    points: [
      "طلبات زيارة تصلك حسب توفرك",
      "إدارة المواعيد والزيارات القائمة",
      "متابعة الأرباح من حسابك",
    ],
  },
  {
    key: "pharmacy",
    icon: <IconPharmacy />,
    title: "الصيدليات",
    lead: "استقبل طلبات الأدوية من المرضى القريبين منك، وسعّرها وأكّدها من لوحة الصيدلية.",
    points: [
      "استقبال طلبات الأدوية وتسعيرها",
      "إدارة المخزون وفريق العمل",
      "تسليم بالتوصيل أو بالاستلام من الصيدلية",
    ],
  },
  {
    key: "staff",
    icon: <IconBox />,
    title: "موظفو الصيدلية",
    lead: "حساب بصلاحيات محددة لتحضير الطلبات وتسليمها دون الوصول إلى إعدادات الصيدلية.",
    points: [
      "تحضير الطلبات وتجهيزها",
      "تسليم للاستلام أو لمندوب التوصيل",
      "صلاحيات منفصلة عن حساب المالك",
    ],
  },
  {
    key: "courier",
    icon: <IconScooter />,
    title: "مندوبو التوصيل",
    lead: "استلم طلبات التوصيل القريبة منك وتابع مسارها حتى التسليم.",
    points: [
      "عروض توصيل تقبلها أو ترفضها",
      "تتبع الطلب حتى تسليمه",
      "سجل واضح لكل عملية توصيل",
    ],
  },
  {
    key: "ambulance",
    icon: <IconAmbulance />,
    title: "سائقو الإسعاف",
    lead: "استقبل طلبات الطوارئ القريبة منك وتابعها من القبول حتى الوصول.",
    points: [
      "طلبات طوارئ حسب موقعك",
      "متابعة الحالة خطوة بخطوة",
      "تنبيه فوري عند وصول طلب جديد",
    ],
    urgent: true,
  },
];

const BENEFITS = [
  {
    title: "طلبات تصلك، لا تبحث عنها",
    text: "المرضى يطلبون من التطبيق، والطلب يصل إلى الحساب المناسب في منطقتك بدل الاعتماد على الإعلان والاتصال.",
  },
  {
    title: "أنت من يحدد توفرك",
    text: "تستقبل الطلبات حين تكون متاحًا فقط، وتقبل أو ترفض كل طلب على حدة.",
  },
  {
    title: "لوحة تحكم لعملك",
    text: "لكل نوع حساب واجهة مصمّمة لعمله: الطبيب يرى زياراته، والصيدلية ترى طلباتها ومخزونها.",
  },
  {
    title: "سجل مالي واضح",
    text: "تتابع أرباحك ومعاملاتك من داخل التطبيق، بسجل لكل عملية تمت عبر المنصة.",
  },
];

const STEPS = [
  { title: "افتح التطبيق", text: "من أي متصفح أو هاتف، دون الحاجة إلى زيارة مكتب." },
  { title: "اختر نوع حسابك", text: "طبيب، ممرض، صيدلية، مندوب توصيل، أو سائق إسعاف." },
  { title: "أرسل بياناتك", text: "أكمل بيانات النشاط والمستندات المطلوبة لنوع حسابك." },
  { title: "ابدأ الاستقبال", text: "بعد مراجعة البيانات وتفعيل الحساب تبدأ الطلبات بالوصول." },
];

const FAQ = [
  {
    q: "هل الانضمام إلى المنصة مجاني؟",
    a: "إنشاء الحساب وإرسال بياناتك للمراجعة لا يتطلب رسوم اشتراك. تفاصيل العمولة على الطلبات تُوضّح لك عند تفعيل الحساب.",
  },
  {
    q: "كم يستغرق تفعيل الحساب؟",
    a: "بعد إرسال بياناتك يمر الحساب بمراجعة قبل التفعيل، والمدة تعتمد على اكتمال المستندات المطلوبة لنوع حسابك.",
  },
  {
    q: "هل أستطيع تحديد أوقات عملي؟",
    a: "نعم. تستقبل الطلبات حين تكون متاحًا فقط، ويمكنك قبول أو رفض كل طلب يصلك على حدة.",
  },
  {
    q: "ما المستندات المطلوبة؟",
    a: "تختلف حسب نوع الحساب: الأطباء والممرضون يثبتون ترخيص المزاولة، والصيدليات تثبت ترخيص الصيدلية، ومقدمو التوصيل والإسعاف يثبتون الهوية ورخصة القيادة.",
  },
  {
    q: "هل الخدمة متاحة في كل ليبيا؟",
    a: "التغطية تتوسع تدريجيًا مع انضمام مزودين جدد في كل منطقة، ويمكنك التسجيل حتى إن لم تكن منطقتك مغطاة بعد.",
  },
  {
    q: "كيف أتابع أرباحي؟",
    a: "من حسابك داخل التطبيق تجد سجل معاملاتك وأرباحك، مع تفاصيل كل طلب أُنجز عبر المنصة.",
  },
];

// The marquee needs its list twice for a seamless loop; building the pair here
// keeps the duplication out of the markup.
const TICKER = [...ROLES, ...ROLES];

/**
 * One segment of the joining road: a single cubic drawn in a 100×100 box,
 * leaving one dot and arriving at the next.
 *
 * The two control points sit on OPPOSITE sides of the axis, which is what makes
 * this a wave rather than a bulge — and it means the curve leaves each dot
 * heading down-and-right and arrives at the next one heading down-and-right
 * too. Consecutive segments therefore meet at the same tangent, so four
 * separate paths read as one continuous line with no kink at the joints.
 */
const STEP_WAVE = "M50 0C92 28 8 72 50 100";

/**
 * Section label: index numeral, caption, hairline.
 *
 * The numeral and the caption stay adjacent and the rule fills what is left —
 * putting the rule *between* them pushed the caption away from the number it
 * belongs to, which read as two unrelated bits of chrome. A centred label gets
 * a rule on both sides so the pair sits in the middle of its own bracket.
 */
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

export default function PartnersPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      {/* A JSON-LD data block, not executed script, so a strict CSP does not
          block it and crawlers read it straight out of the served HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <a className="skipLink" href="#roles">
        تخطّي إلى المحتوى
      </a>
      <div id="scroll-progress" aria-hidden="true" />
      <ScrollProgress />
      <SiteNav />

      <Reveal>
        <div className={s.stage} id="top">
          <div className={`wrap ${s.stageInner}`}>
            <header className={s.hero}>
              <div className={s.heroCopy}>
                <span className="eyebrow" data-reveal="fade">
                  <i /> منصة الشركاء
                </span>
                <h1 className="pageTitle" data-reveal="rise" style={{ "--i": 1 }}>
                  وسّع نطاق عملك
                  <br />
                  <span className={s.heroAccent}>مع دكتور لعندك</span>
                </h1>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 2 }}>
                  انضم كطبيب أو ممرض أو صيدلية أو مندوب توصيل أو سائق إسعاف،
                  واستقبل طلبات المرضى في منطقتك من منصة واحدة بواجهة عربية
                  مصمّمة لعملك.
                </p>
                <div className={s.heroCtas} data-reveal="" style={{ "--i": 3 }}>
                  <MagneticLink className="btn btnPrimary" href={SITE.appUrl}>
                    سجّل حسابك الآن
                  </MagneticLink>
                  <MagneticLink className="btn btnGhost" href="#roles">
                    تعرّف على أنواع الحسابات
                  </MagneticLink>
                </div>
                <div className={s.stats} data-reveal="" style={{ "--i": 4 }}>
                  <div className={s.stat}>
                    <b>
                      <CountUp to={5} />
                    </b>
                    <span>أنواع حسابات</span>
                  </div>
                  <div className={s.stat}>
                    <b>
                      <CountUp to={24} suffix="/7" />
                    </b>
                    <span>طلبات الطوارئ</span>
                  </div>
                  <div className={s.stat}>
                    <b>عربي</b>
                    <span>واجهة كاملة</span>
                  </div>
                </div>
              </div>

              {/* The emblem is the page's one focal object. The WebGL orbit is
                  mounted INSIDE this box and centred on it — five satellites,
                  one per account type, converging on the mark. That is the
                  whole argument of the page, running as an animation. */}
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
                    <IconCrescent /> حسابك يبدأ خلال دقائق
                  </div>
                </div>
              </Parallax>
            </header>
          </div>

          {/* A moving list of exactly the account types the page goes on to
              describe — a summary that happens to be in motion, not filler. */}
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

        <section id="roles" className={`${s.bandB} section`}>
          <div className="aurora" aria-hidden="true" />
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={1} mid>
                من ينضم إلينا
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                خمسة حسابات، خمس واجهات
              </h2>
              <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                لكل نوع حساب واجهة مصمّمة لعمله، لا نسخة واحدة تصلح للجميع.
              </p>
            </div>

            <div className={s.roles} data-reveal="">
              {ROLES.map((r, i) => (
                <TiltCard
                  key={r.key}
                  max={4}
                  className={`${s.role} ${r.urgent ? s.urgent : ""}`}
                >
                  <div className={s.roleTop}>
                    <div className={s.roleIcon}>{r.icon}</div>
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
          </div>
        </section>

        <section id="benefits" className={`${s.bandA} section`}>
          <div className="wrap">
            <div className="sectionHead">
              <Label no={2}>لماذا المنصة</Label>
              <h2 className="sectionTitle" data-reveal="">
                المنصة توصّل الطلب،
                <br />
                وأنت تتفرغ للعمل
              </h2>
            </div>
            <div className={s.benefits}>
              {BENEFITS.map((b, i) => (
                <article key={b.title} className={s.benefit} data-reveal="" style={{ "--i": i }}>
                  <span className={s.benefitNo}>{idx(i + 1)}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.bandB} section`}>
          <div className="wrap">
            <div className={s.split}>
              <div className={s.splitTxt}>
                <Label no={3}>الطلب</Label>
                <h3 className="sectionTitle" data-reveal="">
                  يصل إليك جاهزًا
                </h3>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                  المريض يحدد الخدمة والعنوان قبل الإرسال، فيصلك الطلب بتفاصيله
                  كاملة بدل مكالمة تشرح فيها كل شيء من البداية.
                </p>
                <ul className={s.checks}>
                  {[
                    "تفاصيل الخدمة والعنوان قبل القبول",
                    "قبول أو رفض لكل طلب على حدة",
                    "متابعة الحالة حتى اكتمال الخدمة",
                  ].map((t, i) => (
                    <li key={t} data-reveal="" style={{ "--i": i + 2 }}>
                      <IconCheck />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Parallax className={s.splitArt} speed={0.09} data-reveal="scale">
                <span className={s.splitGlow} aria-hidden="true" />
                <Image
                  src="/render/request-flow.webp"
                  alt="هاتف زجاجي مجسّم تطفو أمامه بطاقتا طلب، يرمزان لوصول الطلب بتفاصيله"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 900px) 74vw, 44vw"
                />
              </Parallax>
            </div>
          </div>
        </section>

        <section className={`${s.bandA} section`}>
          <div className="wrap">
            <div className={`${s.split} ${s.splitFlip}`}>
              <Parallax className={s.splitArt} speed={0.09} data-reveal="scale">
                <span className={s.splitGlow} aria-hidden="true" />
                <Image
                  src="/render/trust-shield.webp"
                  alt="درع زجاجي مجسّم بداخله قفل، يرمز إلى مراجعة الحسابات وحماية السجل الطبي"
                  width={1024}
                  height={1024}
                  sizes="(max-width: 900px) 74vw, 44vw"
                />
              </Parallax>
              <div className={s.splitTxt}>
                <Label no={4}>الثقة</Label>
                <h3 className="sectionTitle" data-reveal="">
                  موثوقة من الطرفين
                </h3>
                <p className="bodyLarge" data-reveal="" style={{ "--i": 1 }}>
                  حسابات مقدمي الخدمة تمر بمراجعة قبل التفعيل، وسجل المريض الطبي
                  لا يُفتح لك إلا حين يختار هو مشاركته.
                </p>
                <ul className={s.checks}>
                  {[
                    "مراجعة البيانات قبل تفعيل الحساب",
                    "صلاحيات مختلفة لكل نوع حساب",
                    "سجل المريض يُشارك بموافقته",
                  ].map((t, i) => (
                    <li key={t} data-reveal="" style={{ "--i": i + 2 }}>
                      <IconCheck />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className={`${s.bandB} section`}>
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={5} mid>
                خطوات الانضمام
              </Label>
              {/* Non-breaking space: "أول طلب" is one idea and was breaking
                  across two lines, leaving "طلب" alone as a widow. */}
              <h2 className="sectionTitle" data-reveal="">
                {"أربع خطوات حتى أول طلب"}
              </h2>
            </div>
            {/* A vertical road rather than four boxes in a row: the steps are a
                journey with an order, and a line you travel down says that in a
                way four side-by-side cards never did. The teal fills in behind
                you as each step scrolls into view. */}
            <ol className={s.steps}>
              {STEPS.map((st, i) => (
                <li key={st.title} className={s.step} data-reveal="" style={{ "--i": i }}>
                  <span className={s.stepNo}>{i + 1}</span>
                  <div className={s.stepBody}>
                    <h3>{st.title}</h3>
                    <p>{st.text}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={s.stepConnector}>
                      <svg
                        className={s.stepWave}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path className={s.waveBase} d={STEP_WAVE} />
                        <path className={s.waveFill} d={STEP_WAVE} />
                      </svg>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="faq" className={`${s.bandA} section`}>
          <div className="wrap">
            <div className="sectionHead mid">
              <Label no={6} mid>
                أسئلة شائعة
              </Label>
              <h2 className="sectionTitle" data-reveal="">
                ما يسأل عنه الشركاء
              </h2>
            </div>
            <Faq items={FAQ} />
          </div>
        </section>

        <section className={`${s.bandB} ${s.finalWrap} section`}>
          <div className="aurora" aria-hidden="true" />
          <div className="wrap">
            {/* The Red Crescent, closing the page. It is the emblem the Red
                Cross movement itself uses across the Muslim world, so it is the
                correct medical mark for a Libyan audience — and it is the one
                place on the page where --danger is allowed to be large. */}
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
              جاهز للانضمام؟
            </h2>
            <p className="bodyLarge" data-reveal="" style={{ "--i": 2 }}>
              أنشئ حسابك واختر نوعه، وأرسل بياناتك للمراجعة. الطلبات تبدأ
              بالوصول فور تفعيل الحساب.
            </p>
            <div className={s.finalCtas} data-reveal="" style={{ "--i": 3 }}>
              <MagneticLink className="btn btnPrimary" href={SITE.appUrl}>
                سجّل الآن
              </MagneticLink>
              <MagneticLink className="btn btnGhost" href={SITE.mainUrl}>
                زيارة موقع المرضى
              </MagneticLink>
            </div>
          </div>
        </section>

        <footer className={s.footer}>
          <div className="wrap">
            <div className={s.footerGrid}>
              <div className={s.footerBrand}>
                <span className={s.footerName}>دكتور لعندك</span>
                <p>
                  منصة رعاية صحية في ليبيا تصل المرضى بالأطباء والصيدليات
                  ومقدمي التوصيل والإسعاف من تطبيق واحد.
                </p>
              </div>
              <div className={s.footerCol}>
                <h4>الصفحة</h4>
                <a href="#roles">من ينضم إلينا</a>
                <a href="#benefits">لماذا المنصة</a>
                <a href="#how">خطوات الانضمام</a>
                <a href="#faq">أسئلة شائعة</a>
              </div>
              <div className={s.footerCol}>
                <h4>روابط</h4>
                <a href={SITE.mainUrl}>موقع المرضى</a>
                <a href={SITE.appUrl}>فتح التطبيق</a>
                <a href={SITE.appUrl}>تسجيل حساب شريك</a>
              </div>
            </div>
            <div className={`${s.footerBar} bodySm`}>
              <span>دكتور لعندك · صحتك تهمنا</span>
              <span>ليبيا</span>
            </div>
          </div>
        </footer>
      </Reveal>

      {/* On a phone the header CTA is dropped for room, so the primary action
          returns as a bar pinned to the thumb. */}
      <div className={s.mobileBar}>
        <a className="btn btnPrimary btnFull" href={SITE.appUrl}>
          سجّل حسابك الآن
        </a>
      </div>
    </>
  );
}
