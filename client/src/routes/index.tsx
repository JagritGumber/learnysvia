import { createFileRoute, Link } from '@tanstack/react-router'
import { authClient } from '../utils/auth-client'
import logo from '../logo.svg'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="text-center">
        <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
          <div className="text-xl">Loading...</div>
        </header>
      </div>
    )
  }

  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite] mb-8"
          alt="logo"
        />
        <p className="mb-8">
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>

        {session ? (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Current Session:</h3>
            <pre className="bg-gray-800 p-4 rounded-lg text-left text-sm overflow-auto max-w-2xl mx-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="mb-8">
            <Link
              to="/signin"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Sign In / Sign Up
            </Link>
          </div>
        )}

        <div className="space-y-4">
          <a
            className="text-[#61dafb] hover:underline block"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <a
            className="text-[#61dafb] hover:underline block"
            href="https://tanstack.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn TanStack
          </a>
        </div>
      </header>
    </div>
  )
}
