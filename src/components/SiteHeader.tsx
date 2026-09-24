import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import { Brand } from "./Brand";
import { useAuth } from "../context/AuthContext";

export function SiteHeader() {
  const { user } = useAuth();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className="header-nav" aria-label="Primary">
          {user ? (
            <Link className="nav-primary" to="/dashboard">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login">
                <LogIn size={16} />
                Sign in
              </Link>
              <Link className="nav-primary" to="/signup">
                <UserPlus size={16} />
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
