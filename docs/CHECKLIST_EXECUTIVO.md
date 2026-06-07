# Checklist Executivo — Pré-Deploy

## Domínio e Marca

| Item | Status | Ação necessária |
|---|---|---|
| Domínio definido | ⬜ | Comprar domínio (ex: gabinetedigital.com.br) |
| Nome comercial definitivo | ✅ "Gabinete Digital" | Pode registrar domínio e redes sociais |
| Logo definitiva | ⬜ | Criar ou contratar logo (Canvas, 99designs) |
| E-mail suporte (@dominio) | ⬜ | Configurar no provedor de e-mail |
| E-mail LGPD (@dominio) | ⬜ | privacidade@gabinetedigital.com.br |

## Páginas Públicas

| Item | Status | Ação necessária |
|---|---|---|
| Página institucional | ⬜ | Criar landing page com pitch + planos + CTA |
| Política de privacidade publicada | 📄 Conteúdo em docs/CONTRATO_LGPD.md | Publicar em /privacidade |
| Termos de uso publicados | 📄 Conteúdo em docs/CONTRATO_LGPD.md | Publicar em /termos |
| Página de login | ✅ Existe | Ajustar link para domínio real |

## Técnico (VPS)

| Item | Status | Ação necessária |
|---|---|---|
| VPS provisionada | ⬜ | Contratar DigitalOcean / Hetzner (2 vCPU, 4 GB) |
| Docker + Compose instalados | ⬜ | `apt install docker docker-compose-plugin` |
| .env configurado | ⬜ | Copiar .env.example → .env, preencher secrets |
| SSL configurado (Cloudflare) | ⬜ | Origin CA + nginx/ssl/ |
| Migrations executadas | ⬜ | `docker compose run app npx prisma migrate deploy` |
| Seed executado | ⬜ | `docker compose run app npx prisma db seed` |
| Backup testado (restauração) | ⬜ | Rodar backup.sh, depois pg_restore para validar |

## Conteúdo Inicial

| Item | Status | Ação necessária |
|---|---|---|
| Admin criado | ✅ Seed: admin@gabinete.com | Email/Senha serão alterados na VPS |
| Base demo carregada | ⬜ | Rodar scripts/load-test.ts ou SQL de docs/BASE_DEMO.md |
| Territórios iniciais | ⬜ | Criar via interface após login |

## Analytics

| Item | Status | Ação necessária |
|---|---|---|
| Código implantado | ✅ POST /api/v1/analytics/track | Já está no deploy |
| Gerando eventos | ⬜ | Só gera quando usuários navegarem |
| Dashboard acessível | ✅ /analytics (nível 80+) | Verificar após primeiros acessos |

## Contratos e LGPD

| Item | Status | Ação necessária |
|---|---|---|
| Contrato SaaS | 📄 docs/CONTRATO_LGPD.md | Levar para advogado revisar |
| Termo LGPD | 📄 docs/CONTRATO_LGPD.md | Levar para advogado revisar |
| Política de privacidade | 📄 docs/CONTRATO_LGPD.md | Publicar + revisão jurídica |
| Termo de uso | 📄 docs/CONTRATO_LGPD.md | Publicar + revisão jurídica |

---

## Plano de Ação (próximos 7 dias)

| Dia | Responsável | Tarefa |
|---|---|---|
| D1 | Você | Comprar domínio + VPS |
| D2 | Você | Configurar DNS (Cloudflare) |
| D3 | Você | Gerar SSL + configurar .env |
| D4 | Dev | Deploy via CI/CD ou manual |
| D5 | Você | Domínio apontando + SSL verde |
| D6 | Você | E-mails configurados |
| D7 | Você | Backup testado + base demo OK |

> **Pronto para o treinamento presencial na Semana 2.**
