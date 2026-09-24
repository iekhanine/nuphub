import { useMemo, useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Link2,
  MonitorUp,
  Plus,
  Radio,
  Settings2,
  Trash2,
} from "lucide-react";

import { RotatingOverlay } from "./RotatingOverlay";

type StreamLink = {
  id: number;
  label: string;
  slug: string;
  destination: string;
  enabled: boolean;
};

const seedLinks: StreamLink[] = [
  {
    id: 1,
    label: "Discord",
    slug: "yourname-discord",
    destination: "https://discord.gg/example",
    enabled: true,
  },
  {
    id: 2,
    label: "Merch",
    slug: "yourname-shop",
    destination: "https://example.com/store",
    enabled: true,
  },
  {
    id: 3,
    label: "YouTube",
    slug: "yourname-video",
    destination: "https://youtube.com/@example",
    enabled: true,
  },
];

export function DashboardDemo() {
  const [links, setLinks] = useState(seedLinks);
  const [copied, setCopied] = useState(false);
  const active = useMemo(
    () => links.filter((link) => link.enabled).length,
    [links],
  );

  function toggle(id: number) {
    setLinks((items) =>
      items.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  }

  function remove(id: number) {
    setLinks((items) => items.filter((item) => item.id !== id));
  }

  async function copySource() {
    try {
      await navigator.clipboard.writeText("https://nuphub.com/obs/yourname");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-profile">
          <div className="avatar">YN</div>
          <div>
            <strong>yourname</strong>
            <span>Streamer workspace</span>
          </div>
        </div>

        <button className="side-item active">
          <Link2 size={17} />
          Links
        </button>
        <button className="side-item">
          <MonitorUp size={17} />
          OBS Overlay
        </button>
        <button className="side-item">
          <Radio size={17} />
          Live Preview
        </button>
        <button className="side-item">
          <Settings2 size={17} />
          Appearance
        </button>
      </aside>

      <section className="dash-main">
        <div className="dash-heading">
          <div>
            <span className="kicker">STREAM LINKS</span>
            <h1>Put it on stream.</h1>
          </div>
          <button className="button primary">
            <Plus size={17} />
            Add link
          </button>
        </div>

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
            <span>Browser source</span>
            <strong className="status-live">READY</strong>
          </div>
        </div>

        <div className="dash-grid">
          <div className="panel links-panel">
            <div className="panel-head">
              <div>
                <span className="panel-label">YOUR LINKS</span>
                <strong>Shown in this order</strong>
              </div>
            </div>

            <div className="stream-link-list">
              {links.map((link) => (
                <div className="stream-link" key={link.id}>
                  <GripVertical className="drag" size={18} />
                  <div className="link-copy">
                    <strong>{link.label}</strong>
                    <span>nuphub.com/{link.slug}</span>
                    <small>{link.destination}</small>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => toggle(link.id)}
                    title={link.enabled ? "Hide from overlay" : "Show on overlay"}
                  >
                    {link.enabled ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => remove(link.id)}
                    title="Delete link"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="right-stack">
            <div className="panel obs-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-label">OBS BROWSER SOURCE</span>
                  <strong>One URL. Always current.</strong>
                </div>
              </div>
              <div className="source-row">
                <code>https://nuphub.com/obs/yourname</code>
                <button className="icon-button" onClick={copySource}>
                  <Copy size={17} />
                </button>
              </div>
              <span className="micro-copy">
                {copied
                  ? "Copied."
                  : "Add once in OBS. Change links here anytime."}
              </span>
            </div>

            <div className="panel preview-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-label">LIVE PREVIEW</span>
                  <strong>What viewers see</strong>
                </div>
              </div>
              <div className="fake-stream">
                <span className="live-badge">LIVE</span>
                <RotatingOverlay compact />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
