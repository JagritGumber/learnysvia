# Multi-stage build for unified backend and client container
FROM oven/bun AS backend-build

WORKDIR /app

# Copy backend files
COPY backend/package.json backend/bun.lock ./
COPY backend/src ./src

# Build backend
ENV NODE_ENV=production
RUN bun install
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile server \
    src/index.ts

# Build client
FROM oven/bun AS client-build

WORKDIR /app

# Copy client files
COPY client/package.json client/bun.lock ./
COPY client/src ./src
COPY client/index.html client/vite.config.ts client/tsconfig.json ./
COPY client/public ./public

# Install client dependencies and build
RUN bun install
RUN bun run build

# Final production image
FROM gcr.io/distroless/base

WORKDIR /app

# Copy backend binary
COPY --from=backend-build /app/server server

# Copy built client files
COPY --from=client-build /app/dist ./client-dist

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV CLIENT_URL=http://localhost:5173

# Start the server
CMD ["./server"]
