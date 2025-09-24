# Learnysvia - Unified Docker Container

This setup provides a unified Docker container that runs both the backend API and the React frontend in a single container.

## Features

- **Single Container**: Both backend and frontend in one container
- **Production Ready**: Optimized builds for both services
- **Static File Serving**: Backend serves the built React app
- **WebSocket Support**: Full WebSocket functionality maintained
- **Health Checks**: Built-in health monitoring
- **Environment Configuration**: Easy environment variable management

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `TURSO_DATABASE_URL`: Your Turso database URL
- `TURSO_AUTH_TOKEN`: Your Turso authentication token
- `BETTER_AUTH_SECRET`: Generate a secure random string
- `BETTER_AUTH_URL`: Your application URL (http://localhost:3000)
- `CLIENT_URL`: Your client URL (http://localhost:5173)

### 2. Build and Run

Using Docker Compose (recommended):

```bash
# Build and start the container
docker-compose up --build

# Run in background
docker-compose up -d --build
```

Using Docker directly:

```bash
# Build the image
docker build -t learnysvia .

# Run the container
docker run -p 3000:3000 --env-file .env learnysvia
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **WebSocket**: ws://localhost:3000/ws

## Development

### Local Development

For development, you can still run the services separately:

```bash
# Backend
cd backend && bun run dev

# Frontend (in another terminal)
cd client && bun run dev
```

### Production Build

The Docker container automatically:
1. Builds the backend using Bun's compile feature
2. Builds the React frontend using Vite
3. Serves both from a single Elysia server
4. Handles static file serving and API routing

## Architecture

```
┌─────────────────┐
│   Docker Image  │
├─────────────────┤
│  Backend Build  │ ← Elysia.js + Bun (compiled)
│  Client Build   │ ← React + Vite (built)
│  Static Server  │ ← Serves React app
│  API Server     │ ← Handles API routes
│  WebSocket      │ ← Real-time features
└─────────────────┘
         │
         ▼
    Port 3000
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TURSO_DATABASE_URL` | Turso database connection URL | Yes |
| `TURSO_AUTH_TOKEN` | Turso database authentication token | Yes |
| `BETTER_AUTH_SECRET` | Secret for authentication | Yes |
| `BETTER_AUTH_URL` | Base URL for authentication | Yes |
| `CLIENT_URL` | Client application URL | Yes |

## Troubleshooting

### Container won't start
- Check environment variables in `.env`
- Ensure all required variables are set
- Check Docker logs: `docker-compose logs`

### Database connection issues
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Test connection outside Docker first

### Frontend not loading
- Check if the build completed successfully
- Verify static file serving is working
- Check browser console for errors

## Health Check

The container includes a health check that monitors:
- Server responsiveness
- Database connectivity
- Static file serving

Check health status:
```bash
docker-compose ps
```

## Logs

View application logs:
```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service logs
docker-compose logs learnysvia
```

## Stopping the Application

```bash
# Stop and remove container
docker-compose down

# Stop and remove with volumes
docker-compose down -v
```

## Rebuilding

After making changes:

```bash
# Rebuild and restart
docker-compose up --build --force-recreate

# Or using Docker directly
docker build -t learnysvia .
docker run -p 3000:3000 --env-file .env learnysvia
