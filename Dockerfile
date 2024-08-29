# Use a imagem base do Node.js
FROM node:18

# Defina o diretório de trabalho
WORKDIR /app

# Cria o diretório público e as subpastas necessárias
RUN mkdir -p /app/dist/public/images

# Copie os arquivos package.json e package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todos os arquivos do projeto
COPY . .

# Baixe o dockerize e torne-o executável
RUN curl -L https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz | tar xz -C /usr/local/bin

# Compile o TypeScript
RUN npm run build

# Exponha a porta
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["dockerize", "-wait", "tcp://db:5432", "-timeout", "30s", "npm", "start"]

