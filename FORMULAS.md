# Referência científica das fórmulas antropométricas

Este documento é a fonte única de verdade para todas as equações implementadas no sistema. Antes de implementar qualquer cálculo, consulte aqui. Em caso de divergência entre o código e este arquivo, este arquivo prevalece até que seja explicitamente atualizado.

**Notação**: Σ = somatório das dobras (mm). DC = densidade corporal (g/cm³). %G = percentual de gordura corporal.

---

## 1. Protocolos de composição corporal (dobras cutâneas)

### 1.1 Jackson & Pollock 3 dobras

**Referência**: Jackson AS, Pollock ML. Generalized equations for predicting body density of men. Br J Nutr. 1978;40(3):497-504. / Jackson AS, Pollock ML, Ward A. Generalized equations for predicting body density of women. Med Sci Sports Exerc. 1980;12(3):175-82.

**Homens (18–61 anos)** — dobras: peitoral, abdominal, coxa

```
DC = 1.10938 − 0.0008267·Σ + 0.0000016·Σ² − 0.0002574·idade
```

**Mulheres (18–55 anos)** — dobras: tricipital, suprailíaca, coxa

```
DC = 1.0994921 − 0.0009929·Σ + 0.0000023·Σ² − 0.0001392·idade
```

**Faixa de aplicação**: adultos eutróficos a sobrepeso. Subestima %G em obesos (>30% G).

---

### 1.2 Jackson & Pollock 7 dobras

**Referência**: Jackson AS, Pollock ML (1978). Mesmas publicações de referência da versão 3 dobras.

**Dobras**: subescapular, tricipital, peitoral, axilar média, suprailíaca, abdominal, coxa

**Homens (18–61 anos)**

```
DC = 1.112 − 0.00043499·Σ + 0.00000055·Σ² − 0.00028826·idade
```

**Mulheres (18–55 anos)**

```
DC = 1.097 − 0.00046971·Σ + 0.00000056·Σ² − 0.00012828·idade
```

---

### 1.3 Petroski (protocolo brasileiro)

**Referência**: Petroski EL. Desenvolvimento e validação de equações generalizadas para a predição da composição corporal em adultos. Tese de Doutorado, UFSM, 1995.

Protocolo validado em população brasileira adulta. Preferência clínica no Brasil.

**Dobras (4 dobras)**: subescapular, tricipital, suprailíaca, panturrilha medial

**Homens (18–66 anos)**

```
DC = 1.10726863 − 0.00081201·Σ + 0.00000212·Σ² − 0.00041761·idade
```

**Mulheres (18–51 anos)** — axilar média, suprailíaca, coxa, panturrilha medial

```
DC = 1.19547130 − 0.07513507 · log₁₀(Σ) − 0.00041072 · idade
```

**Faixa de aplicação**: adultos brasileiros saudáveis. Não validado em gestantes, idosos >66 anos, ou atletas de alto rendimento.

---

### 1.4 Guedes

**Referência**: Guedes DP. Composição corporal: princípios, técnicas e aplicações. 2ª ed. Londrina: APEF, 1994.

Protocolo brasileiro com equações logarítmicas de 3 dobras.

**Homens** — dobras: tricipital, suprailíaca, abdominal

```
DC = 1.17136 − 0.06706 · log₁₀(Σ)
```

**Mulheres** — dobras: coxa, suprailíaca, subescapular

```
DC = 1.16650 − 0.07063 · log₁₀(Σ)
```

---

### 1.5 Faulkner

**Referência**: Faulkner JA. Physiology of swimming and diving. In: Falls H (ed). Exercise physiology. Baltimore: Academic Press, 1968. p.415-46.

Protocolo direto (retorna %G sem passar por densidade). Muito utilizado em avaliação de atletas e adeptos de atividade física regular.

**Ambos os sexos** — dobras: tricipital, subescapular, suprailíaca, abdominal

```
%G = (Σ · 0.153) + 5.783
```

**Nota**: como retorna %G diretamente, não requer conversão via Siri/Brozek.

---

### 1.6 Durnin & Womersley

**Referência**: Durnin JVGA, Womersley J. Body fat assessed from total body density and its estimation from skinfold thickness: measurements on 481 men and women aged from 16 to 72 years. Br J Nutr. 1974;32(1):77-97.

**Dobras**: bíceps, tríceps, subescapular, suprailíaca (somatório Σ)

Equação logarítmica com constantes dependentes de **sexo × faixa etária**:

```
DC = C − M · log₁₀(Σ)
```

**Tabela de constantes** (extraída da publicação original):

| Idade    | Sexo | C       | M       |
|----------|------|---------|---------|
| 17–19    | M    | 1.1620  | 0.0630  |
| 20–29    | M    | 1.1631  | 0.0632  |
| 30–39    | M    | 1.1422  | 0.0544  |
| 40–49    | M    | 1.1620  | 0.0700  |
| ≥50      | M    | 1.1715  | 0.0779  |
| 16–19    | F    | 1.1549  | 0.0678  |
| 20–29    | F    | 1.1599  | 0.0717  |
| 30–39    | F    | 1.1423  | 0.0632  |
| 40–49    | F    | 1.1333  | 0.0612  |
| ≥50      | F    | 1.1339  | 0.0645  |

---

## 2. Conversão densidade corporal → percentual de gordura

### 2.1 Siri

**Referência**: Siri WE. Body composition from fluid spaces and density: analysis of methods. In: Brožek J, Henschel A (eds). Techniques for measuring body composition. Washington: National Academy of Sciences, 1961. p.223-44.

```
%G = (4.95 / DC − 4.50) · 100
```

Equação padrão, mais usada em populações gerais.

### 2.2 Brozek

**Referência**: Brožek J, Grande F, Anderson JT, Keys A. Densitometric analysis of body composition: revision of some quantitative assumptions. Ann N Y Acad Sci. 1963;110:113-40.

```
%G = (4.57 / DC − 4.142) · 100
```

Preferida para populações magras e atletas; resultado levemente inferior ao de Siri na mesma densidade.

---

## 3. Massa gorda e massa livre de gordura

```
MG (kg)  = peso · (%G / 100)
MLG (kg) = peso − MG
```

---

## 4. IMC — Índice de Massa Corporal

**Referência**: WHO. Obesity: preventing and managing the global epidemic. WHO Technical Report Series 894. Geneva: WHO, 2000.

```
IMC = peso(kg) / altura(m)²
```

**Classificação OMS (adultos)**:

| IMC (kg/m²)   | Classificação        |
|---------------|----------------------|
| < 18.5        | Baixo peso           |
| 18.5 – 24.9   | Eutrofia             |
| 25.0 – 29.9   | Sobrepeso            |
| 30.0 – 34.9   | Obesidade grau I     |
| 35.0 – 39.9   | Obesidade grau II    |
| ≥ 40.0        | Obesidade grau III   |

**Classificação para idosos (≥60 anos)** — Lipschitz (1994):

| IMC (kg/m²)   | Classificação   |
|---------------|-----------------|
| < 22          | Baixo peso      |
| 22 – 27       | Eutrofia        |
| > 27          | Sobrepeso       |

---

## 5. Peso ideal

### 5.1 Método IMC-alvo (recomendado clinicamente)

```
PI = IMC_alvo · altura(m)²
```

IMC-alvo padrão: 22 kg/m² (ponto médio da eutrofia).

### 5.2 Lorentz

```
Homens:    PI = altura(cm) − 100 − [(altura(cm) − 150) / 4]
Mulheres:  PI = altura(cm) − 100 − [(altura(cm) − 150) / 2.5]
```

### 5.3 Devine

**Referência**: Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-5.

```
Homens:    PI (kg) = 50.0 + 2.3 · (altura_polegadas − 60)
Mulheres:  PI (kg) = 45.5 + 2.3 · (altura_polegadas − 60)
```

Onde `altura_polegadas = altura(cm) / 2.54` e o termo subtrai 60 polegadas (5 pés).

---

## 6. Razões antropométricas

### 6.1 RCQ — Relação Cintura-Quadril

```
RCQ = circ_cintura(cm) / circ_quadril(cm)
```

**Classificação OMS** — risco de doenças metabólicas:

| Sexo     | Baixo risco | Risco moderado | Risco alto |
|----------|-------------|----------------|------------|
| Homens   | < 0.90      | 0.90 – 0.99    | ≥ 1.00     |
| Mulheres | < 0.80      | 0.80 – 0.84    | ≥ 0.85     |

### 6.2 RCE — Relação Cintura-Estatura

**Referência**: Ashwell M, Gunn P, Gibson S. Waist-to-height ratio is a better screening tool than waist circumference and BMI for adult cardiometabolic risk factors: systematic review and meta-analysis. Obes Rev. 2012;13(3):275-86.

```
RCE = circ_cintura(cm) / estatura(cm)
```

**Classificação (Ashwell et al. 2012)**:

| RCE           | Classificação                            |
|---------------|-------------------------------------------|
| < 0.40        | Magreza                                   |
| 0.40 – 0.49   | Adequado                                  |
| 0.50 – 0.59   | Sobrepeso / risco cardiometabólico        |
| ≥ 0.60        | Obesidade / risco cardiometabólico muito alto |

Ponto de corte universal recomendado: **0.5** ("keep your waist less than half your height").

### 6.3 Índice de Conicidade (IC)

**Referência**: Valdez R. A simple model-based index of abdominal adiposity. J Clin Epidemiol. 1991;44(9):955-6.

```
IC = circ_cintura(m) / [0.109 · √(peso(kg) / altura(m))]
```

Atenção à unidade: cintura em metros.

**Pontos de corte de risco** (Pitanga & Lessa, 2005 — amostra brasileira):

- Homens: > 1.25
- Mulheres: > 1.18

### 6.4 IAC — Índice de Adiposidade Corporal

**Referência**: Bergman RN, Stefanovski D, Buchanan TA, et al. A better index of body adiposity. Obesity. 2011;19(5):1083-9.

```
IAC = [circ_quadril(cm) / altura(m)^1.5] − 18
```

Estima %G sem necessidade de dobras cutâneas. Útil em situações onde dobras não são viáveis.

---

## 7. CMB e AMB — Circunferência e Área Muscular do Braço

### 7.1 CMB

**Referência**: Frisancho AR. New norms of upper limb fat and muscle areas for assessment of nutritional status. Am J Clin Nutr. 1981;34(11):2540-5.

```
CMB (cm) = CB(cm) − [π · DCT(mm) / 10]
```

Onde CB = circunferência do braço relaxado, DCT = dobra cutânea tricipital.

### 7.2 AMB

```
AMB (cm²) = [CB(cm) − π · DCT(mm) / 10]² / (4π)
```

### 7.3 AMB corrigida (óssea)

**Referência**: Heymsfield SB, McManus C, Smith J, Stevens V, Nixon DW. Anthropometric measurement of muscle mass: revised equations for calculating bone-free arm muscle area. Am J Clin Nutr. 1982;36(4):680-90.

```
Homens:    AMBc = AMB − 10.0
Mulheres:  AMBc = AMB − 6.5
```

**Classificação Frisancho (1981)** — percentis por idade e sexo. Tabelas completas serão implementadas em `src/indicadores/braco.py` como dicionário lookup.

Classificação resumida:

| Percentil | Classificação              |
|-----------|-----------------------------|
| < p5      | Desnutrição grave           |
| p5 – p15  | Desnutrição moderada/leve   |
| p15 – p85 | Eutrofia                    |
| p85 – p95 | Sobrepeso                   |
| > p95     | Obesidade                   |

---

## 8. Massa muscular — Lee (2000)

**Referência**: Lee RC, Wang Z, Heo M, Ross R, Janssen I, Heymsfield SB. Total-body skeletal muscle mass: development and cross-validation of anthropometric prediction models. Am J Clin Nutr. 2000;72(3):796-803.

```
MM (kg) = altura(m) · [0.00744·CBc² + 0.00088·CCc² + 0.00441·CPc²] 
          + 2.4·sexo − 0.048·idade + etnia + 7.8
```

Onde:
- **CBc** = circunferência corrigida do braço relaxado = CB(cm) − π·DCT(mm)/10
- **CCc** = circunferência corrigida da coxa = circ_coxa(cm) − π·dobra_coxa(mm)/10
- **CPc** = circunferência corrigida da panturrilha = circ_panturrilha(cm) − π·dobra_panturrilha(mm)/10
- **sexo**: 1 para homens, 0 para mulheres
- **etnia**: asiáticos = −2.0; afro-americanos = +1.1; brancos e hispânicos = 0

⚠️ Todas as circunferências e dobras em cm e mm respectivamente. Atenção às unidades.

---

## 9. Taxa metabólica basal (TMB)

### 9.1 Harris-Benedict revisada (Roza, 1984)

**Referência**: Roza AM, Shizgal HM. The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass. Am J Clin Nutr. 1984;40(1):168-82.

```
Homens:    TMB = 88.362 + 13.397·peso(kg) + 4.799·altura(cm) − 5.677·idade
Mulheres:  TMB = 447.593 + 9.247·peso(kg) + 3.098·altura(cm) − 4.330·idade
```

### 9.2 Mifflin-St Jeor (1990) — preferida pela Academy of Nutrition and Dietetics

**Referência**: Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-7.

```
Homens:    TMB = 10·peso(kg) + 6.25·altura(cm) − 5·idade + 5
Mulheres:  TMB = 10·peso(kg) + 6.25·altura(cm) − 5·idade − 161
```

### 9.3 Cunningham (1980) — para atletas e indivíduos com alta MLG

**Referência**: Cunningham JJ. A reanalysis of the factors influencing basal metabolic rate in normal adults. Am J Clin Nutr. 1980;33(11):2372-4.

```
TMB = 500 + 22 · MLG(kg)
```

Requer MLG previamente calculada.

---

## 10. Casos de validação para testes

Os casos abaixo são extraídos da literatura ou construídos a partir dos exemplos das publicações originais. Tolerâncias: densidade ±0.001; %G ±0.5 pontos; IMC ±0.1.

### Caso 1 — Homem, 30 anos, eutrófico
- Peso: 75 kg, altura: 175 cm, idade: 30
- Dobras (mm): peitoral=10, abdominal=18, coxa=12, tricipital=8, subescapular=12, axilar média=10, suprailíaca=14, panturrilha=8
- Circunferências (cm): cintura=82, quadril=95, braço=30, coxa=52, panturrilha=36
- Resultados esperados (aproximados):
  - IMC = 24.49 (eutrofia)
  - RCQ = 0.863 (baixo risco)
  - RCE = 0.469 (adequado)
  - JP3: DC ≈ 1.0633 → %G (Siri) ≈ 15.2%

### Caso 2 — Mulher, 35 anos, sobrepeso
- Peso: 72 kg, altura: 165 cm, idade: 35
- Dobras (mm): tricipital=22, suprailíaca=20, coxa=28, subescapular=18, abdominal=25, peitoral=12, axilar média=16, panturrilha=18
- Circunferências (cm): cintura=82, quadril=102, braço=30, coxa=58, panturrilha=36
- Resultados esperados (aproximados):
  - IMC = 26.45 (sobrepeso)
  - RCQ = 0.804 (risco moderado)
  - RCE = 0.497 (adequado, limítrofe)
  - JP3: DC ≈ 1.0378 → %G (Siri) ≈ 26.5%

⚠️ Os valores esperados acima são estimativas preliminares. Durante a implementação, esses casos devem ser validados manualmente calculando cada fórmula e atualizando as tolerâncias no arquivo de fixtures.

---

## 11. Roadmap de fórmulas (fora do escopo Fase 1)

Lista de equações candidatas para fases futuras, priorizadas conforme demanda clínica:

- **Slaughter et al. (1988)** — composição corporal pediátrica
- **Boileau et al. (1985)** — composição corporal em adolescentes
- **Pollock et al. (1980)** — equações específicas para atletas
- **FAO/OMS/UNU (2001)** — TMB por faixa etária
- **Katch-McArdle** — TMB baseada em MLG
- **Somatótipo de Heath-Carter** — classificação morfológica
- **Sinalização MUAC** (circunferência braquial isolada) — triagem nutricional em idosos hospitalizados
