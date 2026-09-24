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

import { DashboardShell } from "../components/DashboardShell";
import { LinkEditorModal } from "../components/LinkEditorModal";
import {
  createLink,
  deleteLink,
  getMyLinks,
  getMyProfile,
  updateLink,
} from "../lib/data";
import type { Profile, StreamLink } from "../types";

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
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
    Promise.all([getMyProfile(), getMyLinks()])
      .then(([nextProfile, nextLinks]) => {
        setProfile(nextProfile);
        setLinks(nextLinks);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Could not load dashboard.",
        ),
      )
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

    setLinks((items) =>
      items.filter((current) => current.id !== item.id),
    );
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

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading">
        <div>
          <span className="kicker">STREAM LINKS</span>
          <h1>Put it on stream.</h1>
        </div>

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
      </div>

      {error && <div className="form-error page-error">{error}</div>}

      <div className="stats-row">
        <div className="stat">
          <span>Links</span>
          <strong>{links.length}</strong>
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

      <div className="panel links-panel">
        <div className="panel-head">
          <div>
            <span className="panel-label">YOUR LINKS</span>
            <strong>Top to bottom rotation order</strong>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="empty-panel">
            <strong>No links yet.</strong>
            <span>Add your first link. NupHub will create the short URL.</span>
          </div>
        ) : (
          <div className="stream-link-list">
            {links.map((item, index) => (
              <div className="stream-link" key={item.id}>
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
                  <strong>{item.label}</strong>

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
