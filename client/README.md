# Learnysvia Client 🎓✨

The frontend application for Learnysvia - a real-time classroom polling tool built with React, TypeScript, and modern web technologies.

## 🚀 Features

- **Real-time Polling**: Live updates using WebSocket connections
- **Anonymous Participation**: Students can join without creating accounts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and DaisyUI components
- **Type Safety**: Full TypeScript support throughout the application
- **Optimized Performance**: Uses TanStack Query for efficient data fetching

## 🛠 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Real-time**: WebSocket connections
- **Authentication**: Better Auth

## 📋 Prerequisites

Before running this project, make sure you have:

- **BunJS or Node.js** (version 18 or higher)
- **bun** or **yarn** or **npm** package manager
- **Backend server** running (see main project README)

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using bun (recommended)
bun install
```

### 2. Environment Configuration

Create a `.env` file in the client directory:

```env
VITE_SERVER_URL=http://localhost:3000
```

**Environment Variables:**

- `VITE_SERVER_URL`: The URL of your backend server (default: http://localhost:3000)

### 3. Start Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
# Using npm
npm run build

# Using yarn
yarn build

# Using bun
bun run build
```

The built files will be in the `dist` directory.

### 5. Preview Production Build

```bash
# Using npm
npm run serve

# Using yarn
yarn serve

# Using bun
bun run serve
```

## 📁 Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── catalog/        # Catalog-related components
│   │   ├── core/           # Core UI components
│   │   ├── modals/         # Modal components
│   │   └── room/           # Room-related components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   ├── mutations/          # TanStack Query mutations
│   ├── queries/            # TanStack Query queries
│   ├── routes/             # Route components
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Notes

- The application uses **hot module replacement** during development
- **TypeScript strict mode** is enabled for better type safety
- **ESLint** and **Prettier** are configured for code quality
- The app is optimized for **production builds** with code splitting

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `vite.config.ts` or kill the process using the port
2. **Module not found**: Run `npm install` to ensure all dependencies are installed
3. **TypeScript errors**: Check that your IDE is using the correct TypeScript version
4. **Styling issues**: Make sure Tailwind CSS is properly configured

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Verify that the backend server is running
3. Ensure all environment variables are set correctly
4. Check the network tab for failed requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Happy coding!** 🎉
