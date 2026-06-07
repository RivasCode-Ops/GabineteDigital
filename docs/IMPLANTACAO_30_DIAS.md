# Plano de Implantação — 30 Dias

## Visão Geral

| Semana | Foco | Responsável |
|---|---|---|
| **Semana 1** | Setup + Usuários + Territórios | Admin + Coord. Geral |
| **Semana 2** | Lideranças + Pessoas + Demandas | Coord. Geral + Coords. Municipais |
| **Semana 3** | Agenda + Atividades + Pesquisas | Todos |
| **Semana 4** | War Room + Indicadores + Ajustes | Coord. Geral |

---

## Semana 1 — Fundação

### Dia 1 — Setup Técnico

- [ ] Verificar se o sistema está online (`/api/v1/health`)
- [ ] Configurar HTTPS (Cloudflare)
- [ ] Testar login de todos os usuários criados
- [ ] Alterar senha padrão de cada usuário

### Dia 2 — Territórios

- [ ] Admin cria hierarquia de territórios
- [ ] Validar com coordenador geral se a hierarquia está correta
- [ ] Ajustar slugs e nomenclatura

### Dia 3 — Usuários e Permissões

- [ ] Revisar níveis de acesso de cada usuário
- [ ] Coordenador geral testa: consegue ver todos os territórios?
- [ ] Coordenador municipal testa: consegue ver só o seu município?
- [ ] Liderança testa: consegue criar demanda?

### Dia 4 — Configuração

- [ ] Definir categorias de demanda (saúde, educação, infraestrutura...)
- [ ] Definir tipos de atividade (visita, reunião, plantão...)
- [ ] Notificações: testar se chegam (se SMTP configurado)

### Dia 5 — Validação

- [ ] Coordenador geral navega por todo o sistema
- [ ] Reporta ajustes necessários
- [ ] Backup de configuração gerado

### Entrega da Semana 1

```
✅ Sistema rodando
✅ Hierarquia de territórios completa
✅ Todos os usuários com acesso correto
✅ Configurações básicas definidas
```

---

## Semana 2 — Cadastro em Massa

### Dias 6-7 — Lideranças

- [ ] Coordenador geral cadastra lideranças-chave
- [ ] Vincular lideranças a territórios
- [ ] Vincular hierarquia entre lideranças
- [ ] Meta: 5 lideranças cadastradas

### Dias 8-10 — Pessoas

- [ ] Coordenadores municipais cadastram pessoas
- [ ] Lideranças cadastram pessoas
- [ ] Meta: 50 pessoas cadastradas até dia 10
- [ ] Verificar consentimento LGPD

### Dias 11-12 — Primeiras Demandas

- [ ] Coordenadores municipais abrem 10 demandas iniciais
- [ ] Classificar por categoria
- [ ] Vincular a territórios
- [ ] Pipeline: Recebida → Triagem

### Entrega da Semana 2

```
✅ Lideranças mapeadas
✅ Base de pessoas com consentimento
✅ Primeiras demandas no pipeline
```

---

## Semana 3 — Rotina

### Dias 13-15 — Agenda

- [ ] Coordenador geral cria eventos do mês
- [ ] Coordenadores municipais criam eventos locais
- [ ] Vincular participantes
- [ ] Meta: 5 eventos na agenda

### Dias 16-18 — Atividades

- [ ] Lideranças registram visitas
- [ ] Coordenadores registram reuniões e plantões
- [ ] Meta: 3 atividades/dia (15 na semana)
- [ ] Reforçar: registrar no mesmo dia

### Dias 19-20 — Pesquisas

- [ ] Coordenadores municipais aplicam primeira pesquisa
- [ ] Lideranças auxiliam na aplicação
- [ ] Registrar sentimento e problemas
- [ ] Meta: 3 pesquisas preenchidas

### Entrega da Semana 3

```
✅ Agenda do mês preenchida
✅ Atividades virando rotina
✅ Primeiras pesquisas aplicadas
```

---

## Semana 4 — Inteligência

### Dias 21-23 — War Room

- [ ] Coordenador geral passa a usar War Room diariamente
- [ ] Revisar KPIs: quais territórios estão com score baixo?
- [ ] Revisar pipeline: demandas paradas?
- [ ] Revisar alertas: territórios críticos?

### Dias 24-25 — Indicadores

- [ ] Atualizar indicadores territoriais
- [ ] Executar diagnóstico de IA
- [ ] Gerar relatório da semana
- [ ] Exportar dados para backup

### Dias 26-28 — Ajustes Finos

- [ ] Coletar feedback de todos os usuários
- [ ] Ajustar permissões se necessário
- [ ] Reforçar treinamento onde houver dúvida
- [ ] Revisar métricas de adoção

### Dias 29-30 — Avaliação

- [ ] Calcular métricas finais:
  - Usuários ativos (>80%?)
  - Demandas criadas (>50?)
  - Atividades registradas (>50?)
  - Score médio (>50?)
- [ ] Reunião de fechamento com coordenador geral
- [ ] Decisão: continuar, ajustar ou escalar

### Entrega da Semana 4

```
✅ War Room sendo usado diariamente
✅ Indicadores calculados
✅ Feedback coletado
✅ Decisão tomada
```

---

## Checklist de Go-Live

- [ ] Sistema rodando em produção com HTTPS
- [ ] Backup automático configurado
- [ ] Todos os usuários treinados
- [ ] Manual rápido distribuído
- [ ] Grupo de WhatsApp de suporte criado
- [ ] Responsável técnico definido
- [ ] Contrato assinado
- [ ] Termo LGPD aceito pelos usuários

---

## Pós-Implantação (Dias 31+)

- [ ] Acompanhamento semanal do coordenador geral
- [ ] War Room revisitado a cada 15 dias
- [ ] Backup semanal verificado
- [ ] Pesquisas de satisfação mensais
- [ ] Ajustes de pipeline conforme necessidade
