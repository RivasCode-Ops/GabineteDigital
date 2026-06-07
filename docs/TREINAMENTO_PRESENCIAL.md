# Treinamento Presencial — Gabinete Digital

## Informações Gerais

| Item | Detalhe |
|---|---|
| Duração | 2 horas |
| Formato | Presencial (sala com projetor) |
| Participantes | 1 administrador, 1 coordenador geral, 2 coordenadores municipais, 5 lideranças |
| Instrutor | Equipe técnica ou coordenador geral treinado |
| Material | Projetor, sistema online, celulares dos participantes |

---

## Agenda (120 min)

### 0–10 min: Abertura

**O que é o Gabinete Digital?**

- Plataforma de gestão territorial e política
- Centraliza pessoas, demandas, atividades e indicadores de um gabinete
- LGPD compliance
- Substitui: WhatsApp disperso, planilhas soltas, cadernos de anotação

**Objetivo do treinamento**
- Cada um sai sabendo operar o sistema no seu dia a dia
- Piloto de 30 dias começa amanhã

---

### 10–25 min: Demonstração Geral (todos)

**Instrutor projeta:**

1. Login em `/login`
2. Dashboard: `/dashboard`
3. War Room: `/war-room` — KPIs, pipeline, alertas
4. Inteligência: `/intelligence` — score, métricas territoriais
5. Inteligência Artificial: `/ai` — diagnóstico por território

> **Ninguém mexe ainda. Só assistir.**

---

### 25–55 min: Estação 1 — Administrador (30 min)

**Presencial, 1 a 2 pessoas.**

#### Fluxo 1: Criar usuários

- Seed inicial já cria admin + coordenadores
- Para novos: `npx prisma db seed` ou inserção direta no banco

#### Fluxo 2: Auditoria

```
Admin → Auditoria
```

Mostrar:
- Logs de login
- Logs de CRUD
- Filtro por ação

#### Fluxo 3: Backup

```
Admin → Backup → Gerar Backup → Download
```

- Frequência: semanal
- Armazenar externamente

#### Fluxo 4: Exportar / Importar

```
Admin → Exportar → CSV ou XLSX
Admin → Importar → CSV ou XLSX
```

#### Exercício (5 min)

1. Faça login como admin
2. Acesse Auditoria
3. Identifique o último login do coordenador geral
4. Gere um backup

---

### 25–55 min: Estação 2 — Coordenador Geral (30 min)

**Presencial, 1 a 2 pessoas.** (simultâneo à Estação 1)

#### Fluxo 1: Territórios

```
Sidebar → Territórios → Novo
```

Criar hierarquia:
- Estado
- Município
- Bairro

#### Fluxo 2: Lideranças

```
Sidebar → Lideranças → Nova
```

Vincular:
- Pessoa já cadastrada
- Superior hierárquico
- Território

#### Fluxo 3: Demandas

```
Sidebar → Demandas → Nova
```

Pipeline: Recebida → Triagem → Encaminhada → Acompanhamento → Resolvida → Encerrada

#### Fluxo 4: War Room

Consultar KPIs, distribuir demandas, avaliar territórios críticos

#### Exercício (5 min)

1. Crie um território (Município de Exemplo)
2. Cadastre uma liderança
3. Crie uma demanda para esse território
4. Acompanhe no War Room

---

### 25–55 min: Estação 3 — Liderança (30 min)

**Presencial, grupo maior (até 5 pessoas).** (simultâneo)

#### Fluxo 1: Registrar Visita

```
Sidebar → Atividades → Nova → Tipo: Visita
```

Campos: pessoas envolvidas, território, data, descrição

#### Fluxo 2: Registrar Demanda

```
Sidebar → Demandas → Nova
```

Campos: título, categoria, território

#### Fluxo 3: Consultar Agenda

```
Sidebar → Agenda
```

#### Fluxo 4: Registrar Contato

```
Sidebar → Pessoas → Nova
```

Nome, telefone, território

#### Exercício (5 min)

1. Registre uma visita (use seu celular)
2. Crie uma demanda simples
3. Cadastre uma pessoa nova
4. Veja a agenda

---

### 55–70 min: Trabalho Livre (15 min)

**Cada perfil faz sozinho:**

| Quem | O que fazer |
|---|---|
| Admin | Criar um novo usuário (via DB) |
| Coord. Geral | Criar 2 territórios, 2 lideranças, 1 evento |
| Liderança | Registrar 2 visitas, 1 demanda, 1 pessoa |
| Coord. Municipal | Registrar 1 pessoa, 1 demanda, 1 pesquisa |

Instrutor circula, tira dúvidas, auxilia.

---

### 70–85 min: Indicadores e Adoção (15 min)

**Instrutor explica:**

#### Score Territorial

```
Inteligência → Atualizar Indicadores
```

Fórmula: lideranças + atividades + demandas resolvidas + pesquisas

#### Métricas de Adoção

Ver em: `https://sistema/api/v1/metrics/adoption`

- Usuários ativos na semana
- Demandas criadas/concluídas
- Atividades registradas
- Score médio

#### Feedback

```
Botão: "Encontrou dificuldade?" → escrever o problema
```

- Toda dificuldade vira melhoria
- Ninguém é obrigado a usar tudo — mas registre o que fizer

---

### 85–100 min: Perguntas e Respostas (15 min)

**Tópicos comuns:**

| Pergunta | Resposta |
|---|---|
| Posso usar pelo celular? | Sim, o sistema é responsivo |
| Preciso cadastrar TODO mundo? | Sim, isso gera inteligência territorial |
| E se a pessoa não quiser ser cadastrada? | LGPD: registro com consentimento, pode anonimizar depois |
| Quanto tempo leva pra registrar uma visita? | ~2 minutos |
| Posso registrar demanda de qualquer lugar? | Sim, pelo celular |

---

### 100–115 min: Combinados do Piloto (15 min)

#### Regras do Jogo

1. **Todo contato vira pessoa no sistema** (até o fim do dia)
2. **Toda visita vira atividade** (até o fim do dia)
3. **Toda reclamação vira demanda** (até o fim do dia)
4. **Agenda de amanhã registrada hoje**
5. **Feedback sincero** — o sistema é nosso, vamos melhorar juntos

#### Meta da Semana 1

| Papel | Meta |
|---|---|
| Cada liderança | 5 pessoas + 3 visitas + 1 demanda |
| Coordenador municipal | 10 pessoas + 2 eventos |
| Coordenador geral | 2 lideranças + 1 território + war room diário |
| Admin | Backup semanal |

---

### 115–120 min: Encerramento

- Link de acesso: `https://seudominio.com.br`
- Suporte: WhatsApp do grupo
- Próximo encontro: **7 dias** para avaliar Semana 1

> **Lembrete**: O sistema não substitui o trabalho de rua. Ele potencializa.
