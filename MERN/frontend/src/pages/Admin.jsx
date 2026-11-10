import { useState } from "react";
import { api, uploadFile } from "../api";
import { usePortal } from "../context";

const TABS = [
  ["dashboard", "📊 डैशबोर्ड"],
  ["logs", "🛡️ सुरक्षा लॉग"],
  ["menus", "🧭 मेनू व सेक्शन"],
  ["about", "🏛️ परिचय व प्रमाण-पत्र"],
  ["signs", "✍️ हस्ताक्षर व मुहर"],
  ["templates", "🎨 बैकग्राउंड व शर्तें"],
  ["hero", "🖼️ स्लाइडर व अभियान"],
  ["members", "👥 सदस्य"],
  ["circulars", "📑 सर्कुलर"],
  ["documents", "📂 दस्तावेज़ व मांगें"],
  ["portals", "🌐 पोर्टल"],
  ["payments", "💳 शुल्क व रसीद"],
  ["grievance", "⚖️ शिकायत व समाचार"],
  ["branding", "🏢 पहचान व पिन"]
];

function lines(text) {
  return String(text || "").split("\n").map((s) => s.trim()).filter(Boolean);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminPage() {
  const portal = usePortal();
  const { state, session, persistSession, refresh, showToast, setRoute } = portal;
  const [tab, setTab] = useState("dashboard");
  const [pin, setPin] = useState("");

  async function login(e) {
    e.preventDefault();
    try {
      await api("/api/admin/login", { method: "POST", body: { pin } });
      const next = { adminPin: pin, isAdmin: true };
      persistSession(next);
      await refresh(next);
      showToast("एडमिन लॉगिन सफल");
    } catch (err) {
      showToast(err.message);
    }
  }

  if (!session?.isAdmin) {
    return (
      <section className="section-block">
        <div className="container" style={{ maxWidth: 480 }}>
          <form className="card-panel" onSubmit={login}>
            <h2 style={{ color: "var(--primary)" }}>सुपर एडमिन कंट्रोल पैनल</h2>
            <p>डेमो पिन: 1234</p>
            <input className="form-control" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Admin PIN" required />
            <button className="btn btn-accent" style={{ marginTop: 12 }}>लॉगिन</button>
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
            <div style={{ color: "#ffd166", fontWeight: 900, fontSize: "0.74rem" }}>MERN CMS</div>
            <div style={{ fontWeight: 900 }}>सुपर एडमिन कंट्रोल पैनल</div>
          </div>
          {TABS.map(([id, label]) => (
            <button key={id} className={`admin-menu-btn ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              <span>{label}</span>
            </button>
          ))}
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <button className="btn btn-white btn-sm" onClick={() => setRoute("home")}>🌐 वेबसाइट प्रीव्यू</button>
            <button className="btn btn-danger btn-sm" onClick={async () => { persistSession(null); await refresh(null); }}>🔒 लॉगआउट</button>
          </div>
        </aside>
        <section style={{ minWidth: 0 }}>
          {tab === "dashboard" && <Dashboard portal={portal} run={run} />}
          {tab === "logs" && <Logs state={state} run={run} />}
          {tab === "menus" && <Menus state={state} saveSettings={saveSettings} />}
          {tab === "about" && <About state={state} saveSettings={saveSettings} run={run} session={session} showToast={showToast} />}
          {tab === "signs" && <Signs state={state} saveSettings={saveSettings} session={session} showToast={showToast} />}
          {tab === "templates" && <Templates state={state} saveSettings={saveSettings} session={session} showToast={showToast} />}
          {tab === "hero" && <Hero state={state} saveSettings={saveSettings} run={run} session={session} showToast={showToast} />}
          {tab === "members" && <Members portal={portal} run={run} />}
          {tab === "circulars" && <Circulars state={state} run={run} session={session} showToast={showToast} />}
          {tab === "documents" && <Documents state={state} run={run} />}
          {tab === "portals" && <Portals state={state} run={run} session={session} showToast={showToast} />}
          {tab === "payments" && <Payments state={state} saveSettings={saveSettings} run={run} />}
          {tab === "grievance" && <GrievanceNews state={state} saveSettings={saveSettings} run={run} session={session} showToast={showToast} />}
          {tab === "branding" && <Branding state={state} saveSettings={saveSettings} session={session} showToast={showToast} persistSession={persistSession} refresh={refresh} />}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="form-group"><span className="form-label">{label}</span>{children}</label>;
}
function Inp(props) { return <input className="form-control" {...props} />; }
function Area(props) { return <textarea className="form-control" rows={4} {...props} />; }

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

function Dashboard({ portal, run }) {
  const { state, session } = portal;
  const st = state.stats;
  const pending = state.members.filter((m) => m.status === "pending");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel" style={{ background: "var(--hero-deck-bg)", color: "#fff" }}>
        <h2 style={{ color: "#ffd166" }}>नमस्कार, सुपर एडमिन</h2>
        <p>MongoDB से जुड़ा कंट्रोल पैनल। मेनू, सदस्य, सर्कुलर, हस्ताक्षर, शुल्क और सुरक्षा लॉग यहीं से बदलें।</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-white btn-sm" onClick={() => download("/api/export/members.csv", "UPBMS_Members.csv", session)}>सदस्य CSV</button>
          <button className="btn btn-white btn-sm" onClick={() => download("/api/export/payments.csv", "UPBMS_Payments.csv", session)}>भुगतान CSV</button>
          <button className="btn btn-white btn-sm" onClick={() => download("/api/export/access-logs.csv", "UPBMS_Logs.csv", session)}>लॉग CSV</button>
          <button className="btn btn-accent btn-sm" onClick={() => download("/api/admin/backup", "UPBMS_Backup.json", session)}>JSON बैकअप</button>
          <label className="btn btn-white btn-sm">
            रिस्टोर
            <input hidden type="file" accept="application/json" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await run("/api/admin/restore", { method: "POST", body: JSON.parse(await file.text()) }, "बैकअप रिस्टोर हो गया");
            }} />
          </label>
          <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("डेमो डेटा रीसेट करें?")) run("/api/admin/reset", { method: "POST" }, "डेटा रीसेट हो गया"); }}>रीसेट</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <Stat label="मुख्य कार्यकारिणी" value={st.totalCoreMembers} />
        <Stat label="सक्रिय सदस्य" value={st.totalActiveMembers} />
        <Stat label="लंबित सदस्य" value={st.pendingMembersCount} />
        <Stat label="सत्यापित कोष" value={`₹${st.totalCollection}`} />
        <Stat label="खुली शिकायत" value={st.openGrievances} />
        <Stat label="सुरक्षा लॉग" value={(state.accessLogs || []).length} />
      </div>
      <div className="card-panel">
        <b>लंबित सदस्य आवेदन ({pending.length})</b>
        {pending.map((m) => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
            <span>{m.nameHi} • {m.memberCode} • {m.mobile}</span>
            <button className="btn btn-whatsapp btn-sm" onClick={() => run(`/api/members/${m.id}`, { method: "PUT", body: { status: "active" } }, "सदस्य स्वीकृत")}>स्वीकृत</button>
          </div>
        ))}
        {pending.length === 0 && <div style={{ color: "#64748b", marginTop: 8 }}>कोई लंबित आवेदन नहीं।</div>}
      </div>
    </div>
  );
}
function Stat({ label, value }) {
  return <div className="card-panel"><div style={{ color: "#64748b" }}>{label}</div><div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary)" }}>{value}</div></div>;
}

function Logs({ state, run }) {
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const rows = (state.accessLogs || []).filter((l) => {
    if (kind === "prints" && !String(l.actionType || "").startsWith("print_")) return false;
    if (kind === "login" && l.actionType !== "member_login") return false;
    if (q && !`${l.memberNameHi} ${l.memberCode} ${l.actionLabelHi} ${l.targetTitleHi} ${l.auditCode}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="card-panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ color: "var(--primary)" }}>हस्ताक्षर / मुहर उपयोग लॉग</h3>
        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("सभी लॉग हटाएँ?")) run("/api/access-logs", { method: "DELETE" }, "लॉग साफ"); }}>सभी हटाएँ</button>
      </div>
      <div className="filter-bar">
        <input className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder="नाम, आईडी या दस्तावेज़ खोजें" />
        <select className="form-control" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">सभी</option>
          <option value="login">लॉगिन</option>
          <option value="prints">प्रिंट</option>
        </select>
      </div>
      <div className="admin-table-wrap">
        <table className="data-table">
          <thead><tr><th>कोड</th><th>समय</th><th>सदस्य</th><th>कार्य</th><th></th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>{l.auditCode}</td>
                <td>{l.timestamp}</td>
                <td>{l.memberNameHi}<br />{l.memberCode} • {l.district}</td>
                <td>{l.actionLabelHi}<br />{l.targetTitleHi}<br /><span style={{ color: "#64748b" }}>{l.signatoriesUsedHi}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={() => run(`/api/access-logs/${l.id}`, { method: "DELETE" })}>हटाएँ</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Menus({ state, saveSettings }) {
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
    saveSettings({ navItems, enableGrievanceModule }, "मेनू सेव हो गया");
  }
  function saveButtons(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    ["idcardVisible", "donationVisible", "joinVisible", "memberLoginVisible"].forEach((k) => { raw[k] = e.target.querySelector(`[name="${k}"]`).checked; });
    saveSettings({ headerButtons: raw }, "हेडर बटन सेव हो गए");
  }
  function saveTexts(e) {
    e.preventDefault();
    saveSettings({ sectionTexts: { ...stx, ...Object.fromEntries(new FormData(e.target).entries()) } }, "सेक्शन शीर्षक सेव हो गए");
  }
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="card-panel" onSubmit={saveNav}>
        <h3 style={{ color: "var(--primary)" }}>मुख्य मेनू बार</h3>
        <table className="data-table">
          <thead><tr><th>ID</th><th>हिंदी</th><th>English</th><th>क्रम</th><th>दिखाएँ</th></tr></thead>
          <tbody>
            {nav.map((it, i) => (
              <tr key={it.id}>
                <td><code>{it.id}</code></td>
                <td><Inp name={`hi_${i}`} defaultValue={it.labelHi} required /></td>
                <td><Inp name={`en_${i}`} defaultValue={it.labelEn} required /></td>
                <td><Inp name={`ord_${i}`} type="number" defaultValue={it.order || i + 1} /></td>
                <td><input type="checkbox" name={`vis_${i}`} defaultChecked={it.visible !== false} /> दिखाएँ</td>
              </tr>
            ))}
          </tbody>
        </table>
        <label style={{ display: "flex", gap: 8, marginTop: 12, fontWeight: 800 }}>
          <input type="checkbox" name="enableGrievanceModule" defaultChecked={s.enableGrievanceModule !== false} /> शिकायत निवारण पूरी वेबसाइट पर चालू रखें
        </label>
        <button className="btn btn-accent" style={{ marginTop: 12 }}>मेनू सेव करें</button>
      </form>
      <form className="card-panel" onSubmit={saveButtons}>
        <h3 style={{ color: "var(--primary)" }}>ऊपरी हेडर बटन</h3>
        <div className="form-grid">
          <Field label="पहचान पत्र (हिंदी)"><Inp name="idcardLabelHi" defaultValue={hb.idcardLabelHi} /></Field>
          <Field label="ID card (English)"><Inp name="idcardLabelEn" defaultValue={hb.idcardLabelEn} /></Field>
          <Field label="डोनेशन (हिंदी)"><Inp name="donationLabelHi" defaultValue={hb.donationLabelHi} /></Field>
          <Field label="Donate (English)"><Inp name="donationLabelEn" defaultValue={hb.donationLabelEn} /></Field>
          <Field label="सदस्य बनें (हिंदी)"><Inp name="joinLabelHi" defaultValue={hb.joinLabelHi} /></Field>
          <Field label="Join (English)"><Inp name="joinLabelEn" defaultValue={hb.joinLabelEn} /></Field>
          <Field label="सदस्य लॉगिन (हिंदी)"><Inp name="memberLoginLabelHi" defaultValue={hb.memberLoginLabelHi} /></Field>
          <Field label="Member login (English)"><Inp name="memberLoginLabelEn" defaultValue={hb.memberLoginLabelEn} /></Field>
          <Field label="एडमिन (हिंदी)"><Inp name="adminLabelHi" defaultValue={hb.adminLabelHi} /></Field>
          <Field label="Admin (English)"><Inp name="adminLabelEn" defaultValue={hb.adminLabelEn} /></Field>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
          <label><input type="checkbox" name="idcardVisible" defaultChecked={hb.idcardVisible !== false} /> पहचान पत्र</label>
          <label><input type="checkbox" name="donationVisible" defaultChecked={hb.donationVisible !== false} /> डोनेशन</label>
          <label><input type="checkbox" name="joinVisible" defaultChecked={hb.joinVisible !== false} /> सदस्य बनें</label>
          <label><input type="checkbox" name="memberLoginVisible" defaultChecked={hb.memberLoginVisible !== false} /> सदस्य लॉगिन</label>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }}>हेडर बटन सेव करें</button>
      </form>
      <form className="card-panel" onSubmit={saveTexts}>
        <h3 style={{ color: "var(--primary)" }}>सेक्शन शीर्षक व फुटर</h3>
        <div className="form-grid">
          {["tickerBadge", "homeCircularsTitle", "homePortalsTitle", "homeDemandsTitle", "homeMembersTitle", "homeNewsTitle", "footerCopyright"].map((key) => (
            <span key={key} style={{ display: "contents" }}>
              <Field label={`${key} हिंदी`}><Inp name={`${key}Hi`} defaultValue={stx[`${key}Hi`] || ""} /></Field>
              <Field label={`${key} English`}><Inp name={`${key}En`} defaultValue={stx[`${key}En`] || ""} /></Field>
            </span>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }}>शीर्षक सेव करें</button>
      </form>
    </div>
  );
}

function About({ state, saveSettings, run, session, showToast }) {
  const avm = state.settings.aboutVisionMission || {};
  const [file, setFile] = useState({ url: "", type: "image" });
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
    }, "परिचय सेव हो गया");
  }
  async function addCert(e) {
    e.preventDefault();
    if (!file.url) return showToast("पहले प्रमाण-पत्र फाइल चुनें");
    const raw = Object.fromEntries(new FormData(e.target).entries());
    raw.fileUrl = file.url;
    raw.fileType = file.type;
    raw.requiresMemberLogin = e.target.querySelector("[name=requiresMemberLogin]").checked;
    if (await run("/api/certificates", { method: "POST", body: raw }, "प्रमाण-पत्र जोड़ा गया")) {
      e.target.reset();
      setFile({ url: "", type: "image" });
    }
  }
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="card-panel" onSubmit={save}>
        <h3 style={{ color: "var(--primary)" }}>हमारे बारे में, विज़न और मिशन</h3>
        <div className="form-grid">
          <Field label="परिचय शीर्षक हिंदी"><Inp name="aboutTitleHi" defaultValue={avm.aboutTitleHi} required /></Field>
          <Field label="About title"><Inp name="aboutTitleEn" defaultValue={avm.aboutTitleEn} required /></Field>
          <Field label="परिचय"><Area name="aboutBodyHi" defaultValue={avm.aboutBodyHi} /></Field>
          <Field label="About"><Area name="aboutBodyEn" defaultValue={avm.aboutBodyEn} /></Field>
          <Field label="विज़न शीर्षक"><Inp name="visionTitleHi" defaultValue={avm.visionTitleHi} /></Field>
          <Field label="Vision title"><Inp name="visionTitleEn" defaultValue={avm.visionTitleEn} /></Field>
          <Field label="विज़न"><Area name="visionBodyHi" defaultValue={avm.visionBodyHi} /></Field>
          <Field label="Vision"><Area name="visionBodyEn" defaultValue={avm.visionBodyEn} /></Field>
          <Field label="मिशन शीर्षक"><Inp name="missionTitleHi" defaultValue={avm.missionTitleHi} /></Field>
          <Field label="Mission title"><Inp name="missionTitleEn" defaultValue={avm.missionTitleEn} /></Field>
          <Field label="मिशन बिंदु हिंदी"><Area name="missionPointsHi" defaultValue={(avm.missionPointsHi || []).join("\n")} /></Field>
          <Field label="Mission points"><Area name="missionPointsEn" defaultValue={(avm.missionPointsEn || []).join("\n")} /></Field>
          <Field label="प्रमाण-पत्र शीर्षक"><Inp name="certSectionTitleHi" defaultValue={avm.certSectionTitleHi} /></Field>
          <Field label="Certificates title"><Inp name="certSectionTitleEn" defaultValue={avm.certSectionTitleEn} /></Field>
          <Field label="कार्यकारिणी शीर्षक"><Inp name="coreSectionTitleHi" defaultValue={avm.coreSectionTitleHi} /></Field>
          <Field label="Core title"><Inp name="coreSectionTitleEn" defaultValue={avm.coreSectionTitleEn} /></Field>
        </div>
        <button className="btn btn-accent" style={{ marginTop: 12 }}>सेव करें</button>
      </form>
      <div className="card-panel">
        <h3 style={{ color: "var(--primary)" }}>प्रमाण-पत्र</h3>
        <form onSubmit={addCert} className="form-grid">
          <Inp name="titleHi" placeholder="नाम हिंदी" required />
          <Inp name="titleEn" placeholder="Title English" required />
          <Inp name="issuerHi" placeholder="जारीकर्ता" />
          <Inp name="issuerEn" placeholder="Issuer" />
          <Inp name="regRef" placeholder="क्रमांक" />
          <Inp name="date" type="date" defaultValue={today()} />
          <label className="form-group full">फाइल
            <input type="file" accept="image/*,application/pdf" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = await uploadFile(f, session);
              setFile({ url, type: f.type === "application/pdf" ? "pdf" : "image" });
              showToast("फाइल तैयार है");
            }} />
          </label>
          <label className="form-group full"><input type="checkbox" name="requiresMemberLogin" /> केवल सदस्य लॉगिन के बाद दिखाएँ</label>
          <button className="btn btn-primary">प्रमाण-पत्र जोड़ें</button>
        </form>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginTop: 14 }}>
          {(state.certificates || []).map((c) => (
            <div key={c.id} className="card-panel">
              <b>{c.titleHi}</b>
              <div>{c.requiresMemberLogin ? "लॉगिन लॉक" : "सार्वजनिक"}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => run(`/api/certificates/${c.id}`, { method: "PUT", body: { requiresMemberLogin: !c.requiresMemberLogin } }, "लॉक अपडेट")}>{c.requiresMemberLogin ? "सार्वजनिक" : "लॉक"}</button>
                <button className="btn btn-danger btn-sm" onClick={() => run(`/api/certificates/${c.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Signs({ state, saveSettings, session, showToast }) {
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
    }, "मुहर सेव हो गई");
  }
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="card-panel" onSubmit={saveSeal}>
        <h3 style={{ color: "var(--primary)" }}>केंद्रीय मुहर और डिफ़ॉल्ट हस्ताक्षरकर्ता</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={seal} alt="" style={{ width: 76, height: 76, objectFit: "contain", background: "#fff", borderRadius: 10 }} />
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setSeal(await uploadFile(f, session)); showToast("मुहर तैयार, सेव करें"); } }} />
        </div>
        <div className="form-grid" style={{ marginTop: 12 }}>
          <Inp name="sealLabelHi" defaultValue={s.sealLabelHi || "आधिकारिक संघ मुहर"} />
          <Inp name="sealLabelEn" defaultValue={s.sealLabelEn || "Official Association Seal"} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          {list.map((sig) => (
            <label key={sig.id} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px" }}>
              <input type="checkbox" name="defaultSig" value={sig.id} defaultChecked={defaults.includes(sig.id)} /> {sig.nameHi} ({sig.designationHi})
            </label>
          ))}
        </div>
        <button className="btn btn-accent" style={{ marginTop: 12 }}>मुहर सेव करें</button>
      </form>
      {list.map((sig, idx) => (
        <OfficerForm key={sig.id} sig={sig} list={list} idx={idx} saveSettings={saveSettings} session={session} showToast={showToast} />
      ))}
      <NewOfficer list={list} saveSettings={saveSettings} session={session} showToast={showToast} />
    </div>
  );
}

function OfficerForm({ sig, list, idx, saveSettings, session, showToast }) {
  const [sep, setSep] = useState(sig.signatureUrl || "");
  const [comb, setComb] = useState(sig.combinedStampSigUrl || "");
  function save(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    const next = [...list];
    next[idx] = { ...sig, ...raw, signatureUrl: sep, combinedStampSigUrl: comb };
    saveSettings({ signatories: next }, "पदाधिकारी अपडेट");
  }
  return (
    <form className="card-panel" onSubmit={save}>
      <div className="form-grid">
        <Inp name="nameHi" defaultValue={sig.nameHi} required />
        <Inp name="nameEn" defaultValue={sig.nameEn} required />
        <Inp name="designationHi" defaultValue={sig.designationHi} required />
        <Inp name="designationEn" defaultValue={sig.designationEn} required />
        <label className="form-group full">मोड
          <select className="form-control" name="signatureMode" defaultValue={sig.signatureMode === "combined" ? "combined" : "separate"}>
            <option value="separate">अलग मुहर + अलग हस्ताक्षर</option>
            <option value="combined">मुहर और हस्ताक्षर एक साथ</option>
          </select>
        </label>
        <label>हस्ताक्षर {sep && <img src={sep} alt="" style={{ height: 40 }} />}<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setSep(await uploadFile(f, session)); showToast("हस्ताक्षर अपलोड"); } }} /></label>
        <label>संयुक्त इमेज {comb && <img src={comb} alt="" style={{ height: 40 }} />}<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setComb(await uploadFile(f, session)); showToast("संयुक्त इमेज अपलोड"); } }} /></label>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn btn-primary btn-sm">अपडेट</button>
        {list.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => saveSettings({ signatories: list.filter((_, i) => i !== idx) }, "पदाधिकारी हटाया")}>हटाएँ</button>}
      </div>
    </form>
  );
}

function NewOfficer({ list, saveSettings, session, showToast }) {
  const [sep, setSep] = useState("");
  const [comb, setComb] = useState("");
  function add(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({
      signatories: [...list, {
        id: "sig-" + Date.now(),
        ...raw,
        signatureMode: comb && !sep ? "combined" : "separate",
        signatureUrl: sep || "/images/sig-gs.svg",
        combinedStampSigUrl: comb
      }]
    }, "नया पदाधिकारी जुड़ा");
    e.target.reset();
    setSep("");
    setComb("");
  }
  return (
    <form className="card-panel" onSubmit={add} style={{ borderStyle: "dashed" }}>
      <h4>नया हस्ताक्षरकर्ता</h4>
      <div className="form-grid">
        <Inp name="nameHi" placeholder="नाम हिंदी" required />
        <Inp name="nameEn" placeholder="Name" required />
        <Inp name="designationHi" placeholder="पद हिंदी" required />
        <Inp name="designationEn" placeholder="Designation" required />
        <label>हस्ताक्षर<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setSep(await uploadFile(f, session)); }} /></label>
        <label>संयुक्त<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setComb(await uploadFile(f, session)); showToast("इमेज तैयार"); } }} /></label>
      </div>
      <button className="btn btn-accent btn-sm" style={{ marginTop: 10 }}>जोड़ें</button>
    </form>
  );
}

function Templates({ state, saveSettings, session, showToast }) {
  const bg = state.settings.templateBackgrounds || {};
  const letter = bg.letter || {};
  const idcard = bg.idcard || {};
  const receipt = bg.receipt || {};
  const tc = state.settings.termsAndConditions || {};
  const lt = state.settings.letterTemplateText || {};
  function saveBg(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    saveSettings({
      templateBackgrounds: {
        letter: { ...letter, bgColor: r.letter_bgColor, headerColor: r.letter_headerColor, borderColor: r.letter_borderColor, bgOpacity: Number(r.letter_bgOpacity), bgImageUrl: r.letter_bgImageUrl },
        idcard: { ...idcard, frontBgColor: r.id_frontBgColor, headerColor: r.id_headerColor, backBgColor: r.id_backBgColor, bgOpacity: Number(r.id_bgOpacity), bgImageUrl: r.id_bgImageUrl },
        receipt: { ...receipt, bgColor: r.receipt_bgColor, headerColor: r.receipt_headerColor, bgOpacity: Number(r.receipt_bgOpacity), bgImageUrl: r.receipt_bgImageUrl }
      }
    }, "बैकग्राउंड सेव");
  }
  async function putImage(e, inputName) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await uploadFile(f, session);
    e.target.form.querySelector(`[name="${inputName}"]`).value = url;
    showToast("इमेज तैयार, सेव करें");
  }
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="card-panel" onSubmit={saveBg}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ color: "var(--primary)" }}>लेटर, पहचान पत्र और रसीद बैकग्राउंड</h3>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => saveSettings({ templateBackgrounds: {} }, "डिफ़ॉल्ट बैकग्राउंड")}>रीसेट</button>
        </div>
        <h4>नियुक्ति पत्र</h4>
        <div className="form-grid">
          <Inp type="color" name="letter_bgColor" defaultValue={letter.bgColor || "#ffffff"} />
          <Inp type="color" name="letter_headerColor" defaultValue={letter.headerColor || "#0a2252"} />
          <Inp type="color" name="letter_borderColor" defaultValue={letter.borderColor || "#c59b27"} />
          <Inp type="number" step="0.02" name="letter_bgOpacity" defaultValue={letter.bgOpacity ?? 0.14} />
          <Inp name="letter_bgImageUrl" defaultValue={letter.bgImageUrl || ""} placeholder="लेटर इमेज URL" />
          <input type="file" accept="image/*" onChange={(e) => putImage(e, "letter_bgImageUrl")} />
        </div>
        <h4>पहचान पत्र</h4>
        <div className="form-grid">
          <Inp type="color" name="id_frontBgColor" defaultValue={idcard.frontBgColor || "#ffffff"} />
          <Inp type="color" name="id_headerColor" defaultValue={idcard.headerColor || "#0a2252"} />
          <Inp type="color" name="id_backBgColor" defaultValue={idcard.backBgColor || "#ffffff"} />
          <Inp type="number" step="0.02" name="id_bgOpacity" defaultValue={idcard.bgOpacity ?? 0.15} />
          <Inp name="id_bgImageUrl" defaultValue={idcard.bgImageUrl || ""} placeholder="ID इमेज URL" />
          <input type="file" accept="image/*" onChange={(e) => putImage(e, "id_bgImageUrl")} />
        </div>
        <h4>रसीद</h4>
        <div className="form-grid">
          <Inp type="color" name="receipt_bgColor" defaultValue={receipt.bgColor || "#ffffff"} />
          <Inp type="color" name="receipt_headerColor" defaultValue={receipt.headerColor || "#0a2252"} />
          <Inp type="number" step="0.02" name="receipt_bgOpacity" defaultValue={receipt.bgOpacity ?? 0.12} />
          <Inp name="receipt_bgImageUrl" defaultValue={receipt.bgImageUrl || ""} placeholder="रसीद इमेज URL" />
          <input type="file" accept="image/*" onChange={(e) => putImage(e, "receipt_bgImageUrl")} />
        </div>
        <button className="btn btn-accent" style={{ marginTop: 12 }}>बैकग्राउंड सेव</button>
      </form>
      <form className="card-panel" onSubmit={(e) => { e.preventDefault(); const raw = Object.fromEntries(new FormData(e.target).entries()); saveSettings({ termsAndConditions: { ...tc, ...raw } }, "शर्तें सेव"); }}>
        <h3 style={{ color: "var(--primary)" }}>सदस्यता नियम एवं शर्तें</h3>
        <Field label="शीर्षक हिंदी"><Inp name="titleHi" defaultValue={tc.titleHi} /></Field>
        <Field label="Title"><Inp name="titleEn" defaultValue={tc.titleEn} /></Field>
        <Field label="शर्तें हिंदी"><Area name="contentHi" defaultValue={tc.contentHi} rows={6} /></Field>
        <Field label="Terms"><Area name="contentEn" defaultValue={tc.contentEn} rows={6} /></Field>
        <Field label="चेकबॉक्स हिंदी"><Inp name="checkboxLabelHi" defaultValue={tc.checkboxLabelHi} /></Field>
        <Field label="Checkbox"><Inp name="checkboxLabelEn" defaultValue={tc.checkboxLabelEn} /></Field>
        <button className="btn btn-primary">शर्तें सेव</button>
      </form>
      <form className="card-panel" onSubmit={(e) => { e.preventDefault(); saveSettings({ letterTemplateText: { ...lt, ...Object.fromEntries(new FormData(e.target).entries()) } }, "पत्र पाठ सेव"); }}>
        <h3 style={{ color: "var(--primary)" }}>नियुक्ति पत्र का पाठ</h3>
        <Field label="विषय हिंदी"><Inp name="subjectHi" defaultValue={lt.subjectHi} /></Field>
        <Field label="Subject"><Inp name="subjectEn" defaultValue={lt.subjectEn} /></Field>
        <Field label="मुख्य पाठ हिंदी"><Area name="bodyHi" defaultValue={lt.bodyHi} rows={6} /></Field>
        <Field label="Body"><Area name="bodyEn" defaultValue={lt.bodyEn} rows={6} /></Field>
        <button className="btn btn-primary">पत्र पाठ सेव</button>
      </form>
    </div>
  );
}

function Hero({ state, saveSettings, run, session, showToast }) {
  const cb = state.settings.campaignBlock || {};
  const stats = state.settings.statCards || [];
  const [imageUrl, setImageUrl] = useState("");
  async function addSlide(e) {
    e.preventDefault();
    if (!imageUrl) return showToast("बैनर इमेज चुनें");
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (await run("/api/slides", { method: "POST", body: { ...raw, imageUrl, active: true, order: state.slides.length + 1 } }, "स्लाइड जुड़ी")) {
      e.target.reset();
      setImageUrl("");
    }
  }
  function saveCampaign(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    const statCards = [0, 1, 2, 3].map((i) => ({
      id: `st-${i + 1}`,
      icon: r[`st_icon_${i}`],
      valueHi: r[`st_valHi_${i}`],
      valueEn: r[`st_valEn_${i}`],
      labelHi: r[`st_lblHi_${i}`],
      labelEn: r[`st_lblEn_${i}`]
    }));
    saveSettings({
      campaignBlock: { ...cb, badgeHi: r.badgeHi, badgeEn: r.badgeEn, titleHi: r.titleHi, titleEn: r.titleEn, subtitleHi: r.subtitleHi, subtitleEn: r.subtitleEn, btn1Hi: r.btn1Hi, btn1En: r.btn1En, btn2Hi: r.btn2Hi, btn2En: r.btn2En, btn3Hi: r.btn3Hi, btn3En: r.btn3En },
      statCards
    }, "अभियान सेव");
  }
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="card-panel">
        <h3 style={{ color: "var(--primary)" }}>बैनर स्लाइडर</h3>
        <form className="form-grid" onSubmit={addSlide}>
          <Inp name="captionHi" placeholder="कैप्शन हिंदी" required />
          <Inp name="captionEn" placeholder="Caption" required />
          <select className="form-control" name="fitMode" defaultValue="cover"><option value="cover">Cover</option><option value="contain">Contain</option></select>
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImageUrl(await uploadFile(f, session)); showToast("इमेज तैयार"); } }} />
          <button className="btn btn-primary btn-sm">स्लाइड जोड़ें</button>
        </form>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginTop: 12 }}>
          {state.slides.map((sl) => (
            <div key={sl.id} className="card-panel" style={{ padding: 0 }}>
              <img src={sl.imageUrl} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
              <div style={{ padding: 10 }}>{sl.captionHi}<button className="btn btn-danger btn-sm" onClick={() => run(`/api/slides/${sl.id}`, { method: "DELETE" }, "स्लाइड हटी")}>हटाएँ</button></div>
            </div>
          ))}
        </div>
      </div>
      <form className="card-panel" onSubmit={saveCampaign}>
        <h3 style={{ color: "var(--primary)" }}>अभियान और चार बॉक्स</h3>
        <div className="form-grid">
          <Inp name="badgeHi" defaultValue={cb.badgeHi} placeholder="बैज हिंदी" />
          <Inp name="badgeEn" defaultValue={cb.badgeEn} placeholder="Badge" />
          <Inp name="titleHi" defaultValue={cb.titleHi} required />
          <Inp name="titleEn" defaultValue={cb.titleEn} required />
          <Area name="subtitleHi" defaultValue={cb.subtitleHi} />
          <Area name="subtitleEn" defaultValue={cb.subtitleEn} />
          <Inp name="btn1Hi" defaultValue={cb.btn1Hi} />
          <Inp name="btn1En" defaultValue={cb.btn1En} />
          <Inp name="btn2Hi" defaultValue={cb.btn2Hi} />
          <Inp name="btn2En" defaultValue={cb.btn2En} />
          <Inp name="btn3Hi" defaultValue={cb.btn3Hi} />
          <Inp name="btn3En" defaultValue={cb.btn3En} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginTop: 12 }}>
          {[0, 1, 2, 3].map((i) => {
            const st = stats[i] || {};
            return (
              <div key={i} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 10, display: "grid", gap: 6 }}>
                <b>बॉक्स {i + 1}</b>
                <Inp name={`st_icon_${i}`} defaultValue={st.icon} placeholder="आइकॉन" />
                <Inp name={`st_valHi_${i}`} defaultValue={st.valueHi} />
                <Inp name={`st_valEn_${i}`} defaultValue={st.valueEn} />
                <Inp name={`st_lblHi_${i}`} defaultValue={st.labelHi} />
                <Inp name={`st_lblEn_${i}`} defaultValue={st.labelEn} />
              </div>
            );
          })}
        </div>
        <button className="btn btn-accent" style={{ marginTop: 12 }}>अभियान सेव</button>
      </form>
    </div>
  );
}

function Members({ portal, run }) {
  const { state, session, setModal, showToast } = portal;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState(null);
  const rows = state.members.filter((m) => {
    if (filter === "core" && !m.isCoreMember) return false;
    if (filter === "general" && m.isCoreMember) return false;
    if (filter === "pending" && m.status !== "pending") return false;
    if (q && !`${m.nameHi} ${m.nameEn} ${m.memberCode} ${m.mobile} ${m.district} ${m.koCode}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  async function saveMeta(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    await run("/api/meta", { method: "PUT", body: { districts: lines(r.districts), banks: lines(r.banks), bcCompanies: lines(r.bcCompanies) } }, "मास्टर सूची सेव");
  }
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <h3 style={{ color: "var(--primary)" }}>सदस्य प्रबंधन</h3>
          <button className="btn btn-accent btn-sm" onClick={() => setEdit({})}>नया सदस्य</button>
        </div>
        <div className="filter-bar">
          <Inp value={q} onChange={(e) => setQ(e.target.value)} placeholder="खोजें" />
          <select className="form-control" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">सभी ({state.members.length})</option>
            <option value="core">मुख्य कार्यकारिणी</option>
            <option value="general">सामान्य</option>
            <option value="pending">लंबित</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="data-table">
            <thead><tr><th>आईडी</th><th>नाम</th><th>जनपद</th><th>मोबाइल</th><th>स्थिति</th><th>कार्य</th></tr></thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td><b>{m.memberCode}</b><br />{m.isCoreMember ? "CORE" : "सामान्य"}</td>
                  <td>{m.nameHi}<br />{m.designationHi}</td>
                  <td>{m.district}<br />{m.bankName}</td>
                  <td>{m.mobile}</td>
                  <td><span className={`badge badge-${m.status === "active" ? "active" : "pending"}`}>{m.status}</span></td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {m.status !== "active" && <button className="btn btn-whatsapp btn-sm" onClick={() => run(`/api/members/${m.id}`, { method: "PUT", body: { status: "active" } }, "स्वीकृत")}>स्वीकृत</button>}
                    <button className="btn btn-primary btn-sm" onClick={() => setEdit(m)}>संशोधित</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { const p = prompt("नया पासवर्ड", "UPBMS@123"); if (p) run(`/api/members/${m.id}/reset-password`, { method: "POST", body: { newPassword: p } }, "पासवर्ड बदला"); }}>पासवर्ड</button>
                    <button className="btn btn-outline btn-sm" onClick={() => showToast(`${m.memberCode} का पत्र सदस्य लॉगिन के बाद खुलता है`)}>ID</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("सदस्य हटाएँ?")) run(`/api/members/${m.id}`, { method: "DELETE" }, "हटाया"); }}>हटाएँ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {edit && <MemberForm member={edit.id ? edit : null} state={state} session={session} run={run} onClose={() => setEdit(null)} showToast={showToast} />}
      <form className="card-panel" onSubmit={saveMeta}>
        <h3 style={{ color: "var(--primary)" }}>जनपद, बैंक और बीसी कंपनी</h3>
        <div className="form-grid">
          <Field label={`बैंक (${state.meta.banks.length})`}><Area name="banks" defaultValue={state.meta.banks.join("\n")} /></Field>
          <Field label={`बीसी (${state.meta.bcCompanies.length})`}><Area name="bcCompanies" defaultValue={state.meta.bcCompanies.join("\n")} /></Field>
          <Field label={`जनपद (${state.meta.districts.length})`}><Area name="districts" defaultValue={state.meta.districts.join("\n")} /></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 10 }}>सूची सेव</button>
      </form>
    </div>
  );
}

function MemberForm({ member, state, session, run, onClose, showToast }) {
  const cur = member || { status: "active", email: "", designationHi: "सक्रिय बैंक मित्र सदस्य", designationEn: "Active Bank Mitra Member", feePaid: 251, displayOrder: 50, district: state.meta.districts[0], bankName: state.meta.banks[0], bcCompany: state.meta.bcCompanies[0] };
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
    if (!payload.letterSignatoryIds.length) payload.letterSignatoryIds = [payload.signatoryId];
    payload.fromAdmin = true;
    const ok = member
      ? await run(`/api/members/${member.id}`, { method: "PUT", body: payload }, "सदस्य अपडेट")
      : await run("/api/members", { method: "POST", body: payload }, "सदस्य जोड़ा");
    if (ok) onClose();
  }
  return (
    <form className="card-panel" onSubmit={submit}>
      <h3 style={{ color: "var(--primary)" }}>{member ? `संशोधन ${member.memberCode}` : "नया सदस्य"}</h3>
      <div className="form-grid">
        <Inp name="nameHi" defaultValue={cur.nameHi} placeholder="नाम हिंदी" required />
        <Inp name="nameEn" defaultValue={cur.nameEn} placeholder="Name" required />
        <Inp name="fatherName" defaultValue={cur.fatherName} placeholder="पिता का नाम" />
        <Inp name="fatherNameEn" defaultValue={cur.fatherNameEn} placeholder="Father" />
        <Inp name="designationHi" defaultValue={cur.designationHi} required />
        <Inp name="designationEn" defaultValue={cur.designationEn} required />
        <select className="form-control" name="district" defaultValue={cur.district}>{state.meta.districts.map((d) => <option key={d}>{d}</option>)}</select>
        <Inp name="block" defaultValue={cur.block} placeholder="ब्लॉक" />
        <select className="form-control" name="bankName" defaultValue={cur.bankName}>{state.meta.banks.map((b) => <option key={b}>{b}</option>)}</select>
        <select className="form-control" name="bcCompany" defaultValue={cur.bcCompany}>{state.meta.bcCompanies.map((c) => <option key={c}>{c}</option>)}</select>
        <Inp name="koCode" defaultValue={cur.koCode} placeholder="KO / CSP" />
        <Inp name="mobile" defaultValue={cur.mobile} placeholder="मोबाइल" required />
        <Inp name="websiteUrl" defaultValue={cur.websiteUrl || cur.website || ""} placeholder="वेबसाइट लिंक (Website Link e.g. https://...)" type="url" />
        <Inp name="email" defaultValue={cur.email} placeholder="ईमेल आईडी (Email)" type="email" />
        <Inp name="displayOrder" type="number" defaultValue={cur.displayOrder || 50} />
        <Inp name="joinedDate" type="date" defaultValue={cur.joinedDate || today()} />
        <Inp name="validUntil" type="date" defaultValue={cur.validUntil || "2027-12-31"} />
        <select className="form-control" name="status" defaultValue={cur.status || "active"}>
          <option value="active">सक्रिय</option>
          <option value="pending">लंबित</option>
          <option value="suspended">निलंबित</option>
        </select>
        <select className="form-control" name="signatoryId" defaultValue={cur.signatoryId || state.settings.defaultSignatoryId}>
          {sigs.map((sg) => <option key={sg.id} value={sg.id}>{sg.nameHi} — ID कार्ड</option>)}
        </select>
        {!member && <Inp name="password" defaultValue="123456" placeholder="पासवर्ड" required />}
        {!member && <Inp name="feePaid" type="number" defaultValue="251" />}
        <label className="form-group full"><input type="checkbox" name="isCoreMember" defaultChecked={cur.isCoreMember} /> मुख्य कार्यकारिणी</label>
        <div className="form-group full">
          {sigs.map((sg) => (
            <label key={sg.id} style={{ marginRight: 10 }}>
              <input type="checkbox" name="letterSig" value={sg.id} defaultChecked={letterIds.includes(sg.id)} /> {sg.nameHi}
            </label>
          ))}
        </div>
        <Area name="messageHi" defaultValue={cur.messageHi} placeholder="संदेश हिंदी" />
        <Area name="messageEn" defaultValue={cur.messageEn} placeholder="Message" />
        <label>फोटो {photoUrl && <img src={photoUrl} alt="" style={{ width: 48, height: 48, objectFit: "cover" }} />}<input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setPhotoUrl(await uploadFile(f, session)); showToast("फोटो तैयार"); } }} /></label>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn btn-accent">सेव</button>
        <button type="button" className="btn btn-outline" onClick={onClose}>रद्द</button>
      </div>
    </form>
  );
}

function Circulars({ state, run, session, showToast }) {
  const [file, setFile] = useState({ url: "", type: "image" });
  async function add(e) {
    e.preventDefault();
    if (!file.url) return showToast("फाइल चुनें");
    const raw = Object.fromEntries(new FormData(e.target).entries());
    raw.fileUrl = file.url;
    raw.fileType = file.type;
    raw.requiresMemberLogin = e.target.querySelector("[name=requiresMemberLogin]").checked;
    if (await run("/api/circulars", { method: "POST", body: raw }, "सर्कुलर प्रकाशित")) {
      e.target.reset();
      setFile({ url: "", type: "image" });
    }
  }
  return (
    <div className="card-panel">
      <h3 style={{ color: "var(--primary)" }}>बैंक मित्र सर्कुलर और PDF</h3>
      <form className="form-grid" onSubmit={add}>
        <Inp name="titleHi" placeholder="शीर्षक हिंदी" required />
        <Inp name="titleEn" placeholder="Title" required />
        <Inp name="issuerHi" placeholder="जारीकर्ता" />
        <Inp name="issuerEn" placeholder="Issuer" />
        <Inp name="date" type="date" defaultValue={today()} />
        <input type="file" accept="image/*,application/pdf" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setFile({ url: await uploadFile(f, session), type: f.type === "application/pdf" ? "pdf" : "image" }); showToast("फाइल तैयार"); } }} />
        <label className="form-group full"><input type="checkbox" name="requiresMemberLogin" /> सदस्य लॉगिन के बाद ही दिखाएँ</label>
        <button className="btn btn-accent">प्रकाशित करें</button>
      </form>
      {(state.circulars || []).map((c) => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 10, border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
          <div><b>{c.titleHi}</b><div>{c.date} {c.requiresMemberLogin ? "• लॉक" : ""}</div></div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-outline btn-sm" onClick={() => run(`/api/circulars/${c.id}`, { method: "PUT", body: { requiresMemberLogin: !c.requiresMemberLogin } }, "लॉक अपडेट")}>{c.requiresMemberLogin ? "सार्वजनिक" : "लॉक"}</button>
            <button className="btn btn-danger btn-sm" onClick={() => run(`/api/circulars/${c.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Documents({ state, run }) {
  const officers = state.settings.signatories || [];
  async function addDoc(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.signatoryIds = [...e.target.querySelectorAll("[name=docSig]:checked")].map((el) => el.value);
    if (!payload.signatoryIds.length) payload.signatoryIds = [officers[0]?.id || "sig-gs"];
    delete payload.docSig;
    if (await run("/api/documents", { method: "POST", body: payload }, "दस्तावेज़ जोड़ा")) e.target.reset();
  }
  async function addDemand(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.number = (state.demands.length || 0) + 1;
    if (await run("/api/demands", { method: "POST", body: payload }, "मांग जोड़ी")) e.target.reset();
  }
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel">
        <h3 style={{ color: "var(--primary)" }}>संघ दस्तावेज़</h3>
        <form className="form-grid" onSubmit={addDoc}>
          <Inp name="titleHi" placeholder="शीर्षक हिंदी" required />
          <Inp name="titleEn" placeholder="Title" required />
          <Inp name="categoryHi" defaultValue="मांग ज्ञापन" required />
          <Inp name="categoryEn" defaultValue="Official Memorandum" required />
          <Inp name="refNo" placeholder="पत्रांक" />
          <Inp name="date" type="date" defaultValue={today()} />
          <Inp name="summaryHi" placeholder="सारांश हिंदी" required />
          <Inp name="summaryEn" placeholder="Summary" required />
          <Area name="contentHi" placeholder="पत्र हिंदी" required />
          <Area name="contentEn" placeholder="Content" required />
          <div className="form-group full">{officers.map((o, i) => <label key={o.id} style={{ marginRight: 10 }}><input type="checkbox" name="docSig" value={o.id} defaultChecked={i === 0} /> {o.nameHi}</label>)}</div>
          <button className="btn btn-accent">दस्तावेज़ जोड़ें</button>
        </form>
        {state.documents.map((d) => (
          <DocRow key={d.id} doc={d} officers={officers} run={run} />
        ))}
      </div>
      <div className="card-panel">
        <h3 style={{ color: "var(--primary)" }}>मांग-पत्र</h3>
        <form className="form-grid" onSubmit={addDemand}>
          <Inp name="titleHi" placeholder="मांग हिंदी" required />
          <Inp name="titleEn" placeholder="Demand" required />
          <Inp name="descHi" placeholder="विवरण हिंदी" required />
          <Inp name="descEn" placeholder="Details" required />
          <Inp name="statusHi" defaultValue="प्रमुख मांग" />
          <Inp name="statusEn" defaultValue="Priority Demand" />
          <button className="btn btn-primary">मांग जोड़ें</button>
        </form>
        {state.demands.map((d) => (
          <div key={d.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span>#{d.number} {d.titleHi}</span>
            <button className="btn btn-danger btn-sm" onClick={() => run(`/api/demands/${d.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocRow({ doc, officers, run }) {
  const [ids, setIds] = useState(doc.signatoryIds || []);
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><b>{doc.titleHi}</b><button className="btn btn-danger btn-sm" onClick={() => run(`/api/documents/${doc.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {officers.map((o) => (
          <label key={o.id}><input type="checkbox" checked={ids.includes(o.id)} onChange={(e) => setIds((prev) => e.target.checked ? [...prev, o.id] : prev.filter((x) => x !== o.id))} /> {o.nameHi}</label>
        ))}
        <button className="btn btn-primary btn-sm" onClick={() => ids.length && run(`/api/documents/${doc.id}`, { method: "PUT", body: { signatoryIds: ids } }, "हस्ताक्षर सेव")}>हस्ताक्षर सेव</button>
      </div>
    </div>
  );
}

function Portals({ state, run, session, showToast }) {
  const [imageUrl, setImageUrl] = useState("/images/portal-csc.jpg");
  async function add(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (await run("/api/external-links", { method: "POST", body: { ...raw, imageUrl, active: true } }, "पोर्टल जोड़ा")) e.target.reset();
  }
  return (
    <div className="card-panel">
      <h3 style={{ color: "var(--primary)" }}>महत्वपूर्ण पोर्टल</h3>
      <form className="form-grid" onSubmit={add}>
        <Inp name="titleHi" placeholder="नाम हिंदी" required />
        <Inp name="titleEn" placeholder="Name" required />
        <Inp name="categoryHi" defaultValue="बैंकिंग पोर्टल" />
        <Inp name="categoryEn" defaultValue="Banking Portal" />
        <Inp name="url" placeholder="https://" required />
        <Inp name="domainLabel" placeholder="domain" />
        <Inp name="descHi" placeholder="विवरण" required />
        <Inp name="descEn" placeholder="Description" required />
        <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImageUrl(await uploadFile(f, session)); showToast("इमेज तैयार"); } }} />
        <button className="btn btn-accent">जोड़ें</button>
      </form>
      {state.externalLinks.map((l) => (
        <div key={l.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span>{l.titleHi} — {l.url}</span>
          <button className="btn btn-danger btn-sm" onClick={() => run(`/api/external-links/${l.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button>
        </div>
      ))}
    </div>
  );
}

function Payments({ state, saveSettings, run }) {
  const s = state.settings;
  const [edit, setEdit] = useState(null);
  function saveFees(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    ["membershipFeeGeneral", "membershipFeeDistrictOfficer", "membershipFeeCore"].forEach((k) => { r[k] = Number(r[k]); });
    saveSettings(r, "शुल्क और बैंक सेव");
  }
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <form className="card-panel form-grid" onSubmit={saveFees}>
        <h3 style={{ gridColumn: "1 / -1", color: "var(--primary)" }}>शुल्क, UPI और बैंक</h3>
        <Inp type="number" name="membershipFeeGeneral" defaultValue={s.membershipFeeGeneral} />
        <Inp type="number" name="membershipFeeDistrictOfficer" defaultValue={s.membershipFeeDistrictOfficer} />
        <Inp type="number" name="membershipFeeCore" defaultValue={s.membershipFeeCore} />
        <Inp name="upiId" defaultValue={s.upiId} />
        <Inp name="upiPayeeName" defaultValue={s.upiPayeeName} />
        <Inp name="bankAccountName" defaultValue={s.bankAccountName} />
        <Inp name="bankAccountNumber" defaultValue={s.bankAccountNumber} />
        <Inp name="bankIfsc" defaultValue={s.bankIfsc} />
        <Inp name="bankBranch" defaultValue={s.bankBranch} />
        <button className="btn btn-primary">सेव</button>
      </form>
      <div className="card-panel admin-table-wrap">
        <table className="data-table">
          <thead><tr><th>रसीद</th><th>नाम</th><th>प्रकार</th><th>राशि</th><th>स्थिति</th><th></th></tr></thead>
          <tbody>
            {state.payments.map((p) => (
              <tr key={p.id}>
                <td>{p.receiptNo}<br />{p.date}</td>
                <td>{p.payerName}</td>
                <td>{p.paymentCategory === "donation" ? "सहयोग" : "सदस्यता"}</td>
                <td>₹{p.amount}</td>
                <td>{p.status}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  {p.status !== "verified" && <button className="btn btn-whatsapp btn-sm" onClick={() => run(`/api/payments/${p.id}`, { method: "PUT", body: { status: "verified" } }, "सत्यापित")}>सत्यापित</button>}
                  <button className="btn btn-outline btn-sm" onClick={() => setEdit(p)}>हस्ताक्षर</button>
                  <button className="btn btn-danger btn-sm" onClick={() => run(`/api/payments/${p.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <form className="card-panel" onSubmit={async (e) => {
          e.preventDefault();
          const ids = [...e.target.querySelectorAll("[name=sig]:checked")].map((el) => el.value);
          if (!ids.length) return;
          if (await run(`/api/payments/${edit.id}`, { method: "PUT", body: { signatoryIds: ids } }, "रसीद हस्ताक्षर सेव")) setEdit(null);
        }}>
          <b>{edit.receiptNo}</b>
          {(state.settings.signatories || []).map((sg) => (
            <label key={sg.id} style={{ display: "block" }}><input type="checkbox" name="sig" value={sg.id} defaultChecked={(edit.signatoryIds || []).includes(sg.id)} /> {sg.nameHi}</label>
          ))}
          <button className="btn btn-accent btn-sm">सेव</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEdit(null)}>रद्द</button>
        </form>
      )}
    </div>
  );
}

function GrievanceNews({ state, saveSettings, run, session, showToast }) {
  const on = state.settings.enableGrievanceModule !== false;
  const [imageUrl, setImageUrl] = useState("/images/hero-banner-1.jpg");
  async function addNews(e) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.target).entries());
    if (await run("/api/news", { method: "POST", body: { ...raw, imageUrl, date: today() } }, "समाचार प्रकाशित")) e.target.reset();
  }
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card-panel">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ color: "var(--primary)" }}>शिकायत निवारण {on ? "चालू" : "छुपा"}</h3>
          <button className={`btn btn-sm ${on ? "btn-danger" : "btn-whatsapp"}`} onClick={() => saveSettings({ enableGrievanceModule: !on }, "शिकायत मॉड्यूल अपडेट")}>{on ? "छिपाएँ" : "दिखाएँ"}</button>
        </div>
        {state.grievances.map((g) => (
          <form key={g.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); const raw = Object.fromEntries(new FormData(e.target).entries()); run(`/api/grievances/${g.id}`, { method: "PUT", body: raw }, "शिकायत अपडेट"); }}>
            <b>{g.ticketNo}</b> {g.applicantName} — {g.subject}
            <div className="form-grid">
              <select className="form-control" name="status" defaultValue={g.status}><option value="pending">पंजीकृत</option><option value="in_progress">कार्यवाही</option><option value="resolved">समाधान</option></select>
              <Inp name="adminRemark" defaultValue={g.adminRemark} />
              <Inp name="adminRemarkEn" defaultValue={g.adminRemarkEn} />
            </div>
            <button className="btn btn-primary btn-sm">अपडेट</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => run(`/api/grievances/${g.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button>
          </form>
        ))}
      </div>
      <div className="card-panel">
        <h3 style={{ color: "var(--primary)" }}>समाचार</h3>
        <form className="form-grid" onSubmit={addNews}>
          <Inp name="titleHi" placeholder="शीर्षक" required />
          <Inp name="titleEn" placeholder="Headline" required />
          <Inp name="categoryHi" defaultValue="संगठन समाचार" />
          <Inp name="categoryEn" defaultValue="Union Update" />
          <Inp name="district" defaultValue="लखनऊ" />
          <Inp name="districtEn" defaultValue="Lucknow" />
          <Area name="summaryHi" placeholder="सारांश" required />
          <Area name="summaryEn" placeholder="Summary" required />
          <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setImageUrl(await uploadFile(f, session)); showToast("फोटो तैयार"); } }} />
          <button className="btn btn-accent">प्रकाशित</button>
        </form>
        {state.news.map((n) => (
          <div key={n.id} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span>{n.titleHi}</span>
            <button className="btn btn-danger btn-sm" onClick={() => run(`/api/news/${n.id}`, { method: "DELETE" }, "हटाया")}>हटाएँ</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Branding({ state, saveSettings, session, showToast, persistSession, refresh }) {
  const s = state.settings;
  const sl = s.socialLinks || {};
  const [logoUrl, setLogoUrl] = useState(s.logoUrl);
  async function save(e) {
    e.preventDefault();
    const r = Object.fromEntries(new FormData(e.target).entries());
    const patch = {
      orgNameHi: r.orgNameHi, orgNameEn: r.orgNameEn, shortName: r.shortName, regNumber: r.regNumber,
      taglineHi: r.taglineHi, taglineEn: r.taglineEn, helplinePrimary: r.helplinePrimary, email: r.email,
      whatsappNumber: r.whatsappNumber, headOfficeHi: r.headOfficeHi, headOfficeEn: r.headOfficeEn,
      themePreset: r.themePreset, logoUrl,
      tickerNoticesHi: lines(r.tickerNoticesHi), tickerNoticesEn: lines(r.tickerNoticesEn),
      socialLinks: {
        whatsappChannel: r.soc_waCh, whatsappGroup: r.soc_waGr, facebook: r.soc_fb, instagram: r.soc_ig,
        youtube: r.soc_yt, twitter: r.soc_tw, telegram: r.soc_tg,
        extra1Label: r.soc_ex1Lbl, extra1Url: r.soc_ex1Url, extra2Label: r.soc_ex2Lbl, extra2Url: r.soc_ex2Url
      }
    };
    if (r.newAdminPin?.trim()) patch.newAdminPin = r.newAdminPin.trim();
    await saveSettings(patch, "ब्रांडिंग सेव");
    if (r.newAdminPin?.trim()) {
      const next = { adminPin: r.newAdminPin.trim(), isAdmin: true };
      persistSession(next);
      await refresh(next);
    }
  }
  return (
    <form className="card-panel form-grid" onSubmit={save}>
      <h3 style={{ gridColumn: "1 / -1", color: "var(--primary)" }}>संगठन पहचान, थीम, टिकर और सोशल</h3>
      <Inp name="orgNameHi" defaultValue={s.orgNameHi} required />
      <Inp name="orgNameEn" defaultValue={s.orgNameEn} required />
      <Inp name="shortName" defaultValue={s.shortName} />
      <Inp name="regNumber" defaultValue={s.regNumber} />
      <Inp name="taglineHi" defaultValue={s.taglineHi} />
      <Inp name="taglineEn" defaultValue={s.taglineEn} />
      <Inp name="helplinePrimary" defaultValue={s.helplinePrimary} />
      <Inp name="email" defaultValue={s.email} />
      <Inp name="whatsappNumber" defaultValue={s.whatsappNumber} />
      <Inp name="headOfficeHi" defaultValue={s.headOfficeHi} />
      <Inp name="headOfficeEn" defaultValue={s.headOfficeEn} />
      <select className="form-control" name="themePreset" defaultValue={s.themePreset || "navy_saffron"}>
        <option value="navy_saffron">नेवी और केसरिया</option>
        <option value="blue_green">नीला और हरा</option>
        <option value="maroon_gold">मैरून और सोना</option>
      </select>
      <label>लोगो <img src={logoUrl} alt="" style={{ width: 40, height: 40 }} /><input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setLogoUrl(await uploadFile(f, session)); showToast("लोगो तैयार"); } }} /></label>
      <Area name="tickerNoticesHi" defaultValue={(s.tickerNoticesHi || []).join("\n")} />
      <Area name="tickerNoticesEn" defaultValue={(s.tickerNoticesEn || []).join("\n")} />
      <Inp name="soc_waCh" defaultValue={sl.whatsappChannel || ""} placeholder="WhatsApp channel" />
      <Inp name="soc_waGr" defaultValue={sl.whatsappGroup || ""} placeholder="WhatsApp group" />
      <Inp name="soc_fb" defaultValue={sl.facebook || ""} placeholder="Facebook" />
      <Inp name="soc_ig" defaultValue={sl.instagram || ""} placeholder="Instagram" />
      <Inp name="soc_yt" defaultValue={sl.youtube || ""} placeholder="YouTube" />
      <Inp name="soc_tw" defaultValue={sl.twitter || ""} placeholder="X" />
      <Inp name="soc_tg" defaultValue={sl.telegram || ""} placeholder="Telegram" />
      <Inp name="newAdminPin" placeholder="नया एडमिन पिन" />
      <Inp name="soc_ex1Lbl" defaultValue={sl.extra1Label || ""} placeholder="लिंक 1 नाम" />
      <Inp name="soc_ex1Url" defaultValue={sl.extra1Url || ""} placeholder="लिंक 1 URL" />
      <Inp name="soc_ex2Lbl" defaultValue={sl.extra2Label || ""} placeholder="लिंक 2 नाम" />
      <Inp name="soc_ex2Url" defaultValue={sl.extra2Url || ""} placeholder="लिंक 2 URL" />
      <button className="btn btn-accent">सेव करें</button>
    </form>
  );
}
