// ============================================================
// AnatomyFigure.jsx — imagens reais + highlight por campo ativo
// focusedKey: destaca ponto/linha ativa, escurece as demais
// ============================================================

const AnatomyFigure = ({ mode = "dobras", focusedKey = null, sexo = "F" }) => {
  const [hov, setHov] = React.useState(null);

  const IMG_FRENTE_SRC = sexo === "F" ? "Silhuetas/mulher_frente.png" : "Silhuetas/homem_frente.png";
  const IMG_COSTAS_SRC = sexo === "F" ? "Silhuetas/mulher_costas.png" : "Silhuetas/homem_costas.png";

  // ── Coordenadas separadas por sexo ─────────────────────────────────
  // ViewBox 0 0 200 440, preserveAspectRatio="xMidYMid meet" (height constrains):
  //   homem_frente.png  668×1696 → W renderizado ≈ 173px, offsetX ≈ 13 → corpo x≈13..186
  //   mulher_frente.png 625×1696 → W renderizado ≈ 162px, offsetX ≈ 19 → corpo x≈19..181
  //   *costas: ambas 568×1696 → mesmo tamanho, sem diferença de offset
  // Fórmula usada para converter cx_M → cx_F:
  //   cx_F = 19 + (cx_M - 13) * (162/173)

  const DOBRA_POINTS_M = [
    { n: 1,  key: "tricipital",   label: "Tricipital",    view: "B", cx: 40,  cy: 140 },
    { n: 2,  key: "biceps",       label: "Bíceps",        view: "F", cx: 40,  cy: 138 },
    { n: 3,  key: "subescapular", label: "Subescapular",  view: "B", cx: 88,  cy: 142 },
    { n: 4,  key: "axilar",       label: "Axilar média",  view: "F", cx: 62,  cy: 138 },
    { n: 5,  key: "suprailíaca",  label: "Suprailíaca",   view: "F", cx: 136, cy: 200 },
    { n: 6,  key: "supraespinal", label: "Supraespinal",  view: "F", cx: 132, cy: 210 },
    { n: 7,  key: "abdominal",    label: "Abdominal",     view: "F", cx: 108, cy: 178 },
    { n: 8,  key: "coxa",         label: "Coxa anterior", view: "F", cx: 84,  cy: 290 },
    { n: 9,  key: "panturrilha",  label: "Panturrilha",   view: "F", cx: 82,  cy: 365 },
  ];

  // Costas (view B) usam mesma imagem para ambos os sexos → cx inalterado
  // Frente (view F) com cx ajustados proporcionalmente para mulher_frente.png
  const DOBRA_POINTS_F = [
    { n: 1,  key: "tricipital",   label: "Tricipital",    view: "B", cx: 40,  cy: 140 },
    { n: 2,  key: "biceps",       label: "Bíceps",        view: "F", cx: 44,  cy: 138 },
    { n: 3,  key: "subescapular", label: "Subescapular",  view: "B", cx: 88,  cy: 142 },
    { n: 4,  key: "axilar",       label: "Axilar média",  view: "F", cx: 64,  cy: 138 },
    { n: 5,  key: "suprailíaca",  label: "Suprailíaca",   view: "F", cx: 133, cy: 200 },
    { n: 6,  key: "supraespinal", label: "Supraespinal",  view: "F", cx: 130, cy: 210 },
    { n: 7,  key: "abdominal",    label: "Abdominal",     view: "F", cx: 107, cy: 178 },
    { n: 8,  key: "coxa",         label: "Coxa anterior", view: "F", cx: 85,  cy: 290 },
    { n: 9,  key: "panturrilha",  label: "Panturrilha",   view: "F", cx: 83,  cy: 365 },
  ];

  const CIRC_LINES_M = [
    { n: "A", key: "torax",           label: "Tórax",           y: 122, x1: 58,  x2: 142 },
    { n: "B", key: "braco",           label: "Braço relaxado",  y: 135, x1: 33,  x2: 62  },
    { n: "C", key: "braco_contraido", label: "Braço contraído", y: 138, x1: 33,  x2: 62  },
    { n: "D", key: "cintura",         label: "Cintura",         y: 160, x1: 62,  x2: 138 },
    { n: "E", key: "abdomen",         label: "Abdômen",         y: 185, x1: 58,  x2: 142 },
    { n: "F", key: "quadril",         label: "Quadril",         y: 233, x1: 54,  x2: 146 },
    { n: "G", key: "coxa",            label: "Coxa",            y: 272, x1: 62,  x2: 96  },
    { n: "H", key: "panturrilha",     label: "Panturrilha",     y: 349, x1: 64,  x2: 96  },
  ];

  // x1/x2 ajustados para mulher_frente.png (corpo mais estreito/centralizado)
  const CIRC_LINES_F = [
    { n: "A", key: "torax",           label: "Tórax",           y: 122, x1: 61,  x2: 139 },
    { n: "B", key: "braco",           label: "Braço relaxado",  y: 135, x1: 37,  x2: 64  },
    { n: "C", key: "braco_contraido", label: "Braço contraído", y: 138, x1: 37,  x2: 64  },
    { n: "D", key: "cintura",         label: "Cintura",         y: 160, x1: 64,  x2: 136 },
    { n: "E", key: "abdomen",         label: "Abdômen",         y: 185, x1: 61,  x2: 139 },
    { n: "F", key: "quadril",         label: "Quadril",         y: 233, x1: 57,  x2: 143 },
    { n: "G", key: "coxa",            label: "Coxa",            y: 272, x1: 64,  x2: 97  },
    { n: "H", key: "panturrilha",     label: "Panturrilha",     y: 349, x1: 66,  x2: 97  },
  ];

  const DOBRA_POINTS = sexo === "F" ? DOBRA_POINTS_F : DOBRA_POINTS_M;
  const CIRC_LINES   = sexo === "F" ? CIRC_LINES_F   : CIRC_LINES_M;

  const dobraKeys = new Set(DOBRA_POINTS.map(p => p.key));
  const circKeys  = new Set(CIRC_LINES.map(c => c.key));

  // activeKey = campo focado OU ponto em hover
  const activeKey = focusedKey || hov;

  const focusIsInDobras = activeKey && dobraKeys.has(activeKey);
  const focusIsInCircs  = activeKey && circKeys.has(activeKey);

  // Dobras: ativo = azul (#2563eb), inativo = cinza escuro muito opaco
  const dobraFill = (key) => {
    if (!focusIsInDobras) return "rgba(180,83,9,0.88)";   // default laranja
    return activeKey === key ? "rgba(180,83,9,0.95)" : "rgba(80,80,80,0.35)";
  };
  const dobraScale = (key) => {
    if (!focusIsInDobras) return 7;
    return activeKey === key ? 9 : 6;
  };

  // Circunferências: ativo = accent, inativo = muito transparente
  const circOpacity = (key) => {
    if (!focusIsInCircs) return 1;
    return activeKey === key ? 1 : 0.12;
  };

  const DobraPoint = ({ p }) => {
    const isActive = focusIsInDobras && activeKey === p.key;
    return (
      <g
        onMouseEnter={() => setHov(p.key)}
        onMouseLeave={() => setHov(null)}
        style={{ cursor: "default", transition: "opacity 0.18s" }}
      >
        <circle cx={p.cx} cy={p.cy} r={dobraScale(p.key)}
          fill={dobraFill(p.key)}
          stroke={isActive ? "white" : "rgba(255,255,255,0.7)"}
          strokeWidth={isActive ? "2" : "1.2"}
          style={{ transition: "fill 0.18s, r 0.15s" }} />
        <text x={p.cx} y={p.cy + 4} textAnchor="middle"
          fontSize={isActive ? "8" : "7"} fontWeight="700"
          fill={focusIsInDobras && activeKey !== p.key ? "rgba(255,255,255,0.5)" : "white"}
          fontFamily="'JetBrains Mono',monospace">{p.n}</text>
      </g>
    );
  };

  const CircLine = ({ c }) => {
    const isActive = focusIsInCircs && activeKey === c.key;
    const col = isActive ? "var(--accent)" : "#2563eb";
    return (
      <g
        onMouseEnter={() => setHov(c.key)}
        onMouseLeave={() => setHov(null)}
        style={{ cursor: "default", opacity: circOpacity(c.key), transition: "opacity 0.18s" }}
      >
        {/* Linha estendida + pontilhado */}
        <line x1={c.x1 - 2} y1={c.y} x2={c.x2 + 2} y2={c.y}
          stroke={col} strokeWidth={isActive ? 2.8 : 1.8} strokeDasharray="4,2" />
        {/* Badge letra */}
        <rect x={c.x2 + 4} y={c.y - 7} width="15" height="13" rx="3"
          fill={col} opacity={isActive ? 1 : 0.85} />
        <text x={c.x2 + 11.5} y={c.y + 4.5} textAnchor="middle"
          fontSize="7.5" fontWeight="700" fill="white"
          fontFamily="'JetBrains Mono',monospace">{c.n}</text>
      </g>
    );
  };

  const focusLabel = mode === "dobras"
    ? DOBRA_POINTS.find(p => p.key === activeKey)?.label
    : CIRC_LINES.find(c => c.key === activeKey)?.label;

  const Panel = ({ imgSrc, children }) => (
    <svg viewBox="0 0 200 440" width="138" height="304" style={{ overflow: "visible", display: "block" }}>
      <image
        href={imgSrc}
        x="0" y="0" width="200" height="440"
        preserveAspectRatio="xMidYMid meet"
        style={{ mixBlendMode: "multiply" }}
      />
      {children}
    </svg>
  );

  return (
    <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 8px 10px" }}>
      <div style={{ fontSize:10.5, fontWeight:700, color:"var(--muted)", letterSpacing:"0.08em", textTransform:"uppercase", textAlign:"center", marginBottom:8 }}>
        Pontos anatômicos
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8.5, color:"var(--muted)", letterSpacing:"0.06em", marginBottom:2 }}>FRENTE</div>
          <Panel imgSrc={IMG_FRENTE_SRC}>
            {mode === "circs"  && CIRC_LINES.map(c => <CircLine key={c.n} c={c} />)}
            {mode === "dobras" && DOBRA_POINTS.filter(p => p.view === "F").map(p => <DobraPoint key={p.n} p={p} />)}
          </Panel>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8.5, color:"var(--muted)", letterSpacing:"0.06em", marginBottom:2 }}>COSTAS</div>
          <Panel imgSrc={IMG_COSTAS_SRC}>
            {mode === "dobras" && DOBRA_POINTS.filter(p => p.view === "B").map(p => <DobraPoint key={p.n} p={p} />)}
          </Panel>
        </div>
      </div>
      <div style={{ height:16, textAlign:"center", fontSize:11, fontWeight:600, color:"var(--accent)", marginTop:6, opacity:focusLabel?1:0, transition:"opacity 0.15s" }}>
        {focusLabel}
      </div>
    </div>
  );
};

Object.assign(window, { AnatomyFigure });
