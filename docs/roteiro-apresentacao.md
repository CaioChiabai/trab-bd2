# Roteiro de Apresentacao

## 1. Contexto

O trabalho modela uma empresa de compra e venda de imoveis. Existem clientes vendedores, clientes compradores, imoveis anunciados e visitas realizadas aos imoveis.

## 2. Modelagem

Foram criadas tres colecoes principais:

- `clientes`: dados dos clientes e interesses de compra;
- `imoveis`: dados dos imoveis, com referencia ao vendedor por `dono_id`;
- `visitas`: historico de visitas, com referencia ao comprador e ao imovel.

A referencia entre `imoveis` e `clientes` evita repetir os dados do vendedor em varios imoveis.

## 3. Demonstracao do CRUD

1. Mostrar a lista de clientes.
2. Cadastrar um comprador.
3. Adicionar um interesse de compra ao comprador.
4. Cadastrar um imovel selecionando um vendedor.
5. Registrar uma visita do comprador ao imovel.
6. Excluir uma visita de teste.

## 4. Consultas

Mostrar na aba "Consultas" ou no terminal com `npm run consultas`:

- imoveis disponiveis;
- compradores com interesses;
- imoveis por tipo;
- preco medio por localidade;
- imoveis com vendedor via `$lookup`;
- visitas com comprador e imovel via `$lookup`;
- maior e menor preco;
- visitas por imovel;
- imoveis por vendedor.

## 5. Encerramento

Destacar que o sistema atende ao mini-mundo, usa MongoDB como SGBD, possui CRUD completo e inclui consultas com `find`, `aggregate` e funcoes agregadas.
