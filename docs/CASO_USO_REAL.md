# Caso de Uso Real — Georgiano Neto

## Cenário

| Item | Detalhe |
|---|---|
| Coordenação | 1 coordenador geral |
| Abrangência | 3 municípios |
| Lideranças | 20 lideranças comunitárias |
| Base | 100 pessoas cadastradas |
| Período | 30 dias consecutivos |
| Objetivo | Validar adoção real do sistema |

---

## Por que este perfil?

1. **Escopo controlado** — 1 coordenação, 3 municípios → fácil de gerenciar
2. **Número significativo** — 20 lideranças + 100 pessoas → volume realista
3. **Diversidade territorial** — 3 municípios → testa hierarquia e relatórios
4. **Viabilidade** — equipe pequena, sem burocracia pesada

---

## Estrutura de Territórios

```
Estado: Rio Grande do Norte
├── Município: Natal
│   ├── Bairro: Petrópolis
│   ├── Bairro: Tirol
│   └── Bairro: Cidade Alta
├── Município: Parnamirim
│   ├── Bairro: Nova Parnamirim
│   └── Bairro: Pirangi
└── Município: São Gonçalo do Amarante
    ├── Bairro: Centro
    └── Bairro: Amarante
```

---

## Cronograma do Piloto

### Pré-piloto (3 dias antes)

| Dia | Atividade |
|---|---|
| D-3 | Setup da plataforma + territórios |
| D-2 | Cadastro de coordenador + 20 lideranças |
| D-1 | Treinamento presencial de 2h |

### Semana 1 — Imersão

| Dia | Meta | Responsável |
|---|---|---|
| D1 | Cada liderança cadastra 2 pessoas (40 total) | Lideranças |
| D2 | Cada liderança registra 1 visita (20 atividades) | Lideranças |
| D3 | Coordenador abre 5 demandas | Coordenador |
| D4 | Coordenador cria 2 eventos na agenda | Coordenador |
| D5 | War Room: revisão da semana | Coordenador |

### Semana 2 — Rotina

| Item | Meta |
|---|---|
| Pessoas cadastradas | 70 (70% da meta) |
| Atividades registradas | 30 |
| Demandas abertas | 10 |
| Pipeline andando | 3 demandas encaminhadas |

### Semana 3 — Consolidação

| Item | Meta |
|---|---|
| Pessoas cadastradas | 90 |
| Atividades registradas | 50 |
| Primeira pesquisa aplicada | 1 |
| Score territorial calculado | ≥3 territórios com score |

### Semana 4 — Avaliação

| Item | Meta |
|---|---|
| Pessoas cadastradas | 100 ✅ |
| Atividades registradas | 60+ |
| Demandas resolvidas | 5+ |
| Usuários ativos na semana | >80% |
| Feedback coletado | 5+ registros |

---

## Indicadores-Chave

```
Usuários ativos:           >80% (16+ lideranças)
Pessoas cadastradas:       100
Atividades/dia:            ≥3
Demandas criadas:          20+
Demandas resolvidas:       5+
Eventos realizados:        3+
Pesquisas aplicadas:       2+
Score médio territórios:   >50
```

---

## Como Medir

Endpoint de adoção:

```bash
curl https://gabinetedigital.com.br/api/v1/metrics/adoption
```

Resposta esperada:

```json
{
  "data": {
    "users": {
      "total": 21,
      "activeWeek": 18,
      "adoptionRate": 86
    },
    "people": { "total": 100 },
    "demands": {
      "createdWeek": 5,
      "resolvedWeek": 2,
      "resolutionRate": 40
    },
    "activities": { "week": 25 },
    "events": { "week": 2 },
    "score": { "avg": 62 }
  }
}
```

---

## Riscos Identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Lideranças não usam o sistema | Média | Treinamento presencial + WhatsApp |
| Coordenador sobrecarregado | Baixa | Escopo limitado a 3 municípios |
| Dados inconsistentes | Média | Revisão semanal no War Room |
| Desistência na semana 2 | Alta | Acompanhamento diário na semana 1 |
| Problema técnico | Baixa | Suporte WhatsApp direto |

---

## Critérios de Sucesso

O piloto é sucesso se ao final de 30 dias:

1. **>80% das lideranças** fizeram login na última semana
2. **100 pessoas cadastradas** (meta principal)
3. **≥50 atividades registradas** (sistema virou rotina)
4. **Pipeline de demandas funcionando** (criadas + andamento + resolvidas)
5. **Coordenador opera o War Room sozinho**
6. **Feedback sincero coletado** (o que funciona, o que não funciona)

---

## Próximos Passos (se aprovado)

```
1. Ajustar funcionalidades com base no feedback real
2. Preparar rollout para 3 novos gabinetes
3. Iniciar prospecção comercial
4. v0.7.0 com melhorias validadas no piloto
```
