// ============================================================
// data.js — Mock data + engine de cálculos antropométricos
// Referência: FORMULAS.md
// ============================================================

const MOCK_PATIENTS = [
  { id: 7, nome: "Thalita Possmoser", nascimento: "1992-06-15", sexo: "F", telefone: "", objetivo: "Emagrecimento", ativo: true },
];

const MOCK_AVALIACOES = [
  // ── Thalita Possmoser ──────────────────────────────────────────
  {
    id: 7, paciente_id: 7, data: "2026-02-20", peso: 69.4, altura: 168,
    dobras: { tricipital: 13.0, subescapular: 15.0, biceps: 4.0, axilar: 8.0, suprailíaca: 10.0, supraespinal: 9.0, abdominal: 14.0, coxa: 26.0, panturrilha: 13.0 },
    circs: { torax: 95.1, cintura: 70.1, abdomen: 83.7, quadril: 105.4, braco: 27.8, braco_contraido: 28.4, coxa: 57.6, panturrilha: 38.4 }
  },
  {
    id: 8, paciente_id: 7, data: "2026-03-06", peso: 67.5, altura: 168,
    dobras: { tricipital: 14.0, subescapular: 14.0, biceps: 4.0, axilar: 7.5, suprailíaca: 8.8, supraespinal: 7.4, abdominal: 13.5, coxa: 25.0, panturrilha: 11.5 },
    circs: { torax: 93.6, cintura: 70.3, abdomen: 81.2, quadril: 103.8, braco: 27.2, braco_contraido: 28.4, coxa: 56.3, panturrilha: 38.0 }
  },
  {
    id: 9, paciente_id: 7, data: "2026-03-20", peso: 65.4, altura: 168,
    dobras: { tricipital: 11.0, subescapular: 13.0, biceps: 6.0, axilar: 7.0, suprailíaca: 9.0, supraespinal: 6.5, abdominal: 12.5, coxa: 23.0, panturrilha: 11.0 },
    circs: { torax: 92.5, cintura: 68.8, abdomen: 80.6, quadril: 103.6, braco: 27.0, braco_contraido: 27.3, coxa: 55.7, panturrilha: 37.5 }
  },
  {
    id: 10, paciente_id: 7, data: "2026-04-18", peso: 64.3, altura: 168,
    dobras: { tricipital: 9.0, subescapular: 11.0, biceps: 3.5, axilar: 6.0, suprailíaca: 7.0, supraespinal: 6.0, abdominal: 11.0, coxa: 23.0, panturrilha: 12.5 },
    circs: { torax: 92.2, cintura: 66.5, abdomen: 78.7, quadril: 100.0, braco: 26.1, braco_contraido: 27.7, coxa: 55.1, panturrilha: 37.4 }
  },
];

// ===== UTILITÁRIOS =====
const fmt = (v, decimais = 1) => v != null && !isNaN(v) ? v.toFixed(decimais).replace('.', ',') : "—";
const fmtData = (s) => s ? s.split("-").reverse().join("/") : "—";
const calcIdade = (nascimento) => {
  const hoje = new Date();
  const nasc = new Date(nascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
};

// ===== IMC =====
const calcIMC = (peso, altura_cm) => peso / (altura_cm / 100) ** 2;
const classIMC = (imc, idade) => {
  if (idade >= 60) {
    if (imc < 22) return { label: "Baixo peso", tag: "blue" };
    if (imc <= 27) return { label: "Eutrofia", tag: "green" };
    return { label: "Sobrepeso", tag: "yellow" };
  }
  if (imc < 18.5) return { label: "Baixo peso", tag: "blue" };
  if (imc < 25)   return { label: "Eutrofia", tag: "green" };
  if (imc < 30)   return { label: "Sobrepeso", tag: "yellow" };
  if (imc < 35)   return { label: "Obesidade I", tag: "orange" };
  if (imc < 40)   return { label: "Obesidade II", tag: "red" };
  return           { label: "Obesidade III", tag: "red" };
};

// ===== HELPER: COMPOSIÇÃO CORPORAL POR PROTOCOLO =====
// Calcula MG, MLG e %MLG a partir do %G de um protocolo específico
const mkComp = (pctG, peso) => {
  if (pctG == null || isNaN(pctG) || !peso) return { pctG: null, mg: null, mlg: null, pctMLG: null };
  const mg  = peso * pctG / 100;
  const mlg = peso - mg;
  return { pctG, mg, mlg, pctMLG: 100 - pctG };
};

// ===== MASSA RESIDUAL — Würch (1973) =====
// Referência: Würch A. L'homme moyen. Biotypologie. 1973;34:89-122.
// Percentuais populacionais: Homens = 24,1% | Mulheres = 20,9% do peso corporal
const calcWurch = (peso, sexo) =>
  peso != null ? peso * (sexo === "M" ? 0.241 : 0.209) : null;

// ===== PROTOCOLOS (retornam DC g/cm³) =====
const calcJP3 = (sexo, d, idade) => {
  if (sexo === "M") {
    if (!d.peitoral || !d.abdominal || !d.coxa) return null;
    const s = d.peitoral + d.abdominal + d.coxa;
    return 1.10938 - 0.0008267 * s + 0.0000016 * s ** 2 - 0.0002574 * idade;
  }
  if (!d.tricipital || !d["suprailíaca"] || !d.coxa) return null;
  const s = d.tricipital + d["suprailíaca"] + d.coxa;
  return 1.0994921 - 0.0009929 * s + 0.0000023 * s ** 2 - 0.0001392 * idade;
};

// JP7 mantido internamente; removido da UI (requer dobra peitoral)
const calcJP7 = (sexo, d, idade) => {
  if (!d.subescapular || !d.tricipital || !d.peitoral || !d.axilar || !d["suprailíaca"] || !d.abdominal || !d.coxa) return null;
  const s = d.subescapular + d.tricipital + d.peitoral + d.axilar + d["suprailíaca"] + d.abdominal + d.coxa;
  if (sexo === "M") return 1.112 - 0.00043499 * s + 0.00000055 * s ** 2 - 0.00028826 * idade;
  return 1.097 - 0.00046971 * s + 0.00000056 * s ** 2 - 0.00012828 * idade;
};

// Petroski (1995) — equações originais da tese UFSM validadas
// Homens (18–66 anos): subescapular + tricipital + suprailíaca + panturrilha — forma quadrática
// Mulheres (18–51 anos): axilar média + suprailíaca + coxa + panturrilha — forma logarítmica
const calcPetroski = (sexo, d, idade) => {
  if (sexo === "M") {
    if (!d.subescapular || !d.tricipital || !d["suprailíaca"] || !d.panturrilha) return null;
    const s = d.subescapular + d.tricipital + d["suprailíaca"] + d.panturrilha;
    return 1.10726863 - 0.00081201 * s + 0.00000212 * s ** 2 - 0.00041761 * idade;
  }
  if (!d.axilar || !d["suprailíaca"] || !d.coxa || !d.panturrilha) return null;
  const s = d.axilar + d["suprailíaca"] + d.coxa + d.panturrilha;
  return 1.19547130 - 0.07513507 * Math.log10(s) - 0.00041072 * idade;
};

const calcGuedes = (sexo, d) => {
  if (sexo === "M") {
    if (!d.tricipital || !d["suprailíaca"] || !d.abdominal) return null;
    return 1.17136 - 0.06706 * Math.log10(d.tricipital + d["suprailíaca"] + d.abdominal);
  }
  if (!d.coxa || !d["suprailíaca"] || !d.subescapular) return null;
  return 1.16650 - 0.07063 * Math.log10(d.coxa + d["suprailíaca"] + d.subescapular);
};

// Faulkner: retorna %G diretamente (sem conversão via DC)
const calcFaulkner = (d) => {
  if (!d.tricipital || !d.subescapular || !d["suprailíaca"] || !d.abdominal) return null;
  return (d.tricipital + d.subescapular + d["suprailíaca"] + d.abdominal) * 0.153 + 5.783;
};

const DW_CONSTS = {
  M: [{max:19,C:1.1620,M:0.0630},{max:29,C:1.1631,M:0.0632},{max:39,C:1.1422,M:0.0544},{max:49,C:1.1620,M:0.0700},{max:999,C:1.1715,M:0.0779}],
  F: [{max:19,C:1.1549,M:0.0678},{max:29,C:1.1599,M:0.0717},{max:39,C:1.1423,M:0.0632},{max:49,C:1.1333,M:0.0612},{max:999,C:1.1339,M:0.0645}],
};
const calcDW = (sexo, d, idade) => {
  if (!d.tricipital || !d.subescapular || !d["suprailíaca"]) return null;
  const s = (d.biceps || 0) + d.tricipital + d.subescapular + d["suprailíaca"];
  const row = DW_CONSTS[sexo]?.find(r => idade <= r.max);
  if (!row) return null;
  return row.C - row.M * Math.log10(s);
};

// ===== CONVERSÕES DC → %G =====
const siri   = (dc) => dc ? (4.95 / dc - 4.50) * 100 : null;
const brozek = (dc) => dc ? (4.57 / dc - 4.142) * 100 : null;

const classPctG = (pctG, sexo) => {
  if (pctG == null) return null;
  if (sexo === "M") {
    if (pctG < 6)  return { label: "Muito baixo", tag: "blue" };
    if (pctG < 14) return { label: "Atleta", tag: "green" };
    if (pctG < 18) return { label: "Boa forma", tag: "green" };
    if (pctG < 25) return { label: "Aceitável", tag: "yellow" };
    return          { label: "Obesidade", tag: "red" };
  }
  if (pctG < 14)  return { label: "Muito baixo", tag: "blue" };
  if (pctG < 21)  return { label: "Atleta", tag: "green" };
  if (pctG < 25)  return { label: "Boa forma", tag: "green" };
  if (pctG < 32)  return { label: "Aceitável", tag: "yellow" };
  return           { label: "Obesidade", tag: "red" };
};

// ===== RAZÕES =====
const calcRCQ = (c, q) => c && q ? c / q : null;
const classRCQ = (v, sexo) => {
  if (!v) return null;
  if (sexo === "M") {
    if (v < 0.90) return { label: "Baixo risco", tag: "green" };
    if (v < 1.00) return { label: "Risco moderado", tag: "yellow" };
    return { label: "Risco alto", tag: "red" };
  }
  if (v < 0.80) return { label: "Baixo risco", tag: "green" };
  if (v < 0.85) return { label: "Risco moderado", tag: "yellow" };
  return { label: "Risco alto", tag: "red" };
};
const calcRCE = (c, h) => c && h ? c / h : null;
const classRCE = (v) => {
  if (!v) return null;
  if (v < 0.40) return { label: "Magreza", tag: "blue" };
  if (v < 0.50) return { label: "Adequado", tag: "green" };
  if (v < 0.60) return { label: "Sobrepeso", tag: "yellow" };
  return { label: "Obesidade", tag: "red" };
};
const calcIC = (c, p, h) => c && p && h ? (c / 100) / (0.109 * Math.sqrt(p / (h / 100))) : null;
const calcIAC = (q, h) => q && h ? q / (h / 100) ** 1.5 - 18 : null;

// ===== BRAÇO =====
const calcCMB  = (cb, dct) => cb && dct ? cb - Math.PI * dct / 10 : null;
const calcAMB  = (cb, dct) => { const c = calcCMB(cb, dct); return c ? c ** 2 / (4 * Math.PI) : null; };
const calcAMBc = (amb, sexo) => amb ? amb - (sexo === "M" ? 10 : 6.5) : null;

// ===== MASSA MUSCULAR Lee (2000) =====
const calcLee = (h, c, d, sexo, idade) => {
  if (!c.braco || !c.coxa || !c.panturrilha || !d.tricipital) return null;
  const cbc = c.braco - Math.PI * d.tricipital / 10;
  const ccc = c.coxa - Math.PI * (d.coxa || 0) / 10;
  const cpc = c.panturrilha - Math.PI * (d.panturrilha || 0) / 10;
  return (h / 100) * (0.00744 * cbc ** 2 + 0.00088 * ccc ** 2 + 0.00441 * cpc ** 2) + 2.4 * (sexo === "M" ? 1 : 0) - 0.048 * idade + 7.8;
};

// ===== TMB =====
const calcHB        = (s, p, h, i) => s === "M" ? 88.362 + 13.397*p + 4.799*h - 5.677*i : 447.593 + 9.247*p + 3.098*h - 4.330*i;
const calcMifflin   = (s, p, h, i) => { const b = 10*p + 6.25*h - 5*i; return s === "M" ? b+5 : b-161; };
const calcCunningham = (mlg) => mlg ? 500 + 22 * mlg : null;

// ===== SOMA ISAK 8 DOBRAS =====
const calcISAK8 = (d) => {
  const keys = ["tricipital","subescapular","biceps","suprailíaca","supraespinal","abdominal","coxa","panturrilha"];
  if (keys.some(k => d[k] == null)) return null;
  return keys.reduce((sum, k) => sum + d[k], 0);
};

// ===== CARTER (1982) — 6 dobras ISAK =====
const calcCarterDC = (d) => {
  if (!d.tricipital || !d.subescapular || !d["suprailíaca"] || !d.supraespinal || !d.abdominal || !d.coxa) return null;
  const s6 = d.tricipital + d.subescapular + d["suprailíaca"] + d.supraespinal + d.abdominal + d.coxa;
  return 1.1765 - 0.0744 * Math.log10(s6);
};

// ===== PESO IDEAL =====
const calcPIIMC    = (h) => 22 * (h / 100) ** 2;
const calcLorentz  = (h, s) => s === "M" ? h - 100 - (h - 150) / 4 : h - 100 - (h - 150) / 2.5;
const calcDevine   = (h, s) => { const pol = h / 2.54; return s === "M" ? 50 + 2.3*(pol-60) : 45.5 + 2.3*(pol-60); };
// Faixa de peso eutrófico pelo IMC (18,5 a 24,9 kg/m²)
const calcFaixaPesoIdeal = (altura_cm) => {
  const h = altura_cm / 100;
  return [18.5 * h * h, 24.9 * h * h];
};

// ===== ENGINE PRINCIPAL =====
const calcularTudo = (peso, altura, sexo, idade, dobras, circs) => {
  const d = dobras || {};
  const c = circs || {};
  const imc = calcIMC(peso, altura);

  // Densidades
  const jp3dc    = calcJP3(sexo, d, idade);
  const jp7dc    = calcJP7(sexo, d, idade);
  const petdc    = calcPetroski(sexo, d, idade);
  const gueddc   = calcGuedes(sexo, d);
  const dwdc     = calcDW(sexo, d, idade);
  const faulk    = calcFaulkner(d);
  const carterDCv = calcCarterDC(d);

  // %G por protocolo
  const jp3siri    = siri(jp3dc);
  const jp3broz    = brozek(jp3dc);
  const jp7siri    = siri(jp7dc);
  const jp7broz    = brozek(jp7dc);
  const petsiri    = siri(petdc);
  const gueddsiri  = siri(gueddc);
  const dwsiri     = siri(dwdc);
  const carterSiri = siri(carterDCv);

  // Composição corporal por protocolo
  const jp3comp    = mkComp(jp3siri, peso);
  const petcomp    = mkComp(petsiri, peso);
  const guedcomp   = mkComp(gueddsiri, peso);
  const faulkcomp  = mkComp(faulk, peso);
  const dwcomp     = mkComp(dwsiri, peso);
  const cartercomp = mkComp(carterSiri, peso);

  // Massa Residual — Würch (1973)
  const wurch = calcWurch(peso, sexo);

  // Referência global (retro-compat)
  const pctG_ref = jp3siri ?? petsiri ?? faulk;
  const mg  = pctG_ref != null ? peso * (pctG_ref / 100) : null;
  const mlg = mg != null ? peso - mg : null;

  // Razões
  const rcq = calcRCQ(c.cintura, c.quadril);
  const rce = calcRCE(c.cintura, altura);
  const ic  = calcIC(c.cintura, peso, altura);
  const iac = calcIAC(c.quadril, altura);

  // Braço
  const cmb  = calcCMB(c.braco, d.tricipital);
  const amb  = calcAMB(c.braco, d.tricipital);
  const ambc = calcAMBc(amb, sexo);
  const mm   = calcLee(altura, c, d, sexo, idade);

  return {
    imc, classIMC: classIMC(imc, idade),
    jp3dc, jp7dc, petdc, gueddc, dwdc,
    jp3siri, jp3broz, jp7siri, jp7broz,
    petsiri, gueddsiri, faulk, dwsiri,
    carterDC: carterDCv, carterSiri,
    jp3comp, petcomp, guedcomp, faulkcomp, dwcomp, cartercomp,
    wurch,
    pctG_ref, mg, mlg,
    rcq, rce, ic, iac,
    cmb, amb, ambc, mm,
    hb:        calcHB(sexo, peso, altura, idade),
    mifflin:   calcMifflin(sexo, peso, altura, idade),
    cunning:   calcCunningham(mlg),
    piImc:         calcPIIMC(altura),
    piLorentz:     calcLorentz(altura, sexo),
    piDevine:      calcDevine(altura, sexo),
    faixaPesoIdeal: calcFaixaPesoIdeal(altura),
    isak8: calcISAK8(d),
  };
};

Object.assign(window, {
  MOCK_PATIENTS, MOCK_AVALIACOES,
  calcIdade, fmt, fmtData,
  calcIMC, classIMC,
  calcJP3, calcJP7, calcPetroski, calcGuedes, calcFaulkner, calcDW,
  siri, brozek, classPctG,
  calcRCQ, classRCQ, calcRCE, classRCE, calcIC, calcIAC,
  calcCMB, calcAMB, calcAMBc, calcLee,
  calcHB, calcMifflin, calcCunningham,
  calcPIIMC, calcLorentz, calcDevine, calcFaixaPesoIdeal,
  calcISAK8, calcCarterDC, calcWurch, mkComp,
  calcularTudo,
});
