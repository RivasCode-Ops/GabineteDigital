# Modelo de Negócio — Gabinete Digital

## Planos

### Plano Gabinete — R$ 197/mês

```
🎯 Público: Deputado estadual, vereador com equipe pequena
👥 Usuários: Até 10
🏛️ Gabinetes: 1
🗺️ Territórios: Até 5
📞 Suporte: WhatsApp (dias úteis, 8-18h)
💾 Backup: Semanal
📋 Auditoria: Básica (30 dias)
```

**Custo por usuário: R$ 19,70/mês**

### Plano Regional — R$ 497/mês

```
🎯 Público: Deputado federal, coordenação regional
👥 Usuários: Até 50
🏛️ Gabinetes: Até 3
🗺️ Territórios: Até 50
📞 Suporte: WhatsApp prioritário
💾 Backup: Diário
📋 Auditoria: Completa (90 dias)
🎓 Treinamento: 1 presencial/ano
```

**Custo por usuário: R$ 9,94/mês**

### Plano Estadual — R$ 997/mês

```
🎯 Público: Coordenação de campanha, secretaria
👥 Usuários: Ilimitado
🏛️ Gabinetes: Ilimitado
🗺️ Territórios: Ilimitado
📞 Suporte: 24/7
💾 Backup: Diário + S3
📋 Auditoria: Completa (1 ano)
🎓 Treinamento: 4 presenciais/ano
⚡ SLA: 4h úteis
```

**Custo por usuário: reduz conforme escala**

---

## Custos Operacionais Estimados

### Custo Fixo Mensal (1 cliente)

| Item | Valor |
|---|---|
| VPS (2 vCPU, 4GB) | R$ 60 |
| Domínio + SSL | R$ 10 |
| S3 (backup) | R$ 5 |
| Suporte | R$ 0 (time internalizado) |
| **Total** | **R$ 75/mês** |

### Margem por Plano

| Plano | Receita | Custo | Margem |
|---|---|---|---|
| Gabinete | R$ 197 | R$ 75 | **62%** |
| Regional | R$ 497 | R$ 75 | **85%** |
| Estadual | R$ 997 | R$ 75 | **92%** |

### Margem com Escala (50 clientes)

```
VPS: R$ 60/cliente → R$ 0,50/cliente (compartilhado)
Custo marginal por cliente adicional: ~R$ 5 (storage + suporte)

Plano Gabinete: R$ 197 → margem de 97%
```

---

## Projeção de Receita

### Ano 1 (conservador)

| Mês | Clientes | Receita |
|---|---|---|
| Mês 1-3 | 1 (piloto gratuito) | R$ 0 |
| Mês 4 | 2 | R$ 394 |
| Mês 5 | 3 | R$ 591 |
| Mês 6 | 5 | R$ 985 |
| Mês 7 | 7 | R$ 1.379 |
| Mês 8 | 10 | R$ 1.970 |
| Mês 9 | 12 | R$ 2.364 |
| Mês 10 | 15 | R$ 2.955 |
| Mês 11 | 18 | R$ 3.546 |
| Mês 12 | 20 | R$ 3.940 |

**Receita anual estimada: ~R$ 18.000** (primeiro ano)

### Ano 2 (crescimento)

```
50 clientes × R$ 497 (médio) = R$ 24.850/mês
Receita anual: R$ 298.200
```

---

## Estratégia de Precificação

### Por que não cobrar barato demais?

```
R$ 50/mês → cliente não leva a sério
R$ 97/mês → experimenta e para
R$ 197/mês → compromisso de uso
R$ 497/mês → contratação formal
R$ 997/mês → decisão estratégica
```

### Gatilhos de Upgrade

| Situação | Plano ideal |
|---|---|
| "Quero add mais 2 usuários" | Regional |
| "Preciso de suporte no fim de semana" | Regional |
| "Quero mais 3 gabinetes" | Regional |
| "Preciso de treinamento presencial" | Regional |
| "Quero SLA" | Estadual |
| "Usuários ilimitados" | Estadual |
| "Suporte 24/7" | Estadual |

---

## Canais de Venda

1. **Indicação** — "gabinete que usa indica"
2. **Demonstração** — pitch de 15 min para coordenador
3. **Eventos políticos** — feiras, convenções, encontros
4. **Parceria com assessorias** — comissão de 20% sobre implantação
5. **Conteúdo** — posts sobre gestão de território político

---

## Funil de Vendas

```
1. Lead → demonstração agendada
2. Demo → 15 min mostrando War Room + ROI
3. Proposta → enviada em 24h
4. Prova social → case de quem já usa
5. Fechamento → contrato + implantação em 7 dias
6. Onboarding → treinamento presencial
7. Sucesso → métricas de adoção na semana 4
```

---

## Métricas de Negócio

| Métrica | Meta |
|---|---|
| Taxa de conversão (demo → contrato) | >30% |
| Churn mensal | <5% |
| NPS | >70 |
| Tempo médio de implantação | 7 dias |
| Usuários ativos por cliente | >60% |
| ROI médio para o cliente | >10x |
