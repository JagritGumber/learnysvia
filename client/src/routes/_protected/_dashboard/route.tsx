import { FileRoutesByTo } from "@/routeTree.gen";
import { authClient } from "@/utils/auth-client";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { clsx } from "clsx";

export const Route = createFileRoute("/_protected/_dashboard")({
  component: RouteComponent,
});

const tabs: Array<{
  name: string;
  route: keyof FileRoutesByTo;
}> = [
  {
    name: "Rooms",
    route: "/rooms",
  },
  {
    name: "Question Catalog",
    route: "/catalog",
  },
];

function RouteComponent() {
  const location = useLocation();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="w-full">
      <nav className="navbar bg-base-100 border border-base-300 shadow-sm min-h-0 w-full">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl">
            Learnysvia
          </Link>
        </div>
        <ul className="tabs flex-nowrap p-0 min-h-0">
          {tabs.map((tab) => (
            <Link to={tab.route} key={tab.route}>
              <li
                className={clsx("tab text-nowrap", {
                  "tab-active": location.pathname === tab.route,
                })}
              >
                {tab.name}
              </li>
            </Link>
          ))}
        </ul>
        <div className="navbar-end">
          {!user ? null : (
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
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 border border-base-300"
              >
                <li>
                  <button onClick={signOut} className="text-error">
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
