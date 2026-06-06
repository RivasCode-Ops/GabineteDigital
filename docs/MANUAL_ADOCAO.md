# Manual de Adoção — Gabinete Digital

## Objetivo

Este documento orienta o piloto controlado e a medição de adoção do sistema.

---

## Cenário Piloto

```
1 Coordenador Geral
2 Coordenadores Municipais
5 Lideranças
100 Pessoas
20 Demandas
10 Eventos
20 Atividades
5 Pesquisas
```

Duração: **30 dias** consecutivos.

---

## Métricas de Adoção

Monitorar semanalmente:

| Métrica | Meta | Onde ver |
|---|---|---|
| Usuários que fizeram login na semana | >80% | `/api/v1/metrics/adoption` |
| Demandas criadas por dia | ≥2 | Dashboard |
| Demandas concluídas na semana | ≥30% das abertas | War Room |
| Atividades registradas por dia | ≥3 | Dashboard |
| Eventos realizados no mês | ≥5 | Agenda |
| Pesquisas preenchidas | ≥3 | Pesquisas |
| Score médio dos territórios | >50 | Inteligência |

---

## Indicador Principal

**Retorno para WhatsApp/planilha.**

Se a equipe continua registrando no sistema → ✅ adesão.

Se começam a registrar fora → ⚠️ atrito operacional identificado.

---

## Feedback

O sistema possui um botão "Encontrou dificuldade?" no canto inferior direito.

Use-o para reportar:
- Dúvidas de uso
- Funcionalidades que faltam
- Erros ou lentidão
- Sugestões

Os feedbacks ficam disponíveis em `/api/v1/feedback`.

---

## Cronograma de Piloto

| Semana | Atividade |
|---|---|
| Pré-piloto | Treinamento presencial (2h) |
| Semana 1 | Cadastro inicial + primeiras demandas |
| Semana 2 | Atividades de campo + eventos |
| Semana 3 | Pesquisas + relatórios |
| Semana 4 | Avaliação + ajustes |
| Pós-piloto | Decisão: produçao ou ajustes |

---

## Critérios de Sucesso

O piloto é considerado bem-sucedido se:

1. **>80% dos usuários** fizeram login na última semana
2. **>50 demandas** criadas no período
3. **>50 atividades** registradas
4. **Nenhum dado crítico perdido**
5. **Feedback predominantemente positivo** (ou construtivo)

---

## O que Fazer com os Resultados

- **Adesão alta** → preparar rollout para mais gabinetes
- **Adesão média** → identificar atritos, ajustar UX, reiterar treinamento
- **Adesão baixa** → entrevistar usuários, pivotar funcionalidades

> O objetivo do piloto não é validar o software. É validar se o software resolve o problema real do gabinete.
