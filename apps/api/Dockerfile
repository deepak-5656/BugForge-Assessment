FROM node:22-alpine AS build
RUN corepack enable pnpm
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build
FROM node:22-alpine
RUN corepack enable pnpm
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN pnpm install --prod
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
