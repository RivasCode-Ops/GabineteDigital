# ARCHITECTURE.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-05  
**Autor:** Arquitetura do Produto

---

## 1. VISÃO GERAL

```
┌─────────────────────────────────────────────────┐
│                    CLIENTE                        │
│            Next.js 15 App Router                  │
│         Tailwind CSS + Shadcn/UI                  │
│         React Hook Form + Zod                     │
└────────────────────┬────────────────────────────┘
                     │ HTTP / JSON
                     ▼
┌─────────────────────────────────────────────────┐
│              API LAYER (Next.js)                  │
│            API Routes / Server Actions            │
│         Auth.js (JWT + Refresh Token)             │
└────────────────────┬────────────────────────────┘
                     │ Prisma ORM
                     ▼
┌─────────────────────────────────────────────────┐
│                   DATABASE                        │
│                   PostgreSQL                      │
│              Redis (futuro - cache)               │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│                    INFRA                          │
│               Docker / Docker Compose             │
│              Cloudflare (futuro)                  │
│              AWS S3 / R2 (storage)                │
└─────────────────────────────────────────────────┘
```

---

## 2. STACK TECNOLÓGICA

### 2.1 Frontend

| Tecnologia           | Versão  | Finalidade                          |
|----------------------|---------|--------------------------------------|
| Next.js              | 15.x    | Framework full-stack (App Router)    |
| TypeScript           | 5.x     | Tipagem estática                     |
| Tailwind CSS         | 4.x     | Estilização utilitária               |
| Shadcn/UI            | latest  | Componentes reutilizáveis            |
| React Hook Form      | 7.x     | Gerenciamento de formulários         |
| Zod                  | 3.x     | Validação de schemas                 |
| Lucide React         | latest  | Ícones                               |

### 2.2 Backend

| Tecnologia           | Versão  | Finalidade                          |
|----------------------|---------|--------------------------------------|
| Next.js API Routes   | 15.x    | API REST (serverless-ready)          |
| Auth.js (NextAuth)   | 5.x     | Autenticação + JWT + Refresh Token   |
| Prisma ORM           | 6.x     | ORM tipado para PostgreSQL           |
| Zod                  | 3.x     | Validação de entrada nas APIs        |

### 2.3 Banco de Dados

| Tecnologia           | Finalidade                          |
|----------------------|--------------------------------------|
| PostgreSQL           | Banco relacional principal           |
| Redis (futuro)       | Cache, filas, sessões                |

### 2.4 Infraestrutura

| Tecnologia           | Finalidade                          |
|----------------------|--------------------------------------|
| Docker               | Containerização                      |
| Docker Compose       | Orquestração local                   |
| PgAdmin              | Gerenciamento do banco (dev)         |
| Cloudflare (futuro)  | DNS, CDN, proteção                   |
| R2 / S3 (futuro)     | Storage de arquivos                  |

---

## 3. ESTRUTURA DE PASTAS

```
/
├── docker-compose.yml
├── Dockerfile
├── .env
├── .env.example
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── images/
│   └── icons/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/
    │   │   └── register/
    │   ├── (dashboard)/
    │   │   ├── dashboard/
    │   │   ├── territorios/
    │   │   ├── pessoas/
    │   │   ├── demandas/
    │   │   ├── agenda/
    │   │   ├── atividades/
    │   │   ├── pesquisas/
    │   │   ├── liderancas/
    │   │   ├── war-room/
    │   │   └── admin/
    │   ├── api/
    │   │   ├── auth/
    │   │   ├── territories/
    │   │   ├── people/
    │   │   ├── demands/
    │   │   ├── activities/
    │   │   ├── events/
    │   │   ├── surveys/
    │   │   └── ...
    │   └── layout.tsx
    ├── components/
    │   ├── ui/          (shadcn)
    │   ├── layout/
    │   │   ├── sidebar.tsx
    │   │   ├── topbar.tsx
    │   │   └── container.tsx
    │   ├── territories/
    │   ├── people/
    │   ├── demands/
    │   └── shared/
    ├── features/
    │   ├── auth/
    │   ├── territories/
    │   ├── people/
    │   ├── demands/
    │   └── ...
    ├── lib/
    │   ├── prisma.ts
    │   ├── auth.ts
    │   ├── utils.ts
    │   └── validations/
    ├── server/
    │   ├── actions/
    │   └── services/
    ├── types/
    │   └── index.ts
    ├── hooks/
    │   ├── use-auth.ts
    │   └── ...
    └── providers/
        ├── auth-provider.tsx
        └── theme-provider.tsx
```

---

## 4. ARQUITETURA DE MÓDULOS

Cada módulo de negócio segue o padrão:

```
features/
└── <modulo>/
    ├── components/     → componentes de UI específicos
    ├── schemas/        → schemas Zod
    ├── types/          → tipos TypeScript
    ├── actions.ts      → server actions
    └── api.ts          → funções de API client-side
```

### Separação por responsabilidade

```
src/
├── app/               → rotas e páginas (Next.js App Router)
├── components/        → componentes de UI reutilizáveis
├── features/          → lógica de negócio por módulo
├── lib/               → configurações e utilitários globais
├── server/            → lógica server-side (actions, serviços)
├── hooks/             → hooks React globais
├── providers/         → context providers
└── types/             → tipos globais
```

---

## 5. AUTENTICAÇÃO E AUTORIZAÇÃO

### Fluxo de Autenticação

```
Usuário → Login → Auth.js → JWT (access + refresh) → Prisma → PostgreSQL
                                                         ↓
                                              audit_logs (registro)
```

### Estratégia

- **Auth.js v5** como provedor de autenticação
- **JWT** com access token (curta duração: 15min)
- **Refresh token** (longa duração: 7 dias)
- **Middleware** Next.js para proteção de rotas
- **Roles** embutidas no JWT para autorização

### Perfis

| Perfil                  | Nível |
|-------------------------|-------|
| `ADMIN`                 | 100   |
| `COORDENADOR_GERAL`     | 80    |
| `COORDENADOR_REGIONAL`  | 60    |
| `COORDENADOR_MUNICIPAL` | 40    |
| `LIDERANCA`             | 20    |
| `OPERADOR`              | 10    |

---

## 6. BANCO DE DADOS

### Estratégia

- **Prisma ORM** como camada de acesso
- **PostgreSQL** como banco relacional
- Migrations versionadas com Prisma Migrate
- Seed para dados iniciais (perfis, admin padrão)

### Conexão (lib/prisma.ts)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 7. API

### Estratégia

- **API Routes** do Next.js (padrão REST)
- **Server Actions** para mutações em formulários
- Validação com **Zod** em toda entrada
- Respostas padronizadas:

```typescript
// Sucesso
{ "data": {}, "message": "string" }

// Erro
{ "error": "string", "code": "string" }
```

### Versionamento

- Rotas versionadas via prefixo `/api/v1/...` (se necessário)
- Inicialmente sem versionamento explícito

---

## 8. SEGURANÇA

- **BCrypt** para hash de senhas
- **Helmet** headers de segurança
- **Rate limiting** por IP (futuro)
- **CORS** configurado
- **CSRF** via double-submit cookie pattern (Auth.js nativo)
- **Auditoria** em toda ação crítica (tabela `audit_logs`)

---

## 9. OBSERVABILIDADE

| Camada    | Ferramenta          | Status     |
|-----------|---------------------|------------|
| Logs      | `audit_logs` (DB)   | MVP        |
| Logs      | Winston / Pino      | Futuro     |
| Métricas  | Sentry              | Futuro     |
| Monitoring| Prometheus + Grafana | Futuro     |

---

## 10. INFRAESTRUTURA E DEPLOY

### Desenvolvimento

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
  pgadmin:
    image: dpage/pgadmin4
```

### Produção (futuro)

```
Plataforma:  Railway / Render / Vercel + instância gerenciada PostgreSQL
Storage:     AWS S3 / Cloudflare R2
CDN:         Cloudflare
DNS:         Cloudflare
```

### CI/CD (futuro)

```
GitHub Actions → Lint → Test → Build → Deploy
```

---

## 11. DECISÕES ARQUITETURAIS (ADRs)

### ADR-001: Monorepo vs Microsserviços

**Decisão:** Monorepo com Next.js full-stack.  
**Motivo:** Equipe única, escopo delimitado, simplicidade operacional. Microsserviços adicionariam complexidade sem benefício imediato.

### ADR-002: Server Actions vs API Routes

**Decisão:** Usar ambos — API Routes para operações CRUD padrão, Server Actions para mutações de formulário com validação server-side.  
**Motivo:** Server Actions reduzem boilerplate em formulários; API Routes oferecem contratos REST claros para integrações futuras.

### ADR-003: Auth.js vs Firebase Auth

**Decisão:** Auth.js (NextAuth).  
**Motivo:** Open source, auto-gerenciado, sem vendor lock-in, LGPD compliance mais simples.

### ADR-004: Prisma vs Drizzle

**Decisão:** Prisma ORM.  
**Motivo:** Maturidade, geração de tipos automática, migrations declarativas, ecossistema consolidado com Next.js.

### ADR-005: Banco Relacional Único

**Decisão:** PostgreSQL como banco único.  
**Motivo:** Dados altamente relacionais (territórios → pessoas → demandas), consultas complexas de inteligência territorial, consistência ACID.

---

## 12. PADRÕES DE CÓDIGO

- **Nomes:** camelCase para variáveis/funções, PascalCase para componentes/types, kebab-case para arquivos
- **Imports:** absolutos com alias `@/` (mapeado para `src/`)
- **Componentes:** Server Components por padrão, Client Components apenas quando necessário (use client)
- **Validação:** Zod em toda camada de entrada (formulários, API, server actions)
- **Erros:** Tratamento centralizado com `error.tsx` e `not-found.tsx` do Next.js
