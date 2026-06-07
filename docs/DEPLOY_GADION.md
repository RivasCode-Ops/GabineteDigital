# Deploy — Gabinete Digital em gadion.com.br

## Informações

| Item | Valor |
|---|---|
| Domínio | `app.gadion.com.br` |
| VPS | Contabo, Ubuntu 22.04 |
| Repositório | Público (git clone sem senha) |
| Conflito | Verificar se porta 80/443 já está ocupada |

---

## 1. DNS (Cloudflare)

Criar registro **A**:

```
app.gadion.com.br → IP_DA_VPS
```

SSL/TLS: **Full (Strict)**

---

## 2. Acessar VPS

```bash
ssh root@IP_DA_VPS
```

---

## 3. Atualizar sistema

```bash
apt update && apt upgrade -y
```

---

## 4. Verificar conflito de portas

```bash
ss -tlnp | grep -E ':(80|443) '
```

Se retornar algo, existe um serviço usando porta 80/443. Anote qual é.

---

## 5. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sh
docker --version
```

---

## 6. Instalar Docker Compose

```bash
apt install docker-compose-plugin -y
docker compose version
```

---

## 7. Criar diretório e clonar

```bash
mkdir -p /opt/gabinete-digital
cd /opt/gabinete-digital
git clone https://github.com/RivasCode-Ops/GabineteDigital.git .
```

---

## 8. Criar .env

```bash
nano .env
```

Conteúdo:

```env
DOMAIN=gadion.com.br
DATABASE_URL=postgresql://gabinete:SENHA_AQUI@db:5432/gabinete_digital
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=https://app.gadion.com.br
DB_USER=gabinete
DB_PASS=SENHA_AQUI
DB_NAME=gabinete_digital
LOG_LEVEL=info
```

> `SENHA_AQUI` — escolha uma senha forte. `AUTH_SECRET` — o comando `openssl` gera uma.

---

## 9. Gerar certificado SSL

Cloudflare → SSL/TLS → Origin Server → Create Certificate

Baixar:

```
cert.pem → /opt/gabinete-digital/nginx/ssl/cert.pem
key.pem  → /opt/gabinete-digital/nginx/ssl/key.pem
```

---

## 10. IPs Cloudflare

```bash
bash /opt/gabinete-digital/scripts/update-cloudflare-ips.sh
```

---

## 11. Subir containers

```bash
docker compose -f docker-compose.prod.yml up -d
```

Aguardar ~30s:

```bash
docker ps
```

Deverá ver 4 containers: `gabinete-app`, `gabinete-db`, `gabinete-nginx`, `gabinete-backup`.

---

## 12. Migrations

```bash
docker exec gabinete-app npx prisma migrate deploy
```

---

## 13. Seed (admin)

```bash
docker exec gabinete-app npx prisma db seed
```

Admin padrão:

```
Login: admin@gabinete.com
Senha: admin123
```

**Altere a senha no primeiro login.**

---

## 14. Verificar health

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/health/live
curl http://localhost:3000/api/v1/health/ready
```

---

## 15. Testar pelo navegador

```
https://app.gadion.com.br
```

---

## 16. Backup de verificação

```bash
docker exec gabinete-backup sh /usr/local/bin/backup.sh
ls -la /opt/gabinete-digital/backups/
```

---

## Checklist Final

```
✅ app.gadion.com.br → DNS apontado
✅ Cloudflare Full (Strict)
✅ Ubuntu 22.04 atualizado
✅ Docker + Compose instalados
✅ Projeto clonado
✅ .env criado
✅ SSL gerado (Origin CA)
✅ Containers rodando (docker ps)
✅ Migrations aplicadas
✅ Admin criado (admin@gabinete.com)
✅ Health endpoints OK
✅ Backup gerado
```

---

## Se algo der errado

| Sintoma | Provável causa |
|---|---|
| `docker ps` vazio | Docker não instalado ou .env inválido |
| Health endpoint 503 | Banco não pronto ou migration pendente |
| SSL não funciona | Certificado não copiado para nginx/ssl/ |
| Porta 80 ocupada | Conflito com serviço existente |
| Domain não abre | DNS não propagado (aguardar ou verificar Cloudflare) |

---

## Próximo passo após deploy

Semana 2 — Treinamento presencial (roteiro em `docs/TREINAMENTO_PRESENCIAL.md`)
