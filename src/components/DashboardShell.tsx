import { useEffect, useState, type ReactNode } from "react";
import {
  BadgeDollarSign,
  ExternalLink,
  Gauge,
  Link2,
  LogOut,
  MonitorUp,
  Settings2,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { Brand } from "./Brand";
import { useAuth } from "../context/AuthContext";
import { getMyAdminRole, getMyEntitlement } from "../lib/data";
import { PLANS } from "../lib/plans";
import type { AdminRole, PlanId } from "../types";

type Props = {
  handle?: string;
  children: ReactNode;
};

export function DashboardShell({ handle, children }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanId>("free");
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    Promise.all([getMyEntitlement(), getMyAdminRole()])
      .then(([entitlement, role]) => {
        setPlan(entitlement.plan);
        setAdminRole(role);
      })
      .catch(() => {
        setPlan("free");
        setAdminRole(null);
      });
  }, []);

  async function logout() {
    await signOut();
    navigate("/");
  }

  return (
    <main className="dashboard-page">
      <div className="app-topbar">
        <Brand />

        {handle && (
          <a
            href={`/u/${handle}`}
            target="_blank"
            rel="noreferrer"
            className="topbar-public-link"
          >
            nuphub.com/u/{handle} <ExternalLink size={13} />
          </a>
        )}
      </div>

      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-profile">
            <div className="avatar">
              {(handle?.slice(0, 2) || "NU").toUpperCase()}
            </div>
            <div>
              <strong>{handle ?? "streamer"}</strong>
              <span>{PLANS[plan].name}</span>
            </div>
          </div>

          <NavLink className="side-item" end to="/dashboard">
            <Gauge size={17} />
            Overview
          </NavLink>

          <NavLink className="side-item" to="/dashboard/links">
            <Link2 size={17} />
            Links
          </NavLink>

          <NavLink className="side-item" to="/dashboard/overlay">
            <MonitorUp size={17} />
            OBS Overlay
          </NavLink>

          <NavLink className="side-item" to="/dashboard/billing">
            <BadgeDollarSign size={17} />
            Plan
          </NavLink>

          <NavLink className="side-item" to="/dashboard/account">
            <UserCircle2 size={17} />
            Account
          </NavLink>

          {adminRole && (
            <NavLink className="side-item" to="/dashboard/admin/users">
              <ShieldCheck size={17} />
              Admin
            </NavLink>
          )}

          <div className="sidebar-spacer" />

          <Link className="side-item" to="/">
            <Settings2 size={17} />
            NupHub home
          </Link>

          <button className="side-item" onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
        </aside>

        <section className="dash-main">{children}</section>
      </div>
    </main>
  );
}
