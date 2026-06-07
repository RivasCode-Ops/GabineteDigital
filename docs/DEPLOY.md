# Guia de Deploy — Gabinete Digital

## Visão Geral

```
Usuário → Cloudflare (DNS + SSL) → VPS → NGINX → Next.js → PostgreSQL
                                        └── Backup diário (cron)
```

## Pré-requisitos

- VPS Ubuntu 22.04+ (mínimo: 2 vCPU, 4 GB RAM, 40 GB SSD)
- Domínio configurado no Cloudflare
- Docker + Docker Compose instalados
- Git + GitHub CLI configurados

## Passo a Passo

### 1. Cloudflare — DNS

| Tipo | Nome | Valor |
|---|---|---|
| A | @ | IP da VPS |
| A | www | IP da VPS |

- SSL/TLS: **Full (Strict)**
- Always Use HTTPS: **On**
- Auto Minify: **On** (JS, CSS, HTML)
- Brotli: **On**

### 2. Certificado SSL (Origin CA)

No Cloudflare:
```
SSL/TLS → Origin Server → Create Certificate
```

Baixar:
- `cert.pem` → `nginx/ssl/cert.pem`
- `key.pem` → `nginx/ssl/key.pem`

### 3. VPS — Setup Inicial

```bash
# Atualizar
apt update && apt upgrade -y

# Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Criar diretório
mkdir -p /opt/gabinete-digital/{nginx/{ssl,cloudflare},scripts,backups}
```

### 4. Clonar e Configurar

```bash
git clone https://github.com/RivasCode-Ops/GabineteDigital.git /opt/gabinete-digital
cd /opt/gabinete-digital
git checkout main

# Copiar secrets
cp .env.example .env
nano .env
```

### 5. Variáveis de Ambiente (.env)

```env
# Database
DB_USER=gabinete
DB_PASS=senha_segura_aqui
DB_NAME=gabinete_digital
DATABASE_URL=postgresql://gabinete:senha_segura_aqui@db:5432/gabinete_digital?schema=public

# Auth
AUTH_SECRET=openssl rand -base64 32  # gere um hash
AUTH_URL=https://seudominio.com.br

# SMTP (opcional)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@seudominio.com.br
SMTP_PASS=senha_smtp
SMTP_FROM=noreply@seudominio.com.br

# Domain (para URLs absolutas)
DOMAIN=seudominio.com.br
```

### 6. IPs Cloudflare

```bash
# Gerar configuração de IPs reais do Cloudflare
bash /opt/gabinete-digital/scripts/update-cloudflare-ips.sh
```

### 7. Iniciar

```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f
```

### 8. Migrations + Seed

```bash
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
docker compose -f docker-compose.prod.yml run --rm app npx prisma db seed
```

### 9. Verificar

```bash
curl https://seudominio.com.br/api/v1/health
curl https://seudominio.com.br/api/v1/health/live
curl https://seudominio.com.br/api/v1/health/ready
```

## Backup

O backup roda **todos os dias às 3h** (cron dentro do container `backup`):

- `/backups/gabinete_YYYYMMDD_HHMMSS.dump` — binário (pg_restore)
- `/backups/gabinete_YYYYMMDD_HHMMSS.sql.gz` — SQL portável
- **Retenção**: 7 dias

### Restaurar Backup

```bash
# Binário
pg_restore -h db -U gabinete -d gabinete_digital backups/gabinete_20260601_030000.dump

# SQL
gunzip -c backups/gabinete_20260601_030000.sql.gz | psql -h db -U gabinete -d gabinete_digital
```

### Backup Externo (S3)

Adicionar ao `.env`:
```env
AWS_S3_BUCKET=gabinete-backups
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

O script `backup.sh --s3` sincroniza com S3.

## CI/CD

O GitHub Actions faz:

1. **Build**: Gera imagem Docker e publica no GitHub Container Registry
2. **Deploy**: SSH na VPS, pull, migrate, restart

### Secrets do GitHub

| Secret | Valor |
|---|---|
| `VPS_HOST` | IP da VPS |
| `VPS_USER` | ubuntu (ou root) |
| `VPS_SSH_KEY` | Chave privada SSH |
| `VPS_PORT` | 22 (padrão) |

## Manutenção

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Atualizar

```bash
# Via CI/CD (recomendado): push no main
git push origin main

# Manual
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate app
```

### Parar

```bash
docker compose -f docker-compose.prod.yml down
```

### Atualizar IPs Cloudflare

```bash
# Periodicamente (ou via cron semanal)
bash /opt/gabinete-digital/scripts/update-cloudflare-ips.sh
```
