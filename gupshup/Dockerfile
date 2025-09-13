FROM node:23.11.1-alpine3.21 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:23.11.1-alpine3.21 AS prod

WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]