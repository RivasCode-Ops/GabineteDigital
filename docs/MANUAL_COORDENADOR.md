# Manual do Coordenador — Gabinete Digital

## Perfil

Coordenação Geral (nível 80) e Coordenação Municipal (nível 40).

## Fluxos

### 1. Criar Território

```
Sidebar → Territórios → Novo Território
```

Preencher:
- **Nome**: nome do município/região/bairro
- **Tipo**: Estado, Região, Município, Bairro ou Comunidade
- **Território pai**: vínculo hierárquico (ex: Município → Estado)

> Um território só pode ser excluído se não tiver filhos.

### 2. Cadastrar Pessoa

```
Sidebar → Pessoas → Nova Pessoa
```

Campos obrigatórios:
- **Nome** e **Telefone**
- **Categoria**: liderança, morador, empresário, vereador, etc.
- **Território**: vínculo territorial

> LGPD: O consentimento é registrado automaticamente no momento do cadastro.

### 3. Cadastrar Liderança

```
Sidebar → Lideranças → Nova Liderança
```

Campos:
- **Pessoa**: selecionar do cadastro de pessoas
- **Função**: ex: presidente de associação, síndico, liderança comunitária
- **Superior**: liderança vinculada (opcional)
- **Território**: área de atuação

> O sistema valida automaticamente ciclos hierárquicos (BFS).

### 4. Gerenciar Demandas

```
Sidebar → Demandas → Nova Demanda
```

Pipeline de status:
```
Recebida → Triagem → Encaminhada → Acompanhamento → Resolvida → Encerrada
```

Transições permitidas:
- **Recebida** → Triagem
- **Triagem** → Encaminhada ou Arquivada
- **Encaminhada** → Acompanhamento
- **Acompanhamento** → Resolvida
- **Resolvida** → Encerrada
- **Arquivada** (de qualquer estado)

### 5. Criar Evento

```
Sidebar → Agenda → Novo Evento
```

Tipos: audiência, reunião, evento_comunitario, visita_oficial, sessoes_comissao, entrega_obra

### 6. Usar o War Room

```
Sidebar → War Room
```

O War Room consolida:
- KPIs: pessoas, demandas, atividades, score médio
- Pipeline de demandas por status
- Alertas ativos
- Próximos eventos
- Top territórios
- Top lideranças

### 7. Inteligência Territorial

```
Sidebar → Inteligência → Atualizar Indicadores
```

Gera score (0-100) para cada território com base em:
- Lideranças cadastradas
- Atividades realizadas
- Demandas resolvidas
- Pesquisas de campo

### 8. Exportar Dados

```
Admin → Exportar
```

Formatos: CSV, XLSX
Tipos: pessoas, demandas, lideranças

---

## Atalhos Importantes

| Ação | Caminho |
|---|---|
| Dashboard | `/dashboard` |
| War Room | `/war-room` |
| Inteligência | `/intelligence` |
| IA | `/ai` |
| Auditoria | `/audit` |

---

## Boas Práticas

1. **Mantenha territórios atualizados** — a hierarquia correta impacta todos os relatórios
2. **Atualize indicadores semanalmente** — clique em "Atualizar Indicadores" na página de Inteligência
3. **Acompanhe alertas no War Room** — territórios críticos aparecem automaticamente
4. **Use a exportação semanal** — para backup e prestação de contas
5. **Registre atividades após cada visita** — isso alimenta o score territorial
