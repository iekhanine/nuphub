import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Copy,
  ExternalLink,
  Link2,
  MonitorUp,
  MousePointerClick,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardShell } from "../components/DashboardShell";
import {
  getMyEntitlement,
  getMyLinks,
  getMyProfile,
} from "../lib/data";
import { PLANS } from "../lib/plans";
import type { Entitlement, Profile, StreamLink } from "../types";

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<StreamLink[]>([]);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([getMyProfile(), getMyLinks(), getMyEntitlement()])
      .then(([nextProfile, nextLinks, nextEntitlement]) => {
        setProfile(nextProfile);
        setLinks(nextLinks);
        setEntitlement(nextEntitlement);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = useMemo(
    () => links.filter((item) => item.enabled).length,
    [links],
  );

  const clicks = useMemo(
    () => links.reduce((sum, item) => sum + item.clicks, 0),
    [links],
  );

  if (loading) {
    return (
      <DashboardShell>
        <div className="center-state inset">
          <div className="loader" />
          <span>Loading NupHub…</span>
        </div>
      </DashboardShell>
    );
  }

  const plan = entitlement?.plan ?? "free";
  const planDefinition = PLANS[plan];
  const limit = planDefinition.linkLimit;
  const recent = links.slice(0, 3);
  const obsUrl = profile
    ? `${window.location.origin}/obs/${profile.handle}`
    : "";

  async function copyObs() {
    await navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading compact-heading">
        <div>
          <span className="kicker">OVERVIEW</span>
          <h1>Good to go.</h1>
          <p className="dash-subtitle">
            Your links, overlay and account in one place.
          </p>
        </div>

        <Link className="button primary" to="/dashboard/links">
          <Plus size={16} />
          Add link
        </Link>
      </div>

      <div className="overview-kpis">
        <article className="overview-kpi">
          <Link2 size={18} />
          <div>
            <span>Links</span>
            <strong>
              {links.length}
              {limit !== null && <em> / {limit}</em>}
            </strong>
          </div>
        </article>

        <article className="overview-kpi">
          <MonitorUp size={18} />
          <div>
            <span>On stream</span>
            <strong>{active}</strong>
          </div>
        </article>

        <article className="overview-kpi">
          <MousePointerClick size={18} />
          <div>
            <span>Total opens</span>
            <strong>{clicks}</strong>
          </div>
        </article>

        <article className="overview-kpi plan-kpi">
          <Sparkles size={18} />
          <div>
            <span>Plan</span>
            <strong>{planDefinition.name}</strong>
          </div>
        </article>
      </div>

      <div className="overview-grid">
        <section className="panel overview-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">QUICK START</span>
              <strong>Your OBS source</strong>
            </div>
          </div>

          <div className="overview-source">
            <code>{obsUrl || "Create your profile first"}</code>
            <button
              className="icon-button"
              disabled={!obsUrl}
              onClick={() => void copyObs()}
              title="Copy OBS source"
            >
              <Copy size={16} />
            </button>
            {profile && (
              <a
                className="icon-button"
                href={`/obs/${profile.handle}`}
                target="_blank"
                rel="noreferrer"
                title="Open OBS source"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          <div className="overview-actions">
            <Link to="/dashboard/links">
              <Link2 size={17} />
              <span>
                <strong>Manage links</strong>
                <small>Add, reorder and turn links on or off.</small>
              </span>
              <ArrowRight size={15} />
            </Link>

            <Link to="/dashboard/overlay">
              <MonitorUp size={17} />
              <span>
                <strong>Customize overlay</strong>
                <small>Colors, opacity, alignment and style.</small>
              </span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="panel overview-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">RECENT LINKS</span>
              <strong>{links.length ? "Ready for stream" : "Nothing here yet"}</strong>
            </div>

            <Link className="panel-text-link" to="/dashboard/links">
              View all
            </Link>
          </div>

          {recent.length ? (
            <div className="recent-link-list">
              {recent.map((item) => (
                <div key={item.id}>
                  <span className={item.enabled ? "status-dot on" : "status-dot"} />
                  <div>
                    <strong>{item.label}</strong>
                    <small>nuphub.com/{item.slug}</small>
                  </div>
                  <b>{item.clicks}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-panel clean-empty">
              <strong>Add your first link.</strong>
              <span>NupHub generates the short URL automatically.</span>
            </div>
          )}

          {plan === "free" && (
            <Link className="upgrade-strip" to="/dashboard/billing">
              <span>
                <strong>Unlock unlimited links + full overlay controls</strong>
                <small>Pro  is a one-time $29 purchase.</small>
              </span>
              <ArrowRight size={17} />
            </Link>
          )}
        </section>
      </div>

      {copied && <div className="toast">OBS URL copied.</div>}
    </DashboardShell>
  );
}
