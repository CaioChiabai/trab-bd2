# Documentacao Final - CRUD MongoDB para Empresa de Imoveis

## Mini-mundo

Uma empresa de compra e venda de imoveis deseja informatizar seus servicos. Ela trabalha com imoveis de diferentes tipos, como casa, apartamento, loja e garagem. Cada imovel pertence a um cliente vendedor. A empresa tambem atende clientes compradores, que possuem interesses de compra com caracteristicas desejadas do imovel, localidade e valor maximo.

O sistema tambem registra visitas realizadas por compradores aos imoveis. Um mesmo comprador pode visitar o mesmo imovel mais de uma vez, por isso as visitas foram modeladas em uma colecao propria.

## Modelo das colecoes

### `clientes`

Armazena vendedores, compradores ou clientes que exercem os dois papeis.

```json
{
  "_id": "ObjectId",
  "nome": "Ana Martins",
  "endereco": "Rua das Flores, 120, Belo Horizonte/MG",
  "telefone": "31999990001",
  "email": "ana.martins@email.com",
  "tipo": ["vendedor"],
  "interesses": []
}
```

Quando o cliente e comprador, o campo `interesses` recebe uma lista:

```json
{
  "quartos": 2,
  "tamanho_min_m2": 60,
  "area_lazer": true,
  "bairro": "Centro",
  "cidade": "Sao Paulo",
  "uf": "SP",
  "valor_maximo": 480000
}
```

### `imoveis`

Armazena os imoveis disponiveis na empresa. O campo `dono_id` referencia o cliente vendedor, evitando repetir nome, telefone, endereco e e-mail do vendedor em cada imovel.

```json
{
  "_id": "ObjectId",
  "tipo": "apartamento",
  "endereco": {
    "logradouro": "Rua Aimores",
    "numero": "1500",
    "bairro": "Funcionarios",
    "cidade": "Belo Horizonte",
    "uf": "MG"
  },
  "preco": 500000,
  "data_construcao": "2016-03-10T00:00:00.000Z",
  "ocupado": false,
  "dono_id": "ObjectId do vendedor"
}
```

### `visitas`

Registra as visitas de compradores aos imoveis.

```json
{
  "_id": "ObjectId",
  "imovel_id": "ObjectId do imovel",
  "cliente_id": "ObjectId do comprador",
  "data_hora": "2026-04-01T13:00:00.000Z",
  "observacao": "Gostou da localizacao."
}
```

## Operacoes CRUD

O sistema possui CRUD para:

- clientes: cadastro, listagem, alteracao e exclusao;
- imoveis: cadastro, listagem, alteracao e exclusao;
- visitas: cadastro, listagem, alteracao e exclusao;
- interesses de compra: adicionar, alterar e remover interesses dentro do cliente comprador.

Regras implementadas:

- um imovel so pode ser cadastrado com `dono_id` de um cliente vendedor;
- uma visita so pode ser cadastrada com `cliente_id` de comprador e `imovel_id` existente;
- cliente com imoveis ou visitas vinculadas nao pode ser excluido diretamente;
- imovel com visitas vinculadas nao pode ser excluido diretamente.

## Consultas com `find`

Listar imoveis disponiveis:

```js
db.imoveis.find({ ocupado: false }).sort({ preco: 1 })
```

Buscar imoveis por tipo, cidade e faixa de preco:

```js
db.imoveis.find({
  tipo: "apartamento",
  "endereco.cidade": "Belo Horizonte",
  preco: { $lte: 550000 }
})
```

Listar compradores com interesses cadastrados:

```js
db.clientes.find({
  tipo: "comprador",
  interesses: { $exists: true, $ne: [] }
})
```

## Consultas com `aggregate`

Contar imoveis por tipo:

```js
db.imoveis.aggregate([
  { $group: { _id: "$tipo", quantidade: { $sum: 1 } } },
  { $sort: { quantidade: -1, _id: 1 } }
])
```

Calcular preco medio por cidade e bairro:

```js
db.imoveis.aggregate([
  {
    $group: {
      _id: {
        cidade: "$endereco.cidade",
        bairro: "$endereco.bairro",
        uf: "$endereco.uf"
      },
      preco_medio: { $avg: "$preco" },
      menor_preco: { $min: "$preco" },
      maior_preco: { $max: "$preco" },
      quantidade: { $sum: 1 }
    }
  }
])
```

Listar imoveis com dados do vendedor usando `$lookup`:

```js
db.imoveis.aggregate([
  {
    $lookup: {
      from: "clientes",
      localField: "dono_id",
      foreignField: "_id",
      as: "vendedor"
    }
  },
  { $unwind: "$vendedor" }
])
```

Listar visitas com comprador e imovel usando `$lookup`:

```js
db.visitas.aggregate([
  {
    $lookup: {
      from: "clientes",
      localField: "cliente_id",
      foreignField: "_id",
      as: "cliente"
    }
  },
  { $unwind: "$cliente" },
  {
    $lookup: {
      from: "imoveis",
      localField: "imovel_id",
      foreignField: "_id",
      as: "imovel"
    }
  },
  { $unwind: "$imovel" }
])
```

## Funcoes agregadas

Maior e menor preco de imovel:

```js
db.imoveis.aggregate([
  {
    $group: {
      _id: null,
      menor_preco: { $min: "$preco" },
      maior_preco: { $max: "$preco" },
      preco_medio: { $avg: "$preco" },
      quantidade: { $sum: 1 }
    }
  }
])
```

Total de visitas por imovel:

```js
db.visitas.aggregate([
  {
    $group: {
      _id: "$imovel_id",
      total_visitas: { $sum: 1 },
      ultima_visita: { $max: "$data_hora" }
    }
  }
])
```

Quantidade de imoveis por vendedor:

```js
db.imoveis.aggregate([
  {
    $group: {
      _id: "$dono_id",
      quantidade_imoveis: { $sum: 1 }
    }
  }
])
```

## Roteiro de demonstracao

1. Executar `npm install`.
2. Configurar `.env`.
3. Executar `npm run seed`.
4. Executar `npm start`.
5. Abrir `http://localhost:3000`.
6. Demonstrar cadastro de um cliente comprador.
7. Adicionar um interesse de compra para esse cliente.
8. Cadastrar um imovel associado a um vendedor.
9. Registrar uma visita do comprador ao imovel.
10. Executar a aba "Consultas" ou o comando `npm run consultas`.

## Prompts de IA utilizados

IA utilizada: OpenAI Codex / ChatGPT.

Prompt 1:

```text
usando as instrucoes do professor, o mini mundo apresentado, desenvolva um plano de acao para concluir o trabalho
```

Resultado obtido: plano de acao com colecoes, CRUDs, consultas obrigatorias, etapas de execucao, testes e assumptions.

Prompt 2:

```text
PLEASE IMPLEMENT THIS PLAN: [plano de acao completo]
```

Resultado obtido: implementacao do projeto com API Node.js + Express, MongoDB, seed de dados, consultas obrigatorias, interface web, testes e documentacao.
