# CRUD MongoDB - Empresa de Imoveis

Projeto do Grupo 1 para a disciplina de Banco de Dados 2. O sistema implementa um CRUD para uma empresa de compra e venda de imoveis usando MongoDB como SGBD.

## Requisitos

- Node.js 18 ou superior
- MongoDB local ou uma string de conexao MongoDB Atlas

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir de `.env.example`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=empresa_imoveis
PORT=3000
```

3. Popule o banco:

```bash
npm run seed
```

4. Inicie o servidor:

```bash
npm start
```

5. Acesse:

```text
http://localhost:3000
```

## Scripts

- `npm start`: inicia a API e a interface.
- `npm run dev`: inicia a API com recarregamento automatico do Node.
- `npm run seed`: recria os dados iniciais.
- `npm run consultas`: imprime no terminal as consultas obrigatorias.
- `npm test`: executa os testes automatizados.

## Rotas principais

- `GET /api/clientes`
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `DELETE /api/clientes/:id`
- `POST /api/clientes/:id/interesses`
- `PUT /api/clientes/:id/interesses/:index`
- `DELETE /api/clientes/:id/interesses/:index`
- `GET /api/imoveis`
- `POST /api/imoveis`
- `PUT /api/imoveis/:id`
- `DELETE /api/imoveis/:id`
- `GET /api/visitas`
- `POST /api/visitas`
- `PUT /api/visitas/:id`
- `DELETE /api/visitas/:id`

## Consultas obrigatorias

- `GET /api/consultas/find/imoveis-disponiveis`
- `GET /api/consultas/find/imoveis`
- `GET /api/consultas/find/compradores-com-interesses`
- `GET /api/consultas/aggregate/imoveis-por-tipo`
- `GET /api/consultas/aggregate/preco-medio-localidade`
- `GET /api/consultas/aggregate/imoveis-com-vendedor`
- `GET /api/consultas/aggregate/visitas-com-cliente-imovel`
- `GET /api/consultas/aggregate/preco-min-max`
- `GET /api/consultas/aggregate/visitas-por-imovel`
- `GET /api/consultas/aggregate/imoveis-por-vendedor`

## Estrutura

```text
public/          Interface web simples
src/routes/      Rotas CRUD e consultas
src/db.js        Conexao, colecoes e indices MongoDB
src/seed.js      Dados iniciais
src/consultas.js Script de demonstracao das consultas
docs/            Materiais do professor e documentacao final
test/            Testes automatizados
```
