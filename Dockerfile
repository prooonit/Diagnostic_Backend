FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
# Prisma 7 resolves prisma.config.ts during generation. This non-secret,
# build-only URL satisfies config validation; Compose overrides it at runtime.
ARG DATABASE_URL=postgresql://prisma:prisma@localhost:5432/prisma
RUN DATABASE_URL=$DATABASE_URL npx prisma generate

COPY src ./src

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
