# UI_UX.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-06  
**Stack:** Shadcn/UI + Tailwind CSS v3 + Lucide Icons

---

## 1. IDENTIDADE VISUAL

### 1.1 Nome do Produto

- **Nome oficial:** COMANDO 360
- **Subtítulo:** Gabinete Digital
- **Uso:** "COMANDO 360" nas telas de login, dashboard e cabeçalho; "Gabinete Digital" como subtítulo

### 1.2 Paleta de Cores

| Token              | Hex       | Uso                                    |
|--------------------|-----------|----------------------------------------|
| `--primary`        | `#1e40af` | Botões, links, header, tabs ativas     |
| `--primary-foreground` | `#ffffff` | Texto em fundo primary              |
| `--secondary`      | `#1e3a5f` | Sidebar ativa, bordas de cards ativos  |
| `--accent`         | `#f59e0b` | Badges (urgente), destaques, alertas   |
| `--background`     | `#f8fafc` | Fundo do dashboard                     |
| `--card`           | `#ffffff` | Cards, modais, tabelas                 |
| `--muted`          | `#f1f5f9` | Fundos secundários, hover              |
| `--destructive`    | `#dc2626` | Exclusão, erros, cancelamento          |
| `--success`        | `#16a34a` | Confirmação, realizado, online         |
| `--info`           | `#2563eb` | Informação, aviso                      |
| `--warning`        | `#d97706` | Atenção, pendente                      |
| `--border`         | `#e2e8f0` | Bordas de inputs, cards, tabelas       |
| `--ring`           | `#1e40af` | Focus ring                             |

### 1.3 Tipografia

| Elemento     | Família            | Tamanho        | Peso        |
|--------------|--------------------|----------------|-------------|
| Título H1    | Inter / system-ui  | text-2xl       | font-bold   |
| Título H2    | Inter / system-ui  | text-xl        | font-semibold |
| Título H3    | Inter / system-ui  | text-lg        | font-semibold |
| Corpo        | Inter / system-ui  | text-sm / base | font-normal |
| Pequeno      | Inter / system-ui  | text-xs        | font-normal |
| Monospace    | JetBrains Mono     | text-sm        | —           |

---

## 2. LAYOUT

### 2.1 Estrutura de Telas

```
┌─────────────────────────────────────────────┐
│                   Topbar                      │
│  [Logo] COMANDO 360  [Breadcrumb]  [User]    │
├──────────┬──────────────────────────────────┤
│          │                                   │
│  Sidebar │           Content Area            │
│          │                                   │
│  - Home  │                                   │
│  - Pessoas│                                   │
│  - Deman-│                                   │
│    das   │                                   │
│  - Ativi-│                                   │
│    dades │                                   │
│  - ...   │                                   │
│          │                                   │
└──────────┴───────────────────────────────────┘
```

### 2.2 Sidebar

- 256px de largura (collapsible)
- Itens com ícone + label
- Submenu expansível para módulos com subrotas
- Item ativo destacado com `bg-secondary` + `text-white`
- Role do usuário no rodapé com badge de nível

### 2.3 Topbar

- Altura fixa: 64px
- Breadcrumb dinâmico (Home > Pessoas > Novo)
- Avatar + nome do usuário logado à direita
- Dropdown: Perfil, Configurações, Sair

---

## 3. MÓDULOS & ROTAS

### 3.1 Mapa de Rotas

| Rota                        | Módulo          | Role Mínima  |
|-----------------------------|-----------------|--------------|
| `/login`                    | Login           | Pública      |
| `/dashboard`                | Home            | OPERADOR     |
| `/territories`              | Territórios     | ADMIN        |
| `/territories/new`          | Territórios     | ADMIN        |
| `/territories/:id`          | Territórios     | ADMIN        |
| `/territories/:id/edit`     | Territórios     | ADMIN        |
| `/people`                   | Pessoas         | LIDERANCA    |
| `/people/new`               | Pessoas         | LIDERANCA    |
| `/people/:id`               | Pessoas         | LIDERANCA    |
| `/people/:id/edit`          | Pessoas         | LIDERANCA    |
| `/leaderships`              | Lideranças      | COORD_MUNIC  |
| `/leaderships/new`          | Lideranças      | COORD_MUNIC  |
| `/leaderships/:id`          | Lideranças      | COORD_MUNIC  |
| `/demands`                  | Demandas        | OPERADOR     |
| `/demands/new`              | Demandas        | OPERADOR     |
| `/demands/:id`              | Demandas        | OPERADOR     |
| `/demands/:id/edit`         | Demandas        | OPERADOR     |
| `/activities`               | Atividades      | LIDERANCA    |
| `/activities/new`           | Atividades      | LIDERANCA    |
| `/activities/:id`           | Atividades      | LIDERANCA    |
| `/agenda`                   | Agenda          | OPERADOR     |
| `/agenda/new`               | Agenda          | OPERADOR     |
| `/agenda/:id`               | Agenda          | OPERADOR     |
| `/surveys`                  | Pesquisas       | LIDERANCA    |
| `/surveys/new`              | Pesquisas       | LIDERANCA    |
| `/surveys/:id`              | Pesquisas       | LIDERANCA    |
| `/admin/users`              | Admin           | ADMIN        |
| `/admin/users/new`          | Admin           | ADMIN        |
| `/admin/users/:id`          | Admin           | ADMIN        |
| `/admin/audit`              | Auditoria       | ADMIN        |

---

## 4. COMPONENTES REUTILIZÁVEIS

### 4.1 Tabela de Dados (DataTable)

- Colunas sorteáveis
- Busca textual
- Paginação no rodapé
- Checkbox para ações em lote
- Ações por linha (ver, editar, excluir)

### 4.2 Formulário Padrão

- Campos com label + placeholder
- Validação inline (Zod + react-hook-form)
- Botões: Cancelar (ghost) + Salvar (primary)
- Spinner no botão durante submit

### 4.3 Modal de Confirmação

- Título + descrição
- Botão Confirmar (destructive para exclusão)
- Botão Cancelar
- Overlay escuro

### 4.4 Badges de Status

| Status        | Cor          |
|---------------|--------------|
| Ativo         | green        |
| Inativo       | gray         |
| Pendente      | yellow       |
| Urgente       | orange       |
| Bloqueado     | red          |
| Realizado     | green        |
| Cancelado     | red          |

### 4.5 Empty State

- Ícone ilustrativo
- Mensagem descritiva
- CTA para criar primeiro registro

---

## 5. ESTADOS DE CARREGAMENTO

### 5.1 Skeleton Loading

- Tabela: 5 linhas pulsantes
- Card: retângulo + texto pulsantes
- Form: inputs como retângulos cinza

### 5.2 Spinner

- Botão submit: spinner substitui texto
- Página: spinner centralizado

---

## 6. RESPONSIVIDADE

- **Desktop:** sidebar fixa + conteúdo fluido (>= 1024px)
- **Tablet:** sidebar collapsible, grid 2 colunas (>= 640px)
- **Mobile:** sidebar em drawer, cards empilhados, tabela em modo lista

---

## 7. DIAGRAMAS DE FLUXO (TEXTUAIS)

### 7.1 Login

```
[Login Page] → Email + Senha → Auth.js → Session válida?
  ├── Sim → [Dashboard]
  └── Não → [Erro inline] → Tenta novamente
```

### 7.2 Cadastro de Pessoa

```
[Pessoas] → [Novo] → Formulário → Consentimento?
  ├── Sim → Salvar com consentGiven=true
  └── Não → Bloquear salvamento + alerta
```

### 7.3 Pipeline de Demanda

```
[Recebida] → [Triagem] → [Encaminhada] → [Em Andamento] → [Resolvida] → [Encerrada]
       ↓           ↓            ↓               ↓
   Arquivada   Arquivada    Arquivada       Arquivada
```

### 7.4 Exclusão com LGPD

```
[Excluir] → Modal confirmação → Soft delete (isActive=false)
  → Audit log → [Se titular dos dados → Anonimizar dados pessoais]
```
