# Learnysvia Backend 🚀

The backend API server for Learnysvia - a real-time classroom polling tool built with Elysia.js, TypeScript, and modern backend technologies.

## 🎯 Overview

This backend provides RESTful APIs and WebSocket connections for the Learnysvia application, handling real-time polling, user authentication, room management, and data persistence.

## 🛠 Tech Stack

- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Elysia.js (TypeScript-first web framework)
- **Language**: TypeScript
- **Database**: Turso (distributed SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Real-time**: WebSocket connections
- **Schema Validation**: Zod

## 📋 Prerequisites

Before running this project, make sure you have:

- **Bun** (version 1.0 or higher) - [Installation Guide](https://bun.sh/docs/installation)
- **Turso Database** account and database - [Get Started](https://turso.tech/)
- **Git** for version control

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
# Using bun (recommended)
bun install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database Configuration
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Authentication Configuration
BETTER_AUTH_SECRET=your-better-auth-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Client Configuration
CLIENT_URL=http://localhost:5173
```

**Required Environment Variables:**

- `TURSO_DATABASE_URL`: Your Turso database URL (format: `libsql://your-database-url.turso.io`)
- `TURSO_AUTH_TOKEN`: Your Turso authentication token
- `BETTER_AUTH_SECRET`: Secret key for Better Auth (generate a secure random string)
- `BETTER_AUTH_URL`: Backend server URL (default: http://localhost:3000)
- `CLIENT_URL`: Frontend application URL (default: http://localhost:5173)

### 3. Database Setup

#### Initialize Database Schema

```bash
# Generate and apply database migrations
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

#### Push Schema to Database

```bash
# Push schema changes to database
bunx drizzle-kit push
```

### 4. Start Development Server

```bash
# Using bun (recommended)
bun run dev
```

The server will start at `http://localhost:3000`

### 5. Build for Production

```bash
# Build the application
bun run build

# Start the production server
bun run start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── database/           # Database configuration and schemas
│   │   ├── db.ts          # Database connection
│   │   └── schemas/        # Database schema definitions
│   ├── routes/            # API route handlers
│   │   ├── api/           # REST API endpoints
│   │   └── ws/            # WebSocket handlers
│   ├── services/          # Business logic services
│   ├── macros/            # Elysia.js plugins and middleware
│   ├── utils/             # Utility functions
│   ├── env.ts             # Environment configuration
│   └── index.ts           # Application entry point
├── drizzle.config.ts      # Drizzle configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/*` - Authentication endpoints (handled by Better Auth)

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get room by ID
- `DELETE /api/rooms/:id` - Delete a room

### Polls
- `GET /api/rooms/:roomId/polls` - Get polls for a room
- `POST /api/rooms/:roomId/polls` - Create a poll
- `GET /api/polls/:id` - Get poll by ID

### Catalogs
- `GET /api/catalogs` - Get all catalogs
- `POST /api/catalogs` - Create a catalog
- `GET /api/catalogs/:id` - Get catalog by ID

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create a question
- `GET /api/questions/:id` - Get question by ID

### WebSocket
- `WS /ws/rooms/:roomId` - Real-time room updates

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: User accounts and authentication
- **Rooms**: Virtual classrooms/polling rooms
- **Polls**: Individual polls within rooms
- **Questions**: Reusable question templates
- **Catalogs**: Collections of questions
- **Participants**: Room participants
- **PollAnswers**: Student responses to polls

## 🔧 Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bunx drizzle-kit generate` - Generate database migrations
- `bunx drizzle-kit migrate` - Apply migrations to database
- `bunx drizzle-kit push` - Push schema to database

## 🌐 CORS Configuration

The backend is configured to accept requests from:
- Frontend development server (`http://localhost:5173`)
- Production frontend URL (configured via `CLIENT_URL`)

## 🔐 Authentication

The application uses Better Auth for authentication with support for:
- Email/password authentication
- Social login providers (configurable)
- Session management
- Password reset functionality

## ⚡ Performance Features

- **Bun Runtime**: Ultra-fast JavaScript runtime
- **Connection Pooling**: Efficient database connections
- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety
- **Schema Validation**: Runtime type checking with Zod

## 🧪 Development Workflow

1. **Start Backend**: `bun run dev`
2. **Make Changes**: Edit TypeScript files
3. **Auto-reload**: Server automatically restarts
4. **Test API**: Use tools like Postman or curl
5. **Database Changes**: Update schemas and run migrations

## 🔍 Monitoring and Debugging

### Logging
The server includes comprehensive logging for:
- HTTP requests and responses
- Database operations
- Authentication events
- WebSocket connections

### Error Handling
- Structured error responses
- Database connection monitoring
- Graceful error recovery

## 🚀 Deployment

### Production Deployment

1. **Set Environment Variables**: Configure all required environment variables
2. **Build Application**: `bun run build`
3. **Start Server**: `bun run start`
4. **Use Process Manager**: Consider using PM2 or similar for production

### Environment Variables for Production

```env
# Production Database
TURSO_DATABASE_URL=libsql://your-production-db.turso.io
TURSO_AUTH_TOKEN=your-production-auth-token

# Production URLs
BETTER_AUTH_URL=https://your-api-domain.com
CLIENT_URL=https://your-frontend-domain.com
BETTER_AUTH_SECRET=your-production-auth-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Development Guidelines

- **TypeScript**: All code must be typed
- **Error Handling**: Proper error handling in all endpoints
- **Validation**: Input validation using Zod schemas
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for API changes

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
   - Check database permissions and network connectivity

2. **Authentication Issues**:
   - Ensure `BETTER_AUTH_SECRET` is set
   - Verify `BETTER_AUTH_URL` matches your server URL

3. **CORS Errors**:
   - Check `CLIENT_URL` environment variable
   - Verify frontend is running on the expected port

4. **Port Already in Use**:
   - Kill existing process or change port in configuration

### Getting Help

1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test database connectivity with Turso CLI
4. Check network connectivity and firewall settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Happy coding!** 🎉
