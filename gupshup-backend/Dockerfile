FROM node:23.11.1-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

RUN npm run build

FROM node:23.11.1-alpine3.21 AS prod

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm ci --only=production --silent && npm cache clean --force

EXPOSE 5000

CMD ["node", "./dist/server.js"]