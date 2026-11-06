import { useMemo, useState } from "react";
import { api, uploadFile } from "../api";
import { usePortal } from "../context";
import { HeroSlider, HtmlBlock, MemberCard, PortalCard } from "../components/Layout";
import { canAccessPersonal, canAccessReceipt, grievanceEnabled, localizeDual, qrSvg, t } from "../utils";

function SectionHead({ eyebrow, title, sub, action }) {
  return (
    <div className="section-head">
      <div>
        <span className="section-eyebrow">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function HomePage() {
  const { state, lang, setRoute } = usePortal();
  const s = state.settings;
  const cb = s.campaignBlock || {};
  const stx = s.sectionTexts || {};
  const grv = grievanceEnabled(state);
  const members = state.members.filter((m) => m.status === "active" && !m.isCoreMember).slice(0, 6);
  const portals = state.externalLinks.filter((l) => l.active !== false);
  const sl = s.socialLinks || {};
  const go = (routeName) => setRoute(routeName === "demands" ? "home" : routeName);
  return (
    <>
      <section className="hero-showcase-wrapper">
        <div className="container">
          <HeroSlider />
          <div className="campaign-impact-deck">
            <div className="campaign-top-grid">
              <div>
                <div className="campaign-pill">✨ {t(lang, cb.badgeHi, cb.badgeEn)}</div>
                <h1 className="campaign-headline">{t(lang, cb.titleHi, cb.titleEn)}</h1>
                <p className="campaign-sub">{t(lang, cb.subtitleHi, cb.subtitleEn)}</p>
              </div>
              <div className="campaign-cta-stack">
                <button className="btn btn-accent btn-lg" onClick={() => go(cb.btn1Route || "join")}>✍️ {t(lang, cb.btn1Hi, cb.btn1En)}</button>
                <button className="btn btn-white btn-lg" onClick={() => setRoute("about")}>📋 {t(lang, cb.btn2Hi, cb.btn2En)}</button>
                <button className="btn btn-whatsapp btn-lg" onClick={() => setRoute(cb.btn3Route === "grievance" && !grv ? "about" : (cb.btn3Route || "grievance"))}>⚖️ {t(lang, cb.btn3Hi, cb.btn3En)}</button>
              </div>
            </div>
            <div className="impact-stats-row">
              {(s.statCards || []).map((st, i) => (
                <div className="impact-stat-box" key={i}>
                  <div className="impact-stat-icon">{st.icon || "⭐"}</div>
                  <div>
                    <div className="impact-stat-val">{t(lang, st.valueHi, st.valueEn)}</div>
                    <div className="impact-stat-lbl">{t(lang, st.labelHi, st.labelEn)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* CIRCULARS SECTION */}
      <section className="section-block">
        <div className="container">
          <SectionHead
            eyebrow={`📑 ${t(lang, stx.homeCircularsEyebrowHi, stx.homeCircularsEyebrowEn)}`}
            title={t(lang, stx.homeCircularsTitleHi, stx.homeCircularsTitleEn)}
            sub={t(lang, stx.homeCircularsSubHi, stx.homeCircularsSubEn)}
            action={
              <button className="btn btn-primary btn-sm" onClick={() => setRoute("circulars")}>
                📁 {t(lang, "सभी सर्कुलर व पीडीएफ देखें", "View All Circulars & PDFs")} →
              </button>
            }
          />
          <div className="circulars-grid">
            {(state.circulars || []).slice(0, 3).map((c) => <CircularCard key={c.id} item={c} />)}
          </div>
        </div>
      </section>

      {/* PORTALS SECTION */}
      <section className="section-block alt-bg">
        <div className="container">
          <SectionHead eyebrow={`🌐 ${t(lang, stx.homePortalsEyebrowHi, stx.homePortalsEyebrowEn)}`} title={t(lang, stx.homePortalsTitleHi, stx.homePortalsTitleEn)} sub={t(lang, stx.homePortalsSubHi, stx.homePortalsSubEn)} action={<button className="btn btn-outline btn-sm" onClick={() => setRoute("portals")}>{t(lang, "सभी पोर्टल देखें", "View All Portals")} →</button>} />
          <div className="external-portals-grid">{portals.map((l) => <PortalCard key={l.id} link={l} />)}</div>
        </div>
      </section>

      {/* DEMANDS / CHARTER SECTION */}
      <section className="section-block">
        <div className="container">
          <SectionHead
            eyebrow={`🤝 ${t(lang, stx.homeDemandsEyebrowHi, stx.homeDemandsEyebrowEn)}`}
            title={t(lang, stx.homeDemandsTitleHi, stx.homeDemandsTitleEn)}
            sub={t(lang, stx.homeDemandsSubHi, stx.homeDemandsSubEn)}
          />
          <div style={{ marginBottom: 18 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setRoute("about")}>
              🏛 {t(lang, "संघ परिचय, प्रमाण-पत्र व मुख्य कार्यकारिणी →", "About, Certificates & Core Executive →")}
            </button>
          </div>
          <div className="demands-grid">
            {state.demands.map((d) => (
              <div className="demand-card" key={d.id}>
                <div className="demand-num-row"><span className="demand-num">{d.number}</span><span className="demand-status">{t(lang, d.statusHi || d.status, d.statusEn || d.status)}</span></div>
                <h3 className="demand-title">{t(lang, d.titleHi, d.titleEn)}</h3>
                <p className="demand-desc">{t(lang, d.descHi, d.descEn)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERS SECTION */}
      <section className="section-block alt-bg">
        <div className="container">
          <SectionHead
            eyebrow={`👥 ${t(lang, stx.homeMembersEyebrowHi, stx.homeMembersEyebrowEn)}`}
            title={t(lang, stx.homeMembersTitleHi, stx.homeMembersTitleEn)}
            action={
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-outline btn-sm" onClick={() => setRoute("about")}>
                  👑 {t(lang, "प्रदेश मुख्य कार्यकारिणी देखें", "View State Executive")}
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setRoute("members")}>
                  · {t(lang, "संपूर्ण सदस्य सूची", "Full Member Directory")} →
                </button>
              </div>
            }
          />
          <div className="general-members-grid">
            {members.map((m) => <MemberCard key={m.id} member={m} compact />)}
          </div>
        </div>
      </section>

      {/* NEWS & SOCIAL SECTION */}
      <section className="section-block">
        <div className="container">
          <SectionHead
            eyebrow={`📰 ${t(lang, stx.homeNewsEyebrowHi, stx.homeNewsEyebrowEn)}`}
            title={t(lang, stx.homeNewsTitleHi, stx.homeNewsTitleEn)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,330px),1fr))", gap: 22 }}>
            {state.news.map((n) => (
              <article className="news-card" key={n.id}>
                <div className="news-card-img-wrap">
                  <img src={n.imageUrl || "/images/hero-banner-1.jpg"} alt="" />
                </div>
                <div className="news-card-body">
                  <div className="news-meta-row">
                    <span className="news-category-tag">{t(lang, n.categoryHi || n.category, n.categoryEn || n.category)}</span>
                    {n.location && <span className="news-location">📍 {n.location}</span>}
                    <span className="news-date">📅 {n.date}</span>
                  </div>
                  <h3 className="news-title">{t(lang, n.titleHi, n.titleEn)}</h3>
                  <p className="news-summary">{t(lang, n.summaryHi, n.summaryEn)}</p>
                  <a
                    className="btn btn-whatsapp btn-sm news-share-btn"
                    href={`https://wa.me/?text=${encodeURIComponent((t(lang, n.titleHi, n.titleEn) || "") + "\n" + (n.link || window.location.href))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🟢 {t(lang, "WhatsApp पर साझा करें", "Share on WhatsApp")}
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="social-connect-grid" style={{ marginTop: 24 }}>
            {[["whatsappChannel", "WhatsApp Channel"], ["facebook", "Facebook"], ["youtube", "YouTube"], ["telegram", "Telegram"]].filter(([k]) => sl[k]).map(([k, label]) => (
              <a key={k} href={sl[k]} target="_blank" rel="noreferrer" className="social-big-btn">{label}</a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function AboutPage() {
  const { state, lang } = usePortal();
  const avm = state.settings.aboutVisionMission || {};
  const points = lang === "en" ? (avm.missionPointsEn || []) : (avm.missionPointsHi || []);
  const core = state.members.filter((m) => m.status === "active" && m.isCoreMember);
  return (
    <>
      <section className="section-block"><div className="container"><div className="about-vm-card">
        <div className="about-hero-banner">
          <span className="campaign-pill">🏛️ {t(lang, "संगठन परिचय एवं संकल्प", "ABOUT THE ASSOCIATION")}</span>
          <h1 style={{ color: "#ffd166" }}>{t(lang, avm.aboutTitleHi, avm.aboutTitleEn)}</h1>
          <p style={{ color: "#f1f5f9", lineHeight: 1.8 }}>{t(lang, avm.aboutBodyHi, avm.aboutBodyEn)}</p>
        </div>
        <div className="vm-two-col">
          <div className="vm-panel"><h2>🔭 {t(lang, avm.visionTitleHi, avm.visionTitleEn)}</h2><p>{t(lang, avm.visionBodyHi, avm.visionBodyEn)}</p></div>
          <div className="vm-panel mission"><h2>🎯 {t(lang, avm.missionTitleHi, avm.missionTitleEn)}</h2><ul>{points.map((p) => <li key={p}>{p}</li>)}</ul></div>
        </div>
      </div></div></section>
      <section className="section-block alt-bg"><div className="container">
        <SectionHead eyebrow={t(lang, "आधिकारिक प्रमाणन", "OFFICIAL CERTIFICATES")} title={t(lang, avm.certSectionTitleHi, avm.certSectionTitleEn)} sub={t(lang, avm.certSectionSubHi, avm.certSectionSubEn)} />
        <div className="certificates-grid">{(state.certificates || []).map((c) => <CircularCard key={c.id} item={c} kind="certificate" />)}</div>
      </div></section>
      <section className="section-block"><div className="container">
        <SectionHead eyebrow={t(lang, "शीर्ष नेतृत्व", "STATE LEADERSHIP")} title={t(lang, avm.coreSectionTitleHi || "प्रदेश मुख्य कार्यकारिणी", avm.coreSectionTitleEn || "State Core Executive Committee")} sub={t(lang, avm.coreSectionSubHi, avm.coreSectionSubEn)} />
        <div className="core-members-grid">{core.map((m) => <MemberCard key={m.id} member={m} />)}</div>
      </div></section>
    </>
  );
}

export function MembersPage() {
  const { state, lang } = usePortal();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const [bank, setBank] = useState("");
  const list = state.members.filter((m) => {
    if (m.status !== "active") return false;
    if (district && m.district !== district) return false;
    if (bank && m.bankName !== bank) return false;
    if (q && !`${m.nameHi} ${m.nameEn} ${m.memberCode} ${m.district} ${m.mobile} ${m.koCode}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "75 जनपद सदस्य नेटवर्क", "75 DISTRICTS MEMBER DIRECTORY")} title={t(lang, "पंजीकृत पदाधिकारी एवं बैंक मित्र सदस्य सूची", "Registered Office-Bearers & Bank Mitra Members")} />
      <div className="filter-bar">
        <input className="form-control" style={{ flex: 1 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "नाम, सदस्य आईडी या मोबाइल खोजें", "Search name, member ID or mobile")} />
        <select className="form-control" value={district} onChange={(e) => setDistrict(e.target.value)}><option value="">{t(lang, "सभी जनपद", "All districts")}</option>{state.meta.districts.map((d) => <option key={d} value={d}>{localizeDual(d, lang)}</option>)}</select>
        <select className="form-control" value={bank} onChange={(e) => setBank(e.target.value)}><option value="">{t(lang, "सभी बैंक", "All banks")}</option>{state.meta.banks.map((b) => <option key={b}>{b}</option>)}</select>
      </div>
      {list.length === 0 ? <div className="card-panel">{t(lang, "कोई रिकॉर्ड नहीं मिला।", "No records found.")}</div> : <div className="general-members-grid">{list.map((m) => <MemberCard key={m.id} member={m} compact />)}</div>}
    </div></section>
  );
}

export function CircularCard({ item, kind = "circular" }) {
  const { lang, signed, setModal } = usePortal();
  const locked = Boolean((item.requiresMemberLogin || item.isLockedForVisitor) && !signed);
  const isPdf = item.fileType === "pdf" || String(item.fileUrl || "").toLowerCase().endsWith(".pdf");
  const typeLabel = locked ? t(lang, "सदस्य लॉगिन", "Members only") : isPdf ? "PDF" : t(lang, "परिपत्र / इमेज", "Circular / Image");
  return (
    <article className="circular-card">
      <div className="circular-card-toprow">
        <span className="badge badge-in_progress">{typeLabel}</span>
        {item.date && <span className="circular-date-badge">📅 {item.date}</span>}
      </div>
      <div className="circular-exact-thumb" style={{ cursor: "pointer" }} onClick={() => setModal({ kind: "file", item, locked })}>
        {locked
          ? <div style={{ textAlign: "center", padding: 28 }}>🔒 {t(lang, "देखने हेतु सदस्य लॉगिन आवश्यक", "Member login required")}</div>
          : isPdf
            ? <div style={{ textAlign: "center", padding: 28, fontSize: "2rem" }}>📕<div style={{ fontSize: "0.85rem", marginTop: 6, color: "var(--text-muted)" }}>PDF</div></div>
            : <img src={item.fileUrl} alt="" />}
      </div>
      {(item.issuerHi || item.issuerEn) && (
        <div className="circular-issuer-label">{t(lang, item.issuerHi, item.issuerEn)}</div>
      )}
      <h3 className="circular-card-title">{t(lang, item.titleHi, item.titleEn)}</h3>
      <div className="circular-card-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => locked ? setModal({ kind: "login" }) : setModal({ kind: "file", item, locked: false })}
        >
          <span>👁</span> {locked ? t(lang, "लॉगिन करें", "Login to view") : t(lang, "दस्तावेज़ देखें", "View document")}
        </button>
        {!locked && item.fileUrl && (
          <a className="btn btn-outline btn-sm" href={item.fileUrl} download target="_blank" rel="noreferrer">
            <span>⬇</span> {t(lang, "डाउनलोड करें", "Download")}
          </a>
        )}
      </div>
    </article>
  );
}

export function CircularsPage() {
  const { state, lang } = usePortal();
  const [q, setQ] = useState("");
  const list = (state.circulars || []).filter((c) => !q || `${c.titleHi} ${c.titleEn} ${c.issuerHi}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "बैंक परिपत्र", "BANK CIRCULARS")} title={t(lang, "बैंक मित्र सर्कुलर, आदेश एवं पीडीएफ", "Bank Mitra circulars, orders and PDFs")} />
      <div className="filter-bar"><input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "सर्कुलर खोजें", "Search circulars")} /></div>
      <div className="circulars-grid">{list.map((c) => <CircularCard key={c.id} item={c} />)}</div>
    </div></section>
  );
}

export function DocumentsPage() {
  const { state, lang, signed, setModal } = usePortal();
  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "आधिकारिक संघ अभिलेख", "OFFICIAL ASSOCIATION RECORDS")} title={t(lang, "संघ दस्तावेज़", "Association Documents")} sub={t(lang, "हस्ताक्षर एवं मुहर युक्त प्रपत्र केवल सदस्य लॉगिन के बाद खुलते हैं।", "Signed and stamped copies open only after member login.")} />
      <div className="card-panel" style={{ marginBottom: 16, background: signed ? "#f0fdf4" : "#fff7ed" }}>
        {signed ? t(lang, "सत्यापित सत्र सक्रिय है।", "Verified session is active.") : t(lang, "बिना लॉगिन केवल सादा पाठ उपलब्ध है।", "Only plain text is available without login.")}
        {!signed && <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={() => setModal({ kind: "login" })}>{t(lang, "सदस्य लॉगिन", "Member login")}</button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,350px),1fr))", gap: 20 }}>
        {state.documents.map((d) => (
          <div className="card-panel" key={d.id}>
            <span className="badge badge-in_progress">{t(lang, d.categoryHi || d.category, d.categoryEn)}</span>
            <h3 style={{ color: "var(--primary)" }}>{t(lang, d.titleHi, d.titleEn)}</h3>
            <p>{t(lang, d.summaryHi, d.summaryEn)}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-outline btn-sm" onClick={() => setModal({ kind: "plainDoc", item: d })}>{t(lang, "सादा पाठ", "Plain text")}</button>
              <button className="btn btn-primary btn-sm" onClick={() => signed ? setModal({ kind: "signedDoc", item: d }) : setModal({ kind: "login" })}>{signed ? t(lang, "हस्ताक्षरित प्रपत्र", "Signed copy") : t(lang, "लॉगिन आवश्यक", "Login required")}</button>
            </div>
          </div>
        ))}
      </div>
    </div></section>
  );
}

export function PortalsPage() {
  const { state, lang } = usePortal();
  const portals = state.externalLinks.filter((l) => l.active !== false);
  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "संबद्ध वेबसाइट्स", "LINKED PORTALS")} title={t(lang, "महत्वपूर्ण बैंकिंग एवं सरकारी पोर्टल", "Important banking and government portals")} />
      <div className="external-portals-grid">{portals.map((l) => <PortalCard key={l.id} link={l} />)}</div>
    </div></section>
  );
}

export function JoinPage() {
  const { state, lang, showToast, refresh, session, persistSession, setRoute } = usePortal();
  const s = state.settings;
  const tc = s.termsAndConditions || {};
  const [fee, setFee] = useState(s.membershipFeeGeneral);
  const [plan, setPlan] = useState("general");
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const upi = `upi://pay?pa=${encodeURIComponent(s.upiId || "")}&pn=${encodeURIComponent(s.upiPayeeName || "")}&cu=INR`;

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const raw = Object.fromEntries(fd.entries());
    const isCore = plan === "core";
    setBusy(true);
    try {
      const result = await api("/api/members", {
        method: "POST",
        body: {
          ...raw,
          photoUrl,
          isCoreMember: isCore,
          feePaid: Number(fee),
          instantDemoVerify: Boolean(raw.instantDemoVerify),
          memberCategory: plan === "district" ? "District Officer (जिला पदाधिकारी)" : undefined,
          designationHi: plan === "district" ? "जिला पदाधिकारी" : undefined,
          designationEn: plan === "district" ? "District Office Bearer" : undefined
        }
      });
      showToast(t(lang, `पंजीकरण पूर्ण: ${result.member.memberCode}`, `Registered: ${result.member.memberCode}`));
      if (result.member.status === "active") {
        persistSession({ memberId: result.member.id, memberPass: raw.password, member: result.member, isAdmin: false });
        await refresh({ memberId: result.member.id, memberPass: raw.password, member: result.member });
        setRoute("idcard");
      } else {
        await refresh();
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "ऑनलाइन सदस्यता", "ONLINE MEMBERSHIP")} title={t(lang, "बैंक मित्र सदस्यता पंजीकरण", "Bank Mitra membership registration")} />
      <form className="card-panel" onSubmit={onSubmit}>
        <div className="form-grid">
          <Field label={t(lang, "पूरा नाम (हिंदी)", "Full name (Hindi)")} name="nameHi" required />
          <Field label={t(lang, "पूरा नाम (English)", "Full name (English)")} name="nameEn" required />
          <Field label={t(lang, "पिता का नाम", "Father's name")} name="fatherName" required />
          <Field label={t(lang, "मोबाइल", "Mobile")} name="mobile" required pattern="[0-9]{10}" />
          <label className="form-group">{t(lang, "जनपद", "District")}<select className="form-control" name="district">{state.meta.districts.map((d) => <option key={d} value={d}>{localizeDual(d, lang)}</option>)}</select></label>
          <Field label={t(lang, "ब्लॉक", "Block")} name="block" required />
          <label className="form-group">{t(lang, "बैंक", "Bank")}<select className="form-control" name="bankName">{state.meta.banks.map((b) => <option key={b}>{b}</option>)}</select></label>
          <label className="form-group">{t(lang, "बीसी कंपनी", "BC company")}<select className="form-control" name="bcCompany">{state.meta.bcCompanies.map((c) => <option key={c}>{c}</option>)}</select></label>
          <Field label="KO / CSP" name="koCode" required />
          <label className="form-group">{t(lang, "रक्त समूह", "Blood group")}<select className="form-control" name="bloodGroup">{["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((b) => <option key={b}>{b}</option>)}</select></label>
          <Field label={t(lang, "पासवर्ड", "Password")} name="password" type="password" required minLength={4} />
          <label className="form-group">{t(lang, "फोटो", "Photo")}<input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setPhotoUrl(await uploadFile(file, session)); }} /></label>
          <label className="form-group full">{t(lang, "श्रेणी", "Category")}
            <select className="form-control" value={plan} onChange={(e) => { setPlan(e.target.value); setFee(e.target.value === "core" ? s.membershipFeeCore : e.target.value === "district" ? s.membershipFeeDistrictOfficer : s.membershipFeeGeneral); }}>
              <option value="general">{t(lang, `सामान्य सदस्य — ₹${s.membershipFeeGeneral}`, `General member — ₹${s.membershipFeeGeneral}`)}</option>
              <option value="district">{t(lang, `जिला पदाधिकारी — ₹${s.membershipFeeDistrictOfficer}`, `District officer — ₹${s.membershipFeeDistrictOfficer}`)}</option>
              <option value="core">{t(lang, `प्रदेश कार्यकारिणी — ₹${s.membershipFeeCore}`, `State executive — ₹${s.membershipFeeCore}`)}</option>
            </select>
          </label>
          <div className="form-group full" style={{ background: "#fff7ed", padding: 15, borderRadius: 12 }}>
            <div dangerouslySetInnerHTML={{ __html: qrSvg(upi, 120) }} />
            <div><b>{t(lang, "देय शुल्क", "Fee due")}: ₹{fee}</b></div>
            <div>UPI: {s.upiId}</div>
            <input className="form-control" name="utrNumber" placeholder="UTR" />
            <label><input type="checkbox" name="instantDemoVerify" defaultChecked /> {t(lang, "डेमो: तुरंत सक्रिय करें", "Demo: activate immediately")}</label>
          </div>
          <div className="form-group full">
            <b>{t(lang, tc.titleHi, tc.titleEn)}</b>
            <div className="terms-scroll-box">{t(lang, tc.contentHi, tc.contentEn)}</div>
            <label><input type="checkbox" name="acceptTerms" required /> {t(lang, tc.checkboxLabelHi, tc.checkboxLabelEn)}</label>
          </div>
        </div>
        <button className="btn btn-accent btn-lg" disabled={busy} style={{ marginTop: 12 }}>{t(lang, "पंजीकरण पूर्ण करें", "Complete registration")}</button>
      </form>
    </div></section>
  );
}

export function DonatePage() {
  const { state, lang, showToast, refresh, session, setModal } = usePortal();
  const s = state.settings;
  const [amount, setAmount] = useState(501);
  const upi = `upi://pay?pa=${encodeURIComponent(s.upiId || "")}&pn=${encodeURIComponent(s.upiPayeeName || "")}&cu=INR`;
  const donations = state.payments.filter((p) => p.paymentCategory === "donation");
  async function onSubmit(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    try {
      const result = await api("/api/payments", { method: "POST", body: { ...raw, amount: Number(amount), paymentCategory: "donation", instantDemoVerify: true, payerNameEn: raw.payerName } });
      showToast(t(lang, `रसीद ${result.payment.receiptNo}`, `Receipt ${result.payment.receiptNo}`));
      await refresh();
      if (canAccessReceipt(session, result.payment)) setModal({ kind: "receipt", payment: result.payment });
    } catch (err) { showToast(err.message); }
  }
  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "कल्याण कोष", "WELFARE FUND")} title={t(lang, "स्वैच्छिक सहयोग राशि", "Voluntary contribution")} />
      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        <form className="card-panel" onSubmit={onSubmit}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[101, 251, 501, 1100, 2100].map((n) => <button type="button" key={n} className="btn btn-outline btn-sm" onClick={() => setAmount(n)}>₹{n}</button>)}</div>
          <Field label={t(lang, "नाम", "Name")} name="payerName" required />
          <Field label={t(lang, "मोबाइल", "Mobile")} name="mobile" required />
          <label className="form-group">{t(lang, "जनपद", "District")}<select className="form-control" name="district">{state.meta.districts.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className="form-group">{t(lang, "राशि", "Amount")}<input className="form-control" type="number" min="51" value={amount} onChange={(e) => setAmount(e.target.value)} required /></label>
          <Field label="UTR" name="utrNumber" />
          <button className="btn btn-whatsapp btn-lg">{t(lang, "सहयोग दर्ज करें", "Submit contribution")}</button>
        </form>
        <div className="card-panel" style={{ textAlign: "center" }}>
          <div dangerouslySetInnerHTML={{ __html: qrSvg(upi, 146) }} />
          <div>UPI: {s.upiId}</div>
          <div>{s.bankAccountName} • {s.bankAccountNumber} • {s.bankIfsc}</div>
          {donations.slice(0, 6).map((d) => <div key={d.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}><span>{t(lang, d.payerName, d.payerNameEn)}</span><b>₹{d.amount}</b></div>)}
        </div>
      </div>
    </div></section>
  );
}

export function VerifyPage() {
  const { state, lang, session, setModal, recordSignedUsage } = usePortal();
  const [query, setQuery] = useState(session?.member?.memberCode || "");
  const [found, setFound] = useState(null);
  const [tab, setTab] = useState("idcard");
  const member = found?.member || session?.member;
  const receipts = useMemo(() => {
    if (found?.receipts) return found.receipts;
    if (!session?.member || !state) return [];
    const m = session.member;
    return state.payments.filter((p) => p.memberId === m.id || p.memberCode === m.memberCode || p.mobile === m.mobile);
  }, [found, session, state]);
  const personal = member ? canAccessPersonal(session, member.id) : false;

  async function lookup(e) {
    e.preventDefault();
    try {
      const data = await api(`/api/verify/${encodeURIComponent(query)}`);
      setFound(data);
    } catch (err) {
      setFound(null);
      alert(err.message);
    }
  }

  let html = "";
  if (personal && member && window.UPBMSPrint) {
    const ids = member.letterSignatoryIds || state.settings.defaultSignatoryIds || [];
    if (tab === "idcard") html = window.UPBMSPrint.renderIdCardHtml(member, state.settings, member.signatoryId, lang, null);
    else if (tab === "letter") html = window.UPBMSPrint.renderAppointmentLetterHtml(member, state.settings, ids, lang, null);
    else if (receipts[0]) html = window.UPBMSPrint.renderReceiptHtml(receipts[0], state.settings, receipts[0].signatoryIds || ids, lang, null);
  }

  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "सदस्य सत्यापन", "MEMBER VERIFICATION")} title={t(lang, "पहचान पत्र, नियुक्ति पत्र एवं रसीद", "ID card, appointment letter and receipt")} sub={t(lang, "हस्ताक्षर युक्त प्रपत्र केवल उसी सक्रिय सदस्य के लॉगिन पर खुलते हैं।", "Signed documents open only for that active member.")} />
      <form className="card-panel no-print" onSubmit={lookup} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input className="form-control" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="UPBMS-CORE-001" required />
        <button className="btn btn-primary">{t(lang, "जाँचें", "Check")}</button>
      </form>
      {!member && <div className="card-panel" style={{ textAlign: "center" }}><button className="btn btn-accent" onClick={() => setModal({ kind: "login" })}>{t(lang, "सदस्य लॉगिन", "Member login")}</button></div>}
      {member && !personal && (
        <div className="card-panel">
          <b>{member.status === "active" ? t(lang, "सक्रिय सदस्य", "Active member") : t(lang, "अनुमोदन लंबित", "Pending approval")}</b>
          <div>{t(lang, member.nameHi, member.nameEn)} • {member.memberCode} • {localizeDual(member.district, lang)}</div>
          <p>{t(lang, "हस्ताक्षर और मुहर लॉक हैं।", "Signature and seal are locked.")}</p>
          {!session?.member && <button className="btn btn-primary" onClick={() => setModal({ kind: "login", prefill: member.memberCode })}>{t(lang, "लॉगिन करें", "Sign in")}</button>}
        </div>
      )}
      {personal && (
        <>
          <div className="card-panel no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap", background: "#dcfce7" }}>
            <button className={`btn btn-sm ${tab === "idcard" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("idcard")}>{t(lang, "पहचान पत्र", "ID card")}</button>
            <button className={`btn btn-sm ${tab === "letter" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("letter")}>{t(lang, "नियुक्ति पत्र", "Letter")}</button>
            <button className={`btn btn-sm ${tab === "receipt" ? "btn-primary" : "btn-outline"}`} onClick={() => setTab("receipt")}>{t(lang, "रसीद", "Receipt")}</button>
            <button className="btn btn-accent btn-sm" onClick={async () => { await recordSignedUsage({ actionType: `print_${tab}`, actionLabelHi: "प्रपत्र प्रिंट", actionLabelEn: "Printed document", targetTitleHi: member.memberCode, targetTitleEn: member.memberCode, signatoryIds: member.letterSignatoryIds }); window.print(); }}>{t(lang, "प्रिंट", "Print")}</button>
          </div>
          <HtmlBlock html={html} />
        </>
      )}
    </div></section>
  );
}

export function GrievancePage() {
  const { state, lang, showToast, refresh } = usePortal();
  const [list, setList] = useState(null);
  if (!grievanceEnabled(state)) return <section className="section-block"><div className="container card-panel">{t(lang, "शिकायत मॉड्यूल बंद है।", "Grievance module is turned off.")}</div></section>;
  const rows = list || state.grievances;
  async function submit(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    try {
      const data = await api("/api/grievances", { method: "POST", body: raw });
      showToast(data.grievance.ticketNo);
      await refresh();
      e.target.reset();
    } catch (err) { showToast(err.message); }
  }
  async function track(e) {
    e.preventDefault();
    const q = new FormData(e.target).get("q");
    const data = await api(`/api/grievances/track/${encodeURIComponent(q)}`);
    setList(data.grievances);
  }
  return (
    <section className="section-block"><div className="container">
      <SectionHead eyebrow={t(lang, "शिकायत निवारण", "GRIEVANCE")} title={t(lang, "समस्या दर्ज करें", "Register a grievance")} />
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
        <form className="card-panel" onSubmit={submit}>
          <Field label={t(lang, "नाम", "Name")} name="applicantName" required />
          <Field label={t(lang, "मोबाइल", "Mobile")} name="mobile" required />
          <label className="form-group">{t(lang, "जनपद", "District")}<select className="form-control" name="district">{state.meta.districts.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className="form-group">{t(lang, "बैंक", "Bank")}<select className="form-control" name="bankName">{state.meta.banks.map((b) => <option key={b}>{b}</option>)}</select></label>
          <Field label="KO" name="koCode" />
          <label className="form-group">{t(lang, "प्रकार", "Type")}<select className="form-control" name="issueType"><option>बिना नोटिस केओ कोड ब्लॉक</option><option>कमीशन कटौती / भुगतान लंबित</option><option>सेटलमेंट खाता लीन / फ्रीज</option><option>शाखा / बीसी कंपनी उत्पीड़न</option></select></label>
          <Field label={t(lang, "विषय", "Subject")} name="subject" required />
          <label className="form-group">{t(lang, "विवरण", "Description")}<textarea className="form-control" name="description" required /></label>
          <button className="btn btn-accent">{t(lang, "शिकायत दर्ज करें", "Submit grievance")}</button>
        </form>
        <div>
          <form className="card-panel" onSubmit={track} style={{ display: "flex", gap: 8 }}>
            <input className="form-control" name="q" placeholder="GRV-2026-101" required />
            <button className="btn btn-primary btn-sm">{t(lang, "खोजें", "Track")}</button>
            {list && <button type="button" className="btn btn-outline btn-sm" onClick={() => setList(null)}>{t(lang, "सभी", "All")}</button>}
          </form>
          {rows.map((g) => (
            <div className="card-panel" key={g.id} style={{ borderLeft: `5px solid ${g.status === "resolved" ? "#15803d" : "#f59e0b"}` }}>
              <b>{g.ticketNo}</b> <span className={`badge badge-${g.status}`}>{g.status}</span>
              <div>{t(lang, g.subject, g.subjectEn)}</div>
              <div>{t(lang, g.adminRemark, g.adminRemarkEn)}</div>
            </div>
          ))}
        </div>
      </div>
    </div></section>
  );
}

function Field({ label, ...props }) {
  return <label className="form-group">{label}<input className="form-control" {...props} /></label>;
}

export function Modals() {
  const { modal, setModal, lang, state, session, persistSession, refresh, showToast, recordSignedUsage } = usePortal();
  if (!modal) return null;
  async function login(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    try {
      const data = await api("/api/member/login", { method: "POST", body: raw });
      const next = { memberId: data.member.id, memberPass: raw.password, member: data.member, isAdmin: false };
      persistSession(next);
      await refresh(next);
      setModal(null);
      showToast(t(lang, "लॉगिन सफल", "Login successful"));
    } catch (err) { showToast(err.message); }
  }
  let body = null;
  if (modal.kind === "login" || modal.kind === "memberMenu") {
    body = modal.kind === "memberMenu" ? (
      <div>
        <p>{t(lang, session.member.nameHi, session.member.nameEn)} • {session.member.memberCode}</p>
        <button className="btn btn-danger" onClick={async () => { persistSession(null); await refresh(null); setModal(null); }}>{t(lang, "लॉगआउट", "Logout")}</button>
      </div>
    ) : (
      <form onSubmit={login}>
        <p>{t(lang, "डेमो: UPBMS-CORE-001 / 123456", "Demo: UPBMS-CORE-001 / 123456")}</p>
        <input className="form-control" name="query" defaultValue={modal.prefill || ""} placeholder={t(lang, "सदस्य आईडी या मोबाइल", "Member ID or mobile")} required />
        <input className="form-control" name="password" type="password" placeholder={t(lang, "पासवर्ड", "Password")} required style={{ marginTop: 8 }} />
        <button className="btn btn-primary" style={{ marginTop: 10 }}>{t(lang, "लॉगिन", "Login")}</button>
      </form>
    );
  } else if (modal.kind === "file" && !modal.locked) {
    const item = modal.item;
    body = window.UPBMSPrint ? <HtmlBlock html={window.UPBMSPrint.renderExactUploadedFileHtml(item, lang)} /> : <a href={item.fileUrl}>{item.fileUrl}</a>;
  } else if (modal.kind === "plainDoc") {
    body = <HtmlBlock html={window.UPBMSPrint?.renderUnsignedAssocDocumentHtml?.(modal.item, state.settings, lang)} />;
  } else if (modal.kind === "signedDoc") {
    const ids = modal.item.signatoryIds || state.settings.defaultSignatoryIds;
    body = (
      <>
        <button className="btn btn-accent btn-sm no-print" onClick={async () => { await recordSignedUsage({ actionType: "print_document", actionLabelHi: "दस्तावेज़ प्रिंट", actionLabelEn: "Printed document", targetTitleHi: modal.item.titleHi, targetTitleEn: modal.item.titleEn, signatoryIds: ids }); window.print(); }}>{t(lang, "प्रिंट", "Print")}</button>
        <HtmlBlock html={window.UPBMSPrint?.renderAssociationDocumentHtml?.(modal.item, state.settings, ids, lang, null)} />
      </>
    );
  } else if (modal.kind === "receipt") {
    body = <HtmlBlock html={window.UPBMSPrint?.renderReceiptHtml?.(modal.payment, state.settings, modal.payment.signatoryIds, lang, null)} />;
  }
  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><b>UPBMS</b><button className="btn btn-white btn-sm no-print" onClick={() => setModal(null)}>×</button></div>
        <div className="modal-body">{body}</div>
      </div>
    </div>
  );
}
