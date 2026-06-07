# Deploy — Gabinete Digital

## Estratégia em 3 fases

```
Fase 1 — Teste por IP (porta 3000, sem SSL, temporário — horas/dias)
Fase 2 — Subdomínio em domínio existente (Cloudflare + SSL)
Fase 3 — Domínio próprio (após piloto validar o nome)
```

> ⚠️ **Fase 1 é temporária.** Não manter o sistema exposto por IP por mais que alguns dias. Assim que os 5 testes abaixo passarem, migrar para Fase 2.

---

## Informações

| Item | Valor |
|---|---|
| VPS | Contabo, Ubuntu 22.04 |
| Repositório | Público |
| Usuário SSH | root (ou seu usuário) |
| Subdomínio piloto | `piloto.executeempreendimentos.com.br` |

---

## Fase 1 — Teste por IP (temporário)

> Duração máxima recomendada: horas a poucos dias. Tempo apenas para validar que o sistema funciona antes de colocar DNS + SSL.

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

---

## Critério para sair da Fase 1

Só avance para Fase 2 quando todos passarem:

```
□ Containers rodando (docker ps — 4 containers)
□ Health endpoint OK (curl /api/v1/health → status: ok)
□ Login admin OK (admin@gabinete.com / admin123)
□ Backup gerado e restaurado (testar pg_restore)
□ Analytics gerando eventos (navegar em 2-3 páginas e checar /analytics)
```

---

## Fase 2 — Subdomínio (Cloudflare + SSL)

### Pré-requisitos

- Domínio existente (ex: executeempreendimentos.com.br)
- Cloudflare apontando para esse domínio
- Registro A: `piloto.executeempreendimentos.com.br → IP_DA_VPS`

### 12. Criar subdomínio no Cloudflare

```
Tipo: A
Nome: piloto
Valor: IP_DA_VPS
Proxy: Ativado (laranja)
```

### 13. Configurar .env

```bash
nano .env
```

```env
DOMAIN=piloto.executeempreendimentos.com.br
DATABASE_URL=postgresql://gabinete:SENHA_AQUI@db:5432/gabinete_digital
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=https://piloto.executeempreendimentos.com.br
DB_USER=gabinete
DB_PASS=SENHA_AQUI
DB_NAME=gabinete_digital
LOG_LEVEL=info
```

### 14. Gerar certificado SSL (Cloudflare Origin CA)

Cloudflare → SSL/TLS → Origin Server → Create Certificate

Permissão: `piloto.executeempreendimentos.com.br`

Salvar:

```
cert.pem → nginx/ssl/cert.pem
key.pem  → nginx/ssl/key.pem
```

### 15. Ativar SSL no nginx

Editar `nginx/nginx.conf` — descomentar o bloco `server :443`:

```bash
nano nginx/nginx.conf
```

Remover as `# ` do início de cada linha do bloco SSL.

### 16. Reiniciar nginx

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

### 17. Verificar SSL

```
https://piloto.executeempreendimentos.com.br
```

Cloudflare → SSL/TLS: **Full (Strict)**

### 18. Backup de verificação

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

### Fase 1 — IP (temporário)

```
□ VPS contratada e acessível
□ Docker + Compose instalados
□ Projeto clonado
□ .env criado
□ Containers rodando (4 containers)
□ Migrations executadas
□ Admin criado
□ Health endpoints OK (/health, /live, /ready)
□ Login funciona (admin@gabinete.com)
□ Backup gerado e restaurado
□ Analytics gerando eventos
□ Acessível via http://IP:3000
```

> ✅ Todos verdes? Hora de migrar para Fase 2. Não prolongue a Fase 1.

### Fase 2 — Subdomínio

```
□ DNS: piloto.executeempreendimentos.com.br → IP
□ Proxy Cloudflare ativado (laranja)
□ SSL/TLS: Full (Strict)
□ .env atualizado com DOMAIN + AUTH_URL
□ Certificado Origin CA gerado
□ cert.pem + key.pem em nginx/ssl/
□ nginx.conf descomentado (SSL ativo)
□ docker compose restart nginx
□ HTTPS funcionando (cadeado verde)
□ Backup verificado
```

### Fase 3 — Domínio próprio (pós-piloto)

```
□ Nome validado pelo piloto
□ Domínio comprado
□ DNS apontado
□ .env atualizado
□ SSL atualizado no Cloudflare
□ Containers reiniciados
```
