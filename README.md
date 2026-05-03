# Antropo

Sistema de avaliação antropométrica nutricional para uso clínico em consultório. Cadastra pacientes, registra medidas (peso, altura, dobras cutâneas, circunferências), calcula composição corporal por múltiplos protocolos validados e acompanha a evolução longitudinal.

> Projeto pessoal de uso próprio em consultório, disponibilizado como referência para outros nutricionistas que queiram um sistema simples, offline e sem custo.

## Funcionalidades

- Cadastro e gestão de pacientes
- Registro de avaliações antropométricas com 10 dobras cutâneas e 8 circunferências
- Cálculo de composição corporal por 6 protocolos validados (Jackson-Pollock, Petroski, Guedes, Faulkner, Durnin-Womersley, Carter)
- Indicadores de risco metabólico (RCQ, RCE, IC, IAC)
- Estimativa de massa muscular (Lee 2000) e taxa metabólica basal (Harris-Benedict, Mifflin-St Jeor, Cunningham)
- Acompanhamento longitudinal com gráficos de evolução
- Relatório de impressão para entrega ao paciente
- Persistência local automática no navegador (sem necessidade de servidor)
- 3 temas visuais (Clinical Blue, Warm Amber, Midnight)

## Stack

Aplicação 100% client-side. Sem backend, sem banco de dados, sem build:

- React 18 via CDN
- Babel Standalone (JSX in-browser)
- localStorage para persistência

## Como rodar localmente

**Pré-requisitos:** Python instalado (vem por padrão no Windows 10/11 e na maioria das distribuições Linux/Mac).

1. Baixar ou clonar este repositório
2. Abrir terminal na pasta do projeto
3. Subir um servidor estático local:

```bash
python -m http.server 8000
```

4. Abrir no navegador: `http://localhost:8000/Antropo.html`

Os dados ficam armazenados no localStorage do navegador. Cada navegador (e cada perfil) tem dados independentes. Limpar o cache do navegador apaga os dados — exporte periodicamente se for usar para casos reais.

## Privacidade dos dados

Toda informação fica **exclusivamente no navegador local** do usuário. Nada é enviado pela internet. Adequado para uso individual em consultório.

## Referências científicas

Todas as fórmulas implementadas estão documentadas em [`FORMULAS.md`](./FORMULAS.md) com a referência bibliográfica original (autor, ano, publicação) e faixa de aplicação (idade, sexo, validação populacional).

## Estado do projeto

Projeto em uso ativo. Desenvolvimento pessoal, sem cronograma fixo de releases. Issues e sugestões são bem-vindas, mas não há garantia de resposta ou priorização.

## Aviso clínico

Este sistema **calcula indicadores antropométricos** com base em fórmulas validadas na literatura. **Não substitui o julgamento clínico do nutricionista.** Interpretação dos resultados, prescrição alimentar, conduta clínica e decisões terapêuticas são responsabilidade exclusiva do profissional habilitado que utilizar o sistema.

## Licença

[MIT](./LICENSE) — uso livre para fins pessoais e comerciais, sem garantia.

## Autor

**Vinicius Zapola** — Nutricionista (em formação) · Pós-graduando em Nutrição Clínica (USP)
