# Deploy — Gabinete Digital

## Estratégia em 3 fases

```
Fase 1 — Teste por IP (porta 3000, sem SSL)
Fase 2 — Subdomínio em domínio existente (Cloudflare + SSL)
Fase 3 — Domínio próprio (gadion.com.br ou outro, após piloto)
```

---

## Informações

| Item | Valor |
|---|---|
| VPS | Contabo, Ubuntu 22.04 |
| Repositório | Público |
| Usuário SSH | root (ou seu usuário) |

---

## Fase 1 — Teste por IP

### 1. Acessar VPS

```bash
ssh root@IP_DA_VPS
```

### 2. Atualizar sistema

```bash
apt update && apt upgrade -y
```

### 3. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
docker --version
```

### 4. Instalar Docker Compose

```bash
apt install docker-compose-plugin -y
docker compose version
```

### 5. Clonar repositório

```bash
mkdir -p /opt/gabinete-digital
cd /opt/gabinete-digital
git clone https://github.com/RivasCode-Ops/GabineteDigital.git .
```

### 6. Criar .env

```bash
nano .env
```

```env
DOMAIN=IP_DA_VPS
DATABASE_URL=postgresql://gabinete:SENHA_AQUI@db:5432/gabinete_digital
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=http://IP_DA_VPS:3000
DB_USER=gabinete
DB_PASS=SENHA_AQUI
DB_NAME=gabinete_digital
LOG_LEVEL=info
```

### 7. Subir containers

```bash
docker compose -f docker-compose.prod.yml up -d
docker ps
```

### 8. Migrations

```bash
docker exec gabinete-app npx prisma migrate deploy
```

### 9. Seed (admin)

```bash
docker exec gabinete-app npx prisma db seed
```

### 10. Testar

```
http://IP_DA_VPS:3000
Login: admin@gabinete.com
Senha: admin123
```

### 11. Verificar health

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/health/live
curl http://localhost:3000/api/v1/health/ready
```

---

## Fase 2 — Subdomínio (Cloudflare + SSL)

### Pré-requisitos

- Domínio existente (ex: executeempreendimentos.com.br)
- Cloudflare apontando para esse domínio
- Registro A: `app.executeempreendimentos.com.br → IP_DA_VPS`

### 12. Configurar .env

```bash
nano .env
```

```env
DOMAIN=app.executeempreendimentos.com.br
DATABASE_URL=postgresql://gabinete:SENHA_AQUI@db:5432/gabinete_digital
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=https://app.executeempreendimentos.com.br
DB_USER=gabinete
DB_PASS=SENHA_AQUI
DB_NAME=gabinete_digital
LOG_LEVEL=info
```

### 13. Gerar certificado SSL (Cloudflare Origin CA)

Cloudflare → SSL/TLS → Origin Server → Create Certificate

Permissão: `app.executeempreendimentos.com.br`

Salvar:

```
cert.pem → nginx/ssl/cert.pem
key.pem  → nginx/ssl/key.pem
```

### 14. Ativar SSL no nginx

Editar `nginx/nginx.conf` — descomentar o bloco `server :443`:

```bash
nano nginx/nginx.conf
```

Remover as `# ` do início de cada linha do bloco SSL.

### 15. Reiniciar nginx

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

### 16. Verificar SSL

```
https://app.executeempreendimentos.com.br
```

Cloudflare → SSL/TLS: **Full (Strict)**

### 17. Backup de verificação

```bash
docker exec gabinete-backup sh /usr/local/bin/backup.sh
ls -la backups/
```

---

## Fase 3 — Domínio próprio (pós-piloto)

Quando o piloto validar o nome "Gadion" (ou outro):

1. Comprar o domínio (ex: gadion.com.br)
2. Apontar DNS para o mesmo IP
3. Atualizar `.env`:
   - `DOMAIN=gadion.com.br`
   - `AUTH_URL=https://app.gadion.com.br`
4. Atualizar certificado SSL no Cloudflare
5. `docker compose -f docker-compose.prod.yml restart app nginx`

---

## Checklist por fase

### Fase 1 — IP

```
□ VPS contratada e acessível
□ Docker + Compose instalados
□ Projeto clonado
□ .env criado
□ Containers rodando
□ Migrations executadas
□ Admin criado
□ Health endpoints OK
□ Acessível via http://IP:3000
```

### Fase 2 — Subdomínio

```
□ DNS: app.executeempreendimentos.com.br → IP
□ Cloudflare ativo
□ .env atualizado com domínio
□ Certificado SSL (Origin CA) gerado
□ nginx.conf com SSL descomentado
□ HTTPS funcionando
□ Backup testado
```

### Fase 3 — Domínio próprio

```
□ Domínio comprado
□ DNS apontado
□ .env atualizado
□ SSL atualizado
□ Containers reiniciados
```
