import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Save } from "lucide-react";

import { DashboardShell } from "../components/DashboardShell";
import { OverlayRenderer } from "../components/OverlayRenderer";
import {
  getMyLinks,
  getMyProfile,
  getOverlaySettings,
  saveOverlaySettings,
} from "../lib/data";
import type {
  OverlayAccentBarSide,
  OverlayPosition,
  OverlaySettings,
  OverlayStyle,
  OverlayTextAlign,
  Profile,
  PublicStreamer,
  StreamLink,
} from "../types";

const positions: OverlayPosition[] = [
  "bottom-left",
  "bottom-center",
  "bottom-right",
  "top-left",
  "top-center",
  "top-right",
];

const styles: OverlayStyle[] = ["glass", "solid", "minimal"];
const accentBarSides: OverlayAccentBarSide[] = ["left", "right", "none"];
const textAlignments: OverlayTextAlign[] = ["left", "right"];

export default function OverlaySettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<StreamLink[]>([]);
  const [settings, setSettings] = useState<OverlaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getMyProfile(), getMyLinks(), getOverlaySettings()])
      .then(([nextProfile, nextLinks, nextSettings]) => {
        setProfile(nextProfile);
        setLinks(nextLinks);
        setSettings(nextSettings);
      })
      .finally(() => setLoading(false));
  }, []);

  const streamer = useMemo<PublicStreamer | null>(() => {
    if (!profile || !settings) return null;

    return {
      handle: profile.handle,
      display_name: profile.display_name,
      settings: {
        rotation_seconds: settings.rotation_seconds,
        position: settings.position,
        accent_color: settings.accent_color,
        background_color: settings.background_color ?? "#0a080e",
        text_color: settings.text_color ?? "#ffffff",
        style: settings.style,
        background_opacity: settings.background_opacity ?? 0.94,
        accent_bar_side: settings.accent_bar_side ?? "left",
        text_align: settings.text_align ?? "left",
        show_label: settings.show_label,
        show_url: settings.show_url,
      },
      links: links
        .filter((item) => item.enabled)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({ label: item.label, slug: item.slug })),
    };
  }, [profile, settings, links]);

  async function save() {
    if (!settings) return;

    setSaving(true);
    setMessage("");

    try {
      const updated = await saveOverlaySettings({
        rotation_seconds: settings.rotation_seconds,
        position: settings.position,
        accent_color: settings.accent_color,
        background_color: settings.background_color,
        text_color: settings.text_color,
        style: settings.style,
        background_opacity: settings.background_opacity,
        accent_bar_side: settings.accent_bar_side,
        text_align: settings.text_align,
        show_label: settings.show_label,
        show_url: settings.show_url,
      });

      setSettings(updated);
      setMessage("Saved.");
      window.setTimeout(() => setMessage(""), 1600);
    } finally {
      setSaving(false);
    }
  }

  const obsUrl = profile
    ? `${window.location.origin}/obs/${profile.handle}`
    : "";

  if (loading || !settings || !streamer) {
    return (
      <DashboardShell handle={profile?.handle}>
        <div className="center-state inset">
          <div className="loader" />
          <span>Loading overlay…</span>
        </div>
      </DashboardShell>
    );
  }

  const opacityPercent = Math.round(
    (settings.background_opacity ?? 0.94) * 100,
  );

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading">
        <div>
          <span className="kicker">OBS OVERLAY</span>
          <h1>Make it yours.</h1>
        </div>

        <button className="button primary" onClick={() => void save()}>
          <Save size={17} />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="overlay-dashboard-grid">
        <div className="panel settings-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">BROWSER SOURCE</span>
              <strong>Add this URL to OBS once</strong>
            </div>
          </div>

          <div className="source-row">
            <code>{obsUrl}</code>

            <button
              className="icon-button"
              onClick={() => void navigator.clipboard.writeText(obsUrl)}
            >
              <Copy size={17} />
            </button>

            <a
              className="icon-button"
              href={`/obs/${profile?.handle}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={17} />
            </a>
          </div>

          <div className="settings-form">
            <label>
              Rotate every
              <div className="range-row">
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={settings.rotation_seconds}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      rotation_seconds: Number(event.target.value),
                    })
                  }
                />
                <strong>{settings.rotation_seconds}s</strong>
              </div>
            </label>

            <label>
              Background opacity
              <div className="range-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={opacityPercent}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      background_opacity: Number(event.target.value) / 100,
                    })
                  }
                />
                <strong>{opacityPercent}%</strong>
              </div>
            </label>

            <label>
              Position
              <select
                value={settings.position}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    position: event.target.value as OverlayPosition,
                  })
                }
              >
                {positions.map((position) => (
                  <option value={position} key={position}>
                    {position.replace("-", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Style
              <div className="segmented">
                {styles.map((style) => (
                  <button
                    type="button"
                    className={settings.style === style ? "active" : ""}
                    onClick={() => setSettings({ ...settings, style })}
                    key={style}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </label>

            <label>
              Accent bar
              <div className="segmented">
                {accentBarSides.map((side) => (
                  <button
                    type="button"
                    className={settings.accent_bar_side === side ? "active" : ""}
                    onClick={() =>
                      setSettings({ ...settings, accent_bar_side: side })
                    }
                    key={side}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </label>

            <label>
              Text alignment
              <div className="segmented">
                {textAlignments.map((align) => (
                  <button
                    type="button"
                    className={settings.text_align === align ? "active" : ""}
                    onClick={() =>
                      setSettings({ ...settings, text_align: align })
                    }
                    key={align}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </label>

            <label>
              Text color
              <div className="color-row">
                <input
                  type="color"
                  value={settings.text_color ?? "#ffffff"}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      text_color: event.target.value,
                    })
                  }
                />
                <code>{settings.text_color ?? "#ffffff"}</code>
              </div>
            </label>

            <label>
              Background color
              <div className="color-row">
                <input
                  type="color"
                  value={settings.background_color ?? "#0a080e"}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      background_color: event.target.value,
                    })
                  }
                />
                <code>{settings.background_color ?? "#0a080e"}</code>
              </div>
            </label>

            <label>
              Accent color
              <div className="color-row">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      accent_color: event.target.value,
                    })
                  }
                />
                <code>{settings.accent_color}</code>
              </div>
            </label>

            <div className="toggle-row">
              <span>Show label</span>
              <input
                type="checkbox"
                checked={settings.show_label}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    show_label: event.target.checked,
                  })
                }
              />
            </div>

            <div className="toggle-row">
              <span>Show short URL</span>
              <input
                type="checkbox"
                checked={settings.show_url}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    show_url: event.target.checked,
                  })
                }
              />
            </div>

            {message && <div className="form-success">{message}</div>}
          </div>
        </div>

        <div className="panel overlay-preview-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">PREVIEW</span>
              <strong>What viewers see</strong>
            </div>
          </div>

          <div className="overlay-preview-stage">
            <div className="scene-grid" />
            <span className="live-badge">LIVE</span>
            <OverlayRenderer streamer={streamer} preview />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
