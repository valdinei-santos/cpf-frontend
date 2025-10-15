# =========================================================
# STAGE 1: BUILD (Compila o projeto usando o Node.js/npm)
# =========================================================
FROM node:lts-alpine AS build-stage

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Executa o comando de build (isso gera a pasta 'dist')
RUN npm run build

# =========================================================
# STAGE 2: PRODUCTION (Serve os arquivos estáticos usando Nginx)
# =========================================================
FROM nginx:stable-alpine as production-stage

# É ESSENCIAL para que o Vue Router (modo history) funcione
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]