// ============================================================
// components_v2.jsx — Design System v2 (top bar + painel duplo)
// ============================================================

const THEMES_V2 = {
  A: {
    topbar: "#111827", topbarText: "#9CA3AF",
    listBg: "#F9FAFB", listBorder: "#E5E7EB",
    bg: "#F3F4F6", surface: "#FFFFFF", border: "#E5E7EB",
    text: "#111827", muted: "#6B7280",
    accent: "#2563EB", accentLight: "#EFF6FF", accentText: "#FFFFFF",
    name: "Clinical Blue",
  },
  B: {
    topbar: "#18120A", topbarText: "#9C8470",
    listBg: "#FAF8F4", listBorder: "#E8E0D4",
    bg: "#F5F1EB", surface: "#FEFCF9", border: "#E8E0D4",
    text: "#1C1308", muted: "#8A7660",
    accent: "#B45309", accentLight: "#FEF3C7", accentText: "#FFFFFF",
    name: "Warm Amber",
  },
  C: {
    topbar: "#060912", topbarText: "#4B5880",
    listBg: "#0E1729", listBorder: "#1E2D45",
    bg: "#0B1422", surface: "#111E32", border: "#1E2D45",
    text: "#CDD8EE", muted: "#5A7098",
    accent: "#38BDF8", accentLight: "#082F49", accentText: "#030B14",
    name: "Midnight",
  },
};

const applyTheme = (key) => {
  const t = THEMES_V2[key] || THEMES_V2.A;
  const r = document.documentElement.style;
  r.setProperty("--topbar",       t.topbar);
  r.setProperty("--topbar-text",  t.topbarText);
  r.setProperty("--list-bg",      t.listBg);
  r.setProperty("--list-border",  t.listBorder);
  r.setProperty("--bg",           t.bg);
  r.setProperty("--surface",      t.surface);
  r.setProperty("--border",       t.border);
  r.setProperty("--text",         t.text);
  r.setProperty("--muted",        t.muted);
  r.setProperty("--accent",       t.accent);
  r.setProperty("--accent-light", t.accentLight);
  r.setProperty("--accent-text",  t.accentText);
};

// ===== BADGE =====
const TAG_COLORS = {
  green:  { bg: "#DCFCE7", text: "#166534" },
  yellow: { bg: "#FEF9C3", text: "#854D0E" },
  orange: { bg: "#FFEDD5", text: "#9A3412" },
  red:    { bg: "#FEE2E2", text: "#991B1B" },
  blue:   { bg: "#DBEAFE", text: "#1E40AF" },
  gray:   { bg: "#F1F5F9", text: "#475569" },
};

const Badge = ({ tag = "gray", children, small }) => {
  const c = TAG_COLORS[tag] || TAG_COLORS.gray;
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: small ? "1px 7px" : "3px 10px",
      borderRadius: 4, fontSize: small ? 10.5 : 12,
      fontWeight: 600, whiteSpace: "nowrap",
      letterSpacing: "0.01em", display: "inline-block",
    }}>{children}</span>
  );
};

// ===== AVATAR =====
const Avatar = ({ nome, size = 36 }) => {
  const initials = nome ? nome.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() : "?";
  const hue = nome ? (nome.charCodeAt(0) * 41 + (nome.charCodeAt(1) || 0) * 17) % 360 : 200;
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: `oklch(0.65 0.10 ${hue})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "#fff",
      flexShrink: 0, letterSpacing: "-0.02em",
    }}>{initials}</div>
  );
};

// ===== TOP BAR =====
const TopBar = ({ onNewPatient, theme, setTheme }) => (
  <header style={{
    height: 52, background: "var(--topbar)",
    display: "flex", alignItems: "center",
    padding: "0 20px", gap: 16, flexShrink: 0,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.04em" }}>antropo</span>
      <span style={{ fontSize: 10, color: "var(--topbar-text)", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7 }}>
        antropometria
      </span>
    </div>

    <div style={{ flex: 1 }} />

    {/* Tema toggle */}
    <div style={{ display: "flex", gap: 4 }}>
      {Object.entries(THEMES_V2).map(([k, t]) => (
        <button key={k} title={t.name} onClick={() => setTheme(k)} style={{
          width: 20, height: 20, borderRadius: 4,
          background: t.accent, border: theme === k ? "2px solid #fff" : "2px solid transparent",
          cursor: "pointer", padding: 0, transition: "border 0.15s",
        }} />
      ))}
    </div>

    <button onClick={onNewPatient} style={{
      background: "var(--accent)", color: "var(--accent-text)",
      border: "none", borderRadius: 6, padding: "7px 14px",
      fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      letterSpacing: "-0.01em",
    }}>+ Novo paciente</button>
  </header>
);

// ===== BOTÕES =====
const Btn = ({ onClick, children, variant = "primary", small, disabled }) => {
  const base = {
    padding: small ? "5px 12px" : "8px 18px",
    borderRadius: 6, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontSize: small ? 12 : 13, fontWeight: 600, fontFamily: "inherit",
    transition: "all 0.12s", opacity: disabled ? 0.45 : 1,
    display: "inline-flex", alignItems: "center", gap: 6,
    letterSpacing: "-0.01em",
  };
  const variants = {
    primary:   { background: "var(--accent)", color: "var(--accent-text)" },
    secondary: { background: "transparent", color: "var(--text)", border: "1px solid var(--border)" },
    ghost:     { background: "transparent", color: "var(--muted)" },
    danger:    { background: "rgba(220,38,38,0.08)", color: "#dc2626" },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
};

// ===== CARD =====
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 10, ...style,
    cursor: onClick ? "pointer" : undefined,
  }}>{children}</div>
);

// ===== INPUTS =====
const Field = ({ label, value, onChange, type = "text", unit, placeholder, readOnly, note }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</label>}
    <div style={{ position: "relative" }}>
      <input type={type} value={value ?? ""} placeholder={placeholder ?? ""}
        onChange={e => onChange && onChange(e.target.value)} readOnly={readOnly}
        style={{
          width: "100%", padding: "8px 10px", paddingRight: unit ? 36 : 10,
          borderRadius: 6, border: "1px solid var(--border)",
          background: readOnly ? "var(--bg)" : "var(--surface)",
          color: "var(--text)", fontSize: 13.5, fontFamily: "inherit",
          outline: "none", boxSizing: "border-box",
        }}
        onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-light)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
      />
      {unit && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11.5, color: "var(--muted)", pointerEvents: "none" }}>{unit}</span>}
    </div>
    {note && <span style={{ fontSize: 11, color: "var(--muted)" }}>{note}</span>}
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {label && <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)",
      background: "var(--surface)", color: "var(--text)", fontSize: 13.5,
      fontFamily: "inherit", outline: "none",
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ===== INFO TOOLTIP =====
const InfoTip = ({ text }) => {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", marginLeft: 4 }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{
        width: 15, height: 15, borderRadius: "50%",
        background: show ? "var(--accent)" : "var(--border)",
        color: show ? "var(--accent-text)" : "var(--muted)",
        fontSize: 9.5, fontWeight: 700, display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        cursor: "default", transition: "all 0.15s", flexShrink: 0,
        userSelect: "none",
      }}>i</span>
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)",
          background: "var(--text)", color: "var(--surface)",
          fontSize: 11.5, lineHeight: 1.5, padding: "8px 12px",
          borderRadius: 8, width: 220, zIndex: 999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          pointerEvents: "none",
        }}>
          {text}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderTop: "5px solid var(--text)",
          }} />
        </div>
      )}
    </span>
  );
};

// ===== NÚMERO COM VÍRGULA =====
const fmtN = (v, dec = 1) => v != null && !isNaN(v) ? Number(v).toFixed(dec).replace('.', ',') : "—";

// ===== EMPTY STATE =====
const Empty = ({ icon, title, sub, action }) => (
  <div style={{ textAlign: "center", padding: "72px 24px", color: "var(--muted)" }}>
    <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.5 }}>{icon}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13.5, marginBottom: 22 }}>{sub}</div>
    {action}
  </div>
);

// Alias local seguro
const _fmtData = (s) => s ? s.split("-").reverse().join("/") : "—";

Object.assign(window, {
  THEMES_V2, applyTheme, Badge, Avatar, TopBar, Btn, Card, Field, Select, fmtN, Empty, InfoTip,
  TAG_COLORS, _fmtData,
});
