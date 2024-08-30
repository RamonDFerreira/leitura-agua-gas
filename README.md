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

- **Endpoint GET /:** Informa uma mensagem de boas vindas.
- **Endpoint POST /upload:** Recebe uma imagem em base64, consulta a API Google Gemini e retorna a medida lida.
- **Endpoint POST /confirm:** Recebe um measure_uuid e um valor de confirmação para alterar o valor da medida lida. Retorna sucesso ou erro.
- **Endpoint GET /:customer_code/list:** Lista as medidas realizadas por um determinado cliente.

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