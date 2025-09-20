import { Link } from "@tanstack/react-router";
import { authClient } from "../utils/auth-client";

export default function Header() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isAuthenticated = !!session?.user;

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        {/* <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle lg:hidden"
          >
            <Icon icon="lineicons:menu-hamburger-1" className="size-6" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 border-base-300 border shadow"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </div> */}
        <Link to="/" className="btn btn-ghost text-xl">
          Rewiredu
        </Link>
      </div>
      <div className="navbar-end">
        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                {user.image ? (
                  <img src={user.image} alt={user.name} />
                ) : (
                  <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li className="menu-title">
                <span>{user.name}</span>
              </li>
              <li>
                <span className="text-sm text-base-content/70">
                  {user.email}
                </span>
              </li>
              <li>
                <hr className="my-1" />
              </li>
              <li>
                <button onClick={signOut} className="text-error">
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-md">
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
}
