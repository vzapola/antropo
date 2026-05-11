// ============================================================
// PatientView.jsx â€” Painel direito: detalhe + tabs contextuais
// ============================================================

// Helper: retorna %G do protocolo escolhido para uma avaliaÃ§Ã£o
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

// ---- Tab: Lista de avaliaÃ§Ãµes do paciente ----
const AvaliacoesTab = ({ patient, avaliacoes, onOpenAv, onEditAv, onDeleteAv, onNewAv, protoRef }) => {
  const avs = avaliacoes
    .filter(a => a.paciente_id === patient.id)
    .sort((a, b) => b.data.localeCompare(a.data));
  const idade = calcIdade(patient.nascimento);
  const [confirmAvId, setConfirmAvId] = React.useState(null);
  const [hovAvId, setHovAvId] = React.useState(null);

  const protoShort = (PROTO_LABELS[protoRef] || "JP3").split("Â·")[0].trim().split(" ")[0];

  if (avs.length === 0) return (
    <Empty icon="ðŸ“‹" title="Sem avaliaÃ§Ãµes registradas"
      sub="Registre a primeira avaliaÃ§Ã£o deste paciente."
      action={<Btn onClick={onNewAv}>+ Nova avaliaÃ§Ã£o</Btn>} />
  );

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* SumÃ¡rio da Ãºltima avaliaÃ§Ã£o */}
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
              ÃšLTIMA AVALIAÃ‡ÃƒO â€” {_fmtData(av.data)}
            </div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { l: "Peso", v: fmtN(av.peso, 1), u: "kg" },
                { l: "IMC", v: fmtN(r.imc, 1), u: "kg/mÂ²", badge: r.classIMC },
                { l: `%G Â· ${protoShort}`, v: fmtN(pG, 1), u: "%", badge: pG != null ? classPctG(pG, patient.sexo) : null },
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
                    { l: `%G Â· ${protoShort}`, v: pG != null ? fmtN(pG, 1) + "%" : "â€”" },
                    { l: "MLG", v: pG != null ? fmtN(av.peso * (1 - pG/100), 1) + " kg" : "â€”" },
                  ].map(c => (
                    <div key={c.l}>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{c.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "var(--text)" }}>{c.v}</div>
                      {c.badge && <Badge tag={c.badge.tag} small>{c.badge.label}</Badge>}
                    </div>
                  ))}
                </div>
                <span style={{ color: "var(--muted)", fontSize: 18 }}>â€º</span>
              </div>
              <div style={{ display: "flex", gap: 4, opacity: hov ? 1 : 0, transition: "opacity 0.12s", flexShrink: 0 }}>
                <button onClick={() => onEditAv(av)} title="Editar avaliaÃ§Ã£o"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>âœï¸</button>
                <button onClick={() => setConfirmAvId(av.id)} title="Excluir avaliaÃ§Ã£o"
                  style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 5, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>ðŸ—‘</button>
              </div>
            </div>
          );
        })}
        {confirmAvId && (
          <ConfirmDialog
            message={`Excluir a avaliaÃ§Ã£o de ${_fmtData(avs.find(a => a.id === confirmAvId)?.data)}? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`}
            onCancel={() => setConfirmAvId(null)}
            onConfirm={() => { onDeleteAv(confirmAvId); setConfirmAvId(null); }}
          />
        )}
      </div>
    </div>
  );
};

// ---- ConfiguraÃ§Ã£o dos protocolos por sexo ----
const PROTOCOL_DOBRAS = {
  "JP3_M":      ["peitoral","abdominal","coxa"],
  "JP3_F":      ["tricipital","suprailÃ­aca","coxa"],
  "Petroski_M": ["subescapular","tricipital","suprailÃ­aca","panturrilha"],
  "Petroski_F": ["axilar","suprailÃ­aca","coxa","panturrilha"],
  "Guedes_M":   ["tricipital","suprailÃ­aca","abdominal"],
  "Guedes_F":   ["coxa","suprailÃ­aca","subescapular"],
  "Faulkner":   ["tricipital","subescapular","suprailÃ­aca","abdominal"],
  "Durnin":     ["biceps","tricipital","subescapular","suprailÃ­aca"],
  "ISAK8":      ["tricipital","subescapular","biceps","suprailÃ­aca","supraespinal","abdominal","coxa","panturrilha"],
  "Carter":     ["tricipital","subescapular","suprailÃ­aca","supraespinal","abdominal","coxa"],
};

const PROTO_LABELS = {
  JP3:      "JP3 Â· J&P (1978/80)",
  Petroski: "Petroski (1995)",
  Guedes:   "Guedes (1994)",
  Faulkner: "Faulkner (1968)",
  Durnin:   "Durnin & W. (1974)",
  Carter:   "Carter (1982)",
};

const DOBRAS_LIST = [
  { key: "tricipital",   label: "Tricipital",    n: 1,  tip: "Ponto meso umeral (mÃ©dio entre acrÃ´mio e cabeÃ§a do rÃ¡dio). Dobra vertical na face posterior do braÃ§o. BraÃ§o relaxado ao lado do corpo." },
  { key: "biceps",       label: "BÃ­ceps",        n: 2,  tip: "Face anterior do braÃ§o, no mesmo nÃ­vel do tricipital. Dobra vertical sobre o ventre do bÃ­ceps." },
  { key: "subescapular", label: "Subescapular",  n: 3,  tip: "PeÃ§a para fechar o punho e colocar nas costas para localizar a escÃ¡pula. A dobra fica 2 cm abaixo do Ã¢ngulo inferior da escÃ¡pula â€” Ã© uma dobra DIAGONAL." },
  { key: "axilar",       label: "Axilar mÃ©dia",  n: 4,  tip: "Linha axilar mÃ©dia, no nÃ­vel do processo xifÃ³ide (entre as costelas). Dobra vertical â€” puxe a linha reta atÃ© a axila." },
  { key: "suprailÃ­aca",  label: "SuprailÃ­aca",   n: 5,  tip: "A partir da axilar, apalpando atÃ© em baixo, ache a borda ilÃ­aca e marque. MeÃ§a 3 cm para cima. Dobra ligeiramente oblÃ­qua." },
  { key: "supraespinal", label: "Supraespinal",  n: 6,  tip: "Continuando a borda ilÃ­aca, com a palma da mÃ£o ache a crista ilÃ­aca (osso do quadril). Puxe uma linha reta para cima e pegue a marcaÃ§Ã£o da suprailÃ­aca. Dobra DIAGONAL â€” marque como *." },
  { key: "abdominal",    label: "Abdominal",     n: 7,  tip: "5 cm lateral Ã  cicatriz umbilical, do lado direito. Dobra vertical. Paciente em posiÃ§Ã£o relaxada." },
  { key: "coxa",         label: "Coxa anterior", n: 8,  tip: "Paciente sentado â€” marque o comeÃ§o da patela e localize a linha inguinal da coxa. Ponto mÃ©dio entre eles, na face anterior. PeÃ§a ao paciente para erguer levemente a perna." },
  { key: "panturrilha",  label: "Panturrilha",   n: 9,  tip: "Face medial da panturrilha, no ponto de maior perÃ­metro. Joelho flexionado a 90Â°, pÃ© apoiado." },
];

const CIRCS_LIST = [
  { key: "torax",          label: "TÃ³rax",          n: "A", tip: "Na altura dos mamilos, com os braÃ§os relaxados ao lado do corpo. Medir ao final de uma expiraÃ§Ã£o normal." },
  { key: "braco",          label: "BraÃ§o relaxado",  n: "B", tip: "Use como referÃªncia a cicatriz da vacina BCG. Relaxe o braÃ§o ao lado do corpo. Ponto mÃ©dio entre acrÃ´mio e olÃ©crano." },
  { key: "braco_contraido",label: "BraÃ§o contraÃ­do", n: "C", tip: "Use como referÃªncia a cicatriz da vacina BCG. Contraia o bÃ­ceps â€” braÃ§o em 90Â° â€” e meÃ§a no maior perÃ­metro." },
  { key: "cintura",        label: "Cintura",         n: "D", tip: "Parte mais fina do abdÃ´men. Use 2 dedos acima do umbigo como referÃªncia. Medir ao final de uma expiraÃ§Ã£o normal." },
  { key: "abdomen",        label: "AbdÃ´men",         n: "E", tip: "Parte mais larga da barriga, geralmente bem na linha do umbigo. Diferente da cintura â€” Ã© o maior perÃ­metro abdominal." },
  { key: "quadril",        label: "Quadril",         n: "F", tip: "Ao redor do maior volume dos glÃºteos, passando a fita pela parte mais saliente do bumbum, com os pÃ©s juntos." },
  { key: "coxa",           label: "Coxa",            n: "G", tip: "20 cm acima da parte superior do joelho. A medida fica geralmente no meio da coxa, entre o joelho e a cintura." },
  { key: "panturrilha",    label: "Panturrilha",     n: "H", tip: "Maior perÃ­metro da panturrilha. Paciente em pÃ©, peso distribuÃ­do nos dois pÃ©s." },
];

// ---- Componentes da tabela de resultados ----
const ResultRow = ({ indicador, valor, dec, unidade, badge }) => (
  <tr style={{ borderBottom: "1px solid var(--border)" }}>
    <td style={{ padding: "8px 16px", fontSize: 12.5, color: "var(--text)" }}>{indicador}</td>
    <td style={{ padding: "8px 16px", textAlign: "right" }}>
      {valor != null && !isNaN(valor)
        ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 13 }}>{Number(valor).toFixed(dec ?? 1).replace('.', ',')}</span>
        : <span style={{ color: "var(--muted)", fontSize: 12 }}>â€”</span>
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
              {protoRef === protoId ? "âœ“ Protocolo do HistÃ³rico" : "Usar no HistÃ³rico"}
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

// ---- Tab: FormulÃ¡rio de avaliaÃ§Ã£o ----
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

  const SUB_TABS = ["Medidas gerais", "Dobras cutÃ¢neas", "CircunferÃªncias", "Resultados"];
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
        {isNew && <div style={{ display: "flex", alignItems: "center" }}><Btn small onClick={() => onSave(form)}>Salvar avaliaÃ§Ã£o</Btn></div>}
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
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>kg/mÂ²</div>
                </div>
                <div>
                  <Badge tag={res.classIMC.tag}>{res.classIMC.label}</Badge>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>ClassificaÃ§Ã£o OMS</div>
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
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Ãšltima mediÃ§Ã£o â€” {_fmtData(prev.data)}</div>
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
                  { k: "ISAK8", l: "Î£8 ISAK" },
                  { k: "Carter", l: "Carter 6D" },
                ].map(p => {
                  const ok = protoOk(p.k);
                  return (
                    <div key={p.k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 5, background: ok ? "var(--accent-light)" : "var(--surface)", border: "1px solid var(--border)", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: ok ? "#16a34a" : "var(--muted)" }}>{ok ? "âœ“" : "â—‹"}</span>
                      <span style={{ fontSize: 11.5, color: ok ? "var(--text)" : "var(--muted)", fontWeight: ok ? 600 : 400 }}>{p.l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CIRCUNFERÃŠNCIAS */}
        {subTab === 2 && (
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
            <div>
              {(() => {
                const prevAvs = (window._patientAvaliacoes || []).filter(a => a.paciente_id === patient.id && (!form._id || a.id !== form._id)).sort((a,b) => b.data.localeCompare(a.data));
                const prev = prevAvs[0];
                if (!prev?.circs || !Object.keys(prev.circs).length) return null;
                return (
                  <div style={{ marginBottom: 12, background: "var(--accent-light)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Ãšltima mediÃ§Ã£o â€” {_fmtData(prev.data)}</div>
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
                        onFocus={e => { setFocusedKey(c.key); e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-light)"; }}
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: 10 }}>RAZÃ•ES AO VIVO</div>
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
              <Empty icon="âš–ï¸" title="Preencha peso e altura" sub="Os resultados aparecem ao vivo." action={<Btn onClick={() => setSubTab(0)}>Dados gerais</Btn>} />
            ) : (() => {
              const fp = res.faixaPesoIdeal;
              return (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Tabela de resultados â€” {_fmtData(form.data)}</span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>DCâ†’%G via Siri Â· WÃ¼rch (1973)</span>
                      <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, background: "var(--accent-light)", borderRadius: 4, padding: "2px 8px" }}>
                        HistÃ³rico: {PROTO_LABELS[protoRef] || "JP3"}
                      </span>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "var(--bg)" }}>
                          {["Indicador","Valor","Unidade","ClassificaÃ§Ã£o"].map(h => (
                            <th key={h} style={{ padding: "9px 16px", textAlign: h === "Valor" ? "right" : "left", fontSize: 10.5, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <TableSection title="Dados gerais" rows={[
                          { indicador: "IMC Â²", valor: res.imc, dec: 1, unidade: "kg/mÂ²", badge: res.classIMC },
                          fp ? { indicador: "Faixa de peso eutrÃ³fico Â¹", valor: null, unidade: `${fmtN(fp[0],1)} â€“ ${fmtN(fp[1],1)} kg`, badge: null } : null,
                          { indicador: "Peso ideal â€” IMC-alvo 22 Â¹", valor: res.piImc, dec: 1, unidade: "kg" },
                          { indicador: "Peso ideal â€” Lorentz Â¹", valor: res.piLorentz, dec: 1, unidade: "kg" },
                          { indicador: "Peso ideal â€” Devine Â¹", valor: res.piDevine, dec: 1, unidade: "kg" },
                        ].filter(Boolean)} />
                        <ProtoSection title="Jackson & Pollock 3 dobras (1978/1980)" publico={sexo === "M" ? "Homens 18â€“61 anos Â· adultos gerais" : "Mulheres 18â€“55 anos Â· adultas gerais"} protoId="JP3" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.jp3dc, dec: 4, unidade: "g/cmÂ³" },
                          { indicador: "%G â€” Siri", valor: res.jp3comp.pctG, dec: 1, unidade: "%", badge: res.jp3comp.pctG != null ? classPctG(res.jp3comp.pctG, sexo) : null },
                          { indicador: "%G â€” Brozek", valor: res.jp3broz, dec: 1, unidade: "%" },
                          { indicador: "Massa Gorda", valor: res.jp3comp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.jp3comp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.jp3comp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Petroski (1995)" publico={sexo === "M" ? "Homens 18â€“66 anos Â· adultos brasileiros" : "Mulheres 18â€“51 anos Â· adultas brasileiras"} protoId="Petroski" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.petdc, dec: 4, unidade: "g/cmÂ³" },
                          { indicador: "%G â€” Siri", valor: res.petcomp.pctG, dec: 1, unidade: "%", badge: res.petcomp.pctG != null ? classPctG(res.petcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.petcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.petcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.petcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Guedes (1994)" publico="Adultos brasileiros Â· ambos os sexos" protoId="Guedes" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.gueddc, dec: 4, unidade: "g/cmÂ³" },
                          { indicador: "%G â€” Siri", valor: res.guedcomp.pctG, dec: 1, unidade: "%", badge: res.guedcomp.pctG != null ? classPctG(res.guedcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.guedcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.guedcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.guedcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Faulkner (1968)" publico="Adultos ativos e atletas Â· ambos os sexos Â· %G direto" protoId="Faulkner" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "%G direto (sem conversÃ£o por DC)", valor: res.faulkcomp.pctG, dec: 1, unidade: "%", badge: res.faulkcomp.pctG != null ? classPctG(res.faulkcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.faulkcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.faulkcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.faulkcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Durnin & Womersley (1974)" publico="Adultos 16â€“72 anos Â· ambos os sexos" protoId="Durnin" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.dwdc, dec: 4, unidade: "g/cmÂ³" },
                          { indicador: "%G â€” Siri", valor: res.dwcomp.pctG, dec: 1, unidade: "%", badge: res.dwcomp.pctG != null ? classPctG(res.dwcomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.dwcomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.dwcomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.dwcomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <ProtoSection title="Carter (1982) â€” 6 dobras incl. supraespinal" publico="Atletas Â· ambos os sexos (ISAK)" protoId="Carter" protoRef={protoRef} onProtoChange={onProtoChange} rows={[
                          { indicador: "Densidade corporal", valor: res.carterDC, dec: 4, unidade: "g/cmÂ³" },
                          { indicador: "%G â€” Siri", valor: res.cartercomp.pctG, dec: 1, unidade: "%", badge: res.cartercomp.pctG != null ? classPctG(res.cartercomp.pctG, sexo) : null },
                          { indicador: "Massa Gorda", valor: res.cartercomp.mg, dec: 1, unidade: "kg" },
                          { indicador: "Massa Livre de Gordura / Massa Magra", valor: res.cartercomp.mlg, dec: 1, unidade: "kg" },
                          { indicador: "% Massa Livre de Gordura", valor: res.cartercomp.pctMLG, dec: 1, unidade: "%" },
                        ]} />
                        <TableSection title="ComposiÃ§Ã£o corporal complementar" rows={[
                          { indicador: "Massa Muscular EsquelÃ©tica â€” Lee (2000)", valor: res.mm, dec: 1, unidade: "kg" },
                          { indicador: `Massa Residual â€” WÃ¼rch (1973) Â· ${sexo==="M"?"24,1%":"20,9%"} do peso`, valor: res.wurch, dec: 1, unidade: "kg" },
                        ]} />
                        <TableSection title="Î£8 dobras ISAK (Norton & Olds, 1996)" rows={[
                          { indicador: "Soma das 8 dobras (indicador relativo â€” nÃ£o converte para %G)", valor: res.isak8, dec: 1, unidade: "mm" },
                        ]} />
                        <TableSection title="RazÃµes antropomÃ©tricas" rows={[
                          { indicador: "RCQ â€” RelaÃ§Ã£o Cintura-Quadril", valor: res.rcq, dec: 3, badge: classRCQ(res.rcq, sexo) },
                          { indicador: "RCE â€” RelaÃ§Ã£o Cintura-Estatura", valor: res.rce, dec: 3, badge: classRCE(res.rce) },
                          { indicador: "Ãndice de Conicidade â€” Valdez (1991)", valor: res.ic, dec: 3, badge: res.ic ? (res.ic > (sexo==="M" ? 1.25 : 1.18) ? {label:"Risco",tag:"red"} : {label:"Adequado",tag:"green"}) : null },
                          { indicador: "IAC â€” Ãndice de Adiposidade Corporal â€” Bergman (2011)", valor: res.iac, dec: 1, unidade: "%" },
                        ]} />
                        <TableSection title="BraÃ§o â€” Frisancho (1981)" rows={[
                          { indicador: "CMB â€” CircunferÃªncia Muscular do BraÃ§o", valor: res.cmb, dec: 1, unidade: "cm" },
                          { indicador: "AMB â€” Ãrea Muscular do BraÃ§o", valor: res.amb, dec: 1, unidade: "cmÂ²" },
                          { indicador: "AMBc â€” Ãrea Muscular do BraÃ§o corrigida", valor: res.ambc, dec: 1, unidade: "cmÂ²" },
                        ]} />
                        <TableSection title="Taxa MetabÃ³lica Basal" rows={[
                          { indicador: "Harris-Benedict revisada (Roza, 1984)", valor: res.hb, dec: 0, unidade: "kcal/dia" },
                          { indicador: "Mifflin-St Jeor (1990)", valor: res.mifflin, dec: 0, unidade: "kcal/dia" },
                          { indicador: "Cunningham (1980) â€” requer MLG calculada", valor: res.cunning, dec: 0, unidade: "kcal/dia" },
                        ]} />
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}><sup>Â¹</sup> Faixa de peso ideal calculada a partir da altura e dos valores limites do IMC de eutrofia (IMC 18,5â€“24,9 kg/mÂ²).</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}><sup>Â²</sup> IMC avaliado conforme classificaÃ§Ãµes da OMS (2006). Para idosos (â‰¥60 anos), aplicada a classificaÃ§Ã£o de Lipschitz (1994).</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>âš ï¸ Valores calculados on-the-fly â€” nenhum resultado derivado Ã© persistido. Massa Magra = Massa Livre de Gordura no modelo bicompartimental.</div>
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

// ---- Componentes do relatÃ³rio no nÃ­vel do mÃ³dulo (evita desmontagem a cada render) ----
const _nPR = (v, d=1) => v != null && !isNaN(v) ? Number(v).toFixed(d).replace('.',',') : 'â€”';

const taStylePR = (base) => ({ ...base, border:'none', borderBottom:'1.5px dashed #ccc', background:'transparent', fontFamily:"'DM Sans',sans-serif", padding:0, outline:'none', width:'100%', boxSizing:'border-box' });

const BdgPR = ({ tag, label }) => {
  const c={green:'#166534',yellow:'#854D0E',orange:'#9A3412',red:'#991B1B',blue:'#1E40AF',gray:'#475569'};
  const b={green:'#DCFCE7',yellow:'#FEF9C3',orange:'#FFEDD5',red:'#FEE2E2',blue:'#DBEAFE',gray:'#F1F5F9'};
  return <span style={{ fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:4,color:c[tag]||c.gray,background:b[tag]||b.gray,whiteSpace:'nowrap' }}>{label}</span>;
};

const EvoLinePR = ({ v0, vN, unit='', dec=1, lowerIsBetter=false, isSingle=false }) => {
  if (isSingle) return null;
  if (v0==null||vN==null||isNaN(v0)||isNaN(vN)) return null;
  const d=vN-v0, isNeutral=Math.abs(d)<0.01;
  const isGood=isNeutral?true:(lowerIsBetter?d<0:d>0);
  const color=isNeutral?'#888':(isGood?'#16a34a':'#dc2626');
  return (
    <div style={{ fontSize:10, color, fontWeight:600, marginBottom:5, display:'flex', alignItems:'center', gap:4 }}>
      <span>{isNeutral?'â†’':d>0?'â†‘':'â†“'}</span>
      <span>{_nPR(v0,dec)} {unit} â†’ {_nPR(vN,dec)} {unit}</span>
      <span style={{ color:'#bbb', fontWeight:400 }}>({d>0?'+':''}{_nPR(d,dec)} {unit} desde o inÃ­cio)</span>
    </div>
  );
};

const ReportCard = ({ label, value, unit, badge, explain, idealRange, v0, vN, vUnit='', vDec=1, lowerIsBetter=false, textKey, editMode, onTextChange, isSingle=false }) => (
  <div style={{ border:'1px solid #e0e0e0',borderRadius:8,padding:'11px 13px',breakInside:'avoid' }}>
    <div style={{ fontSize:9,fontWeight:700,color:'#888',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4 }}>{label}</div>
    <div style={{ display:'flex',alignItems:'baseline',gap:8,marginBottom:3 }}>
      <span style={{ fontSize:22,fontWeight:800,fontFamily:'monospace',color:'#111',lineHeight:1 }}>{value}</span>
      {unit&&<span style={{ fontSize:11,color:'#888' }}>{unit}</span>}
      {badge&&<BdgPR tag={badge.tag} label={badge.label}/>}
    </div>
    <EvoLinePR v0={v0} vN={vN} unit={vUnit} dec={vDec} lowerIsBetter={lowerIsBetter} isSingle={isSingle}/>
    {editMode
      ? <AutoTextarea value={explain} onChange={v => onTextChange(textKey, v)}
          style={taStylePR({ fontSize:10,color:'#333',lineHeight:1.5,marginBottom:idealRange?3:0 })} />
      : <div style={{ fontSize:10,color:'#333',lineHeight:1.5,marginBottom:idealRange?3:0 }}>{explain}</div>
    }
    {idealRange&&<div style={{ fontSize:9.5,color:'#16a34a',fontWeight:600,marginTop:3 }}>âœ“ Faixa ideal: {idealRange}</div>}
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

// ---- Textarea auto-redimensionÃ¡vel para ediÃ§Ã£o inline no relatÃ³rio ----
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

// ---- Textos padrÃ£o do relatÃ³rio (editÃ¡veis antes de imprimir) ----
const DEFAULT_REPORT_TEXTS = {
  secComposicaoSub: "DistribuiÃ§Ã£o dos compartimentos corporais: mÃºsculo, gordura, osso e Ã¡gua.",
  secCardioSub:     "Indicadores relacionados Ã  distribuiÃ§Ã£o regional da gordura corporal.",
  peso:      "Massa corporal total, que engloba mÃºsculo, gordura, osso, Ã³rgÃ£os e Ã¡gua. A balanÃ§a registra a soma desses compartimentos sem discriminar cada um.",
  imc:       "Ãndice que relaciona peso e altura. Ã‰ um instrumento de triagem populacional, utilizado em conjunto com outras medidas porque nÃ£o distingue gordura de mÃºsculo.",
  pctG:      "ProporÃ§Ã£o do peso corporal formada por tecido adiposo. Inclui a gordura essencial (presente em Ã³rgÃ£os e hormÃ´nios) e a gordura de reserva (armazenada sob a pele e ao redor dos Ã³rgÃ£os).",
  gordKg:    "Quantidade absoluta de gordura em quilogramas, obtida a partir do percentual de gordura e do peso total. Complementa a leitura percentual ao expressar a massa em peso.",
  massaMagra:"Soma de tudo que nÃ£o Ã© gordura no corpo: mÃºsculo, osso, Ã³rgÃ£os e Ã¡gua. TambÃ©m chamada de massa livre de gordura (MLG).",
  musculo:   "Estimativa da massa dos mÃºsculos esquelÃ©ticos, responsÃ¡veis pelo movimento e pela postura. Calculada pela equaÃ§Ã£o de Lee et al. (2000) a partir de circunferÃªncias e da estatura.",
  cintura:   "PerÃ­metro medido na regiÃ£o de menor circunferÃªncia do tronco, entre a Ãºltima costela e a crista ilÃ­aca. Reflete o acÃºmulo de gordura na regiÃ£o abdominal.",
  rcq:       "RazÃ£o entre a circunferÃªncia da cintura e a do quadril. Indica o padrÃ£o de distribuiÃ§Ã£o da gordura corporal, classificado como androide (acÃºmulo central) ou ginoide (acÃºmulo perifÃ©rico).",
  rce:       "RazÃ£o entre a circunferÃªncia da cintura e a estatura. Um valor abaixo de 0,50 indica que a cintura Ã© menor que metade da altura, o que Ã© considerado adequado para a maioria dos adultos.",
  isak8:     "Soma das 8 dobras cutÃ¢neas padronizadas pelo protocolo ISAK (International Society for the Advancement of Kinanthropometry). Reflete o volume total de gordura subcutÃ¢nea nos pontos tricipital, subescapular, bÃ­ceps, suprailÃ­aca, supraespinal, abdominal, coxa e panturrilha. Valores menores indicam menor acÃºmulo de gordura subcutÃ¢nea.",
  notas:     "ComposiÃ§Ã£o corporal estimada pelo protocolo indicado, com conversÃ£o por Siri (1961). Massa muscular esquelÃ©tica calculada por Lee et al. (2000). IMC classificado conforme OMS (2006). Faixa de peso ideal para IMC entre 18,5 e 24,9 kg/mÂ². Os resultados sÃ£o estimativas obtidas a partir de medidas externas e nÃ£o substituem exames laboratoriais nem avaliaÃ§Ã£o clÃ­nica individualizada.",
};

// ---- RelatÃ³rio impresso orientado ao paciente ----
const PrintReport = ({ patient, avs, protoRef, protoLabel, idade, getProtoG, texts = DEFAULT_REPORT_TEXTS, editMode = false, onTextChange = () => {}, aiSummary = '' }) => {
  if (!avs.length) return null;

  // â”€â”€ Helper de formataÃ§Ã£o local â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const n = (v, d=1) => v != null && !isNaN(v) ? Number(v).toFixed(d).replace('.',',') : 'â€”';

  const firstAv = avs[0], lastAv = avs[avs.length - 1];
  const rN = calcularTudo(lastAv.peso, lastAv.altura, patient.sexo, idade, lastAv.dobras, lastAv.circs);
  const gN = getProtoG(lastAv);
  const mgN = gN != null ? lastAv.peso * gN / 100 : null;
  const mlgN = mgN != null ? lastAv.peso - mgN : null;

  const prevAv = avs.length >= 2 ? avs[avs.length - 2] : null;
  const rPrev = prevAv ? calcularTudo(prevAv.peso, prevAv.altura, patient.sexo, idade, prevAv.dobras, prevAv.circs) : null;
  const gPrev = prevAv ? getProtoG(prevAv) : null;

  const isF = patient.sexo === 'F';

  // â”€â”€ Sparkline miniatura â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const Spark = ({ vals, color='#888' }) => {
    const vs = vals.filter(v => v != null && !isNaN(v));
    if (vs.length < 2) return null;
    const mn = Math.min(...vs), mx = Math.max(...vs);
    const rng = mx - mn || 1;
    const pts = vs.map((v, i) => `${(i / (vs.length - 1)) * 76 + 2},${34 - ((v - mn) / rng) * 30}`).join(' ');
    const lastParts = pts.split(' ').pop().split(',');
    const lx = lastParts[0], ly = lastParts[1];
    return (
      <svg width={80} height={36} viewBox="0 0 80 36" style={{ display:'block' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx={lx} cy={ly} r={2.5} fill={color}/>
      </svg>
    );
  };

  // â”€â”€ Sparkline para linha de tabela â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SparkRow = ({ vals, lowerIsBetter=true }) => {
    const vs = vals.filter(v => v != null && !isNaN(v));
    if (vs.length < 2) return <span style={{ color:'#ccc', fontSize:9 }}>â€”</span>;
    const mn = Math.min(...vs), mx = Math.max(...vs), rng = mx - mn || 1;
    const pts = vs.map((v, i) => `${(i / (vs.length - 1)) * 56 + 2},${16 - ((v - mn) / rng) * 12}`).join(' ');
    const trend = vs[vs.length - 1] - vs[0];
    const col = Math.abs(trend) < 0.1 ? '#888' : ((lowerIsBetter && trend < 0) || (!lowerIsBetter && trend > 0)) ? '#16a34a' : '#dc2626';
    return (
      <svg width={60} height={18} viewBox="0 0 60 18">
        <polyline points={pts} fill="none" stroke={col} strokeWidth={1.2} strokeLinejoin="round"/>
      </svg>
    );
  };

  // â”€â”€ Gauge horizontal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const Gauge = ({ val, bands }) => {
    if (val == null || !bands) return null;
    const finiteBands = bands.filter(b => b.max < 9);
    const rangeMax = (finiteBands[finiteBands.length - 1]?.max || 1) * 1.1;
    const rangeMin = 0;
    const totalW = 240;
    const totalBandMax = finiteBands[finiteBands.length - 1]?.max || 1;
    let cursor = 0;
    const rects = bands.map((band, i) => {
      const effectiveMax = band.max >= 9 ? totalBandMax * 1.1 : band.max;
      const w = Math.max(0, (effectiveMax - cursor) / (rangeMax - rangeMin) * totalW);
      const x = (cursor / (rangeMax - rangeMin)) * totalW;
      cursor = effectiveMax;
      return { x, w, color: band.color, label: band.label };
    });
    const markerX = Math.min(Math.max((val / (rangeMax - rangeMin)) * totalW, 0), totalW);
    return (
      <svg width="100%" height={32} viewBox={`0 0 ${totalW} 32`} style={{ overflow:'visible' }}>
        {rects.map((r, i) => (
          <rect key={i} x={r.x} y={9} width={r.w} height={10}
            rx={i === 0 ? 3 : i === rects.length - 1 ? 3 : 0}
            fill={r.color} opacity={0.75}/>
        ))}
        <polygon points={`${markerX-4},1 ${markerX+4},1 ${markerX},9`} fill="#1a1a1a"/>
        {rects.map((r, i) => (
          <text key={i} x={r.x + r.w / 2} y={28} textAnchor="middle" fontSize={7} fill="#888" fontFamily="'DM Sans',sans-serif">{r.label}</text>
        ))}
      </svg>
    );
  };

  // â”€â”€ Silhueta com imagem real + callouts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SILHUETA_F = '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ANLv4g0Y+BqXQ5OaxHiwPSSPwoJO4lQB0jrQRY7XD7fBEEj86mCGnJkiosCQJlVIj1qFmQpQNJByR99Bb4oMR+VbCle4JBBYLz1rUMTAgEZzzWWfYWVl8IUQRTRttsrG37ysv8BUcY5NYkuok7+sgwD60fxWYdCywA3QkVVaC7HQqCuQVkAHPQGoqbkbWLMF34ggRPQ1WVE+CQOQRjPnU4l22kqzAwWAIHpFYZQwVh4YGDHBqK8z2gsi3qNLrUYNac+JuYfqT934V6/ZWvUX7dt7hYFhDbscR+tU3dPa1Wjv6a42w3B4SzYDjIPp5Vz+mvNZvaZrg2tbbY4I4IwPpWpNzSXq7fQbgYEsMkV5/aWlV7RvLb7u+XnH8Q6/X5VtWby3NOpBJMlJ4Mj+xVmYe2YUEEbp4NcZ1XW9x4S3nI8D2UjBBI5pWrqr72dTct2VtLbBwpUGD1j0maVvcZ41q2b2pdlRrKQMGG4rYYK4KsAw9a+gjsvs9SSNDpQTkkWVz+FS/Z2i/wBHp/5S/St7Z4vnwQIoVAAB/CBVgk+eMxMV337P0Y/9Jp/5a/Ssfs7Rf6PT/wApfpTZxcEGIBmADPSaBuNo5xkV332DR/6TT/yx9Kfs/Rf6TT/y1+lTZxcCMGNw8wCOlRbcAWUAeeOa+gfs/Rf6TT/yl+lY/Z+iH/o9P/KX6U2cXAFxy+1QDySM1i5cKRtAMn+zXe3OyuzroAuaDSPGRusqf0qf7O0MR9j00REd0v0ps4uBySJAI6QelRJIJZWiBBHQ19A/Z2ix/wAnp8f/AEl+lP2dov8AR6f+Uv0q7OLgFZWchW46RxWSQViTjk9Irvv2dos/8np88/ul+lZ/Z+i/0mn/AJS/Smzi4dSxFosGLGRAEff6UEw7C3BJIMxIruBoNGONLYH/AOsVn7DpI/8AC2P5YqLxcQCxknMCBJrFsEqJABOSJmu4Oh0h50tj+WKwNBoxxpbA+FsVDThiSrjaSAcGOk15HbDAKbtxZW45VgBGTz+U/fX1H7DpP9LY/lioP2ZoLilbmh0zqckNaUg/hVl0XHbhOwdQrAWtSzuSBbYAdScH7hk10xtLuk5J8jk16tvszQWmDW9DpkI4K2lH6Vf3Fr/2k/8AiKzlN3azcmnE3+4t33TU2wpBlQRMAienqTSu1NiyebVv/wCIpTR2tpSlVSlKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUClKUH//2Q==';
  const SILHUETA_M = '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';

  const SilhuetaImg = ({ av }) => {
    const b64 = isF ? SILHUETA_F : SILHUETA_M;
    const callouts = [
      { key:'braco',        src:'circs',  label:'BraÃ§o',        unit:'cm', dec:1, cx: isF?64:55,  cy:118, side:'left'  },
      { key:'cintura',      src:'circs',  label:'Cintura',      unit:'cm', dec:1, cx: isF?148:150, cy:205, side:'right' },
      { key:'quadril',      src:'circs',  label:'Quadril',      unit:'cm', dec:1, cx: isF?72:70,  cy:248, side:'left'  },
      { key:'coxa',         src:'circs',  label:'Coxa',         unit:'cm', dec:1, cx: isF?145:148, cy:285, side:'right' },
      { key:'tricipital',   src:'dobras', label:'Tricipital',   unit:'mm', dec:1, cx: isF?148:154, cy:110, side:'right' },
      { key:'subescapular', src:'dobras', label:'Subescapular', unit:'mm', dec:1, cx: isF?68:66,  cy:155, side:'left'  },
      { key:'abdominal',    src:'dobras', label:'Abdominal',    unit:'mm', dec:1, cx: isF?145:150, cy:200, side:'right' },
    ].filter(c => {
      const v = c.src === 'circs' ? av.circs?.[c.key] : av.dobras?.[c.key];
      return v != null;
    });

    return (
      <div style={{ position:'relative', display:'inline-block' }}>
        <img
          src={`data:image/jpeg;base64,${b64}`}
          alt="Silhueta corporal"
          style={{ width:150, height:350, display:'block', objectFit:'contain' }}
        />
        <svg
          viewBox="0 0 220 400"
          width={220}
          height={400}
          style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', overflow:'visible' }}
        >
          {callouts.map(c => {
            const rawVal = c.src === 'circs' ? av.circs?.[c.key] : av.dobras?.[c.key];
            const valStr = n(rawVal, c.dec) + ' ' + c.unit;
            const lineX2 = c.side === 'left' ? 20 : 200;
            const anchor = c.side === 'left' ? 'end' : 'start';
            return (
              <g key={c.key}>
                <line x1={c.cx} y1={c.cy} x2={lineX2} y2={c.cy} stroke="#ccc" strokeWidth={0.8} strokeDasharray="2,2"/>
                <circle cx={c.cx} cy={c.cy} r={2} fill="#1a1a1a"/>
                <text x={lineX2} y={c.cy - 3} textAnchor={anchor} fontSize={7.5} fill="#555" fontFamily="'DM Sans',sans-serif">{c.label}</text>
                <text x={lineX2} y={c.cy + 7} textAnchor={anchor} fontSize={7.5} fill="#1a1a1a" fontFamily="'JetBrains Mono',monospace" fontWeight="700">{valStr}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // â”€â”€ CabeÃ§alho de seÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SecHeader = ({ title, right }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:'1px solid #e5e5e5', paddingBottom:8, marginBottom:12, marginTop:20 }}>
      <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#888' }}>{title}</span>
      {right && <span style={{ fontSize:9, color:'#bbb' }}>{right}</span>}
    </div>
  );

  // â”€â”€ SÃ©rie de sparklines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sparkSeries = (fn) => avs.map(fn);

  // â”€â”€ Delta formatado â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const DeltaLine = ({ vN, vP, unit='', dec=1, lowerIsBetter=true }) => {
    if (vN == null || vP == null) return null;
    const d = vN - vP;
    if (Math.abs(d) < 0.01) return <span style={{ fontSize:10, color:'#888' }}>= sem variaÃ§Ã£o</span>;
    const pct = vP !== 0 ? ((d / vP) * 100) : 0;
    const good = (lowerIsBetter && d < 0) || (!lowerIsBetter && d > 0);
    const col = good ? '#16a34a' : '#dc2626';
    const arrow = d > 0 ? 'â–²' : 'â–¼';
    return (
      <span style={{ fontSize:10, color:col, fontWeight:600 }}>
        {arrow} {d > 0 ? '+' : ''}{n(d, dec)}{unit} ({d > 0 ? '+' : ''}{n(pct, 1)}%)
      </span>
    );
  };

  // â”€â”€ Bandas de classificaÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const RCQ_BANDS = isF
    ? [{ max:0.80, color:'#22c55e', label:'Baixo' }, { max:0.85, color:'#eab308', label:'Mod.' }, { max:9, color:'#ef4444', label:'Alto' }]
    : [{ max:0.90, color:'#22c55e', label:'Baixo' }, { max:1.00, color:'#eab308', label:'Mod.' }, { max:9, color:'#ef4444', label:'Alto' }];
  const RCE_BANDS = [
    { max:0.40, color:'#3b82f6', label:'Magreza' },
    { max:0.50, color:'#22c55e', label:'Adequado' },
    { max:0.60, color:'#eab308', label:'AtenÃ§Ã£o' },
    { max:9,    color:'#ef4444', label:'Risco' },
  ];

  // â”€â”€ Dados para tabela de medidas brutas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const dobrasDefs = [
    {n:1, key:"tricipital",   label:"Tricipital",     dec:1},
    {n:2, key:"biceps",       label:"BÃ­ceps",         dec:1},
    {n:3, key:"subescapular", label:"Subescapular",   dec:1},
    {n:4, key:"axilar",       label:"Axilar mÃ©dia",   dec:1},
    {n:5, key:"suprailÃ­aca",  label:"SuprailÃ­aca",    dec:1},
    {n:6, key:"supraespinal", label:"Supraespinal",   dec:1},
    {n:7, key:"abdominal",    label:"Abdominal",      dec:1},
    {n:8, key:"coxa",         label:"Coxa anterior",  dec:1},
    {n:9, key:"panturrilha",  label:"Panturrilha",    dec:1},
  ];
  const circsDefs = [
    {n:"A", key:"torax",           label:"TÃ³rax",          dec:1},
    {n:"B", key:"braco",           label:"BraÃ§o relaxado", dec:1},
    {n:"C", key:"braco_contraido", label:"BraÃ§o contraÃ­do",dec:1},
    {n:"D", key:"cintura",         label:"Cintura",        dec:1},
    {n:"E", key:"abdomen",         label:"AbdÃ´men",        dec:1},
    {n:"F", key:"quadril",         label:"Quadril",        dec:1},
    {n:"G", key:"coxa",            label:"Coxa",           dec:1},
    {n:"H", key:"panturrilha",     label:"Panturrilha",    dec:1},
  ];

  const dobrasRows = dobrasDefs.reduce((acc, d) => {
    const vals = avs.map(av => av.dobras?.[d.key] ?? null);
    if (vals.every(v => v == null)) return acc;
    const vL = vals[vals.length - 1], vP = vals.length >= 2 ? vals[vals.length - 2] : null;
    const vFirst = vals.find(v => v != null);
    acc.push({ ...d, vals, delta: vL != null && vP != null ? vL - vP : null, varTotal: vL != null && vFirst != null ? vL - vFirst : null });
    return acc;
  }, []);

  const circsRows = circsDefs.reduce((acc, c) => {
    const vals = avs.map(av => av.circs?.[c.key] ?? null);
    if (vals.every(v => v == null)) return acc;
    const vL = vals[vals.length - 1], vP = vals.length >= 2 ? vals[vals.length - 2] : null;
    const vFirst = vals.find(v => v != null);
    acc.push({ ...c, vals, delta: vL != null && vP != null ? vL - vP : null, varTotal: vL != null && vFirst != null ? vL - vFirst : null });
    return acc;
  }, []);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:'#1a1a1a', fontSize:11 }}>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PARTE 1 â€” IdentificaÃ§Ã£o
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div style={{ paddingBottom:20, borderBottom:'2px solid #1a1a1a', marginBottom:20 }}>

        {/* Nome e dados do paciente */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.03em', color:'#1a1a1a', lineHeight:1.1 }}>
            {patient.nome}
          </div>
          <div style={{ fontSize:13, color:'#444', marginTop:7, fontWeight:500 }}>
            {isF ? 'Feminino' : 'Masculino'} Â· {idade} anos Â· {n(lastAv.altura > 3 ? lastAv.altura / 100 : lastAv.altura, 2)} m{patient.objetivo ? ` Â· ${patient.objetivo}` : ''}
          </div>
          <div style={{ fontSize:10, color:'#999', marginTop:3 }}>
            {protoLabel}{avs.length > 1 ? ` Â· ${_fmtData(firstAv.data)} â†’ ${_fmtData(lastAv.data)} (${avs.length} avaliaÃ§Ãµes)` : ` Â· ${_fmtData(lastAv.data)}`}
          </div>
          <div style={{ fontSize:9, color:'#bbb', marginTop:6 }}>
            Emitido em {new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })} Â· AvaliaÃ§Ã£o AntropomÃ©trica por Vinicius Zapola
          </div>
        </div>

        {/* Cards de indicadores: 4 colunas abaixo do nome */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { label:'% Gordura', value: gN != null ? n(gN) + '%' : 'â€”', badge: gN != null ? classPctG(gN, patient.sexo) : null },
            { label:'Peso', value: n(lastAv.peso) + ' kg', badge: null },
            { label:'IMC', value: n(rN.imc), badge: rN.classIMC },
            { label:'Massa Magra', value: mlgN != null ? n(mlgN) + ' kg' : 'â€”', badge: null },
          ].map(cell => (
            <div key={cell.label} style={{ background:'#f5f5f5', border:'1px solid #e0e0e0', borderRadius:8, padding:'10px 12px' }}>
              <div style={{ fontSize:8, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:4 }}>{cell.label}</div>
              <div style={{ fontSize:20, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:'#1a1a1a', lineHeight:1.1 }}>{cell.value}</div>
              {cell.badge && <div style={{ marginTop:4 }}><Badge tag={cell.badge.tag} small>{cell.badge.label}</Badge></div>}
            </div>
          ))}
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PARTE 2 â€” Dashboard de EvoluÃ§Ã£o
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <SecHeader title="Dashboard de EvoluÃ§Ã£o" right={avs.length > 1 ? `${avs.length} avaliaÃ§Ãµes` : null}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
        {[
          {
            nome: 'Peso', sub: 'kg',
            vals: sparkSeries(av => av.peso),
            vN: lastAv.peso, vP: prevAv?.peso,
            badge: null, lowerIsBetter: true, dec: 1,
            display: n(lastAv.peso), unit: 'kg',
          },
          {
            nome: 'IMC', sub: 'kg/mÂ²',
            vals: sparkSeries(av => calcIMC(av.peso, av.altura)),
            vN: rN.imc, vP: rPrev?.imc,
            badge: rN.classIMC, lowerIsBetter: true, dec: 1,
            display: n(rN.imc), unit: 'kg/mÂ²',
          },
          {
            nome: '% Gordura', sub: '%',
            vals: sparkSeries(av => getProtoG(av)),
            vN: gN, vP: gPrev,
            badge: gN != null ? classPctG(gN, patient.sexo) : null,
            lowerIsBetter: true, dec: 1,
            display: gN != null ? n(gN) : 'â€”', unit: '%',
          },
          {
            nome: 'Massa Muscular', sub: 'kg',
            vals: sparkSeries(av => calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs).mm),
            vN: rN.mm, vP: rPrev?.mm,
            badge: null, lowerIsBetter: false, dec: 1,
            display: n(rN.mm), unit: 'kg',
          },
          {
            nome: 'Î£ 8 Dobras', sub: 'mm (ISAK)',
            vals: sparkSeries(av => calcISAK8(av.dobras || {})),
            vN: rN.isak8, vP: rPrev?.isak8,
            badge: null, lowerIsBetter: true, dec: 1,
            display: rN.isak8 != null ? n(rN.isak8) : 'â€”', unit: 'mm',
          },
        ].map(card => {
          const d = (card.vN != null && card.vP != null) ? card.vN - card.vP : null;
          const good = d == null ? null : ((card.lowerIsBetter && d < 0) || (!card.lowerIsBetter && d > 0));
          const deltaCol = d == null ? '#888' : (good ? '#16a34a' : '#dc2626');
          const arrow = d == null ? '' : d > 0 ? 'â–²' : 'â–¼';
          return (
            <div key={card.nome} style={{ background:'#fafafa', border:'1px solid #ebebeb', borderRadius:6, padding:'10px 12px' }}>
              <div style={{ fontSize:8, textTransform:'uppercase', letterSpacing:'0.1em', color:'#888', fontWeight:700 }}>{card.nome}</div>
              <div style={{ fontSize:7, color:'#bbb', marginBottom:6 }}>{card.sub}</div>
              <div style={{ fontSize:24, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:'#1a1a1a', lineHeight:1 }}>
                {card.display}<span style={{ fontSize:10, color:'#888', marginLeft:3 }}>{card.unit}</span>
              </div>
              {d != null && (
                <div style={{ marginTop:4, fontSize:10, color:deltaCol, fontWeight:600 }}>
                  {arrow} {d > 0 ? '+' : ''}{n(d, card.dec)}{card.unit}
                </div>
              )}
              {card.badge && <div style={{ marginTop:4 }}><Badge tag={card.badge.tag} small>{card.badge.label}</Badge></div>}
              <div style={{ marginTop:6, opacity:0.6 }}>
                <Spark vals={card.vals} color={deltaCol === '#888' ? '#aaa' : deltaCol}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PARTE 3 â€” Mapeamento Corporal + Resumo TÃ©cnico
          (sÃ³ renderiza se aiSummary tiver conteÃºdo)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div>
        <SecHeader title="Mapeamento Corporal" right="Medidas da Ãºltima avaliaÃ§Ã£o"/>
        <div style={{ display:'grid', gridTemplateColumns: aiSummary ? '1fr 1fr' : '1fr', gap:20 }}>

          {/* Silhueta com imagem real */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            <SilhuetaImg av={lastAv}/>
          </div>

          {/* Resumo tÃ©cnico â€” sÃ³ aparece se aiSummary tiver conteÃºdo */}
          {aiSummary && (
            <div>
              <div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#888', marginBottom:10 }}>Resumo TÃ©cnico</div>
              <div style={{ fontSize:10, color:'#333', lineHeight:1.8 }}>
                {aiSummary.split('\n').map((line, i) => {
                  if (!line.trim()) return <div key={i} style={{ height:4 }}/>;
                  const parts = line.split(/\*\*(.*?)\*\*/g).map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part);
                  if (line.trim().match(/^[-â€¢*] /)) {
                    return (
                      <div key={i} style={{ display:'flex', gap:6, marginBottom:3 }}>
                        <span style={{ color:'#0284c7', flexShrink:0 }}>â–¸</span>
                        <span>{line.trim().replace(/^[-â€¢*] /, '')}</span>
                      </div>
                    );
                  }
                  return <div key={i} style={{ marginBottom:4 }}>{parts}</div>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PARTE 4 â€” Indicadores de SaÃºde (Gauge horizontal)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {(rN.rcq != null || rN.rce != null) && (
        <div>
          <SecHeader title="Indicadores de SaÃºde" right="DistribuiÃ§Ã£o de gordura Â· Risco metabÃ³lico"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

            {/* RCQ */}
            {rN.rcq != null && (
              <div style={{ background:'#fafafa', border:'1px solid #ebebeb', borderRadius:6, padding:'12px 14px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#1a1a1a' }}>RazÃ£o Cinturaâ€“Quadril (RCQ)</div>
                <div style={{ fontSize:9, color:'#888', marginBottom:8 }}>
                  DistribuiÃ§Ã£o de gordura corporal â€” padrÃ£o {isF ? 'ginoide/androide' : 'androide/ginoide'}
                </div>
                <div style={{ fontSize:28, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:'#1a1a1a', marginBottom:4 }}>
                  {n(rN.rcq, 2)}
                </div>
                <Gauge val={rN.rcq} bands={RCQ_BANDS}/>
                {rPrev?.rcq != null && (
                  <div style={{ marginTop:4, fontSize:9, color:'#888' }}>
                    Anterior: {n(rPrev.rcq, 2)} â€” <DeltaLine vN={rN.rcq} vP={rPrev.rcq} dec={2} lowerIsBetter={true}/>
                  </div>
                )}
              </div>
            )}

            {/* RCE */}
            {rN.rce != null && (
              <div style={{ background:'#fafafa', border:'1px solid #ebebeb', borderRadius:6, padding:'12px 14px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#1a1a1a' }}>RazÃ£o Cinturaâ€“Estatura (RCE)</div>
                <div style={{ fontSize:9, color:'#888', marginBottom:8 }}>
                  Risco metabÃ³lico â€” valor ideal abaixo de 0,50
                </div>
                <div style={{ fontSize:28, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color:'#1a1a1a', marginBottom:4 }}>
                  {n(rN.rce, 2)}
                </div>
                <Gauge val={rN.rce} bands={RCE_BANDS}/>
                {rPrev?.rce != null && (
                  <div style={{ marginTop:4, fontSize:9, color:'#888' }}>
                    Anterior: {n(rPrev.rce, 2)} â€” <DeltaLine vN={rN.rce} vP={rPrev.rce} dec={2} lowerIsBetter={true}/>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PARTE 5 â€” HistÃ³rico de AvaliaÃ§Ãµes
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div style={{ breakInside:'avoid', marginTop:8 }}>
        <SecHeader title="HistÃ³rico de AvaliaÃ§Ãµes" right={`Protocolo: ${protoLabel}`}/>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
          <thead>
            <tr style={{ background:'#1a1a1a' }}>
              {['Data','Peso','IMC','Gordura %','Gordura kg','Massa Magra','MÃºsculo','Cintura'].map(h => (
                <th key={h} style={{ padding:'6px 8px', textAlign:'left', fontWeight:700, color:'#fff', fontSize:8.5, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {avs.slice().reverse().map((av, idx) => {
              const r = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
              const g = getProtoG(av);
              const mg = g != null ? av.peso * g / 100 : null;
              const mlg = g != null ? av.peso * (1 - g / 100) : null;
              const isActual = idx === 0;
              return (
                <tr key={av.id} style={{
                  borderBottom:'1px solid #eee',
                  background: isActual ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#fafafa',
                  borderLeft: isActual ? '2px solid #16a34a' : '2px solid transparent',
                }}>
                  <td style={{ padding:'5px 8px', fontWeight: isActual ? 700 : 400, whiteSpace:'nowrap' }}>
                    {_fmtData(av.data)}
                    {isActual && <span style={{ fontSize:7.5, color:'#16a34a', marginLeft:4, fontWeight:700, textTransform:'uppercase' }}>atual</span>}
                  </td>
                  <td style={{ padding:'5px 8px', fontFamily:'monospace' }}>{n(av.peso)} kg</td>
                  <td style={{ padding:'5px 8px', fontFamily:'monospace' }}>{n(r.imc)}</td>
                  <td style={{ padding:'5px 8px', fontFamily:'monospace' }}>{g != null ? n(g) + '%' : 'â€”'}</td>
                  <td style={{ padding:'5px 8px', fontFamily:'monospace' }}>{mg != null ? n(mg) + ' kg' : 'â€”'}</td>
                  <td style={{ padding:'5px 8px', fontFamily:'monospace' }}>{mlg != null ? n(mlg) + ' kg' : 'â€”'}</td>
                  <td style={{ padding:'5px 8px', fontFamily:'monospace' }}>{n(r.mm)} kg</td>
                  <td style={{ padding:'5px 8px', fontFamily:'monospace' }}>{av.circs?.cintura ? n(av.circs.cintura, 0) + ' cm' : 'â€”'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PARTE 6 â€” Medidas Brutas com Var.Total e Sparkline
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {(dobrasRows.length > 0 || circsRows.length > 0) && (() => {
        const thStyle = {
          padding:'4px 7px', textAlign:'center', fontSize:8, fontWeight:700,
          color:'#fff', textTransform:'uppercase', letterSpacing:'0.06em',
          borderBottom:'1px solid #444', whiteSpace:'nowrap', background:'#1a1a1a',
        };
        const tdStyle = { padding:'4px 7px', textAlign:'center', fontFamily:'monospace', fontSize:9 };
        const showExtra = avs.length > 1;

        return (
          <div style={{ marginTop:8, breakInside:'avoid' }}>
            <SecHeader title="Medidas Brutas" right="Dobras cutÃ¢neas (mm) Â· CircunferÃªncias (cm)"/>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:9 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign:'left', minWidth:90 }}>Medida</th>
                  {avs.map((av, idx) => {
                    const isLast = idx === avs.length - 1;
                    return (
                      <th key={av.id} style={{ ...thStyle, fontWeight: isLast ? 800 : 700, background: isLast ? '#16a34a' : '#1a1a1a' }}>
                        {_fmtData(av.data)}
                        {isLast && <span style={{ display:'block', fontSize:6.5, textTransform:'uppercase', color:'#d1fae5' }}>atual</span>}
                      </th>
                    );
                  })}
                  {showExtra && <th style={{ ...thStyle, background:'#374151' }}>Î” ant.</th>}
                  {showExtra && <th style={{ ...thStyle, background:'#374151' }}>Var. Total</th>}
                  {showExtra && <th style={{ ...thStyle, background:'#374151' }}>EvoluÃ§Ã£o</th>}
                </tr>
              </thead>
              <tbody>
                {dobrasRows.length > 0 && (
                  <tr>
                    <td colSpan={99} style={{ padding:'4px 7px 2px', background:'rgba(180,83,9,0.07)', fontSize:8, fontWeight:700, color:'rgba(180,83,9,0.85)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                      Dobras cutÃ¢neas
                    </td>
                  </tr>
                )}
                {dobrasRows.map(d => (
                  <tr key={d.key} style={{ borderBottom:'1px solid #eee' }}>
                    <td style={{ ...tdStyle, textAlign:'left', fontWeight:600, whiteSpace:'nowrap', paddingLeft:7 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                        <span style={{ width:14, height:14, borderRadius:'50%', background:'rgba(180,83,9,0.85)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'white', fontFamily:'monospace', fontSize:7, fontWeight:700, flexShrink:0 }}>{d.n}</span>
                        {d.label}
                      </span>
                    </td>
                    {d.vals.map((v, idx) => (
                      <td key={idx} style={{ ...tdStyle, background: idx === d.vals.length - 1 ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        {v != null ? n(v, d.dec) : 'â€”'}
                      </td>
                    ))}
                    {showExtra && (
                      <td style={{ ...tdStyle, fontWeight:600, color: d.delta == null ? '#999' : d.delta < -0.05 ? '#16a34a' : d.delta > 0.05 ? '#dc2626' : '#888' }}>
                        {d.delta == null ? 'â€”' : (d.delta > 0 ? '+' : '') + n(d.delta, d.dec)}
                      </td>
                    )}
                    {showExtra && (
                      <td style={{ ...tdStyle, fontWeight:700, color: d.varTotal == null ? '#999' : d.varTotal < -0.05 ? '#16a34a' : d.varTotal > 0.05 ? '#dc2626' : '#888' }}>
                        {d.varTotal == null ? 'â€”' : (d.varTotal > 0 ? '+' : '') + n(d.varTotal, d.dec)}
                      </td>
                    )}
                    {showExtra && (
                      <td style={{ ...tdStyle }}>
                        <SparkRow vals={d.vals} lowerIsBetter={true}/>
                      </td>
                    )}
                  </tr>
                ))}

                {circsRows.length > 0 && (
                  <tr>
                    <td colSpan={99} style={{ padding:'4px 7px 2px', background:'rgba(37,99,235,0.06)', fontSize:8, fontWeight:700, color:'rgba(37,99,235,0.8)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
                      CircunferÃªncias
                    </td>
                  </tr>
                )}
                {circsRows.map(c => (
                  <tr key={c.key} style={{ borderBottom:'1px solid #eee' }}>
                    <td style={{ ...tdStyle, textAlign:'left', fontWeight:600, whiteSpace:'nowrap', paddingLeft:7 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                        <span style={{ width:14, height:14, borderRadius:3, background:'#2563eb', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'white', fontFamily:'monospace', fontSize:7, fontWeight:700, flexShrink:0 }}>{c.n}</span>
                        {c.label}
                      </span>
                    </td>
                    {c.vals.map((v, idx) => (
                      <td key={idx} style={{ ...tdStyle, background: idx === c.vals.length - 1 ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        {v != null ? n(v, c.dec) : 'â€”'}
                      </td>
                    ))}
                    {showExtra && (
                      <td style={{ ...tdStyle, fontWeight:600, color: c.delta == null ? '#999' : c.delta < -0.05 ? '#16a34a' : c.delta > 0.05 ? '#dc2626' : '#888' }}>
                        {c.delta == null ? 'â€”' : (c.delta > 0 ? '+' : '') + n(c.delta, c.dec)}
                      </td>
                    )}
                    {showExtra && (
                      <td style={{ ...tdStyle, fontWeight:700, color: c.varTotal == null ? '#999' : c.varTotal < -0.05 ? '#16a34a' : c.varTotal > 0.05 ? '#dc2626' : '#888' }}>
                        {c.varTotal == null ? 'â€”' : (c.varTotal > 0 ? '+' : '') + n(c.varTotal, c.dec)}
                      </td>
                    )}
                    {showExtra && (
                      <td style={{ ...tdStyle }}>
                        <SparkRow vals={c.vals} lowerIsBetter={false}/>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PARTE 7 â€” Notas MetodolÃ³gicas
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div style={{ marginTop:14, padding:'9px 13px', background:'#fafafa', borderRadius:6, border:'1px solid #ebebeb', breakInside:'avoid' }}>
        <div style={{ fontSize:8.5, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Notas MetodolÃ³gicas</div>
        {editMode
          ? <AutoTextarea value={texts.notas} onChange={v => onTextChange('notas', v)}
              style={{ fontSize:8.5, color:'#666', lineHeight:1.7, border:'none', borderBottom:'1.5px dashed #ccc', background:'transparent', fontFamily:"'DM Sans',sans-serif", padding:0, outline:'none', width:'100%', boxSizing:'border-box' }} />
          : <div style={{ fontSize:8.5, color:'#666', lineHeight:1.7 }}>{texts.notas}</div>
        }
      </div>

    </div>
  );
};

// ---- Modal de prÃ©-visualizaÃ§Ã£o e ediÃ§Ã£o do relatÃ³rio ----
const PrintPreviewModal = ({ patient, avs, protoRef, protoLabel, idade, getProtoG, texts, onTextsChange, onClose, onPrint, aiSummary = '' }) => {
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
          PrÃ©-visualizaÃ§Ã£o Â· {patient.nome}
        </div>
        <span style={{ fontSize:11, color:'#9CA3AF' }}>Clique nos textos sublinhados para editar</span>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', color:'#fff', fontFamily:'inherit' }}>
          Fechar
        </button>
        <button onClick={handlePrint} style={{ background:'#2563eb', border:'none', borderRadius:6, padding:'6px 18px', fontSize:13, fontWeight:600, cursor:'pointer', color:'#fff', fontFamily:'inherit' }}>
          ðŸ–¨ Imprimir
        </button>
      </div>
      {/* ConteÃºdo scrollÃ¡vel */}
      <div style={{ flex:1, overflow:'auto', padding:'28px 24px', display:'flex', justifyContent:'center' }}>
        <div style={{ background:'#fff', width:794, padding:'32px 40px', boxShadow:'0 2px 24px rgba(0,0,0,0.14)', fontFamily:"'DM Sans',sans-serif" }}>
          <PrintReport
            patient={patient} avs={avs} protoRef={protoRef} protoLabel={protoLabel}
            idade={idade} getProtoG={getProtoG}
            texts={draft} editMode={true} onTextChange={updateText}
            aiSummary={aiSummary}
          />
        </div>
      </div>
    </div>
  );
};

// ---- Tab: HistÃ³rico ----
// ---- Diagrama anatÃ´mico SVG de referÃªncia (sexo-ciente) ----
const BodyDiagram = ({ sexo = 'M' }) => {
  const isF = sexo === 'F';

  // Silhueta simplificada â€” viewBox 0 0 200 440
  // Feminino: ombros ligeiramente mais estreitos, cintura mais definida, quadril mais largo
  // Masculino: ombros largos, build retangular, quadril mais estreito
  const frontPath = isF
    ? "M 32,78 Q 100,64 168,78 L 168,206 Q 167,220 158,226 L 151,220 Q 149,215 147,210 L 146,195 L 143,178 Q 141,200 140,222 Q 140,248 155,260 Q 162,270 155,276 L 141,440 L 126,440 L 121,330 Q 100,318 79,330 L 74,440 L 59,440 L 45,276 Q 38,270 45,260 Q 60,248 60,222 Q 59,200 57,178 L 54,195 L 53,210 Q 51,215 49,220 L 42,226 Q 33,220 32,206 Z"
    : "M 25,78 Q 100,63 175,78 L 175,206 Q 174,220 165,226 L 158,220 Q 156,215 154,210 L 153,195 L 150,178 L 152,258 Q 156,270 150,276 L 140,440 L 125,440 L 120,330 Q 100,318 80,330 L 75,440 L 60,440 L 50,276 Q 44,270 48,258 L 50,178 L 47,195 L 46,210 Q 44,215 42,220 L 35,226 Q 26,220 25,206 Z";

  // Vista de costas usa o mesmo contorno (simÃ©trica)
  const backPath = frontPath;

  const DOBRA_PTS = [
    { n:1,  key:"tricipital",    label:"Tricipital",    view:"B", cx:40,  cy:140 },
    { n:2,  key:"biceps",        label:"BÃ­ceps",        view:"F", cx:40,  cy:138 },
    { n:3,  key:"subescapular",  label:"Subescapular",  view:"B", cx:88,  cy:142 },
    { n:4,  key:"axilar",        label:"Axilar mÃ©dia",  view:"F", cx:62,  cy:138 },
    { n:5,  key:"suprailÃ­aca",   label:"SuprailÃ­aca",   view:"F", cx:136, cy:200 },
    { n:6,  key:"supraespinal",  label:"Supraespinal",  view:"F", cx:132, cy:210 },
    { n:7,  key:"abdominal",     label:"Abdominal",     view:"F", cx:108, cy:178 },
    { n:8,  key:"coxa",          label:"Coxa anterior", view:"F", cx:84,  cy:290 },
    { n:9,  key:"panturrilha",   label:"Panturrilha",   view:"F", cx:82,  cy:365 },
  ];
  const CIRC_LNS = [
    { n:"A", key:"torax",           label:"TÃ³rax",           y:122, x1:58,  x2:142 },
    { n:"B", key:"braco",           label:"BraÃ§o relaxado",  y:135, x1:33,  x2:62  },
    { n:"C", key:"braco_contraido", label:"BraÃ§o contraÃ­do", y:138, x1:33,  x2:62  },
    { n:"D", key:"cintura",         label:"Cintura",         y:160, x1:62,  x2:138 },
    { n:"E", key:"abdomen",         label:"AbdÃ´men",         y:185, x1:58,  x2:142 },
    { n:"F", key:"quadril",         label:"Quadril",         y:233, x1:54,  x2:146 },
    { n:"G", key:"coxa",            label:"Coxa",            y:272, x1:62,  x2:96  },
    { n:"H", key:"panturrilha",     label:"Panturrilha",     y:349, x1:64,  x2:96  },
  ];

  const Silhueta = ({ path, isBack }) => (
    <svg viewBox="0 0 200 440" style={{ width:138, height:304, overflow:"visible", display:"block" }}>
      {/* CabeÃ§a */}
      <ellipse cx="100" cy="30" rx="22" ry="25" fill="#f2f2f2" stroke="#c4c4c4" strokeWidth="1.5"/>
      {/* PescoÃ§o (preenche o gap entre cabeÃ§a e corpo) */}
      <rect x="91" y="53" width="18" height="18" fill="#f2f2f2" stroke="none"/>
      <line x1="91" y1="53" x2="91" y2="69" stroke="#c4c4c4" strokeWidth="1.5"/>
      <line x1="109" y1="53" x2="109" y2="69" stroke="#c4c4c4" strokeWidth="1.5"/>
      {/* Corpo */}
      <path d={path} fill="#f2f2f2" stroke="#c4c4c4" strokeWidth="1.5"/>
      {/* IndicaÃ§Ã£o de seios â€” feminino, vista frontal */}
      {isF && !isBack && (
        <g>
          <ellipse cx="85" cy="132" rx="12" ry="10" fill="#ebebeb" stroke="#c4c4c4" strokeWidth="1"/>
          <ellipse cx="115" cy="132" rx="12" ry="10" fill="#ebebeb" stroke="#c4c4c4" strokeWidth="1"/>
        </g>
      )}
      {/* EscÃ¡pulas â€” vista costas */}
      {isBack && (
        <g>
          <ellipse cx="80"  cy="135" rx="14" ry="12" fill="none" stroke="#d2d2d2" strokeWidth="1" strokeDasharray="3,2"/>
          <ellipse cx="120" cy="135" rx="14" ry="12" fill="none" stroke="#d2d2d2" strokeWidth="1" strokeDasharray="3,2"/>
        </g>
      )}
      {/* Pontos de dobras */}
      {DOBRA_PTS.filter(p => p.view === (isBack ? "B" : "F")).map(p => (
        <g key={p.n}>
          <circle cx={p.cx} cy={p.cy} r={7} fill="rgba(180,83,9,0.88)" stroke="white" strokeWidth="1.2"/>
          <text x={p.cx} y={p.cy+4} textAnchor="middle" fontSize="7" fontWeight="700" fill="white" fontFamily="'JetBrains Mono',monospace">{p.n}</text>
        </g>
      ))}
      {/* Linhas de circunferÃªncias â€” sÃ³ na vista frontal */}
      {!isBack && CIRC_LNS.map(c => (
        <g key={c.n}>
          <line x1={c.x1-2} y1={c.y} x2={c.x2+2} y2={c.y} stroke="#2563eb" strokeWidth="1.8" strokeDasharray="4,2"/>
          <rect x={c.x2+4} y={c.y-7} width="15" height="13" rx="3" fill="#2563eb" opacity="0.85"/>
          <text x={c.x2+11.5} y={c.y+4.5} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="white" fontFamily="'JetBrains Mono',monospace">{c.n}</text>
        </g>
      ))}
    </svg>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"14px 12px 10px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:10, minWidth:320, flexShrink:0 }}>
      <div style={{ fontSize:10.5, fontWeight:700, color:"var(--muted)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Pontos de referÃªncia</div>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8.5, color:"var(--muted)", letterSpacing:"0.06em", marginBottom:2 }}>FRENTE</div>
          <Silhueta path={frontPath} isBack={false}/>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:8.5, color:"var(--muted)", letterSpacing:"0.06em", marginBottom:2 }}>COSTAS</div>
          <Silhueta path={backPath} isBack={true}/>
        </div>
      </div>
      {/* Legenda */}
      <div style={{ padding:"6px 8px", background:"var(--surface)", borderRadius:6, border:"1px solid var(--border)" }}>
        <div style={{ display:"flex", gap:"4px 10px", flexWrap:"wrap", marginBottom:5 }}>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:"var(--muted)" }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:"rgba(180,83,9,0.88)", display:"inline-block" }}/>Dobras (mm)
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:9, color:"var(--muted)" }}>
            <span style={{ width:10, height:2, background:"#2563eb", display:"inline-block" }}/>Circunf. (cm)
          </span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 6px" }}>
          {DOBRA_PTS.map(p => (
            <div key={p.n} style={{ display:"flex", alignItems:"center", gap:4, fontSize:8, color:"var(--muted)" }}>
              <span style={{ width:14, height:14, borderRadius:"50%", background:"rgba(180,83,9,0.88)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"white", fontFamily:"monospace", fontSize:7, fontWeight:700, flexShrink:0 }}>{p.n}</span>
              {p.label}
            </div>
          ))}
          {CIRC_LNS.map(c => (
            <div key={c.n} style={{ display:"flex", alignItems:"center", gap:4, fontSize:8, color:"var(--muted)" }}>
              <span style={{ width:14, height:14, borderRadius:3, background:"#2563eb", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"white", fontFamily:"monospace", fontSize:7, fontWeight:700, flexShrink:0 }}>{c.n}</span>
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

  const protoLabel = PROTO_LABELS[protoRef] || "JP3 Â· J&P (1978/80)";
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
    { min: 25, max: 32, color: "#eab308", label: "AceitÃ¡vel" },
    { min: 32, max: 50, color: "#ef4444", label: "Obesidade" },
  ];
  const PCTG_BANDS_M = [
    { min: 0,  max: 6,  color: "#3b82f6", label: "Muito baixo" },
    { min: 6,  max: 14, color: "#22c55e", label: "Atleta" },
    { min: 14, max: 18, color: "#86efac", label: "Boa forma" },
    { min: 18, max: 25, color: "#eab308", label: "AceitÃ¡vel" },
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

  // Legenda de classificaÃ§Ã£o
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
            {b.label}{active === b ? " â†" : ""}
          </div>
        ))}
      </div>
    );
  };

  const charts = [
    { title: "Peso corporal", unit: "kg", dec: 1, height: 140, data: series(av => av.peso, 1), color: COLS[0], bands: null },
    { title: "IMC", unit: "kg/mÂ²", dec: 1, height: 180, data: series(av => calcIMC(av.peso, av.altura), 1), color: COLS[1], bands: IMC_BANDS },
    { title: `% Gordura Â· ${protoLabel}`, unit: "%", dec: 1, height: 190, data: series(av => getProtoG(av), 1), color: COLS[2], bands: patient.sexo === "F" ? PCTG_BANDS_F : PCTG_BANDS_M },
    { title: "Massa Gorda", unit: "kg", dec: 1, height: 140, data: series(av => { const g = getProtoG(av); return g != null ? av.peso * g / 100 : null; }, 1), color: COLS[2], bands: null },
    { title: "Massa Livre de Gordura", unit: "kg", dec: 1, height: 140, data: series(av => { const g = getProtoG(av); return g != null ? av.peso * (1 - g / 100) : null; }, 1), color: COLS[3], bands: null },
    { title: "Massa Muscular Â· Lee 2000", unit: "kg", dec: 1, height: 140, data: series(av => calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs).mm, 1), color: COLS[4], bands: null },
    { title: "RCQ", unit: "", dec: 2, height: 180, data: series(av => calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs).rcq, 2), color: COLS[6], bands: patient.sexo === "F" ? RCQ_BANDS_F : RCQ_BANDS_M },
    { title: "RCE", unit: "", dec: 2, height: 180, data: series(av => calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs).rce, 2), color: COLS[7], bands: RCE_BANDS },
    { title: "Soma 8 Dobras (ISAK)", unit: "mm", dec: 1, height: 140, data: series(av => calcISAK8(av.dobras || {}), 1), color: "#0d9488", bands: null },
  ];

  // Retorna a cor da faixa em que o valor cai
  const getBandColor = (value, bands, defaultColor) => {
    if (!bands || value == null) return defaultColor;
    const band = bands.find(b => value >= b.min && value < b.max);
    return band ? band.color : defaultColor;
  };

  const ChartWithBands = ({ data, color, bands, height = 140 }) => {
    if (!data || data.length === 0) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>Sem dados registrados</div>;
    const W = 420, H = height, pad = { t: 20, r: 12, b: 28, l: 44 };
    const vals = data.map(d => d.value);
    const bMin = bands ? Math.min(...bands.map(b => b.min)) : Math.min(...vals);
    const bMax = bands ? Math.max(...bands.filter(b=>b.max<999).map(b => b.max)) : Math.max(...vals);
    let allMin = Math.min(...vals, bMin);
    let allMax = Math.max(...vals, bMax);
    if (data.length === 1 && !bands) {
      const halfRange = Math.max(vals[0] * 0.05, 1);
      allMin = vals[0] - halfRange;
      allMax = vals[0] + halfRange;
    }
    const range = allMax - allMin || 1;
    const xS = i => data.length === 1
      ? pad.l + (W - pad.l - pad.r) / 2
      : pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
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
        {data.length >= 2 && <path d={area} fill={`url(#${gid})`} />}
        {data.length >= 2 && <polyline points={poly} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="none" opacity="0.35" />}
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
  const [pastedText, setPastedText] = React.useState("");

  const buildPrompt = () => {
    const n = (v, d=1) => v != null && !isNaN(v) ? Number(v).toFixed(d).replace('.',',') : 'â€”';
    const dobrasKeys = ["tricipital","biceps","subescapular","axilar","suprailÃ­aca","supraespinal","abdominal","coxa","panturrilha"];
    const circsKeys  = ["torax","cintura","abdomen","quadril","braco","braco_contraido","coxa","panturrilha"];

    // CabeÃ§alhos das dobras e circunferÃªncias presentes em pelo menos uma avaliaÃ§Ã£o
    const dobrasCols = dobrasKeys.filter(k => avs.some(av => av.dobras?.[k] != null));
    const circsCols  = circsKeys.filter(k => avs.some(av => av.circs?.[k] != null));

    const labels = { tricipital:"Tricp",biceps:"BÃ­ceps",subescapular:"Subes",axilar:"Axilar",
      "suprailÃ­aca":"SupraÃ­l",supraespinal:"Supraes",abdominal:"Abdom",coxa:"Coxa",panturrilha:"Pant",
      torax:"TÃ³rax",cintura:"Cintura",abdomen:"AbdÃ´men",quadril:"Quadril",braco:"BraÃ§o",braco_contraido:"BraÃ§o c.",
    };

    let md = `# Resumo ClÃ­nico de EvoluÃ§Ã£o AntropomÃ©trica\n\n`;
    md += `**Paciente:** ${patient.nome} | ${patient.sexo === "F" ? "Feminino" : "Masculino"} | ${idade} anos | Objetivo: ${patient.objetivo}  \n`;
    md += `**PerÃ­odo:** ${_fmtData(avs[0].data)} â†’ ${_fmtData(avs[avs.length-1].data)} (${avs.length} avaliaÃ§Ãµes)  \n`;
    md += `**Protocolo %G:** ${protoLabel}\n\n`;

    // Tabela de medidas brutas: peso + dobras
    md += `## Medidas brutas â€” dobras cutÃ¢neas (mm)\n\n`;
    md += `| Data | Peso kg | Alt cm | ${dobrasCols.map(k => labels[k]||k).join(' | ')} |\n`;
    md += `|------|---------|--------|${dobrasCols.map(() => '------').join('|')}|\n`;
    avs.forEach(av => {
      md += `| ${_fmtData(av.data)} | ${n(av.peso)} | ${av.altura} | ${dobrasCols.map(k => n(av.dobras?.[k] ?? null)).join(' | ')} |\n`;
    });

    // Tabela de circunferÃªncias
    md += `\n## Medidas brutas â€” circunferÃªncias (cm)\n\n`;
    md += `| Data | ${circsCols.map(k => labels[k]||k).join(' | ')} |\n`;
    md += `|------|${circsCols.map(() => '------').join('|')}|\n`;
    avs.forEach(av => {
      md += `| ${_fmtData(av.data)} | ${circsCols.map(k => n(av.circs?.[k] ?? null)).join(' | ')} |\n`;
    });

    // Tabela de indicadores calculados
    md += `\n## Indicadores calculados\n\n`;
    md += `| Data | IMC | Cl.IMC | %G | Cl.%G | MG kg | MLG kg | MM kg | WÃ¼rch kg | RCQ | RCE | Cintura cm |\n`;
    md += `|------|-----|--------|----|-------|-------|--------|-------|----------|-----|-----|------------|\n`;
    avs.forEach(av => {
      const r = calcularTudo(av.peso, av.altura, patient.sexo, idade, av.dobras, av.circs);
      const g = getProtoG(av);
      const mg = g != null ? av.peso * g / 100 : null;
      const mlg = g != null ? av.peso * (1 - g / 100) : null;
      const clImc = r.classIMC?.label || 'â€”';
      const clG   = g != null ? (classPctG(g, patient.sexo)?.label || 'â€”') : 'â€”';
      md += `| ${_fmtData(av.data)} | ${n(r.imc)} | ${clImc} | ${n(g)} | ${clG} | ${n(mg)} | ${n(mlg)} | ${n(r.mm)} | ${n(r.wurch)} | ${n(r.rcq,1)} | ${n(r.rce,1)} | ${n(av.circs?.cintura,0)} |\n`;
    });

    md += `\n## InstruÃ§Ã£o\n\n`;
    md += `VocÃª Ã© um sistema de apoio clÃ­nico para nutricionistas. Com base nos dados acima, gere um **resumo clÃ­nico de evoluÃ§Ã£o antropomÃ©trica** em portuguÃªs brasileiro.\n\n`;
    md += `**Formato esperado:**\n`;
    md += `- **ParÃ¡grafo 1** (mÃ¡x 4 linhas): evoluÃ§Ã£o geral objetiva com classificaÃ§Ãµes OMS â€” peso, composiÃ§Ã£o corporal, razÃµes de risco.\n`;
    md += `- **ParÃ¡grafo 2** â€” bullets (mÃ¡x 3): pontos de atenÃ§Ã£o clÃ­nica com base nos dados.\n\n`;
    md += `**RestriÃ§Ãµes:** NÃƒO prescreva condutas, dietas ou suplementos. Tom clÃ­nico e direto. Responda apenas o resumo, sem introduÃ§Ã£o.\n`;
    return md;
  };

  const abrirNoClaude = () => {
    if (avs.length < 2) return;
    const p = buildPrompt();
    setPromptText(p);
    setShowPromptPanel(true);
    setPromptCopied(false);
    setPastedText("");
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

  // ObtÃ©m dados da Ãºltima avaliaÃ§Ã£o para o resumo de estado atual
  const lastAv = avs.length ? avs[avs.length - 1] : null;
  const lastR  = lastAv ? calcularTudo(lastAv.peso, lastAv.altura, patient.sexo, idade, lastAv.dobras, lastAv.circs) : null;
  const lastG  = lastAv ? getProtoG(lastAv) : null;

  return (
    <div style={{ padding: "20px 24px" }}>

      {/* RelatÃ³rio impresso â€” orientado ao paciente */}
      <div className="print-only" style={{ display: "none" }}>
        <PrintReport patient={patient} avs={avs} protoRef={protoRef} protoLabel={protoLabel} idade={idade} getProtoG={getProtoG} texts={reportTexts} aiSummary={aiSummary||''} />
      </div>

      {/* Modal de prÃ©-visualizaÃ§Ã£o */}
      {previewOpen && (
        <PrintPreviewModal
          patient={patient} avs={avs} protoRef={protoRef} protoLabel={protoLabel}
          idade={idade} getProtoG={getProtoG}
          texts={reportTexts}
          onTextsChange={setReportTexts}
          aiSummary={aiSummary||''}
          onClose={() => setPreviewOpen(false)}
          onPrint={() => { setPreviewOpen(false); setTimeout(() => window.print(), 60); }}
        />
      )}

      {/* Barra de aÃ§Ãµes â€” oculta no print */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Btn small onClick={abrirNoClaude} disabled={avs.length < 2} variant="secondary">
            âœ¦ Gerar resumo com IA
          </Btn>
          {avs.length < 2 && <span style={{ fontSize: 11, color: "var(--muted)" }}>MÃ­nimo 2 avaliaÃ§Ãµes</span>}
          <span style={{ fontSize: 11, color: "var(--muted)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px" }}>%G: {protoLabel}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <Btn small onClick={() => setPreviewOpen(true)}>ðŸ–¨ Exportar PDF</Btn>
          <span style={{ fontSize: 10, color: "var(--muted)", textAlign: "right", lineHeight: 1.4 }}>
            No Chrome: desmarque<br/>"CabeÃ§alhos e rodapÃ©s"
          </span>
        </div>
      </div>

      {/* Painel do prompt â€” aparece ao clicar em "Gerar resumo" */}
      {showPromptPanel && (
        <div className="no-print" style={{ marginBottom: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {/* CabeÃ§alho do painel */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>âœ¦ Prompt pronto</div>
            <button onClick={() => setShowPromptPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 18, lineHeight: 1 }}>Ã—</button>
          </div>
          {/* InstruÃ§Ãµes */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--accent-light)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
              <strong>1.</strong> Copie o prompt abaixo &nbsp;â†’&nbsp;
              <strong>2.</strong> <a href="https://claude.ai/new" target="_blank" style={{ color: "var(--accent)", fontWeight: 600 }}>Abra o Claude.ai â†—</a> &nbsp;â†’&nbsp;
              <strong>3.</strong> Cole e envie &nbsp;â†’&nbsp;
              <strong>4.</strong> Cole a resposta no campo abaixo
            </div>
            <button onClick={copiarPrompt} style={{
              marginLeft: "auto", padding: "6px 16px", borderRadius: 6,
              background: promptCopied ? "#16a34a" : "var(--accent)",
              color: "#fff", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}>
              {promptCopied ? "âœ“ Copiado!" : "ðŸ“‹ Copiar prompt"}
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
              Cole aqui a resposta do Claude.ai â€” edite se necessÃ¡rio e clique em Salvar:
            </div>
            <textarea
              rows={6}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="Cole a resposta do Claude.ai aqui..."
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 7,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--text)", fontSize: 13, fontFamily: "inherit",
                resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 2px var(--accent-light)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button onClick={() => { setShowPromptPanel(false); setPastedText(""); }}
                style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
                Cancelar
              </button>
              <button
                disabled={pastedText.trim().length < 10}
                onClick={() => { colarResumo(pastedText); setShowPromptPanel(false); setPastedText(""); setAiCollapsed(false); }}
                style={{ padding: "6px 18px", borderRadius: 6, border: "none", background: pastedText.trim().length >= 10 ? "var(--accent)" : "var(--border)", color: pastedText.trim().length >= 10 ? "#fff" : "var(--muted)", fontSize: 12, fontFamily: "inherit", fontWeight: 700, cursor: pastedText.trim().length >= 10 ? "pointer" : "default", transition: "background 0.15s" }}>
                Salvar resumo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumo de IA */}
      {(aiLoading || aiSummary) && (
        <div className="ai-summary-card no-print" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 20, borderLeft: "3px solid var(--accent)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", cursor: aiSummary ? "pointer" : "default" }}
            onClick={() => aiSummary && setAiCollapsed(c => !c)}>
            <span style={{ fontSize: 13 }}>âœ¦</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Resumo de evoluÃ§Ã£o</span>
            <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>IA Â· revisÃ£o obrigatÃ³ria</span>
            {aiSummary && (
              <button onClick={e => { e.stopPropagation(); setPastedText(aiSummary); setShowPromptPanel(true); setAiCollapsed(false); }}
                style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: "2px 6px" }}>
                âœ Editar
              </button>
            )}
            {aiSummary && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>{aiCollapsed ? "â–¸" : "â–¾"}</span>}
          </div>
          {!aiCollapsed && (
            <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--border)" }}>
              {aiLoading ? <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 12 }}>â³ Analisando evoluÃ§Ã£o...</div> : (
                <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.75, paddingTop: 12 }}>
                  {aiSummary.split("\n").map((line, i) => {
                    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
                    const parts = line.split(/\*\*(.*?)\*\*/g).map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part);
                    if (line.trim().match(/^[-â€¢*] /)) return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: "var(--accent)", flexShrink: 0 }}>â–¸</span><span>{line.trim().replace(/^[-â€¢*] /, "")}</span></div>;
                    if (line.trim().startsWith("## ")) return <div key={i} style={{ fontWeight: 700, fontSize: 14, marginTop: 10, marginBottom: 4 }}>{line.replace(/^##+ /, "")}</div>;
                    return <div key={i} style={{ marginBottom: 6 }}>{parts}</div>;
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabela de evoluÃ§Ã£o */}
      <div className="no-print" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>EvoluÃ§Ã£o Â· {protoLabel}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {[
                  { h: "Data", a: "left" },
                  { h: "Peso (kg)", a: "right" },
                  { h: "IMC (kg/mÂ²)", a: "right" },
                  { h: `%G Â· ${(PROTO_LABELS[protoRef]||"JP3").split("Â·")[0].trim()} (%)`, a: "right" },
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
                      {pctG != null ? fmtN(pctG,1) : "â€”"} {pctGBadge && <Badge tag={pctGBadge.tag} small>{pctGBadge.label}</Badge>}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{mgV != null ? fmtN(mgV,1) : "â€”"}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{mlgV != null ? fmtN(mlgV,1) : "â€”"}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace" }}>{av.circs?.cintura != null ? fmtN(av.circs.cintura,0) : "â€”"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GrÃ¡ficos â€” apenas na tela, nÃ£o no PDF */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {charts.map(ch => ch.data.length > 0 && (
          <div key={ch.title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{ch.title}</div>
            <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 8 }}>{ch.unit}</div>
            <ChartWithBands data={ch.data} color={ch.color} bands={ch.bands} height={ch.height || 140} />
            {/* Legenda de classificaÃ§Ã£o */}
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
                    <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>VARIAÃ‡ÃƒO</div>
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

      {/* â”€â”€ Medidas Brutas: dobras e circunferÃªncias â”€â”€ */}
      <div className="no-print" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", marginBottom:20 }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", background:"var(--bg)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, fontSize:13, color:"var(--text)" }}>Medidas Brutas</span>
          <span style={{ fontSize:11, color:"var(--muted)" }}>Dobras (mm) Â· CircunferÃªncias (cm)</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
            <thead>
              <tr style={{ background:"var(--bg)" }}>
                <th style={{ padding:"8px 14px", textAlign:"left", fontSize:10.5, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid var(--border)", whiteSpace:"nowrap", position:"sticky", left:0, background:"var(--bg)", zIndex:2 }}>Medida</th>
                {avs.map((av, idx) => {
                  const isLast = idx === avs.length - 1;
                  return (
                    <th key={av.id} style={{ padding:"8px 10px", textAlign:"center", fontSize:10.5, fontWeight:isLast?800:600, color:isLast?"var(--accent)":"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid var(--border)", whiteSpace:"nowrap", background:isLast?"rgba(37,99,235,0.03)":"var(--bg)" }}>
                      {_fmtData(av.data)}{isLast&&<span style={{ display:"block", fontSize:8, color:"var(--accent)", textTransform:"uppercase" }}>atual</span>}
                    </th>
                  );
                })}
                {avs.length > 1 && <th style={{ padding:"8px 10px", textAlign:"center", fontSize:10.5, fontWeight:700, color:"var(--muted)", borderBottom:"1px solid var(--border)", whiteSpace:"nowrap" }}>Î” ant.</th>}
              </tr>
            </thead>
            <tbody>
              {[
                {n:1,key:"tricipital",   label:"Tricipital"},
                {n:2,key:"biceps",        label:"BÃ­ceps"},
                {n:3,key:"subescapular",  label:"Subescapular"},
                {n:4,key:"axilar",        label:"Axilar mÃ©dia"},
                {n:5,key:"suprailÃ­aca",   label:"SuprailÃ­aca"},
                {n:6,key:"supraespinal",  label:"Supraespinal"},
                {n:7,key:"abdominal",     label:"Abdominal"},
                {n:8,key:"coxa",          label:"Coxa anterior"},
                {n:9,key:"panturrilha",   label:"Panturrilha"},
              ].reduce((acc, d) => {
                const vals = avs.map(av => av.dobras?.[d.key] ?? null);
                if (vals.every(v => v == null)) return acc;
                const vL = vals[vals.length-1], vP = vals.length >= 2 ? vals[vals.length-2] : null;
                acc.push({...d, vals, delta: vL != null && vP != null ? vL - vP : null});
                return acc;
              }, []).map((d, i) => (
                <React.Fragment key={d.key}>
                  {i === 0 && <tr><td colSpan={99} style={{ padding:"6px 14px 3px", background:"rgba(180,83,9,0.06)", fontSize:9.5, fontWeight:700, color:"rgba(180,83,9,0.85)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Dobras cutÃ¢neas</td></tr>}
                  <tr style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"6px 14px", fontWeight:600, whiteSpace:"nowrap", position:"sticky", left:0, background:"var(--surface)", zIndex:1 }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                        <span style={{ width:18, height:18, borderRadius:"50%", background:"rgba(180,83,9,0.88)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"white", fontFamily:"monospace", fontSize:8, fontWeight:700, flexShrink:0 }}>{d.n}</span>
                        {d.label}
                      </span>
                    </td>
                    {d.vals.map((v, idx) => (
                      <td key={idx} style={{ padding:"6px 10px", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", background:idx===d.vals.length-1?"rgba(37,99,235,0.03)":"transparent" }}>
                        {v != null ? fmtN(v,1) : <span style={{ color:"var(--muted)" }}>â€”</span>}
                      </td>
                    ))}
                    {avs.length > 1 && (
                      <td style={{ padding:"6px 10px", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontWeight:600, color:d.delta==null?"var(--muted)":d.delta<-0.05?"#16a34a":d.delta>0.05?"#dc2626":"#888" }}>
                        {d.delta==null?"â€”":(d.delta>0?"+":"")+fmtN(d.delta,1)}
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              ))}
              {[
                {n:"A",key:"torax",          label:"TÃ³rax"},
                {n:"B",key:"braco",           label:"BraÃ§o relaxado"},
                {n:"C",key:"braco_contraido", label:"BraÃ§o contraÃ­do"},
                {n:"D",key:"cintura",         label:"Cintura"},
                {n:"E",key:"abdomen",         label:"AbdÃ´men"},
                {n:"F",key:"quadril",         label:"Quadril"},
                {n:"G",key:"coxa",            label:"Coxa"},
                {n:"H",key:"panturrilha",     label:"Panturrilha"},
              ].reduce((acc, c) => {
                const vals = avs.map(av => av.circs?.[c.key] ?? null);
                if (vals.every(v => v == null)) return acc;
                const vL = vals[vals.length-1], vP = vals.length >= 2 ? vals[vals.length-2] : null;
                acc.push({...c, vals, delta: vL != null && vP != null ? vL - vP : null});
                return acc;
              }, []).map((c, i) => (
                <React.Fragment key={c.key}>
                  {i === 0 && <tr><td colSpan={99} style={{ padding:"6px 14px 3px", background:"rgba(37,99,235,0.06)", fontSize:9.5, fontWeight:700, color:"rgba(37,99,235,0.8)", textTransform:"uppercase", letterSpacing:"0.08em" }}>CircunferÃªncias</td></tr>}
                  <tr style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"6px 14px", fontWeight:600, whiteSpace:"nowrap", position:"sticky", left:0, background:"var(--surface)", zIndex:1 }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                        <span style={{ width:18, height:18, borderRadius:3, background:"#2563eb", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"white", fontFamily:"monospace", fontSize:8, fontWeight:700, flexShrink:0 }}>{c.n}</span>
                        {c.label}
                      </span>
                    </td>
                    {c.vals.map((v, idx) => (
                      <td key={idx} style={{ padding:"6px 10px", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", background:idx===c.vals.length-1?"rgba(37,99,235,0.03)":"transparent" }}>
                        {v != null ? fmtN(v,1) : <span style={{ color:"var(--muted)" }}>â€”</span>}
                      </td>
                    ))}
                    {avs.length > 1 && (
                      <td style={{ padding:"6px 10px", textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontWeight:600, color:c.delta==null?"var(--muted)":c.delta<-0.05?"#16a34a":c.delta>0.05?"#dc2626":"#888" }}>
                        {c.delta==null?"â€”":(c.delta>0?"+":"")+fmtN(c.delta,1)}
                      </td>
                    )}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RodapÃ© com notas cientÃ­ficas â€” apenas na tela */}
      <div className="no-print" style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}><sup>Â¹</sup> Faixa de peso ideal calculada a partir da altura e dos valores limites do IMC de eutrofia (IMC 18,5â€“24,9 kg/mÂ²).</div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}><sup>Â²</sup> IMC avaliado conforme classificaÃ§Ãµes da OMS (2006). Para idosos (â‰¥60 anos), aplicada a classificaÃ§Ã£o de Lipschitz (1994).</div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>Massa Magra = Massa Livre de Gordura no modelo bicompartimental utilizado. Massa Residual estimada por WÃ¼rch (1973).</div>
        <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>Protocolo de %G: {protoLabel}. ClassificaÃ§Ãµes de adiposidade por Lohman (1992).</div>
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
      // MigraÃ§Ã£o: lÃª chave antiga, copia pra nova
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
    { id: "avaliacoes", label: `AvaliaÃ§Ãµes${avCount > 0 ? ` (${avCount})` : ""}` },
    { id: "historico",  label: "HistÃ³rico" },
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
              {patient.sexo === "F" ? "Feminino" : "Masculino"} Â· {idade} anos Â· {patient.objetivo}
            </div>
          </div>
          <Btn small onClick={openNewAv}>+ Nova avaliaÃ§Ã£o</Btn>
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
            }}>{isNewAv ? "Nova avaliaÃ§Ã£o" : `AvaliaÃ§Ã£o ${_fmtData(activeAv?.data)}`}</button>
          )}
        </div>
      </div>

      {/* ConteÃºdo */}
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
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>âš ï¸ Alterar protocolo de referÃªncia</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 22 }}>
              O grÃ¡fico de <strong>% de gordura</strong> no HistÃ³rico passarÃ¡ a usar:
              <div style={{ margin: "10px 0", padding: "10px 14px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>DE</div>
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{PROTO_LABELS[protoAlert.from]}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", margin: "8px 0 4px" }}>PARA</div>
                <div style={{ fontWeight: 700, color: "var(--accent)" }}>{PROTO_LABELS[protoAlert.to]}</div>
              </div>
              Isso pode alterar a aparÃªncia da curva evolutiva. As medidas brutas permanecem inalteradas.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setProtoAlert(null)}>Cancelar</Btn>
              <Btn onClick={confirmProtoChange}>Confirmar alteraÃ§Ã£o</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { PatientPanel, PatientView });
