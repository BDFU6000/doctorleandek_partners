import Image from "next/image";
import p from "./profile.module.css";
import { SITE } from "../site-config";
import { getPlatformStats } from "../lib/stats";
import {
  COMPANY,
  ABOUT,
  VISION,
  SERVICES,
  CHAIN,
  PATIENT_STEPS,
  ROLES,
  PARTNER_BENEFITS,
  TRUST,
  ROADMAP,
  COUNTERS,
} from "../content";
import {
  IconStethoscope,
  IconPharmacy,
  IconBox,
  IconScooter,
  IconAmbulance,
  IconCheck,
  IconCrescent,
  IconCrescentSolid,
  IconHome,
  IconPhone,
  IconChat,
  IconArrow,
} from "../icons";

// The printable company profile. tools/build-profile.mjs prints this route to
// public/profile/doctorleandek-profile-ar.pdf with headless Chrome. Every word
// comes from app/content.js, the same file the website reads, so the PDF and
// the site cannot drift apart. Rebuild the PDF after editing the content.

export const metadata = {
  title: "الملف التعريفي | دكتور لعندك",
  robots: { index: false, follow: false },
};

const idx = (n) => String(n).padStart(2, "0");

const SERVICE_ICON = { visit: <IconHome />, pharmacy: <IconPharmacy />, delivery: <IconScooter />, emergency: <IconAmbulance /> };
const ROLE_ICON = { medical: <IconStethoscope />, pharmacy: <IconPharmacy />, staff: <IconBox />, courier: <IconScooter />, ambulance: <IconAmbulance /> };

const dateFmt = new Intl.DateTimeFormat("ar-LY-u-nu-latn", { timeZone: "Africa/Tripoli", dateStyle: "long" });

/** One A4 sheet with the running header and the page number. */
function Sheet({ no, title, children, className = "" }) {
  return (
    <section className={`${p.sheet} ${className}`}>
      <header className={p.runHead}>
        <span className={p.runBrand}>
          <i><IconCrescentSolid /></i>
          {COMPANY.name}
        </span>
        <span>{title}</span>
      </header>
      <div className={p.body}>{children}</div>
      <footer className={p.runFoot}>
        <span>الملف التعريفي</span>
        <b>{idx(no)}</b>
      </footer>
    </section>
  );
}

function Head({ no, kicker, children }) {
  return (
    <div className={p.head}>
      <span className={p.kicker}>
        <b>{idx(no)}</b> {kicker}
      </span>
      <h2>{children}</h2>
    </div>
  );
}

export default async function PrintProfile() {
  const stats = await getPlatformStats();
  const today = dateFmt.format(new Date());

  return (
    <main className={p.doc}>
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <section className={`${p.sheet} ${p.cover}`}>
        <span className={`rings ${p.coverRings}`} aria-hidden="true" />
        <div className={p.coverTop}>
          <span className={p.coverMark}><IconCrescentSolid /></span>
          <span className={p.coverKicker}>الملف التعريفي</span>
        </div>
        <div className={p.coverArt}>
          <span className={p.coverGlow} aria-hidden="true" />
          <Image src="/render/hero-doctor.webp" alt="" width={928} height={1152} sizes="420px" priority />
        </div>
        <div className={p.coverText}>
          <h1>
            {COMPANY.name}
            <span>الرعاية الصحية تصل إلى بابك</span>
          </h1>
          <p>{COMPANY.oneLine}</p>
        </div>
        <div className={p.coverFoot}>
          <span>{COMPANY.country}</span>
          <span>{today}</span>
        </div>
      </section>

      {/* ── 01 About ──────────────────────────────────────────────────── */}
      <Sheet no={2} title="من نحن">
        <Head no={1} kicker="من نحن">
          رعاية لا تعتمد على <em>من تعرف</em>
        </Head>
        <blockquote className={p.quote}>
          <IconCrescent />
          <p>{ABOUT.quote}</p>
        </blockquote>
        <p className={p.lead}>{ABOUT.lead}</p>
        <div className={p.card}>
          <h3>ما الذي يحدث اليوم</h3>
          <ol className={p.numList}>
            {ABOUT.problems.map((x, i) => (
              <li key={x}>
                <b>{idx(i + 1)}</b>
                <span>{x}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className={`${p.card} ${p.cardAccent}`}>
          <h3>{ABOUT.answerTitle}</h3>
          <p>{ABOUT.answer}</p>
        </div>
        <p className={p.idea}>الفكرة كلها: {COMPANY.idea}</p>
      </Sheet>

      {/* ── 02 Vision ─────────────────────────────────────────────────── */}
      <Sheet no={3} title="الرؤية والرسالة">
        <Head no={2} kicker="الرؤية والرسالة">
          من دقائق، <em>لا من أيام</em>
        </Head>
        <div className={p.card}>
          <span className={p.tag}>الرؤية</span>
          <p className={p.big}>{VISION.vision}</p>
        </div>
        <div className={p.card}>
          <span className={p.tag}>الرسالة</span>
          <p className={p.big}>{VISION.mission}</p>
        </div>
        <h3 className={p.sub}>قيمنا</h3>
        <div className={p.grid2}>
          {VISION.values.map((v, i) => (
            <div key={v.title} className={p.numBlock}>
              <b>{idx(i + 1)}</b>
              <h4>{v.title}</h4>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </Sheet>

      {/* ── 03 Services ───────────────────────────────────────────────── */}
      <Sheet no={4} title="خدماتنا">
        <Head no={3} kicker="خدماتنا">
          أربع خدمات، <em>تطبيق واحد</em>
        </Head>
        <p className={p.lead}>كل ما يحتاجه المريض من لحظة شعوره بالتعب حتى يصله الدواء.</p>
        <div className={p.grid2}>
          {SERVICES.map((x) => (
            <div key={x.key} className={`${p.card} ${p.iconCard} ${x.urgent ? p.urgent : ""}`}>
              <span className={p.icon}>{SERVICE_ICON[x.key]}</span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </div>
        <h3 className={p.sub}>كيف تعمل للمريض</h3>
        <ol className={p.steps}>
          {PATIENT_STEPS.map((st, i) => (
            <li key={st.title}>
              <b>{i + 1}</b>
              <div>
                <h4>{st.title}</h4>
                <p>{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Sheet>

      {/* ── The chain ─────────────────────────────────────────────────── */}
      <Sheet no={5} title="ميزة المنصة">
        <Head no={4} kicker="ميزة المنصة">
          الحلقات <em>تعرف بعضها</em>
        </Head>
        <p className={p.lead}>{CHAIN.lead}</p>
        <ol className={p.chain}>
          {CHAIN.links.map((l, i) => (
            <li key={l}>
              <span>{l}</span>
              {i < CHAIN.links.length - 1 && <IconArrow />}
            </li>
          ))}
        </ol>
        <div className={p.chainArt}>
          <span className={p.artGlow} aria-hidden="true" />
          <Image src="/render/request-flow.webp" alt="" width={1024} height={1024} sizes="300px" />
        </div>
        <div className={p.grid2}>
          {CHAIN.points.map((x) => (
            <div key={x.title} className={p.card}>
              <h3 className={p.withCheck}>
                <IconCheck /> {x.title}
              </h3>
              <p>{x.text}</p>
            </div>
          ))}
        </div>
      </Sheet>

      {/* ── 05 Partners ───────────────────────────────────────────────── */}
      <Sheet no={6} title="شركاؤنا">
        <Head no={5} kicker="شركاؤنا">
          خمسة حسابات، <em>خمس واجهات</em>
        </Head>
        <p className={p.lead}>
          دكتور لعندك لا توظّف الأطباء ولا تملك الصيدليات ولا تشغّل سيارات
          الإسعاف. هي الطبقة التي تنظّم اللقاء بينهم وبين المريض، ولكل شريك
          واجهة مصمّمة لعمله.
        </p>
        <div className={p.roles}>
          {ROLES.map((r) => (
            <div key={r.key} className={`${p.card} ${p.iconCard} ${r.urgent ? p.urgent : ""}`}>
              <span className={p.icon}>{ROLE_ICON[r.key]}</span>
              <h3>{r.title}</h3>
              <p>{r.lead}</p>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet no={7} title="شركاؤنا">
        <Head no={5} kicker="لماذا ينضم الشركاء">
          المنصة توصّل الطلب، <em>وأنت تتفرغ للعمل</em>
        </Head>
        <div className={p.grid2}>
          {PARTNER_BENEFITS.map((b, i) => (
            <div key={b.title} className={p.numBlock}>
              <b>{idx(i + 1)}</b>
              <h4>{b.title}</h4>
              <p>{b.text}</p>
            </div>
          ))}
        </div>
        {stats && (
          <>
            <h3 className={p.sub}>المنصة اليوم</h3>
            <div className={p.counters}>
              {COUNTERS.map((c) => (
                <div key={c.key} className={p.counter}>
                  <b>{Number(stats[c.key]).toLocaleString("en-US")}</b>
                  <h4>{c.unit}</h4>
                  <p>{c.note}</p>
                </div>
              ))}
            </div>
            <p className={p.meta}>أرقام من قاعدة بيانات المنصة بتاريخ {today}.</p>
          </>
        )}
        <div className={`${p.card} ${p.cardAccent}`}>
          <h3>كيف تنضم</h3>
          <p>
            افتح التطبيق واختر نوع حسابك، ثم أرسل بياناتك والمستندات المطلوبة
            للمراجعة. التسجيل لا يتطلب رسوم اشتراك، والطلبات تبدأ بالوصول بعد
            تفعيل الحساب.
          </p>
        </div>
      </Sheet>

      {/* ── 06 Trust ──────────────────────────────────────────────────── */}
      <Sheet no={8} title="الثقة والخصوصية">
        <Head no={6} kicker="الثقة والخصوصية">
          موثوقة <em>من الطرفين</em>
        </Head>
        <div className={p.trustArt}>
          <span className={p.artGlow} aria-hidden="true" />
          <Image src="/render/trust-shield.webp" alt="" width={1024} height={1024} sizes="300px" />
        </div>
        <blockquote className={p.quote}>
          <IconCrescent />
          <p className={p.quoteSm}>{TRUST.statement}</p>
        </blockquote>
        <ul className={p.checks}>
          {TRUST.points.map((t) => (
            <li key={t}>
              <IconCheck />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Sheet>

      {/* ── 07 Roadmap ────────────────────────────────────────────────── */}
      <Sheet no={9} title="ما القادم">
        <Head no={7} kicker="ما القادم">
          خارطة <em>التطوير</em>
        </Head>
        <p className={p.lead}>خطط معلنة نعمل عليها، وليست متاحة في التطبيق بعد.</p>
        <div className={p.grid2}>
          {ROADMAP.map((r) => (
            <div key={r.title} className={p.plan}>
              <span className={p.soon}>قريبًا</span>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </Sheet>

      {/* ── Back cover ────────────────────────────────────────────────── */}
      <section className={`${p.sheet} ${p.back}`}>
        <span className={`rings ${p.backRings}`} aria-hidden="true" />
        <div className={p.backArt}>
          <span className={p.backGlow} aria-hidden="true" />
          <Image src="/render/red-crescent.webp" alt="" width={1024} height={1024} sizes="260px" />
        </div>
        <h2>
          تواصل <em>معنا</em>
        </h2>
        <p className={p.lead}>
          مريضًا كنت أو مقدّم خدمة أو جهة تريد أن تعرف عنا أكثر، فريق الدعم يرد
          عليك هاتفيًا وعلى واتساب.
        </p>
        <div className={p.contacts}>
          <span>
            <IconPhone /> <b dir="ltr">{COMPANY.phoneDisplay}</b>
          </span>
          <span>
            <IconChat /> واتساب على الرقم نفسه
          </span>
        </div>
        <div className={p.links}>
          <span>
            التطبيق <b dir="ltr">{SITE.mainUrl.replace("https://", "")}</b>
          </span>
          <span>
            الموقع <b dir="ltr">{SITE.partnersUrl.replace("https://", "")}</b>
          </span>
        </div>
        <p className={p.backSign}>
          {COMPANY.name} · {COMPANY.tagline}
        </p>
      </section>
    </main>
  );
}
