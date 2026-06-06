# PRODUCT_BACKLOG.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-06

---

## 1. PRIORIDADES

| Prioridade | Significado |
|------------|-------------|
| **P0** | Essencial para o MVP. Bloqueia outras entregas. |
| **P1** | Necessário em versão curta (1-2 sprints após MVP). |
| **P2** | Importante, mas pode aguardar. |
| **P3** | Futuro / dependente de maturidade do produto. |

---

## 2. BACKLOG COMPLETO

### FASE 01 — Fundação do Sistema (P0) ✅ Concluída

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F01-01 | Inicializar Next.js 15 + TypeScript + Tailwind | ✅ | P0 |
| F01-02 | Configurar Shadcn/UI | ✅ | P0 |
| F01-03 | Configurar Prisma ORM + PostgreSQL | ✅ | P0 |
| F01-04 | Criar Docker Compose (PostgreSQL + PgAdmin) | ✅ | P0 |
| F01-05 | Configurar Auth.js v5 (JWT + Refresh Token) | ✅ | P0 |
| F01-06 | Criar estrutura de pastas (app, components, features, lib, server) | ✅ | P0 |
| F01-07 | Implementar tela de login | ✅ | P0 |
| F01-08 | Implementar logout | ✅ | P0 |
| F01-09 | Proteger rotas com middleware | ✅ | P0 |
| F01-10 | Criar dashboard protegido com dados mockados | ✅ | P0 |
| F01-11 | Implementar auditoria (audit_logs) | ✅ | P0 |
| F01-12 | Seed de 6 perfis + admin padrão | ✅ | P0 |

### FASE 02 — Territórios (P0)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F02-01 | CRUD de Estado | ⬜ | P0 |
| F02-02 | CRUD de Região | ⬜ | P0 |
| F02-03 | CRUD de Município | ⬜ | P0 |
| F02-04 | CRUD de Bairro | ⬜ | P0 |
| F02-05 | CRUD de Comunidade | ⬜ | P0 |
| F02-06 | Árvore territorial navegável (componente tree) | ⬜ | P0 |
| F02-07 | Slug automático por tipo + nome | ⬜ | P0 |
| F02-08 | Validação de hierarquia (não pular níveis) | ⬜ | P0 |
| F02-09 | Impedir exclusão de território com filhos ativos | ⬜ | P0 |
| F02-10 | Sidebar com navegação territorial | ⬜ | P1 |

### FASE 03 — Pessoas (P0)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F03-01 | Cadastro unificado de pessoas (formulário) | ⬜ | P0 |
| F03-02 | Campo de consentimento LGPD no cadastro | ⬜ | P0 |
| F03-03 | Categorias de pessoa (9 tipos fixos) | ⬜ | P0 |
| F03-04 | Vínculo da pessoa a um território | ⬜ | P0 |
| F03-05 | Busca por nome, telefone, território | ⬜ | P0 |
| F03-06 | Filtros por categoria, território, data | ⬜ | P0 |
| F03-07 | Edição de dados da pessoa | ⬜ | P0 |
| F03-08 | Soft delete de pessoa | ⬜ | P0 |
| F03-09 | Histórico de alterações da pessoa | ⬜ | P1 |
| F03-10 | Anonimização de dados (exclusão a pedido) | ⬜ | P1 |

### FASE 04 — Lideranças (P1)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F04-01 | Hierarquia de lideranças (5 níveis) | ⬜ | P1 |
| F04-02 | Atribuir liderança a uma pessoa | ⬜ | P1 |
| F04-03 | Definir superior hierárquico | ⬜ | P1 |
| F04-04 | Validação de ciclo hierárquico | ⬜ | P1 |
| F04-05 | Compatibilidade território-nível | ⬜ | P1 |
| F04-06 | Indicadores por liderança (atividade, participação) | ⬜ | P1 |
| F04-07 | Visualização da árvore de lideranças | ⬜ | P2 |

### FASE 05 — Demandas (P0)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F05-01 | Abertura de demanda (formulário) | ⬜ | P0 |
| F05-02 | Pipeline de status (6 estados) | ⬜ | P0 |
| F05-03 | Transições válidas entre status | ⬜ | P0 |
| F05-04 | Atribuição de responsável | ⬜ | P0 |
| F05-05 | Categorias de demanda (8 tipos) | ⬜ | P0 |
| F05-06 | Prioridade (baixa, média, alta, urgente) | ⬜ | P0 |
| F05-07 | Histórico de alterações (demand_history) | ⬜ | P0 |
| F05-08 | Kanban de demandas por status | ⬜ | P1 |
| F05-09 | Encerramento de demanda | ⬜ | P0 |
| F05-10 | Reabertura via nova demanda vinculada | ⬜ | P1 |
| F05-11 | Exportação de demandas (CSV) | ⬜ | P2 |

### FASE 06 — Agenda (P1)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F06-01 | Criação de evento (reunião, audiência, viagem, visita, entrevista) | ⬜ | P1 |
| F06-02 | Calendário (diário, semanal, mensal) | ⬜ | P1 |
| F06-03 | Vínculo do evento ao território | ⬜ | P1 |
| F06-04 | Participantes do evento | ⬜ | P1 |
| F06-05 | Status do evento (agendado, confirmado, cancelado, realizado) | ⬜ | P1 |
| F06-06 | Alerta de conflito de horário | ⬜ | P2 |
| F06-07 | Filtro por território | ⬜ | P1 |

### FASE 07 — Atividades (P1)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F07-01 | Registro de atividade (visita, reunião, evento, ligação, atendimento) | ⬜ | P1 |
| F07-02 | Vínculo a território | ⬜ | P1 |
| F07-03 | Vínculo a múltiplas pessoas | ⬜ | P1 |
| F07-04 | Timeline de atividades | ⬜ | P1 |
| F07-05 | Indicadores de atividade (últimos 30 dias) | ⬜ | P1 |

### FASE 08 — Pesquisa de Campo (P1)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F08-01 | Formulário de pesquisa | ⬜ | P1 |
| F08-02 | Classificação de sentimento (5 níveis) | ⬜ | P1 |
| F08-03 | Lista de problemas identificados | ⬜ | P1 |
| F08-04 | Prioridades apontadas | ⬜ | P1 |
| F08-05 | Perguntas customizáveis por pesquisa | ⬜ | P2 |
| F08-06 | Relatório de pesquisa | ⬜ | P1 |

### FASE 09 — Inteligência Territorial (P2)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F09-01 | Mapa com marcadores por território | ⬜ | P2 |
| F09-02 | Heatmap de demandas | ⬜ | P2 |
| F09-03 | Cobertura territorial (territórios sem atividade) | ⬜ | P2 |
| F09-04 | Áreas prioritárias (demandas recorrentes) | ⬜ | P2 |
| F09-05 | Indicadores por território | ⬜ | P2 |

### FASE 10 — War Room (P2)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F10-01 | Dashboard operacional completo | ⬜ | P2 |
| F10-02 | Visão executiva com todos os indicadores | ⬜ | P2 |
| F10-03 | Alertas operacionais | ⬜ | P2 |
| F10-04 | Filtro territorial global | ⬜ | P2 |

### FASE 11 — Comunicação (P3)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F11-01 | Integração com WhatsApp Business | ⬜ | P3 |
| F11-02 | Envio de e-mail | ⬜ | P3 |
| F11-03 | Notificações push | ⬜ | P3 |
| F11-04 | Disparo em massa (com consentimento) | ⬜ | P3 |
| F11-05 | Template de mensagens | ⬜ | P3 |

### FASE 12 — IA Estratégica (P3)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| F12-01 | Resumo automático de atividades | ⬜ | P3 |
| F12-02 | Relatórios automáticos | ⬜ | P3 |
| F12-03 | Alertas inteligentes (gargalos, tendências) | ⬜ | P3 |
| F12-04 | Sugestão de atuação territorial | ⬜ | P3 |
| F12-05 | Assistente de conversação | ⬜ | P3 |

### INFRA — Infraestrutura (Transversal)

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| INF-01 | Docker Compose (PostgreSQL + PgAdmin) | ✅ | P0 |
| INF-02 | Deploy em produção (Railway / Render / Vercel) | ⬜ | P1 |
| INF-03 | Domínio e DNS (Cloudflare) | ⬜ | P1 |
| INF-04 | CI/CD (GitHub Actions) | ⬜ | P2 |
| INF-05 | Backup automático do banco | ⬜ | P1 |
| INF-06 | Sentry para monitoramento de erros | ⬜ | P2 |
| INF-07 | CDN para assets estáticos | ⬜ | P2 |

### LGPD — Transversal

| ID | Item | Status | Prioridade |
|----|------|--------|------------|
| LGDP-01 | Não armazenar dados sensíveis | ✅ | P0 |
| LGPD-02 | Auditoria (audit_logs) | ✅ | P0 |
| LGPD-03 | Consentimento no cadastro de pessoas | ⬜ | P1 |
| LGPD-04 | Anonimização de dados | ⬜ | P1 |
| LGPD-05 | Fluxo de exclusão a pedido | ⬜ | P1 |
| LGPD-06 | Exportação de dados (portabilidade) | ⬜ | P2 |
| LGPD-07 | Política de privacidade acessível | ⬜ | P1 |
| LGPD-08 | DPA para integrações terceiras | ⬜ | P2 |

---

## 3. DISTRIBUIÇÃO POR FASE

```
Fase 01 (Fundação):    12 itens  ✅ Concluída
Fase 02 (Territórios):  10 itens  ⬅️ Próxima
Fase 03 (Pessoas):      10 itens
Fase 04 (Lideranças):    7 itens
Fase 05 (Demandas):     11 itens
Fase 06 (Agenda):        7 itens
Fase 07 (Atividades):    5 itens
Fase 08 (Pesquisas):     6 itens
Fase 09 (Inteligência):  5 itens
Fase 10 (War Room):      4 itens
Fase 11 (Comunicação):   5 itens
Fase 12 (IA Estratégica):5 itens
Infra:                   7 itens
LGPD:                    8 itens
─────────────────────────────
Total:                 102 itens
```

---

## 4. PRÓXIMAS ENTREGAS (SPRINT ATUAL)

| Ordem | Prioridade | Item | Fase |
|-------|------------|------|------|
| 1 | P0 | CRUD de Estado | F02 |
| 2 | P0 | CRUD de Região | F02 |
| 3 | P0 | CRUD de Município | F02 |
| 4 | P0 | CRUD de Bairro | F02 |
| 5 | P0 | CRUD de Comunidade | F02 |
| 6 | P0 | Árvore territorial navegável | F02 |
| 7 | P0 | Slug automático | F02 |
| 8 | P0 | Validação de hierarquia | F02 |
