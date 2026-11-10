import { useEffect, useState } from "react";
import { api, uploadFile } from "../api";
import { usePortal } from "../context";
import { DEFAULT_SOCIAL_STRIP, SOCIAL, getSocialStrip, t } from "../utils";

const TABS = [
  ["dashboard", "📊 डैशबोर्ड", "📊 Dashboard"],
  ["home", "🏠 मुख्य पृष्ठ (Home)", "🏠 Home Page"],
  ["about", "🏛️ परिचय (About)", "🏛️ About Us"],
  ["members", "👥 सदस्य सूची (Members)", "👥 Members"],
  ["circulars", "📑 परिपत्र (Circulars)", "📑 Circulars"],
  ["documents", "📂 दस्तावेज़ व मांगें (Docs)", "📂 Documents & Demands"],
  ["portals", "🌐 पोर्टल लिंक (Portals)", "🌐 Portals"],
  ["grievance", "⚖️ शिकायत व समाचार (Grievance)", "⚖️ Grievance & News"],
  ["join", "✍️ सदस्यता पंजीकरण (Join Us)", "✍️ Join Us Settings"],
  ["donation", "🤝 सहयोग व बहीखाता (Donation)", "🤝 Donation & Ledger"],
  ["idcard", "🪪 पहचान पत्र व प्रपत्र (ID Cards)", "🪪 ID Cards & Templates"],
  ["signs", "✒️ हस्ताक्षर व मुहर (Signs)", "✒️ Signatures & Seal"],
  ["menus", "🧭 मेनू व हेडर (Menus)", "🧭 Menus & Navigation"],
  ["branding", "🏢 पहचान व पिन (Branding)", "🏢 Branding & PIN"],
  ["logs", "🛡️ सुरक्षा लॉग (Audit Logs)", "🛡️ Security Logs"]
];

function lines(text) {
  return String(text || "").split("\n").map((s) => s.trim()).filter(Boolean);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function Field({ label, children, full }) {
  return (
    <label className={`form-group ${full ? "full" : ""}`}>
      {label && <span className="form-label">{label}</span>}
      {children}
    </label>
  );
}

function Inp(props) {
  return <input className="form-control" {...props} />;
}

function Area(props) {
  return <textarea className="form-control" rows={4} {...props} />;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{title}</h3>
          <button type="button" className="btn btn-white btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

async function download(path, filename, session) {
  const res = await api(path, { session, raw: true });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminPage() {
  const portal = usePortal();
  const { state, session, persistSession, refresh, showToast, setRoute, lang, setLang } = portal;
  const [tab, setTab] = useState("dashboard");
  const [pin, setPin] = useState("");

  async function login(e) {
    e.preventDefault();
    try {
      await api("/api/admin/login", { method: "POST", body: { pin } });
      const next = { adminPin: pin, isAdmin: true };
      persistSession(next);
      await refresh(next);
      showToast(t(lang, "एडमिन लॉगिन सफल", "Admin login successful"));
    } catch (err) {
      showToast(err.message);
    }
  }

  if (!session?.isAdmin) {
    return (
      <section className="section-block">
        <div className="container" style={{ maxWidth: 480 }}>
          <form className="card-panel" onSubmit={login}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="badge badge-verified">MERN CMS • ALL PERMISSIONS</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setLang(lang === "hi" ? "en" : "hi")}
              >
                🌐 {lang === "hi" ? "English" : "हिंदी"}
              </button>
            </div>
            <h2 style={{ color: "var(--primary)" }}>{t(lang, "सुपर एडमिन कंट्रोल पैनल", "Super Admin Control Panel")}</h2>
            <p style={{ color: "var(--text-muted)" }}>{t(lang, "डेमो पिन: 1234", "Demo PIN: 1234")}</p>
            <Field label={t(lang, "एडमिन पिन", "Admin PIN")}>
              <Inp
                value={pin}
                type="password"
                onChange={(e) => setPin(e.target.value)}
                placeholder={t(lang, "एडमिन पिन दर्ज करें (1234)", "Enter Admin PIN (1234)")}
                required
                autoFocus
              />
            </Field>
            <button className="btn btn-accent" style={{ marginTop: 14, width: "100%" }}>
              {t(lang, "लॉगिन करें", "Login to Dashboard")}
            </button>
          </form>
        </div>
      </section>
    );
  }

  async function run(path, options, okMsg) {
    try {
      await api(path, { session, ...options });
      await refresh();
      if (okMsg) showToast(okMsg);
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  }

  const saveSettings = (patch, msg) => run("/api/settings", { method: "PUT", body: patch }, msg);

  return (
    <div className="container" style={{ padding: "18px 0 40px" }}>
      <div className="admin-shell">
        <aside className="admin-sidebar no-print">
          <div style={{ padding: "8px 10px 14px" }}>
            <div style={{ color: "#ffd166", fontWeight: 900, fontSize: "0.74rem" }}>MERN CMS • FULL PERMISSIONS</div>
            <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>{t(lang, "सुपर एडमिन कंट्रोल पैनल", "Super Admin Panel")}</div>
          </div>

          <div style={{ padding: "0 10px 10px" }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            >
              🌐 {lang === "hi" ? "Switch to English" : "हिंदी में देखें"}
            </button>
          </div>

          {TABS.map(([id, labelHi, labelEn]) => (
            <button
              key={id}
              className={`admin-menu-btn ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              <span>{t(lang, labelHi, labelEn)}</span>
            </button>
          ))}

          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <button className="btn btn-white btn-sm" onClick={() => setRoute("home")}>
              {t(lang, "🌐 वेबसाइट प्रीव्यू", "🌐 Website Preview")}
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={async () => {
                persistSession(null);
                await refresh(null);
                showToast(t(lang, "सत्र समाप्त (लॉगआउट)", "Session Ended (Logged Out)"));
              }}
            >
              {t(lang, "🔒 लॉगआउट", "🔒 Logout")}
            </button>
          </div>
        </aside>

        <section style={{ minWidth: 0 }}>
          {tab === "dashboard" && <Dashboard portal={portal} run={run} setTab={setTab} />}
          {tab === "home" && <HomeSections portal={portal} saveSettings={saveSettings} run={run} />}
          {tab === "about" && <About portal={portal} saveSettings={saveSettings} run={run} />}
          {tab === "members" && <Members portal={portal} run={run} />}
          {tab === "circulars" && <Circulars portal={portal} run={run} />}
          {tab === "documents" && <Documents portal={portal} run={run} />}
          {tab === "portals" && <Portals portal={portal} run={run} />}
          {tab === "grievance" && <GrievanceNews portal={portal} saveSettings={saveSettings} run={run} />}
          {tab === "join" && <JoinSettings portal={portal} saveSettings={saveSettings} />}
          {tab === "donation" && <DonationSettings portal={portal} saveSettings={saveSettings} run={run} />}
          {tab === "idcard" && <IdCardTemplates portal={portal} saveSettings={saveSettings} />}
          {tab === "signs" && <Signs portal={portal} saveSettings={saveSettings} />}
          {tab === "menus" && <Menus portal={portal} saveSettings={saveSettings} />}
          {tab === "branding" && <Branding portal={portal} saveSettings={saveSettings} />}
          {tab === "logs" && <Logs portal={portal} run={run} />}
        </section>
      </div>
    </div>
  );
}

/* ==================== 1. DASHBOARD ==================== */
function Stat({ label, value, icon = "📈" }) {
  return (
    <div className="card-panel" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: "1.6rem" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--primary)" }}>{value ?? 0}</div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

function Dashboard({ portal, run, setTab }) {
  const { state, session, lang, showToast } = portal;
  const st = state.stats || {};
  const pendingMembers = (state.members || []).filter((m) => m.status === "pending");
  const pendingPayments = (state.payments || []).filter((p) => p.status === "pending");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel" style={{ background: "var(--hero-deck-bg)", color: "#fff" }}>
        <h2 style={{ color: "#ffd166", margin: "0 0 6px" }}>
          {t(lang, "नमस्कार, सुपर एडमिन", "Welcome, Super Admin")}
        </h2>
        <p style={{ color: "#e2e8f0", margin: "0 0 14px", lineHeight: 1.5 }}>
          {t(
            lang,
            "वेबसाइट के समस्त 14 सेक्शन का संपूर्ण नियंत्रण। प्रत्येक पृष्ठ, टेक्स्ट, फोटो, नियम, शुल्क, सदस्य, सर्कुलर व सुरक्षा लॉग यहीं से बदलें।",
            "Complete control over all 14 website sections. Change every page, text, photo, rule, fee, member, circular and security log from here."
          )}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-white btn-sm" onClick={() => download("/api/export/members.csv", "UPBMS_Members.csv", session)}>
            📥 {t(lang, "सदस्य CSV", "Members CSV")}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => download("/api/export/payments.csv", "UPBMS_Payments.csv", session)}>
            📥 {t(lang, "भुगतान CSV", "Payments CSV")}
          </button>
          <button className="btn btn-white btn-sm" onClick={() => download("/api/export/access-logs.csv", "UPBMS_Logs.csv", session)}>
            📥 {t(lang, "सुरक्षा लॉग CSV", "Security Logs CSV")}
          </button>
          <button className="btn btn-accent btn-sm" onClick={() => download("/api/admin/backup", "UPBMS_Full_Backup.json", session)}>
            💾 {t(lang, "पूर्ण JSON बैकअप", "Full JSON Backup")}
          </button>
          <label className="btn btn-white btn-sm" style={{ cursor: "pointer", margin: 0 }}>
            📤 {t(lang, "बैकअप रिस्टोर", "Restore Backup")}
            <input
              hidden
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  const body = JSON.parse(text);
                  await run("/api/admin/restore", { method: "POST", body }, t(lang, "बैकअप सफलतापूर्वक रिस्टोर हो गया", "Backup restored successfully"));
                } catch (err) {
                  showToast(t(lang, "अमान्य बैकअप फ़ाइल!", "Invalid JSON backup file!"));
                }
              }}
            />
          </label>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm(t(lang, "क्या आप डेमो डेटा रीसेट करना चाहते हैं?", "Are you sure you want to reset to initial seed data?"))) {
                run("/api/admin/reset", { method: "POST" }, t(lang, "डेटा रीसेट हो गया", "Database reset successfully"));
              }
            }}
          >
            ⚠️ {t(lang, "डेटा रीसेट", "Reset Data")}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        <Stat icon="🏛️" label={t(lang, "मुख्य कार्यकारिणी", "Core Executive")} value={st.totalCoreMembers} />
        <Stat icon="👥" label={t(lang, "सक्रिय सदस्य", "Active Members")} value={st.totalActiveMembers} />
        <Stat icon="⏳" label={t(lang, "लंबित सदस्यता", "Pending Members")} value={st.pendingMembersCount} />
        <Stat icon="🗺️" label={t(lang, "आच्छादित जनपद", "Districts Covered")} value={st.districtsCovered} />
        <Stat icon="💰" label={t(lang, "कुल संकलित शुल्क", "Total Collection")} value={`₹${st.totalCollection || 0}`} />
        <Stat icon="💳" label={t(lang, "सत्यापन लंबित रसीदें", "Pending Payments")} value={st.pendingPaymentsCount} />
        <Stat icon="⚖️" label={t(lang, "सुलझी शिकायतें", "Resolved Grievances")} value={st.resolvedGrievances} />
        <Stat icon="📑" label={t(lang, "कुल परिपत्र", "Total Circulars")} value={st.totalCirculars} />
        <Stat icon="📂" label={t(lang, "संघ दस्तावेज़", "Total Documents")} value={st.totalDocuments} />
        <Stat icon="📜" label={t(lang, "प्रमाण-पत्र", "Certificates")} value={st.totalCertificates} />
        <Stat icon="🌐" label={t(lang, "पोर्टल लिंक", "External Portals")} value={st.totalExternalPortals} />
        <Stat icon="🛡️" label={t(lang, "सुरक्षा लॉग", "Audit Access Logs")} value={st.totalAccessLogs} />
      </div>

      {pendingMembers.length > 0 && (
        <div className="card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--primary)", margin: 0 }}>
              ⏳ {t(lang, "लंबित सदस्यता आवेदन", "Pending Membership Applications")} ({pendingMembers.length})
            </h3>
            <button className="btn btn-outline btn-sm" onClick={() => setTab("members")}>
              {t(lang, "सदस्य टैब खोलें", "Open Members Tab")} →
            </button>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {pendingMembers.slice(0, 5).map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <b>{m.nameHi}</b> ({m.nameEn}) • <code>{m.memberCode}</code>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>📍 {m.district} • 📞 {m.mobile} • 🏦 {m.bankName}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-whatsapp btn-sm" onClick={() => run(`/api/members/${m.id}`, { method: "PUT", body: { status: "active" } }, t(lang, "सदस्य स्वीकृत", "Member Approved"))}>
                    ✓ {t(lang, "स्वीकृत करें", "Approve")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingPayments.length > 0 && (
        <div className="card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "var(--primary)", margin: 0 }}>
              💳 {t(lang, "सत्यापन हेतु लंबित भुगतान", "Pending Payment Verifications")} ({pendingPayments.length})
            </h3>
            <button className="btn btn-outline btn-sm" onClick={() => setTab("donation")}>
              {t(lang, "सहयोग / बहीखाता टैब खोलें", "Open Donation Tab")} →
            </button>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {pendingPayments.slice(0, 5).map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <b>{p.receiptNo}</b> • ₹{p.amount} • {p.payerName}
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>UTR: {p.utrNumber} • {p.date} • {p.purposeHi || p.purpose}</div>
                </div>
                <button className="btn btn-whatsapp btn-sm" onClick={() => run(`/api/payments/${p.id}`, { method: "PUT", body: { status: "verified" } }, t(lang, "भुगतान सत्यापित", "Payment Verified"))}>
                  ✓ {t(lang, "सत्यापित करें", "Verify")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== 2. HOME SECTIONS (HERO, SLIDER, CAMPAIGN, STATS, HEADINGS) ==================== */
function HomeSections({ portal, saveSettings, run }) {
  const { state, session, lang, showToast } = portal;
  const cb = state.settings.campaignBlock || {};
  const stats = state.settings.statCards || [];
  const stx = state.settings.sectionTexts || {};
  const [imageUrl, setImageUrl] = useState("");
  const [editSlide, setEditSlide] = useState(null);

  async function addSlide(e) {
    e.preventDefault();
    if (!imageUrl) return showToast(t(lang, "कृपया बैनर छवि चुनें", "Please upload a banner image"));
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (await run("/api/slides", { method: "POST", body: { ...raw, imageUrl, active: true, order: (state.slides || []).length + 1 } }, t(lang, "स्लाइड जुड़ गई", "Slide added"))) {
      e.target.reset();
      setImageUrl("");
    }
  }

  async function updateSlide(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    const payload = { ...raw, imageUrl: imageUrl || editSlide.imageUrl, active: e.target.querySelector("[name=active]").checked, order: Number(raw.order || editSlide.order || 1) };
    if (await run(`/api/slides/${editSlide.id}`, { method: "PUT", body: payload }, t(lang, "स्लाइड अपडेट हो गई", "Slide updated"))) {
      setEditSlide(null);
      setImageUrl("");
    }
  }

  function saveCampaignAndStats(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    const statCards = [0, 1, 2, 3].map((i) => ({
      id: `st-${i + 1}`,
      icon: r[`st_icon_${i}`] || "⭐",
      valueHi: r[`st_valHi_${i}`] || "0",
      valueEn: r[`st_valEn_${i}`] || "0",
      labelHi: r[`st_lblHi_${i}`] || "",
      labelEn: r[`st_lblEn_${i}`] || ""
    }));
    saveSettings({
      campaignBlock: {
        ...cb,
        badgeHi: r.badgeHi, badgeEn: r.badgeEn,
        titleHi: r.titleHi, titleEn: r.titleEn,
        subtitleHi: r.subtitleHi, subtitleEn: r.subtitleEn,
        btn1Hi: r.btn1Hi, btn1En: r.btn1En, btn1Route: r.btn1Route,
        btn2Hi: r.btn2Hi, btn2En: r.btn2En,
        btn3Hi: r.btn3Hi, btn3En: r.btn3En, btn3Route: r.btn3Route
      },
      statCards
    }, t(lang, "अभियान व चारों बॉक्स सेव हो गए", "Campaign block & stat cards saved"));
  }

  function saveHomeHeadings(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({ sectionTexts: { ...stx, ...r } }, t(lang, "होमपेज सेक्शन शीर्षक सेव हो गए", "Homepage section titles saved"));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card-panel">
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          🖼️ {t(lang, "होमपेज 16:9 बैनर स्लाइडर", "Homepage 16:9 Banner Slider")} ({(state.slides || []).length})
        </h3>
        <form className="form-grid" onSubmit={addSlide}>
          <Field label={t(lang, "कैप्शन (हिंदी)", "Caption (Hindi)")}><Inp name="captionHi" placeholder="उदा. प्रांतीय महासम्मेलन लखनऊ" required /></Field>
          <Field label={t(lang, "कैप्शन (English)", "Caption (English)")}><Inp name="captionEn" placeholder="e.g. State Conference Lucknow" required /></Field>
          <Field label={t(lang, "फ़िट मोड", "Fit Mode")}>
            <select className="form-control" name="fitMode" defaultValue="cover">
              <option value="cover">Cover (पूर्ण स्क्रीन भराव)</option>
              <option value="contain">Contain (अनुपात सुरक्षित)</option>
            </select>
          </Field>
          <Field label={t(lang, "बैनर छवि फ़ाइल", "Banner Image File")}>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setImageUrl(await uploadFile(f, session));
                  showToast(t(lang, "छवि तैयार", "Image uploaded successfully"));
                }
              }}
            />
            {imageUrl && <div style={{ fontSize: "0.82rem", color: "green", marginTop: 4 }}>✓ {imageUrl}</div>}
          </Field>
          <button className="btn btn-primary" style={{ gridColumn: "1 / -1" }}>
            + {t(lang, "नई स्लाइड जोड़ें", "Add Slide")}
          </button>
        </form>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14, marginTop: 18 }}>
          {(state.slides || []).map((sl) => (
            <div key={sl.id} className="card-panel" style={{ padding: 0, overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
              <img src={sl.imageUrl} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: sl.fitMode === "contain" ? "contain" : "cover", background: "#061638" }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 800, color: "var(--primary)" }}>{t(lang, sl.captionHi, sl.captionEn)}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                  {t(lang, "मोड:", "Mode:")} {sl.fitMode || "cover"} • {sl.active !== false ? t(lang, "सक्रिय", "Active") : t(lang, "निष्क्रिय", "Inactive")}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setEditSlide(sl);
                      setImageUrl(sl.imageUrl);
                    }}
                  >
                    ✏️ {t(lang, "संपादित करें", "Edit")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (confirm(t(lang, "स्लाइड हटाएँ?", "Delete this slide?"))) {
                        run(`/api/slides/${sl.id}`, { method: "DELETE" }, t(lang, "स्लाइड हटाई गई", "Slide removed"));
                      }
                    }}
                  >
                    🗑️ {t(lang, "हटाएँ", "Delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editSlide && (
        <Modal title={t(lang, "बैनर स्लाइड संशोधन", "Edit Banner Slide")} onClose={() => setEditSlide(null)}>
          <form onSubmit={updateSlide} className="form-grid">
            <Field label={t(lang, "कैप्शन (हिंदी)", "Caption (Hindi)")}><Inp name="captionHi" defaultValue={editSlide.captionHi} required /></Field>
            <Field label={t(lang, "कैप्शन (English)", "Caption (English)")}><Inp name="captionEn" defaultValue={editSlide.captionEn} required /></Field>
            <Field label={t(lang, "फ़िट मोड", "Fit Mode")}>
              <select className="form-control" name="fitMode" defaultValue={editSlide.fitMode || "cover"}>
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
              </select>
            </Field>
            <Field label={t(lang, "क्रम (Order)", "Order")}>
              <Inp name="order" type="number" defaultValue={editSlide.order || 1} />
            </Field>
            <Field label={t(lang, "छवि बदलें", "Replace Image")} full>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImageUrl(await uploadFile(f, session));
                    showToast(t(lang, "नई छवि तैयार", "New image uploaded"));
                  }
                }}
              />
              {imageUrl && <div style={{ fontSize: "0.82rem", color: "green", marginTop: 4 }}>✓ {imageUrl}</div>}
            </Field>
            <label className="form-group full" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <input type="checkbox" name="active" defaultChecked={editSlide.active !== false} />
              {t(lang, "यह स्लाइड सक्रिय रखें", "Keep this slide active")}
            </label>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save Slide")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditSlide(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}

      <form className="card-panel" onSubmit={saveCampaignAndStats}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          🚀 {t(lang, "अभियान विवरण एवं चार मुख्य प्रभाव बॉक्स", "Campaign Impact Deck & 4 Highlight Boxes")}
        </h3>
        <div className="form-grid">
          <Field label={t(lang, "बैज (हिंदी)", "Badge (Hindi)")}><Inp name="badgeHi" defaultValue={cb.badgeHi} /></Field>
          <Field label={t(lang, "बैज (English)", "Badge (English)")}><Inp name="badgeEn" defaultValue={cb.badgeEn} /></Field>
          <Field label={t(lang, "मुख्य शीर्षक (हिंदी)", "Campaign Title (Hindi)")}><Inp name="titleHi" defaultValue={cb.titleHi} required /></Field>
          <Field label={t(lang, "मुख्य शीर्षक (English)", "Campaign Title (English)")}><Inp name="titleEn" defaultValue={cb.titleEn} required /></Field>
          <Field label={t(lang, "उपशीर्षक विवरण (हिंदी)", "Subtitle (Hindi)")} full><Area name="subtitleHi" defaultValue={cb.subtitleHi} rows={3} /></Field>
          <Field label={t(lang, "उपशीर्षक विवरण (English)", "Subtitle (English)")} full><Area name="subtitleEn" defaultValue={cb.subtitleEn} rows={3} /></Field>
          <Field label={t(lang, "बटन 1 (हिंदी)", "Button 1 (Hindi)")}><Inp name="btn1Hi" defaultValue={cb.btn1Hi} /></Field>
          <Field label={t(lang, "बटन 1 (English)", "Button 1 (English)")}><Inp name="btn1En" defaultValue={cb.btn1En} /></Field>
          <Field label={t(lang, "बटन 1 रूट", "Button 1 Route")}><Inp name="btn1Route" defaultValue={cb.btn1Route || "join"} /></Field>
          <Field label={t(lang, "बटन 2 (हिंदी)", "Button 2 (Hindi)")}><Inp name="btn2Hi" defaultValue={cb.btn2Hi} /></Field>
          <Field label={t(lang, "बटन 2 (English)", "Button 2 (English)")}><Inp name="btn2En" defaultValue={cb.btn2En} /></Field>
          <Field label={t(lang, "बटन 3 (हिंदी)", "Button 3 (Hindi)")}><Inp name="btn3Hi" defaultValue={cb.btn3Hi} /></Field>
          <Field label={t(lang, "बटन 3 (English)", "Button 3 (English)")}><Inp name="btn3En" defaultValue={cb.btn3En} /></Field>
          <Field label={t(lang, "बटन 3 रूट", "Button 3 Route")}><Inp name="btn3Route" defaultValue={cb.btn3Route || "grievance"} /></Field>
        </div>

        <h4 style={{ margin: "20px 0 10px", color: "var(--primary-dark)" }}>
          ⭐ {t(lang, "चार मुख्य प्रभाव बॉक्स (Stat Boxes)", "Four Highlight Stat Boxes")}
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => {
            const st = stats[i] || {};
            return (
              <div key={i} style={{ border: "1.5px solid #cbd5e1", borderRadius: 12, padding: 12, background: "#f8fafc", display: "grid", gap: 8 }}>
                <b style={{ color: "var(--primary)" }}>{t(lang, `बॉक्स #${i + 1}`, `Box #${i + 1}`)}</b>
                <Field label={t(lang, "आइकॉन", "Icon")}><Inp name={`st_icon_${i}`} defaultValue={st.icon || "⭐"} /></Field>
                <Field label={t(lang, "मान (हिंदी)", "Value (Hindi)")}><Inp name={`st_valHi_${i}`} defaultValue={st.valueHi || "5,000+"} /></Field>
                <Field label={t(lang, "मान (English)", "Value (English)")}><Inp name={`st_valEn_${i}`} defaultValue={st.valueEn || "5,000+"} /></Field>
                <Field label={t(lang, "लेबल (हिंदी)", "Label (Hindi)")}><Inp name={`st_lblHi_${i}`} defaultValue={st.labelHi || "सक्रिय बैंक मित्र"} /></Field>
                <Field label={t(lang, "लेबल (English)", "Label (English)")}><Inp name={`st_lblEn_${i}`} defaultValue={st.labelEn || "Active Members"} /></Field>
              </div>
            );
          })}
        </div>
        <button className="btn btn-accent" style={{ marginTop: 16 }}>
          {t(lang, "अभियान सेटिंग्स सेव करें", "Save Campaign Settings")}
        </button>
      </form>

      <form className="card-panel" onSubmit={saveHomeHeadings}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          📑 {t(lang, "होमपेज के समस्त सेक्शन शीर्षक व उपशीर्षक", "Homepage Section Titles, Eyebrows & Subtitles")}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          {t(lang, "होमपेज पर प्रदर्शित होने वाले सभी 5 सेक्शन (सर्कुलर, पोर्टल, मांगें, सदस्य, समाचार) के टेक्स्ट बदलें।", "Edit titles, eyebrows and subtitles for all 5 homepage sections.")}
        </p>
        <div className="form-grid">
          <Field label={t(lang, "सर्कुलर सेक्शन आईब्रो (हिंदी)", "Circulars Eyebrow (Hindi)")}><Inp name="homeCircularsEyebrowHi" defaultValue={stx.homeCircularsEyebrowHi} /></Field>
          <Field label={t(lang, "सर्कुलर सेक्शन आईब्रो (English)", "Circulars Eyebrow (English)")}><Inp name="homeCircularsEyebrowEn" defaultValue={stx.homeCircularsEyebrowEn} /></Field>
          <Field label={t(lang, "सर्कुलर मुख्य शीर्षक (हिंदी)", "Circulars Title (Hindi)")}><Inp name="homeCircularsTitleHi" defaultValue={stx.homeCircularsTitleHi} /></Field>
          <Field label={t(lang, "सर्कुलर मुख्य शीर्षक (English)", "Circulars Title (English)")}><Inp name="homeCircularsTitleEn" defaultValue={stx.homeCircularsTitleEn} /></Field>
          <Field label={t(lang, "सर्कुलर उपशीर्षक (हिंदी)", "Circulars Subtitle (Hindi)")}><Inp name="homeCircularsSubHi" defaultValue={stx.homeCircularsSubHi} /></Field>
          <Field label={t(lang, "सर्कुलर उपशीर्षक (English)", "Circulars Subtitle (English)")}><Inp name="homeCircularsSubEn" defaultValue={stx.homeCircularsSubEn} /></Field>

          <Field label={t(lang, "पोर्टल सेक्शन आईब्रो (हिंदी)", "Portals Eyebrow (Hindi)")}><Inp name="homePortalsEyebrowHi" defaultValue={stx.homePortalsEyebrowHi} /></Field>
          <Field label={t(lang, "पोर्टल सेक्शन आईब्रो (English)", "Portals Eyebrow (English)")}><Inp name="homePortalsEyebrowEn" defaultValue={stx.homePortalsEyebrowEn} /></Field>
          <Field label={t(lang, "पोर्टल मुख्य शीर्षक (हिंदी)", "Portals Title (Hindi)")}><Inp name="homePortalsTitleHi" defaultValue={stx.homePortalsTitleHi} /></Field>
          <Field label={t(lang, "पोर्टल मुख्य शीर्षक (English)", "Portals Title (English)")}><Inp name="homePortalsTitleEn" defaultValue={stx.homePortalsTitleEn} /></Field>
          <Field label={t(lang, "पोर्टल उपशीर्षक (हिंदी)", "Portals Subtitle (Hindi)")}><Inp name="homePortalsSubHi" defaultValue={stx.homePortalsSubHi} /></Field>
          <Field label={t(lang, "पोर्टल उपशीर्षक (English)", "Portals Subtitle (English)")}><Inp name="homePortalsSubEn" defaultValue={stx.homePortalsSubEn} /></Field>

          <Field label={t(lang, "मांगें सेक्शन आईब्रो (हिंदी)", "Demands Eyebrow (Hindi)")}><Inp name="homeDemandsEyebrowHi" defaultValue={stx.homeDemandsEyebrowHi} /></Field>
          <Field label={t(lang, "मांगें सेक्शन आईब्रो (English)", "Demands Eyebrow (English)")}><Inp name="homeDemandsEyebrowEn" defaultValue={stx.homeDemandsEyebrowEn} /></Field>
          <Field label={t(lang, "मांगें मुख्य शीर्षक (हिंदी)", "Demands Title (Hindi)")}><Inp name="homeDemandsTitleHi" defaultValue={stx.homeDemandsTitleHi} /></Field>
          <Field label={t(lang, "मांगें मुख्य शीर्षक (English)", "Demands Title (English)")}><Inp name="homeDemandsTitleEn" defaultValue={stx.homeDemandsTitleEn} /></Field>
          <Field label={t(lang, "मांगें उपशीर्षक (हिंदी)", "Demands Subtitle (Hindi)")}><Inp name="homeDemandsSubHi" defaultValue={stx.homeDemandsSubHi} /></Field>
          <Field label={t(lang, "मांगें उपशीर्षक (English)", "Demands Subtitle (English)")}><Inp name="homeDemandsSubEn" defaultValue={stx.homeDemandsSubEn} /></Field>

          <Field label={t(lang, "सदस्य सेक्शन आईब्रो (हिंदी)", "Members Eyebrow (Hindi)")}><Inp name="homeMembersEyebrowHi" defaultValue={stx.homeMembersEyebrowHi} /></Field>
          <Field label={t(lang, "सदस्य सेक्शन आईब्रो (English)", "Members Eyebrow (English)")}><Inp name="homeMembersEyebrowEn" defaultValue={stx.homeMembersEyebrowEn} /></Field>
          <Field label={t(lang, "सदस्य मुख्य शीर्षक (हिंदी)", "Members Title (Hindi)")}><Inp name="homeMembersTitleHi" defaultValue={stx.homeMembersTitleHi} /></Field>
          <Field label={t(lang, "सदस्य मुख्य शीर्षक (English)", "Members Title (English)")}><Inp name="homeMembersTitleEn" defaultValue={stx.homeMembersTitleEn} /></Field>

          <Field label={t(lang, "समाचार सेक्शन आईब्रो (हिंदी)", "News Eyebrow (Hindi)")}><Inp name="homeNewsEyebrowHi" defaultValue={stx.homeNewsEyebrowHi} /></Field>
          <Field label={t(lang, "समाचार सेक्शन आईब्रो (English)", "News Eyebrow (English)")}><Inp name="homeNewsEyebrowEn" defaultValue={stx.homeNewsEyebrowEn} /></Field>
          <Field label={t(lang, "समाचार मुख्य शीर्षक (हिंदी)", "News Title (Hindi)")}><Inp name="homeNewsTitleHi" defaultValue={stx.homeNewsTitleHi} /></Field>
          <Field label={t(lang, "समाचार मुख्य शीर्षक (English)", "News Title (English)")}><Inp name="homeNewsTitleEn" defaultValue={stx.homeNewsTitleEn} /></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }}>
          {t(lang, "होमपेज शीर्षक सेव करें", "Save Homepage Headings")}
        </button>
      </form>
    </div>
  );
}

/* ==================== 3. ABOUT US & CERTIFICATES ==================== */
function About({ portal, saveSettings, run }) {
  const { state, session, lang, showToast } = portal;
  const avm = state.settings.aboutVisionMission || {};
  const [file, setFile] = useState({ url: "", type: "image" });
  const [editCert, setEditCert] = useState(null);

  function save(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({
      aboutVisionMission: {
        ...avm,
        ...raw,
        missionPointsHi: lines(raw.missionPointsHi),
        missionPointsEn: lines(raw.missionPointsEn)
      }
    }, t(lang, "परिचय, विज़न व मिशन सेव हो गया", "About, Vision & Mission saved"));
  }

  async function addCert(e) {
    e.preventDefault();
    if (!file.url) return showToast(t(lang, "पहले प्रमाण-पत्र फाइल चुनें", "Please upload a certificate file"));
    const raw = Object.fromEntries(new FormData(e.target).entries());
    raw.fileUrl = file.url;
    raw.fileType = file.type;
    raw.requiresMemberLogin = e.target.querySelector("[name=requiresMemberLogin]").checked;
    if (await run("/api/certificates", { method: "POST", body: raw }, t(lang, "प्रमाण-पत्र जोड़ा गया", "Certificate Added"))) {
      e.target.reset();
      setFile({ url: "", type: "image" });
    }
  }

  async function updateCert(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (file.url) {
      raw.fileUrl = file.url;
      raw.fileType = file.type;
    }
    raw.requiresMemberLogin = e.target.querySelector("[name=requiresMemberLogin]").checked;
    if (await run(`/api/certificates/${editCert.id}`, { method: "PUT", body: raw }, t(lang, "प्रमाण-पत्र अपडेट हो गया", "Certificate updated"))) {
      setEditCert(null);
      setFile({ url: "", type: "image" });
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="card-panel" onSubmit={save}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          🏛️ {t(lang, "परिचय, दृष्टिकोण (Vision) एवं संकल्प (Mission)", "About Us, Vision & Mission")}
        </h3>
        <div className="form-grid">
          <Field label={t(lang, "परिचय शीर्षक (हिंदी)", "About Title (Hindi)")}><Inp name="aboutTitleHi" defaultValue={avm.aboutTitleHi} required /></Field>
          <Field label={t(lang, "परिचय शीर्षक (English)", "About Title (English)")}><Inp name="aboutTitleEn" defaultValue={avm.aboutTitleEn} required /></Field>
          <Field label={t(lang, "परिचय विस्तृत विवरण (हिंदी)", "About Body (Hindi)")} full><Area name="aboutBodyHi" defaultValue={avm.aboutBodyHi} rows={5} /></Field>
          <Field label={t(lang, "परिचय विस्तृत विवरण (English)", "About Body (English)")} full><Area name="aboutBodyEn" defaultValue={avm.aboutBodyEn} rows={5} /></Field>
          <Field label={t(lang, "विज़न शीर्षक (हिंदी)", "Vision Title (Hindi)")}><Inp name="visionTitleHi" defaultValue={avm.visionTitleHi} /></Field>
          <Field label={t(lang, "विज़न शीर्षक (English)", "Vision Title (English)")}><Inp name="visionTitleEn" defaultValue={avm.visionTitleEn} /></Field>
          <Field label={t(lang, "विज़न विवरण (हिंदी)", "Vision Body (Hindi)")} full><Area name="visionBodyHi" defaultValue={avm.visionBodyHi} rows={4} /></Field>
          <Field label={t(lang, "विज़न विवरण (English)", "Vision Body (English)")} full><Area name="visionBodyEn" defaultValue={avm.visionBodyEn} rows={4} /></Field>
          <Field label={t(lang, "मिशन शीर्षक (हिंदी)", "Mission Title (Hindi)")}><Inp name="missionTitleHi" defaultValue={avm.missionTitleHi} /></Field>
          <Field label={t(lang, "मिशन शीर्षक (English)", "Mission Title (English)")}><Inp name="missionTitleEn" defaultValue={avm.missionTitleEn} /></Field>
          <Field label={t(lang, "मिशन मुख्य बिंदु (प्रति पंक्ति 1 बिंदु - हिंदी)", "Mission Points (1 per line - Hindi)")} full>
            <Area name="missionPointsHi" defaultValue={(avm.missionPointsHi || []).join("\n")} rows={5} />
          </Field>
          <Field label={t(lang, "मिशन मुख्य बिंदु (प्रति पंक्ति 1 बिंदु - English)", "Mission Points (1 per line - English)")} full>
            <Area name="missionPointsEn" defaultValue={(avm.missionPointsEn || []).join("\n")} rows={5} />
          </Field>
          <Field label={t(lang, "प्रमाण-पत्र सेक्शन शीर्षक (हिंदी)", "Certificates Section Title (Hindi)")}><Inp name="certSectionTitleHi" defaultValue={avm.certSectionTitleHi} /></Field>
          <Field label={t(lang, "प्रमाण-पत्र सेक्शन शीर्षक (English)", "Certificates Section Title (English)")}><Inp name="certSectionTitleEn" defaultValue={avm.certSectionTitleEn} /></Field>
          <Field label={t(lang, "प्रमाण-पत्र उपशीर्षक (हिंदी)", "Certificates Subtitle (Hindi)")}><Inp name="certSectionSubHi" defaultValue={avm.certSectionSubHi} /></Field>
          <Field label={t(lang, "प्रमाण-पत्र उपशीर्षक (English)", "Certificates Subtitle (English)")}><Inp name="certSectionSubEn" defaultValue={avm.certSectionSubEn} /></Field>
          <Field label={t(lang, "कार्यकारिणी सेक्शन शीर्षक (हिंदी)", "Core Executive Title (Hindi)")}><Inp name="coreSectionTitleHi" defaultValue={avm.coreSectionTitleHi} /></Field>
          <Field label={t(lang, "कार्यकारिणी सेक्शन शीर्षक (English)", "Core Executive Title (English)")}><Inp name="coreSectionTitleEn" defaultValue={avm.coreSectionTitleEn} /></Field>
          <Field label={t(lang, "कार्यकारिणी उपशीर्षक (हिंदी)", "Core Executive Subtitle (Hindi)")}><Inp name="coreSectionSubHi" defaultValue={avm.coreSectionSubHi} /></Field>
          <Field label={t(lang, "कार्यकारिणी उपशीर्षक (English)", "Core Executive Subtitle (English)")}><Inp name="coreSectionSubEn" defaultValue={avm.coreSectionSubEn} /></Field>
        </div>
        <button className="btn btn-accent" style={{ marginTop: 14 }}>
          {t(lang, "परिचय विवरण सेव करें", "Save About & Vision")}
        </button>
      </form>

      <div className="card-panel">
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          📜 {t(lang, "वैधानिक प्रमाण-पत्र एवं सम्मान", "Certificates & Accreditations")} ({(state.certificates || []).length})
        </h3>
        <form onSubmit={addCert} className="form-grid">
          <Field label={t(lang, "नाम (हिंदी)", "Certificate Title (Hindi)")}><Inp name="titleHi" placeholder="उदा. संघीय पंजीयन प्रमाण-पत्र" required /></Field>
          <Field label={t(lang, "नाम (English)", "Certificate Title (English)")}><Inp name="titleEn" placeholder="e.g. Official Registration Certificate" required /></Field>
          <Field label={t(lang, "जारीकर्ता (हिंदी)", "Issuer (Hindi)")}><Inp name="issuerHi" placeholder="उदा. रजिस्ट्रार, फर्म्स सोसाइटीज" /></Field>
          <Field label={t(lang, "जारीकर्ता (English)", "Issuer (English)")}><Inp name="issuerEn" placeholder="e.g. Registrar of Societies" /></Field>
          <Field label={t(lang, "पंजीयन / क्रमांक", "Registration / Reference No.")}><Inp name="regRef" placeholder="उदा. UP-REG-2024-8841" /></Field>
          <Field label={t(lang, "जारी दिनांक", "Date of Issue")}><Inp name="date" type="date" defaultValue={today()} /></Field>
          <Field label={t(lang, "प्रमाण-पत्र फ़ाइल (छवि या PDF)", "Certificate File (Image or PDF)")} full>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadFile(f, session);
                setFile({ url, type: f.type === "application/pdf" ? "pdf" : "image" });
                showToast(t(lang, "फ़ाइल अपलोड हो गई", "File uploaded successfully"));
              }}
            />
            {file.url && <div style={{ fontSize: "0.82rem", color: "green", marginTop: 4 }}>✓ {file.url}</div>}
          </Field>
          <label className="form-group full" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <input type="checkbox" name="requiresMemberLogin" />
            {t(lang, "केवल सदस्य लॉगिन के बाद दिखाएँ (सुरक्षित दस्तावेज़)", "Lock: Show only to active logged-in members")}
          </label>
          <button className="btn btn-primary" style={{ gridColumn: "1 / -1" }}>
            + {t(lang, "प्रमाण-पत्र जोड़ें", "Add Certificate")}
          </button>
        </form>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginTop: 18 }}>
          {(state.certificates || []).map((c) => (
            <div key={c.id} className="card-panel" style={{ border: "1.5px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <b>{t(lang, c.titleHi, c.titleEn)}</b>
                <span className={`badge ${c.requiresMemberLogin ? "badge-pending" : "badge-verified"}`}>
                  {c.requiresMemberLogin ? t(lang, "🔒 लॉक", "🔒 Locked") : t(lang, "🌐 सार्वजनिक", "🌐 Public")}
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>
                {c.issuerHi || c.issuerEn} • {c.regRef} • {c.date}
              </div>
              {c.fileUrl && (
                <div style={{ marginTop: 8 }}>
                  <a href={c.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ padding: "3px 8px", fontSize: "0.78rem" }}>
                    👁️ {t(lang, "फ़ाइल देखें", "View File")}
                  </a>
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditCert(c);
                    setFile({ url: c.fileUrl || "", type: c.fileType || "image" });
                  }}
                >
                  ✏️ {t(lang, "संशोधित करें", "Edit")}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => run(`/api/certificates/${c.id}`, { method: "PUT", body: { requiresMemberLogin: !c.requiresMemberLogin } }, t(lang, "सुरक्षा स्थिति बदली", "Lock toggled"))}
                >
                  {c.requiresMemberLogin ? t(lang, "अनलॉक", "Unlock") : t(lang, "लॉक", "Lock")}
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (confirm(t(lang, "प्रमाण-पत्र हटाएँ?", "Delete this certificate?"))) {
                      run(`/api/certificates/${c.id}`, { method: "DELETE" }, t(lang, "प्रमाण-पत्र हटाया गया", "Certificate deleted"));
                    }
                  }}
                >
                  🗑️ {t(lang, "हटाएँ", "Delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editCert && (
        <Modal title={t(lang, "प्रमाण-पत्र संशोधन", "Edit Certificate")} onClose={() => setEditCert(null)}>
          <form onSubmit={updateCert} className="form-grid">
            <Field label={t(lang, "नाम (हिंदी)", "Title (Hindi)")}><Inp name="titleHi" defaultValue={editCert.titleHi} required /></Field>
            <Field label={t(lang, "नाम (English)", "Title (English)")}><Inp name="titleEn" defaultValue={editCert.titleEn} required /></Field>
            <Field label={t(lang, "जारीकर्ता (हिंदी)", "Issuer (Hindi)")}><Inp name="issuerHi" defaultValue={editCert.issuerHi} /></Field>
            <Field label={t(lang, "जारीकर्ता (English)", "Issuer (English)")}><Inp name="issuerEn" defaultValue={editCert.issuerEn} /></Field>
            <Field label={t(lang, "पंजीयन / क्रमांक", "Reg / Ref Number")}><Inp name="regRef" defaultValue={editCert.regRef} /></Field>
            <Field label={t(lang, "जारी दिनांक", "Date")}><Inp name="date" type="date" defaultValue={editCert.date} /></Field>
            <Field label={t(lang, "फ़ाइल बदलें (वैकल्पिक)", "Replace File (Optional)")} full>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = await uploadFile(f, session);
                  setFile({ url, type: f.type === "application/pdf" ? "pdf" : "image" });
                  showToast(t(lang, "नई फ़ाइल अपलोड हुई", "New file uploaded"));
                }}
              />
              {file.url && <div style={{ fontSize: "0.82rem", color: "green", marginTop: 4 }}>✓ {file.url}</div>}
            </Field>
            <label className="form-group full" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <input type="checkbox" name="requiresMemberLogin" defaultChecked={editCert.requiresMemberLogin} />
              {t(lang, "केवल सदस्य लॉगिन के बाद दिखाएँ", "Show only to logged-in members")}
            </label>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save Changes")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditCert(null)}>{t(lang, "रद्द करें", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ==================== 4. MEMBERS DIRECTORY & MASTER LISTS ==================== */
function Members({ portal, run }) {
  const { state, session, lang, showToast } = portal;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState(null);

  const rows = (state.members || []).filter((m) => {
    if (filter === "core" && !m.isCoreMember) return false;
    if (filter === "general" && m.isCoreMember) return false;
    if (filter === "pending" && m.status !== "pending") return false;
    if (filter === "active" && m.status !== "active") return false;
    if (q) {
      const match = `${m.nameHi} ${m.nameEn} ${m.memberCode} ${m.mobile} ${m.district} ${m.koCode} ${m.bankName}`.toLowerCase();
      if (!match.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  async function saveMeta(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    await run("/api/meta", {
      method: "PUT",
      body: { districts: lines(r.districts), banks: lines(r.banks), bcCompanies: lines(r.bcCompanies) }
    }, t(lang, "मास्टर सूचियाँ (जनपद, बैंक, बीसी) सेव हो गईं", "Master lists saved"));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ color: "var(--primary)", margin: 0 }}>
            👥 {t(lang, "सदस्य प्रबंधन एवं कार्यकारिणी", "Member Directory & Management")} ({rows.length})
          </h3>
          <button className="btn btn-accent btn-sm" onClick={() => setEdit({})}>
            + {t(lang, "नया सदस्य जोड़ें", "Add New Member")}
          </button>
        </div>

        <div className="filter-bar" style={{ marginTop: 12 }}>
          <Inp value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "नाम, सदस्य आईडी, मोबाइल, जनपद या बैंक से खोजें...", "Search name, member code, mobile, district or bank...")} />
          <select className="form-control" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: "auto" }}>
            <option value="all">{t(lang, `सभी सदस्य (${(state.members || []).length})`, `All Members (${(state.members || []).length})`)}</option>
            <option value="core">{t(lang, "मुख्य कार्यकारिणी (Core)", "Core Committee")}</option>
            <option value="general">{t(lang, "सामान्य सदस्य (General)", "General Members")}</option>
            <option value="active">{t(lang, "सक्रिय (Active)", "Active")}</option>
            <option value="pending">{t(lang, "लंबित (Pending)", "Pending")}</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t(lang, "सदस्य संख्या / श्रेणी", "Member Code / Category")}</th>
                <th>{t(lang, "नाम व पदनाम", "Name & Role")}</th>
                <th>{t(lang, "जनपद व बैंक", "District & Bank")}</th>
                <th>{t(lang, "मोबाइल / KO कोड", "Mobile / KO Code")}</th>
                <th>{t(lang, "स्थिति", "Status")}</th>
                <th>{t(lang, "कार्य", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>
                    <b>{m.memberCode}</b><br />
                    <span className="badge badge-active">{m.isCoreMember ? "CORE" : "GENERAL"}</span>
                  </td>
                  <td>
                    <b>{t(lang, m.nameHi, m.nameEn)}</b><br />
                    <small>{t(lang, m.designationHi, m.designationEn)}</small>
                  </td>
                  <td>
                    {m.district}<br />
                    <small>{m.bankName}</small>
                  </td>
                  <td>
                    {m.mobile}<br />
                    <small>{m.koCode || "—"}</small>
                  </td>
                  <td>
                    <span className={`badge badge-${m.status === "active" ? "active" : "pending"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {m.status !== "active" && (
                        <button className="btn btn-whatsapp btn-sm" onClick={() => run(`/api/members/${m.id}`, { method: "PUT", body: { status: "active" } }, t(lang, "सदस्यता स्वीकृत", "Member Approved"))}>
                          ✓ {t(lang, "स्वीकृत", "Approve")}
                        </button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => setEdit(m)}>
                        ✏️ {t(lang, "संशोधित", "Edit")}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          const p = prompt(t(lang, "नया पासवर्ड दर्ज करें:", "Enter new password:"), "123456");
                          if (p) run(`/api/members/${m.id}/reset-password`, { method: "POST", body: { newPassword: p } }, t(lang, "पासवर्ड रीसेट हो गया", "Password reset successfully"));
                        }}
                      >
                        🔑 {t(lang, "पासवर्ड", "PIN")}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(t(lang, `सदस्य ${m.memberCode} को हटाएं?`, `Delete member ${m.memberCode}?`))) {
                            run(`/api/members/${m.id}`, { method: "DELETE" }, t(lang, "सदस्य हटा दिया गया", "Member deleted"));
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {edit && (
        <MemberForm
          member={edit.id ? edit : null}
          state={state}
          session={session}
          run={run}
          onClose={() => setEdit(null)}
          showToast={showToast}
          lang={lang}
        />
      )}

      <form className="card-panel" onSubmit={saveMeta}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          🗂️ {t(lang, "मास्टर सूचियाँ: 75 जनपद, बैंक और बीसी कंपनियाँ", "Master Lists: 75 Districts, Banks & BC Companies")}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          {t(lang, "प्रत्येक सूची में प्रति पंक्ति एक प्रविष्टि दर्ज करें। ड्रॉपडाउन मेनू स्वतः अपडेट होंगे।", "Enter one item per line. Dropdown menus throughout the portal will update automatically.")}
        </p>
        <div className="form-grid">
          <Field label={t(lang, `संबद्ध बैंक (${(state.meta?.banks || []).length})`, `Affiliated Banks (${(state.meta?.banks || []).length})`)}>
            <Area name="banks" defaultValue={(state.meta?.banks || []).join("\n")} rows={8} />
          </Field>
          <Field label={t(lang, `बीसी कंपनियाँ (${(state.meta?.bcCompanies || []).length})`, `BC Companies (${(state.meta?.bcCompanies || []).length})`)}>
            <Area name="bcCompanies" defaultValue={(state.meta?.bcCompanies || []).join("\n")} rows={8} />
          </Field>
          <Field label={t(lang, `जनपद सूची (${(state.meta?.districts || []).length})`, `Districts (${(state.meta?.districts || []).length})`)} full>
            <Area name="districts" defaultValue={(state.meta?.districts || []).join("\n")} rows={8} />
          </Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }}>
          {t(lang, "मास्टर सूचियाँ सेव करें", "Save Master Lists")}
        </button>
      </form>
    </div>
  );
}

function MemberForm({ member, state, session, run, onClose, showToast, lang }) {
  const cur = member || {
    status: "active",
    bloodGroup: "O+",
    designationHi: "सक्रिय बैंक मित्र सदस्य",
    designationEn: "Active Bank Mitra Member",
    feePaid: 500,
    displayOrder: 50,
    district: state.meta?.districts?.[0] || "कानपुर नगर (Kanpur Nagar)",
    bankName: state.meta?.banks?.[0] || "State Bank of India (SBI)",
    bcCompany: state.meta?.bcCompanies?.[0] || "CSC e-Governance Services India Ltd."
  };
  const sigs = state.settings.signatories || [];
  const letterIds = cur.letterSignatoryIds || (cur.signatoryId ? [cur.signatoryId] : state.settings.defaultSignatoryIds || []);
  const [photoUrl, setPhotoUrl] = useState(cur.photoUrl || "");

  async function submit(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.isCoreMember = e.target.querySelector("[name=isCoreMember]").checked;
    payload.photoUrl = photoUrl;
    payload.displayOrder = Number(payload.displayOrder || 50);
    payload.feePaid = Number(payload.feePaid || 0);
    payload.letterSignatoryIds = [...e.target.querySelectorAll("[name=letterSig]:checked")].map((el) => el.value);
    if (!payload.letterSignatoryIds.length) payload.letterSignatoryIds = [payload.signatoryId || sigs[0]?.id || "sig-gs"];
    payload.fromAdmin = true;
    const ok = member
      ? await run(`/api/members/${member.id}`, { method: "PUT", body: payload }, t(lang, "सदस्य विवरण अपडेट", "Member updated"))
      : await run("/api/members", { method: "POST", body: payload }, t(lang, "नया सदस्य जोड़ा गया", "New member created"));
    if (ok) onClose();
  }

  return (
    <Modal title={member ? `${t(lang, "संशोधन:", "Edit Member:")} ${member.memberCode}` : t(lang, "नया सदस्य पंजीकरण", "Register New Member")} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <Field label={t(lang, "नाम (हिंदी)", "Name (Hindi)")}><Inp name="nameHi" defaultValue={cur.nameHi} required /></Field>
          <Field label={t(lang, "नाम (English)", "Name (English)")}><Inp name="nameEn" defaultValue={cur.nameEn} required /></Field>
          <Field label={t(lang, "पिता का नाम (हिंदी)", "Father Name (Hindi)")}><Inp name="fatherName" defaultValue={cur.fatherName} /></Field>
          <Field label={t(lang, "पिता का नाम (English)", "Father Name (English)")}><Inp name="fatherNameEn" defaultValue={cur.fatherNameEn} /></Field>
          <Field label={t(lang, "पदनाम (हिंदी)", "Designation (Hindi)")}><Inp name="designationHi" defaultValue={cur.designationHi} required /></Field>
          <Field label={t(lang, "पदनाम (English)", "Designation (English)")}><Inp name="designationEn" defaultValue={cur.designationEn} required /></Field>
          <Field label={t(lang, "जनपद", "District")}>
            <select className="form-control" name="district" defaultValue={cur.district}>
              {(state.meta?.districts || []).map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label={t(lang, "ब्लॉक / तहसील", "Block / Tehsil")}><Inp name="block" defaultValue={cur.block} /></Field>
          <Field label={t(lang, "संबद्ध बैंक", "Affiliated Bank")}>
            <select className="form-control" name="bankName" defaultValue={cur.bankName}>
              {(state.meta?.banks || []).map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label={t(lang, "बीसी कंपनी", "BC Company")}>
            <select className="form-control" name="bcCompany" defaultValue={cur.bcCompany}>
              {(state.meta?.bcCompanies || []).map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label={t(lang, "KO / CSP कोड", "KO / CSP Code")}><Inp name="koCode" defaultValue={cur.koCode} /></Field>
          <Field label={t(lang, "मोबाइल नंबर", "Mobile Number")}><Inp name="mobile" defaultValue={cur.mobile} required /></Field>
          <Field label={t(lang, "व्हाट्सएप नंबर", "WhatsApp Number")}><Inp name="whatsapp" defaultValue={cur.whatsapp || cur.mobile} /></Field>
          <Field label={t(lang, "ईमेल पता", "Email Address")}><Inp name="email" type="email" defaultValue={cur.email} /></Field>
          <Field label={t(lang, "वेबसाइट लिंक", "Website Link")}><Inp name="websiteUrl" defaultValue={cur.websiteUrl || cur.website || ""} placeholder="https://..." type="url" /></Field>
          <Field label={t(lang, "रक्त समूह", "Blood Group")}>
            <select className="form-control" name="bloodGroup" defaultValue={cur.bloodGroup || "O+"}>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => <option key={bg}>{bg}</option>)}
            </select>
          </Field>
          <Field label={t(lang, "क्रम (Display Order)", "Display Order")}><Inp name="displayOrder" type="number" defaultValue={cur.displayOrder || 50} /></Field>
          <Field label={t(lang, "शामिल होने की तिथि", "Joined Date")}><Inp name="joinedDate" type="date" defaultValue={cur.joinedDate || today()} /></Field>
          <Field label={t(lang, "वैधता अंतिम तिथि", "Valid Until")}><Inp name="validUntil" type="date" defaultValue={cur.validUntil || "2027-12-31"} /></Field>
          <Field label={t(lang, "सदस्यता स्थिति", "Membership Status")}>
            <select className="form-control" name="status" defaultValue={cur.status || "active"}>
              <option value="active">{t(lang, "सक्रिय (Active)", "Active")}</option>
              <option value="pending">{t(lang, "लंबित (Pending)", "Pending")}</option>
              <option value="suspended">{t(lang, "निलंबित (Suspended)", "Suspended")}</option>
            </select>
          </Field>
          <Field label={t(lang, "ID कार्ड प्राथमिक हस्ताक्षरकर्ता", "Primary ID Card Signatory")}>
            <select className="form-control" name="signatoryId" defaultValue={cur.signatoryId || state.settings.defaultSignatoryId}>
              {sigs.map((sg) => <option key={sg.id} value={sg.id}>{sg.nameHi} ({sg.designationHi})</option>)}
            </select>
          </Field>
          {!member && (
            <Field label={t(lang, "लॉगिन पासवर्ड", "Login Password")}>
              <Inp name="password" defaultValue="123456" required />
            </Field>
          )}
          <Field label={t(lang, "जमा शुल्क राशि (₹)", "Fee Paid (₹)")}>
            <Inp name="feePaid" type="number" defaultValue={cur.feePaid || 500} />
          </Field>
          <label className="form-group full" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <input type="checkbox" name="isCoreMember" defaultChecked={cur.isCoreMember} />
            {t(lang, "प्रदेश मुख्य कार्यकारिणी सदस्य (Core Executive Member)", "State Core Executive Committee Member")}
          </label>
          <div className="form-group full">
            <span className="form-label">{t(lang, "नियुक्ति पत्र पर हस्ताक्षरकर्ता चुनें:", "Signatories on Appointment Letter:")}</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
              {sigs.map((sg) => (
                <label key={sg.id} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px", background: "#f8fafc" }}>
                  <input type="checkbox" name="letterSig" value={sg.id} defaultChecked={letterIds.includes(sg.id)} /> {sg.nameHi}
                </label>
              ))}
            </div>
          </div>
          <Field label={t(lang, "संदेश (हिंदी)", "Message (Hindi)")} full><Area name="messageHi" defaultValue={cur.messageHi} rows={2} /></Field>
          <Field label={t(lang, "संदेश (English)", "Message (English)")} full><Area name="messageEn" defaultValue={cur.messageEn} rows={2} /></Field>
          <Field label={t(lang, "पासपोर्ट फोटो", "Passport Photo")} full>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {photoUrl && <img src={photoUrl} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: "50%", border: "2px solid var(--primary)" }} />}
              <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setPhotoUrl(await uploadFile(f, session)); showToast(t(lang, "फोटो तैयार", "Photo uploaded")); } }} />
            </div>
          </Field>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn btn-accent">{t(lang, "सेव करें", "Save Member")}</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>{t(lang, "रद्द", "Cancel")}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ==================== 5. CIRCULARS & ORDERS ==================== */
function Circulars({ portal, run }) {
  const { state, session, lang, showToast } = portal;
  const [file, setFile] = useState({ url: "", type: "image" });
  const [editCir, setEditCir] = useState(null);

  async function add(e) {
    e.preventDefault();
    if (!file.url) return showToast(t(lang, "कृपया सर्कुलर फ़ाइल चुनें", "Please choose a circular file"));
    const raw = Object.fromEntries(new FormData(e.target).entries());
    raw.fileUrl = file.url;
    raw.fileType = file.type;
    raw.requiresMemberLogin = e.target.querySelector("[name=requiresMemberLogin]").checked;
    if (await run("/api/circulars", { method: "POST", body: raw }, t(lang, "सर्कुलर प्रकाशित हो गया", "Circular Published"))) {
      e.target.reset();
      setFile({ url: "", type: "image" });
    }
  }

  async function update(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (file.url) {
      raw.fileUrl = file.url;
      raw.fileType = file.type;
    }
    raw.requiresMemberLogin = e.target.querySelector("[name=requiresMemberLogin]").checked;
    if (await run(`/api/circulars/${editCir.id}`, { method: "PUT", body: raw }, t(lang, "सर्कुलर संशोधित हो गया", "Circular updated"))) {
      setEditCir(null);
      setFile({ url: "", type: "image" });
    }
  }

  return (
    <div className="card-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ color: "var(--primary)", margin: 0 }}>
          📑 {t(lang, "बैंक मित्र परिपत्र एवं आदेश (Circulars & Orders)", "Circulars & Government Orders")} ({(state.circulars || []).length})
        </h3>
      </div>

      <form className="form-grid" onSubmit={add} style={{ marginTop: 14 }}>
        <Field label={t(lang, "शीर्षक (हिंदी)", "Title (Hindi)")}><Inp name="titleHi" placeholder="उदा. टीडीएस धारा 194N संबंधी शासनादेश" required /></Field>
        <Field label={t(lang, "शीर्षक (English)", "Title (English)")}><Inp name="titleEn" placeholder="e.g. Government Order on TDS Section 194N" required /></Field>
        <Field label={t(lang, "जारीकर्ता (हिंदी)", "Issuer (Hindi)")}><Inp name="issuerHi" placeholder="उदा. वित्त मंत्रालय / प्रांतीय कार्यालय" /></Field>
        <Field label={t(lang, "जारीकर्ता (English)", "Issuer (English)")}><Inp name="issuerEn" placeholder="e.g. Finance Dept / State Office" /></Field>
        <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue="महत्वपूर्ण परिपत्र" /></Field>
        <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue="Important Circular" /></Field>
        <Field label={t(lang, "दिनांक", "Date")}><Inp name="date" type="date" defaultValue={today()} /></Field>
        <Field label={t(lang, "सर्कुलर फ़ाइल (PDF या छवि)", "Circular File (PDF or Image)")}>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile({ url: await uploadFile(f, session), type: f.type === "application/pdf" ? "pdf" : "image" });
                showToast(t(lang, "फ़ाइल तैयार", "File uploaded"));
              }
            }}
          />
          {file.url && <div style={{ fontSize: "0.82rem", color: "green", marginTop: 4 }}>✓ {file.url}</div>}
        </Field>
        <label className="form-group full" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <input type="checkbox" name="requiresMemberLogin" />
          {t(lang, "सदस्य लॉगिन के बाद ही दिखाएँ (सुरक्षित)", "Lock: Visible only after member login")}
        </label>
        <button className="btn btn-accent" style={{ gridColumn: "1 / -1" }}>
          + {t(lang, "सर्कुलर प्रकाशित करें", "Publish Circular")}
        </button>
      </form>

      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {(state.circulars || []).map((c) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", flexWrap: "wrap", gap: 8 }}>
            <div>
              <b>{t(lang, c.titleHi, c.titleEn)}</b>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                📅 {c.date} • {t(lang, c.issuerHi || "UPBMS", c.issuerEn || "UPBMS")} • {c.requiresMemberLogin ? <span className="badge badge-pending">🔒 {t(lang, "लॉक", "Locked")}</span> : <span className="badge badge-verified">🌐 {t(lang, "सार्वजनिक", "Public")}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {c.fileUrl && (
                <a href={c.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  👁️ {t(lang, "देखें", "View")}
                </a>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditCir(c);
                  setFile({ url: c.fileUrl || "", type: c.fileType || "pdf" });
                }}
              >
                ✏️ {t(lang, "संपादित करें", "Edit")}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => run(`/api/circulars/${c.id}`, { method: "PUT", body: { requiresMemberLogin: !c.requiresMemberLogin } }, t(lang, "स्थिति बदली", "Status updated"))}
              >
                {c.requiresMemberLogin ? t(lang, "सार्वजनिक", "Make Public") : t(lang, "लॉक", "Lock")}
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (confirm(t(lang, "सर्कुलर हटाएँ?", "Delete this circular?"))) {
                    run(`/api/circulars/${c.id}`, { method: "DELETE" }, t(lang, "सर्कुलर हटाया गया", "Circular deleted"));
                  }
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {editCir && (
        <Modal title={t(lang, "सर्कुलर संशोधित करें", "Edit Circular")} onClose={() => setEditCir(null)}>
          <form onSubmit={update} className="form-grid">
            <Field label={t(lang, "शीर्षक (हिंदी)", "Title (Hindi)")}><Inp name="titleHi" defaultValue={editCir.titleHi} required /></Field>
            <Field label={t(lang, "शीर्षक (English)", "Title (English)")}><Inp name="titleEn" defaultValue={editCir.titleEn} required /></Field>
            <Field label={t(lang, "जारीकर्ता (हिंदी)", "Issuer (Hindi)")}><Inp name="issuerHi" defaultValue={editCir.issuerHi} /></Field>
            <Field label={t(lang, "जारीकर्ता (English)", "Issuer (English)")}><Inp name="issuerEn" defaultValue={editCir.issuerEn} /></Field>
            <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue={editCir.categoryHi} /></Field>
            <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue={editCir.categoryEn} /></Field>
            <Field label={t(lang, "दिनांक", "Date")}><Inp name="date" type="date" defaultValue={editCir.date} /></Field>
            <Field label={t(lang, "फ़ाइल बदलें (वैकल्पिक)", "Replace File (Optional)")}>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile({ url: await uploadFile(f, session), type: f.type === "application/pdf" ? "pdf" : "image" });
                    showToast(t(lang, "नई फ़ाइल तैयार", "New file uploaded"));
                  }
                }}
              />
              {file.url && <div style={{ fontSize: "0.82rem", color: "green", marginTop: 4 }}>✓ {file.url}</div>}
            </Field>
            <label className="form-group full" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <input type="checkbox" name="requiresMemberLogin" defaultChecked={editCir.requiresMemberLogin} />
              {t(lang, "सदस्य लॉगिन के बाद ही दिखाएँ", "Visible only after login")}
            </label>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save Changes")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditCir(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ==================== 6. DOCUMENTS & DEMANDS ==================== */
function Documents({ portal, run }) {
  const { state, lang } = portal;
  const officers = state.settings.signatories || [];
  const [editDoc, setEditDoc] = useState(null);
  const [editDemand, setEditDemand] = useState(null);

  async function addDoc(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.signatoryIds = [...e.target.querySelectorAll("[name=docSig]:checked")].map((el) => el.value);
    if (!payload.signatoryIds.length) payload.signatoryIds = [officers[0]?.id || "sig-gs"];
    delete payload.docSig;
    if (await run("/api/documents", { method: "POST", body: payload }, t(lang, "दस्तावेज़ जोड़ा गया", "Document added"))) {
      e.target.reset();
    }
  }

  async function updateDoc(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.signatoryIds = [...e.target.querySelectorAll("[name=docSig]:checked")].map((el) => el.value);
    if (!payload.signatoryIds.length) payload.signatoryIds = [officers[0]?.id || "sig-gs"];
    delete payload.docSig;
    if (await run(`/api/documents/${editDoc.id}`, { method: "PUT", body: payload }, t(lang, "दस्तावेज़ संशोधित हो गया", "Document updated"))) {
      setEditDoc(null);
    }
  }

  async function addDemand(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.number = Number(payload.number || (state.demands?.length || 0) + 1);
    if (await run("/api/demands", { method: "POST", body: payload }, t(lang, "मांग जोड़ी गई", "Demand added"))) {
      e.target.reset();
    }
  }

  async function updateDemand(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.number = Number(payload.number);
    if (await run(`/api/demands/${editDemand.id}`, { method: "PUT", body: payload }, t(lang, "मांग संशोधित हो गई", "Demand updated"))) {
      setEditDemand(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel">
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          📂 {t(lang, "आधिकारिक संघ दस्तावेज़ व मांग ज्ञापन", "Official Documents & Memorandums")} ({(state.documents || []).length})
        </h3>
        <form className="form-grid" onSubmit={addDoc}>
          <Field label={t(lang, "शीर्षक (हिंदी)", "Title (Hindi)")}><Inp name="titleHi" placeholder="उदा. मुख्यमंत्री को प्रेषित 11 सूत्रीय मांग पत्र" required /></Field>
          <Field label={t(lang, "शीर्षक (English)", "Title (English)")}><Inp name="titleEn" placeholder="e.g. 11-Point Memorandum to Chief Minister" required /></Field>
          <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue="मांग ज्ञापन" required /></Field>
          <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue="Official Memorandum" required /></Field>
          <Field label={t(lang, "पत्रांक / संदर्भ", "Reference No.")}><Inp name="refNo" placeholder="UPBMS/2026/MEMO/01" /></Field>
          <Field label={t(lang, "दिनांक", "Date")}><Inp name="date" type="date" defaultValue={today()} /></Field>
          <Field label={t(lang, "संक्षिप्त सारांश (हिंदी)", "Summary (Hindi)")} full><Inp name="summaryHi" required /></Field>
          <Field label={t(lang, "संक्षिप्त सारांश (English)", "Summary (English)")} full><Inp name="summaryEn" required /></Field>
          <Field label={t(lang, "मुख्य पत्र पाठ (हिंदी)", "Content (Hindi)")} full><Area name="contentHi" rows={5} required /></Field>
          <Field label={t(lang, "मुख्य पत्र पाठ (English)", "Content (English)")} full><Area name="contentEn" rows={5} required /></Field>
          <div className="form-group full">
            <span className="form-label">{t(lang, "दस्तावेज़ पर मुद्रित होने वाले हस्ताक्षरकर्ता चुनें:", "Select Signatories:")}</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
              {officers.map((o, i) => (
                <label key={o.id} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px", background: "#f8fafc" }}>
                  <input type="checkbox" name="docSig" value={o.id} defaultChecked={i === 0} /> {o.nameHi}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-accent" style={{ gridColumn: "1 / -1" }}>
            + {t(lang, "दस्तावेज़ जोड़ें", "Add Document")}
          </button>
        </form>

        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {(state.documents || []).map((d) => (
            <div key={d.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <b>{t(lang, d.titleHi, d.titleEn)}</b>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {t(lang, d.categoryHi, d.categoryEn)} • {d.refNo} • {d.date}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditDoc(d)}>
                    ✏️ {t(lang, "संशोधित करें", "Edit")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (confirm(t(lang, "दस्तावेज़ हटाएं?", "Delete this document?"))) {
                        run(`/api/documents/${d.id}`, { method: "DELETE" }, t(lang, "दस्तावेज़ हटाया गया", "Document deleted"));
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "0.86rem", color: "#475569", margin: "8px 0 0" }}>{t(lang, d.summaryHi, d.summaryEn)}</p>
            </div>
          ))}
        </div>
      </div>

      {editDoc && (
        <Modal title={t(lang, "दस्तावेज़ संशोधन", "Edit Document")} onClose={() => setEditDoc(null)}>
          <form onSubmit={updateDoc} className="form-grid">
            <Field label={t(lang, "शीर्षक (हिंदी)", "Title (Hindi)")}><Inp name="titleHi" defaultValue={editDoc.titleHi} required /></Field>
            <Field label={t(lang, "शीर्षक (English)", "Title (English)")}><Inp name="titleEn" defaultValue={editDoc.titleEn} required /></Field>
            <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue={editDoc.categoryHi} /></Field>
            <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue={editDoc.categoryEn} /></Field>
            <Field label={t(lang, "पत्रांक / संदर्भ", "Ref No")}><Inp name="refNo" defaultValue={editDoc.refNo} /></Field>
            <Field label={t(lang, "दिनांक", "Date")}><Inp name="date" type="date" defaultValue={editDoc.date} /></Field>
            <Field label={t(lang, "संक्षिप्त सारांश (हिंदी)", "Summary (Hindi)")} full><Inp name="summaryHi" defaultValue={editDoc.summaryHi} required /></Field>
            <Field label={t(lang, "संक्षिप्त सारांश (English)", "Summary (English)")} full><Inp name="summaryEn" defaultValue={editDoc.summaryEn} required /></Field>
            <Field label={t(lang, "मुख्य पत्र पाठ (हिंदी)", "Content (Hindi)")} full><Area name="contentHi" defaultValue={editDoc.contentHi} rows={6} required /></Field>
            <Field label={t(lang, "मुख्य पत्र पाठ (English)", "Content (English)")} full><Area name="contentEn" defaultValue={editDoc.contentEn} rows={6} required /></Field>
            <div className="form-group full">
              <span className="form-label">{t(lang, "हस्ताक्षरकर्ता:", "Signatories:")}</span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                {officers.map((o) => (
                  <label key={o.id} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px" }}>
                    <input type="checkbox" name="docSig" value={o.id} defaultChecked={(editDoc.signatoryIds || []).includes(o.id)} /> {o.nameHi}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save Document")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditDoc(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="card-panel">
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          ✊ {t(lang, "बैंक मित्रों की प्रमुख मांगें (Charter of Demands)", "Key Demands of Bank Mitras")} ({(state.demands || []).length})
        </h3>
        <form className="form-grid" onSubmit={addDemand}>
          <Field label={t(lang, "क्रमांक (#)", "Demand Number (#)")}><Inp name="number" type="number" defaultValue={(state.demands?.length || 0) + 1} required /></Field>
          <Field label={t(lang, "प्राथमिकता स्थिति (हिंदी)", "Status Badge (Hindi)")}><Inp name="statusHi" defaultValue="प्रमुख मांग" /></Field>
          <Field label={t(lang, "प्राथमिकता स्थिति (English)", "Status Badge (English)")}><Inp name="statusEn" defaultValue="Priority Demand" /></Field>
          <Field label={t(lang, "मांग शीर्षक (हिंदी)", "Demand Title (Hindi)")}><Inp name="titleHi" placeholder="उदा. निश्चित मानदेय एवं सामाजिक सुरक्षा" required /></Field>
          <Field label={t(lang, "मांग शीर्षक (English)", "Demand Title (English)")}><Inp name="titleEn" placeholder="e.g. Fixed Honorarium and Social Security" required /></Field>
          <Field label={t(lang, "विस्तृत विवरण (हिंदी)", "Details (Hindi)")} full><Area name="descHi" rows={3} required /></Field>
          <Field label={t(lang, "विस्तृत विवरण (English)", "Details (English)")} full><Area name="descEn" rows={3} required /></Field>
          <button className="btn btn-primary" style={{ gridColumn: "1 / -1" }}>
            + {t(lang, "मांग जोड़ें", "Add Demand")}
          </button>
        </form>

        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {(state.demands || []).map((d) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", border: "1.5px solid #e2e8f0", padding: "12px 14px", borderRadius: 10, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span className="badge badge-active" style={{ marginRight: 8 }}>#{d.number}</span>
                <b>{t(lang, d.titleHi, d.titleEn)}</b>
                <span className="badge badge-verified" style={{ marginLeft: 8 }}>{t(lang, d.statusHi || d.status, d.statusEn || d.status)}</span>
                <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", margin: "6px 0 0" }}>{t(lang, d.descHi, d.descEn)}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditDemand(d)}>
                  ✏️ {t(lang, "संशोधित करें", "Edit")}
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (confirm(t(lang, "मांग हटाएं?", "Delete this demand?"))) {
                      run(`/api/demands/${d.id}`, { method: "DELETE" }, t(lang, "मांग हटा दी गई", "Demand deleted"));
                    }
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editDemand && (
        <Modal title={t(lang, "मांग संशोधित करें", "Edit Demand")} onClose={() => setEditDemand(null)}>
          <form onSubmit={updateDemand} className="form-grid">
            <Field label={t(lang, "क्रमांक (#)", "Number (#)")}><Inp name="number" type="number" defaultValue={editDemand.number} required /></Field>
            <Field label={t(lang, "स्थिति बैज (हिंदी)", "Status (Hindi)")}><Inp name="statusHi" defaultValue={editDemand.statusHi || editDemand.status} /></Field>
            <Field label={t(lang, "स्थिति बैज (English)", "Status (English)")}><Inp name="statusEn" defaultValue={editDemand.statusEn || editDemand.status} /></Field>
            <Field label={t(lang, "मांग शीर्षक (हिंदी)", "Title (Hindi)")}><Inp name="titleHi" defaultValue={editDemand.titleHi} required /></Field>
            <Field label={t(lang, "मांग शीर्षक (English)", "Title (English)")}><Inp name="titleEn" defaultValue={editDemand.titleEn} required /></Field>
            <Field label={t(lang, "विवरण (हिंदी)", "Details (Hindi)")} full><Area name="descHi" defaultValue={editDemand.descHi} rows={3} required /></Field>
            <Field label={t(lang, "विवरण (English)", "Details (English)")} full><Area name="descEn" defaultValue={editDemand.descEn} rows={3} required /></Field>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save Demand")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditDemand(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ==================== 7. PORTALS & EXTERNAL LINKS ==================== */
function Portals({ portal, run }) {
  const { state, session, lang, showToast } = portal;
  const [imageUrl, setImageUrl] = useState("/images/portal-csc.jpg");
  const [editPortal, setEditPortal] = useState(null);

  async function add(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (await run("/api/external-links", { method: "POST", body: { ...raw, imageUrl, active: true, order: (state.externalLinks?.length || 0) + 1 } }, t(lang, "पोर्टल जोड़ा गया", "Portal added"))) {
      e.target.reset();
      setImageUrl("/images/portal-csc.jpg");
    }
  }

  async function update(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    const payload = { ...raw, imageUrl: imageUrl || editPortal.imageUrl, active: e.target.querySelector("[name=active]").checked, order: Number(raw.order || editPortal.order || 1) };
    if (await run(`/api/external-links/${editPortal.id}`, { method: "PUT", body: payload }, t(lang, "पोर्टल संशोधित हो गया", "Portal updated"))) {
      setEditPortal(null);
    }
  }

  return (
    <div className="card-panel">
      <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
        🌐 {t(lang, "बैंक मित्र उपयोगी अधिकृत वेब पोर्टल", "Useful Bank Mitra Web Portals")} ({(state.externalLinks || []).length})
      </h3>

      <form className="form-grid" onSubmit={add}>
        <Field label={t(lang, "पोर्टल नाम (हिंदी)", "Portal Name (Hindi)")}><Inp name="titleHi" placeholder="उदा. एसबीआई किओस्क बैंकिंग पोर्टल" required /></Field>
        <Field label={t(lang, "पोर्टल नाम (English)", "Portal Name (English)")}><Inp name="titleEn" placeholder="e.g. SBI Kiosk Banking Portal" required /></Field>
        <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue="बैंकिंग पोर्टल" /></Field>
        <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue="Banking Portal" /></Field>
        <Field label={t(lang, "वेबसाइट URL (लिंक)", "Website URL")}><Inp name="url" placeholder="https://..." required /></Field>
        <Field label={t(lang, "डोमेन उपनाम", "Domain Label")}><Inp name="domainLabel" placeholder="kiosk.sbi.co.in" /></Field>
        <Field label={t(lang, "संक्षिप्त विवरण (हिंदी)", "Description (Hindi)")} full><Inp name="descHi" required /></Field>
        <Field label={t(lang, "संक्षिप्त विवरण (English)", "Description (English)")} full><Inp name="descEn" required /></Field>
        <Field label={t(lang, "पोर्टल थंबनेल छवि", "Thumbnail Image")} full>
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImageUrl(await uploadFile(f, session)); showToast(t(lang, "छवि तैयार", "Image ready")); } }} />
        </Field>
        <button className="btn btn-accent" style={{ gridColumn: "1 / -1" }}>
          + {t(lang, "पोर्टल लिंक जोड़ें", "Add Portal Link")}
        </button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginTop: 18 }}>
        {(state.externalLinks || []).map((l) => (
          <div key={l.id} className="card-panel" style={{ border: "1.5px solid #cbd5e1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <b>{t(lang, l.titleHi, l.titleEn)}</b>
                <span className={`badge ${l.active !== false ? "badge-verified" : "badge-suspended"}`}>
                  {l.active !== false ? t(lang, "सक्रिय", "Active") : t(lang, "छिपा", "Hidden")}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: 4 }}>🔗 {l.url}</div>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 6 }}>{t(lang, l.descHi, l.descEn)}</p>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditPortal(l);
                  setImageUrl(l.imageUrl || "");
                }}
              >
                ✏️ {t(lang, "संपादित करें", "Edit")}
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (confirm(t(lang, "पोर्टल हटाएं?", "Delete portal?"))) {
                    run(`/api/external-links/${l.id}`, { method: "DELETE" }, t(lang, "पोर्टल हटाया गया", "Portal deleted"));
                  }
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {editPortal && (
        <Modal title={t(lang, "पोर्टल संशोधित करें", "Edit Portal Link")} onClose={() => setEditPortal(null)}>
          <form onSubmit={update} className="form-grid">
            <Field label={t(lang, "नाम (हिंदी)", "Name (Hindi)")}><Inp name="titleHi" defaultValue={editPortal.titleHi} required /></Field>
            <Field label={t(lang, "नाम (English)", "Name (English)")}><Inp name="titleEn" defaultValue={editPortal.titleEn} required /></Field>
            <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue={editPortal.categoryHi} /></Field>
            <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue={editPortal.categoryEn} /></Field>
            <Field label={t(lang, "वेबसाइट URL", "URL")}><Inp name="url" defaultValue={editPortal.url} required /></Field>
            <Field label={t(lang, "डोमेन उपनाम", "Domain")}><Inp name="domainLabel" defaultValue={editPortal.domainLabel} /></Field>
            <Field label={t(lang, "क्रम (Order)", "Order")}><Inp name="order" type="number" defaultValue={editPortal.order || 1} /></Field>
            <Field label={t(lang, "विवरण (हिंदी)", "Description (Hindi)")} full><Inp name="descHi" defaultValue={editPortal.descHi} required /></Field>
            <Field label={t(lang, "विवरण (English)", "Description (English)")} full><Inp name="descEn" defaultValue={editPortal.descEn} required /></Field>
            <Field label={t(lang, "छवि बदलें", "Replace Image")} full>
              <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImageUrl(await uploadFile(f, session)); showToast(t(lang, "छवि अपलोड हुई", "Image uploaded")); } }} />
            </Field>
            <label className="form-group full" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <input type="checkbox" name="active" defaultChecked={editPortal.active !== false} />
              {t(lang, "पोर्टल वेबसाइट पर दिखाएँ", "Visible on website")}
            </label>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save Portal")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditPortal(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ==================== 8. GRIEVANCE & NEWS ==================== */
function GrievanceNews({ portal, saveSettings, run }) {
  const { state, session, lang, showToast } = portal;
  const on = state.settings.enableGrievanceModule !== false;
  const [imageUrl, setImageUrl] = useState("/images/hero-banner-1.jpg");
  const [editGrv, setEditGrv] = useState(null);
  const [editNews, setEditNews] = useState(null);

  async function addNews(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (await run("/api/news", { method: "POST", body: { ...raw, imageUrl, date: today() } }, t(lang, "समाचार प्रकाशित हो गया", "News published"))) {
      e.target.reset();
      setImageUrl("/images/hero-banner-1.jpg");
    }
  }

  async function updateNews(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    const payload = { ...raw, imageUrl: imageUrl || editNews.imageUrl };
    if (await run(`/api/news/${editNews.id}`, { method: "PUT", body: payload }, t(lang, "समाचार अपडेट हो गया", "News updated"))) {
      setEditNews(null);
    }
  }

  async function updateGrv(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (await run(`/api/grievances/${editGrv.id}`, { method: "PUT", body: raw }, t(lang, "शिकायत विवरण अपडेट", "Grievance updated"))) {
      setEditGrv(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ color: "var(--primary)", margin: 0 }}>
            ⚖️ {t(lang, "ऑनलाइन शिकायत निवारण प्रकोष्ठ", "Grievance Redressal Cell")} ({(state.grievances || []).length})
          </h3>
          <button
            type="button"
            className={`btn btn-sm ${on ? "btn-danger" : "btn-whatsapp"}`}
            onClick={() => saveSettings({ enableGrievanceModule: !on }, t(lang, "शिकायत मॉड्यूल स्थिति बदली", "Module status toggled"))}
          >
            {on ? t(lang, "🚫 शिकायत मॉड्यूल बंद करें", "🚫 Disable Module") : t(lang, "✓ शिकायत मॉड्यूल चालू करें", "✓ Enable Module")}
          </button>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {(state.grievances || []).map((g) => (
            <div key={g.id} style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span className="badge badge-active">{g.ticketNo}</span>
                  <b style={{ marginLeft: 8 }}>{g.applicantName}</b> • 📞 {g.mobile} • 📍 {g.district}
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>{g.subject}</div>
                  <div style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: 2 }}>{g.description}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditGrv(g)}>
                    ✏️ {t(lang, "कार्यवाही / अपडेट", "Action / Edit")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (confirm(t(lang, "शिकायत हटाएं?", "Delete grievance?"))) {
                        run(`/api/grievances/${g.id}`, { method: "DELETE" }, t(lang, "शिकायत हटाई गई", "Grievance deleted"));
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, fontSize: "0.84rem" }}>
                <b>{t(lang, "स्थिति:", "Status:")}</b> <span className={`badge badge-${g.status === "resolved" ? "active" : "pending"}`}>{g.status}</span> •
                <b style={{ marginLeft: 8 }}>{t(lang, "एडमिन टिप्पणी:", "Admin Remark:")}</b> {t(lang, g.adminRemark, g.adminRemarkEn)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editGrv && (
        <Modal title={`${t(lang, "शिकायत निवारण कार्यवाही:", "Grievance Action:")} ${editGrv.ticketNo}`} onClose={() => setEditGrv(null)}>
          <form onSubmit={updateGrv} className="form-grid">
            <Field label={t(lang, "आवेदक नाम", "Applicant Name")}><Inp name="applicantName" defaultValue={editGrv.applicantName} /></Field>
            <Field label={t(lang, "मोबाइल नंबर", "Mobile")}><Inp name="mobile" defaultValue={editGrv.mobile} /></Field>
            <Field label={t(lang, "जनपद", "District")}><Inp name="district" defaultValue={editGrv.district} /></Field>
            <Field label={t(lang, "कार्यवाही स्थिति", "Status")}>
              <select className="form-control" name="status" defaultValue={editGrv.status}>
                <option value="pending">{t(lang, "पंजीकृत / लंबित (Pending)", "Pending")}</option>
                <option value="in_progress">{t(lang, "कार्यवाही जारी (In Progress)", "In Progress")}</option>
                <option value="resolved">{t(lang, "सुलझाया गया / निस्तारित (Resolved)", "Resolved")}</option>
                <option value="rejected">{t(lang, "अस्वीकृत (Rejected)", "Rejected")}</option>
              </select>
            </Field>
            <Field label={t(lang, "विषय", "Subject")} full><Inp name="subject" defaultValue={editGrv.subject} /></Field>
            <Field label={t(lang, "विवरण", "Description")} full><Area name="description" defaultValue={editGrv.description} rows={3} /></Field>
            <Field label={t(lang, "प्रांतीय प्रकोष्ठ टिप्पणी (हिंदी)", "Admin Remark (Hindi)")} full><Area name="adminRemark" defaultValue={editGrv.adminRemark} rows={2} /></Field>
            <Field label={t(lang, "प्रांतीय प्रकोष्ठ टिप्पणी (English)", "Admin Remark (English)")} full><Area name="adminRemarkEn" defaultValue={editGrv.adminRemarkEn} rows={2} /></Field>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "कार्यवाही सेव करें", "Save Action")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditGrv(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="card-panel">
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          📰 {t(lang, "संगठनात्मक समाचार एवं प्रेस विज्ञप्ति", "Union News & Press Releases")} ({(state.news || []).length})
        </h3>
        <form className="form-grid" onSubmit={addNews}>
          <Field label={t(lang, "समाचार शीर्षक (हिंदी)", "Headline (Hindi)")}><Inp name="titleHi" placeholder="उदा. बैंक मित्रों की मांगों को लेकर प्रतिनिधिमंडल ने दिया ज्ञापन" required /></Field>
          <Field label={t(lang, "समाचार शीर्षक (English)", "Headline (English)")}><Inp name="titleEn" placeholder="e.g. Delegation Submits Memorandum for Bank Mitra Rights" required /></Field>
          <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue="संगठन समाचार" /></Field>
          <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue="Union Update" /></Field>
          <Field label={t(lang, "जनपद (हिंदी)", "District (Hindi)")}><Inp name="district" defaultValue="लखनऊ" /></Field>
          <Field label={t(lang, "जनपद (English)", "District (English)")}><Inp name="districtEn" defaultValue="Lucknow" /></Field>
          <Field label={t(lang, "विस्तृत सारांश (हिंदी)", "Summary (Hindi)")} full><Area name="summaryHi" rows={3} required /></Field>
          <Field label={t(lang, "विस्तृत सारांश (English)", "Summary (English)")} full><Area name="summaryEn" rows={3} required /></Field>
          <Field label={t(lang, "समाचार फोटो", "News Photo")} full>
            <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImageUrl(await uploadFile(f, session)); showToast(t(lang, "फोटो तैयार", "Photo uploaded")); } }} />
          </Field>
          <button className="btn btn-accent" style={{ gridColumn: "1 / -1" }}>
            + {t(lang, "समाचार प्रकाशित करें", "Publish News")}
          </button>
        </form>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginTop: 18 }}>
          {(state.news || []).map((n) => (
            <div key={n.id} className="card-panel" style={{ padding: 0, overflow: "hidden", border: "1.5px solid #cbd5e1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <img src={n.imageUrl || "/images/hero-banner-1.jpg"} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
              <div style={{ padding: 12 }}>
                <span className="badge badge-active">{t(lang, n.categoryHi, n.categoryEn)} • {n.date}</span>
                <div style={{ fontWeight: 800, color: "var(--primary)", marginTop: 6 }}>{t(lang, n.titleHi, n.titleEn)}</div>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 4 }}>{t(lang, n.summaryHi, n.summaryEn)}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => { setEditNews(n); setImageUrl(n.imageUrl || ""); }}>
                    ✏️ {t(lang, "संशोधित करें", "Edit")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      if (confirm(t(lang, "समाचार हटाएं?", "Delete news?"))) {
                        run(`/api/news/${n.id}`, { method: "DELETE" }, t(lang, "समाचार हटाया गया", "News deleted"));
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editNews && (
        <Modal title={t(lang, "समाचार संशोधित करें", "Edit News")} onClose={() => setEditNews(null)}>
          <form onSubmit={updateNews} className="form-grid">
            <Field label={t(lang, "शीर्षक (हिंदी)", "Title (Hindi)")}><Inp name="titleHi" defaultValue={editNews.titleHi} required /></Field>
            <Field label={t(lang, "शीर्षक (English)", "Title (English)")}><Inp name="titleEn" defaultValue={editNews.titleEn} required /></Field>
            <Field label={t(lang, "श्रेणी (हिंदी)", "Category (Hindi)")}><Inp name="categoryHi" defaultValue={editNews.categoryHi} /></Field>
            <Field label={t(lang, "श्रेणी (English)", "Category (English)")}><Inp name="categoryEn" defaultValue={editNews.categoryEn} /></Field>
            <Field label={t(lang, "जनपद (हिंदी)", "District (Hindi)")}><Inp name="district" defaultValue={editNews.district} /></Field>
            <Field label={t(lang, "जनपद (English)", "District (English)")}><Inp name="districtEn" defaultValue={editNews.districtEn} /></Field>
            <Field label={t(lang, "दिनांक", "Date")}><Inp name="date" type="date" defaultValue={editNews.date} /></Field>
            <Field label={t(lang, "सारांश (हिंदी)", "Summary (Hindi)")} full><Area name="summaryHi" defaultValue={editNews.summaryHi} rows={3} required /></Field>
            <Field label={t(lang, "सारांश (English)", "Summary (English)")} full><Area name="summaryEn" defaultValue={editNews.summaryEn} rows={3} required /></Field>
            <Field label={t(lang, "फोटो बदलें", "Replace Photo")} full>
              <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImageUrl(await uploadFile(f, session)); showToast(t(lang, "फोटो तैयार", "Photo uploaded")); } }} />
            </Field>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save News")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditNews(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ==================== 9. JOIN US SETTINGS ==================== */
function JoinSettings({ portal, saveSettings }) {
  const { state, lang } = portal;
  const s = state.settings;
  const stx = s.sectionTexts || {};
  const tc = s.termsAndConditions || {};

  function save(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({
      membershipFeeGeneral: Number(r.membershipFeeGeneral),
      membershipFeeDistrictOfficer: Number(r.membershipFeeDistrictOfficer),
      membershipFeeCore: Number(r.membershipFeeCore),
      upiId: r.upiId,
      upiPayeeName: r.upiPayeeName,
      sectionTexts: {
        ...stx,
        joinPageEyebrowHi: r.joinPageEyebrowHi,
        joinPageEyebrowEn: r.joinPageEyebrowEn,
        joinPageTitleHi: r.joinPageTitleHi,
        joinPageTitleEn: r.joinPageTitleEn,
        joinPageSubHi: r.joinPageSubHi,
        joinPageSubEn: r.joinPageSubEn
      },
      termsAndConditions: {
        ...tc,
        titleHi: r.tc_titleHi,
        titleEn: r.tc_titleEn,
        contentHi: r.tc_contentHi,
        contentEn: r.tc_contentEn,
        checkboxLabelHi: r.tc_checkboxLabelHi,
        checkboxLabelEn: r.tc_checkboxLabelEn
      }
    }, t(lang, "सदस्यता पंजीकरण (Join Us) सेटिंग्स सेव हो गईं", "Join Us settings & fees saved"));
  }

  return (
    <form className="card-panel form-grid" onSubmit={save}>
      <h3 style={{ gridColumn: "1 / -1", color: "var(--primary)", marginTop: 0 }}>
        ✍️ {t(lang, "सदस्यता पंजीकरण पृष्ठ (Join Us) एवं शुल्क संरचना", "Membership Registration (Join Us) & Fee Structure")}
      </h3>

      <Field label={t(lang, "पृष्ठ आईब्रो (हिंदी)", "Page Eyebrow (Hindi)")}><Inp name="joinPageEyebrowHi" defaultValue={stx.joinPageEyebrowHi || "ऑनलाइन सदस्यता"} /></Field>
      <Field label={t(lang, "पृष्ठ आईब्रो (English)", "Page Eyebrow (English)")}><Inp name="joinPageEyebrowEn" defaultValue={stx.joinPageEyebrowEn || "ONLINE MEMBERSHIP"} /></Field>
      <Field label={t(lang, "पृष्ठ मुख्य शीर्षक (हिंदी)", "Page Title (Hindi)")}><Inp name="joinPageTitleHi" defaultValue={stx.joinPageTitleHi || "बैंक मित्र सदस्यता पंजीकरण"} /></Field>
      <Field label={t(lang, "पृष्ठ मुख्य शीर्षक (English)", "Page Title (English)")}><Inp name="joinPageTitleEn" defaultValue={stx.joinPageTitleEn || "Bank Mitra membership registration"} /></Field>
      <Field label={t(lang, "पृष्ठ उपशीर्षक (हिंदी)", "Page Subtitle (Hindi)")} full><Inp name="joinPageSubHi" defaultValue={stx.joinPageSubHi || ""} /></Field>
      <Field label={t(lang, "पृष्ठ उपशीर्षक (English)", "Page Subtitle (English)")} full><Inp name="joinPageSubEn" defaultValue={stx.joinPageSubEn || ""} /></Field>

      <h4 style={{ gridColumn: "1 / -1", margin: "16px 0 0", color: "var(--primary-dark)" }}>
        💰 {t(lang, "सदस्यता शुल्क श्रेणियाँ", "Membership Fee Tiers")}
      </h4>
      <Field label={t(lang, "सामान्य सदस्य शुल्क (₹)", "General Member Fee (₹)")}><Inp type="number" name="membershipFeeGeneral" defaultValue={s.membershipFeeGeneral} required /></Field>
      <Field label={t(lang, "जिला पदाधिकारी शुल्क (₹)", "District Officer Fee (₹)")}><Inp type="number" name="membershipFeeDistrictOfficer" defaultValue={s.membershipFeeDistrictOfficer} required /></Field>
      <Field label={t(lang, "प्रदेश मुख्य कार्यकारिणी शुल्क (₹)", "State Core Executive Fee (₹)")}><Inp type="number" name="membershipFeeCore" defaultValue={s.membershipFeeCore} required /></Field>
      <Field label={t(lang, "पंजीकरण UPI ID", "Registration UPI ID")}><Inp name="upiId" defaultValue={s.upiId} required /></Field>
      <Field label={t(lang, "UPI खाताधारक नाम", "UPI Payee Name")} full><Inp name="upiPayeeName" defaultValue={s.upiPayeeName} required /></Field>

      <h4 style={{ gridColumn: "1 / -1", margin: "16px 0 0", color: "var(--primary-dark)" }}>
        ⚖️ {t(lang, "सदस्यता नियम एवं शर्तें (Terms & Conditions)", "Membership Terms & Conditions")}
      </h4>
      <Field label={t(lang, "शर्तें शीर्षक (हिंदी)", "Terms Title (Hindi)")}><Inp name="tc_titleHi" defaultValue={tc.titleHi} /></Field>
      <Field label={t(lang, "शर्तें शीर्षक (English)", "Terms Title (English)")}><Inp name="tc_titleEn" defaultValue={tc.titleEn} /></Field>
      <Field label={t(lang, "शर्तें पाठ (हिंदी)", "Terms Content (Hindi)")} full><Area name="tc_contentHi" defaultValue={tc.contentHi} rows={5} /></Field>
      <Field label={t(lang, "शर्तें पाठ (English)", "Terms Content (English)")} full><Area name="tc_contentEn" defaultValue={tc.contentEn} rows={5} /></Field>
      <Field label={t(lang, "सहमति चेकबॉक्स लेबल (हिंदी)", "Checkbox Consent (Hindi)")} full><Inp name="tc_checkboxLabelHi" defaultValue={tc.checkboxLabelHi} /></Field>
      <Field label={t(lang, "सहमति चेकबॉक्स लेबल (English)", "Checkbox Consent (English)")} full><Inp name="tc_checkboxLabelEn" defaultValue={tc.checkboxLabelEn} /></Field>

      <button className="btn btn-accent" style={{ gridColumn: "1 / -1", marginTop: 14 }}>
        {t(lang, "सदस्यता सेटिंग्स सेव करें", "Save Join Us Settings")}
      </button>
    </form>
  );
}

/* ==================== 10. DONATION & WELFARE LEDGER ==================== */
function DonationSettings({ portal, saveSettings, run }) {
  const { state, lang } = portal;
  const s = state.settings;
  const stx = s.sectionTexts || {};
  const [edit, setEdit] = useState(null);
  const [newPay, setNewPay] = useState(false);
  const [filter, setFilter] = useState("all");

  const payments = (state.payments || []).filter((p) => {
    if (filter === "pending" && p.status !== "pending") return false;
    if (filter === "verified" && p.status !== "verified") return false;
    if (filter === "membership" && p.paymentCategory !== "membership") return false;
    if (filter === "donation" && p.paymentCategory !== "donation") return false;
    return true;
  });

  function saveDonationConfig(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({
      bankAccountName: r.bankAccountName,
      bankAccountNumber: r.bankAccountNumber,
      bankIfsc: r.bankIfsc,
      bankBranch: r.bankBranch,
      upiId: r.upiId,
      upiPayeeName: r.upiPayeeName,
      sectionTexts: {
        ...stx,
        donatePageEyebrowHi: r.donatePageEyebrowHi,
        donatePageEyebrowEn: r.donatePageEyebrowEn,
        donatePageTitleHi: r.donatePageTitleHi,
        donatePageTitleEn: r.donatePageTitleEn,
        donatePageSubHi: r.donatePageSubHi,
        donatePageSubEn: r.donatePageSubEn
      }
    }, t(lang, "सहयोग पृष्ठ व बैंक सेटिंग्स सेव हो गईं", "Donation & bank account saved"));
  }

  async function createPayment(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    raw.amount = Number(raw.amount);
    raw.status = raw.status || "verified";
    if (await run("/api/payments", { method: "POST", body: raw }, t(lang, "भुगतान रसीद जोड़ी गई", "Payment record created"))) {
      setNewPay(false);
    }
  }

  async function updatePayment(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    raw.amount = Number(raw.amount);
    raw.signatoryIds = [...e.target.querySelectorAll("[name=sig]:checked")].map((el) => el.value);
    if (!raw.signatoryIds.length) raw.signatoryIds = state.settings.defaultSignatoryIds || ["sig-gs"];
    delete raw.sig;
    if (await run(`/api/payments/${edit.id}`, { method: "PUT", body: raw }, t(lang, "रसीद अद्यतन हो गई", "Receipt updated"))) {
      setEdit(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <form className="card-panel form-grid" onSubmit={saveDonationConfig}>
        <h3 style={{ gridColumn: "1 / -1", color: "var(--primary)", marginTop: 0 }}>
          🤝 {t(lang, "कल्याण सहयोग पृष्ठ (Donation Page) व बैंक खाता", "Welfare Contribution (Donation) & Bank Account")}
        </h3>
        <Field label={t(lang, "पृष्ठ आईब्रो (हिंदी)", "Page Eyebrow (Hindi)")}><Inp name="donatePageEyebrowHi" defaultValue={stx.donatePageEyebrowHi || "कल्याण कोष"} /></Field>
        <Field label={t(lang, "पृष्ठ आईब्रो (English)", "Page Eyebrow (English)")}><Inp name="donatePageEyebrowEn" defaultValue={stx.donatePageEyebrowEn || "WELFARE FUND"} /></Field>
        <Field label={t(lang, "पृष्ठ मुख्य शीर्षक (हिंदी)", "Page Title (Hindi)")}><Inp name="donatePageTitleHi" defaultValue={stx.donatePageTitleHi || "स्वैच्छिक सहयोग राशि"} /></Field>
        <Field label={t(lang, "पृष्ठ मुख्य शीर्षक (English)", "Page Title (English)")}><Inp name="donatePageTitleEn" defaultValue={stx.donatePageTitleEn || "Voluntary contribution"} /></Field>
        <Field label={t(lang, "पृष्ठ उपशीर्षक (हिंदी)", "Page Subtitle (Hindi)")} full><Inp name="donatePageSubHi" defaultValue={stx.donatePageSubHi || ""} /></Field>
        <Field label={t(lang, "पृष्ठ उपशीर्षक (English)", "Page Subtitle (English)")} full><Inp name="donatePageSubEn" defaultValue={stx.donatePageSubEn || ""} /></Field>

        <h4 style={{ gridColumn: "1 / -1", margin: "14px 0 0", color: "var(--primary-dark)" }}>
          🏦 {t(lang, "आधिकारिक संघ बैंक खाता एवं UPI विवरण", "Official Association Bank & UPI Details")}
        </h4>
        <Field label={t(lang, "बैंक खाताधारक नाम", "Account Name")}><Inp name="bankAccountName" defaultValue={s.bankAccountName} required /></Field>
        <Field label={t(lang, "बैंक खाता संख्या", "Account Number")}><Inp name="bankAccountNumber" defaultValue={s.bankAccountNumber} required /></Field>
        <Field label={t(lang, "बैंक IFSC कोड", "IFSC Code")}><Inp name="bankIfsc" defaultValue={s.bankIfsc} required /></Field>
        <Field label={t(lang, "बैंक शाखा", "Branch Name")}><Inp name="bankBranch" defaultValue={s.bankBranch} required /></Field>
        <Field label={t(lang, "UPI ID", "UPI ID")}><Inp name="upiId" defaultValue={s.upiId} required /></Field>
        <Field label={t(lang, "UPI खाताधारक नाम", "UPI Payee Name")}><Inp name="upiPayeeName" defaultValue={s.upiPayeeName} required /></Field>

        <button className="btn btn-primary" style={{ gridColumn: "1 / -1", marginTop: 10 }}>
          {t(lang, "सहयोग पृष्ठ सेटिंग्स सेव करें", "Save Donation Page Settings")}
        </button>
      </form>

      <div className="card-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ color: "var(--primary)", margin: 0 }}>
            🧾 {t(lang, "समस्त भुगतान एवं शुल्क बहीखाता (Ledger)", "Payments & Receipts Ledger")} ({payments.length})
          </h3>
          <button className="btn btn-accent btn-sm" onClick={() => setNewPay(true)}>
            + {t(lang, "मैनुअल रसीद जोड़ें", "Add Manual Receipt")}
          </button>
        </div>

        <div className="filter-bar" style={{ marginTop: 12 }}>
          <select className="form-control" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: "auto" }}>
            <option value="all">{t(lang, "सभी भुगतान", "All Payments")}</option>
            <option value="pending">{t(lang, "लंबित (Pending)", "Pending")}</option>
            <option value="verified">{t(lang, "सत्यापित (Verified)", "Verified")}</option>
            <option value="membership">{t(lang, "सदस्यता शुल्क", "Membership Fee")}</option>
            <option value="donation">{t(lang, "कल्याण सहयोग", "Donation")}</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t(lang, "रसीद क्रमांक व दिनांक", "Receipt No & Date")}</th>
                <th>{t(lang, "भुगतानकर्ता", "Payer Name")}</th>
                <th>{t(lang, "प्रकार / प्रयोजन", "Type / Purpose")}</th>
                <th>{t(lang, "राशि", "Amount")}</th>
                <th>{t(lang, "माध्यम / UTR", "Mode / UTR")}</th>
                <th>{t(lang, "स्थिति", "Status")}</th>
                <th>{t(lang, "कार्य", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td><b>{p.receiptNo}</b><br /><small>{p.date}</small></td>
                  <td>{p.payerName}<br /><small>{p.mobile}</small></td>
                  <td>
                    <span className="badge badge-active">{p.paymentCategory === "donation" ? t(lang, "सहयोग", "Donation") : t(lang, "सदस्यता", "Membership")}</span><br />
                    <small>{p.purposeHi || p.purpose}</small>
                  </td>
                  <td><b>₹{p.amount}</b></td>
                  <td>{p.mode || "UPI"}<br /><small>{p.utrNumber || "—"}</small></td>
                  <td><span className={`badge badge-${p.status === "verified" ? "active" : "pending"}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {p.status !== "verified" && (
                        <button className="btn btn-whatsapp btn-sm" onClick={() => run(`/api/payments/${p.id}`, { method: "PUT", body: { status: "verified" } }, t(lang, "सत्यापित", "Verified"))}>
                          ✓ {t(lang, "सत्यापित", "Verify")}
                        </button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => setEdit(p)}>
                        ✏️ {t(lang, "संशोधित", "Edit")}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(t(lang, "रसीद हटाएं?", "Delete receipt?"))) {
                            run(`/api/payments/${p.id}`, { method: "DELETE" }, t(lang, "रसीद हटाई गई", "Receipt deleted"));
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {newPay && (
        <Modal title={t(lang, "नया भुगतान / रसीद प्रविष्टि", "Create New Payment Record")} onClose={() => setNewPay(false)}>
          <form onSubmit={createPayment} className="form-grid">
            <Field label={t(lang, "भुगतानकर्ता नाम", "Payer Name")}><Inp name="payerName" required /></Field>
            <Field label={t(lang, "सदस्य आईडी / कोड", "Member Code")}><Inp name="memberCode" placeholder="UPBMS-2026-..." /></Field>
            <Field label={t(lang, "मोबाइल नंबर", "Mobile")}><Inp name="mobile" required /></Field>
            <Field label={t(lang, "जनपद", "District")}><Inp name="district" defaultValue="लखनऊ" /></Field>
            <Field label={t(lang, "भुगतान श्रेणी", "Category")}>
              <select className="form-control" name="paymentCategory" defaultValue="membership">
                <option value="membership">{t(lang, "सदस्यता शुल्क", "Membership Fee")}</option>
                <option value="donation">{t(lang, "कल्याण सहयोग", "Donation")}</option>
              </select>
            </Field>
            <Field label={t(lang, "राशि (₹)", "Amount (₹)")}><Inp name="amount" type="number" defaultValue={500} required /></Field>
            <Field label={t(lang, "माध्यम (Mode)", "Payment Mode")}><Inp name="mode" defaultValue="UPI" /></Field>
            <Field label={t(lang, "UTR / बैंक संदर्भ", "UTR / Ref")}><Inp name="utrNumber" defaultValue={`MANUAL${Date.now().toString().slice(-6)}`} /></Field>
            <Field label={t(lang, "दिनांक", "Date")}><Inp name="date" type="date" defaultValue={today()} /></Field>
            <Field label={t(lang, "स्थिति", "Status")}>
              <select className="form-control" name="status" defaultValue="verified">
                <option value="verified">{t(lang, "सत्यापित", "Verified")}</option>
                <option value="pending">{t(lang, "लंबित", "Pending")}</option>
              </select>
            </Field>
            <Field label={t(lang, "प्रयोजन (हिंदी)", "Purpose (Hindi)")} full><Inp name="purposeHi" defaultValue="वार्षिक सदस्यता पंजीकरण शुल्क" /></Field>
            <Field label={t(lang, "प्रयोजन (English)", "Purpose (English)")} full><Inp name="purposeEn" defaultValue="Annual Membership Registration Fee" /></Field>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "रसीद जनरेट करें", "Generate Receipt")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setNewPay(false)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}

      {edit && (
        <Modal title={`${t(lang, "रसीद संशोधन:", "Edit Receipt:")} ${edit.receiptNo}`} onClose={() => setEdit(null)}>
          <form onSubmit={updatePayment} className="form-grid">
            <Field label={t(lang, "रसीद क्रमांक", "Receipt No")}><Inp name="receiptNo" defaultValue={edit.receiptNo} required /></Field>
            <Field label={t(lang, "दिनांक", "Date")}><Inp name="date" type="date" defaultValue={edit.date} required /></Field>
            <Field label={t(lang, "भुगतानकर्ता नाम", "Payer Name")}><Inp name="payerName" defaultValue={edit.payerName} required /></Field>
            <Field label={t(lang, "मोबाइल नंबर", "Mobile")}><Inp name="mobile" defaultValue={edit.mobile} /></Field>
            <Field label={t(lang, "राशि (₹)", "Amount (₹)")}><Inp name="amount" type="number" defaultValue={edit.amount} required /></Field>
            <Field label={t(lang, "माध्यम", "Mode")}><Inp name="mode" defaultValue={edit.mode} /></Field>
            <Field label={t(lang, "UTR नंबर", "UTR No")}><Inp name="utrNumber" defaultValue={edit.utrNumber} /></Field>
            <Field label={t(lang, "स्थिति", "Status")}>
              <select className="form-control" name="status" defaultValue={edit.status}>
                <option value="verified">{t(lang, "सत्यापित (Verified)", "Verified")}</option>
                <option value="pending">{t(lang, "लंबित (Pending)", "Pending")}</option>
              </select>
            </Field>
            <Field label={t(lang, "प्रयोजन (हिंदी)", "Purpose (Hindi)")} full><Inp name="purposeHi" defaultValue={edit.purposeHi || edit.purpose} /></Field>
            <Field label={t(lang, "प्रयोजन (English)", "Purpose (English)")} full><Inp name="purposeEn" defaultValue={edit.purposeEn} /></Field>
            <div className="form-group full">
              <span className="form-label">{t(lang, "रसीद पर अधिकृत हस्ताक्षरकर्ता:", "Authorized Signatories on Receipt:")}</span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
                {(state.settings.signatories || []).map((sg) => (
                  <label key={sg.id} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px", background: "#f8fafc" }}>
                    <input type="checkbox" name="sig" value={sg.id} defaultChecked={(edit.signatoryIds || []).includes(sg.id)} /> {sg.nameHi}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, gridColumn: "1 / -1", marginTop: 10 }}>
              <button className="btn btn-accent">{t(lang, "बदलाव सेव करें", "Save Receipt")}</button>
              <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>{t(lang, "रद्द", "Cancel")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ==================== 11. ID CARDS, APPOINTMENT LETTERS & VERIFICATION ==================== */
function IdCardTemplates({ portal, saveSettings }) {
  const { state, session, lang, showToast } = portal;
  const bg = state.settings.templateBackgrounds || {};
  const letter = bg.letter || {};
  const idcard = bg.idcard || {};
  const receipt = bg.receipt || {};
  const lt = state.settings.letterTemplateText || {};
  const stx = state.settings.sectionTexts || {};

  function save(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({
      templateBackgrounds: {
        letter: { ...letter, bgColor: r.letter_bgColor, headerColor: r.letter_headerColor, borderColor: r.letter_borderColor, bgOpacity: Number(r.letter_bgOpacity), bgImageUrl: r.letter_bgImageUrl },
        idcard: { ...idcard, frontBgColor: r.id_frontBgColor, headerColor: r.id_headerColor, backBgColor: r.id_backBgColor, bgOpacity: Number(r.id_bgOpacity), bgImageUrl: r.id_bgImageUrl },
        receipt: { ...receipt, bgColor: r.receipt_bgColor, headerColor: r.receipt_headerColor, bgOpacity: Number(r.receipt_bgOpacity), bgImageUrl: r.receipt_bgImageUrl }
      },
      letterTemplateText: {
        ...lt,
        subjectHi: r.subjectHi,
        subjectEn: r.subjectEn,
        bodyHi: r.bodyHi,
        bodyEn: r.bodyEn,
        idBackRulesHi: r.idBackRulesHi,
        idBackRulesEn: r.idBackRulesEn
      },
      sectionTexts: {
        ...stx,
        verifyPageEyebrowHi: r.verifyPageEyebrowHi,
        verifyPageEyebrowEn: r.verifyPageEyebrowEn,
        verifyPageTitleHi: r.verifyPageTitleHi,
        verifyPageTitleEn: r.verifyPageTitleEn,
        verifyPageSubHi: r.verifyPageSubHi,
        verifyPageSubEn: r.verifyPageSubEn
      }
    }, t(lang, "पहचान पत्र, नियुक्ति पत्र व सत्यापन पृष्ठ सेटिंग्स सेव हो गईं", "ID Card, letter & verification saved"));
  }

  async function putImage(e, inputName) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await uploadFile(f, session);
    e.target.form.querySelector(`[name="${inputName}"]`).value = url;
    showToast(t(lang, "इमेज अपलोड हुई, सेव करें", "Image uploaded, click save"));
  }

  return (
    <form className="card-panel" onSubmit={save}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ color: "var(--primary)", margin: 0 }}>
          🪪 {t(lang, "पहचान पत्र, नियुक्ति पत्र पाठ, वॉटरमार्क व सत्यापन पृष्ठ", "ID Cards, Appointment Letters & Verification Page")}
        </h3>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => saveSettings({ templateBackgrounds: {} }, t(lang, "डिफ़ॉल्ट बैकग्राउंड रीसेट", "Reset template styles"))}
        >
          ↺ {t(lang, "डिफ़ॉल्ट रीसेट", "Reset to Defaults")}
        </button>
      </div>

      <h4 style={{ color: "var(--primary-dark)", margin: "18px 0 8px" }}>
        🔍 {t(lang, "सत्यापन पृष्ठ (Verification Page) शीर्षक व आईब्रो", "Verification Page Headings")}
      </h4>
      <div className="form-grid">
        <Field label={t(lang, "पृष्ठ आईब्रो (हिंदी)", "Eyebrow (Hindi)")}><Inp name="verifyPageEyebrowHi" defaultValue={stx.verifyPageEyebrowHi || "सदस्य सत्यापन"} /></Field>
        <Field label={t(lang, "पृष्ठ आईब्रो (English)", "Eyebrow (English)")}><Inp name="verifyPageEyebrowEn" defaultValue={stx.verifyPageEyebrowEn || "MEMBER VERIFICATION"} /></Field>
        <Field label={t(lang, "पृष्ठ मुख्य शीर्षक (हिंदी)", "Title (Hindi)")}><Inp name="verifyPageTitleHi" defaultValue={stx.verifyPageTitleHi || "पहचान पत्र, नियुक्ति पत्र एवं रसीद"} /></Field>
        <Field label={t(lang, "पृष्ठ मुख्य शीर्षक (English)", "Title (English)")}><Inp name="verifyPageTitleEn" defaultValue={stx.verifyPageTitleEn || "ID card, appointment letter and receipt"} /></Field>
        <Field label={t(lang, "पृष्ठ उपशीर्षक (हिंदी)", "Subtitle (Hindi)")} full><Inp name="verifyPageSubHi" defaultValue={stx.verifyPageSubHi || ""} /></Field>
        <Field label={t(lang, "पृष्ठ उपशीर्षक (English)", "Subtitle (English)")} full><Inp name="verifyPageSubEn" defaultValue={stx.verifyPageSubEn || ""} /></Field>
      </div>

      <h4 style={{ color: "var(--primary-dark)", margin: "20px 0 8px" }}>
        🪪 {t(lang, "पीवीसी पहचान पत्र (CR80 PVC ID Card Styling)", "CR80 PVC ID Card Styling & Rules")}
      </h4>
      <div className="form-grid">
        <Field label={t(lang, "कार्ड फ्रंट पृष्ठभूमि रंग", "Card Front BG Color")}><Inp type="color" name="id_frontBgColor" defaultValue={idcard.frontBgColor || "#ffffff"} /></Field>
        <Field label={t(lang, "कार्ड हेडर रंग", "Card Header Color")}><Inp type="color" name="id_headerColor" defaultValue={idcard.headerColor || "#0a2252"} /></Field>
        <Field label={t(lang, "कार्ड बैक पृष्ठभूमि रंग", "Card Back BG Color")}><Inp type="color" name="id_backBgColor" defaultValue={idcard.backBgColor || "#ffffff"} /></Field>
        <Field label={t(lang, "वॉटरमार्क अपारदर्शिता (0 to 1)", "Watermark Opacity (0 to 1)")}><Inp type="number" step="0.02" name="id_bgOpacity" defaultValue={idcard.bgOpacity ?? 0.15} /></Field>
        <Field label={t(lang, "कार्ड बैकग्राउंड इमेज URL", "Card BG Image URL")} full><Inp name="id_bgImageUrl" defaultValue={idcard.bgImageUrl || ""} placeholder="https://..." /></Field>
        <Field label={t(lang, "कार्ड बैकग्राउंड इमेज अपलोड", "Upload Card BG Image")} full><input type="file" accept="image/*" onChange={(e) => putImage(e, "id_bgImageUrl")} /></Field>
        <Field label={t(lang, "पहचान पत्र बैक नियम (हिंदी)", "Card Back Rules (Hindi)")} full><Area name="idBackRulesHi" defaultValue={lt.idBackRulesHi} rows={4} /></Field>
        <Field label={t(lang, "पहचान पत्र बैक नियम (English)", "Card Back Rules (English)")} full><Area name="idBackRulesEn" defaultValue={lt.idBackRulesEn} rows={4} /></Field>
      </div>

      <h4 style={{ color: "var(--primary-dark)", margin: "20px 0 8px" }}>
        📄 {t(lang, "नियुक्ति पत्र / लेटरहेड (Appointment Letter Template)", "Appointment Letter Template")}
      </h4>
      <div className="form-grid">
        <Field label={t(lang, "पृष्ठभूमि रंग", "BG Color")}><Inp type="color" name="letter_bgColor" defaultValue={letter.bgColor || "#ffffff"} /></Field>
        <Field label={t(lang, "हेडर रंग", "Header Color")}><Inp type="color" name="letter_headerColor" defaultValue={letter.headerColor || "#0a2252"} /></Field>
        <Field label={t(lang, "बॉर्डर रंग", "Border Color")}><Inp type="color" name="letter_borderColor" defaultValue={letter.borderColor || "#c59b27"} /></Field>
        <Field label={t(lang, "वॉटरमार्क अपारदर्शिता", "Watermark Opacity")}><Inp type="number" step="0.02" name="letter_bgOpacity" defaultValue={letter.bgOpacity ?? 0.14} /></Field>
        <Field label={t(lang, "लेटरहेड इमेज URL", "Letterhead BG Image URL")} full><Inp name="letter_bgImageUrl" defaultValue={letter.bgImageUrl || ""} placeholder="https://..." /></Field>
        <Field label={t(lang, "लेटरहेड इमेज अपलोड", "Upload Letterhead BG Image")} full><input type="file" accept="image/*" onChange={(e) => putImage(e, "letter_bgImageUrl")} /></Field>
        <Field label={t(lang, "पत्र विषय (हिंदी)", "Letter Subject (Hindi)")}><Inp name="subjectHi" defaultValue={lt.subjectHi} /></Field>
        <Field label={t(lang, "पत्र विषय (English)", "Letter Subject (English)")}><Inp name="subjectEn" defaultValue={lt.subjectEn} /></Field>
        <Field label={t(lang, "पत्र मुख्य पाठ (हिंदी)", "Letter Body (Hindi)")} full><Area name="bodyHi" defaultValue={lt.bodyHi} rows={5} /></Field>
        <Field label={t(lang, "पत्र मुख्य पाठ (English)", "Letter Body (English)")} full><Area name="bodyEn" defaultValue={lt.bodyEn} rows={5} /></Field>
      </div>

      <h4 style={{ color: "var(--primary-dark)", margin: "20px 0 8px" }}>
        🧾 {t(lang, "शुल्क रसीद स्टाइलिंग (Receipt Template)", "Receipt Template")}
      </h4>
      <div className="form-grid">
        <Field label={t(lang, "रसीद पृष्ठभूमि रंग", "Receipt BG Color")}><Inp type="color" name="receipt_bgColor" defaultValue={receipt.bgColor || "#ffffff"} /></Field>
        <Field label={t(lang, "रसीद हेडर रंग", "Receipt Header Color")}><Inp type="color" name="receipt_headerColor" defaultValue={receipt.headerColor || "#0a2252"} /></Field>
        <Field label={t(lang, "वॉटरमार्क अपारदर्शिता", "Watermark Opacity")}><Inp type="number" step="0.02" name="receipt_bgOpacity" defaultValue={receipt.bgOpacity ?? 0.12} /></Field>
        <Field label={t(lang, "रसीद इमेज URL", "Receipt BG Image URL")}><Inp name="receipt_bgImageUrl" defaultValue={receipt.bgImageUrl || ""} placeholder="https://..." /></Field>
        <Field label={t(lang, "रसीद इमेज अपलोड", "Upload Receipt BG Image")} full><input type="file" accept="image/*" onChange={(e) => putImage(e, "receipt_bgImageUrl")} /></Field>
      </div>

      <button className="btn btn-accent" style={{ marginTop: 18 }}>
        {t(lang, "पहचान पत्र व प्रपत्र सेटिंग्स सेव करें", "Save ID Card & Template Settings")}
      </button>
    </form>
  );
}

/* ==================== 12. SIGNATURES & OFFICIAL SEAL ==================== */
function Signs({ portal, saveSettings }) {
  const { state, session, lang, showToast } = portal;
  const s = state.settings;
  const list = s.signatories || [];
  const defaults = s.defaultSignatoryIds || [];
  const [seal, setSeal] = useState(s.sealImageUrl || "/images/official-seal.svg");

  function saveSeal(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ids = [...e.target.querySelectorAll("[name=defaultSig]:checked")].map((el) => el.value);
    const defaultSignatoryIds = ids.length ? ids : [list[0]?.id || "sig-gs"];
    saveSettings({
      sealImageUrl: seal,
      sealLabelHi: fd.get("sealLabelHi"),
      sealLabelEn: fd.get("sealLabelEn"),
      defaultSignatoryIds,
      defaultSignatoryId: defaultSignatoryIds[0]
    }, t(lang, "आधिकारिक मुहर व डिफ़ॉल्ट हस्ताक्षरकर्ता सेव हो गए", "Seal & default signatories saved"));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="card-panel" onSubmit={saveSeal}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          ✒️ {t(lang, "केंद्रीय आधिकारिक मुहर और डिफ़ॉल्ट हस्ताक्षरकर्ता", "Central Official Seal & Default Signatories")}
        </h3>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <img src={seal} alt="Seal" style={{ width: 84, height: 84, objectFit: "contain", background: "#fff", borderRadius: 12, border: "2px solid #cbd5e1", padding: 4 }} />
          <Field label={t(lang, "मुहर छवि बदलें", "Upload New Seal Image")}>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const url = await uploadFile(f, session);
                  setSeal(url);
                  showToast(t(lang, "मुहर छवि तैयार, सेव करें", "Seal image ready, click save"));
                }
              }}
            />
          </Field>
        </div>
        <div className="form-grid" style={{ marginTop: 14 }}>
          <Field label={t(lang, "मुहर लेबल (हिंदी)", "Seal Label (Hindi)")}>
            <Inp name="sealLabelHi" defaultValue={s.sealLabelHi || "आधिकारिक संघ मुहर"} />
          </Field>
          <Field label={t(lang, "मुहर लेबल (English)", "Seal Label (English)")}>
            <Inp name="sealLabelEn" defaultValue={s.sealLabelEn || "Official Association Seal"} />
          </Field>
        </div>
        <div style={{ marginTop: 14 }}>
          <span className="form-label">{t(lang, "प्रपत्रों पर डिफ़ॉल्ट मुहरयुक्त हस्ताक्षरकर्ता चुनें:", "Select Default Signatories for Official Documents:")}</span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            {list.map((sig) => (
              <label key={sig.id} style={{ border: "1.5px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", background: "#f8fafc", fontWeight: 700 }}>
                <input type="checkbox" name="defaultSig" value={sig.id} defaultChecked={defaults.includes(sig.id)} /> {sig.nameHi} ({sig.designationHi})
              </label>
            ))}
          </div>
        </div>
        <button className="btn btn-accent" style={{ marginTop: 14 }}>
          {t(lang, "मुहर व डिफ़ॉल्ट हस्ताक्षर सेव करें", "Save Seal & Signatures Settings")}
        </button>
      </form>

      <div className="card-panel">
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          👥 {t(lang, "हस्ताक्षरकर्ता पदाधिकारी सूची", "Authorized Signatory Officers")} ({list.length})
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          {t(lang, "प्रत्येक पदाधिकारी का नाम, पद, पृथक हस्ताक्षर व मुहरयुक्त संयुक्त हस्ताक्षर यहीं से बदलें।", "Update officer details, separate signature and combined stamp+signature images.")}
        </p>
        <div style={{ display: "grid", gap: 14 }}>
          {list.map((sig, idx) => (
            <OfficerForm key={sig.id} sig={sig} list={list} idx={idx} saveSettings={saveSettings} session={session} showToast={showToast} lang={lang} />
          ))}
        </div>
      </div>

      <NewOfficer list={list} saveSettings={saveSettings} session={session} showToast={showToast} lang={lang} />
    </div>
  );
}

function OfficerForm({ sig, list, idx, saveSettings, session, showToast, lang }) {
  const [sep, setSep] = useState(sig.signatureUrl || "");
  const [comb, setComb] = useState(sig.combinedStampSigUrl || "");

  function save(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    const next = [...list];
    next[idx] = { ...sig, ...raw, signatureUrl: sep, combinedStampSigUrl: comb };
    saveSettings({ signatories: next }, t(lang, "पदाधिकारी विवरण अपडेट", "Signatory officer updated"));
  }

  return (
    <form className="card-panel" onSubmit={save} style={{ border: "1.5px solid #e2e8f0" }}>
      <div className="form-grid">
        <Field label={t(lang, "नाम (हिंदी)", "Name (Hindi)")}><Inp name="nameHi" defaultValue={sig.nameHi} required /></Field>
        <Field label={t(lang, "नाम (English)", "Name (English)")}><Inp name="nameEn" defaultValue={sig.nameEn} required /></Field>
        <Field label={t(lang, "पदनाम (हिंदी)", "Designation (Hindi)")}><Inp name="designationHi" defaultValue={sig.designationHi} required /></Field>
        <Field label={t(lang, "पदनाम (English)", "Designation (English)")}><Inp name="designationEn" defaultValue={sig.designationEn} required /></Field>
        <Field label={t(lang, "हस्ताक्षर प्रदर्शन मोड", "Signature Display Mode")} full>
          <select className="form-control" name="signatureMode" defaultValue={sig.signatureMode === "combined" ? "combined" : "separate"}>
            <option value="separate">{t(lang, "अलग मुहर + अलग हस्ताक्षर", "Separate Seal + Separate Signature")}</option>
            <option value="combined">{t(lang, "मुहर और हस्ताक्षर एक साथ (संयुक्त)", "Combined Stamp & Signature")}</option>
          </select>
        </Field>
        <Field label={t(lang, "हस्ताक्षर छवि (PNG/SVG)", "Signature Image (PNG/SVG)")}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {sep && <img src={sep} alt="Sig" style={{ height: 38, background: "#fff", padding: 2, border: "1px solid #ccc", borderRadius: 4 }} />}
            <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setSep(await uploadFile(f, session)); showToast(t(lang, "हस्ताक्षर अपलोड", "Signature uploaded")); } }} />
          </div>
        </Field>
        <Field label={t(lang, "संयुक्त मुहर+हस्ताक्षर छवि", "Combined Stamp+Sig Image")}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {comb && <img src={comb} alt="Combined" style={{ height: 38, background: "#fff", padding: 2, border: "1px solid #ccc", borderRadius: 4 }} />}
            <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setComb(await uploadFile(f, session)); showToast(t(lang, "संयुक्त छवि अपलोड", "Combined image uploaded")); } }} />
          </div>
        </Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn-primary btn-sm">{t(lang, "अपडेट करें", "Update Officer")}</button>
        {list.length > 1 && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm(t(lang, "पदाधिकारी हटाएँ?", "Delete this signatory?"))) {
                saveSettings({ signatories: list.filter((_, i) => i !== idx) }, t(lang, "पदाधिकारी हटाया गया", "Signatory removed"));
              }
            }}
          >
            {t(lang, "हटाएँ", "Remove")}
          </button>
        )}
      </div>
    </form>
  );
}

function NewOfficer({ list, saveSettings, session, showToast, lang }) {
  const [sep, setSep] = useState("");
  const [comb, setComb] = useState("");

  function add(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({
      signatories: [
        ...list,
        {
          id: "sig-" + Date.now(),
          ...raw,
          signatureMode: comb && !sep ? "combined" : "separate",
          signatureUrl: sep || "/images/sig-gs.svg",
          combinedStampSigUrl: comb
        }
      ]
    }, t(lang, "नया हस्ताक्षरकर्ता जोड़ा गया", "New signatory officer added"));
    e.target.reset();
    setSep("");
    setComb("");
  }

  return (
    <form className="card-panel" onSubmit={add} style={{ borderStyle: "dashed", borderColor: "var(--primary)" }}>
      <h4 style={{ margin: "0 0 10px", color: "var(--primary)" }}>
        + {t(lang, "नया अधिकृत हस्ताक्षरकर्ता जोड़ें", "Add New Authorized Signatory Officer")}
      </h4>
      <div className="form-grid">
        <Field label={t(lang, "नाम (हिंदी)", "Name (Hindi)")}><Inp name="nameHi" placeholder="उदा. श्री सुनील कुमार" required /></Field>
        <Field label={t(lang, "नाम (English)", "Name (English)")}><Inp name="nameEn" placeholder="e.g. Shri Sunil Kumar" required /></Field>
        <Field label={t(lang, "पदनाम (हिंदी)", "Designation (Hindi)")}><Inp name="designationHi" placeholder="उदा. प्रदेश संयुक्त मंत्री" required /></Field>
        <Field label={t(lang, "पदनाम (English)", "Designation (English)")}><Inp name="designationEn" placeholder="e.g. State Joint Secretary" required /></Field>
        <Field label={t(lang, "हस्ताक्षर फ़ाइल", "Signature File")}>
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setSep(await uploadFile(f, session)); }} />
        </Field>
        <Field label={t(lang, "संयुक्त मुहर फ़ाइल", "Combined Stamp File")}>
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setComb(await uploadFile(f, session)); showToast(t(lang, "फ़ाइल तैयार", "File ready")); } }} />
        </Field>
      </div>
      <button className="btn btn-accent btn-sm" style={{ marginTop: 12 }}>
        + {t(lang, "हस्ताक्षरकर्ता जोड़ें", "Add Signatory")}
      </button>
    </form>
  );
}

/* ==================== 13. MENUS & NAVIGATION ==================== */
function SocialStripEditor({ portal, saveSettings }) {
  const { state, lang, showToast } = portal;
  const s = state.settings;
  const [items, setItems] = useState(() => getSocialStrip(s));
  const [previewLang, setPreviewLang] = useState(lang);

  useEffect(() => {
    setItems(getSocialStrip(s));
  }, [s.socialStrip, s.socialLinks]);

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const moveItem = (index, delta) => {
    setItems((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next.map((it, idx) => ({ ...it, order: idx + 1 }));
    });
  };

  const removeItem = (index) => {
    const item = items[index];
    if (confirm(t(lang, `क्या आप "${item.labelHi || item.labelEn || item.id}" बटन को हटाना चाहते हैं?`, `Delete button "${item.labelEn || item.labelHi || item.id}"?`))) {
      setItems((prev) => prev.filter((_, i) => i !== index).map((it, idx) => ({ ...it, order: idx + 1 })));
    }
  };

  const addItem = () => {
    const newIdx = items.length + 1;
    const newId = `custom_${Date.now().toString(36)}`;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        icon: "link",
        labelHi: `बटन ${newIdx}`,
        labelEn: `Btn ${newIdx}`,
        url: "https://",
        visible: true,
        order: newIdx
      }
    ]);
  };

  const resetDefaults = () => {
    if (confirm(t(lang, "क्या आप सभी सोशल बटन डिफ़ॉल्ट पर रीसेट करना चाहते हैं?", "Reset all social buttons to defaults?"))) {
      setItems(DEFAULT_SOCIAL_STRIP.map((d, i) => ({ ...d, order: i + 1 })));
      showToast(t(lang, "डिफ़ॉल्ट सोशल बटन लोड हो गए", "Default social buttons loaded"));
    }
  };

  async function handleSave(e) {
    if (e) e.preventDefault();
    const sorted = [...items]
      .map((it, idx) => ({
        ...it,
        order: Number(it.order) || (idx + 1)
      }))
      .sort((a, b) => a.order - b.order);

    const socialLinks = { ...(s.socialLinks || {}) };
    sorted.forEach((it) => {
      if (it.id && it.url) socialLinks[it.id] = it.url;
    });

    await saveSettings(
      { socialStrip: sorted, socialLinks },
      t(lang, "शीर्ष सोशल मीडिया बटन स्ट्रिप सुरक्षित हो गई!", "Top social buttons strip saved successfully!")
    );
  }

  return (
    <form className="card-panel" onSubmit={handleSave}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
        <div>
          <h3 style={{ color: "var(--primary)", margin: "0 0 4px" }}>
            💬 {t(lang, "शीर्ष सोशल मीडिया बटन स्ट्रिप (Top Social Buttons Strip)", "Top Social Buttons Strip")}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
            {t(
              lang,
              "वेबसाइट के शीर्ष बार (Top Utility Bar) पर दिखने वाले बटनों (WA, ग्रुप, FB, Insta, YT, X, TG आदि) के नाम, आइकॉन, लिंक, क्रम और दृश्यता को यहाँ से बदलें।",
              "Customize labels, icons, URLs, display order, and visibility for buttons shown in the top bar (WA, Group, FB, Insta, YT, X, TG, etc.)."
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
            ➕ {t(lang, "नया बटन जोड़ें", "Add Button")}
          </button>
          <button type="button" className="btn btn-white btn-sm" onClick={resetDefaults}>
            🔄 {t(lang, "डिफ़ॉल्ट लोड करें", "Reset Defaults")}
          </button>
        </div>
      </div>

      {/* Live Preview Strip */}
      <div style={{ background: "#0b1329", padding: "12px 16px", borderRadius: 10, margin: "14px 0 16px", border: "1px solid #1e293b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.6 }}>
            👁️ {t(lang, "लाइव प्रीव्यू (शीर्ष बार में ऐसा दिखेगा):", "Live Preview (As seen in top bar):")}
          </span>
          <div style={{ display: "flex", gap: 6, fontSize: "0.75rem" }}>
            <button
              type="button"
              className={`btn btn-sm ${previewLang === "hi" ? "btn-accent" : "btn-outline"}`}
              style={{ padding: "2px 8px", fontSize: "0.72rem" }}
              onClick={() => setPreviewLang("hi")}
            >
              हिंदी
            </button>
            <button
              type="button"
              className={`btn btn-sm ${previewLang === "en" ? "btn-accent" : "btn-outline"}`}
              style={{ padding: "2px 8px", fontSize: "0.72rem" }}
              onClick={() => setPreviewLang("en")}
            >
              English
            </button>
          </div>
        </div>
        <div className="social-icon-strip" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {items
            .filter((it) => it.visible !== false && it.url && String(it.url).trim())
            .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99))
            .map((it) => (
              <a key={it.id} href={it.url} target="_blank" rel="noreferrer" className="soc-icon-btn">
                <span dangerouslySetInnerHTML={{ __html: SOCIAL[it.icon] || SOCIAL.link }} />
                <span>{previewLang === "en" ? (it.labelEn || it.labelHi) : (it.labelHi || it.labelEn)}</span>
              </a>
            ))}
          {items.filter((it) => it.visible !== false && it.url && String(it.url).trim()).length === 0 && (
            <span style={{ color: "#94a3b8", fontSize: "0.82rem", fontStyle: "italic" }}>
              {t(lang, "कोई बटन सक्रिय नहीं है।", "No active buttons to display.")}
            </span>
          )}
        </div>
      </div>

      {/* Editor Table */}
      <div className="admin-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 65 }}>{t(lang, "क्रम", "Order")}</th>
              <th style={{ width: 140 }}>{t(lang, "आइकॉन", "Icon")}</th>
              <th style={{ width: 120 }}>{t(lang, "लेबल (हिंदी)", "Label (Hindi)")}</th>
              <th style={{ width: 120 }}>{t(lang, "लेबल (English)", "Label (English)")}</th>
              <th>{t(lang, "लिंक / URL", "Target URL")}</th>
              <th style={{ width: 75, textAlign: "center" }}>{t(lang, "सक्रिय", "Visible")}</th>
              <th style={{ width: 75, textAlign: "center" }}>{t(lang, "क्रम", "Move")}</th>
              <th style={{ width: 50, textAlign: "center" }}>{t(lang, "हटाएँ", "Del")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={it.order || idx + 1}
                    onChange={(e) => updateItem(idx, "order", Number(e.target.value))}
                    style={{ width: 55, padding: "4px 6px" }}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{ width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", borderRadius: 4, padding: 2, flexShrink: 0 }}
                      dangerouslySetInnerHTML={{ __html: SOCIAL[it.icon] || SOCIAL.link }}
                    />
                    <select
                      className="form-control"
                      value={it.icon || "link"}
                      onChange={(e) => updateItem(idx, "icon", e.target.value)}
                      style={{ padding: "4px 6px" }}
                    >
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="facebook">f Facebook</option>
                      <option value="instagram">📷 Instagram</option>
                      <option value="youtube">▶ YouTube</option>
                      <option value="twitter">𝕏 Twitter/X</option>
                      <option value="telegram">✈ Telegram</option>
                      <option value="linkedin">💼 LinkedIn</option>
                      <option value="globe">🌐 Web/Portal</option>
                      <option value="link">🔗 Link</option>
                    </select>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={it.labelHi || ""}
                    onChange={(e) => updateItem(idx, "labelHi", e.target.value)}
                    placeholder="उदा. WA"
                    style={{ padding: "4px 8px" }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={it.labelEn || ""}
                    onChange={(e) => updateItem(idx, "labelEn", e.target.value)}
                    placeholder="e.g. Group"
                    style={{ padding: "4px 8px" }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={it.url || ""}
                    onChange={(e) => updateItem(idx, "url", e.target.value)}
                    placeholder="https://..."
                    style={{ padding: "4px 8px" }}
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={it.visible !== false}
                    onChange={(e) => updateItem(idx, "visible", e.target.checked)}
                  />
                </td>
                <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn btn-white btn-sm"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    style={{ padding: "2px 5px", marginRight: 2 }}
                    title={t(lang, "ऊपर ले जाएँ", "Move Up")}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="btn btn-white btn-sm"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    style={{ padding: "2px 5px" }}
                    title={t(lang, "नीचे ले जाएँ", "Move Down")}
                  >
                    ▼
                  </button>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(idx)}
                    style={{ padding: "3px 7px" }}
                    title={t(lang, "हटाएँ", "Delete")}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-accent">
          💾 {t(lang, "सोशल मीडिया बटन स्ट्रिप सेव करें", "Save Social Buttons Strip")}
        </button>
        <button type="button" className="btn btn-outline" onClick={addItem}>
          ➕ {t(lang, "नया बटन जोड़ें", "Add Another Button")}
        </button>
      </div>
    </form>
  );
}

function Menus({ portal, saveSettings }) {
  const { state, lang } = portal;
  const s = state.settings;
  const nav = [...(s.navItems || [])].sort((a, b) => (a.order || 99) - (b.order || 99));
  const hb = s.headerButtons || {};
  const stx = s.sectionTexts || {};

  function saveNav(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const navItems = nav.map((it, i) => ({
      id: it.id,
      labelHi: fd.get(`hi_${i}`),
      labelEn: fd.get(`en_${i}`),
      order: Number(fd.get(`ord_${i}`)),
      visible: e.target.querySelector(`[name="vis_${i}"]`).checked
    }));
    const enableGrievanceModule = e.target.querySelector("[name=enableGrievanceModule]").checked;
    const grv = navItems.find((x) => x.id === "grievance");
    if (grv) grv.visible = enableGrievanceModule;
    saveSettings({ navItems, enableGrievanceModule }, t(lang, "मुख्य मेनू बार सेव हो गया", "Navigation bar settings saved"));
  }

  function saveButtons(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    ["idcardVisible", "donationVisible", "joinVisible", "memberLoginVisible"].forEach((k) => {
      raw[k] = e.target.querySelector(`[name="${k}"]`).checked;
    });
    saveSettings({ headerButtons: raw }, t(lang, "हेडर बटन सेटिंग्स सेव हो गईं", "Header buttons saved"));
  }

  function saveFooterTexts(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({ sectionTexts: { ...stx, ...raw } }, t(lang, "फुटर सेटिंग्स सेव हो गईं", "Footer settings saved"));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <SocialStripEditor portal={portal} saveSettings={saveSettings} />

      <form className="card-panel" onSubmit={saveNav}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          🧭 {t(lang, "मुख्य नेविगेशन मेनू बार (Main Navigation Menu Bar)", "Main Navigation Menu Bar")}
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
          {t(lang, "वेबसाइट के शीर्ष मेनू के लिंक नाम, क्रम और दृश्यता नियंत्रित करें।", "Configure names, order, and visibility of main navigation links.")}
        </p>
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t(lang, "हिंदी नाम", "Hindi Label")}</th>
                <th>{t(lang, "अंग्रेजी नाम", "English Label")}</th>
                <th>{t(lang, "क्रम", "Order")}</th>
                <th>{t(lang, "दिखाएँ", "Visible")}</th>
              </tr>
            </thead>
            <tbody>
              {nav.map((it, i) => (
                <tr key={it.id}>
                  <td><code>{it.id}</code></td>
                  <td><Inp name={`hi_${i}`} defaultValue={it.labelHi} required /></td>
                  <td><Inp name={`en_${i}`} defaultValue={it.labelEn} required /></td>
                  <td><Inp name={`ord_${i}`} type="number" defaultValue={it.order || i + 1} style={{ width: 80 }} /></td>
                  <td>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                      <input type="checkbox" name={`vis_${i}`} defaultChecked={it.visible !== false} />
                      {t(lang, "सक्रिय", "Active")}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label style={{ display: "flex", gap: 8, marginTop: 14, fontWeight: 800 }}>
          <input type="checkbox" name="enableGrievanceModule" defaultChecked={s.enableGrievanceModule !== false} />
          {t(lang, "शिकायत निवारण मॉड्यूल को पूरी वेबसाइट पर सक्रिय रखें", "Enable Grievance Redressal Module site-wide")}
        </label>
        <button className="btn btn-accent" style={{ marginTop: 14 }}>
          {t(lang, "मेनू सेटिंग्स सेव करें", "Save Navigation Settings")}
        </button>
      </form>

      <form className="card-panel" onSubmit={saveButtons}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          🔘 {t(lang, "शीर्ष हेडर त्वरित एक्शन बटन", "Top Header Quick Action Buttons")}
        </h3>
        <div className="form-grid">
          <Field label={t(lang, "पहचान पत्र (हिंदी)", "ID Card Label (Hindi)")}><Inp name="idcardLabelHi" defaultValue={hb.idcardLabelHi} /></Field>
          <Field label={t(lang, "पहचान पत्र (English)", "ID Card Label (English)")}><Inp name="idcardLabelEn" defaultValue={hb.idcardLabelEn} /></Field>
          <Field label={t(lang, "सहयोग / डोनेशन (हिंदी)", "Donation Label (Hindi)")}><Inp name="donationLabelHi" defaultValue={hb.donationLabelHi} /></Field>
          <Field label={t(lang, "सहयोग / डोनेशन (English)", "Donation Label (English)")}><Inp name="donationLabelEn" defaultValue={hb.donationLabelEn} /></Field>
          <Field label={t(lang, "सदस्य बनें (हिंदी)", "Join Label (Hindi)")}><Inp name="joinLabelHi" defaultValue={hb.joinLabelHi} /></Field>
          <Field label={t(lang, "सदस्य बनें (English)", "Join Label (English)")}><Inp name="joinLabelEn" defaultValue={hb.joinLabelEn} /></Field>
          <Field label={t(lang, "सदस्य लॉगिन (हिंदी)", "Member Login Label (Hindi)")}><Inp name="memberLoginLabelHi" defaultValue={hb.memberLoginLabelHi} /></Field>
          <Field label={t(lang, "सदस्य लॉगिन (English)", "Member Login Label (English)")}><Inp name="memberLoginLabelEn" defaultValue={hb.memberLoginLabelEn} /></Field>
          <Field label={t(lang, "एडमिन पैनल (हिंदी)", "Admin Panel Label (Hindi)")}><Inp name="adminLabelHi" defaultValue={hb.adminLabelHi} /></Field>
          <Field label={t(lang, "एडमिन पैनल (English)", "Admin Panel Label (English)")}><Inp name="adminLabelEn" defaultValue={hb.adminLabelEn} /></Field>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14, fontWeight: 700 }}>
          <label><input type="checkbox" name="idcardVisible" defaultChecked={hb.idcardVisible !== false} /> {t(lang, "पहचान पत्र बटन दिखाएँ", "Show ID Card Button")}</label>
          <label><input type="checkbox" name="donationVisible" defaultChecked={hb.donationVisible !== false} /> {t(lang, "डोनेशन बटन दिखाएँ", "Show Donation Button")}</label>
          <label><input type="checkbox" name="joinVisible" defaultChecked={hb.joinVisible !== false} /> {t(lang, "सदस्यता बटन दिखाएँ", "Show Join Button")}</label>
          <label><input type="checkbox" name="memberLoginVisible" defaultChecked={hb.memberLoginVisible !== false} /> {t(lang, "सदस्य लॉगिन बटन दिखाएँ", "Show Member Login Button")}</label>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }}>
          {t(lang, "हेडर बटन सेव करें", "Save Header Buttons")}
        </button>
      </form>

      <form className="card-panel" onSubmit={saveFooterTexts}>
        <h3 style={{ color: "var(--primary)", marginTop: 0 }}>
          📜 {t(lang, "फुटर कॉपीराइट व विवरण टेक्स्ट", "Footer Copyright & Information")}
        </h3>
        <div className="form-grid">
          <Field label={t(lang, "कॉपीराइट सूचना (हिंदी)", "Copyright Notice (Hindi)")} full><Inp name="footerCopyrightHi" defaultValue={stx.footerCopyrightHi || ""} /></Field>
          <Field label={t(lang, "कॉपीराइट सूचना (English)", "Copyright Notice (English)")} full><Inp name="footerCopyrightEn" defaultValue={stx.footerCopyrightEn || ""} /></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }}>
          {t(lang, "फुटर टेक्स्ट सेव करें", "Save Footer Text")}
        </button>
      </form>
    </div>
  );
}

/* ==================== 14. BRANDING, CONTACTS & SYSTEM PIN ==================== */
function Branding({ portal, saveSettings }) {
  const { state, session, lang, showToast, persistSession, refresh } = portal;
  const s = state.settings;
  const sl = s.socialLinks || {};
  const [logoUrl, setLogoUrl] = useState(s.logoUrl || "/images/upbms-crest.svg");

  async function save(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    const currentStrip = getSocialStrip(s);
    const updatedStrip = currentStrip.map((it) => {
      if (it.id === "whatsappChannel" && r.soc_waCh !== undefined) return { ...it, url: r.soc_waCh };
      if (it.id === "whatsappGroup" && r.soc_waGr !== undefined) return { ...it, url: r.soc_waGr };
      if (it.id === "facebook" && r.soc_fb !== undefined) return { ...it, url: r.soc_fb };
      if (it.id === "instagram" && r.soc_ig !== undefined) return { ...it, url: r.soc_ig };
      if (it.id === "youtube" && r.soc_yt !== undefined) return { ...it, url: r.soc_yt };
      if (it.id === "twitter" && r.soc_tw !== undefined) return { ...it, url: r.soc_tw };
      if (it.id === "telegram" && r.soc_tg !== undefined) return { ...it, url: r.soc_tg };
      return it;
    });

    const patch = {
      orgNameHi: r.orgNameHi,
      orgNameEn: r.orgNameEn,
      shortName: r.shortName,
      regNumber: r.regNumber,
      establishedYear: r.establishedYear || "2024",
      taglineHi: r.taglineHi,
      taglineEn: r.taglineEn,
      helplinePrimary: r.helplinePrimary,
      helpline: r.helplinePrimary,
      email: r.email,
      whatsappNumber: r.whatsappNumber,
      headOfficeHi: r.headOfficeHi,
      headOfficeEn: r.headOfficeEn,
      themePreset: r.themePreset,
      logoUrl,
      tickerNoticesHi: lines(r.tickerNoticesHi),
      tickerNoticesEn: lines(r.tickerNoticesEn),
      socialStrip: updatedStrip,
      socialLinks: {
        whatsappChannel: r.soc_waCh,
        whatsappGroup: r.soc_waGr,
        facebook: r.soc_fb,
        instagram: r.soc_ig,
        youtube: r.soc_yt,
        twitter: r.soc_tw,
        telegram: r.soc_tg,
        extra1Label: r.soc_ex1Lbl,
        extra1Url: r.soc_ex1Url,
        extra2Label: r.soc_ex2Lbl,
        extra2Url: r.soc_ex2Url
      }
    };
    if (r.newAdminPin?.trim()) patch.newAdminPin = r.newAdminPin.trim();
    await saveSettings(patch, t(lang, "संगठन पहचान, संपर्क, सोशल व पिन सेव हो गए", "Branding, contacts, social links & PIN saved"));
    if (r.newAdminPin?.trim()) {
      const next = { adminPin: r.newAdminPin.trim(), isAdmin: true };
      persistSession(next);
      await refresh(next);
      showToast(t(lang, `नया एडमिन पिन सेट हुआ: ${r.newAdminPin.trim()}`, `New Admin PIN set: ${r.newAdminPin.trim()}`));
    }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="card-panel form-grid" onSubmit={save}>
      <h3 style={{ gridColumn: "1 / -1", color: "var(--primary)", marginTop: 0 }}>
        🏢 {t(lang, "संगठन पहचान, संपर्क, थीम, टिकर व एडमिन पिन", "Association Branding, Contacts, Theme, Ticker & PIN")}
      </h3>

      <Field label={t(lang, "संगठन नाम (हिंदी)", "Organization Name (Hindi)")}><Inp name="orgNameHi" defaultValue={s.orgNameHi} required /></Field>
      <Field label={t(lang, "संगठन नाम (English)", "Organization Name (English)")}><Inp name="orgNameEn" defaultValue={s.orgNameEn} required /></Field>
      <Field label={t(lang, "संक्षिप्त नाम (उदा. UPBMS)", "Short Name")}><Inp name="shortName" defaultValue={s.shortName} /></Field>
      <Field label={t(lang, "पंजीयन संख्या (Reg Number)", "Registration Number")}><Inp name="regNumber" defaultValue={s.regNumber} /></Field>
      <Field label={t(lang, "स्थापना वर्ष", "Established Year")}><Inp name="establishedYear" defaultValue={s.establishedYear || "2024"} /></Field>
      <Field label={t(lang, "थीम प्रीसेट", "Theme Preset")}>
        <select className="form-control" name="themePreset" defaultValue={s.themePreset || "navy_saffron"}>
          <option value="navy_saffron">{t(lang, "नेवी और केसरिया (Navy & Saffron)", "Navy & Saffron")}</option>
          <option value="blue_green">{t(lang, "नीला और हरा (Blue & Green)", "Blue & Green")}</option>
          <option value="maroon_gold">{t(lang, "मैरून और सोना (Maroon & Gold)", "Maroon & Gold")}</option>
        </select>
      </Field>
      <Field label={t(lang, "धैर्य वाक्य / टैगलाइन (हिंदी)", "Tagline (Hindi)")} full><Inp name="taglineHi" defaultValue={s.taglineHi} /></Field>
      <Field label={t(lang, "धैर्य वाक्य / टैगलाइन (English)", "Tagline (English)")} full><Inp name="taglineEn" defaultValue={s.taglineEn} /></Field>
      <Field label={t(lang, "प्राथमिक हेल्पलाइन नंबर", "Primary Helpline")}><Inp name="helplinePrimary" defaultValue={s.helplinePrimary} required /></Field>
      <Field label={t(lang, "व्हाट्सएप सहायता नंबर (अंतर्राष्ट्रीय कोड सहित)", "WhatsApp Number (with Country Code)")}><Inp name="whatsappNumber" defaultValue={s.whatsappNumber} /></Field>
      <Field label={t(lang, "आधिकारिक ईमेल", "Official Email")}><Inp name="email" type="email" defaultValue={s.email} required /></Field>
      <Field label={t(lang, "सुरक्षा एडमिन पिन बदलें (वैकल्पिक)", "Change Admin PIN (Optional)")}><Inp name="newAdminPin" placeholder={t(lang, "नया एडमिन पिन दर्ज करें (उदा. 1234)", "Enter new Admin PIN")} /></Field>
      <Field label={t(lang, "प्रांतीय कार्यालय पता (हिंदी)", "Head Office Address (Hindi)")} full><Inp name="headOfficeHi" defaultValue={s.headOfficeHi} /></Field>
      <Field label={t(lang, "प्रांतीय कार्यालय पता (English)", "Head Office Address (English)")} full><Inp name="headOfficeEn" defaultValue={s.headOfficeEn} /></Field>

      <Field label={t(lang, "संगठन आधिकारिक लोगो", "Official Logo")} full>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 52, height: 52, objectFit: "contain", borderRadius: "50%", background: "#fff", border: "2px solid #cbd5e1", padding: 2 }} />}
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setLogoUrl(await uploadFile(f, session)); showToast(t(lang, "लोगो अपलोड हुआ", "Logo uploaded")); } }} />
        </div>
      </Field>

      <h4 style={{ gridColumn: "1 / -1", margin: "16px 0 0", color: "var(--primary-dark)" }}>
        📢 {t(lang, "ताज़ा सूचना टिकर पट्टी (प्रति पंक्ति एक सूचना)", "Ticker Notices (1 per line)")}
      </h4>
      <Field label={t(lang, "टिकर सूचनाएँ (हिंदी)", "Ticker Notices (Hindi)")} full>
        <Area name="tickerNoticesHi" defaultValue={(s.tickerNoticesHi || []).join("\n")} rows={4} />
      </Field>
      <Field label={t(lang, "टिकर सूचनाएँ (English)", "Ticker Notices (English)")} full>
        <Area name="tickerNoticesEn" defaultValue={(s.tickerNoticesEn || []).join("\n")} rows={4} />
      </Field>

      <h4 style={{ gridColumn: "1 / -1", margin: "16px 0 0", color: "var(--primary-dark)" }}>
        🔗 {t(lang, "सोशल मीडिया एवं डिजिटल लिंक", "Social Media & Digital Channel Links")}
      </h4>
      <div style={{ gridColumn: "1 / -1", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: "0.84rem", color: "var(--primary-dark)" }}>
        💡 {t(
          lang,
          "शीर्ष बार के बटनों (WA, ग्रुप आदि) के नाम, आइकॉन, क्रम और दृश्यता को बदलने के लिए नीचे दिए गए 'शीर्ष सोशल मीडिया बटन स्ट्रिप' संपादक का उपयोग करें।",
          "Use the 'Top Social Buttons Strip' editor below to configure button labels, icons, display order, and show/hide visibility."
        )}
      </div>
      <Field label="WhatsApp Channel"><Inp name="soc_waCh" defaultValue={sl.whatsappChannel || ""} placeholder="https://whatsapp.com/channel/..." /></Field>
      <Field label="WhatsApp Group"><Inp name="soc_waGr" defaultValue={sl.whatsappGroup || ""} placeholder="https://chat.whatsapp.com/..." /></Field>
      <Field label="Facebook"><Inp name="soc_fb" defaultValue={sl.facebook || ""} placeholder="https://facebook.com/..." /></Field>
      <Field label="Instagram"><Inp name="soc_ig" defaultValue={sl.instagram || ""} placeholder="https://instagram.com/..." /></Field>
      <Field label="YouTube"><Inp name="soc_yt" defaultValue={sl.youtube || ""} placeholder="https://youtube.com/@..." /></Field>
      <Field label="Twitter / X"><Inp name="soc_tw" defaultValue={sl.twitter || ""} placeholder="https://x.com/..." /></Field>
      <Field label="Telegram"><Inp name="soc_tg" defaultValue={sl.telegram || ""} placeholder="https://t.me/..." /></Field>
      <Field label={t(lang, "अतिरिक्त लिंक 1 नाम", "Extra Link 1 Name")}><Inp name="soc_ex1Lbl" defaultValue={sl.extra1Label || ""} /></Field>
      <Field label={t(lang, "अतिरिक्त लिंक 1 URL", "Extra Link 1 URL")}><Inp name="soc_ex1Url" defaultValue={sl.extra1Url || ""} placeholder="https://..." /></Field>
      <Field label={t(lang, "अतिरिक्त लिंक 2 नाम", "Extra Link 2 Name")}><Inp name="soc_ex2Lbl" defaultValue={sl.extra2Label || ""} /></Field>
      <Field label={t(lang, "अतिरिक्त लिंक 2 URL", "Extra Link 2 URL")}><Inp name="soc_ex2Url" defaultValue={sl.extra2Url || ""} placeholder="https://..." /></Field>

      <button className="btn btn-accent" style={{ gridColumn: "1 / -1", marginTop: 14 }}>
        {t(lang, "पहचान, थीम, सोशल व संपर्क सेव करें", "Save Branding, Contacts & Settings")}
      </button>
    </form>
    <SocialStripEditor portal={portal} saveSettings={saveSettings} />
  </div>
  );
}

/* ==================== 15. SECURITY AUDIT LOGS ==================== */
function Logs({ portal, run }) {
  const { state, session, lang } = portal;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const logs = (state.accessLogs || []).filter((l) => {
    if (filter === "member_login" && l.actionType !== "member_login") return false;
    if (filter === "signed" && l.actionType === "member_login") return false;
    if (q) {
      const match = `${l.auditCode} ${l.memberCode} ${l.memberNameHi} ${l.memberNameEn} ${l.district} ${l.actionLabelHi} ${l.targetTitleHi}`.toLowerCase();
      if (!match.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="card-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ color: "var(--primary)", margin: 0 }}>
          🛡️ {t(lang, "सुरक्षा ऑडिट एवं हस्ताक्षर एक्सेस लॉग", "Security Audit & Signature Access Logs")} ({logs.length})
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-white btn-sm" onClick={() => download("/api/export/access-logs.csv", "UPBMS_Logs.csv", session)}>
            📥 {t(lang, "CSV डाउनलोड", "Download CSV")}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm(t(lang, "सभी सुरक्षा लॉग साफ़ करें?", "Are you sure you want to clear all security logs?"))) {
                run("/api/access-logs", { method: "DELETE" }, t(lang, "समस्त लॉग साफ़ हो गए", "All access logs cleared"));
              }
            }}
          >
            🗑️ {t(lang, "सभी लॉग साफ़ करें", "Clear All Logs")}
          </button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginTop: 12 }}>
        <Inp value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "ऑडिट कोड, सदस्य आईडी, नाम या जनपद से खोजें...", "Search audit code, member ID, name or district...")} />
        <select className="form-control" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: "auto" }}>
          <option value="all">{t(lang, "सभी क्रियाएँ", "All Actions")}</option>
          <option value="signed">{t(lang, "हस्ताक्षर / मुहर प्रपत्र एक्सेस", "Signed & Stamped Access")}</option>
          <option value="member_login">{t(lang, "पोर्टल लॉगिन", "Member Portal Logins")}</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t(lang, "ऑडिट कोड", "Audit Code")}</th>
              <th>{t(lang, "दिनांक व समय (IST)", "Date & Time (IST)")}</th>
              <th>{t(lang, "सदस्य / ऑपरेटर", "Member / Operator")}</th>
              <th>{t(lang, "पद व जनपद", "Designation & District")}</th>
              <th>{t(lang, "कार्यवाही", "Action Performed")}</th>
              <th>{t(lang, "दस्तावेज़ / लक्ष्य", "Document / Target")}</th>
              <th>{t(lang, "प्रयुक्त हस्ताक्षर", "Signatures Used")}</th>
              <th>{t(lang, "कार्य", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 20 }}>{t(lang, "कोई सुरक्षा लॉग रिकॉर्ड नहीं मिला।", "No audit log records found.")}</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td><code>{l.auditCode}</code></td>
                  <td>{l.timestamp}</td>
                  <td><b>{t(lang, l.memberNameHi, l.memberNameEn)}</b><br /><small>{l.memberCode || "VISITOR"}</small></td>
                  <td>{t(lang, l.designationHi, l.designationEn)}<br /><small>{l.district}</small></td>
                  <td><span className={`badge ${l.actionType === "member_login" ? "badge-verified" : "badge-active"}`}>{t(lang, l.actionLabelHi, l.actionLabelEn)}</span></td>
                  <td>{t(lang, l.targetTitleHi, l.targetTitleEn)}</td>
                  <td><small>{t(lang, l.signatoriesUsedHi, l.signatoriesUsedEn)}</small></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => run(`/api/access-logs/${l.id}`, { method: "DELETE" }, t(lang, "लॉग हटाया", "Log deleted"))}>✕</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
