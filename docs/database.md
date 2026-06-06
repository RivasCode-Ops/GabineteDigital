# DATABASE.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-05

---

## 1. CONVENÇÕES

- **Naming:** snake_case para tabelas e colunas
- **Timestamps:** `created_at`, `updated_at` em toda tabela
- **Soft delete:** `deleted_at` (nullable) em tabelas de negócio
- **Primary key:** `id` (UUID v4) em toda tabela
- **Foreign key:** `<tabela>_id` com índice explícito
- **Charset:** UTF-8

---

## 2. ENTIDADES

### 2.1 users

Tabela central de autenticação e controle de acesso.

| Campo          | Tipo         | Restrições               | Descrição                      |
|----------------|--------------|--------------------------|--------------------------------|
| id             | UUID         | PK, default uuid_generate | Identificador único            |
| name           | VARCHAR(255) | NOT NULL                 | Nome completo                  |
| email          | VARCHAR(255) | NOT NULL, UNIQUE         | E-mail de login                |
| password_hash  | VARCHAR(255) | NOT NULL                 | Hash BCrypt                    |
| role_id        | UUID         | FK → roles.id, NOT NULL  | Perfil de acesso               |
| territory_id   | UUID         | FK → territories.id      | Vínculo territorial (opcional) |
| phone          | VARCHAR(20)  |                          | Telefone de contato            |
| avatar_url     | VARCHAR(500) |                          | Foto do perfil                 |
| is_active      | BOOLEAN      | NOT NULL, default true   | Status da conta                |
| last_login_at  | TIMESTAMP    |                          | Último login                   |
| password_reset_token | VARCHAR(255) |                   | Token de recuperação           |
| password_reset_expires | TIMESTAMP |                        | Expiração do token             |
| created_at     | TIMESTAMP    | NOT NULL, default now()  |                                |
| updated_at     | TIMESTAMP    | NOT NULL, default now()  |                                |
| deleted_at     | TIMESTAMP    |                          | Soft delete                    |

**Índices:**
- `idx_users_email` ON email (UNIQUE)
- `idx_users_role_id` ON role_id
- `idx_users_territory_id` ON territory_id
- `idx_users_is_active` ON is_active

---

### 2.2 roles

Catálogo de perfis de acesso.

| Campo      | Tipo         | Restrições               | Descrição            |
|------------|--------------|--------------------------|----------------------|
| id         | UUID         | PK                       |                      |
| name       | VARCHAR(50)  | NOT NULL, UNIQUE         | Nome do perfil       |
| level      | INTEGER      | NOT NULL, UNIQUE         | Nível numérico       |
| description| TEXT         |                          | Descrição do perfil  |
| created_at | TIMESTAMP    | NOT NULL, default now()  |                      |
| updated_at | TIMESTAMP    | NOT NULL, default now()  |                      |

**Dados iniciais (seed):**

| name                  | level | description                         |
|-----------------------|-------|-------------------------------------|
| ADMIN                 | 100   | Acesso total ao sistema             |
| COORDENADOR_GERAL     | 80    | Coordenação nacional/estadual       |
| COORDENADOR_REGIONAL  | 60    | Coordenação regional                |
| COORDENADOR_MUNICIPAL | 40    | Coordenação municipal               |
| LIDERANCA             | 20    | Liderança comunitária               |
| OPERADOR              | 10    | Operador de campo                   |

---

### 2.3 territories

Estrutura hierárquica territorial (árvore).

| Campo        | Tipo         | Restrições               | Descrição                     |
|--------------|--------------|--------------------------|-------------------------------|
| id           | UUID         | PK                       |                               |
| name         | VARCHAR(255) | NOT NULL                 | Nome do território            |
| type         | ENUM         | NOT NULL                 | state, region, city, neighborhood, community |
| parent_id    | UUID         | FK → territories.id      | Nó pai na árvore              |
| slug         | VARCHAR(255) | NOT NULL                 | Slug para URLs                |
| population   | INTEGER      |                          | População estimada            |
| ibge_code    | VARCHAR(10)  |                          | Código IBGE (municípios)      |
| coordinates  | POINT        |                          | Coordenadas geográficas       |
| is_active    | BOOLEAN      | NOT NULL, default true   |                               |
| created_at   | TIMESTAMP    | NOT NULL, default now()  |                               |
| updated_at   | TIMESTAMP    | NOT NULL, default now()  |                               |
| deleted_at   | TIMESTAMP    |                          |                               |

**Índices:**
- `idx_territories_parent_id` ON parent_id
- `idx_territories_type` ON type
- `idx_territories_slug` ON slug (UNIQUE)
- `idx_territories_parent_type` ON (parent_id, type)

**Hierarquia:**

```
state (parent_id = NULL)
 └─ region (parent_id → state)
     └─ city (parent_id → region)
         └─ neighborhood (parent_id → city)
             └─ community (parent_id → neighborhood)
```

---

### 2.4 people

Cadastro unificado de pessoas.

| Campo           | Tipo         | Restrições               | Descrição                      |
|-----------------|--------------|--------------------------|--------------------------------|
| id              | UUID         | PK                       |                                |
| name            | VARCHAR(255) | NOT NULL                 | Nome completo                  |
| phone           | VARCHAR(20)  | NOT NULL                 | Telefone principal             |
| email           | VARCHAR(255) |                          | E-mail                         |
| category        | ENUM         | NOT NULL                 | lideranca, morador, empresario, vereador, ex_vereador, presidente_associacao, sindicato, influenciador, parceiro_institucional |
| territory_id    | UUID         | FK → territories.id      | Território de atuação          |
| contact_origin  | VARCHAR(100) |                          | Origem do contato (evento, indicação, visita, etc.) |
| notes           | TEXT         |                          | Observações                    |
| is_active       | BOOLEAN      | NOT NULL, default true   |                                |
| created_by      | UUID         | FK → users.id            | Quem cadastrou                 |
| created_at      | TIMESTAMP    | NOT NULL, default now()  |                                |
| updated_at      | TIMESTAMP    | NOT NULL, default now()  |                                |
| deleted_at      | TIMESTAMP    |                          | Soft delete                    |

**Índices:**
- `idx_people_phone` ON phone
- `idx_people_email` ON email
- `idx_people_territory_id` ON territory_id
- `idx_people_category` ON category
- `idx_people_created_by` ON created_by
- `idx_people_name` ON name (gin_trgm para busca全文)

**Campos NÃO armazenados (LGPD):**
- CPF
- Título eleitoral
- Zona eleitoral
- Seção eleitoral
- Dados sensíveis

---

### 2.5 leadership_network

Rede hierárquica de lideranças.

| Campo              | Tipo         | Restrições               | Descrição                       |
|--------------------|--------------|--------------------------|---------------------------------|
| id                 | UUID         | PK                       |                                 |
| leader_id          | UUID         | FK → people.id           | A pessoa que é liderança        |
| superior_id        | UUID         | FK → people.id           | Liderança superior (opcional)   |
| role               | VARCHAR(100) | NOT NULL                 | Cargo na hierarquia             |
| territory_id       | UUID         | FK → territories.id      | Território de atuação           |
| is_coordinator     | BOOLEAN      | NOT NULL, default false  | É coordenador?                  |
| start_date         | DATE         | NOT NULL                 | Início da atuação               |
| end_date           | DATE         |                          | Fim da atuação                  |
| is_active          | BOOLEAN      | NOT NULL, default true   |                                |
| created_at         | TIMESTAMP    | NOT NULL, default now()  |                                 |
| updated_at         | TIMESTAMP    | NOT NULL, default now()  |                                 |
| deleted_at         | TIMESTAMP    |                          |                                 |

**Índices:**
- `idx_leadership_leader_id` ON leader_id
- `idx_leadership_superior_id` ON superior_id
- `idx_leadership_territory_id` ON territory_id
- `idx_leadership_active` ON is_active

**Regra de hierarquia:**
```
Coordenador Estadual
 └─ Coordenador Regional
     └─ Coordenador Municipal
         └─ Liderança Comunitária
             └─ Rede Local
```

---

### 2.6 demands

Gestão de demandas com pipeline.

| Campo           | Tipo         | Restrições               | Descrição                       |
|-----------------|--------------|--------------------------|---------------------------------|
| id              | UUID         | PK                       |                                 |
| title           | VARCHAR(255) | NOT NULL                 | Título resumido                 |
| description     | TEXT         |                          | Descrição detalhada             |
| category        | ENUM         | NOT NULL                 | saude, educacao, infraestrutura, transporte, agricultura, assistencia_social, regularizacao_fundiaria, outro |
| status          | ENUM         | NOT NULL, default 'received' | recebida, triagem, encaminhada, acompanhamento, resolvida, encerrada |
| priority        | ENUM         | NOT NULL, default 'media' | baixa, media, alta, urgente     |
| territory_id    | UUID         | FK → territories.id      | Território da demanda            |
| requester_id    | UUID         | FK → people.id           | Pessoa que solicitou             |
| assigned_to     | UUID         | FK → users.id            | Responsável atual                |
| assigned_by     | UUID         | FK → users.id            | Quem designou                    |
| solution        | TEXT         |                          | Descrição da solução             |
| resolved_at     | TIMESTAMP    |                          | Data de resolução                |
| closed_at       | TIMESTAMP    |                          | Data de encerramento             |
| created_by      | UUID         | FK → users.id            | Quem registrou                   |
| created_at      | TIMESTAMP    | NOT NULL, default now()  |                                 |
| updated_at      | TIMESTAMP    | NOT NULL, default now()  |                                 |
| deleted_at      | TIMESTAMP    |                          |                                 |

**Pipeline (fluxo obrigatório):**

```
recebida → triagem → encaminhada → acompanhamento → resolvida → encerrada
```

- Não pode pular etapas
- Pode retroceder de `acompanhamento` para `triagem` (se precisar reavaliar)
- Só `resolvida` pode ir para `encerrada`
- `encerrada` é estado terminal

**Índices:**
- `idx_demands_status` ON status
- `idx_demands_category` ON category
- `idx_demands_territory_id` ON territory_id
- `idx_demands_requester_id` ON requester_id
- `idx_demands_assigned_to` ON assigned_to
- `idx_demands_priority` ON priority
- `idx_demands_created_at` ON created_at

---

### 2.7 demand_history

Histórico de alterações de cada demanda.

| Campo        | Tipo         | Restrições               | Descrição                    |
|--------------|--------------|--------------------------|------------------------------|
| id           | UUID         | PK                       |                              |
| demand_id    | UUID         | FK → demands.id          | Demanda vinculada            |
| field        | VARCHAR(50)  | NOT NULL                 | Campo alterado               |
| old_value    | TEXT         |                          | Valor anterior               |
| new_value    | TEXT         |                          | Novo valor                   |
| changed_by   | UUID         | FK → users.id            | Quem alterou                 |
| created_at   | TIMESTAMP    | NOT NULL, default now()  |                              |

**Índices:**
- `idx_demand_history_demand_id` ON demand_id
- `idx_demand_history_changed_by` ON changed_by

---

### 2.8 activities

Registro operacional de ações realizadas.

| Campo         | Tipo         | Restrições               | Descrição                      |
|---------------|--------------|--------------------------|--------------------------------|
| id            | UUID         | PK                       |                                |
| type          | ENUM         | NOT NULL                 | visita, reuniao, evento, ligacao, atendimento |
| title         | VARCHAR(255) | NOT NULL                 | Título da atividade            |
| description   | TEXT         |                          | Descrição detalhada            |
| territory_id  | UUID         | FK → territories.id      | Território vinculado           |
| people_ids    | UUID[]       |                          | Pessoas envolvidas (JSON)      |
| performed_by  | UUID         | FK → users.id            | Quem realizou                  |
| performed_at  | TIMESTAMP    | NOT NULL                 | Data/hora da atividade         |
| duration_min  | INTEGER      |                          | Duração em minutos             |
| location      | VARCHAR(255) |                          | Local (endereço ou nome)       |
| coordinates   | POINT        |                          | Coordenadas geográficas        |
| notes         | TEXT         |                          | Observações internas           |
| is_public     | BOOLEAN      | NOT NULL, default false  | Visível para lideranças?       |
| created_at    | TIMESTAMP    | NOT NULL, default now()  |                                |
| updated_at    | TIMESTAMP    | NOT NULL, default now()  |                                |
| deleted_at    | TIMESTAMP    |                          |                                |

**Índices:**
- `idx_activities_type` ON type
- `idx_activities_territory_id` ON territory_id
- `idx_activities_performed_by` ON performed_by
- `idx_activities_performed_at` ON performed_at
- `idx_activities_people_ids` ON people_ids (GIN)

---

### 2.9 events

Agenda de eventos, reuniões, audiências, viagens.

| Campo         | Tipo         | Restrições               | Descrição                    |
|---------------|--------------|--------------------------|------------------------------|
| id            | UUID         | PK                       |                              |
| title         | VARCHAR(255) | NOT NULL                 | Título do evento             |
| description   | TEXT         |                          | Descrição                    |
| type          | ENUM         | NOT NULL                 | reuniao, evento, audiencia, viagem, visita, entrevista |
| territory_id  | UUID         | FK → territories.id      | Território vinculado         |
| start_at      | TIMESTAMP    | NOT NULL                 | Início                       |
| end_at        | TIMESTAMP    | NOT NULL                 | Término                      |
| all_day       | BOOLEAN      | NOT NULL, default false  | Evento de dia inteiro?       |
| location      | VARCHAR(255) |                          | Local                        |
| address       | TEXT         |                          | Endereço completo            |
| coordinates   | POINT        |                          | Coordenadas geográficas      |
| created_by    | UUID         | FK → users.id            | Quem criou                   |
| status        | ENUM         | NOT NULL, default 'scheduled' | scheduled, confirmed, cancelled, completed |
| notes         | TEXT         |                          | Observações                  |
| color         | VARCHAR(7)   |                          | Cor do calendário (#hex)     |
| created_at    | TIMESTAMP    | NOT NULL, default now()  |                              |
| updated_at    | TIMESTAMP    | NOT NULL, default now()  |                              |
| deleted_at    | TIMESTAMP    |                          |                              |

**Índices:**
- `idx_events_type` ON type
- `idx_events_territory_id` ON territory_id
- `idx_events_start_end` ON (start_at, end_at)
- `idx_events_created_by` ON created_by
- `idx_events_status` ON status

---

### 2.10 event_participants

Participantes de eventos.

| Campo       | Tipo         | Restrições               | Descrição            |
|-------------|--------------|--------------------------|----------------------|
| id          | UUID         | PK                       |                      |
| event_id    | UUID         | FK → events.id           | Evento               |
| person_id   | UUID         | FK → people.id           | Participante         |
| role        | VARCHAR(100) |                          | Função no evento     |
| confirmed   | BOOLEAN      | NOT NULL, default false  | Confirmou presença?  |
| created_at  | TIMESTAMP    | NOT NULL, default now()  |                      |

**Índices:**
- `idx_event_participants_event_id` ON event_id
- `idx_event_participants_person_id` ON person_id
- UNIQUE ON (event_id, person_id)

---

### 2.11 surveys

Pesquisas de campo (coleta territorial).

| Campo           | Tipo         | Restrições               | Descrição                       |
|-----------------|--------------|--------------------------|---------------------------------|
| id              | UUID         | PK                       |                                 |
| title           | VARCHAR(255) | NOT NULL                 | Título da pesquisa              |
| territory_id    | UUID         | FK → territories.id      | Território alvo                 |
| collected_by    | UUID         | FK → users.id            | Quem coletou                    |
| collected_at    | TIMESTAMP    | NOT NULL                 | Data da coleta                  |
| sentiment       | ENUM         | NOT NULL                 | muito_favoravel, favoravel, neutro, resistente, muito_resistente |
| problems        | TEXT[]       |                          | Lista de problemas identificados|
| priorities      | TEXT[]       |                          | Prioridades apontadas           |
| notes           | TEXT         |                          | Observações do coletor          |
| created_at      | TIMESTAMP    | NOT NULL, default now()  |                                 |
| updated_at      | TIMESTAMP    | NOT NULL, default now()  |                                 |
| deleted_at      | TIMESTAMP    |                          |                                 |

**Índices:**
- `idx_surveys_territory_id` ON territory_id
- `idx_surveys_collected_by` ON collected_by
- `idx_surveys_sentiment` ON sentiment
- `idx_surveys_collected_at` ON collected_at

---

### 2.12 survey_questions

Perguntas de cada pesquisa.

| Campo       | Tipo         | Restrições               | Descrição           |
|-------------|--------------|--------------------------|---------------------|
| id          | UUID         | PK                       |                     |
| survey_id   | UUID         | FK → surveys.id          | Pesquisa vinculada  |
| question    | TEXT         | NOT NULL                 | Texto da pergunta   |
| answer      | TEXT         |                          | Resposta            |
| answer_type | ENUM         | NOT NULL, default 'text' | text, number, multiple_choice, scale |
| options     | JSONB        |                          | Opções (multiple_choice) |
| created_at  | TIMESTAMP    | NOT NULL, default now()  |                     |

**Índices:**
- `idx_survey_questions_survey_id` ON survey_id

---

### 2.13 audit_logs

Auditoria de ações no sistema.

| Campo      | Tipo         | Restrições               | Descrição                    |
|------------|--------------|--------------------------|------------------------------|
| id         | UUID         | PK                       |                              |
| user_id    | UUID         | FK → users.id            | Usuário que executou a ação  |
| action     | VARCHAR(50)  | NOT NULL                 | create, update, delete, login, logout |
| entity     | VARCHAR(50)  | NOT NULL                 | Tabela/entidade alvo         |
| entity_id  | VARCHAR(50)  |                          | ID do registro               |
| changes    | JSONB        |                          | Alterações (campo → valor)   |
| ip         | VARCHAR(45)  |                          | Endereço IP                  |
| user_agent | VARCHAR(500) |                          | User agent                   |
| created_at | TIMESTAMP    | NOT NULL, default now()  |                              |

**Índices:**
- `idx_audit_logs_user_id` ON user_id
- `idx_audit_logs_action` ON action
- `idx_audit_logs_entity` ON entity
- `idx_audit_logs_created_at` ON created_at

---

## 3. MAPA DE RELACIONAMENTOS

```
roles ──< users
  │
  └── (role_id)

users ──< audit_logs
  │
  ├── (created_by) ──> people
  ├── (assigned_to) ──> demands
  ├── (performed_by) ──> activities
  ├── (created_by) ──> events
  └── (collected_by) ──> surveys

territories ──< territories (self: parent_id)
  │
  ├── (territory_id) ──> users
  ├── (territory_id) ──> people
  ├── (territory_id) ──> demands
  ├── (territory_id) ──> activities
  ├── (territory_id) ──> events
  ├── (territory_id) ──> surveys
  └── (territory_id) ──> leadership_network

people ──< demands (requester_id)
  │
  ├── (leader_id) ──> leadership_network
  ├── (superior_id) ──> leadership_network
  └── (person_id) ──> event_participants

demands ──< demand_history
```

---

## 4. REGRAS DE INTEGRIDADE

### 4.1 Cascade

| Tabela pai     | Tabela filha        | On Delete |
|----------------|---------------------|-----------|
| territories    | territories         | RESTRICT  |
| territories    | people              | RESTRICT  |
| territories    | demands             | RESTRICT  |
| territories    | activities          | SET NULL  |
| territories    | events              | SET NULL  |
| territories    | surveys             | RESTRICT  |
| people         | demands (requester) | RESTRICT  |
| people         | leadership_network  | CASCADE   |
| users          | audit_logs          | SET NULL  |
| demands        | demand_history      | CASCADE   |
| events         | event_participants  | CASCADE   |
| surveys        | survey_questions    | CASCADE   |

### 4.2 Unique Constraints

- `users.email`
- `roles.name`
- `roles.level`
- `territories.slug`
- `event_participants` (event_id + person_id)

---

## 5. PLANO DE MIGRAÇÃO (ORDEM DAS TABELAS)

| Ordem | Tabela              | Fase      |
|-------|---------------------|-----------|
| 1     | roles               | Fase 01   |
| 2     | users               | Fase 01   |
| 3     | audit_logs          | Fase 01   |
| 4     | territories         | Fase 02   |
| 5     | people              | Fase 03   |
| 6     | leadership_network  | Fase 04   |
| 7     | demands             | Fase 05   |
| 8     | demand_history      | Fase 05   |
| 9     | events              | Fase 06   |
| 10    | event_participants  | Fase 06   |
| 11    | activities          | Fase 07   |
| 12    | surveys             | Fase 08   |
| 13    | survey_questions    | Fase 08   |

---

## 6. EXTENSÕES PostgreSQL NECESSÁRIAS

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Full text search (people.name)
CREATE EXTENSION IF NOT EXISTS "postgis";       -- Geospatial (coordinates) — futuro
```
