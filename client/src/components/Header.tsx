import { Link } from "@tanstack/react-router";

export default function Header() {
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
          Learnysvia
        </Link>
      </div>
      <div className="navbar-end">
        <Link to="/auth" className="btn btn-primary btn-md">
          Get Started
        </Link>
      </div>
    </div>
  );
}
