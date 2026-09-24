import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Brand } from "./Brand";
import { useAuth } from "../context/AuthContext";

const publicLinks = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/features", label: "Features" },
  { to: "/obs", label: "OBS" },
  { to: "/twitch", label: "Twitch" },
];

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />

        <nav className="header-nav header-public-nav" aria-label="Primary">
          <div className="header-page-links">
            {publicLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "header-page-link active" : "header-page-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="header-account-links">
            {user ? (
              <NavLink className="nav-primary" to="/dashboard">
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink to="/login">
                  <LogIn size={16} />
                  Sign in
                </NavLink>
                <NavLink className="nav-primary" to="/signup">
                  <UserPlus size={16} />
                  Create account
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
