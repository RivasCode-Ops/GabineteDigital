# COMANDO 360 — Gabinete Digital

Plataforma de gestão territorial, relacionamento comunitário e inteligência política.

## Stack

| Tecnologia        | Versão |
|-------------------|--------|
| Next.js           | 15     |
| TypeScript        | 6.0    |
| Tailwind CSS      | 3.4    |
| Shadcn/UI         | —      |
| Prisma            | 7.8    |
| PostgreSQL        | 16     |
| Auth.js           | 5.0    |
| Docker            | —      |

## Estrutura

```
├── prisma/              # Schema + migrations + seed
├── src/
│   ├── app/             # Next.js App Router (rotas + páginas)
│   │   ├── (auth)/      # Login
│   │   └── (dashboard)/ # Painel protegido
│   ├── components/      # Componentes React reutilizáveis
│   ├── features/        # Lógica por módulo
│   ├── lib/             # Configs (auth, prisma, utils)
│   └── server/          # Server actions
├── docker-compose.yml
├── prisma.config.ts
└── docs/                # Documentação (.md)
```

## Pré-requisitos

- Node.js 18+ (recomendado 22+)
- Docker Desktop
- npm

## Setup

```bash
# 1. Subir banco de dados
docker compose up -d

# 2. Instalar dependências
npm install

# 3. Rodar migrations + seed
npx prisma migrate dev --config prisma.config.ts
npm run db:seed

# 4. Iniciar dev server
npm run dev
```

Acessar: [http://localhost:3000](http://localhost:3000)

Login padrão: `admin@gabinete.com` / `admin123`

## Docker

| Serviço     | Porta  |
|-------------|--------|
| PostgreSQL  | 15432  |
| PgAdmin     | 5050   |

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [architecture.md](architecture.md) | Arquitetura do sistema |
| [database.md](database.md) | Modelo de dados |
| [business-rules.md](business-rules.md) | Regras de negócio |
| [permissions.md](permissions.md) | Matriz de permissões |
| [lgpd.md](lgpd.md) | Adequação LGPD |
| [api-spec.md](api-spec.md) | Especificação de endpoints |
| [ui-ux.md](ui-ux.md) | Guia de identidade visual |
| [product-backlog.md](product-backlog.md) | Backlog priorizado |
