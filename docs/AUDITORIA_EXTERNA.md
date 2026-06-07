# Auditoria Externa do Produto — Gabinete Digital

## Objetivo

Encontrar tudo que está errado **antes** do usuário encontrar.

---

## F20.1 — Teste de Implantação do Zero

### Protocolo

```
1. Provisionar VPS limpa (Ubuntu 24.04, 2 vCPU, 4 GB)
2. Cronometrar do zero até o primeiro login
```

### Checklist

| Passo | Início | Fim | Tempo |
|---|---|---|---|
| Compra/VPS provisionada | | | |
| SSH + atualizações | | | |
| Docker + Compose instalados | | | |
| Git clone + checkout main | | | |
| .env configurado | | | |
| docker compose up -d | | | |
| Migrations executadas | | | |
| Seed executado | | | |
| SSL (Cloudflare ou Let's Encrypt) | | | |
| Backup testado | | | |
| Primeiro login (admin) | | | |
| **TOTAL** | | | |

### Meta

```
< 2 horas  → ✅ excelente
2-4 horas  → ⚠️ aceitável, mas revisar gargalos
> 6 horas  → ❌ priorizar automação
```

### Gargalos Comuns

- Docker não pré-instalado → adicionar ao script de bootstrap
- .env esquecido → criar .env.example mais completo
- Migration falha → testar em staging antes
- SSL complicado → documentar passo a passo no docs/DEPLOY.md

---

## F20.2 — Teste do Usuário Burro

### Protocolo

Escolha **alguém que nunca viu o sistema** (parente, amigo, freelancer).

Não dê explicação. Só entregue:

```
URL: https://gabinete.exemplo.com
Login: teste@exemplo.com
Senha: teste123
```

Peça para executar (nesta ordem):

```
1. Cadastrar uma liderança
2. Criar uma demanda
3. Criar um evento
4. Responder uma pesquisa
```

### O que anotar

| Ação | Travou? | Perguntou? | Errou? | Tempo |
|---|---|---|---|---|
| Login | | | | |
| Navegar até a página | | | | |
| Encontrar botão "Novo" | | | | |
| Preencher formulário | | | | |
| Salvar | | | | |
| Encontrar o que criou | | | | |

### Métricas

```
Tempo médio por tarefa: < 2 min → ✅
Erros por tarefa: 0-1 → ✅, 2-3 → ⚠️, >3 → ❌
Precisou de ajuda? Sim/Não → se sim, documentar onde
```

### O que fazer com os resultados

- **Erro no mesmo campo para todo mundo** → UX priority fix
- **Travou na mesma página** → redesenhar aquela página
- **Não encontrou o botão** → aumentar visibilidade
- **Preencheu campo errado** → melhorar labels/placeholders

---

## F20.3 — Teste do Opositor

### Protocolo

Simule um usuário mal-intencionado com acesso de **Coordenador Municipal** (nível 40).

### Tentativas

| Ação | Esperado | Resultado |
|---|---|---|
| Exportar pessoas | ✅ Permitido (nível 30+) | |
| Exportar backup completo | ❌ Negado (só admin 100) | |
| Apagar território pai | ❌ Negado (valida filhos) | |
| Alterar demanda de outro município | ❌ Negado (filtro territorial) | |
| Criar usuário admin | ❌ Negado (só admin) | |
| Acessar auditoria | ❌ Negado (nível 80+) | |
| Acessar /api/v1/backup | ❌ Negado (nível 100) | |
| Remover consentimento LGPD de outro | ❌ Negado (só admin ou próprio) | |
| Escalar próprio role para admin | ❌ Negado (sem rota de auto-upgrade) | |
| SQL Injection (inserir ' OR 1=1--) | ❌ Sanitizado | |

### O que verificar

- Todas as rotas REST têm checagem de role?
- O middleware bloqueia acesso a rotas não autorizadas?
- Dados sensíveis nunca vazam em respostas de erro?
- Rate limit está ativo para abuso de API?

### Foco especial

> **LGPD**: um usuário consegue ver dados pessoais de outro território?

Teste:
1. Coordenador municipal de SP tenta acessar `/api/v1/people?territoryId=id_de_campinas`
2. Se retornar dados de Campinas, é **falha crítica**

---

## F20.4 — Teste da Campanha Real

### Protocolo

Simule escala real com dados massivos.

### Carga

```text
500 pessoas
100 lideranças
50 demandas
20 eventos
10 pesquisas
```

### Como gerar

Use o script:

```bash
npx tsx scripts/load-test.ts
```

Ou importe via planilha.

### O que observar

| Cenário | Esperado | Real |
|---|---|---|
| Dashboard carrega em < 2s | ✅ | |
| War Room carrega em < 3s | ✅ | |
| Lista de pessoas com paginação | ✅ | |
| Busca por nome | ✅ | |
| Relatório de inteligência | ✅ | |
| Exportar CSV de 500 pessoas | ✅ | |
| Backup completo | ✅ | |

### Métricas

```
Tempo de carregamento das páginas:
  Dashboard:  < 2s → ✅
  War Room:   < 3s → ✅
  Pessoas:    < 2s → ✅
  Demandas:   < 2s → ✅
  Inteligência: < 3s → ✅

Limite prático:
  Até quantas pessoas antes de travar?  _____
  Até quantas demandas?                  _____
```

### O que fazer se travar

1. Identificar query lenta (ver logs de banco)
2. Adicionar índice no Prisma
3. Se necessário: paginação ou virtual scroll

---

## Resultado Final da Auditoria

| Teste | Status | Observações |
|---|---|---|
| F20.1 — Implantação do zero | ⬜ | Executar na VPS alvo |
| F20.2 — Usuário burro | ⬜ | Executar com 3 pessoas |
| F20.3 — Opositor | ⬜ | Executar com checklist |
| F20.4 — Campanha real | ⬜ | Executar com script |

### Gatilho

Se **qualquer teste falhar**, o piloto **não começa** até o problema ser resolvido.
