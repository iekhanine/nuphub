import {
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  BadgeDollarSign,
  CircleHelp,
  ExternalLink,
  Gauge,
  GripVertical,
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

type NavItemId =
  | "overview"
  | "links"
  | "overlay"
  | "obs-how-to"
  | "plan"
  | "account"
  | "admin";

type NavItem = {
  id: NavItemId;
  label: string;
  to: string;
  end?: boolean;
  adminOnly?: boolean;
  icon: ReactNode;
};

const SIDEBAR_ORDER_KEY = "nuphub.dashboard.sidebar.order.v1";

const defaultOrder: NavItemId[] = [
  "overview",
  "links",
  "overlay",
  "obs-how-to",
  "plan",
  "account",
  "admin",
];

function readSavedOrder(): NavItemId[] {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_ORDER_KEY);
    if (!raw) return defaultOrder;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultOrder;

    const valid = parsed.filter((value): value is NavItemId =>
      defaultOrder.includes(value as NavItemId),
    );

    return [
      ...valid,
      ...defaultOrder.filter((id) => !valid.includes(id)),
    ];
  } catch {
    return defaultOrder;
  }
}

export function DashboardShell({ handle, children }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanId>("free");
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [navOrder, setNavOrder] = useState<NavItemId[]>(readSavedOrder);
  const [draggingId, setDraggingId] = useState<NavItemId | null>(null);
  const [dragOverId, setDragOverId] = useState<NavItemId | null>(null);

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

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        id: "overview",
        label: "Overview",
        to: "/dashboard",
        end: true,
        icon: <Gauge size={17} />,
      },
      {
        id: "links",
        label: "Links",
        to: "/dashboard/links",
        icon: <Link2 size={17} />,
      },
      {
        id: "overlay",
        label: "OBS Overlay",
        to: "/dashboard/overlay",
        icon: <MonitorUp size={17} />,
      },
      {
        id: "obs-how-to",
        label: "OBS How-To",
        to: "/dashboard/obs-how-to",
        icon: <CircleHelp size={17} />,
      },
      {
        id: "plan",
        label: "Plan",
        to: "/dashboard/billing",
        icon: <BadgeDollarSign size={17} />,
      },
      {
        id: "account",
        label: "Account",
        to: "/dashboard/account",
        icon: <UserCircle2 size={17} />,
      },
      {
        id: "admin",
        label: "Admin",
        to: "/dashboard/admin/users",
        adminOnly: true,
        icon: <ShieldCheck size={17} />,
      },
    ],
    [],
  );

  const orderedNavItems = useMemo(
    () =>
      navOrder
        .map((id) => navItems.find((item) => item.id === id))
        .filter((item): item is NavItem => Boolean(item))
        .filter((item) => !item.adminOnly || Boolean(adminRole)),
    [navItems, navOrder, adminRole],
  );

  async function logout() {
    await signOut();
    navigate("/");
  }

  function persistOrder(next: NavItemId[]) {
    setNavOrder(next);

    try {
      window.localStorage.setItem(
        SIDEBAR_ORDER_KEY,
        JSON.stringify(next),
      );
    } catch {
      // Browser storage is optional. The menu still reorders this session.
    }
  }

  function handleDragStart(
    event: DragEvent<HTMLDivElement>,
    id: NavItemId,
  ) {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
    id: NavItemId,
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
    targetId: NavItemId,
  ) {
    event.preventDefault();

    const sourceId =
      draggingId ||
      (event.dataTransfer.getData("text/plain") as NavItemId);

    setDraggingId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetId) return;

    const next = [...navOrder];
    const from = next.indexOf(sourceId);
    const to = next.indexOf(targetId);

    if (from === -1 || to === -1) return;

    next.splice(from, 1);
    next.splice(to, 0, sourceId);
    persistOrder(next);
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

          <div className="sidebar-nav-list">
            {orderedNavItems.map((item) => (
              <div
                className={`sidebar-draggable-item${
                  draggingId === item.id ? " dragging" : ""
                }${
                  dragOverId === item.id ? " drag-over" : ""
                }`}
                draggable
                onDragStart={(event) =>
                  handleDragStart(event, item.id)
                }
                onDragOver={(event) =>
                  handleDragOver(event, item.id)
                }
                onDrop={(event) =>
                  handleDrop(event, item.id)
                }
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                key={item.id}
              >
                <span
                  className="sidebar-drag-handle"
                  title="Drag to reorder"
                  aria-hidden="true"
                >
                  <GripVertical size={13} />
                </span>

                <NavLink
                  className="side-item sidebar-reorder-link"
                  end={item.end}
                  to={item.to}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </div>
            ))}
          </div>

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
