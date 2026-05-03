# Antropo — Sistema de Avaliação Antropométrica Nutricional

## Visão geral

Aplicação de uso clínico para registro e análise de avaliações antropométricas de pacientes em consultório de Nutrição. O sistema permite cadastrar pacientes, registrar medidas (peso, altura, circunferências, dobras cutâneas), calcular composição corporal por múltiplos protocolos validados e acompanhar a evolução longitudinal do paciente.

**Usuário final**: nutricionista clínico (perfil único — aplicação monousuário, uso local).

**Público-alvo das avaliações**: adultos saudáveis. Protocolos pediátricos (Slaughter, Boileau) e de atletas de elite são escopo futuro.

## Stack atual

- **React 18.3.1** via CDN (unpkg) — sem build, sem npm, sem bundler
- **Babel Standalone 7.29.0** — transpila JSX no navegador via `<script type="text/babel">`
- **JavaScript vanilla (ES2020+)** — sem TypeScript, sem módulos ESM
- **localStorage** — persistência local (chaves `antropo_patients`, `antropo_avaliacoes`, `antropo_v2`, `antropo_proto_<patient_id>`). Há migração transparente das chaves antigas `zapantro_*` na primeira leitura.
- **CSS variables** — sistema de temas dinâmico (3 paletas: Clinical Blue, Warm Amber, Midnight)
- **DM Sans + JetBrains Mono** via Google Fonts

**Não há**: package.json, node_modules, build step, transpilação prévia, testes automatizados, backend, banco de dados.

**Como rodar localmente**: abrir `Antropo.html` em qualquer navegador moderno. Idealmente via servidor estático local (`python -m http.server 8000`) para evitar bloqueios de CORS em alguns navegadores.

## Estrutura de arquivos

```
projeto/
├── CLAUDE.md                  # este arquivo
├── FORMULAS.md                # referência científica das equações (FONTE ÚNICA DE VERDADE)
├── COMO-COMECAR.md            # instruções de bootstrap (parcialmente desatualizado — descrevia stack Python)
├── Antropo.html               # entry point: monta App, PatientDrawer, CentralEmpty, hooks de print
├── data.js                    # MOCK_PATIENTS, MOCK_AVALIACOES + ENGINE COMPLETA DE CÁLCULOS
├── components_v2.jsx          # design system: THEMES_V2, Badge, Avatar, TopBar, Btn, Card, Field, Select, InfoTip, Empty, fmtN
├── AnatomyFigure.jsx          # figura anatômica clicável (mapa das dobras/circunferências)
├── PatientPanel.jsx           # painel esquerdo (lista de pacientes + busca + ConfirmDialog)
├── PatientView.jsx            # painel direito (1.521 linhas) — Tabs: Avaliações, Form, Histórico, PrintReport
│
└── [LEGADO — não carregados pelo HTML, decidir se manter ou remover]
    ├── PacientesPage.jsx      # lista de pacientes da v1 (substituída por PatientPanel)
    ├── AvaliacaoPage.jsx      # form de avaliação da v1 (substituído por AvaliacaoFormTab dentro de PatientView)
    └── HistoricoPage.jsx      # histórico da v1 (substituído por HistoricoTab dentro de PatientView)
```

### Ordem de carregamento (importa)

`Antropo.html` carrega os scripts nesta ordem fixa, e cada arquivo depende dos globais expostos pelos anteriores:

1. `data.js` → expõe engine de cálculos e mocks
2. `components_v2.jsx` → expõe design system (depende de `data.js` indiretamente via `fmtN`)
3. `AnatomyFigure.jsx` → expõe figura anatômica
4. `PatientPanel.jsx` → expõe lista de pacientes (depende dos componentes do design system + cálculos de IMC)
5. `PatientView.jsx` → expõe painel direito (depende de tudo acima)
6. Bloco inline final no HTML → define `App` e renderiza `<App />` na raiz

Mexer nessa ordem quebra o app silenciosamente.

## Arquitetura — como os arquivos se conversam

Não há `import`/`export` ESM. A "API pública" de cada arquivo é exposta via `Object.assign(window, { ... })` no final do arquivo. Exemplos:

```js
// final de data.js
Object.assign(window, {
  MOCK_PATIENTS, MOCK_AVALIACOES,
  calcIdade, fmt, fmtData,
  calcIMC, classIMC,
  calcJP3, calcPetroski, /* ... */ calcularTudo,
});

// final de components_v2.jsx
Object.assign(window, {
  THEMES_V2, applyTheme, Badge, Avatar, TopBar, Btn, Card,
  Field, Select, fmtN, Empty, InfoTip, TAG_COLORS, _fmtData,
});
```

Consequência: **todo identificador de função/componente compartilhado é global**. Renomear `calcJP3` quebra `PatientView.jsx`. Antes de renomear qualquer coisa exposta no `Object.assign`, busque por todas as ocorrências em todos os `.jsx` e no HTML.

## Princípios de arquitetura (não negociáveis)

1. **Separação estrita entre cálculo e interface.** Toda fórmula mora em `data.js` como função pura — recebe parâmetros numéricos, retorna valores. Nenhuma chamada a hooks do React, nenhum `setState`, nenhum acesso ao DOM dentro dessas funções. Isso é o que permite testar matematicamente o sistema (mesmo que os testes hoje sejam manuais).

2. **Só persista medidas brutas, nunca resultados calculados.** O localStorage guarda peso, altura, dobras (mm), circunferências (cm) e dados cadastrais do paciente. Todos os derivados (%G, IMC, MG, MLG, RCQ, etc.) são calculados on-the-fly a cada render via `calcularTudo()`. Motivos: (a) se descobrirmos um erro numa fórmula, basta corrigir o código e os históricos passam a refletir o cálculo correto, (b) adicionar protocolos novos não exige migração de dados, (c) fidelidade científica — o dado primário é a medida, não a estimativa.

3. **Cada protocolo é uma função independente.** `calcJP3`, `calcPetroski`, `calcGuedes`, `calcFaulkner`, `calcDW`, `calcCarterDC` recebem `(sexo, dobras, idade)` e retornam densidade corporal (g/cm³). `calcFaulkner` é a exceção: retorna %G diretamente. Isso permite rodar N protocolos sobre o mesmo paciente e mostrar lado a lado.

4. **Conversão densidade → %G é responsabilidade separada.** Os protocolos retornam densidade. As funções `siri(dc)` e `brozek(dc)` aplicam a conversão. A UI escolhe qual usar.

5. **Integridade histórica.** Avaliações passadas registradas no localStorage não devem ser editadas silenciosamente. A UI permite editar uma avaliação durante a sessão de registro, mas não deve haver fluxo de "rerregravação retroativa" sem confirmação explícita.

6. **Sem prescrição clínica.** Este sistema calcula indicadores antropométricos. Interpretação clínica, prescrição de plano alimentar, recomendações de macro/micronutrientes, decisão sobre conduta — tudo isso é exclusivo do nutricionista. O sistema mostra classificação oficial (OMS, Frisancho, Ashwell, Lipschitz) ao lado de cada indicador, mas não toma decisão clínica.

## Convenções de código

- **Idioma**: nomes de funções e variáveis em **português abreviado** seguindo o padrão já estabelecido (`calcIMC`, `classPctG`, `fmtN`, `MOCK_PATIENTS`). UI, comentários, mensagens, labels todos em **português**. Termos técnicos consagrados mantêm grafia consagrada (`dobras`, `circs`, `cintura`, `quadril`, `subescapular`, `suprailíaca`).
- **Componentes React**: PascalCase (`PatientPanel`, `Badge`, `AvaliacaoFormTab`).
- **Funções utilitárias**: camelCase (`calcularTudo`, `fmtN`, `applyTheme`).
- **Constantes**: SCREAMING_SNAKE_CASE (`MOCK_PATIENTS`, `THEMES_V2`, `PROTO_LABELS`, `DOBRAS_LIST`).
- **Formatação numérica**: usar `fmtN(valor, casas)` para apresentação. Sempre vírgula como separador decimal (padrão BR).
- **Estilo**: inline styles via objeto JS. Não usar styled-components, Tailwind ou CSS modules. CSS global mora no `<style>` do HTML; tudo o mais é inline. Variáveis CSS (`var(--accent)`, `var(--text)`, `var(--surface)`, `var(--bg)`, `var(--muted)`, `var(--border)`) são a única forma de acessar o tema — não hardcode hex.
- **Datas**: armazenadas como `YYYY-MM-DD` (ISO). Exibidas via `_fmtData(s)` ou `fmtData(s)` que converte para `DD/MM/YYYY`.
- **IDs**: `Date.now()` para novos pacientes e avaliações. Não há colisão na prática (uso monousuário sequencial).
- **localStorage**: sempre via os helpers `lsGet(key, fallback)` e `lsSet(key, value)` definidos em `Antropo.html`. Nunca chamar `localStorage.getItem` direto — eles tratam o try/catch e a migração das chaves antigas `zapantro_*`.

## Domínio — onde consultar as fórmulas

**Sempre consulte `FORMULAS.md` antes de implementar ou modificar qualquer cálculo.** Esse arquivo contém todas as equações, suas referências originais, constantes exatas, faixas de aplicação (idade, sexo) e classificações.

Se uma fórmula no `FORMULAS.md` tiver observação de "⚠️ validar coeficientes", pare e pergunte ao usuário antes de implementar — coeficientes de regressão variam entre reproduções secundárias da literatura, e erro aqui significa laudo clínico incorreto.

### Protocolos de composição corporal já implementados em `data.js`

| Protocolo | Função | Retorna | Status na UI |
|---|---|---|---|
| Jackson & Pollock 3 dobras | `calcJP3` | DC (g/cm³) | Visível |
| Jackson & Pollock 7 dobras | `calcJP7` | DC | Implementado mas oculto da UI (requer dobra peitoral, decisão clínica) |
| Petroski (1995) | `calcPetroski` | DC | Visível |
| Guedes (1994) | `calcGuedes` | DC | Visível |
| Faulkner (1968) | `calcFaulkner` | %G direto | Visível |
| Durnin & Womersley (1974) | `calcDW` | DC | Visível |
| Carter (1982) — 6 dobras ISAK | `calcCarterDC` | DC | Visível |

Conversões DC → %G: `siri(dc)`, `brozek(dc)`.

### Indicadores adicionais já implementados em `data.js`

- **IMC + classificação**: `calcIMC`, `classIMC` (OMS adultos < 60 anos, Lipschitz para ≥ 60)
- **Razões**: `calcRCQ`/`classRCQ`, `calcRCE`/`classRCE`, `calcIC`, `calcIAC`
- **Braço**: `calcCMB`, `calcAMB`, `calcAMBc`
- **Massa muscular Lee (2000)**: `calcLee`
- **Massa residual Würch (1973)**: `calcWurch`
- **TMB**: `calcHB` (Harris-Benedict), `calcMifflin`, `calcCunningham`
- **Peso ideal**: `calcPIIMC`, `calcLorentz`, `calcDevine`, `calcFaixaPesoIdeal`
- **Soma ISAK 8 dobras**: `calcISAK8`

A função `calcularTudo(peso, altura, sexo, idade, dobras, circs)` é o agregador — chama todos os protocolos e indicadores e devolve um objeto único com todos os resultados.

## Validação manual de fórmulas

Sem framework de testes hoje. Para validar uma fórmula nova ou modificada:

1. Abrir `Antropo.html` em navegador.
2. Abrir DevTools → Console.
3. Chamar a função diretamente. Exemplo:
   ```js
   calcJP3("F", { tricipital: 22, "suprailíaca": 20, coxa: 28 }, 35)
   // → DC esperada
   siri(0.0378)
   // → %G esperada ≈ 26.5
   ```
4. Comparar com os casos de validação na seção 10 de `FORMULAS.md`.

Adicionar suite de testes automatizados (Vitest standalone ou Jest com Babel parser) é uma evolução natural quando o escopo de cálculos crescer — fica registrado como item de roadmap.

## Print / exportação de PDF

`PatientView.jsx` define um componente `PrintReport`. O HTML tem CSS dedicado em `@media print` mais hooks `beforeprint`/`afterprint` em JS para sobrescrever inline styles do React (height: 100vh, overflow: hidden) que quebrariam o layout impresso. Mexer nessa parte é sensível — qualquer mudança em padding, height, overflow do `<App>` ou dos painéis precisa ser testada com Ctrl+P.

## Tema visual

`THEMES_V2` em `components_v2.jsx` define 3 paletas. `applyTheme(key)` injeta as variáveis CSV no `:root`. O tema selecionado fica em `tweaks.tema` no estado do `App` (não persiste entre sessões — decisão consciente, é cosmético). O default está em `TWEAK_DEFAULTS` no HTML.

## Arquivos legados (decidir destino)

`PacientesPage.jsx`, `AvaliacaoPage.jsx`, `HistoricoPage.jsx` são da v1 antes do refactor para o layout de painel duplo. Não são carregados pelo HTML atual. Estão na pasta provavelmente porque foram esquecidos. Decisão pendente: deletar ou mover para `legado/`. **Antes de reaproveitar trechos**, verificar se o código já não foi reescrito dentro de `PatientView.jsx`.

## O que Claude Code DEVE fazer

- Ler `FORMULAS.md` antes de tocar em qualquer função de cálculo em `data.js`.
- Buscar todas as ocorrências de um identificador antes de renomear (são globais via `window`).
- Manter o padrão de `Object.assign(window, { ... })` no final de cada arquivo `.jsx`.
- Manter inline styles + CSS variables. Nada de novas tecnologias de styling sem alinhamento.
- Preservar a estrutura de localStorage (chaves `antropo_patients`, `antropo_avaliacoes`, `antropo_v2`, `antropo_proto_<id>`). Mudanças no schema dos dados quebram dados já registrados em produção (uso real do nutricionista). A migração das chaves antigas `zapantro_*` é transparente — não remover esse fallback até confirmar que todos os ambientes migraram.
- Pedir esclarecimento quando uma fórmula tiver variantes na literatura.
- Validar mudanças em cálculos contra os casos da seção 10 do `FORMULAS.md` no console do navegador.
- Testar layout impresso (Ctrl+P) ao mexer em estrutura de containers, height, overflow ou no `PrintReport`.

## O que Claude Code NÃO deve fazer

- Migrar para React com build (Vite/Next/CRA), introduzir TypeScript, npm, ESM ou bundler **sem alinhamento explícito**. A escolha por CDN+Babel Standalone é deliberada (zero infra, distribuível como pasta).
- Persistir valores calculados (%G, IMC, MG) no localStorage — só medidas brutas.
- Implementar uma fórmula sem consultar `FORMULAS.md` e citar a referência no comentário da função.
- Assumir valores padrão para medidas ausentes. Se falta uma dobra para um protocolo, a função do protocolo retorna `null` — nunca preenche com zero ou média populacional. A UI exibe "—" para `null`.
- Criar fluxo que altere medidas já registradas sem confirmação explícita do usuário (integridade histórica).
- Mostrar dados de pacientes em `console.log` de debug que sobrevivam ao commit.
- Implementar lógica de prescrição nutricional, recomendação de macro/micros, ou cálculo de plano alimentar. Esse sistema calcula indicadores antropométricos — interpretação é exclusiva do nutricionista.
- Adicionar dependência de runtime (analytics, Sentry, fonts adicionais, ícones) sem alinhamento — a aplicação é offline-first e clínica.

## Roadmap

**Curto prazo** (próximos incrementos típicos):
- Decisão sobre arquivos legados (`PacientesPage.jsx`, `AvaliacaoPage.jsx`, `HistoricoPage.jsx`).
- Atualizar `COMO-COMECAR.md` para refletir o stack atual (hoje descreve um projeto Python que nunca foi feito).
- Testes automatizados leves para a engine de cálculo (ex.: Vitest standalone via CDN, ou um simples HTML de teste que roda os casos do `FORMULAS.md`).

**Médio prazo**:
- Exportação de laudo em PDF mais sofisticada (hoje é via `window.print()`).
- Comparativo de fotos do paciente (upload + slider antes/depois).
- Backup/exportação dos dados do localStorage em JSON.

**Longo prazo** (eventual migração de stack):
- Se o sistema crescer para multiusuário ou nuvem, o caminho natural é Vite + TypeScript + Supabase (ou similar). A **separação cálculo × UI** garantida hoje torna essa migração viável: `data.js` vira um módulo TS quase sem alteração; localStorage vira chamada Supabase. Os princípios de arquitetura acima foram pensados para isso.

## Contexto do usuário

O nutricionista que usa este sistema é pós-graduando em Nutrição Clínica na USP e valoriza rigor científico. Todo resultado apresentado na interface deve vir acompanhado da classificação oficial (OMS, Frisancho, Ashwell, Lipschitz, etc.) e, quando relevante, da referência. Nenhuma fórmula "caixa-preta" — o sistema é uma ferramenta que apoia o raciocínio clínico, não o substitui.
