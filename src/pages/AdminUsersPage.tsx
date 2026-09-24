import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Crown,
  Search,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";

import { DashboardShell } from "../components/DashboardShell";
import {
  adminListUsers,
  adminSetNupHubRole,
  adminSetOtlRole,
  adminSetUserPlan,
  getMyAdminRole,
  getMyProfile,
} from "../lib/data";
import { PLANS } from "../lib/plans";
import type {
  AdminUser,
  NupHubRole,
  OtlRole,
  PlanId,
  Profile,
} from "../types";
import "../styles/admin-users.css";

type ViewFilter =
  | "nuphub"
  | "employees"
  | "moderators"
  | "admins"
  | "all";

const viewLabels: Record<ViewFilter, string> = {
  nuphub: "NupHub users",
  employees: "OTL employees",
  moderators: "Moderators",
  admins: "Admins",
  all: "All OTL accounts",
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Could not load accounts.";
}

function roleLabel(role: NupHubRole) {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "moderator":
      return "Moderator";
    case "user":
      return "User";
    default:
      return "Not enrolled";
  }
}

function otlRoleLabel(role: OtlRole) {
  switch (role) {
    case "owner":
      return "OTL Owner";
    case "admin":
      return "OTL Admin";
    case "employee":
      return "OTL Employee";
    default:
      return "Not OTL staff";
  }
}

export default function AdminUsersPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminRole, setAdminRole] = useState<"admin" | "owner" | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewFilter>("nuphub");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const isOwner = adminRole === "owner";

  async function refreshUsers() {
    const rows = await adminListUsers();
    setUsers(rows);
  }

  useEffect(() => {
    Promise.all([getMyProfile(), getMyAdminRole()])
      .then(async ([nextProfile, nextAdminRole]) => {
        setProfile(nextProfile);
        setAdminRole(nextAdminRole);

        if (nextAdminRole) {
          await refreshUsers();
        }
      })
      .catch((err) => {
        console.error("NupHub admin page failed:", err);
        setError(errorMessage(err));
        setAdminRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesView =
        view === "all" ||
        (view === "nuphub" && user.enrolled) ||
        (view === "employees" && user.otl_role !== "none") ||
        (view === "moderators" && user.nuphub_role === "moderator") ||
        (view === "admins" &&
          ["admin", "owner"].includes(user.nuphub_role));

      if (!matchesView) return false;
      if (!needle) return true;

      return [
        user.email,
        user.handle,
        user.display_name,
        user.nuphub_role,
        user.otl_role,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [query, users, view]);

  async function runChange(
    userId: string,
    operation: () => Promise<unknown>,
    success: string,
  ) {
    setSavingId(userId);
    setMessage("");
    setError("");

    try {
      await operation();
      await refreshUsers();
      setMessage(success);
      window.setTimeout(() => setMessage(""), 2400);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingId("");
    }
  }

  if (loading) {
    return (
      <DashboardShell handle={profile?.handle}>
        <div className="center-state inset">
          <div className="loader" />
          <span>Loading admin…</span>
        </div>
      </DashboardShell>
    );
  }

  if (!adminRole) {
    return (
      <DashboardShell handle={profile?.handle}>
        <div className="panel admin-users-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">ADMIN</span>
              <strong>Admin access is not enabled for this account.</strong>
            </div>
          </div>
          <div className="admin-message">
            {error || "Your account is not a NupHub admin or owner."}
          </div>
        </div>
      </DashboardShell>
    );
  }

  const enrolledCount = users.filter((user) => user.enrolled).length;
  const employeeCount = users.filter((user) => user.otl_role !== "none").length;
  const staffCount = users.filter((user) =>
    ["moderator", "admin", "owner"].includes(user.nuphub_role),
  ).length;

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading">
        <div>
          <span className="kicker">ADMIN</span>
          <h1>Users & access.</h1>
        </div>
      </div>

      <div className="admin-summary-row">
        <div className="stat">
          <span>NupHub users</span>
          <strong>{enrolledCount}</strong>
        </div>

        <div className="stat">
          <span>OTL staff</span>
          <strong>{employeeCount}</strong>
        </div>

        <div className="stat">
          <span>NupHub staff</span>
          <strong>{staffCount}</strong>
        </div>
      </div>

      <div className="panel admin-users-panel">
        <div className="admin-users-toolbar admin-users-toolbar-stacked">
          <div className="admin-toolbar-top">
            <div>
              <span className="panel-label">IDENTITY & ACCESS</span>
              <strong>{viewLabels[view]}</strong>
            </div>

            <label className="admin-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search email or handle"
              />
            </label>
          </div>

          <div className="admin-view-tabs">
            <button
              type="button"
              className={view === "nuphub" ? "active" : ""}
              onClick={() => setView("nuphub")}
            >
              <Users size={13} />
              NupHub
            </button>

            <button
              type="button"
              className={view === "employees" ? "active" : ""}
              onClick={() => setView("employees")}
            >
              <BriefcaseBusiness size={13} />
              OTL Staff
            </button>

            <button
              type="button"
              className={view === "moderators" ? "active" : ""}
              onClick={() => setView("moderators")}
            >
              <ShieldCheck size={13} />
              Mods
            </button>

            <button
              type="button"
              className={view === "admins" ? "active" : ""}
              onClick={() => setView("admins")}
            >
              <Crown size={13} />
              Admins
            </button>

            <button
              type="button"
              className={view === "all" ? "active" : ""}
              onClick={() => setView("all")}
            >
              All OTL Accounts
            </button>
          </div>
        </div>

        {message && <div className="form-success admin-message">{message}</div>}
        {error && <div className="form-error admin-message">{error}</div>}

        <div className="admin-user-list">
          {filteredUsers.map((user) => (
            <article className="admin-user-row admin-user-row-expanded" key={user.id}>
              <div className="admin-user-avatar">
                {(user.handle || user.email || "NU").slice(0, 2).toUpperCase()}
              </div>

              <div className="admin-user-identity">
                <div className="admin-user-title">
                  <strong>{user.handle || "No NupHub profile"}</strong>

                  {user.enrolled ? (
                    <span className="admin-enrollment-badge enrolled">
                      NupHub
                    </span>
                  ) : (
                    <span className="admin-enrollment-badge">
                      Shared OTL account
                    </span>
                  )}

                  {user.otl_role !== "none" && (
                    <span className="admin-employee-badge">
                      <BriefcaseBusiness size={10} />
                      {otlRoleLabel(user.otl_role)}
                    </span>
                  )}

                  {user.nuphub_role === "owner" && (
                    <span className="admin-role-badge owner">
                      <Crown size={11} /> Owner
                    </span>
                  )}

                  {user.nuphub_role === "admin" && (
                    <span className="admin-role-badge">
                      <ShieldCheck size={11} /> Admin
                    </span>
                  )}

                  {user.nuphub_role === "moderator" && (
                    <span className="admin-role-badge moderator">
                      <ShieldCheck size={11} /> Moderator
                    </span>
                  )}
                </div>

                <span>{user.email || "No email"}</span>

                {user.display_name && <small>{user.display_name}</small>}
              </div>

              <div className="admin-access-controls">
                <label>
                  <span>NupHub role</span>
                  <select
                    value={
                      user.nuphub_role === "not_enrolled"
                        ? "user"
                        : user.nuphub_role
                    }
                    disabled={!isOwner || savingId === user.id}
                    onChange={(event) => {
                      const role = event.target.value as
                        | "user"
                        | "moderator"
                        | "admin"
                        | "owner";

                      void runChange(
                        user.id,
                        () => adminSetNupHubRole(user.id, role),
                        `${user.email || "Account"} is now ${roleLabel(role)}.`,
                      );
                    }}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </label>

                <label>
                  <span>OTL role</span>
                  <select
                    value={user.otl_role}
                    disabled={!isOwner || savingId === user.id}
                    onChange={(event) => {
                      const role = event.target.value as OtlRole;

                      void runChange(
                        user.id,
                        () => adminSetOtlRole(user.id, role),
                        `${user.email || "Account"}: ${otlRoleLabel(role)}.`,
                      );
                    }}
                  >
                    <option value="none">None</option>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
                </label>
              </div>

              <div className="admin-plan-meta">
                <span>Plan</span>
                <strong>{PLANS[user.plan].name}</strong>
                <small>{user.entitlement_source || "default"}</small>
              </div>

              <div
                className="admin-plan-buttons"
                aria-label={`Plan for ${user.email}`}
              >
                {(["free", "pro", "creator"] as PlanId[]).map((plan) => (
                  <button
                    type="button"
                    className={`admin-plan-button${
                      user.plan === plan ? " active" : ""
                    }`}
                    disabled={savingId === user.id || user.plan === plan}
                    onClick={() =>
                      void runChange(
                        user.id,
                        () => adminSetUserPlan(user.id, plan),
                        `${user.email || "Account"} is now ${PLANS[plan].name}.`,
                      )
                    }
                    key={plan}
                  >
                    {plan === "creator" && <UserRoundCog size={13} />}
                    {PLANS[plan].name}
                  </button>
                ))}
              </div>
            </article>
          ))}

          {filteredUsers.length === 0 && (
            <div className="empty-panel admin-empty">
              <strong>No matching accounts.</strong>
              <span>
                {view === "nuphub"
                  ? "This view only shows accounts with a nuphub_profiles row."
                  : "Try another filter or search."}
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
