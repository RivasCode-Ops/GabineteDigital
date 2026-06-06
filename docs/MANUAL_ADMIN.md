# Manual do Administrador — Gabinete Digital

## Perfil

Administrador do sistema (nível 100).

## Fluxos

### 1. Gerenciar Usuários

Atualmente via seed ou banco de dados diretamente.

Para criar um novo usuário administrativo:

```bash
npx prisma db seed
```

Ou via SQL no PostgreSQL:

```sql
INSERT INTO users (id, name, email, password_hash, role_id, is_active)
VALUES (gen_random_uuid(), 'Nome', 'email@exemplo.com', 'hash_bcrypt', 'role_uuid', true);
```

### 2. Auditoria

```
Sidebar → Admin → Auditoria
```

Visualizar:
- Todos os eventos do sistema (login, CRUD, exportação, etc.)
- Filtro por ação e entidade
- Registro de IP e usuário

### 3. Backup

```
Sidebar → Admin → Backup
```

Passos:
1. Clique em "Gerar Backup"
2. Aguarde a consolidação dos dados
3. Clique em "Download" para salvar o arquivo JSON
4. Armazene em local seguro

O backup contém:
- Territórios
- Pessoas
- Lideranças
- Demandas
- Atividades
- Eventos
- Pesquisas
- Templates
- Métricas
- Alertas

> **Recomendação**: gerar backup semanalmente.

### 4. Importação em Massa

```
Sidebar → Admin → Importar
```

Formatos aceitos: CSV, XLSX

Tipos disponíveis:
- **Pessoas**: colunas `nome`, `telefone`, `email`
- **Demandas**: colunas `titulo`, `descricao`, `categoria`

### 5. LGPD — Anonimização

Endpoint direto na ficha da pessoa:
```
Pessoas → [Selecionar pessoa] → Anonimizar
```

O que acontece:
- Nome → `[ANONIMIZADO]`
- Telefone → `[ANONIMIZADO]`
- Email → removido
- Consentimento → revogado
- Pessoa → desativada e marcada como excluída

### 6. LGPD — Consentimento

```
Pessoas → [Selecionar pessoa] → Gerenciar Consentimento
```

Permite conceder ou revogar o consentimento LGPD a qualquer momento.

### 7. Notificações em Massa

Enviar notificações para usuários via API:

```bash
curl -X POST /api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid",
    "title": "Título",
    "message": "Mensagem",
    "type": "INFO"
  }'
```

### 8. Templates de Mensagem

```
Sidebar → Templates
```

Criar modelos reutilizáveis para e-mail, WhatsApp e SMS.

---

## Checklists

### Checklist Semanal

- [ ] Backup gerado e baixado
- [ ] Auditoria revisada (ações suspeitas?)
- [ ] Indicadores atualizados (Inteligência)
- [ ] Alertas avaliados e resolvidos

### Checklist Mensal

- [ ] Backup armazenado externamente
- [ ] Revisão de usuários ativos
- [ ] Exportação de dados consolidados
- [ ] Avaliação de métricas de adoção

---

## Configuração de E-mail (SMTP)

Variáveis de ambiente:

```env
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu@email.com
SMTP_PASS=sua-senha
SMTP_FROM=noreply@gabinetedigital.com.br
```

---

## Boas Práticas

1. **Nunca compartilhe credenciais de admin**
2. **Revise a auditoria semanalmente**
3. **Mantenha backups externos** — não apenas no servidor
4. **Teste a restauração de backup** periodicamente
5. **Monitore alertas de territórios críticos** no War Room
6. **LOG_LEVEL=info** em produção, **LOG_LEVEL=debug** em desenvolvimento
