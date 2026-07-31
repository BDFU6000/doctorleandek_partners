import Image from "next/image";
import s from "./page.module.css";
import { SITE } from "./site-config";
import {
  IconStethoscope,
  IconPharmacy,
  IconBox,
  IconScooter,
  IconAmbulance,
  IconCheck,
  IconCross,
} from "./icons";

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
    no: "٠١",
    title: "طلبات تصلك، لا تبحث عنها",
    text: "المرضى يطلبون من التطبيق، والطلب يصل إلى الحساب المناسب في منطقتك بدل الاعتماد على الإعلان والاتصال.",
  },
  {
    no: "٠٢",
    title: "أنت من يحدد توفرك",
    text: "تستقبل الطلبات حين تكون متاحًا فقط، وتقبل أو ترفض كل طلب على حدة.",
  },
  {
    no: "٠٣",
    title: "لوحة تحكم لعملك",
    text: "لكل نوع حساب واجهة مصمّمة لعمله: الطبيب يرى زياراته، والصيدلية ترى طلباتها ومخزونها.",
  },
  {
    no: "٠٤",
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
      {/* A JSON-LD data block, not executed script, so a strict CSP does not block
          it and crawlers read it straight out of the served HTML. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className={s.stage}>
        <div className="wrap">
          <nav className={s.nav}>
            <div className={s.brand}>
              <span className={s.brandName}>دكتور لعندك</span>
              <span className={s.brandTag}>صحتك تهمنا</span>
            </div>
            <div className={s.navLinks}>
              <a href="#roles">من ينضم إلينا</a>
              <a href="#benefits">لماذا المنصة</a>
              <a href="#how">خطوات الانضمام</a>
              <a href="#faq">أسئلة شائعة</a>
              <a className={s.navCta} href={SITE.mainUrl}>
                موقع المرضى
              </a>
            </div>
          </nav>

          <header className={s.hero}>
            <div className={s.heroCopy}>
              <span className="eyebrow">
                <i /> منصة الشركاء
              </span>
              <h1 className="pageTitle">
                وسّع نطاق عملك
                <br />
                مع دكتور لعندك
              </h1>
              <p className="bodyLarge">
                انضم كطبيب أو ممرض أو صيدلية أو مندوب توصيل أو سائق إسعاف،
                واستقبل طلبات المرضى في منطقتك من منصة واحدة بواجهة عربية
                مصمّمة لعملك.
              </p>
              <div className={s.heroCtas}>
                <a className="btn btnLight" href={SITE.appUrl}>
                  سجّل حسابك الآن
                </a>
                <a className="btn btnGhost" href="#roles">
                  تعرّف على أنواع الحسابات
                </a>
              </div>
              <div className={s.stats}>
                <div className={s.stat}>
                  <b>٥</b>
                  <span>أنواع حسابات</span>
                </div>
                <div className={s.stat}>
                  <b>٢٤/٧</b>
                  <span>طلبات الطوارئ</span>
                </div>
                <div className={s.stat}>
                  <b>عربي</b>
                  <span>واجهة كاملة</span>
                </div>
              </div>
            </div>

            <div className={s.heroArt}>
              <Image
                src="/img/care.webp"
                alt="طبيب يحمل حقيبة إسعافات أمام منزل، وخلفه سيارة إسعاف ومندوب توصيل"
                width={1100}
                height={1220}
                priority
              />
              <div className={s.heroBadge}>
                <IconCross /> حسابك يبدأ خلال دقائق
              </div>
            </div>
          </header>
        </div>
      </div>

      <section id="roles" className={`${s.rolesWrap} section`}>
        <div className="wrap">
          <div className="sectionHead mid">
            <h2 className="sectionTitle">من ينضم إلى دكتور لعندك</h2>
            <p className="bodyLarge">
              خمسة أنواع حسابات، لكل منها واجهة مصمّمة لعمله، لا نسخة واحدة
              تصلح للجميع.
            </p>
          </div>

          <div className={s.roles}>
            {ROLES.map((r) => (
              <article
                key={r.key}
                className={`glass ${s.role} ${r.urgent ? s.urgent : ""}`}
              >
                <div className={s.roleIcon}>{r.icon}</div>
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className={`${s.benefitsWrap} section`}>
        <div className="wrap">
          <div className="sectionHead mid">
            <h2 className="sectionTitle">لماذا تنضم إلى المنصة</h2>
            <p className="bodyLarge">
              المنصة تتكفل بإيصال الطلب إليك، وأنت تتفرغ للعمل نفسه.
            </p>
          </div>
          <div className={s.benefits}>
            {BENEFITS.map((b) => (
              <article key={b.no} className={`glass ${s.benefit}`}>
                <span className={s.benefitNo}>{b.no}</span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.splitWrap} section`}>
        <div className="wrap">
          <div className={s.split}>
            <div className={s.splitTxt}>
              <h3 className="sectionTitle">الطلب يصل إليك جاهزًا</h3>
              <p className="bodyLarge">
                المريض يحدد الخدمة والعنوان قبل الإرسال، فيصلك الطلب بتفاصيله
                كاملة بدل مكالمة تشرح فيها كل شيء من البداية.
              </p>
              <ul className={s.checks}>
                <li>
                  <IconCheck />
                  <span>تفاصيل الخدمة والعنوان قبل القبول</span>
                </li>
                <li>
                  <IconCheck />
                  <span>قبول أو رفض لكل طلب على حدة</span>
                </li>
                <li>
                  <IconCheck />
                  <span>متابعة الحالة حتى اكتمال الخدمة</span>
                </li>
              </ul>
            </div>
            <Image
              src="/img/services.webp"
              alt="واجهة تطبيق دكتور لعندك محاطة بأيقونات الأدوية والإسعاف والمحفظة والموقع"
              width={1000}
              height={933}
            />
          </div>

          <div className={s.split}>
            <Image
              src="/img/privacy.webp"
              alt="طبيب إلى جانب درع وقفل يرمزان لحماية البيانات، وعائلة وخدمة على مدار الساعة"
              width={900}
              height={799}
            />
            <div className={s.splitTxt}>
              <h3 className="sectionTitle">حسابات موثوقة من الطرفين</h3>
              <p className="bodyLarge">
                حسابات مقدمي الخدمة تمر بمراجعة قبل التفعيل، وسجل المريض الطبي
                لا يُفتح لك إلا حين يختار هو مشاركته.
              </p>
              <ul className={s.checks}>
                <li>
                  <IconCheck />
                  <span>مراجعة البيانات قبل تفعيل الحساب</span>
                </li>
                <li>
                  <IconCheck />
                  <span>صلاحيات مختلفة لكل نوع حساب</span>
                </li>
                <li>
                  <IconCheck />
                  <span>سجل المريض يُشارك بموافقته</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className={`${s.stepsWrap} section`}>
        <div className="wrap">
          <div className="sectionHead mid">
            <h2 className="sectionTitle">خطوات الانضمام</h2>
            <p className="bodyLarge">أربع خطوات من التسجيل حتى أول طلب يصلك.</p>
          </div>
          <ol className={s.steps}>
            {STEPS.map((st, i) => (
              <li key={st.title} className={`glass ${s.step}`}>
                <div className={s.stepNo}>{i + 1}</div>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className={`${s.faqWrap} section`}>
        <div className="wrap">
          <div className="sectionHead mid">
            <h2 className="sectionTitle">أسئلة شائعة</h2>
            <p className="bodyLarge">أكثر ما يسأل عنه الشركاء قبل التسجيل.</p>
          </div>
          <div className={s.faq}>
            {FAQ.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.finalWrap} section`}>
        <div className="wrap">
          <h2 className="sectionTitle">جاهز للانضمام؟</h2>
          <p className="bodyLarge">
            أنشئ حسابك واختر نوعه، وأرسل بياناتك للمراجعة. الطلبات تبدأ بالوصول
            فور تفعيل الحساب.
          </p>
          <div className={s.finalCtas}>
            <a className="btn btnLight" href={SITE.appUrl}>
              سجّل الآن
            </a>
            <a className="btn btnGhost" href={SITE.mainUrl}>
              زيارة موقع المرضى
            </a>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className="wrap">
          <div className={s.footerRow}>
            <div className="bodySm">دكتور لعندك · صحتك تهمنا · ليبيا</div>
            <div className={`${s.footerLinks} bodySm`}>
              <a href={SITE.mainUrl}>موقع المرضى</a>
              <a href={SITE.appUrl}>فتح التطبيق</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
