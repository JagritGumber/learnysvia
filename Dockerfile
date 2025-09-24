# Multi-stage build for client and backend with nginx
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

# Backend build stage
FROM oven/bun AS backend-build

WORKDIR /app

# Copy backend files
COPY backend/package.json backend/bun.lock ./
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/src ./src

# Build backend
ENV NODE_ENV=production
RUN bun install
RUN mkdir -p dist
RUN bun build \
    --minify-whitespace \
    --minify-syntax \
    --outfile ./dist/index.js \
    src/index.ts

# Production stage with nginx and Bun
FROM oven/bun AS runtime

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Set up nginx to run in foreground
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Copy built client files to nginx html directory
COPY --from=client-build /app/dist /usr/share/nginx/html

# Copy backend JavaScript files
COPY --from=backend-build /app/dist /app/dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start both nginx and backend server
# Backend runs on port 3000, nginx proxies requests
CMD bun run /app/dist/index.js & nginx -g 'daemon off;'
