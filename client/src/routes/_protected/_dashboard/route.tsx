import { FileRoutesByTo } from "@/routeTree.gen";
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
  return (
    <div className="w-full">
      <nav className="navbar bg-base-100 border border-base-300 shadow-sm pt-2 min-h-0 w-full">
        <ul className="tabs tabs-border w-full p-0 min-h-0">
          {tabs.map((tab) => (
            <Link to={tab.route}>
              <li
                className={clsx("tab", {
                  "tab-active": location.pathname === tab.route,
                })}
              >
                {tab.name}
              </li>
            </Link>
          ))}
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
