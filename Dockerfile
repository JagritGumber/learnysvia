FROM oven/bun

WORKDIR /app

# Cache packages installation
COPY backend/package.json backend/bun.lock ./

COPY backend/src ./src
COPY backend/tsconfig.json ./

ENV NODE_ENV=production

# Don't use --compile flag to avoid native dependency issues
RUN bun run start

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 8080
