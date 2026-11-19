import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { firstName } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./Avatar";
import { ThemeToggle } from "./ThemeToggle";

function Logo() {
  return (
    <Link to="/" className="group flex items-baseline gap-px" aria-label="Written home">
      <span className="font-serif text-[1.7rem] font-semibold tracking-tight text-ink transition-colors group-hover:text-brand">
        Written
      </span>
      <span aria-hidden="true" className="font-serif text-[1.7rem] font-semibold text-gold">
        .
      </span>
    </Link>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-soft/70 text-brand-ink" : "text-ink-soft hover:bg-paper-deep hover:text-ink"
  }`;

export function Layout() {
  const { user, status, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
          <div className="flex items-center gap-7">
            <Logo />
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
              <NavLink to="/" end className={navClass}>
                Read
              </NavLink>
              {user ? (
                <NavLink to="/dashboard" className={navClass}>
                  Dashboard
                </NavLink>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {status === "loading" ? (
                <span className="h-9 w-24 animate-pulse rounded-full bg-paper-deep" />
              ) : user ? (
                <>
                  <Link to="/write" className="btn btn-primary h-10 px-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                    Write
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-paper-deep"
                  >
                    <Avatar user={user} size="sm" />
                    <span className="max-w-24 truncate text-sm font-medium text-ink-soft">
                      {firstName(user.name)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    title="Sign out"
                    aria-label="Sign out"
                    className="btn btn-ghost h-9 w-9 p-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
                      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Start writing
                  </Link>
                </>
              )}
            </div>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="btn btn-ghost h-10 w-10 p-0 sm:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-line bg-paper px-5 pb-5 pt-3 sm:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <NavLink to="/" end className={navClass}>
                Read
              </NavLink>
              {user ? (
                <>
                  <NavLink to="/dashboard" className={navClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/write" className={navClass}>
                    Write a post
                  </NavLink>
                  <NavLink to="/settings" className={navClass}>
                    Settings
                  </NavLink>
                  <button type="button" onClick={logout} className="mt-2 rounded-full px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger-soft">
                    Sign out
                  </button>
                </>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Link to="/login" className="btn btn-secondary flex-1">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary flex-1">
                    Start writing
                  </Link>
                </div>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-line bg-surface/40">
        <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-xl font-semibold">
              Written<span className="text-gold">.</span>
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
              A quiet place for essays, field notes, and ideas worth keeping.
            </p>
          </div>
          <p className="text-xs leading-5 text-muted sm:text-right">
            Built as a microservices demo.
            <br />
            Users · Posts · Comments
          </p>
        </div>
      </footer>
    </div>
  );
}
