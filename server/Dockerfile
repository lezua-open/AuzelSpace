FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

RUN mkdir -p /app/data /app/storage

ENV PORT=3000
ENV DB_PATH=/app/data/auzel.db
ENV UPLOAD_DIR=/app/storage

EXPOSE 3000

CMD ["node", "--import", "tsx", "src/index.ts"]
