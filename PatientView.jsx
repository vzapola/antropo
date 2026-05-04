// ============================================================
// PatientView.jsx — Painel direito: detalhe + tabs contextuais
// ============================================================

// Helper: retorna %G do protocolo escolhido para uma avaliação
const _getProtoGFn = (av, patient, idade, protoRef) => {
  const r = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
  switch(protoRef) {
    case "Petroski": return r.petsiri;
    case "Guedes":   return r.gueddsiri;
    case "Faulkner": return r.faulk;
    case "Durnin":   return r.dwsiri;
    case "Carter":   return r.carterSiri;
    default:         return r.jp3siri;
  }
};

// ---- Tab: Lista de avaliações do paciente ----
const AvaliacoesTab = ({ patient, avaliacoes, onOpenAv, onEditAv, onDeleteAv, onNewAv, protoRef }) => {
  const avs = avaliacoes
    .filter(a => a.paciente_id === patient.id)
    .sort((a, b) => b.data.localeCompare(a.data));
  const idade = calcIdade(patient.nascimento);
  const [confirmAvId, setConfirmAvId] = React.useState(null);
  const [hovAvId, setHovAvId] = React.useState(null);

  const protoShort = (PROTO_LABELS[protoRef] || "JP3").split("·")[0].trim().split(" ")[0];

  if (avs.length === 0) return (
    <Empty icon="📋" title="Sem avaliações registradas"
      sub="Registre a primeira avaliação deste paciente."
      action={<Btn onClick={onNewAv}>+ Nova avaliação</Btn>} />
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Sumário da última avaliação */}
      {(() => {
        const av = avs[0];
        const r  = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
        const pG = _getProtoGFn(av, patient, idade, protoRef);
        const mg = pG != null ? av.peso * pG / 100 : null;
        const mlg = mg != null ? av.peso - mg : null;
        return (
          <div style={{
            background: "var(--accent-light)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "16px 20px", marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: 12 }}>
              ÚLTIMA AVALIAÇÃO — {_fmtData(av.data)}
            </div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { l: "Peso", v: fmtN(av.peso, 1), u: "kg" },
                { l: "IMC", v: fmtN(r.imc, 1), u: "kg/m²", badge: r.classIMC },
                { l: `%G · ${protoShort}`, v: fmtN(pG, 1), u: "%", badge: pG != null ? classPctG(pG, patient.sexo) : null },
                { l: "MG", v: fmtN(mg, 1), u: "kg" },
                { l: "MLG", v: fmtN(mlg, 1), u: "kg" },
              ].map(item => (
                <div key={item.l}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "var(--text)", lineHeight: 1.1 }}>{item.v}</div>
                  {item.badge
                    ? <Badge tag={item.badge.tag} small>{item.badge.label}</Badge>
                    : <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.u}</div>
                  }
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {avs.map((av, i) => {
          const r  = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
          const pG = _getProtoGFn(av, patient, idade, protoRef);
          const hov = hovAvId === av.id;
          return (
            <div key={av.id}
              onMouseEnter={() => setHovAvId(av.id)}
              onMouseLeave={() => setHovAvId(null)}
              style={{
                background: "var(--surface)", border: `1px solid ${hov ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 8, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
                transition: "border-color 0.12s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, cursor: "pointer" }}
                onClick={() => onOpenAv(av)}>
                <div style={{ minWidth: 90 }}>
                  {i === 0 && <div style={{ marginBottom: 2 }}><Badge tag="green" small>Atual</Badge></div>}
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{_fmtData(av.data)}</div>
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {[
                    { l: "Peso", v: fmtN(av.peso, 1) + " kg" },
                    { l: "IMC", v: fmtN(r.imc, 1), badge: r.classIMC },
                    { l: `%G · ${protoShort}`, v: pG != null ? fmtN(pG, 1) + "%" : "—" },
                    { l: "MLG", v: pG != null ? fmtN(av.peso * (1 - pG/100), 1) + " kg" : "—" },
                  ].map(c => (
                    <div key={c.l}>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{c.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "var(--text)" }}>{c.v}</div>
                      {c.badge && <Badge tag={c.badge.tag} small>{c.badge.label}</Badge>}
                    </div>
                  ))}
                </div>
                <span style={{ color: "var(--muted)", fontSize: 18 }}>›</span>
              </div>
              <div style={{ display: "flex", gap: 4, opacity: hov ? 1 : 0, transition: "opacity 0.12s", flexShrink: 0 }}>
                <button onClick={() => onEditAv(av)} title="Editar avaliação"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✏️</button>
                <button onClick={() => setConfirmAvId(av.id)} title="Excluir avaliação"
                  style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 5, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🗑</button>
              </div>
            </div>
          );
        })}
        {confirmAvId && (
          <ConfirmDialog
            message={`Excluir a avaliação de ${_fmtData(avs.find(a => a.id === confirmAvId)?.data)}? Esta ação não pode ser desfeita.`}
            onCancel={() => setConfirmAvId(null)}
            onConfirm={() => { onDeleteAv(confirmAvId); setConfirmAvId(null); }}
          />
        )}
      </div>
    </div>
  );
};

// ---- Configuração dos protocolos por sexo ----
const PROTOCOL_DOBRAS = {
  "JP3_M":      ["peitoral","abdominal","coxa"],
  "JP3_F":      ["tricipital","suprailíaca","coxa"],
  "Petroski_M": ["subescapular","tricipital","suprailíaca","panturrilha"],
  "Petroski_F": ["axilar","suprailíaca","coxa","panturrilha"],
  "Guedes_M":   ["tricipital","suprailíaca","abdominal"],
  "Guedes_F":   ["coxa","suprailíaca","subescapular"],
  "Faulkner":   ["tricipital","subescapular","suprailíaca","abdominal"],
  "Durnin":     ["biceps","tricipital","subescapular","suprailíaca"],
  "ISAK8":      ["tricipital","subescapular","biceps","suprailíaca","supraespinal","abdominal","coxa","panturrilha"],
  "Carter":     ["tricipital","subescapular","suprailíaca","supraespinal","abdominal","coxa"],
};

const PROTO_LABELS = {
  JP3:      "JP3 · J&P (1978/80)",
  Petroski: "Petroski (1995)",
  Guedes:   "Guedes (1994)",
  Faulkner: "Faulkner (1968)",
  Durnin:   "Durnin & W. (1974)",
  Carter:   "Carter (1982)",
};

const DOBRAS_LIST = [
  { key: "tricipital",   label: "Tricipital",    n: 1,  tip: "Ponto meso umeral (médio entre acrômio e cabeça do rádio). Dobra vertical na face posterior do braço. Braço relaxado ao lado do corpo." },
  { key: "biceps",       label: "Bíceps",        n: 2,  tip: "Face anterior do braço, no mesmo nível do tricipital. Dobra vertical sobre o ventre do bíceps." },
  { key: "subescapular", label: "Subescapular",  n: 3,  tip: "Peça para fechar o punho e colocar nas costas para localizar a escápula. A dobra fica 2 cm abaixo do ângulo inferior da escápula — é uma dobra DIAGONAL." },
  { key: "peitoral",     label: "Peitoral",      n: 4,  tip: "Na linha axilar anterior, oblíqua, entre a prega axilar anterior e o mamilo. Usada em homens no JP3." },
  { key: "axilar",       label: "Axilar média",  n: 5,  tip: "Linha axilar média, no nível do processo xifóide (entre as costelas). Dobra vertical — puxe a linha reta até a axila." },
  { key: "suprailíaca",  label: "Suprailíaca",   n: 6,  tip: "A partir da axilar, apalpando até em baixo, ache a borda ilíaca e marque. Meça 3 cm para cima. Dobra ligeiramente oblíqua." },
  { key: "supraespinal", label: "Supraespinal",  n: 7,  tip: "Continuando a borda ilíaca, com a palma da mão ache a crista ilíaca (osso do quadril). Puxe uma linha reta para cima e pegue a marcação da suprailíaca. Dobra DIAGONAL — marque como *." },
  { key: "abdominal",    label: "Abdominal",     n: 8,  tip: "5 cm lateral à cicatriz umbilical, do lado direito. Dobra vertical. Paciente em posição relaxada." },
  { key: "coxa",         label: "Coxa anterior", n: 9,  tip: "Paciente sentado — marque o começo da patela e localize a linha inguinal da coxa. Ponto médio entre eles, na face anterior. Peça ao paciente para erguer levemente a perna." },
  { key: "panturrilha",  label: "Panturrilha",   n: 10, tip: "Face medial da panturrilha, no ponto de maior perímetro. Joelho flexionado a 90°, pé apoiado." },
];

const CIRCS_LIST = [
  { key: "torax",          label: "Tórax",          n: "A", tip: "Na altura dos mamilos, com os braços relaxados ao lado do corpo. Medir ao final de uma expiração normal." },
  { key: "braco",          label: "Braço relaxado",  n: "B", tip: "Use como referência a cicatriz da vacina BCG. Relaxe o braço ao lado do corpo. Ponto médio entre acrômio e olécrano." },
  { key: "braco_contraido",label: "Braço contraído", n: "C", tip: "Use como referência a cicatriz da vacina BCG. Contraia o bíceps — braço em 90° — e meça no maior perímetro." },
  { key: "cintura",        label: "Cintura",         n: "D", tip: "Parte mais fina do abdômen. Use 2 dedos acima do umbigo como referência. Medir ao final de uma expiração normal." },
  { key: "abdomen",        label: "Abdômen",         n: "E", tip: "Parte mais larga da barriga, geralmente bem na linha do umbigo. Diferente da cintura — é o maior perímetro abdominal." },
  { key: "quadril",        label: "Quadril",         n: "F", tip: "Ao redor do maior volume dos glúteos, passando a fita pela parte mais saliente do bumbum, com os pés juntos." },
  { key: "coxa",           label: "Coxa",            n: "G", tip: "20 cm acima da parte superior do joelho. A medida fica geralmente no meio da coxa, entre o joelho e a cintura." },
  { key: "panturrilha",    label: "Panturrilha",     n: "H", tip: "Maior perímetro da panturrilha. Paciente em pé, peso distribuído nos dois pés." },
];

// ---- Componentes da tabela de resultados ----
const ResultRow = ({ indicador, valor, dec, unidade, badge }) => (
  <tr style={{ borderBottom: "1px solid var(--border)" }}>
    <td style={{ padding: "8px 16px", fontSize: 12.5, color: "var(--text)" }}>{indicador}</td>
    <td style={{ padding: "8px 16px", textAlign: "right" }}>
      {valor != null && !isNaN(valor)
        ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 13 }}>{Number(valor).toFixed(dec ?? 1).replace('.', ',')}</span>
        : <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>
      }
    </td>
    <td style={{ padding: "8px 16px", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{unidade ?? ""}</td>
    <td style={{ padding: "8px 16px" }}>{badge && <Badge tag={badge.tag} small>{badge.label}</Badge>}</td>
  </tr>
);

const ProtoSection = ({ title, publico, protoId, protoRef, onProtoChange, rows }) => (
  <>
    <tr>
      <td colSpan={4} style={{ padding: "10px 16px 6px", background: "var(--bg)", borderBottom: "1px solid var(--border)", borderTop: "2px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</span>
          {publico && <span style={{ fontSize: 10.5, color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 7px" }}>{publico}</span>}
          {protoId && (
            <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 10.5, color: protoRef === protoId ? "var(--accent)" : "var(--muted)", fontWeight: protoRef === protoId ? 700 : 400, userSelect: "none" }} className="no-print">
              <input type="radio" name="protoRefSelector" value={protoId} checked={protoRef === protoId} onChange={() => onProtoChange(protoId)} style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
              {protoRef === protoId ? "✓ Protocolo do Histórico" : "Usar no Histórico"}
            </label>
          )}
        </div>
      </td>
    </tr>
    {rows.map((r, i) => r && <ResultRow key={i} {...r} />)}
  </>
);

const TableSection = ({ title, rows }) => (
  <>
    <tr>
      <td colSpan={4} style={{ padding: "10px 16px 6px", background: "var(--bg)", fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.09em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", borderTop: "2px solid var(--border)" }}>{title}</td>
    </tr>
    {rows.map((r, i) => r && <ResultRow key={i} {...r} />)}
  </>
);

// ---- Tab: Formulário de avaliação ----
const AvaliacaoFormTab = ({ patient, avaliacao: initialAv, isNew, onSave, protoRef, onProtoChange }) => {
  const idade = calcIdade(patient.nascimento);
  const sexo = patient.sexo;
  const [subTab, setSubTab] = React.useState(0);
  const [focusedKey, setFocusedKey] = React.useState(null);
  const [form, setForm] = React.useState(() => {
    if (initialAv) return { _id: initialAv.id, data: initialAv.data, peso: String(initialAv.peso), altura: String(initialAv.altura), dobras: { ...initialAv.dobras }, circs: { ...initialAv.circs } };
    return { data: new Date().toISOString().slice(0, 10), peso: "", altura: "", dobras: {}, circs: {} };
  });

  const setF = k => v => setForm(p => ({ ...p, [k]: v }));
  const setD = k => v => setForm(p => ({ ...p, dobras: { ...p.dobras, [k]: v === "" ? undefined : Number(v) } }));
  const setC = k => v => setForm(p => ({ ...p, circs: { ...p.circs, [k]: v === "" ? undefined : Number(v) } }));

  const peso = parseFloat(form.peso) || 0;
  const alt  = parseFloat(form.altura) || 0;
  const res  = React.useMemo(() => (!peso || !alt) ? null : calcularTudo(peso, alt, sexo, idade, form.dobras, form.circs), [peso, alt, sexo, idade, form.dobras, form.circs]);

  const SUB_TABS = ["Medidas gerais", "Dobras cutâneas", "Circunferências", "Resultados"];
  const protoOk = (key) => {
    const mapKey = ["JP3","Guedes","Petroski"].includes(key) ? key + "_" + sexo : key;
    const dobras = PROTOCOL_DOBRAS[mapKey];
    return dobras && dobras.every(k => (form.dobras[k] ?? 0) > 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 24px", background: "var(--surface)", flexShrink: 0 }}>
        {SUB_TABS.map((t, i) => (
          <button key={i} onClick={() => setSubTab(i)} style={{ padding: "11px 16px", border: "none", background: "transparent", color: subTab === i ? "var(--accent)" : "var(--muted)", fontSize: 13, fontWeight: subTab === i ? 700 : 400, borderBottom: subTab === i ? "2px solid var(--accent)" : "2px solid transparent", cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
        ))}
        <div style={{ flex: 1 }} />
        {isNew && <div style={{ display: "flex", alignItems: "center" }}><Btn small onClick={() => onSave(form)}>Salvar avaliação</Btn></div>}
      </div>

      <div onMouseDown={() => setFocusedKey(null)} style={{ flex: 1, overflowY: "auto" }}>
        {/* MEDIDAS GERAIS */}
        {subTab === 0 && (
          <div style={{ padding: "20px 24px", maxWidth: 520 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <Field label="Data" value={form.data} onChange={setF("data")} type="date" />
              <div />
              <Field label="Peso" value={form.peso} onChange={setF("peso")} type="number" unit="kg" placeholder="ex: 72,0" />
              <Field label="Altura" value={form.altura} onChange={setF("altura")} type="number" unit="cm" placeholder="ex: 165" />
            </div>
            {res && (
              <div style={{ background: "var(--accent-light)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>IMC</div>
                  <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{fmtN(res.imc, 1)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>kg/m²</div>
                </div>
                <div>
                  <Badge tag={res.classIMC.tag}>{res.classIMC.label}</Badge>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Classificação OMS</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>PESO IDEAL (IMC-alvo 22)</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmtN(res.piImc, 1)} kg</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOBRAS */}
        {subTab === 1 && (
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
            <div>
              {(() => {
                const prevAvs = (window._patientAvaliacoes || []).filter(a => a.paciente_id === patient.id && (!form._id || a.id !== form._id)).sort((a,b) => b.data.localeCompare(a.data));
                const prev = prevAvs[0];
                if (!prev?.dobras || !Object.keys(prev.dobras).length) return null;
                return (
                  <div style={{ marginBottom: 12, background: "var(--accent-light)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Última medição — {_fmtData(prev.data)}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                      {DOBRAS_LIST.filter(d => prev.dobras[d.key] != null).map(d => (
                        <div key={d.key} style={{ minWidth: 80 }}>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{d.label}</div>
                          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13 }}>{fmtN(prev.dobras[d.key], 1)} <span style={{ fontWeight: 400, fontSize: 10, color: "var(--muted)" }}>mm</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {DOBRAS_LIST.map(d => (
                  <div key={d.key} onMouseDown={e => { e.stopPropagation(); setFocusedKey(d.key); }} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, background: "rgba(180,83,9,0.15)", color: "#B45309", borderRadius: "50%", fontSize: 8, fontWeight: 800, marginRight: 4 }}>{d.n}</span>
                        {d.label}
                      </span>
                      <InfoTip text={d.tip} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <input type="number" value={form.dobras[d.key] ?? ""} placeholder="0"
                        onChange={e => setD(d.key)(e.target.value)}
                        style={{ width: "100%", padding: "8px 36px 8px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                        onFocus={e => { setFocusedKey(d.key); e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-light)"; }}
                        onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                      />
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11.5, color: "var(--muted)", pointerEvents: "none" }}>mm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 0 }}>
              <AnatomyFigure mode="dobras" focusedKey={focusedKey} />
              <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Protocolos</div>
                {[
                  { k: "JP3", l: "JP3" + (sexo==="M"?" (M)":" (F)") },
                  { k: "Petroski", l: "Petroski (1995)" },
                  { k: "Guedes", l: "Guedes" },
                  { k: "Faulkner", l: "Faulkner" },
                  { k: "Durnin", l: "Durnin & W." },
                  { k: "ISAK8", l: "Σ8 ISAK" },
                  { k: "Carter", l: "Carter 6D" },
                ].map(p => {
                  const ok = protoOk(p.k);
                  return (
                    <div key={p.k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 5, background: ok ? "var(--accent-light)" : "var(--surface)", border: "1px solid var(--border)", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: ok ? "#16a34a" : "var(--muted)" }}>{ok ? "✓" : "○"}</span>
                      <span style={{ fontSize: 11.5, color: ok ? "var(--text)" : "var(--muted)", fontWeight: ok ? 600 : 400 }}>{p.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CIRCUNFERÊNCIAS */}
        {subTab === 2 && (
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
            <div>
              {(() => {
                const prevAvs = (window._patientAvaliacoes || []).filter(a => a.paciente_id === patient.id && (!form._id || a.id !== form._id)).sort((a,b) => b.data.localeCompare(a.data));
                const prev = prevAvs[0];
                if (!prev?.circs || !Object.keys(prev.circs).length) return null;
                return (
                  <div style={{ marginBottom: 12, background: "var(--accent-light)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Última medição — {_fmtData(prev.data)}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                      {CIRCS_LIST.filter(c => prev.circs[c.key] != null).map(c => (
                        <div key={c.key} style={{ minWidth: 90 }}>
                          <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{c.label}</div>
                          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13 }}>{fmtN(prev.circs[c.key], 1)} <span style={{ fontWeight: 400, fontSize: 10, color: "var(--muted)" }}>cm</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {CIRCS_LIST.map(c => (
                  <div key={c.key} onMouseDown={e => { e.stopPropagation(); setFocusedKey(c.key); }} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, background: "rgba(37,99,235,0.12)", color: "#2563eb", borderRadius: "50%", fontSize: 8, fontWeight: 800, marginRight: 4 }}>{c.n}</span>
                        {c.label}
                      </span>
                      <InfoTip text={c.tip} />
                    </div>
                    <div style={{ position: "relative" }}>
                      <input type="number" value={form.circs[c.key] ?? ""} placeholder="0"
                        onChange={e => setC(c.key)(e.target.value)}
                        style={{ width: "100%", padding: "8px 36px 8px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: 13.5, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                        onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-light)"; }}
                        onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                      />
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11.5, color: "var(--muted)", pointerEvents: "none" }}>cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 0 }}>
              <AnatomyFigure mode="circs" focusedKey={focusedKey} />
              {res && (
                <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: 10 }}>RAZÕES AO VIVO</div>
                  {[
                    { l: "RCQ", v: res.rcq, dec: 3, badge: classRCQ(res.rcq, sexo), ref: "OMS" },
                    { l: "RCE", v: res.rce, dec: 3, badge: classRCE(res.rce), ref: "Ashwell 2012" },
                    { l: "IC",  v: res.ic,  dec: 3, badge: res.ic ? (res.ic > (sexo==="M" ? 1.25 : 1.18) ? {label:"Risco",tag:"red"} : {label:"Adequado",tag:"green"}) : null, ref: "Valdez 1991" },
                    { l: "IAC", v: res.iac, dec: 1, ref: "Bergman 2011" },
                  ].map(item => (
                    <div key={item.l} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 700, fontSize: 12.5 }}>{item.l}</span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 600 }}>{fmtN(item.v, item.dec)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
                        {item.badge ? <Badge tag={item.badge.tag} small>{item.badge.label}</Badge> : <span />}
                        <span style={{ fontSize: 10.5, color: "var(--muted)" }}>{item.ref}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {subTab === 3 && (
          <div style={{ padding: "20px 24px" }}>
            {!res ? (
              <Empty icon="⚖️" title="Preencha peso e altura" sub="Os resultados aparecem ao vivo." action={<Btn onClick={() => setSubTab(0)}>Dados gerais</Btn>} />
            ) : (() => {
              const fp = res.faixaPesoIdeal;
              return (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Tabela de resultados — {_fmtData(form.data)}</span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>DC→%G via Siri · Würch (1973)</span>
                      <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, background: "var(--accent-light)", borderRadius: 4, padding: "2px 8px" }}>
                        Histórico: {PROTO_LABELS[protoRef] || "JP3"}
                      </span>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "var(--bg)" }}>
                          {["Indicador","Valor","Unidade","Classificação"].map(h => (
                            <th key={h} style={{ padding: "9px 16px", textAlign: h === "Valor" ? "right" : "left", fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <TableSection title="Dados gerais" rows={[
                          { indicador: "IMC ²", valor: res.imc, dec: 1, unidade: "kg/m²", badge: res.classIMC },
                          fp ? { indicador: "Faixa de peso eutrófico ¹", valor: null, unidade: `${fmtN(fp[0],1)} – ${fmtN(fp[1],1)} kg`, badge: null } : null,
                          { indicador: "Peso ideal — IMC-alvo 22 ¹", valor: res.piImc, dec: 1, unidade: "kg" },
                          { indicador: "Peso ideal — Lorentz ¹", valor: res.piLorentz, dec: 1, unidade: "kg" },
                          { indicador: "Peso ideal — Devine ¹", valor: res.piDevine, dec: 1, unidade: "kg" },
                        ].filter(Boolean)} />
                        <ProtoSection title="Jackson & Pollock 3 dobras (1978/1980)" publico={sexo === "M" ? "Homens 18–61 anos · adultos gerais" : "Mulheres 18–55 anos · adultas gerais"} protoId="JP3" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.jp3dc, dec: 4, unidade: "g/cm³" },
                          { indicador: "%G — Siri", valor: res.jp3comp.pctG, dec: 1, unidade: "%", badge: res.jp3comp.pctG != null ? classPctG(res.jp3comp.pctG, sexo) : null },
                          { indicador: "%G — Brozek", valor: res.jp3broz, dec: 1, unidade: "%" },
                          { indicador: "Massa Gorda", valor: res.jp3comp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.jp3comp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.jp3comp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Petroski (1995)" publico={sexo === "M" ? "Homens 18–66 anos · adultos brasileiros" : "Mulheres 18–51 anos · adultas brasileiras"} protoId="Petroski" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.petdc, dec: 4, unidade: "g/cm³" },
                          { indicador: "%G — Siri", valor: res.petcomp.pctG, dec: 1, unidade: "%", badge: res.petcomp.pctG != null ? classPctG(res.petcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.petcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.petcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.petcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Guedes (1994)" publico="Adultos brasileiros · ambos os sexos" protoId="Guedes" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.gueddc, dec: 4, unidade: "g/cm³" },
                          { indicador: "%G — Siri", valor: res.guedcomp.pctG, dec: 1, unidade: "%", badge: res.guedcomp.pctG != null ? classPctG(res.guedcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.guedcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.guedcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.guedcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Faulkner (1968)" publico="Adultos ativos e atletas · ambos os sexos · %G direto" protoId="Faulkner" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "%G direto (sem conversão por DC)", valor: res.faulkcomp.pctG, dec: 1, unidade: "%", badge: res.faulkcomp.pctG != null ? classPctG(res.faulkcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.faulkcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.faulkcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.faulkcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Durnin & Womersley (1974)" publico="Adultos 16–72 anos · ambos os sexos" protoId="Durnin" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.dwdc, dec: 4, unidade: "g/cm³" },
                          { indicador: "%G — Siri", valor: res.dwcomp.pctG, dec: 1, unidade: "%", badge: res.dwcomp.pctG != null ? classPctG(res.dwcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.dwcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.dwcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.dwcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Carter (1982) — 6 dobras incl. supraespinal" publico="Atletas · ambos os sexos (ISAK)" protoId="Carter" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.carterDC, dec: 4, unidade: "g/cm³" },
                          { indicador: "%G — Siri", valor: res.cartercomp.pctG, dec: 1, unidade: "%", badge: res.cartercomp.pctG != null ? classPctG(res.cartercomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.cartercomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.cartercomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.cartercomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <TableSection title="Composição corporal complementar" rows={[
                          { indicador: "Massa Muscular Esquelética — Lee (2000)", valor: res.mm, dec: 1, unidade: "kg" },
                          { indicador: `Massa Residual — Würch (1973) · ${sexo==="M"?"24,1%":"20,9%"} do peso`, valor: res.wurch, dec: 1, unidade: "kg" },
                        ]} />
                        <TableSection title="Σ8 dobras ISAK (Norton & Olds, 1996)" rows={[
                          { indicador: "Soma das 8 dobras (indicador relativo — não converte para %G)", valor: res.isak8, dec: 1, unidade: "mm" },
                        ]} />
                        <TableSection title="Razões antropométricas" rows={[
                          { indicador: "RCQ — Relação Cintura-Quadril", valor: res.rcq, dec: 3, badge: classRCQ(res.rcq, sexo) },
                          { indicador: "RCE — Relação Cintura-Estatura", valor: res.rce, dec: 3, badge: classRCE(res.rce) },
                          { indicador: "Índice de Conicidade — Valdez (1991)", valor: res.ic, dec: 3, badge: res.ic ? (res.ic > (sexo==="M" ? 1.25 : 1.18) ? {label:"Risco",tag:"red"} : {label:"Adequado",tag:"green"}) : null },
                          { indicador: "IAC — Índice de Adiposidade Corporal — Bergman (2011)", valor: res.iac, dec: 1, unidade: "%" },
                        ]} />
                        <TableSection title="Braço — Frisancho (1981)" rows={[
                          { indicador: "CMB — Circunferência Muscular do Braço", valor: res.cmb, dec: 1, unidade: "cm" },
                          { indicador: "AMB — Área Muscular do Braço", valor: res.amb, dec: 1, unidade: "cm²" },
                          { indicador: "AMBc — Área Muscular do Braço corrigida", valor: res.ambc, dec: 1, unidade: "cm²" },
                        ]} />
                        <TableSection title="Taxa Metabólica Basal" rows={[
                          { indicador: "Harris-Benedict revisada (Roza, 1984)", valor: res.hb, dec: 0, unidade: "kcal/dia" },
                          { indicador: "Mifflin-St Jeor (1990)", valor: res.mifflin, dec: 0, unidade: "kcal/dia" },
                          { indicador: "Cunningham (1980) — requer MLG calculada", valor: res.cunning, dec: 0, unidade: "kcal/dia" },
                        ]} />
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}><sup>¹</sup> Faixa de peso ideal calculada a partir da altura e dos valores limites do IMC de eutrofia (IMC 18,5–24,9 kg/m²).</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}><sup>²</sup> IMC avaliado conforme classificações da OMS (2006). Para idosos (≥60 anos), aplicada a classificação de Lipschitz (1994).</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>⚠️ Valores calculados on-the-fly — nenhum resultado derivado é persistido. Massa Magra = Massa Livre de Gordura no modelo bicompartimental.</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Componentes do relatório no nível do módulo (evita desmontagem a cada render) ----
const _nPR = (v, d=1) => v != null && !isNaN(v) ? Number(v).toFixed(d).replace('.',',') : '—';

const taStylePR = (base) => ({ ...base, border:'none', borderBottom:'1.5px dashed #ccc', background:'transparent', fontFamily:"'DM Sans',sans-serif", padding:0, outline:'none', width:'100%', boxSizing:'border-box' });

const BdgPR = ({ tag, label }) => {
  const c={green:'#166534',yellow:'#854D0E',orange:'#9A3412',red:'#991B1B',blue:'#1E40AF',gray:'#475569'};
  const b={green:'#DCFCE7',yellow:'#FEF9C3',orange:'#FFEDD5',red:'#FEE2E2',blue:'#DBEAFE',gray:'#F1F5F9'};
  return <span style={{ fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:4,color:c[tag]||c.gray,background:b[tag]||b.gray,whiteSpace:'nowrap' }}>{label}</span>;
};

const EvoLinePR = ({ v0, vN, unit='', dec=1, lowerIsBetter=false }) => {
  if (v0==null||vN==null||isNaN(v0)||isNaN(vN)) return null;
  const d=vN-v0, isNeutral=Math.abs(d)<0.01;
  const isGood=isNeutral?true:(lowerIsBetter?d<0:d>0);
  const color=isNeutral?'#888':(isGood?'#16a34a':'#dc2626');
  return (
    <div style={{ fontSize:10, color, fontWeight:600, marginBottom:5, display:'flex', alignItems:'center', gap:4 }}>
      <span>{isNeutral?'→':d>0?'↑':'↓'}</span>
      <span>{_nPR(v0,dec)} {unit} → {_nPR(vN,dec)} {unit}</span>
      <span style={{ color:'#bbb', fontWeight:400 }}>({d>0?'+':''}{_nPR(d,dec)} {unit} desde o início)</span>
    </div>
  );
};

const ReportCard = ({ label, value, unit, badge, explain, idealRange, v0, vN, vUnit='', vDec=1, lowerIsBetter=false, textKey, editMode, onTextChange }) => (
  <div style={{ border:'1px solid #e0e0e0',borderRadius:8,padding:'11px 13px',breakInside:'avoid' }}>
    <div style={{ fontSize:9,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4 }}>{label}</div>
    <div style={{ display:'flex',alignItems:'baseline',gap:8,marginBottom:3 }}>
      <span style={{ fontSize:22,fontWeight:800,fontFamily:'monospace',color:'#111',lineHeight:1 }}>{value}</span>
      {unit&&<span style={{ fontSize:11,color:'#888' }}>{unit}</span>}
      {badge&&<BdgPR tag={badge.tag} label={badge.label}/>}
    </div>
    <EvoLinePR v0={v0} vN={vN} unit={vUnit} dec={vDec} lowerIsBetter={lowerIsBetter}/>
    {editMode
      ? <AutoTextarea value={explain} onChange={v => onTextChange(textKey, v)}
          style={taStylePR({ fontSize:10,color:'#333',lineHeight:1.5,marginBottom:idealRange?3:0 })} />
      : <div style={{ fontSize:10,color:'#333',lineHeight:1.5,marginBottom:idealRange?3:0 }}>{explain}</div>
    }
    {idealRange&&<div style={{ fontSize:9.5,color:'#16a34a',fontWeight:600,marginTop:3 }}>✓ Faixa ideal: {idealRange}</div>}
  </div>
);

const ReportSection = ({ title, sub, subKey, editMode, onTextChange }) => (
  <div style={{ borderBottom:'2px solid #111',paddingBottom:3,marginBottom:8,marginTop:16,breakAfter:'avoid' }}>
    <div style={{ fontSize:11,fontWeight:800,color:'#111',textTransform:'uppercase',letterSpacing:'0.08em' }}>{title}</div>
    {sub && (editMode
      ? <AutoTextarea value={sub} onChange={v => onTextChange(subKey, v)}
          style={taStylePR({ fontSize:9.5,color:'#888',marginTop:1 })} />
      : <div style={{ fontSize:9.5,color:'#888',marginTop:1 }}>{sub}</div>
    )}
  </div>
);

// ---- Textarea auto-redimensionável para edição inline no relatório ----
const AutoTextarea = ({ value, onChange, style }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) { ref.current.style.height = 'auto'; ref.current.style.height = ref.current.scrollHeight + 'px'; }
  }, [value]);
  return (
    <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
      style={{ ...style, resize:'none', overflow:'hidden', display:'block' }} />
  );
};

// ---- Textos padrão do relatório (editáveis antes de imprimir) ----
const DEFAULT_REPORT_TEXTS = {
  secComposicaoSub: "Distribuição dos compartimentos corporais: músculo, gordura, osso e água.",
  secCardioSub:     "Indicadores relacionados à distribuição regional da gordura corporal.",
  peso:      "Massa corporal total, que engloba músculo, gordura, osso, órgãos e água. A balança registra a soma desses compartimentos sem discriminar cada um.",
  imc:       "Índice que relaciona peso e altura. É um instrumento de triagem populacional, utilizado em conjunto com outras medidas porque não distingue gordura de músculo.",
  pctG:      "Proporção do peso corporal formada por tecido adiposo. Inclui a gordura essencial (presente em órgãos e hormônios) e a gordura de reserva (armazenada sob a pele e ao redor dos órgãos).",
  gordKg:    "Quantidade absoluta de gordura em quilogramas, obtida a partir do percentual de gordura e do peso total. Complementa a leitura percentual ao expressar a massa em peso.",
  massaMagra:"Soma de tudo que não é gordura no corpo: músculo, osso, órgãos e água. Também chamada de massa livre de gordura (MLG).",
  musculo:   "Estimativa da massa dos músculos esqueléticos, responsáveis pelo movimento e pela postura. Calculada pela equação de Lee et al. (2000) a partir de circunferências e da estatura.",
  cintura:   "Perímetro medido na região de menor circunferência do tronco, entre a última costela e a crista ilíaca. Reflete o acúmulo de gordura na região abdominal.",
  rcq:       "Razão entre a circunferência da cintura e a do quadril. Indica o padrão de distribuição da gordura corporal, classificado como androide (acúmulo central) ou ginoide (acúmulo periférico).",
  rce:       "Razão entre a circunferência da cintura e a estatura. Um valor abaixo de 0,50 indica que a cintura é menor que metade da altura, o que é considerado adequado para a maioria dos adultos.",
  notas:     "Composição corporal estimada pelo protocolo indicado, com conversão por Siri (1961). Massa muscular esquelética calculada por Lee et al. (2000). IMC classificado conforme OMS (2006). Faixa de peso ideal para IMC entre 18,5 e 24,9 kg/m². Os resultados são estimativas obtidas a partir de medidas externas e não substituem exames laboratoriais nem avaliação clínica individualizada.",
};

// ---- Relatório impresso orientado ao paciente ----
const PrintReport = ({ patient, avs, protoRef, protoLabel, idade, getProtoG, texts = DEFAULT_REPORT_TEXTS, editMode = false, onTextChange = () => {} }) => {
  if (!avs.length) return null;
  const firstAv = avs[0], lastAv = avs[avs.length - 1];
  const r0 = calcularTudo(firstAv.peso, firstAv.altura, patient.sexo, idade, firstAv.dobras, firstAv.circs);
  const rN = calcularTudo(lastAv.peso, lastAv.altura, patient.sexo, idade, lastAv.dobras, lastAv.circs);
  const g0 = getProtoG(firstAv), gN = getProtoG(lastAv);
  const n = (v, d=1) => v != null && !isNaN(v) ? Number(v).toFixed(d).replace('.',',') : '—';
  const fp = rN.faixaPesoIdeal;

  // ── Bandas de classificação ───────────────────────────────────────
  const IMC_BANDS = [
    { min:0, max:18.5, color:'#3b82f6', label:'Baixo peso' },
    { min:18.5, max:25, color:'#22c55e', label:'Eutrofia' },
    { min:25, max:30, color:'#eab308', label:'Sobrepeso' },
    { min:30, max:35, color:'#f97316', label:'Obesidade I' },
    { min:35, max:99, color:'#ef4444', label:'Obesidade II/III' },
  ];
  const PCTG_F = [
    { min:0, max:14, color:'#3b82f6', label:'Muito baixo' },
    { min:14, max:21, color:'#22c55e', label:'Atleta' },
    { min:21, max:25, color:'#86efac', label:'Boa forma' },
    { min:25, max:32, color:'#eab308', label:'Aceitável' },
    { min:32, max:99, color:'#ef4444', label:'Obesidade' },
  ];
  const PCTG_M = [
    { min:0, max:6,  color:'#3b82f6', label:'Muito baixo' },
    { min:6, max:14, color:'#22c55e', label:'Atleta' },
    { min:14, max:18, color:'#86efac', label:'Boa forma' },
    { min:18, max:25, color:'#eab308', label:'Aceitável' },
    { min:25, max:99, color:'#ef4444', label:'Obesidade' },
  ];
  const RCQ_F = [
    { min:0, max:0.80, color:'#22c55e', label:'Baixo risco' },
    { min:0.80, max:0.85, color:'#eab308', label:'Risco moderado' },
    { min:0.85, max:9, color:'#ef4444', label:'Risco alto' },
  ];
  const RCQ_M = [
    { min:0, max:0.90, color:'#22c55e', label:'Baixo risco' },
    { min:0.90, max:1.00, color:'#eab308', label:'Risco moderado' },
    { min:1.00, max:9, color:'#ef4444', label:'Risco alto' },
  ];
  const RCE_BANDS = [
    { min:0, max:0.40, color:'#3b82f6', label:'Magreza' },
    { min:0.40, max:0.50, color:'#22c55e', label:'Adequado' },
    { min:0.50, max:0.60, color:'#eab308', label:'Atenção' },
    { min:0.60, max:9, color:'#ef4444', label:'Risco' },
  ];
  const pctgBands = patient.sexo === 'F' ? PCTG_F : PCTG_M;
  const rcqBands  = patient.sexo === 'F' ? RCQ_F  : RCQ_M;

  const getBandColor = (val, bands, fallback='#888') => {
    if (bands == null || val == null) return fallback;
    const b = bands.find(b => val >= b.min && val < b.max);
    return b ? b.color : fallback;
  };

  // ── Série de dados para gráficos ─────────────────────────────────
  const chartSeries = (fn, dec=1) =>
    avs.map(av => ({ label: av.data.slice(8)+'/'+av.data.slice(5,7), value: fn(av), dec }))
       .filter(d => d.value != null && !isNaN(d.value));

  // ── Mini gráfico SVG inline ──────────────────────────────────────
  const MiniChart = ({ unit, data, bands, fallbackColor='#2563eb' }) => {
    if (!data || data.length < 2) return (
      <div style={{ border:'1px solid #e8e8e8', borderRadius:8, padding:'10px 12px', background:'#fafafa' }}>
        <div style={{ fontSize:9.5, color:'#aaa' }}>Mínimo 2 avaliações</div>
      </div>
    );
    const W=280, H=110, pad={t:20,r:8,b:22,l:36};
    const vals = data.map(d=>d.value);
    const bMin = bands ? Math.min(...bands.map(b=>b.min)) : Math.min(...vals);
    const bMax = bands ? Math.max(...bands.filter(b=>b.max<9).map(b=>b.max)) : Math.max(...vals);
    const allMin = Math.min(...vals, bMin), allMax = Math.max(...vals, bMax);
    const range = allMax - allMin || 1;
    const xS = i => pad.l + (i/(data.length-1))*(W-pad.l-pad.r);
    const yS = v => H-pad.b-((v-allMin)/range)*(H-pad.t-pad.b);
    const pts = data.map((d,i)=>[xS(i),yS(d.value)]);
    const poly = pts.map(p=>p.join(',')).join(' ');
    const gid = 'pr'+Math.random().toString(36).slice(2,7);
    const lineColor = pts.length ? getBandColor(data[data.length-1].value, bands, fallbackColor) : fallbackColor;
    return (
      <div style={{ border:'1px solid #e8e8e8', borderRadius:8, padding:'8px 12px' }}>
        <div style={{ fontSize:9, color:'#aaa', marginBottom:4 }}>{unit}</div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:H, overflow:'visible' }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.12"/>
              <stop offset="100%" stopColor={lineColor} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Bandas */}
          {bands && bands.filter(b=>b.max<9).map((band,i)=>{
            const y1=yS(Math.min(band.max,allMax)), y2=yS(Math.max(band.min,allMin));
            if(y2<=pad.t) return null;
            return (
              <g key={i}>
                <rect x={pad.l} y={Math.max(y1,pad.t)} width={W-pad.l-pad.r} height={Math.min(y2,H-pad.b)-Math.max(y1,pad.t)} fill={band.color} opacity="0.10"/>
                <text x={W-pad.r-1} y={Math.max(y1,pad.t)+8} textAnchor="end" fontSize="6.5" fill={band.color} opacity="0.9" fontFamily="'DM Sans',sans-serif" fontWeight="600">{band.label}</text>
              </g>
            );
          })}
          {/* Grid */}
          {[0,1,2].map(i=>{
            const v=allMin+(range/2)*i;
            return (
              <g key={i}>
                <line x1={pad.l} y1={yS(v)} x2={W-pad.r} y2={yS(v)} stroke="#e0e0e0" strokeWidth={1}/>
                <text x={pad.l-3} y={yS(v)+3} textAnchor="end" fontSize={8} fill="#aaa" fontFamily="monospace">{n(v,data[0].dec??1)}</text>
              </g>
            );
          })}
          {/* Área */}
          <path d={[`M ${pts[0][0]},${H-pad.b}`,...pts.map(p=>`L ${p[0]},${p[1]}`),`L ${pts[pts.length-1][0]},${H-pad.b}`,'Z'].join(' ')} fill={`url(#${gid})`}/>
          {/* Linha */}
          <polyline points={poly} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity="0.4"/>
          {/* Pontos coloridos por faixa */}
          {pts.map((p,i)=>{
            const ptColor = getBandColor(data[i].value, bands, fallbackColor);
            return (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r={4} fill={ptColor} stroke="#fff" strokeWidth={1.5}/>
                <text x={p[0]} y={p[1]-8} textAnchor="middle" fontSize={9} fontWeight="700" fill={ptColor} fontFamily="monospace">{n(data[i].value,data[i].dec??1)}</text>
              </g>
            );
          })}
          {/* Datas */}
          {data.map((d,i)=>(
            <text key={i} x={xS(i)} y={H-4} textAnchor="middle" fontSize={8} fill="#aaa" fontFamily="'DM Sans',sans-serif">{d.label}</text>
          ))}
        </svg>
        {/* Legenda da faixa atual */}
        {bands && data.length > 0 && (() => {
          const cur = data[data.length-1].value;
          const b = bands.find(b=>cur>=b.min&&cur<b.max);
          if(!b) return null;
          return <div style={{ fontSize:9, color:b.color, fontWeight:700, marginTop:3 }}>▶ Atual: {b.label}</div>;
        })()}
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",color:'#111' }}>

      {/* ── Cabeçalho ── */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,paddingBottom:8,borderBottom:'2px solid #111' }}>
        <div>
          <div style={{ fontSize:21,fontWeight:800,letterSpacing:'-0.03em',lineHeight:1.1 }}>Relatório de Evolução Antropométrica</div>
          <div style={{ fontSize:11.5,color:'#555',marginTop:3 }}>Avaliação Antropométrica feita por Vinicius Zapola</div>
        </div>
        <div style={{ textAlign:'right',fontSize:10.5,color:'#555',flexShrink:0 }}>
          Emitido em {new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}
        </div>
      </div>

      {/* ── Tarja paciente ── */}
      <div style={{ background:'#1a1a1a',borderRadius:8,padding:'12px 18px',marginBottom:10 }}>
        <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',gap:'3px 14px' }}>
          {[
            { l:'Paciente', v:patient.nome, big:true },
            { l:'Sexo · Idade', v:`${patient.sexo==='F'?'Feminino':'Masculino'} · ${idade} anos` },
            { l:'Objetivo', v:patient.objetivo },
            { l:'Período', v:`${_fmtData(firstAv.data)} → ${_fmtData(lastAv.data)}` },
            { l:'Avaliações', v:`${avs.length}` },
          ].map(x=>(
            <div key={x.l}>
              <div style={{ fontSize:8.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:1 }}>{x.l}</div>
              <div style={{ fontSize:x.big?13:11.5,fontWeight:700,color:'#fff',lineHeight:1.2 }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Barra de resumo ── */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:5,padding:'9px 12px',background:'#f8f8f8',borderRadius:8,border:'1px solid #e8e8e8',marginBottom:4 }}>
        {[
          { l:'Peso inicial', v:n(firstAv.peso), u:'kg' },
          { l:'Peso atual', v:n(lastAv.peso), u:'kg' },
          { l:'Gordura inicial', v:n(g0), u:'%' },
          { l:'Gordura atual', v:n(gN), u:'%' },
          { l:'Massa Magra atual', v:gN!=null?n(lastAv.peso*(1-gN/100)):'—', u:'kg' },
          { l:'Músculo atual', v:n(rN.mm), u:'kg' },
        ].map(x=>(
          <div key={x.l} style={{ textAlign:'center' }}>
            <div style={{ fontSize:8,color:'#888',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:1 }}>{x.l}</div>
            <div style={{ fontSize:15,fontWeight:800,fontFamily:'monospace' }}>{x.v}</div>
            <div style={{ fontSize:9,color:'#888' }}>{x.u}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          COMPOSIÇÃO CORPORAL
      ══════════════════════════════════════════════════════════════ */}
      <ReportSection title="Composição Corporal" sub={texts.secComposicaoSub} subKey="secComposicaoSub" editMode={editMode} onTextChange={onTextChange} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>

          {/* Peso + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Peso Corporal" value={n(lastAv.peso)} unit="kg"
              explain={texts.peso} textKey="peso" editMode={editMode} onTextChange={onTextChange}
              idealRange={fp?`${n(fp[0])}–${n(fp[1])} kg para sua altura`:null}
              v0={firstAv.peso} vN={lastAv.peso} vUnit="kg" lowerIsBetter={true}/>
            <MiniChart unit="kg" data={chartSeries(av=>av.peso)} fallbackColor="#2563eb"/>
          </div>

          {/* IMC + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Índice de Massa Corporal (IMC)" value={n(rN.imc)} unit="kg/m²" badge={rN.classIMC}
              explain={texts.imc} textKey="imc" editMode={editMode} onTextChange={onTextChange}
              idealRange="18,5 – 24,9 kg/m²"
              v0={r0.imc} vN={rN.imc} lowerIsBetter={true}/>
            <MiniChart unit="kg/m²" data={chartSeries(av=>calcIMC(av.peso,av.altura))} bands={IMC_BANDS} fallbackColor="#16a34a"/>
          </div>

          {/* % Gordura + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Percentual de Gordura" value={gN!=null?n(gN):'—'} unit="%" badge={gN!=null?classPctG(gN,patient.sexo):null}
              explain={texts.pctG} textKey="pctG" editMode={editMode} onTextChange={onTextChange}
              idealRange={patient.sexo==='F'?'21–25% (boa forma)':'14–18% (boa forma)'}
              v0={g0} vN={gN} vUnit="%" lowerIsBetter={true}/>
            <MiniChart unit="%" data={chartSeries(av=>getProtoG(av))} bands={pctgBands} fallbackColor="#dc2626"/>
          </div>

          {/* Gordura kg + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Gordura em Quilos" value={gN!=null?n(lastAv.peso*gN/100):'—'} unit="kg"
              explain={texts.gordKg} textKey="gordKg" editMode={editMode} onTextChange={onTextChange}
              v0={g0!=null?firstAv.peso*g0/100:null} vN={gN!=null?lastAv.peso*gN/100:null} vUnit="kg" lowerIsBetter={true}/>
            <MiniChart unit="kg" data={chartSeries(av=>{const g=getProtoG(av);return g!=null?av.peso*g/100:null;})} fallbackColor="#dc2626"/>
          </div>

          {/* Massa Magra + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Massa Magra" value={gN!=null?n(lastAv.peso*(1-gN/100)):'—'} unit="kg"
              explain={texts.massaMagra} textKey="massaMagra" editMode={editMode} onTextChange={onTextChange}
              v0={g0!=null?firstAv.peso*(1-g0/100):null} vN={gN!=null?lastAv.peso*(1-gN/100):null} vUnit="kg" lowerIsBetter={false}/>
            <MiniChart unit="kg" data={chartSeries(av=>{const g=getProtoG(av);return g!=null?av.peso*(1-g/100):null;})} fallbackColor="#9333ea"/>
          </div>

          {/* Músculo + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Músculo Esquelético" value={n(rN.mm)} unit="kg"
              explain={texts.musculo} textKey="musculo" editMode={editMode} onTextChange={onTextChange}
              v0={r0.mm} vN={rN.mm} vUnit="kg" lowerIsBetter={false}/>
            <MiniChart unit="kg" data={chartSeries(av=>calcularTudo(av.peso,av.altura,patient.sexo,idade,av.dobras,av.circs).mm)} fallbackColor="#0891b2"/>
          </div>

        </div>

      {/* ══════════════════════════════════════════════════════════════
          SAÚDE CARDIOVASCULAR
      ══════════════════════════════════════════════════════════════ */}
      <div style={{ breakInside:'avoid' }}>
        <ReportSection title="Saúde Cardiovascular" sub={texts.secCardioSub} subKey="secCardioSub" editMode={editMode} onTextChange={onTextChange} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>

          {/* Cintura + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Circunferência da Cintura" value={n(lastAv.circs?.cintura,0)} unit="cm"
              explain={texts.cintura} textKey="cintura" editMode={editMode} onTextChange={onTextChange}
              idealRange={patient.sexo==='F'?'Menos de 80 cm':'Menos de 94 cm'}
              v0={firstAv.circs?.cintura} vN={lastAv.circs?.cintura} vUnit="cm" vDec={0} lowerIsBetter={true}/>
            <MiniChart unit="cm" data={chartSeries(av=>av.circs?.cintura,0)} fallbackColor="#d97706"/>
          </div>

          {/* RCQ + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Distribuição de Gordura no Corpo (RCQ)" value={n(rN.rcq,2)} unit="" badge={classRCQ(rN.rcq,patient.sexo)}
              explain={texts.rcq} textKey="rcq" editMode={editMode} onTextChange={onTextChange}
              idealRange={patient.sexo==='F'?'Abaixo de 0,80':'Abaixo de 0,90'}
              v0={r0.rcq} vN={rN.rcq} vUnit="" vDec={2} lowerIsBetter={true}/>
            <MiniChart unit="" data={chartSeries(av=>calcularTudo(av.peso,av.altura,patient.sexo,idade,av.dobras,av.circs).rcq,2)} bands={rcqBands} fallbackColor="#be123c"/>
          </div>

          {/* RCE + gráfico */}
          <div style={{ breakInside:'avoid', display:'flex', flexDirection:'column', gap:6 }}>
            <ReportCard label="Gordura Abdominal vs. Altura (RCE)" value={n(rN.rce,2)} unit="" badge={classRCE(rN.rce)}
              explain={texts.rce} textKey="rce" editMode={editMode} onTextChange={onTextChange}
              idealRange="Abaixo de 0,50"
              v0={r0.rce} vN={rN.rce} vUnit="" vDec={2} lowerIsBetter={true}/>
            <MiniChart unit="" data={chartSeries(av=>calcularTudo(av.peso,av.altura,patient.sexo,idade,av.dobras,av.circs).rce,2)} bands={RCE_BANDS} fallbackColor="#0369a1"/>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HISTÓRICO DE AVALIAÇÕES
      ══════════════════════════════════════════════════════════════ */}
      <div style={{ breakInside:'avoid' }}>
        <ReportSection title="Histórico de Avaliações" sub={`Protocolo de composição corporal: ${protoLabel}`}/>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:10 }}>
          <thead>
            <tr style={{ background:'#f4f4f4' }}>
              {['Data','Peso','IMC','Gordura %','Gordura kg','Massa Magra','Músculo','Cintura'].map(h=>(
                <th key={h} style={{ padding:'5px 7px',textAlign:'left',fontWeight:700,color:'#555',fontSize:8.5,textTransform:'uppercase',letterSpacing:'0.05em',borderBottom:'1px solid #ddd' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {avs.slice().reverse().map((av,idx)=>{
              const r=calcularTudo(av.peso,av.altura,patient.sexo,idade,av.dobras,av.circs);
              const g=getProtoG(av);
              const mg=g!=null?av.peso*g/100:null, mlg=g!=null?av.peso*(1-g/100):null;
              return (
                <tr key={av.id} style={{ borderBottom:'1px solid #eee',background:idx===0?'#f0fdf4':'transparent' }}>
                  <td style={{ padding:'5px 7px',fontWeight:idx===0?700:400 }}>
                    {_fmtData(av.data)}{idx===0&&<span style={{ fontSize:7.5,color:'#16a34a',marginLeft:4,fontWeight:700,textTransform:'uppercase' }}>atual</span>}
                  </td>
                  <td style={{ padding:'5px 7px',fontFamily:'monospace' }}>{n(av.peso)} kg</td>
                  <td style={{ padding:'5px 7px',fontFamily:'monospace' }}>{n(r.imc)}</td>
                  <td style={{ padding:'5px 7px',fontFamily:'monospace' }}>{g!=null?n(g)+'%':'—'}</td>
                  <td style={{ padding:'5px 7px',fontFamily:'monospace' }}>{mg!=null?n(mg)+' kg':'—'}</td>
                  <td style={{ padding:'5px 7px',fontFamily:'monospace' }}>{mlg!=null?n(mlg)+' kg':'—'}</td>
                  <td style={{ padding:'5px 7px',fontFamily:'monospace' }}>{n(r.mm)} kg</td>
                  <td style={{ padding:'5px 7px',fontFamily:'monospace' }}>{av.circs?.cintura?n(av.circs.cintura,0)+' cm':'—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Notas metodológicas ── */}
      <div style={{ marginTop:14,padding:'9px 13px',background:'#fafafa',borderRadius:6,border:'1px solid #eee' }}>
        <div style={{ fontSize:8.5,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4 }}>Notas Metodológicas</div>
        {editMode
          ? <AutoTextarea value={texts.notas} onChange={v => onTextChange('notas', v)}
              style={{ fontSize:9, color:'#666', lineHeight:1.7, border:'none', borderBottom:'1.5px dashed #ccc', background:'transparent', fontFamily:"'DM Sans',sans-serif", padding:0, outline:'none', width:'100%', boxSizing:'border-box' }} />
          : <div style={{ fontSize:9,color:'#666',lineHeight:1.7 }}>{texts.notas}</div>
        }
      </div>
    </div>
  );
};

// ---- Modal de pré-visualização e edição do relatório ----
const PrintPreviewModal = ({ patient, avs, protoRef, protoLabel, idade, getProtoG, texts, onTextsChange, onClose, onPrint }) => {
  const [draft, setDraft] = React.useState({ ...texts });
  const updateText = (key, val) => setDraft(p => ({ ...p, [key]: val }));

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handlePrint = () => {
    onTextsChange(draft);
    onPrint();
  };

  return (
    <div className="no-print" style={{ position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:9000, background:'#e4e4e4', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Toolbar */}
      <div style={{ flexShrink:0, height:52, background:'#1a1a1a', display:'flex', alignItems:'center', padding:'0 20px', gap:12 }}>
        <div style={{ flex:1, fontSize:13, fontWeight:700, color:'#fff', letterSpacing:'-0.01em' }}>
          Pré-visualização · {patient.nome}
        </div>
        <span style={{ fontSize:11, color:'#9CA3AF' }}>Clique nos textos sublinhados para editar</span>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', color:'#fff', fontFamily:'inherit' }}>
          Fechar
        </button>
        <button onClick={handlePrint} style={{ background:'#2563eb', border:'none', borderRadius:6, padding:'6px 18px', fontSize:13, fontWeight:600, cursor:'pointer', color:'#fff', fontFamily:'inherit' }}>
          🖨 Imprimir
        </button>
      </div>
      {/* Conteúdo scrollável */}
      <div style={{ flex:1, overflow:'auto', padding:'28px 24px', display:'flex', justifyContent:'center' }}>
        <div style={{ background:'#fff', width:794, padding:'32px 40px', boxShadow:'0 2px 24px rgba(0,0,0,0.14)', fontFamily:"'DM Sans',sans-serif" }}>
          <PrintReport
            patient={patient} avs={avs} protoRef={protoRef} protoLabel={protoLabel}
            idade={idade} getProtoG={getProtoG}
            texts={draft} editMode={true} onTextChange={updateText}
          />
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Histórico ----
const HistoricoTab = ({ patient, avaliacoes, protoRef }) => {
  const avs = avaliacoes.filter(a => a.paciente_id === patient.id).sort((a,b) => a.data.localeCompare(b.data));
  const idade = calcIdade(patient.nascimento);

  const getProtoG = (av) => {
    const r = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
    switch(protoRef) {
      case "Petroski": return r.petsiri;
      case "Guedes":   return r.gueddsiri;
      case "Faulkner": return r.faulk;
      case "Durnin":   return r.dwsiri;
      case "Carter":   return r.carterSiri;
      default:         return r.jp3siri;
    }
  };

  const protoLabel = PROTO_LABELS[protoRef] || "JP3 · J&P (1978/80)";
  const COLS = ["#2563eb","#16a34a","#dc2626","#9333ea","#0891b2","#d97706","#be123c","#0369a1"];

  const series = (fn, dec) => avs.map(av => ({
    label: av.data.slice(8) + "/" + av.data.slice(5,7),
    value: fn(av), dec
  })).filter(d => d.value != null && !isNaN(d.value));

  const IMC_BANDS = [
    { min: 0,    max: 18.5, color: "#3b82f6", label: "Baixo peso" },
    { min: 18.5, max: 25,   color: "#22c55e", label: "Eutrofia" },
    { min: 25,   max: 30,   color: "#eab308", label: "Sobrepeso" },
    { min: 30,   max: 35,   color: "#f97316", label: "Obesidade I" },
    { min: 35,   max: 50,   color: "#ef4444", label: "Obesidade II/III" },
  ];
  const PCTG_BANDS_F = [
    { min: 0,  max: 14, color: "#3b82f6", label: "Muito baixo" },
    { min: 14, max: 21, color: "#22c55e", label: "Atleta" },
    { min: 21, max: 25, color: "#86efac", label: "Boa forma" },
    { min: 25, max: 32, color: "#eab308", label: "Aceitável" },
    { min: 32, max: 50, color: "#ef4444", label: "Obesidade" },
  ];
  const PCTG_BANDS_M = [
    { min: 0,  max: 6,  color: "#3b82f6", label: "Muito baixo" },
    { min: 6,  max: 14, color: "#22c55e", label: "Atleta" },
    { min: 14, max: 18, color: "#86efac", label: "Boa forma" },
    { min: 18, max: 25, color: "#eab308", label: "Aceitável" },
    { min: 25, max: 50, color: "#ef4444", label: "Obesidade" },
  ];
  const RCQ_BANDS_F = [
    { min: 0,    max: 0.80, color: "#22c55e", label: "Baixo risco" },
    { min: 0.80, max: 0.85, color: "#eab308", label: "Risco moderado" },
    { min: 0.85, max: 1.5,  color: "#ef4444", label: "Risco alto" },
  ];
  const RCQ_BANDS_M = [
    { min: 0,    max: 0.90, color: "#22c55e", label: "Baixo risco" },
    { min: 0.90, max: 1.00, color: "#eab308", label: "Risco moderado" },
    { min: 1.00, max: 1.5,  color: "#ef4444", label: "Risco alto" },
  ];
  const RCE_BANDS = [
    { min: 0,    max: 0.40, color: "#3b82f6", label: "Magreza" },
    { min: 0.40, max: 0.50, color: "#22c55e", label: "Adequado" },
    { min: 0.50, max: 0.60, color: "#eab308", label: "Sobrepeso" },
    { min: 0.60, max: 1.0,  color: "#ef4444", label: "Obesidade" },
  ];

  // Legenda de classificação
  const BandLegend = ({ bands, currentVal }) => {
    if (!bands || !currentVal) return null;
    const active = bands.find(b => currentVal >= b.min && currentVal < b.max);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", marginTop: 8 }}>
        {bands.filter(b => b.max < 999).map((b, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 10, color: active === b ? b.color : "var(--muted)",
            fontWeight: active === b ? 700 : 400,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color, opacity: active === b ? 1 : 0.35, flexShrink: 0, display: "inline-block" }} />
            {b.label}{active === b ? " ←" : ""}
          </div>
        ))}
      </div>
    );
  };

  const charts = [
    { title: "Peso corporal", unit: "kg", dec: 1, height: 140, data: series(av => av.peso, 1), color: COLS[0], bands: null },
    { title: "IMC", unit: "kg/m²", dec: 1, height: 180, data: series(av => calcIMC(av.peso, av.altura), 1), color: COLS[1], bands: IMC_BANDS },
    { title: `% Gordura · ${protoLabel}`, unit: "%", dec: 1, height: 190, data: series(av => getProtoG(av), 1), color: COLS[2], bands: patient.sexo === "F" ? PCTG_BANDS_F : PCTG_BANDS_M },
    { title: "Massa Gorda", unit: "kg", dec: 1, height: 140, data: series(av => { const g = getProtoG(av); return g != null ? av.peso * g / 100 : null; }, 1), color: COLS[2], bands: null },
    { title: "Massa Livre de Gordura", unit: "kg", dec: 1, height: 140, data: series(av => { const g = getProtoG(av); return g != null ? av.peso * (1 - g / 100) : null; }, 1), color: COLS[3], bands: null },
    { title: "Massa Muscular · Lee 2000", unit: "kg", dec: 1, height: 140, data: series(av => calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs).mm, 1), color: COLS[4], bands: null },
    { title: "Cintura", unit: "cm", dec: 0, height: 140, data: series(av => av.circs?.cintura, 0), color: COLS[5], bands: null },
    { title: "RCQ", unit: "", dec: 2, height: 180, data: series(av => calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs).rcq, 2), color: COLS[6], bands: patient.sexo === "F" ? RCQ_BANDS_F : RCQ_BANDS_M },
    { title: "RCE", unit: "", dec: 2, height: 180, data: series(av => calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs).rce, 2), color: COLS[7], bands: RCE_BANDS },
  ];

  // Retorna a cor da faixa em que o valor cai
  const getBandColor = (value, bands, defaultColor) => {
    if (!bands || value == null) return defaultColor;
    const band = bands.find(b => value >= b.min && value < b.max);
    return band ? band.color : defaultColor;
  };

  const ChartWithBands = ({ data, color, bands, height = 140 }) => {
    if (!data || data.length < 2) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>2+ avaliações necessárias</div>;
    const W = 420, H = height, pad = { t: 20, r: 12, b: 28, l: 44 };
    const vals = data.map(d => d.value);
    const bMin = bands ? Math.min(...bands.map(b => b.min)) : Math.min(...vals);
    const bMax = bands ? Math.max(...bands.filter(b=>b.max<999).map(b => b.max)) : Math.max(...vals);
    const allMin = Math.min(...vals, bMin);
    const allMax = Math.max(...vals, bMax);
    const range = allMax - allMin || 1;
    const xS = i => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
    const yS = v => H - pad.b - ((v - allMin) / range) * (H - pad.t - pad.b);
    const pts = data.map((d, i) => [xS(i), yS(d.value)]);
    const poly = pts.map(p => p.join(",")).join(" ");
    const area = [`M ${pts[0][0]},${H-pad.b}`, ...pts.map(p=>`L ${p[0]},${p[1]}`), `L ${pts[pts.length-1][0]},${H-pad.b}`, "Z"].join(" ");
    const gid = "gb" + color.replace(/[^a-z0-9]/gi,"") + Math.random().toString(36).slice(2,5);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, overflow: "visible" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {bands && bands.filter(b=>b.max<999).map((band, i) => {
          const y1 = yS(Math.min(band.max, allMax));
          const y2 = yS(Math.max(band.min, allMin));
          if (y2 <= pad.t) return null;
          return (
            <g key={i}>
              <rect x={pad.l} y={Math.max(y1, pad.t)} width={W - pad.l - pad.r} height={Math.min(y2, H-pad.b) - Math.max(y1, pad.t)} fill={band.color} opacity="0.10" />
              <text x={W-pad.r-2} y={Math.max(y1, pad.t) + 9} textAnchor="end" fontSize="7.5" fill={band.color} opacity="0.85" fontFamily="'DM Sans',sans-serif" fontWeight="600">{band.label}</text>
            </g>
          );
        })}
        {[0,1,2,3].map(i => { const v = allMin + (range/3)*i; return (
          <g key={i}>
            <line x1={pad.l} y1={yS(v)} x2={W-pad.r} y2={yS(v)} stroke="var(--border)" strokeWidth={1} />
            <text x={pad.l-6} y={yS(v)+4} textAnchor="end" fontSize={9.5} fill="var(--muted)" fontFamily="'JetBrains Mono',monospace">{fmtN(v, data[0].dec ?? 1)}</text>
          </g>
        ); })}
        <path d={area} fill={`url(#${gid})`} />
        <polyline points={poly} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="none" opacity="0.35" />
        {pts.map((p, i) => {
          const ptColor = getBandColor(data[i].value, bands, color);
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={5.5} fill={ptColor} stroke="var(--surface)" strokeWidth={2} />
              <text x={p[0]} y={p[1]-11} textAnchor="middle" fontSize={10} fontWeight="700" fill={ptColor} fontFamily="'JetBrains Mono',monospace">{fmtN(data[i].value, data[i].dec ?? 1)}</text>
            </g>
          );
        })}
        {data.map((d, i) => (
          <text key={i} x={xS(i)} y={H-6} textAnchor="middle" fontSize={9.5} fill="var(--muted)" fontFamily="'DM Sans',sans-serif">{d.label}</text>
        ))}
      </svg>
    );
  };

  const [reportTexts, setReportTexts] = React.useState(DEFAULT_REPORT_TEXTS);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const [aiSummary, setAiSummary] = React.useState(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiCollapsed, setAiCollapsed] = React.useState(false);
  const [showPromptPanel, setShowPromptPanel] = React.useState(false);
  const [promptText, setPromptText] = React.useState("");
  const [promptCopied, setPromptCopied] = React.useState(false);

  const buildPrompt = () => {
    const n = (v, d=1) => v != null && !isNaN(v) ? Number(v).toFixed(d).replace('.',',') : '—';
    const dobrasKeys = ["tricipital","biceps","subescapular","peitoral","axilar","suprailíaca","supraespinal","abdominal","coxa","panturrilha"];
    const circsKeys  = ["torax","cintura","abdomen","quadril","braco","braco_contraido","coxa","panturrilha"];

    // Cabeçalhos das dobras e circunferências presentes em pelo menos uma avaliação
    const dobrasCols = dobrasKeys.filter(k => avs.some(av => av.dobras?.[k] != null));
    const circsCols  = circsKeys.filter(k => avs.some(av => av.circs?.[k] != null));

    const labels = { tricipital:"Tricp",biceps:"Bíceps",subescapular:"Subes",peitoral:"Peit",axilar:"Axilar",
      "suprailíaca":"Supraíl",supraespinal:"Supraes",abdominal:"Abdom",coxa:"Coxa",panturrilha:"Pant",
      torax:"Tórax",cintura:"Cintura",abdomen:"Abdômen",quadril:"Quadril",braco:"Braço",braco_contraido:"Braço c.",
    };

    let md = `# Resumo Clínico de Evolução Antropométrica\n\n`;
    md += `**Paciente:** ${patient.nome} | ${patient.sexo === "F" ? "Feminino" : "Masculino"} | ${idade} anos | Objetivo: ${patient.objetivo}  \n`;
    md += `**Período:** ${_fmtData(avs[0].data)} → ${_fmtData(avs[avs.length-1].data)} (${avs.length} avaliações)  \n`;
    md += `**Protocolo %G:** ${protoLabel}\n\n`;

    // Tabela de medidas brutas: peso + dobras
    md += `## Medidas brutas — dobras cutâneas (mm)\n\n`;
    md += `| Data | Peso kg | Alt cm | ${dobrasCols.map(k => labels[k]||k).join(' | ')} |\n`;
    md += `|------|---------|--------|${dobrasCols.map(() => '------').join('|')}|\n`;
    avs.forEach(av => {
      md += `| ${_fmtData(av.data)} | ${n(av.peso)} | ${av.altura} | ${dobrasCols.map(k => n(av.dobras?.[k] ?? null)).join(' | ')} |\n`;
    });

    // Tabela de circunferências
    md += `\n## Medidas brutas — circunferências (cm)\n\n`;
    md += `| Data | ${circsCols.map(k => labels[k]||k).join(' | ')} |\n`;
    md += `|------|${circsCols.map(() => '------').join('|')}|\n`;
    avs.forEach(av => {
      md += `| ${_fmtData(av.data)} | ${circsCols.map(k => n(av.circs?.[k] ?? null)).join(' | ')} |\n`;
    });

    // Tabela de indicadores calculados
    md += `\n## Indicadores calculados\n\n`;
    md += `| Data | IMC | Cl.IMC | %G | Cl.%G | MG kg | MLG kg | MM kg | Würch kg | RCQ | RCE | Cintura cm |\n`;
    md += `|------|-----|--------|----|-------|-------|--------|-------|----------|-----|-----|------------|\n`;
    avs.forEach(av => {
      const r = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
      const g = getProtoG(av);
      const mg = g != null ? av.peso * g / 100 : null;
      const mlg = g != null ? av.peso * (1 - g / 100) : null;
      const clImc = r.classIMC?.label || '—';
      const clG   = g != null ? (classPctG(g, patient.sexo)?.label || '—') : '—';
      md += `| ${_fmtData(av.data)} | ${n(r.imc)} | ${clImc} | ${n(g)} | ${clG} | ${n(mg)} | ${n(mlg)} | ${n(r.mm)} | ${n(r.wurch)} | ${n(r.rcq,1)} | ${n(r.rce,1)} | ${n(av.circs?.cintura,0)} |\n`;
    });

    md += `\n## Instrução\n\n`;
    md += `Você é um sistema de apoio clínico para nutricionistas. Com base nos dados acima, gere um **resumo clínico de evolução antropométrica** em português brasileiro.\n\n`;
    md += `**Formato esperado:**\n`;
    md += `- **Parágrafo 1** (máx 4 linhas): evolução geral objetiva com classificações OMS — peso, composição corporal, razões de risco.\n`;
    md += `- **Parágrafo 2** — bullets (máx 3): pontos de atenção clínica com base nos dados.\n\n`;
    md += `**Restrições:** NÃO prescreva condutas, dietas ou suplementos. Tom clínico e direto. Responda apenas o resumo, sem introdução.\n`;
    return md;
  };

  const abrirNoClaude = () => {
    if (avs.length < 2) return;
    const p = buildPrompt();
    setPromptText(p);
    setShowPromptPanel(true);
    setPromptCopied(false);
  };

  const copiarPrompt = () => {
    navigator.clipboard.writeText(promptText).then(() => {
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 3000);
    }).catch(() => {
      // fallback: selecionar o textarea
      const ta = document.getElementById("antropo-prompt-ta");
      if (ta) { ta.select(); document.execCommand("copy"); setPromptCopied(true); setTimeout(() => setPromptCopied(false), 3000); }
    });
  };

  const colarResumo = (texto) => { setAiSummary(texto.trim()); };

  // Obtém dados da última avaliação para o resumo de estado atual
  const lastAv = avs.length ? avs[avs.length - 1] : null;
  const lastR  = lastAv ? calcularTudo(lastAv.peso, lastAv.altura, patient.sexo, idade, lastAv.dobras, lastAv.circs) : null;
  const lastG  = lastAv ? getProtoG(lastAv) : null;

  return (
    <div style={{ padding: "20px 24px" }}>

      {/* Relatório impresso — orientado ao paciente */}
      <div className="print-only" style={{ display: "none" }}>
        <PrintReport patient={patient} avs={avs} protoRef={protoRef} protoLabel={protoLabel} idade={idade} getProtoG={getProtoG} texts={reportTexts} />
      </div>

      {/* Modal de pré-visualização */}
      {previewOpen && (
        <PrintPreviewModal
          patient={patient} avs={avs} protoRef={protoRef} protoLabel={protoLabel}
          idade={idade} getProtoG={getProtoG}
          texts={reportTexts}
          onTextsChange={setReportTexts}
          onClose={() => setPreviewOpen(false)}
          onPrint={() => { setPreviewOpen(false); setTimeout(() => window.print(), 60); }}
        />
      )}

      {/* Barra de ações — oculta no print */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Btn small onClick={abrirNoClaude} disabled={avs.length < 2} variant="secondary">
            ✦ Gerar resumo com IA
          </Btn>
          {avs.length < 2 && <span style={{ fontSize: 11, color: "var(--muted)" }}>Mínimo 2 avaliações</span>}
          <span style={{ fontSize: 11, color: "var(--muted)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px" }}>%G: {protoLabel}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <Btn small onClick={() => setPreviewOpen(true)}>🖨 Exportar PDF</Btn>
          <span style={{ fontSize: 10, color: "var(--muted)", textAlign: "right", lineHeight: 1.4 }}>
            No Chrome: desmarque<br/>"Cabeçalhos e rodapés"
          </span>
        </div>
      </div>

      {/* Painel do prompt — aparece ao clicar em "Gerar resumo" */}
      {showPromptPanel && (
        <div className="no-print" style={{ marginBottom: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {/* Cabeçalho do painel */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>✦ Prompt pronto</div>
            <button onClick={() => setShowPromptPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
          {/* Instruções */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--accent-light)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
              <strong>1.</strong> Copie o prompt abaixo &nbsp;→&nbsp;
              <strong>2.</strong> <a href="https://claude.ai/new" target="_blank" style={{ color: "var(--accent)", fontWeight: 600 }}>Abra o Claude.ai ↗</a> &nbsp;→&nbsp;
              <strong>3.</strong> Cole e envie &nbsp;→&nbsp;
              <strong>4.</strong> Cole a resposta no campo abaixo
            </div>
            <button onClick={copiarPrompt} style={{
              marginLeft: "auto", padding: "6px 16px", borderRadius: 6,
              background: promptCopied ? "#16a34a" : "var(--accent)",
              color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}>
              {promptCopied ? "✓ Copiado!" : "📋 Copiar prompt"}
            </button>
          </div>
          {/* Prompt text */}
          <textarea
            id="antropo-prompt-ta"
            readOnly
            value={promptText}
            rows={10}
            style={{
              width: "100%", padding: "12px 16px", border: "none", outline: "none",
              background: "var(--bg)", color: "var(--text)",
              fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
              resize: "vertical", boxSizing: "border-box", display: "block",
              lineHeight: 1.6,
            }}
          />
          {/* Campo para colar a resposta */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 8 }}>
              Cole aqui a resposta do Claude.ai para salvar no relatório:
            </div>
            <textarea
              rows={5}
              placeholder="Cole a resposta do Claude.ai aqui..."
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 7,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--text)", fontSize: 13, fontFamily: "inherit",
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
              onPaste={e => {
                setTimeout(() => {
                  const txt = e.target.value.trim();
                  if (txt.length > 30) {
                    colarResumo(txt);
                    setShowPromptPanel(false);
                    setAiCollapsed(false);
                  }
                }, 100);
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-light)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      )}

      {/* Resumo de IA */}
      {(aiLoading || aiSummary) && (
        <div className="ai-summary-card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 20, borderLeft: "3px solid var(--accent)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", cursor: aiSummary ? "pointer" : "default" }}
            onClick={() => aiSummary && setAiCollapsed(c => !c)}>
            <span style={{ fontSize: 13 }}>✦</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Resumo de evolução</span>
            <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>IA · revisão obrigatória</span>
            {aiSummary && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>{aiCollapsed ? "▸" : "▾"}</span>}
          </div>
          {!aiCollapsed && (
            <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--border)" }}>
              {aiLoading ? <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 12 }}>⏳ Analisando evolução...</div> : (
                <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.75, paddingTop: 12 }}>
                  {aiSummary.split("\n").map((line, i) => {
                    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
                    const parts = line.split(/\*\*(.*?)\*\*/g).map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part);
                    if (line.trim().match(/^[-•*] /)) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: "var(--accent)", flexShrink: 0 }}>▸</span><span>{line.trim().replace(/^[-•*] /, "")}</span></div>;
                    if (line.trim().startsWith("## ")) return <div key={i} style={{ fontWeight: 700, fontSize: 14, marginTop: 10, marginBottom: 4 }}>{line.replace(/^##+ /, "")}</div>;
                    return <div key={i} style={{ marginBottom: 6 }}>{parts}</div>;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabela de evolução */}
      <div className="no-print" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Evolução · {protoLabel}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {[
                  { h: "Data", a: "left" },
                  { h: "Peso (kg)", a: "right" },
                  { h: "IMC (kg/m²)", a: "right" },
                  { h: `%G · ${(PROTO_LABELS[protoRef]||"JP3").split("·")[0].trim()} (%)`, a: "right" },
                  { h: "MG (kg)", a: "right" },
                  { h: "MLG (kg)", a: "right" },
                  { h: "Cintura (cm)", a: "right" },
                ].map(c => (
                  <th key={c.h} style={{ padding: "9px 14px", textAlign: c.a, fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{c.h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {avs.slice().reverse().map(av => {
                const r    = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
                const pctG = getProtoG(av);
                const mgV  = pctG != null ? av.peso * pctG / 100 : null;
                const mlgV = pctG != null ? av.peso * (1 - pctG / 100) : null;
                const pctGBadge = pctG != null ? classPctG(pctG, patient.sexo) : null;
                return (
                  <tr key={av.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 14px", fontWeight: 600 }}>{_fmtData(av.data)}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{fmtN(av.peso,1)}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>
                      {fmtN(r.imc,1)} {r.classIMC && <Badge tag={r.classIMC.tag} small>{r.classIMC.label}</Badge>}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>
                      {pctG != null ? fmtN(pctG,1) : "—"} {pctGBadge && <Badge tag={pctGBadge.tag} small>{pctGBadge.label}</Badge>}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{mgV != null ? fmtN(mgV,1) : "—"}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{mlgV != null ? fmtN(mlgV,1) : "—"}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{av.circs?.cintura != null ? fmtN(av.circs.cintura,0) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos — apenas na tela, não no PDF */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {charts.map(ch => ch.data.length > 0 && (
          <div key={ch.title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{ch.title}</div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 8 }}>{ch.unit}</div>
            <ChartWithBands data={ch.data} color={ch.color} bands={ch.bands} height={ch.height || 140} />
            {/* Legenda de classificação */}
            {ch.bands && ch.data.length > 0 && (
              <BandLegend bands={ch.bands} currentVal={ch.data[ch.data.length-1].value} />
            )}
            {ch.data.length >= 2 && (() => {
              const prev = ch.data[ch.data.length - 2];
              const curr = ch.data[ch.data.length - 1];
              const delta = curr.value - prev.value;
              const pct   = (delta / prev.value * 100);
              return (
                <div style={{ marginTop: 10, display: "flex", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  {[{l:"ANTERIOR",v:prev.value,lbl:prev.label},{l:"ATUAL",v:curr.value,lbl:curr.label}].map(x => (
                    <div key={x.l}>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{x.l} <span style={{ fontWeight: 400, opacity: 0.7 }}>({x.lbl})</span></div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14 }}>
                        {fmtN(x.v, ch.data[0].dec ?? 1)}{ch.unit ? <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 2 }}>{ch.unit}</span> : ""}
                      </div>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>VARIAÇÃO</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: delta <= 0 ? "#16a34a" : "#dc2626" }}>
                      {delta > 0 ? "+" : ""}{fmtN(delta, ch.data[0].dec ?? 1)} ({pct > 0 ? "+" : ""}{fmtN(pct,1)}%)
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Rodapé com notas científicas — apenas na tela */}
      <div className="no-print" style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}><sup>¹</sup> Faixa de peso ideal calculada a partir da altura e dos valores limites do IMC de eutrofia (IMC 18,5–24,9 kg/m²).</div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}><sup>²</sup> IMC avaliado conforme classificações da OMS (2006). Para idosos (≥60 anos), aplicada a classificação de Lipschitz (1994).</div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>Massa Magra = Massa Livre de Gordura no modelo bicompartimental utilizado. Massa Residual estimada por Würch (1973).</div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>Protocolo de %G: {protoLabel}. Classificações de adiposidade por Lohman (1992).</div>
      </div>
    </div>
  );
};

// ---- PatientView: container com tabs principais ----
const PatientView = ({ patient, avaliacoes, onSave, onDeleteAv }) => {
  const [activeAv, setActiveAv] = React.useState(null);
  const [isNewAv, setIsNewAv]   = React.useState(false);
  const idade   = calcIdade(patient.nascimento);
  const avCount = avaliacoes.filter(a => a.paciente_id === patient.id).length;

  const [protoRef, setProtoRef] = React.useState(() => {
    try {
      const newKey = `antropo_proto_${patient.id}`;
      const v = localStorage.getItem(newKey);
      if (v) return v;
      // Migração: lê chave antiga, copia pra nova
      const legacy = localStorage.getItem(`zapantro_proto_${patient.id}`);
      if (legacy) { localStorage.setItem(newKey, legacy); return legacy; }
      return "JP3";
    } catch { return "JP3"; }
  });
  const [protoAlert, setProtoAlert] = React.useState(null);

  const handleProtoChange = (novo) => { if (novo !== protoRef) setProtoAlert({ from: protoRef, to: novo }); };
  const confirmProtoChange = () => {
    try { localStorage.setItem(`antropo_proto_${patient.id}`, protoAlert.to); } catch {}
    setProtoRef(protoAlert.to); setProtoAlert(null);
  };

  const MAIN_TABS = [
    { id: "avaliacoes", label: `Avaliações${avCount > 0 ? ` (${avCount})` : ""}` },
    { id: "historico",  label: "Histórico" },
  ];
  const [mainTab, setMainTab] = React.useState("avaliacoes");

  const openNewAv = () => { setActiveAv(null); setIsNewAv(true); setMainTab("form"); };
  const openAv    = (av) => { setActiveAv(av);  setIsNewAv(false); setMainTab("form"); };
  const editAv    = (av) => { setActiveAv(av);  setIsNewAv(true);  setMainTab("form"); };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header do paciente */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "16px 24px", flexShrink: 0 }} className="no-print">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar nome={patient.nome} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{patient.nome}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
              {patient.sexo === "F" ? "Feminino" : "Masculino"} · {idade} anos · {patient.objetivo}
            </div>
          </div>
          <Btn small onClick={openNewAv}>+ Nova avaliação</Btn>
        </div>
        <div style={{ display: "flex", marginTop: 14, gap: 0 }}>
          {MAIN_TABS.map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)} style={{
              padding: "8px 18px", border: "none", background: "transparent",
              color: mainTab === t.id ? "var(--accent)" : "var(--muted)",
              fontSize: 13.5, fontWeight: mainTab === t.id ? 700 : 400,
              borderBottom: mainTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer", fontFamily: "inherit",
            }}>{t.label}</button>
          ))}
          {(activeAv || isNewAv) && (
            <button onClick={() => setMainTab("form")} style={{
              padding: "8px 18px", border: "none", background: "transparent",
              color: mainTab === "form" ? "var(--accent)" : "var(--muted)",
              fontSize: 13.5, fontWeight: mainTab === "form" ? 700 : 400,
              borderBottom: mainTab === "form" ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer", fontFamily: "inherit",
            }}>{isNewAv ? "Nova avaliação" : `Avaliação ${_fmtData(activeAv?.data)}`}</button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {mainTab === "avaliacoes" && (
          <AvaliacoesTab patient={patient} avaliacoes={avaliacoes}
            onOpenAv={openAv} onEditAv={editAv} onDeleteAv={onDeleteAv} onNewAv={openNewAv}
            protoRef={protoRef} />
        )}
        {mainTab === "historico" && (
          <HistoricoTab patient={patient} avaliacoes={avaliacoes} protoRef={protoRef} />
        )}
        {mainTab === "form" && (() => {
          window._patientAvaliacoes = avaliacoes;
          return (
            <AvaliacaoFormTab
              patient={patient} avaliacao={activeAv} isNew={isNewAv}
              protoRef={protoRef} onProtoChange={handleProtoChange}
              onSave={(form) => { onSave(form); setIsNewAv(false); setMainTab("avaliacoes"); }}
            />
          );
        })()}
      </div>

      {/* Modal troca de protocolo */}
      {protoAlert && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.40)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 32px", maxWidth: 440, width: "92%", boxShadow: "0 16px 48px rgba(0,0,0,0.22)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>⚠️ Alterar protocolo de referência</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 22 }}>
              O gráfico de <strong>% de gordura</strong> no Histórico passará a usar:
              <div style={{ margin: "10px 0", padding: "10px 14px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>DE</div>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{PROTO_LABELS[protoAlert.from]}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", margin: "8px 0 4px" }}>PARA</div>
                <div style={{ fontWeight: 700, color: "var(--accent)" }}>{PROTO_LABELS[protoAlert.to]}</div>
              </div>
              Isso pode alterar a aparência da curva evolutiva. As medidas brutas permanecem inalteradas.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setProtoAlert(null)}>Cancelar</Btn>
              <Btn onClick={confirmProtoChange}>Confirmar alteração</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { PatientPanel, PatientView });
