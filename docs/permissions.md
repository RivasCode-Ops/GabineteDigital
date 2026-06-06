# PERMISSIONS.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-06

---

## 1. MODELO DE AUTORIZAÇÃO

O sistema usa **controle de acesso baseado em função (RBAC)** combinado com **isolamento territorial**.

### Hierarquia de Níveis

| Perfil                  | Nível | Abreviação |
|-------------------------|-------|------------|
| `ADMIN`                 | 100   | ADM        |
| `COORDENADOR_GERAL`     | 80    | CG         |
| `COORDENADOR_REGIONAL`  | 60    | CR         |
| `COORDENADOR_MUNICIPAL` | 40    | CM         |
| `LIDERANCA`             | 20    | LIDER      |
| `OPERADOR`              | 10    | OP         |

### Regra de acesso

- Um perfil pode **ler** registros do seu nível e níveis inferiores na hierarquia territorial
- Um perfil pode **criar/editar** registros no seu próprio território
- Um perfil pode **excluir** apenas se explicitamente permitido na matriz abaixo

---

## 2. MATRIZ DE PERMISSÕES — MÓDULOS

| Módulo       | Ação     | ADM | CG  | CR  | CM  | LIDER | OP  |
|--------------|----------|-----|-----|-----|-----|-------|-----|
| **Usuários** | Criar    | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
|              | Listar   | ✅  | ✅  | ⚠️  | ⚠️  | ❌    | ❌  |
|              | Editar   | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
|              | Excluir  | ✅  | ❌  | ❌  | ❌  | ❌    | ❌  |
| **Perfis**   | Listar   | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
|              | Editar   | ✅  | ❌  | ❌  | ❌  | ❌    | ❌  |
| **Territórios** | Criar | ✅  | ✅  | ✅  | ⚠️  | ❌    | ❌  |
|              | Listar   | ✅  | ✅  | ✅  | ✅  | ✅    | ⚠️  |
|              | Editar   | ✅  | ✅  | ⚠️  | ❌  | ❌    | ❌  |
|              | Excluir  | ✅  | ❌  | ❌  | ❌  | ❌    | ❌  |
| **Pessoas**  | Criar    | ✅  | ✅  | ✅  | ✅  | ✅    | ✅  |
|              | Listar   | ✅  | ✅  | ✅  | ✅  | ✅    | ⚠️  |
|              | Editar   | ✅  | ✅  | ✅  | ✅  | ⚠️    | ❌  |
|              | Excluir  | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
| **Lideranças** | Criar  | ✅  | ✅  | ✅  | ⚠️  | ❌    | ❌  |
|              | Listar   | ✅  | ✅  | ✅  | ✅  | ⚠️    | ❌  |
|              | Editar   | ✅  | ✅  | ⚠️  | ❌  | ❌    | ❌  |
|              | Excluir  | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
| **Demandas** | Criar    | ✅  | ✅  | ✅  | ✅  | ✅    | ✅  |
|              | Listar   | ✅  | ✅  | ✅  | ✅  | ✅    | ⚠️  |
|              | Editar   | ✅  | ✅  | ✅  | ✅  | ⚠️    | ❌  |
|              | Excluir  | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
| **Agenda**   | Criar    | ✅  | ✅  | ✅  | ✅  | ✅    | ⚠️  |
|              | Listar   | ✅  | ✅  | ✅  | ✅  | ✅    | ⚠️  |
|              | Editar   | ✅  | ✅  | ✅  | ✅  | ⚠️    | ❌  |
|              | Excluir  | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
| **Atividades** | Criar  | ✅  | ✅  | ✅  | ✅  | ✅    | ✅  |
|              | Listar   | ✅  | ✅  | ✅  | ✅  | ✅    | ⚠️  |
|              | Editar   | ✅  | ✅  | ✅  | ✅  | ⚠️    | ❌  |
|              | Excluir  | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
| **Pesquisas** | Criar   | ✅  | ✅  | ✅  | ✅  | ✅    | ✅  |
|              | Listar   | ✅  | ✅  | ✅  | ✅  | ✅    | ⚠️  |
|              | Editar   | ✅  | ✅  | ✅  | ✅  | ⚠️    | ❌  |
|              | Excluir  | ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
| **Dashboard**| Visualizar| ✅  | ✅  | ✅  | ✅  | ✅    | ✅  |
| **Auditoria**| Visualizar| ✅  | ✅  | ❌  | ❌  | ❌    | ❌  |
| **Config.**  | Acesso   | ✅  | ⚠️  | ❌  | ❌  | ❌    | ❌  |

**Legenda:**
- ✅ = Acesso total (pode criar, ler, editar no seu escopo)
- ⚠️ = Acesso parcial/condicional (ver regras abaixo)
- ❌ = Sem acesso

---

## 3. REGRAS DE ESCOPO TERRITORIAL

### 3.1 ADMIN
- **Escopo:** Todos os territórios
- **Visão:** Total
- **Observação:** Único perfil que pode excluir usuários e acessar configurações do sistema

### 3.2 COORDENADOR_GERAL
- **Escopo:** Todos os territórios
- **Visão:** Total
- **Restrições:** Não pode excluir usuários, não pode alterar perfis
- Pode gerenciar territórios e lideranças em qualquer nível

### 3.3 COORDENADOR_REGIONAL
- **Escopo:** Sua região + municípios, bairros e comunidades abaixo
- **Visão:** Da região para baixo (não vê outras regiões ou o estadual)
- **Restrições:**
  - Só edita territórios do seu nível (região) para baixo
  - Não cria municípios sem aprovação (⚠️)

### 3.4 COORDENADOR_MUNICIPAL
- **Escopo:** Seu município + bairros e comunidades abaixo
- **Visão:** Do município para baixo
- **Restrições:**
  - Cria pessoas e demandas no município
  - Cria lideranças apenas no município (⚠️)
  - Não gerencia territórios acima do município

### 3.5 LIDERANCA
- **Escopo:** Sua comunidade
- **Visão:** Apenas sua comunidade
- **Restrições:**
  - Cria pessoas e demandas
  - Edita apenas registros próprios (⚠️)
  - Não exclui nada
  - Visualiza lideranças apenas da sua comunidade (⚠️)

### 3.6 OPERADOR
- **Escopo:** Território vinculado
- **Visão:** Apenas o território ao qual foi vinculado
- **Restrições:**
  - Cria pessoas, demandas, atividades e pesquisas
  - Visualiza dados limitados (⚠️) — apenas o essencial para operação de campo
  - Acesso limitado à agenda (⚠️) — só consulta
  - Não edita nem exclui nada

---

## 4. PERMISSÕES ESPECIAIS POR AÇÃO

### 4.1 Exclusão (Delete)

| Ação                          | Quem pode                    |
|-------------------------------|------------------------------|
| Excluir usuários              | `ADMIN` apenas               |
| Excluir perfis                | `ADMIN` apenas               |
| Excluir territórios           | `ADMIN` apenas               |
| Excluir pessoas               | `ADMIN`, `COORDENADOR_GERAL` |
| Excluir demandas              | `ADMIN`, `COORDENADOR_GERAL` |
| Excluir lideranças            | `ADMIN`, `COORDENADOR_GERAL` |
| Excluir atividades            | `ADMIN`, `COORDENADOR_GERAL` |
| Excluir eventos               | `ADMIN`, `COORDENADOR_GERAL` |
| Excluir pesquisas             | `ADMIN`, `COORDENADOR_GERAL` |

### 4.2 Encerramento de Demandas

| Ação                    | Quem pode                                      |
|-------------------------|------------------------------------------------|
| Encerrar demanda própria | O `assigned_to` da demanda                     |
| Encerrar qualquer demanda | `ADMIN`, `COORDENADOR_GERAL`                  |

### 4.3 Atribuição de Responsáveis

| Ação                          | Quem pode                    |
|-------------------------------|------------------------------|
| Atribuir usuário a demanda    | `ADMIN`, `COORDENADOR_GERAL`, `COORDENADOR_REGIONAL` |
| Atribuir liderança            | `ADMIN`, `COORDENADOR_GERAL`, `COORDENADOR_REGIONAL` |

### 4.4 Gestão de Usuários

| Ação                          | Quem pode                    |
|-------------------------------|------------------------------|
| Criar usuário                 | `ADMIN`, `COORDENADOR_GERAL` |
| Editar dados do próprio perfil | Todos os perfis             |
| Editar dados de outros usuários | `ADMIN` apenas              |
| Resetar senha                 | `ADMIN`, `COORDENADOR_GERAL` |
| Desativar usuário             | `ADMIN` apenas               |

---

## 5. REGRAS DE VISIBILIDADE DE DADOS

### 5.1 Isolamento por Território

```
ADMIN / COORDENADOR_GERAL
  └─ Todos os territórios sem restrição

COORDENADOR_REGIONAL
  └─ Sua região + subordinados (municípios, bairros, comunidades)

COORDENADOR_MUNICIPAL
  └─ Seu município + subordinados (bairros, comunidades)

LIDERANCA
  └─ Sua comunidade

OPERADOR
  └─ Apenas o território vinculado
```

### 5.2 Isolamento por Registro

- **LIDERANCA:** vê apenas demandas, atividades e pessoas da sua comunidade
- **OPERADOR:** vê apenas registros que ele mesmo criou + dados do seu território vinculado
- **COORDENADOR_MUNICIPAL:** vê todos os registros do seu município
- Perfis superiores herdam visibilidade dos inferiores

---

## 6. REGRAS DE AUDITORIA

Toda ação de **criação, edição ou exclusão** em tabelas de negócio é registrada em `audit_logs` contendo:

| Campo       | Descrição                          |
|-------------|------------------------------------|
| `user_id`   | Quem executou a ação               |
| `action`    | create, update, delete             |
| `entity`    | Tabela afetada                     |
| `entity_id` | ID do registro                     |
| `changes`   | JSON diff (campos alterados)       |
| `ip`        | Endereço IP do usuário             |

### Ações auditadas obrigatoriamente:
- Login / Logout
- Criação de usuário
- Alteração de perfil
- Criação/edição/exclusão de território
- Criação/edição/exclusão de pessoa
- Criação/edição/exclusão de liderança
- Transição de status de demanda
- Criação/edição/exclusão de atividade
- Criação/edição/exclusão de evento
- Criação/edição/exclusão de pesquisa
- Qualquer exclusão (soft delete)

---

## 7. VALIDAÇÕES DE PERMISSÃO (CÓDIGO)

As permissões devem ser validadas em **3 camadas**:

### 7.1 Middleware (Rota)
Proteção de rota: verifica se o usuário está autenticado.

### 7.2 Server Action / API (Lógica)
Verificação de nível + escopo territorial antes de executar qualquer mutação.

```typescript
// Exemplo de verificação
function canDelete(userRoleLevel: number): boolean {
  return userRoleLevel >= 80; // Apenas ADMIN (100) e COORDENADOR_GERAL (80)
}

function canAccessTerritory(userRoleLevel: number, userTerritoryId: string, targetTerritoryId: string): boolean {
  if (userRoleLevel >= 80) return true; // ADMIN e CG veem tudo
  // Verificar se target está na árvore abaixo do userTerritoryId
  return isDescendantOf(userTerritoryId, targetTerritoryId);
}
```

### 7.3 Interface (UI)
- Botões de excluir/editar são ocultados para perfis sem permissão
- Dados fora do escopo territorial não são carregados
- Mensagens de erro genéricas ("Acesso negado") sem expor motivo

---

## 8. MAPA DE DEPENDÊNCIA (FUTURO)

Para implementação em produção, as permissões podem evoluir para:

```text
permissions/
├── roles.ts          → definição de níveis e permissões base
├── access-control.ts → funções de verificação (canCreate, canEdit, canDelete, canView)
├── scope.ts          → validação de escopo territorial
└── audit.ts          → registro de auditoria
```
