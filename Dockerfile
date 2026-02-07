# Usa Node.js leve
FROM node:18-alpine

# Cria diretório
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependências e typescript
RUN npm install
RUN npm install -g typescript

# Copia o código fonte
COPY . .

# Compila o TypeScript para JavaScript
RUN tsc

# Copia a chave do firebase (CUIDADO: Em produção real use ENV VARS, mas para teste pode copiar)
# O ideal é usar Secrets do Fly.io, mas vamos manter simples por enquanto
COPY service-account.json ./dist/service-account.json

# Expõe a porta
EXPOSE 8080

# Roda o código compilado
CMD ["node", "dist/index.js"]