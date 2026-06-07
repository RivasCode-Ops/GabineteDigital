# Checklist do Piloto — Gabinete Digital

## Cenário

```
1 Coordenador Geral
2 Coordenadores Municipais
5 Lideranças
100 Pessoas cadastradas
20 Demandas abertas
10 Eventos realizados
20 Atividades registradas
5 Pesquisas preenchidas
```

Duração: **30 dias**.

---

## Antes do Piloto

### Técnico

- [ ] Sistema rodando (docker compose up -d)
- [ ] HTTPS funcionando (Cloudflare Full Strict)
- [ ] Login admin testado (admin@gabinete.com / admin123)
- [ ] Backup gerado e baixado com sucesso
- [ ] Health endpoints respondendo (/api/v1/health)
- [ ] Todas as rotas funcionais (testar rapidamente: pessoas, demandas, etc.)
- [ ] Resetar dados de seed se necessário (ou manter limpos)

### Treinamento

- [ ] Treinamento presencial de 2h realizado
- [ ] Cada perfil fez ao menos 1 exercício guiado
- [ ] Usuários têm senha e sabem fazer login
- [ ] Grupo de WhatsApp criado para suporte
- [ ] Manual rápido impresso ou PDF compartilhado

### Dados Iniciais

- [ ] Admin cria territórios base (estado/municípios)
- [ ] Coordenador geral cadastra ao menos 2 lideranças
- [ ] Lideranças cadastram ao menos 5 pessoas cada
- [ ] Ao menos 3 demandas abertas (para mostrar o pipeline)

---

## Durante o Piloto (dias 1–30)

### Semana 1 — Imersão

- [ ] **Dia 1**: Todos fazem login e cadastram 1 contato
- [ ] **Dia 2**: Lideranças registram 1 visita cada
- [ ] **Dia 3**: Coordenadores municipais criam 1 evento
- [ ] **Dia 4**: War Room revisado pelo coordenador geral
- [ ] **Dia 5**: Fechamento da semana — quantas atividades? quantas demandas?

### Semana 2 — Rotina

- [ ] Lideranças: ≥5 visitas registradas na semana
- [ ] Demandas: pipeline começando a andar (ao menos 2 encaminhadas)
- [ ] Pessoas: ≥30 cadastradas no total
- [ ] Agenda: eventos da semana registrados

### Semana 3 — Consolidação

- [ ] Primeira pesquisa de sentimento aplicada
- [ ] Inteligência territorial atualizada
- [ ] Alertas revisados
- [ ] Métricas de adoção calculadas (>70%? >50%?)

### Semana 4 — Avaliação

- [ ] Todas as lideranças com ≥3 visitas na semana
- [ ] Demandas começando a ser resolvidas
- [ ] Score médio dos territórios calculado
- [ ] Feedback coletado (botão "Encontrou dificuldade?")

### Rotina Diária (todas as semanas)

- [ ] Lideranças: registrar atividades do dia
- [ ] Coordenadores: acompanhar pipeline de demandas
- [ ] Coordenador geral: War Room (5 min/dia)

---

## Métricas de Acompanhamento

Consultar em: `https://seudominio.com.br/api/v1/metrics/adoption`

| Métrica | Como medir | Meta |
|---|---|---|
| Usuários ativos na semana | `activeUsers` no endpoint | >80% |
| Demandas por dia | `demands.createdWeek` / 7 | ≥2 |
| Taxa de resolução | `demands.resolutionRate` | ≥30% |
| Atividades por dia | `activities.week` / 7 | ≥3 |
| Eventos na semana | `events.week` | ≥2 |
| Score médio | `score.avg` | >50 |
| Logins na semana | `logins` | ≥1 por usuário |

### Como Interpretar

- **>80% ativos**: adesão excelente
- **50–80%**: alerta amarelo — investigar quem não está usando
- **<50%**: alerta vermelho — replanejar treinamento

---

## Feedback

O botão "Encontrou dificuldade?" gera entradas em `/api/v1/feedback`.

Classificar feedbacks em:

| Tipo | Ação |
|---|---|
| Dúvida de uso | Resolver no WhatsApp + anotar para FAQ |
| Bug | Criar issue no GitHub |
| Sugestão | Avaliar prioridade vs. impacto |
| Crítica | Entrevistar usuário para entender |

---

## Pós-Piloto

### Critérios de Sucesso

- [ ] **>80% dos usuários** fizeram login na última semana
- [ ] **≥50 demandas** criadas no período
- [ ] **≥50 atividades** registradas
- [ ] **Nenhum dado perdido** (backup funcional)
- [ ] **Feedback predominantemente positivo** ou construtivo
- [ ] **Coordenador geral** consegue operar o War Room sozinho
- [ ] **Lideranças** registram atividades sem ajuda

### Decisão

- **✅ Aprovado**: Rollout para mais gabinetes
- **🔄 Ajustes necessários**: Identificar atritos, ajustar, reiterar treinamento
- **❌ Rejeitado**: Entrevistar todos, pivotar ou descontinuar

### Próximos Passos (se aprovado)

1. Documentar lições aprendidas
2. Criar material de onboarding para novos gabinetes
3. Planejar v0.5.0 com base nos feedbacks reais
4. Preparar rollout para 3 gabinetes no próximo ciclo
