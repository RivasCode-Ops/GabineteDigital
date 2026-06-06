# Observabilidade — Gabinete Digital

## Health Endpoints

| Endpoint | Descrição | Requer Auth |
|---|---|---|
| `GET /api/v1/health` | Status geral + banco | ❌ |
| `GET /api/v1/health/live` | Liveness probe (K8s/Docker) | ❌ |
| `GET /api/v1/health/ready` | Readiness probe (banco) | ❌ |

### /health

```json
{
  "status": "ok",
  "version": "v0.2.0-beta",
  "database": "ok",
  "timestamp": "2026-06-06T03:50:00.000Z",
  "uptime": 1234.56,
  "responseTimeMs": 2
}
```

Retorna `200` se OK, `503` se degradado.

### /health/live

```json
{ "status": "alive", "timestamp": "..." }
```

Sempre `200`. Usado por Docker HEALTHCHECK e orquestradores.

### /health/ready

```json
{
  "status": "ready",
  "checks": { "database": "ok" },
  "timestamp": "..."
}
```

`200` se pronto, `503` se não pronto.

---

## Logger Estruturado

Centralizado em `src/lib/logger.ts`.

### Níveis

- `logger.info()` — Informação geral
- `logger.warn()` — Avisos (não críticos)
- `logger.error()` — Erros
- `logger.security()` — Eventos de segurança (login, permissão negada)

### Campos

```json
{
  "level": "info",
  "requestId": "abc-123",
  "userId": "uuid-do-usuario",
  "route": "/api/v1/demands",
  "method": "GET",
  "duration": 42,
  "ip": "127.0.0.1",
  "message": "Demandas listadas",
  "timestamp": "2026-06-06T03:50:00.000Z"
}
```

### Configuração

```env
LOG_LEVEL=info   # info | warn | error | security
```

---

## Request Tracking

Toda requisição recebe um `X-Request-Id` (UUID v4) via middleware.

Headers de resposta:

| Header | Descrição |
|---|---|
| `X-Request-Id` | Identificador único da requisição |
| `X-Runtime-Ms` | Tempo de execução em milissegundos |
| `X-RateLimit-Remaining` | Requisições restantes na janela |
| `X-RateLimit-Reset` | Timestamp de reset do rate limit |

---

## Uso no Docker

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health/live || exit 1
```

---

## Configuração de Ambiente

```env
# Logger
LOG_LEVEL=info

# Rate Limit (opcional — padrão: 100/min)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```
