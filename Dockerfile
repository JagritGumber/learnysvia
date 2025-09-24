FROM oven/bun

WORKDIR /app

# Cache packages installation
COPY backend/package.json backend/bun.lock ./
RUN bun install

COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/.env ./

ENV NODE_ENV=production

# Don't use --compile flag to avoid native dependency issues
RUN bun build \
	--minify-whitespace \
	--minify-syntax \
	--outfile server.js \
	src/index.ts

ENV NODE_ENV=production

CMD ["bun", "run", "server.js"]

EXPOSE 3000
