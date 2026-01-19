FROM node:18-alpine As development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine As production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
COPY --from=development /usr/src/app/dist ./dist
# Copiar mock-db para fallback si es necesario (aunque en prod idealmente usar Mongo, el mock requiere archivos)
COPY --from=development /usr/src/app/src/mock-db ./dist/src/mock-db
# Asegurar que la carpeta src/mock-db exista también en root si el código lo busca allí
COPY --from=development /usr/src/app/src/mock-db ./src/mock-db

CMD ["node", "dist/main"]
