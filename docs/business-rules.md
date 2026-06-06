# BUSINESS_RULES.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-05

---

## 1. REGRAS GLOBAIS

### RG-01: Soft Delete

Nenhum registro de negócio é excluído fisicamente. Toda exclusão marca `deleted_at` com a data/hora atual. Registros com `deleted_at IS NOT NULL` são ignorados em todas as consultas padrão.

**Exceção:** Tabelas temporárias, logs de auditoria (retenção controlada).

### RG-02: Auditoria Obrigatória

Toda operação de criação, alteração ou exclusão em tabelas de negócio deve gerar um registro em `audit_logs` contendo:
- `user_id`: quem fez
- `action`: create, update, delete
- `entity`: nome da tabela
- `entity_id`: ID do registro
- `changes`: JSON diff antes/depois
- `ip`: endereço IP do usuário

### RG-03: Timestamps Automáticos

`created_at` e `updated_at` são gerenciados automaticamente pelo banco ou Prisma. `updated_at` deve ser atualizado em toda alteração.

### RG-04: Proteção de Dados Sensíveis

É proibido armazenar CPF, título eleitoral, zona eleitoral, seção eleitoral, dados bancários, dados médicos ou qualquer dado sensível conforme art. 5º, II da LGPD.

---

## 2. TERRITÓRIOS

### RT-01: Hierarquia Fixa

A árvore territorial segue estritamente:

```
Estado (state)
 └─ Região (region)
     └─ Município (city)
         └─ Bairro (neighborhood)
             └─ Comunidade (community)
```

Não é permitido pular níveis. Uma comunidade deve pertencer a um bairro, um bairro a um município, etc.

### RT-02: Slug Único

O campo `slug` deve ser único globalmente (não apenas por nível). Usar padrão: `{tipo}-{nome-normalizado}`.
Exemplo: `municipo-sao-paulo`, `bairro-vila-mariana`.

### RT-03: Cliente define nomenclatura

Os nomes dos níveis "Região" e "Comunidade" podem ser personalizados por instância do cliente (ex: "Zona" no lugar de "Região", "Assentamento" no lugar de "Comunidade").

### RT-04: Um território só pode ser excluído se não tiver filhos

Antes de marcar `deleted_at` em um território, verificar se não há territórios filhos ativos. Se houver, bloquear a operação.

---

## 3. PESSOAS

### RP-01: Telefone é obrigatório

Toda pessoa cadastrada deve ter ao menos um telefone. E-mail é opcional.

### RP-02: Categorias Fixas

As categorias de pessoa são fixas e definidas pelo sistema:
- `lideranca`
- `morador`
- `empresario`
- `vereador`
- `ex_vereador`
- `presidente_associacao`
- `sindicato`
- `influenciador`
- `parceiro_institucional`

Novas categorias só podem ser adicionadas via atualização do sistema (não pelo cliente).

### RP-03: Pessoa pode ser recadastrada em múltiplos territórios

Uma mesma pessoa pode aparecer em mais de um território. O vínculo é pelo `territory_id`.

### RP-04: Origem do contato é campo livre

O campo `contact_origin` é texto livre para registrar como a pessoa foi captada (ex: "evento do dia 15", "indicacao do coordenador João", "mutirao").

---

## 4. REDE DE LIDERANÇAS

### RL-01: Hierarquia de Liderança

A rede segue a hierarquia:

```
Coordenação Estadual (nível 1)
 └─ Coordenação Regional (nível 2)
     └─ Coordenação Municipal (nível 3)
         └─ Liderança Comunitária (nível 4)
             └─ Rede Local (nível 5)
```

### RL-02: Uma liderança tem um único superior direto

Cada registro em `leadership_network` aponta para exatamente um `superior_id` (exceto o topo da hierarquia). Uma liderança não pode ter múltiplos superiores.

### RL-03: Ciclo hierárquico é proibido

A validação deve impedir que A seja superior de B e B seja superior de A (ciclo). Deve ser verificada na inserção/atualização.

### RL-04: Coordenador pode acumular múltiplas lideranças abaixo

Um coordenador estadual pode ter N coordenadores regionais abaixo. Um coordenador regional pode ter N coordenadores municipais abaixo, e assim por diante.

### RL-05: A liderança ativa pertence ao território que coordena

O `territory_id` da liderança deve ser compatível com seu nível hierárquico na rede. Exemplo: um coordenador regional deve ter `territory_id` do tipo `region`.

---

## 5. DEMANDAS

### RD-01: Pipeline Obrigatório

O status da demanda segue o fluxo unidirecional:

```
recebida → triagem → encaminhada → acompanhamento → resolvida → encerrada
```

**Regras de transição:**
- `recebida` → `triagem` ✅ permitido
- `triagem` → `encaminhada` ✅ permitido
- `encaminhada` → `acompanhamento` ✅ permitido
- `acompanhamento` → `triagem` ⬅️ permitido (reavaliação)
- `acompanhamento` → `resolvida` ✅ permitido
- `resolvida` → `encerrada` ✅ permitido
- `encerrada` → qualquer outro ❌ **proibido** (estado terminal)
- Pular etapas (`recebida` → `resolvida`) ❌ **proibido**

### RD-02: Categorias de Demanda

Fixas no sistema:
- `saude`
- `educacao`
- `infraestrutura`
- `transporte`
- `agricultura`
- `assistencia_social`
- `regularizacao_fundiaria`
- `outro`

### RD-03: Prioridade

Toda demanda recebe uma prioridade no momento da abertura:
- `baixa`
- `media` (default)
- `alta`
- `urgente`

A prioridade pode ser alterada durante o fluxo.

### RD-04: Toda demanda tem um responsável

Uma demanda não pode ficar sem `assigned_to` após sair do status `recebida`. Ao passar para `triagem`, o sistema deve exigir a designação de um responsável.

### RD-05: Abertura de demanda

Qualquer perfil pode abrir uma demanda. A demanda sempre começa em `recebida`.

### RD-06: Encerramento de demanda

Uma demanda só pode ser encerrada por:
- `ADMIN`
- `COORDENADOR_GERAL`
- O `assigned_to` da demanda

Ao encerrar, o campo `closed_at` é preenchido automaticamente.

### RD-07: Reabertura

Uma demanda encerrada não pode ser reaberta. Deve-se criar uma nova demanda vinculada à anterior (referência cruzada via `demand_history`).

### RD-08: Histório Obrigatório

Toda transição de status, mudança de responsável, alteração de prioridade ou edição de campos críticos deve gerar um registro em `demand_history`.

Campos considerados críticos: `status`, `assigned_to`, `priority`, `category`, `title`, `description`.

---

## 6. AGENDA

### RA-01: Conflito de horário

O sistema deve alertar (não bloquear) quando um usuário criar um evento cujo horário conflite com outro evento existente do mesmo usuário.

### RA-02: Visibilidade por território

Um usuário só pode ver eventos do seu próprio território ou territórios abaixo na hierarquia. Exceção: `ADMIN` e `COORDENADOR_GERAL` veem todos.

### RA-03: Status do evento

- `scheduled` — agendado, confirmar
- `confirmed` — confirmado
- `cancelled` — cancelado
- `completed` — realizado (preenchido automaticamente quando `end_at` passa)

---

## 7. ATIVIDADES

### RAT-01: Tipo obrigatório

Toda atividade deve ter um tipo. Tipos disponíveis:
- `visita`
- `reuniao`
- `evento`
- `ligacao`
- `atendimento`

### RAT-02: Atividade sempre vinculada a um usuário

`performed_by` é preenchido automaticamente com o usuário logado. Não pode ser alterado manualmente.

### RAT-03: Atividades geram indicadores

Toda atividade registrada alimenta os indicadores do dashboard (ex: total de visitas no mês, atividades por território).

### RAT-04: Atividade pode vincular múltiplas pessoas

O campo `people_ids` permite registrar todas as pessoas envolvidas na atividade. Essas pessoas NÃO são notificadas (apenas registro histórico).

---

## 8. PESQUISA DE CAMPO

### RPC-01: Periodicidade

Uma pesquisa de campo pode ser feita a qualquer momento. Não há limite de frequência.

### RPC-02: Sentimento Obrigatório

Toda pesquisa deve classificar o sentimento da comunidade:
- `muito_favoravel`
- `favoravel`
- `neutro`
- `resistente`
- `muito_resistente`

### RPC-03: Pesquisa alimenta inteligência territorial

Os dados de `sentiment`, `problems` e `priorities` alimentam automaticamente os indicadores de inteligência territorial (mapas de calor, áreas prioritárias).

### RPC-04: Coleta pode ser anônima

Uma pesquisa pode ser registrada sem vincular a pessoas específicas. Apenas o `territory_id` é obrigatório.

---

## 9. DASHBOARD

### RDB-01: Cards do Dashboard

O dashboard principal exibe obrigatoriamente:

| Card                  | Fonte              |
|-----------------------|---------------------|
| Demandas abertas      | demands (status ≠ encerrada) |
| Demandas resolvidas   | demands (status = resolvida) |
| Municípios ativos     | territories (type = city, com atividades nos últimos 30 dias) |
| Atividades realizadas | activities (mês corrente) |
| Lideranças ativas     | leadership_network (is_active = true) |
| Pesquisas realizadas  | surveys (mês corrente) |

### RDB-02: Filtro por território

Todos os cards do dashboard devem ser filtráveis por território. Por padrão, exibe o território do usuário logado (ou todos para ADMIN/COORDENADOR_GERAL).

---

## 10. SEGURANÇA E ACESSO

### RS-01: Exclusão restrita

Somente `ADMIN` e `COORDENADOR_GERAL` podem excluir registros (soft delete). Usuários de outros perfis não veem opções de exclusão.

### RS-02: Isolamento territorial

- `COORDENADOR_MUNICIPAL`: vê apenas dados do seu município e abaixo (bairros, comunidades)
- `COORDENADOR_REGIONAL`: vê dados da sua região e abaixo (municípios, bairros, comunidades)
- `LIDERANCA`: vê apenas sua comunidade
- `OPERADOR`: vê apenas o território ao qual foi vinculado
- `ADMIN` e `COORDENADOR_GERAL`: visão total

### RS-03: Sessão expira após inatividade

O sistema deve encerrar a sessão após 60 minutos de inatividade. O usuário é redirecionado ao login.

### RS-04: Limite de tentativas de login

Após 5 tentativas de login com falha no mesmo e-mail, bloquear por 15 minutos.

---

## 11. LGPD

### RLG-01: Consentimento

O cadastro de pessoas deve incluir campo de consentimento explícito. Pessoas sem consentimento registrado não podem ter dados exibidos em relatórios ou exportações.

### RLG-02: Direito de exclusão

Uma pessoa pode solicitar a exclusão de seus dados. Isso aciona:
1. Marcação de `deleted_at` nos registros
2. Anonimização do nome (substituir por "Dados removidos a pedido")
3. Remoção de telefone e e-mail
4. Registro em `audit_logs`

### RLG-03: Retenção máxima

Dados de pessoas inativas por mais de 5 anos devem ser anonimizados automaticamente.

---

## 12. REGRAS COMERCIAIS (FUTURO)

### RC-01: Multitenancy

Cada cliente (gabinete, campanha, associação) é uma organização separada. Todos os dados são isolados por `organization_id`.

### RC-02: Convite de usuários

Usuários são convidados por e-mail. O convite expira em 7 dias. Novos usuários são criados com status `pending` até aceitarem o convite.
