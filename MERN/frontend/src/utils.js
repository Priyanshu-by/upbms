export function t(lang, hi, en) {
  return lang === "en" ? (en !== undefined && en !== "" ? en : hi) : (hi !== undefined && hi !== "" ? hi : en);
}

export function localizeDual(val, lang) {
  const helpers = window.UPBMSPrint;
  if (helpers?.localizeDual) return helpers.localizeDual(val, lang);
  const str = String(val || "").trim();
  const m = str.match(/^(.+?)\s*\(([^)]+)\)$/);
  if (m) return lang === "en" ? m[2].trim() : m[1].trim();
  return str;
}

export function initialsAvatar(name, bg = "#0a2252", fg = "#ffd166") {
  if (window.UPBMSHelpers?.initialsAvatarSvg) return window.UPBMSHelpers.initialsAvatarSvg(name, bg, fg);
  return "/images/upbms-crest.svg";
}

export function qrSvg(text, size = 128, color = "#0a2252") {
  return window.UPBMSHelpers?.generateQrSvg?.(text, size, color) || "";
}

export function grievanceEnabled(state) {
  if (!state?.settings) return true;
  if (state.settings.enableGrievanceModule === false) return false;
  const nav = (state.settings.navItems || []).find((x) => x.id === "grievance");
  if (nav && nav.visible === false) return false;
  return true;
}

export function canAccessSigned(session) {
  return Boolean(session?.isAdmin || (session?.member && session.member.status === "active"));
}

export function canAccessPersonal(session, memberId) {
  if (session?.isAdmin) return true;
  return Boolean(session?.member && session.member.status === "active" && session.member.id === memberId);
}

export function canAccessReceipt(session, payment) {
  if (!payment) return false;
  if (session?.isAdmin) return true;
  const m = session?.member;
  if (!m || m.status !== "active") return false;
  return payment.memberId === m.id || (payment.memberCode && payment.memberCode === m.memberCode) || (payment.mobile && payment.mobile === m.mobile);
}

export const NAV_ICONS = {
  home: "🏠",
  about: "🏛️",
  members: "👥",
  join: "✍️",
  circulars: "📑",
  documents: "📂",
  grievance: "⚖️",
  portals: "🌐"
};

export const SOCIAL = {
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.3-.5.1-1.1.1-1.8-.1a16.4 16.4 0 0 1-6.2-5.4c-.7-.9-1.2-2.1-1.2-3.2 0-1.1.6-1.7.8-2 .2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8.1.2.1.3 0 .5-.1.2-.2.3-.4.5l-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.4 1.8 2.2 1.2 1.1 2.2 1.4 2.6 1.6.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.8.8 2.1 1 .3.2.5.2.6.4.1.1.1.7-.1 1.3z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V22h3.4z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 0 0-1.9 1.9C2 8.9 2 12 2 12s0 3.1.4 4.8a2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9c.4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8zM10 15V9l5.2 3-5.2 3z"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2h3.4l-7.5 8.6L23 22h-6.9l-5.4-7-6.2 7H1.1l8-9.2L.7 2h7.1l4.9 6.4L18.2 2zm-1.2 18h1.9L7.1 3.9H5.1L17 20z"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5 2.7 10.7c-1.3.5-1.3 1.2-.2 1.5l4.8 1.5 1.9 5.8c.2.7.1.9.8.9.5 0 .7-.2 1-.5l2.7-2.6 5.6 4.1c1 .6 1.8.3 2-.9l3.6-16.8c.4-1.5-.6-2.2-1.6-1.7z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.93 9h-3.18a15.7 15.7 0 0 0-1.39-5.08A8.03 8.03 0 0 1 19.93 11zM12 4.07a13.8 13.8 0 0 1 1.93 6.93h-3.86A13.8 13.8 0 0 1 12 4.07zM4.07 13h3.18a15.7 15.7 0 0 0 1.39 5.08A8.03 8.03 0 0 1 4.07 13zm3.18-2H4.07a8.03 8.03 0 0 1 4.57-5.08A15.7 15.7 0 0 0 7.25 11zM12 19.93a13.8 13.8 0 0 1-1.93-6.93h3.86A13.8 13.8 0 0 1 12 19.93zm2.64-8.93a13.9 13.9 0 0 1 0 2h-5.28a13.9 13.9 0 0 1 0-2zm.75 7.08a15.7 15.7 0 0 0 1.39-5.08h3.18a8.03 8.03 0 0 1-4.57 5.08z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a1 1 0 0 1 1.4 1.4l-3.4 3.4a1 1 0 0 1-1.4 0z"/><path d="M8.2 16.8a4 4 0 0 1 0-5.6l2.2-2.2a1 1 0 1 0-1.4-1.4l-2.2 2.2a6 6 0 0 0 8.5 8.5l2.2-2.2a1 1 0 0 0-1.4-1.4l-2.2 2.2a4 4 0 0 1-5.7 0zm7.6-9.6a4 4 0 0 1 0 5.6l-2.2 2.2a1 1 0 1 0 1.4 1.4l2.2-2.2a6 6 0 0 0-8.5-8.5L6.5 7.9a1 1 0 1 0 1.4 1.4l2.2-2.2a4 4 0 0 1 5.7 0z"/></svg>`
};

export const DEFAULT_SOCIAL_STRIP = [
  { id: "whatsappChannel", icon: "whatsapp", labelHi: "WA", labelEn: "WA", url: "https://whatsapp.com/channel/upbms", visible: true, order: 1 },
  { id: "whatsappGroup", icon: "whatsapp", labelHi: "ग्रुप", labelEn: "Group", url: "https://chat.whatsapp.com/upbms", visible: true, order: 2 },
  { id: "facebook", icon: "facebook", labelHi: "FB", labelEn: "FB", url: "https://facebook.com/upbms", visible: true, order: 3 },
  { id: "instagram", icon: "instagram", labelHi: "Insta", labelEn: "Insta", url: "https://instagram.com/upbms", visible: true, order: 4 },
  { id: "youtube", icon: "youtube", labelHi: "YT", labelEn: "YT", url: "https://youtube.com/@upbms", visible: true, order: 5 },
  { id: "twitter", icon: "twitter", labelHi: "X", labelEn: "X", url: "https://twitter.com/upbms", visible: true, order: 6 },
  { id: "telegram", icon: "telegram", labelHi: "TG", labelEn: "TG", url: "https://t.me/upbms", visible: true, order: 7 }
];

export function getSocialStrip(settings) {
  const s = settings || {};
  const sl = s.socialLinks || {};
  if (Array.isArray(s.socialStrip) && s.socialStrip.length > 0) {
    return s.socialStrip.map((item, idx) => ({
      id: item.id || `soc_${idx + 1}`,
      icon: item.icon || "link",
      labelHi: item.labelHi !== undefined ? item.labelHi : (item.label || "Link"),
      labelEn: item.labelEn !== undefined ? item.labelEn : (item.label || item.labelHi || "Link"),
      url: item.url !== undefined ? item.url : (sl[item.id] || ""),
      visible: item.visible !== false,
      order: Number(item.order !== undefined ? item.order : (idx + 1))
    }));
  }
  return DEFAULT_SOCIAL_STRIP.map((def) => ({
    ...def,
    url: sl[def.id] !== undefined ? sl[def.id] : def.url
  }));
}
