import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardShell } from "../components/DashboardShell";
import { LinkEditorModal } from "../components/LinkEditorModal";
import {
  createLink,
  deleteLink,
  getMyEntitlement,
  getMyLinks,
  getMyProfile,
  updateLink,
} from "../lib/data";
import { PLANS } from "../lib/plans";
import type { Entitlement, Profile, StreamLink } from "../types";


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

  return "Could not load links.";
}

export default function LinksPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [links, setLinks] = useState<StreamLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<StreamLink | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const active = useMemo(
    () => links.filter((item) => item.enabled).length,
    [links],
  );

  const clickTotal = useMemo(
    () => links.reduce((sum, item) => sum + item.clicks, 0),
    [links],
  );

  useEffect(() => {
    Promise.all([getMyProfile(), getMyLinks(), getMyEntitlement()])
      .then(([nextProfile, nextLinks, nextEntitlement]) => {
        setProfile(nextProfile);
        setLinks(nextLinks);
        setEntitlement(nextEntitlement);
      })
      .catch((err) => {
        console.error("NupHub links page failed to load:", err);
        setError(errorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveLink(values: {
    label: string;
    destination_url: string;
    sort_order: number;
  }) {
    if (editing) {
      const updated = await updateLink(editing.id, values);
      setLinks((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      return;
    }

    const created = await createLink(values);
    setLinks((items) => [...items, created]);
  }

  async function toggle(item: StreamLink) {
    const updated = await updateLink(item.id, {
      enabled: !item.enabled,
    });

    setLinks((items) =>
      items.map((current) =>
        current.id === updated.id ? updated : current,
      ),
    );
  }

  async function remove(item: StreamLink) {
    if (!window.confirm(`Delete "${item.label}"?`)) return;
    await deleteLink(item.id);
    setLinks((items) => items.filter((current) => current.id !== item.id));
  }

  async function move(index: number, direction: -1 | 1) {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= links.length) return;

    const current = links[index];
    const other = links[otherIndex];

    await Promise.all([
      updateLink(current.id, { sort_order: other.sort_order }),
      updateLink(other.id, { sort_order: current.sort_order }),
    ]);

    const next = [...links];
    next[index] = { ...other, sort_order: current.sort_order };
    next[otherIndex] = { ...current, sort_order: other.sort_order };
    setLinks(next);
  }

  async function copy(value: string, key: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1200);
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="center-state inset">
          <div className="loader" />
          <span>Loading your links…</span>
        </div>
      </DashboardShell>
    );
  }

  const plan = entitlement?.plan ?? "free";
  const limit = PLANS[plan].linkLimit;
  const atLimit = limit !== null && links.length >= limit;

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading compact-heading">
        <div>
          <span className="kicker">LINKS</span>
          <h1>Your stream links.</h1>
          <p className="dash-subtitle">
            Reorder them here. OBS follows this same order.
          </p>
        </div>

        {atLimit ? (
          <Link className="button primary" to="/dashboard/billing">
            Upgrade for more
          </Link>
        ) : (
          <button
            className="button primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus size={17} />
            Add link
          </button>
        )}
      </div>

      {error && <div className="form-error page-error">{error}</div>}

      <div className="stats-row compact-stats">
        <div className="stat">
          <span>Links</span>
          <strong>
            {links.length}
            {limit !== null && <small> / {limit}</small>}
          </strong>
        </div>
        <div className="stat">
          <span>On stream</span>
          <strong>{active}</strong>
        </div>
        <div className="stat">
          <span>Total opens</span>
          <strong>{clickTotal}</strong>
        </div>
      </div>

      {atLimit && (
        <div className="limit-banner">
          <div>
            <strong>You’ve used all {limit} Free links.</strong>
            <span>Pro and Creator include unlimited links.</span>
          </div>
          <Link to="/dashboard/billing">See plans</Link>
        </div>
      )}

      <div className="panel links-panel classy-links-panel">
        <div className="panel-head">
          <div>
            <span className="panel-label">ROTATION ORDER</span>
            <strong>What viewers see on stream</strong>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="empty-panel clean-empty">
            <strong>No links yet.</strong>
            <span>Add one destination. NupHub handles the short URL.</span>
          </div>
        ) : (
          <div className="stream-link-list">
            {links.map((item, index) => (
              <div className="stream-link polished-link-row" key={item.id}>
                <div className="move-buttons">
                  <button
                    className="tiny-icon"
                    disabled={index === 0}
                    onClick={() => void move(index, -1)}
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    className="tiny-icon"
                    disabled={index === links.length - 1}
                    onClick={() => void move(index, 1)}
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="link-copy">
                  <div className="link-title-line">
                    <span className={item.enabled ? "status-dot on" : "status-dot"} />
                    <strong>{item.label}</strong>
                  </div>

                  <button
                    className="link-copy-button"
                    onClick={() =>
                      void copy(
                        `${window.location.origin}/${item.slug}`,
                        item.id,
                      )
                    }
                  >
                    nuphub.com/{item.slug}
                    <Copy size={12} />
                  </button>

                  <small>{item.destination_url}</small>
                </div>

                <span className="click-count">{item.clicks} opens</span>

                <button
                  className="icon-button"
                  onClick={() => void toggle(item)}
                  title={item.enabled ? "Hide from OBS" : "Show in OBS"}
                >
                  {item.enabled ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>

                <button
                  className="icon-button"
                  onClick={() => {
                    setEditing(item);
                    setModalOpen(true);
                  }}
                  title="Edit"
                >
                  <Edit3 size={17} />
                </button>

                <button
                  className="icon-button danger"
                  onClick={() => void remove(item)}
                  title="Delete"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {copied && <div className="toast">Copied.</div>}

      <LinkEditorModal
        open={modalOpen}
        link={editing}
        defaultSortOrder={
          links.length === 0
            ? 100
            : Math.max(...links.map((item) => item.sort_order)) + 100
        }
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={saveLink}
      />
    </DashboardShell>
  );
}
