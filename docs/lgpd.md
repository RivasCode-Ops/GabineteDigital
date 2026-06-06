# LGPD.md — COMANDO 360 / Gabinete Digital

**Versão:** 1.0  
**Data:** 2026-06-06  
**Base Legal:** Lei nº 13.709/2018 (LGPD)

---

## 1. ENQUADRAMENTO

### 1.1 Papéis LGPD

| Papel | Definição | Responsável |
|-------|-----------|-------------|
| **Controlador** | Define as finalidades e meios do tratamento | Cliente (gabinete, campanha, associação) |
| **Operador** | Realiza o tratamento em nome do controlador | COMANDO 360 (plataforma) |
| **Encarregado (DPO)** | Canal de comunicação com titulares | A definir por instalação |
| **Titular** | Pessoa física a quem os dados se referem | Cidadão cadastrado na plataforma |

### 1.2 Base Legal Aplicável

| Finalidade | Base Legal | Artigo |
|------------|------------|--------|
| Cadastro de apoiadores/moradores | Consentimento | Art. 7º, I |
| Gestão de demandas públicas | Legítimo interesse | Art. 7º, IX |
| Relacionamento comunitário | Legítimo interesse | Art. 7º, IX |
| Pesquisas de opinião | Consentimento | Art. 7º, I |
| Comunicação institucional | Legítimo interesse | Art. 7º, IX |
| Cumprimento de obrigação legal | Obrigação legal | Art. 7º, II |

---

## 2. DADOS TRATADOS

### 2.1 Dados Pessoais Coletados

| Campo | Categoria | Obrigatório |
|-------|-----------|-------------|
| Nome completo | Identificação | Sim |
| Telefone | Contato | Sim |
| E-mail | Contato | Não |
| Território (cidade/bairro/comunidade) | Localização | Sim |
| Categoria (liderança, morador, etc.) | Perfil | Sim |
| Origem do contato | Contexto | Não |
| Observações | Livre | Não |

### 2.2 Dados NÃO Armazenados (Proibidos)

É **terminantemente proibido** armazenar no sistema:

- CPF
- Título de eleitor
- Zona eleitoral
- Seção eleitoral
- Dados bancários
- Dados médicos
- Dados sensíveis (art. 5º, II da LGPD: origem racial, convicção religiosa, opinião política, filiação sindical, dado genético, biométrico, saúde, vida sexual)
- Dados de crianças e adolescentes sem consentimento dos responsáveis

---

## 3. CONSENTIMENTO

### 3.1 Fluxo de Consentimento

```
Cadastro de pessoa
↓
Exibir aviso LGPD:
"Autorizo o armazenamento dos meus dados para fins de
relacionamento comunitário e gestão de demandas."
↓
[ ] Aceito [ ] Não aceito
↓
Se aceito → Salvar registro com consentimento = true + data/hora + IP
Se não → Salvar registro com consentimento = false (campos mínimos)
```

### 3.2 Registro de Consentimento

O sistema deve armazenar para cada pessoa:

| Campo                 | Descrição                    |
|-----------------------|------------------------------|
| `consent_given_at`    | Data/hora do consentimento   |
| `consent_ip`          | IP do titular no momento     |
| `consent_version`     | Versão do aviso exibido      |
| `consent_revoked_at`  | Data/hora da revogação       |

### 3.3 Revogação

O titular pode revogar o consentimento a qualquer momento, por:
- Botão "Revogar consentimento" no perfil (via atendimento)
- Solicitação por e-mail ou WhatsApp registrada em ticket

Ao revogar:
1. Marcar `consent_revoked_at` com data/hora
2. Dados deixam de ser exibidos em relatórios e exportações
3. Registro permanece no banco para auditoria (anonimizado)

### 3.4 Consequências da Não Autorização

Pessoas sem consentimento:
- São cadastradas com dados mínimos (nome + telefone)
- **Não** aparecem em relatórios, dashboards ou exportações
- **Não** podem ser vinculadas a demandas como requerentes
- **Não** podem receber comunicações pela plataforma

---

## 4. DIREITOS DOS TITULARES

A plataforma deve garantir os seguintes direitos previstos no art. 9º da LGPD:

| Direito | Como o sistema atende |
|---------|-----------------------|
| **Confirmação da existência de tratamento** | O titular pode solicitar e receber confirmação via canal de atendimento |
| **Acesso aos dados** | Exportação simples dos dados cadastrais (CSV/PDF) |
| **Correção** | Edição de dados pessoais via interface |
| **Anonimização, bloqueio ou eliminação** | Anonimização de dados sensíveis + soft delete + eliminação programada |
| **Portabilidade** | Exportação dos dados em formato estruturado (CSV) |
| **Informação sobre compartilhamento** | Política transparente: dados não são compartilhados com terceiros |
| **Revogação do consentimento** | Botão/processo de revogação |

---

## 5. CICLO DE VIDA DOS DADOS

### 5.1 Retenção

| Tipo de Dado | Prazo de Retenção | Fundamento |
|--------------|-------------------|------------|
| Dados de pessoas ativas | Enquanto durar o vínculo | Legítimo interesse |
| Dados de pessoas inativas | 5 anos após último contato | Auditoria |
| Logs de auditoria | 5 anos | Obrigação legal |
| Demanda encerrada | 5 anos | Legítimo interesse |
| Consentimento revogado | 2 anos após revogação | Auditoria |

### 5.2 Eliminação Programada

Após o prazo de retenção, os dados devem ser:
1. **Anonimizados** (substituir nome por "Dado removido", limpar telefone/e-mail)
2. Ou **excluídos fisicamente** do banco

### 5.3 Fluxo de Exclusão a Pedido

```
Titular solicita exclusão
↓
Verificar identidade (envio de SMS/e-mail)
↓
Registrar solicitação em audit_logs
↓
Executar anonimização:
  1. Nome → "Dados removidos a pedido"
  2. Telefone → NULL
  3. E-mail → NULL
  4. Observações → NULL
  5. deleted_at → now()
  6. consent_revoked_at → now()
↓
Notificar operador responsável
```

---

## 6. MEDIDAS DE SEGURANÇA

### 6.1 Técnicas

| Medida | Implementação |
|--------|---------------|
| Criptografia em repouso | PostgreSQL nativo |
| Criptografia em trânsito | HTTPS/TLS obrigatório |
| Hash de senhas | BCrypt (custo 10+) |
| Controle de acesso | RBAC + isolamento territorial |
| Auditoria | audit_logs em toda operação crítica |
| Sessão | JWT com expiração (1h) |
| Rate limiting | 5 tentativas de login, bloqueio 15min |
| Soft delete | Nenhum dado é perdido, apenas marcado |

### 6.2 Organizacionais

| Medida | Descrição |
|--------|-----------|
| Acesso mínimo necessário | Cada perfil acessa apenas o necessário |
| Registro de acesso | Todo login/logout é registrado |
| Capacitação | Operadores treinados em LGPD |
| Incidentes | Processo de notificação à ANPD (72h) |

---

## 7. COMPARTILHAMENTO DE DADOS

A plataforma **não compartilha dados pessoais com terceiros**.

Exceções:
- **Ordem judicial** ou requisição de autoridade competente
- **Proteção de direitos** em caso de disputa legal

Em caso de integração futura com serviços de terceiros (WhatsApp, e-mail):
- Exigir contrato de tratamento de dados (art. 42 LGPD)
- Limitar ao mínimo necessário
- Registrar em DPA (Data Processing Agreement)

---

## 8. RESPONSABILIDADES

### 8.1 Do Operador (COMANDO 360)

- Manter registro das operações de tratamento
- Implementar medidas de segurança
- Comunicar incidentes ao controlador em até 24h
- Auxiliar o controlador no atendimento aos direitos dos titulares
- Não reter dados além do prazo contratual

### 8.2 Do Controlador (Cliente)

- Obter consentimento dos titulares
- Definir finalidades do tratamento
- Responder às solicitações dos titulares
- Manter política de privacidade acessível
- Designar encarregado (DPO)

---

## 9. PLANO DE IMPLEMENTAÇÃO

| Requisito | Prioridade | Esforço | Fase |
|-----------|------------|---------|------|
| Não armazenar dados sensíveis | P0 | Já implementado | Fase 01 |
| Auditoria (audit_logs) | P0 | Já implementado | Fase 01 |
| Controle de acesso (RBAC) | P0 | Já implementado | Fase 01 |
| Criptografia HTTPS | P0 | Infraestrutura | Deploy |
| Consentimento no cadastro | P1 | Médio | Fase 03 |
| Anonimização de dados | P1 | Médio | Fase 03 |
| Fluxo de exclusão a pedido | P1 | Alto | Fase 03 |
| Exportação de dados (portabilidade) | P2 | Médio | Fase 04 |
| Política de privacidade | P1 | Documentação | Antes do Deploy |
| DPA para integrações | P2 | Documentação | Fase 11 |

---

## 10. REFERÊNCIAS

- Lei nº 13.709/2018 (LGPD) — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- ANPD — https://www.gov.br/anpd
- Guia de Boas Práticas ANPD — https://www.gov.br/anpd/pt-br/documentos-privados/guia-de-boas-praticas
- Encarregado (DPO): a definir por instalação
