# Base Demo — Gabinete Digital

Dados fictícios para demonstração e treinamento presencial.

## Territórios

```
Estado: São Paulo (raiz)
├── Município: São Paulo (SP)
│   ├── Bairro: Vila Madalena (Zona Oeste)
│   ├── Bairro: Itaim Bibi (Zona Sul)
│   └── Bairro: São Miguel Paulista (Zona Leste)
├── Município: Campinas (SP)
│   ├── Bairro: Cambuí
│   └── Bairro: Barão Geraldo
└── Município: Santos (SP)
    ├── Bairro: Gonzaga
    └── Bairro: Ponta da Praia
```

## SQL para Inserir

Execute no banco para popular a base demo.

```sql
-- ============================================================
-- TERRITÓRIOS
-- ============================================================
WITH estado AS (
  INSERT INTO territories (id, name, type, slug, created_at, updated_at)
  VALUES (gen_random_uuid(), 'São Paulo', 'Estado', 'sao-paulo', NOW(), NOW())
  RETURNING id
),
sp AS (
  INSERT INTO territories (id, name, type, slug, parent_id, created_at, updated_at)
  SELECT gen_random_uuid(), 'São Paulo', 'Municipio', 'sao-paulo-capital', id, NOW(), NOW()
  FROM estado RETURNING id
),
campinas AS (
  INSERT INTO territories (id, name, type, slug, parent_id, created_at, updated_at)
  SELECT gen_random_uuid(), 'Campinas', 'Municipio', 'campinas', id, NOW(), NOW()
  FROM estado RETURNING id
),
santos AS (
  INSERT INTO territories (id, name, type, slug, parent_id, created_at, updated_at)
  SELECT gen_random_uuid(), 'Santos', 'Municipio', 'santos', id, NOW(), NOW()
  FROM estado RETURNING id
)
INSERT INTO territories (id, name, type, slug, parent_id, created_at, updated_at)
VALUES
  -- SP
  (gen_random_uuid(), 'Vila Madalena', 'Bairro', 'vila-madalena', (SELECT id FROM sp), NOW(), NOW()),
  (gen_random_uuid(), 'Itaim Bibi', 'Bairro', 'itaim-bibi', (SELECT id FROM sp), NOW(), NOW()),
  (gen_random_uuid(), 'São Miguel Paulista', 'Bairro', 'sao-miguel-paulista', (SELECT id FROM sp), NOW(), NOW()),
  -- Campinas
  (gen_random_uuid(), 'Cambuí', 'Bairro', 'cambui', (SELECT id FROM campinas), NOW(), NOW()),
  (gen_random_uuid(), 'Barão Geraldo', 'Bairro', 'barao-geraldo', (SELECT id FROM campinas), NOW(), NOW()),
  -- Santos
  (gen_random_uuid(), 'Gonzaga', 'Bairro', 'gonzaga', (SELECT id FROM santos), NOW(), NOW()),
  (gen_random_uuid(), 'Ponta da Praia', 'Bairro', 'ponta-da-praia', (SELECT id FROM santos), NOW(), NOW());

-- ============================================================
-- PESSOAS
-- ============================================================
-- (assumindo que territory_ids precisam ser obtidos com subselects)
INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Carlos Andrade', '(11) 99999-0001', 'morador', id, true, NOW(), NOW()
FROM territories WHERE slug = 'vila-madalena' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Marina Silva', '(11) 99999-0002', 'comerciante', id, true, NOW(), NOW()
FROM territories WHERE slug = 'vila-madalena' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'João Pereira', '(11) 99999-0003', 'lideranca', id, true, NOW(), NOW()
FROM territories WHERE slug = 'itaim-bibi' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Ana Costa', '(11) 99999-0004', 'morador', id, true, NOW(), NOW()
FROM territories WHERE slug = 'sao-miguel-paulista' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Pedro Santos', '(19) 99999-0005', 'empresario', id, true, NOW(), NOW()
FROM territories WHERE slug = 'cambui' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Lucia Mendes', '(19) 99999-0006', 'vereador', id, true, NOW(), NOW()
FROM territories WHERE slug = 'barao-geraldo' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Roberto Oliveira', '(13) 99999-0007', 'morador', id, true, NOW(), NOW()
FROM territories WHERE slug = 'gonzaga' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Fernanda Lima', '(13) 99999-0008', 'lideranca', id, true, NOW(), NOW()
FROM territories WHERE slug = 'ponta-da-praia' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Ricardo Alves', '(11) 99999-0009', 'morador', id, true, NOW(), NOW()
FROM territories WHERE slug = 'itaim-bibi' LIMIT 1;

INSERT INTO people (id, name, phone, category, territory_id, consent_given, created_at, updated_at)
SELECT gen_random_uuid(), 'Sandra Dias', '(11) 99999-0010', 'professor', id, true, NOW(), NOW()
FROM territories WHERE slug = 'vila-madalena' LIMIT 1;
```

> **Nota**: Os UUIDs são gerados automaticamente. Para vincular lideranças e demandas, é necessário obter os IDs reais das pessoas e territórios após a inserção. Na demonstração, insira via interface.

---

## Lideranças (para criar via interface)

| Nome | Função | Território | Superior |
|---|---|---|---|
| João Pereira | Presidente de Associação | Itaim Bibi | — |
| Fernanda Lima | Liderança Comunitária | Ponta da Praia | — |
| Marina Silva | Representante de Comerciantes | Vila Madalena | João Pereira |
| Sandra Dias | Representante de Educação | Vila Madalena | João Pereira |

---

## Demandas (para criar via interface)

| Título | Categoria | Território | Status |
|---|---|---|---|
| Buraco na Rua Augusta | Infraestrutura | Vila Madalena | Recebida |
| Falta de iluminação na praça | Infraestrutura | Itaim Bibi | Recebida |
| UBS sem médico há 2 semanas | Saúde | São Miguel Paulista | Triagem |
| Escola precisa de reforma | Educação | Cambuí | Recebida |
| Transporte público insuficiente | Transporte | Barão Geraldo | Encaminhada |
| Esgoto a céu aberto na Rua 3 | Saneamento | Ponta da Praia | Recebida |
| Coleta de lixo irregular | Limpeza Urbana | Gonzaga | Triagem |
| Segurança no entorno da escola | Segurança | Vila Madalena | Acompanhamento |
| Praça abandonada no centro | Infraestrutura | Itaim Bibi | Recebida |
| Feira livre sem fiscalização | Serviços Públicos | São Miguel Paulista | Recebida |

---

## Eventos (para criar via interface)

| Título | Tipo | Território | Data |
|---|---|---|---|
| Reunião de Associação de Moradores | reunião | Vila Madalena | Próxima 3ª feira |
| Audiência Pública — Orçamento Participativo | audiencia | São Paulo (capital) | Próxima 5ª feira |
| Visita à UBS São Miguel | visita_oficial | São Miguel Paulista | Próxima 2ª feira |
| Mutirão de Limpeza no Gonzaga | evento_comunitario | Gonzaga | Próximo sábado |
| Entrega de reforma da Escola | entrega_obra | Cambuí | Próximo mês |

---

## Pesquisas (para aplicar via interface)

| Título | Pergunta |
|---|---|
| Satisfação com a coleta de lixo | Como você avalia a coleta de lixo no seu bairro? |
| Prioridades para 2026 | Qual a maior prioridade para a comunidade? |
| Segurança no bairro | Como você se sente em relação à segurança? |
| Transporte público | Você está satisfeito com o transporte público? |

---

## Para a Demonstração ao Vivo

### Roteiro de Apresentação (5 min)

1. **Login** como admin
2. **Dashboard** — mostrar KPIs zerados
3. **Territórios** — criar "Município de Exemplo" + "Bairro Demo"
4. **Pessoas** — cadastrar "Maria Aparecida" (a pessoa mais importante da base)
5. **Lideranças** — vincular Maria como liderança do Bairro Demo
6. **Demandas** — criar "Exemplo: Buraco na rua" e avançar pipeline
7. **Agenda** — criar "Reunião de Demonstração" para amanhã
8. **Atividades** — registrar "Visita à Maria Aparecida"
9. **War Room** — ver tudo aparecer nos KPIs
10. **Inteligência** — atualizar indicadores, ver score

> Pronto. Em 5 minutos você mostrou o ciclo completo do sistema.
