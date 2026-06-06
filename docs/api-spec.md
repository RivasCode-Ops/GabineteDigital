# API_SPEC.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-06  
**Base:** Next.js API Routes + Server Actions

---

## 1. PADRÕES

### 1.1 Formato de Resposta

```typescript
// Sucesso
{
  "data": T,
  "message": "string opcional"
}

// Lista paginada
{
  "data": T[],
  "meta": {
    "total": number,
    "page": number,
    "perPage": number,
    "totalPages": number
  }
}

// Erro
{
  "error": "string",
  "code": "string opcional"
}
```

### 1.2 Status Codes

| Código | Significado             |
|--------|-------------------------|
| 200    | OK                      |
| 201    | Criado                  |
| 204    | Excluído (sem corpo)    |
| 400    | Requisição inválida      |
| 401    | Não autenticado          |
| 403    | Sem permissão            |
| 404    | Não encontrado           |
| 409    | Conflito                 |
| 422    | Erro de validação        |
| 500    | Erro interno             |

### 1.3 Autenticação

- Header: `Authorization: Bearer <token>` (via cookie JWT do Auth.js)
- Rotas públicas: `/api/auth/*`, `/api/health`
- Demais rotas: protegidas por middleware + verificação de role

### 1.4 Paginação

Parâmetros padrão: `?page=1&perPage=20` (máximo 100)

---

## 2. AUTENTICAÇÃO

### POST /api/auth/login

Corpo:
```json
{
  "email": "admin@gabinete.com",
  "password": "admin123"
}
```

Resposta: `200` — Sessão JWT criada (cookie)

### POST /api/auth/logout

Resposta: `200` — Cookie removido

### GET /api/auth/session

Resposta: `200` — Dados da sessão atual

```json
{
  "data": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@gabinete.com",
    "role": "ADMIN",
    "roleLevel": 100
  }
}
```

---

## 3. TERRITÓRIOS

### GET /api/v1/territories

Lista territórios com filtro hierárquico.

**Query:**
| Parâmetro  | Tipo    | Descrição                    |
|------------|---------|------------------------------|
| type       | string  | state, region, city, neighborhood, community |
| parent_id  | uuid    | Filtrar por pai              |
| search     | string  | Busca por nome               |
| page       | number  | Página                       |
| perPage    | number  | Itens por página             |

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "São Paulo",
      "type": "state",
      "slug": "estado-sao-paulo",
      "parentId": null,
      "childrenCount": 5
    }
  ],
  "meta": { "total": 27, "page": 1, "perPage": 20, "totalPages": 2 }
}
```

### GET /api/v1/territories/:id

**Resposta:**
```json
{
  "data": {
    "id": "uuid",
    "name": "São Paulo",
    "type": "state",
    "slug": "estado-sao-paulo",
    "parentId": null,
    "population": 12300000,
    "ibgeCode": "3550308",
    "isActive": true,
    "children": [
      { "id": "uuid", "name": "Capital", "type": "region", "slug": "regiao-capital" }
    ],
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

### POST /api/v1/territories

**Corpo:**
```json
{
  "name": "São Paulo",
  "type": "state",
  "parentId": null,
  "population": 12300000,
  "ibgeCode": "3550308"
}
```

**Resposta:** `201`

### PUT /api/v1/territories/:id

**Corpo:** (mesmo do POST, campos opcionais)

**Resposta:** `200`

### DELETE /api/v1/territories/:id

**Resposta:** `204` (soft delete)

**Regras:**
- `ADMIN` apenas
- Bloqueado se território tiver filhos ativos (400)

### GET /api/v1/territories/tree

Árvore territorial completa.

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "São Paulo",
      "type": "state",
      "children": [
        {
          "id": "uuid",
          "name": "Capital",
          "type": "region",
          "children": [
            {
              "id": "uuid",
              "name": "São Paulo",
              "type": "city",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. PESSOAS

### GET /api/v1/people

**Query:**
| Parâmetro    | Tipo    | Descrição                    |
|--------------|---------|------------------------------|
| search       | string  | Busca por nome, telefone     |
| category     | string  | Filtrar por categoria        |
| territory_id | uuid    | Filtrar por território       |
| page         | number  | Página                       |
| perPage      | number  | Itens por página             |

### POST /api/v1/people

**Corpo:**
```json
{
  "name": "João Silva",
  "phone": "(11) 99999-9999",
  "email": "joao@email.com",
  "category": "lideranca",
  "territoryId": "uuid",
  "contactOrigin": "Evento do dia 15/05",
  "notes": "Liderança da comunidade Jardim América",
  "consentGiven": true,
  "consentIp": "192.168.0.1",
  "consentVersion": "1.0"
}
```

**Resposta:** `201`

### GET /api/v1/people/:id

### PUT /api/v1/people/:id

### DELETE /api/v1/people/:id

**Resposta:** `204` (soft delete)

### POST /api/v1/people/:id/anonymize

Anonimização de dados (exclusão a pedido do titular).

**Resposta:** `200`

---

## 5. LIDERANÇAS

### GET /api/v1/leaderships

**Query:**
| Parâmetro    | Tipo    | Descrição                    |
|--------------|---------|------------------------------|
| leader_id    | uuid    | Filtrar por liderança        |
| superior_id  | uuid    | Filtrar por superior         |
| territory_id | uuid    | Filtrar por território       |
| is_active    | boolean | Lideranças ativas/inativas   |

### POST /api/v1/leaderships

**Corpo:**
```json
{
  "leaderId": "uuid",
  "superiorId": "uuid",
  "role": "Coordenador Regional",
  "territoryId": "uuid",
  "isCoordinator": true,
  "startDate": "2026-01-15"
}
```

**Regras:**
- Validação de ciclo hierárquico (422 se ciclo detectado)
- Compatibilidade território-nível (422 se incompatível)

### DELETE /api/v1/leaderships/:id

---

## 6. DEMANDAS

### GET /api/v1/demands

**Query:**
| Parâmetro    | Tipo    | Descrição                    |
|--------------|---------|------------------------------|
| status       | string  | recebida, triagem, ..., encerrada |
| category     | string  | saude, educacao, ...         |
| priority     | string  | baixa, media, alta, urgente  |
| territory_id | uuid    | Filtrar por território       |
| assigned_to  | uuid    | Filtrar por responsável      |
| requester_id | uuid    | Filtrar por requerente       |
| search       | string  | Busca por título             |
| page         | number  | Página                       |
| perPage      | number  | Itens por página             |

### POST /api/v1/demands

**Corpo:**
```json
{
  "title": "Buraco na rua",
  "description": "Rua João XXIII, 150 - buraco grande no asfalto",
  "category": "infraestrutura",
  "priority": "alta",
  "territoryId": "uuid",
  "requesterId": "uuid"
}
```

**Resposta:** `201`

### GET /api/v1/demands/:id

### PUT /api/v1/demands/:id

### DELETE /api/v1/demands/:id

**Resposta:** `204` (soft delete)

### PATCH /api/v1/demands/:id/status

**Corpo:**
```json
{
  "status": "encaminhada",
  "assignedTo": "uuid"
}
```

**Regras:**
- Transição válida é validada (422 se inválida)
- Se passando para `triagem` ou superior, `assignedTo` é obrigatório
- Gera registro em `demand_history`

### GET /api/v1/demands/:id/history

**Resposta:**
```json
{
  "data": [
    {
      "field": "status",
      "oldValue": "recebida",
      "newValue": "triagem",
      "changedBy": { "id": "uuid", "name": "Admin" },
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

## 7. ATIVIDADES

### GET /api/v1/activities

**Query:**
| Parâmetro    | Tipo    | Descrição                    |
|--------------|---------|------------------------------|
| type         | string  | visita, reuniao, evento, ligacao, atendimento |
| territory_id | uuid    | Filtrar por território       |
| performed_by | uuid    | Filtrar por quem realizou    |
| start_date   | date    | Início do período            |
| end_date     | date    | Fim do período               |
| page         | number  | Página                       |
| perPage      | number  | Itens por página             |

### POST /api/v1/activities

**Corpo:**
```json
{
  "type": "visita",
  "title": "Visita à comunidade Jardim América",
  "description": "Reunião com lideranças locais",
  "territoryId": "uuid",
  "peopleIds": ["uuid1", "uuid2"],
  "performedAt": "2026-01-15T14:00:00Z",
  "durationMin": 60,
  "location": "Rua das Flores, 200"
}
```

**Observação:** `performedBy` é preenchido automaticamente com o usuário logado.

### GET /api/v1/activities/:id

### PUT /api/v1/activities/:id

### DELETE /api/v1/activities/:id

---

## 8. AGENDA / EVENTOS

### GET /api/v1/events

**Query:**
| Parâmetro    | Tipo    | Descrição                    |
|--------------|---------|------------------------------|
| type         | string  | reuniao, evento, audiencia, viagem, visita, entrevista |
| status       | string  | scheduled, confirmed, cancelled, completed |
| territory_id | uuid    | Filtrar por território       |
| start_date   | date    | Início do período            |
| end_date     | date    | Fim do período               |
| created_by   | uuid    | Filtrar por criador          |
| page         | number  | Página                       |
| perPage      | number  | Itens por página             |

### POST /api/v1/events

**Corpo:**
```json
{
  "title": "Reunião com coordenadores",
  "description": "Pauta: planejamento do mutirão",
  "type": "reuniao",
  "territoryId": "uuid",
  "startAt": "2026-01-20T09:00:00Z",
  "endAt": "2026-01-20T11:00:00Z",
  "allDay": false,
  "location": "Sede do gabinete",
  "status": "scheduled",
  "color": "#3b82f6",
  "participants": ["uuid1", "uuid2"]
}
```

### GET /api/v1/events/:id

### PUT /api/v1/events/:id

### DELETE /api/v1/events/:id

---

## 9. PESQUISAS

### GET /api/v1/surveys

**Query:**
| Parâmetro    | Tipo    | Descrição                    |
|--------------|---------|------------------------------|
| sentiment    | string  | muito_favoravel, favoravel, neutro, resistente, muito_resistente |
| territory_id | uuid    | Filtrar por território       |
| collected_by | uuid    | Filtrar por coletor          |
| start_date   | date    | Início do período            |
| end_date     | date    | Fim do período               |
| page         | number  | Página                       |
| perPage      | number  | Itens por página             |

### POST /api/v1/surveys

**Corpo:**
```json
{
  "title": "Pesquisa comunidade Jardim América",
  "territoryId": "uuid",
  "collectedAt": "2026-01-15T10:00:00Z",
  "sentiment": "favoravel",
  "problems": ["Falta de iluminação", "Buraco na rua"],
  "priorities": ["Iluminação pública"],
  "notes": "Comunidade receptiva",
  "questions": [
    {
      "question": "Como você avalia a atuação do gabinete?",
      "answer": "Boa",
      "answerType": "text"
    }
  ]
}
```

### GET /api/v1/surveys/:id

### DELETE /api/v1/surveys/:id

---

## 10. DASHBOARD

### GET /api/v1/dashboard/summary

**Resposta:**
```json
{
  "data": {
    "openDemands": 45,
    "resolvedDemands": 120,
    "activeCities": 12,
    "monthActivities": 340,
    "activeLeaders": 28,
    "monthSurveys": 15
  }
}
```

**Query:**
| Parâmetro    | Tipo    | Descrição                    |
|--------------|---------|------------------------------|
| territory_id | uuid    | Filtrar por território       |

---

## 11. ADMIN / AUDITORIA

### GET /api/v1/admin/users

**Query:** paginação + busca por nome/e-mail

### POST /api/v1/admin/users

Criar novo usuário:
```json
{
  "name": "João Coordenador",
  "email": "joao@gabinete.com",
  "password": "temp123456",
  "roleId": "uuid",
  "territoryId": "uuid"
}
```

### PATCH /api/v1/admin/users/:id

### DELETE /api/v1/admin/users/:id

### GET /api/v1/admin/audit-logs

**Query:**
| Parâmetro  | Tipo    | Descrição                    |
|------------|---------|------------------------------|
| user_id    | uuid    | Filtrar por usuário          |
| action     | string  | create, update, delete, login, logout |
| entity     | string  | Filtrar por entidade         |
| start_date | date    | Início do período            |
| end_date   | date    | Fim do período               |
| page       | number  | Página                       |
| perPage    | number  | Itens por página             |

---

## 12. HEALTH

### GET /api/health

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

---

## 13. MAPA DE ROTAS

```
Autenticação
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/session

Territórios
  GET    /api/v1/territories
  POST   /api/v1/territories
  GET    /api/v1/territories/tree
  GET    /api/v1/territories/:id
  PUT    /api/v1/territories/:id
  DELETE /api/v1/territories/:id

Pessoas
  GET    /api/v1/people
  POST   /api/v1/people
  GET    /api/v1/people/:id
  PUT    /api/v1/people/:id
  DELETE /api/v1/people/:id
  POST   /api/v1/people/:id/anonymize

Lideranças
  GET    /api/v1/leaderships
  POST   /api/v1/leaderships
  GET    /api/v1/leaderships/:id
  PUT    /api/v1/leaderships/:id
  DELETE /api/v1/leaderships/:id

Demandas
  GET    /api/v1/demands
  POST   /api/v1/demands
  GET    /api/v1/demands/:id
  PUT    /api/v1/demands/:id
  DELETE /api/v1/demands/:id
  PATCH  /api/v1/demands/:id/status
  GET    /api/v1/demands/:id/history

Atividades
  GET    /api/v1/activities
  POST   /api/v1/activities
  GET    /api/v1/activities/:id
  PUT    /api/v1/activities/:id
  DELETE /api/v1/activities/:id

Agenda / Eventos
  GET    /api/v1/events
  POST   /api/v1/events
  GET    /api/v1/events/:id
  PUT    /api/v1/events/:id
  DELETE /api/v1/events/:id

Pesquisas
  GET    /api/v1/surveys
  POST   /api/v1/surveys
  GET    /api/v1/surveys/:id
  DELETE /api/v1/surveys/:id

Dashboard
  GET    /api/v1/dashboard/summary

Admin
  GET    /api/v1/admin/users
  POST   /api/v1/admin/users
  PATCH  /api/v1/admin/users/:id
  DELETE /api/v1/admin/users/:id
  GET    /api/v1/admin/audit-logs

Health
  GET    /api/health
```
