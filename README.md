# Projeto de Medidas

Este projeto é uma API para gerenciar e processar medidas de consumo de água e gás, integrando com a API Google Gemini para reconhecimento de valores a partir de imagens. A aplicação é desenvolvida com Node.js, TypeScript e Docker.

## Índice

- [Descrição do Projeto](#descrição-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Executando Testes](#executando-testes)
- [Estrutura do Projeto](#estrutura-do-projeto)

## Descrição do Projeto

A API permite o upload de imagens contendo medidas, consulta e listagem de medidas por cliente, e validação de dados com a API Google Gemini. O projeto inclui:

- **Endpoints** para upload e listagem de medidas
- **Integração** com a API Google Gemini para reconhecimento de valores em imagens
- **Persistência** de dados em um banco de dados PostgreSQL

## Tecnologias Utilizadas

- **Node.js** com **TypeScript**
- **Express** para o servidor HTTP
- **PostgreSQL** como banco de dados
- **Docker** para containerização
- **Jest** para testes
- **Dockerize** para gerenciamento de dependências de serviços

## Configuração do Ambiente

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **Docker** e **Docker Compose**

### Configuração do Docker

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/RamonDFerreira/leitura-agua-gas.git
   cd leitura-agua-gas
   ```

2. **Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:**

   ```bash
   GEMINI_API_KEY=seu_api_key_aqui
   ```

3. **Suba os contêineres Docker:**

   ```bash
   docker-compose up --build
   ```

   Isso iniciará a aplicação e o banco de dados PostgreSQL.

## Executando o Projeto

Após subir os contêineres Docker, a aplicação estará disponível em `http://localhost:3000`.

| Método | Endpoint              | Descrição                                                                 |
| ------ | --------------------- | ------------------------------------------------------------------------- |
| POST   | `/upload`             | Recebe uma imagem base64, consulta a API Google Gemini e retorna a medida lida. |
| PATCH  | `/confirm`            | Confirma o valor de uma medida previamente registrada.                     |
| GET    | `/<customer_code>/list` | Lista as medidas realizadas por um cliente, filtrando opcionalmente pelo tipo. |

### POST /upload

| Campo           | Tipo     | Descrição                                                         |
| --------------- | -------- | ----------------------------------------------------------------- |
| `image`         | `string` | Imagem em base64.                                                 |
| `customer_code` | `string` | Código do cliente.                                                |
| `measure_datetime` | `datetime` | Data e hora da medição.                                      |
| `measure_type`  | `string` | Tipo de medida: `WATER` ou `GAS` (case-insensitive).              |

**Response**

| Status Code | Descrição                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| `200`       | Operação realizada com sucesso, retorna `image_url`, `measure_value` e `measure_uuid`.                      |
| `400`       | Dados inválidos. Retorna `INVALID_DATA` e a descrição do erro.                                              |
| `409`       | Leitura do mês já realizada. Retorna `DOUBLE_REPORT` e a descrição do erro.                                 |

### PATCH /confirm

| Campo            | Tipo     | Descrição                                                    |
| ---------------- | -------- | ------------------------------------------------------------ |
| `measure_uuid`   | `string` | UUID da medida que deseja confirmar.                         |
| `confirmed_value`| `integer`| Valor confirmado da medida.                                  |

**Response**

| Status Code | Descrição                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `200`       | Operação realizada com sucesso, retorna `success: true`.                                         |
| `400`       | Dados inválidos. Retorna `INVALID_DATA` e a descrição do erro.                                  |
| `404`       | Leitura não encontrada. Retorna `MEASURE_NOT_FOUND` e a descrição do erro.                      |
| `409`       | Leitura já confirmada. Retorna `CONFIRMATION_DUPLICATE` e a descrição do erro.                  |

### GET /<customer_code>/list

| Query Parameters (Opcional) | Tipo     | Descrição                                                     |
| --------------------------- | -------- | ------------------------------------------------------------- |
| `measure_type`              | `string` | Tipo de medida: `WATER` ou `GAS` (case-insensitive).           |

**Response**

| Status Code | Descrição                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `200`       | Operação realizada com sucesso, retorna uma lista de medidas realizadas.                         |
| `400`       | Tipo de medida inválido. Retorna `INVALID_TYPE` e a descrição do erro.                           |
| `404`       | Nenhuma leitura encontrada. Retorna `MEASURES_NOT_FOUND` e a descrição do erro.                  |


## Executando Testes

Para rodar os testes, use o seguinte comando:

```bash
npm test
```

Os testes estão localizados na pasta `__tests__` e cobrem as funcionalidades principais da API.

## Estrutura do Projeto

- `src/` - Código-fonte da aplicação
  - `config/` - Configurações e conexão ao banco de dados
  - `controllers/` - Controladores para rotas da API
  - `middlewares/` - Middlewares para validação e autenticação
  - `models/` - Modelos de dados e interfaces
  - `public/images` - Imagens temporárias geradas ao realizar uma inserção
  - `routes/` - Definição das rotas da API
  - `services/` - Serviços para lógica de negócios e integração com APIs externas
- `Dockerfile` - Configuração do Docker para a aplicação
- `Dockerfile-db` - Configuração do Docker para inicialização do banco de dados PostgreSQL
- `docker-compose.yml` - Configuração do Docker Compose
- `jest.config.ts` - Configuração do Jest para testes
- `init.sql` - Script para inicialização do banco de dados PostgreSQL
- `README.md` - Documentação do projeto