import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  MonitorUp,
  Palette,
  Save,
  Trash2,
  Type,
} from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardShell } from "../components/DashboardShell";
import { OverlayRenderer } from "../components/OverlayRenderer";
import {
  deleteOverlayPreset,
  getMyEntitlement,
  getMyLinks,
  getMyProfile,
  getOverlayPresets,
  getOverlaySequence,
  getOverlaySettings,
  saveOverlayPreset,
  saveOverlaySettings,
  setCreatorCustomText,
  setOverlaySequenceItem,
} from "../lib/data";
import { hasPlan } from "../lib/plans";
import type {
  Entitlement,
  OverlayAccentBarSide,
  OverlayFontFamily,
  OverlayPreset,
  OverlayPresetConfig,
  OverlaySequenceItem,
  OverlaySettings,
  OverlayStyle,
  OverlayTextAlign,
  OverlayTextAnimation,
  OverlayTextEffect,
  OverlayTransitionEffect,
  Profile,
  PublicStreamer,
  StreamLink,
} from "../types";


const styles: OverlayStyle[] = ["glass", "solid", "minimal"];
const accentBarSides: OverlayAccentBarSide[] = ["left", "none", "right"];
const textAlignments: OverlayTextAlign[] = ["left", "center", "right"];

const fonts: Array<{
  id: OverlayFontFamily;
  label: string;
  stack: string;
}> = [
  {
    id: "inter",
    label: "Inter / Segoe",
    stack: 'Inter, "Segoe UI", Arial, sans-serif',
  },
  {
    id: "arial",
    label: "Arial",
    stack: 'Arial, Helvetica, sans-serif',
  },
  {
    id: "verdana",
    label: "Verdana",
    stack: 'Verdana, Geneva, sans-serif',
  },
  {
    id: "trebuchet",
    label: "Trebuchet",
    stack: '"Trebuchet MS", Arial, sans-serif',
  },
  {
    id: "georgia",
    label: "Georgia",
    stack: 'Georgia, "Times New Roman", serif',
  },
  {
    id: "impact",
    label: "Impact",
    stack: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
  },
  {
    id: "courier",
    label: "Courier New",
    stack: '"Courier New", Courier, monospace',
  },
];

const proEffects: Array<{
  id: Exclude<OverlayTextEffect, "neon">;
  label: string;
}> = [
  { id: "none", label: "None" },
  { id: "shadow", label: "Shadow" },
  { id: "glow", label: "Glow" },
  { id: "outline", label: "Outline" },
];

const creatorAnimations: Array<{
  id: OverlayTextAnimation;
  label: string;
}> = [
  { id: "none", label: "Still" },
  { id: "pulse", label: "Pulse" },
  { id: "zoom", label: "Zoom" },
  { id: "spin", label: "Spin" },
  { id: "wobble", label: "Wobble" },
  { id: "bounce", label: "Bounce" },
  { id: "flash", label: "Flash" },
  { id: "float", label: "Float" },
  { id: "shake", label: "Shake" },
];

const creatorTransitions: Array<{
  id: OverlayTransitionEffect;
  label: string;
}> = [
  { id: "fade", label: "Fade" },
  { id: "explode", label: "Explode" },
  { id: "implode", label: "Implode" },
  { id: "slide-left", label: "Slide Left" },
  { id: "slide-right", label: "Slide Right" },
  { id: "flip", label: "Flip" },
  { id: "pop", label: "Pop" },
];

type PreviewBackdrop = "dark" | "light" | "green" | "checker";


function presetConfig(settings: OverlaySettings): OverlayPresetConfig {
  return {
    accent_color: settings.accent_color,
    background_color: settings.background_color,
    text_color: settings.text_color,
    style: settings.style,
    background_opacity: settings.background_opacity,
    accent_bar_side: settings.accent_bar_side,
    text_align: settings.text_align,
    font_family: settings.font_family,
    text_effect: settings.text_effect,
    text_animation: settings.text_animation,
    transition_effect: settings.transition_effect,
    animation_speed: settings.animation_speed,
    neon_primary_color: settings.neon_primary_color,
    neon_secondary_color: settings.neon_secondary_color,
    neon_intensity: settings.neon_intensity,
    neon_speed: settings.neon_speed,
    font_scale: settings.font_scale,
    show_label: settings.show_label,
    show_url: settings.show_url,
  };
}

function normalizeSettings(settings: OverlaySettings): OverlaySettings {
  return {
    ...settings,
    text_effect: settings.text_effect ?? "none",
    text_animation: settings.text_animation ?? "none",
    transition_effect: settings.transition_effect ?? "fade",
    animation_speed: settings.animation_speed ?? 1.6,
    neon_primary_color:
      settings.neon_primary_color ??
      settings.accent_color ??
      "#8b5cf6",
    neon_secondary_color:
      settings.neon_secondary_color ?? "#22d3ee",
    neon_intensity: settings.neon_intensity ?? 1,
    neon_speed: settings.neon_speed ?? 1.8,
    font_scale: settings.font_scale ?? 1,
    font_family: settings.font_family ?? "inter",
    text_align: settings.text_align ?? "left",
    custom_label_text: settings.custom_label_text ?? null,
    custom_url_text: settings.custom_url_text ?? null,
  };
}

export default function OverlaySettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<StreamLink[]>([]);
  const [settings, setSettings] = useState<OverlaySettings | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [presets, setPresets] = useState<OverlayPreset[]>([]);
  const [sequence, setSequence] = useState<OverlaySequenceItem[]>([]);
  const [savedSequence, setSavedSequence] = useState<OverlaySequenceItem[]>([]);
  const [presetName, setPresetName] = useState("");
  const [savedSettings, setSavedSettings] = useState<OverlaySettings | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<"pro" | "creator" | null>(null);
  const [previewBackdrop, setPreviewBackdrop] =
    useState<PreviewBackdrop>("dark");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function refreshEntitlement() {
    const nextEntitlement = await getMyEntitlement();
    setEntitlement(nextEntitlement);
  }

  async function refreshPaidData(plan: Entitlement["plan"]) {
    if (!hasPlan(plan, "creator")) {
      setPresets([]);
      setSequence([]);
      setSavedSequence([]);
      return;
    }

    const [nextPresets, nextSequence] = await Promise.all([
      getOverlayPresets(),
      getOverlaySequence(),
    ]);

    setPresets(nextPresets);
    setSequence(nextSequence);
    setSavedSequence(nextSequence);
  }

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getMyLinks(),
      getOverlaySettings(),
      getMyEntitlement(),
    ])
      .then(async ([nextProfile, nextLinks, nextSettings, nextEntitlement]) => {
        setProfile(nextProfile);
        setLinks(nextLinks);
        const normalizedSettings = normalizeSettings(nextSettings);
        setSettings(normalizedSettings);
        setSavedSettings(normalizedSettings);
        setEntitlement(nextEntitlement);
        await refreshPaidData(nextEntitlement.plan);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onFocus = () => {
      void refreshEntitlement();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const plan = entitlement?.plan ?? "free";
  const pro = hasPlan(plan, "pro");
  const creator = hasPlan(plan, "creator");

  const presetMap = useMemo(
    () => new Map(presets.map((preset) => [preset.id, preset])),
    [presets],
  );

  const sequenceMap = useMemo(
    () => new Map(sequence.map((item) => [item.link_id, item])),
    [sequence],
  );

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
        font_family: settings.font_family ?? "inter",
        text_effect: settings.text_effect ?? "none",
        text_animation: settings.text_animation ?? "none",
        transition_effect: settings.transition_effect ?? "fade",
        animation_speed: settings.animation_speed ?? 1.6,
        neon_primary_color:
          settings.neon_primary_color ??
          settings.accent_color ??
          "#8b5cf6",
        neon_secondary_color:
          settings.neon_secondary_color ?? "#22d3ee",
        neon_intensity: settings.neon_intensity ?? 1,
        neon_speed: settings.neon_speed ?? 1.8,
        font_scale: settings.font_scale ?? 1,
        show_label: settings.show_label,
        show_url: settings.show_url,
        custom_label_text: settings.custom_label_text ?? null,
        custom_url_text: settings.custom_url_text ?? null,
      },
      links: links
        .filter((item) => item.enabled)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => {
          const chain = sequenceMap.get(item.id);
          const preset = chain?.preset_id
            ? presetMap.get(chain.preset_id)
            : null;

          return {
            label: item.label,
            slug: item.custom_slug || item.slug,
            overlay: preset?.config ?? null,
            duration_seconds: chain?.duration_seconds ?? null,
            weight: chain?.weight ?? 1,
            qr_enabled: chain?.qr_enabled ?? false,
          };
        }),
    };
  }, [profile, settings, links, sequenceMap, presetMap]);


  function normalizedChainSnapshot(items: OverlaySequenceItem[]) {
    return items
      .map((item) => ({
        link_id: item.link_id,
        preset_id: item.preset_id ?? null,
        duration_seconds: item.duration_seconds ?? null,
        weight: item.weight ?? 1,
        qr_enabled: item.qr_enabled ?? false,
      }))
      .sort((a, b) => a.link_id.localeCompare(b.link_id));
  }

  function linkChainChanged() {
    return (
      JSON.stringify(normalizedChainSnapshot(sequence)) !==
      JSON.stringify(normalizedChainSnapshot(savedSequence))
    );
  }

  async function save() {
    if (!settings) return;

    const proFields: Array<keyof OverlaySettings> = [
      "background_color",
      "style",
      "accent_bar_side",
      "text_align",
      "font_family",
      "text_effect",
      "text_animation",
      "transition_effect",
      "animation_speed",
      "neon_primary_color",
      "neon_secondary_color",
      "neon_intensity",
      "neon_speed",
    ];

    const changedProFeature =
      !pro &&
      !!savedSettings &&
      proFields.some(
        (field) => settings[field] !== savedSettings[field],
      );

    const changedCreatorText =
      !!savedSettings &&
      (
        (settings.custom_label_text ?? "") !==
          (savedSettings.custom_label_text ?? "") ||
        (settings.custom_url_text ?? "") !==
          (savedSettings.custom_url_text ?? "")
      );

    const changedCreatorFeature =
      !creator &&
      (linkChainChanged() || changedCreatorText);

    // Keep the save atomic. Do not partially save allowed settings
    // when the current preview also contains locked-tier changes.
    if (changedCreatorFeature) {
      setUpgradePrompt("creator");
      return;
    }

    if (changedProFeature) {
      setUpgradePrompt("pro");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const updated = await saveOverlaySettings({
        rotation_seconds: settings.rotation_seconds,
        position: settings.position,
        accent_color: settings.accent_color,
        text_color: settings.text_color,
        background_opacity: settings.background_opacity,
        font_scale: settings.font_scale,
        show_label: settings.show_label,
        show_url: settings.show_url,

        ...(pro
          ? {
              background_color: settings.background_color,
              style: settings.style,
              accent_bar_side: settings.accent_bar_side,
              text_align: settings.text_align,
              font_family: settings.font_family,
              text_effect: settings.text_effect,
              text_animation: settings.text_animation,
              transition_effect: settings.transition_effect,
              animation_speed: settings.animation_speed,
              neon_primary_color: settings.neon_primary_color,
              neon_secondary_color: settings.neon_secondary_color,
              neon_intensity: settings.neon_intensity,
              neon_speed: settings.neon_speed,
            }
          : {}),
      });

      let finalSettings = updated;

      if (creator) {
        const enabledLinks = links.filter((item) => item.enabled);

        const [, creatorSettings] = await Promise.all([
          Promise.all(
            enabledLinks.map((link) => {
              const item = chainItem(link.id);

              return setOverlaySequenceItem(link.id, {
                presetId: item.preset_id,
                durationSeconds: item.duration_seconds,
                weight: item.weight,
                qrEnabled: item.qr_enabled,
              });
            }),
          ),
          setCreatorCustomText({
            customLabelText:
              settings.custom_label_text?.trim() || null,
            customUrlText:
              settings.custom_url_text?.trim() || null,
          }),
        ]);

        finalSettings = creatorSettings;
        setSavedSequence(sequence.map((item) => ({ ...item })));
      }

      const normalized = normalizeSettings(finalSettings);
      setSettings(normalized);
      setSavedSettings(normalized);
      setMessage("Everything saved.");
      window.setTimeout(() => setMessage(""), 1800);
    } finally {
      setSaving(false);
    }
  }

  async function saveCurrentPreset() {
    if (!settings || !presetName.trim()) return;

    if (!creator) {
      setUpgradePrompt("creator");
      return;
    }

    const preset = await saveOverlayPreset({
      name: presetName.trim(),
      config: presetConfig(settings),
    });

    setPresets((items) => [preset, ...items.filter((item) => item.id !== preset.id)]);
    setPresetName("");
    setMessage(`Saved "${preset.name}".`);
    window.setTimeout(() => setMessage(""), 1800);
  }

  async function removePreset(id: string) {
    if (!creator) {
      setUpgradePrompt("creator");
      return;
    }

    await deleteOverlayPreset(id);
    setPresets((items) => items.filter((item) => item.id !== id));
    setSequence((items) => items.filter((item) => item.preset_id !== id));
  }

  function applyPreset(preset: OverlayPreset) {
    if (!settings) return;

    if (!creator) {
      setUpgradePrompt("creator");
      return;
    }
    setSettings(normalizeSettings({ ...settings, ...preset.config }));
    setMessage(`Applied "${preset.name}". Save overlay to make it your default.`);
    window.setTimeout(() => setMessage(""), 2200);
  }


  function chainItem(linkId: string): OverlaySequenceItem {
    return (
      sequence.find((item) => item.link_id === linkId) ?? {
        user_id: profile?.id ?? "",
        link_id: linkId,
        preset_id: null,
        duration_seconds: null,
        weight: 1,
        qr_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  }

  function updateChainItem(
    linkId: string,
    changes: Partial<
      Pick<
        OverlaySequenceItem,
        "preset_id" | "duration_seconds" | "weight" | "qr_enabled"
      >
    >,
  ) {
    setSequence((items) => {
      const current = chainItem(linkId);
      const next = {
        ...current,
        ...changes,
        updated_at: new Date().toISOString(),
      };

      return [
        ...items.filter((item) => item.link_id !== linkId),
        next,
      ];
    });
  }


  const obsUrl = profile
    ? `${window.location.origin}/obs/${profile.handle}`
    : "";

  const allLinksUrl = profile
    ? `${window.location.origin}/obs/${profile.handle}/all`
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
  const fontPercent = Math.round((settings.font_scale ?? 1) * 100);

  // UI direction: left = slow, right = fast.
  // Stored value remains CSS duration (higher = slower) for compatibility.
  const speedSlider = Math.round(
    ((4 - settings.animation_speed) / (4 - 0.4)) * 100,
  );

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading compact-heading">
        <div>
          <span className="kicker">OBS OVERLAY</span>
          <h1>Build your on-stream link.</h1>
          <p className="dash-subtitle">
            Tune the default look, save presets, then chain them across links.
          </p>
        </div>


      </div>

      <div className="overlay-dashboard-grid polished-overlay-grid">
        <div className="overlay-control-stack">
          <div className="panel settings-panel">
            <div className="panel-head overlay-section-head">
              <div>
                <span className="panel-label">OBS BROWSER SOURCE</span>
                <strong>Add it once. Customize it here.</strong>
              </div>
              <MonitorUp size={17} />
            </div>

            <div className="source-row">
              <code>{obsUrl}</code>
              <button
                className="icon-button"
                onClick={() => void navigator.clipboard.writeText(obsUrl)}
                title="Copy"
              >
                <Copy size={17} />
              </button>
              <a
                className="icon-button"
                href={obsUrl}
                target="_blank"
                rel="noreferrer"
                title="Open source"
              >
                <ExternalLink size={17} />
              </a>
            </div>
          </div>

          <details className="panel settings-panel overlay-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <strong>Content &amp; Placement</strong>
              </div>
            </summary>

            <div className="overlay-accordion-body">
              <div className="settings-form overlay-section-form">

              <label>
                Rotate links every
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

              <div className="overlay-toggle-grid">
                <label className="overlay-choice-row">
                  <span>
                    <strong>Show label</strong>
                    <small>“JOIN THE DISCORD”</small>
                  </span>
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
                </label>

                <label className="overlay-choice-row">
                  <span>
                    <strong>Show short URL</strong>
                    <small>nuphub.com/yourlink</small>
                  </span>
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
                </label>
              </div>
            
              </div>
            </div>
          </details>

          <details className="panel settings-panel overlay-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <strong>Color &amp; Readability</strong>
              </div>
            </summary>

            <div className="overlay-accordion-body">
              <div className="settings-form overlay-section-form">

              <div className="overlay-color-grid">
                <label>
                  Accent
                  <div className="color-control">
                    <input
                      className="color-picker-input"
                      type="color"
                      value={settings.accent_color}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          accent_color: event.target.value,
                        })
                      }
                      aria-label="Accent color"
                    />
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: settings.accent_color }}
                    />
                    <input
                      className="color-hex-input"
                      value={settings.accent_color}
                      maxLength={7}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          accent_color: event.target.value,
                        })
                      }
                      aria-label="Accent color hex value"
                    />
                  </div>
                </label>

                <label>
                  Text
                  <div className="color-control">
                    <input
                      className="color-picker-input"
                      type="color"
                      value={settings.text_color ?? "#ffffff"}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          text_color: event.target.value,
                        })
                      }
                      aria-label="Text color"
                    />
                    <span
                      className="color-swatch"
                      style={{
                        backgroundColor: settings.text_color ?? "#ffffff",
                      }}
                    />
                    <input
                      className="color-hex-input"
                      value={settings.text_color ?? "#ffffff"}
                      maxLength={7}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          text_color: event.target.value,
                        })
                      }
                      aria-label="Text color hex value"
                    />
                  </div>
                </label>
              </div>

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
                        background_opacity:
                          Number(event.target.value) / 100,
                      })
                    }
                  />
                  <strong>{opacityPercent}%</strong>
                </div>
              </label>

              <label>
                Text size
                <div className="range-row">
                  <input
                    type="range"
                    min="80"
                    max="125"
                    step="5"
                    value={fontPercent}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        font_scale: Number(event.target.value) / 100,
                      })
                    }
                  />
                  <strong>{fontPercent}%</strong>
                </div>
              </label>
            
              </div>
            </div>
          </details>

          <details className="panel settings-panel overlay-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <span className="overlay-tier-badge">PRO</span>
                <strong>Shape, typography &amp; static effects</strong>
              </div>
              <span className="overlay-accordion-hint">
                {pro ? "Active" : "Preview"}
              </span>
            </summary>

            <div className="overlay-accordion-body">
              <div className="advanced-settings overlay-section-form overlay-compact-labels">

              <label>
                Card style
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
                Background color
                <div className="color-control">
                  <input
                    className="color-picker-input"
                    type="color"
                    value={settings.background_color ?? "#0a080e"}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        background_color: event.target.value,
                      })
                    }
                    aria-label="Background color"
                  />
                  <span
                    className="color-swatch"
                    style={{
                      backgroundColor:
                        settings.background_color ?? "#0a080e",
                    }}
                  />
                  <input
                    className="color-hex-input"
                    value={settings.background_color ?? "#0a080e"}
                    maxLength={7}
                    onChange={(event) => {
                      const value = event.target.value;

                      setSettings({
                        ...settings,
                        background_color: value,
                      });
                    }}
                    onBlur={(event) => {
                      const value = event.target.value;

                      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        setSettings({
                          ...settings,
                          background_color: "#0a080e",
                        });
                      }
                    }}
                    aria-label="Background color hex value"
                  />
                </div>
              </label>

              <div className="overlay-two-column">
                <label>
                  Edge accent
                  <div className="segmented">
                    {accentBarSides.map((side) => (
                      <button
                        type="button"
                        className={
                          settings.accent_bar_side === side ? "active" : ""
                        }
                        onClick={() =>
                          setSettings({
                            ...settings,
                            accent_bar_side: side,
                          })
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
                        className={
                          settings.text_align === align ? "active" : ""
                        }
                        onClick={() =>
                          setSettings({
                            ...settings,
                            text_align: align,
                          })
                        }
                        key={align}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <label>
                Font
                <div className="font-choice-grid">
                  {fonts.map((font) => (
                    <button
                      type="button"
                      className={`font-choice${
                        settings.font_family === font.id ? " active" : ""
                      }`}
                      onClick={() =>
                        setSettings({
                          ...settings,
                          font_family: font.id,
                        })
                      }
                      key={font.id}
                    >
                      <span
                        className="font-choice-preview"
                        style={{ fontFamily: font.stack }}
                      >
                        Aa
                      </span>
                      <span
                        className="font-choice-name"
                        style={{ fontFamily: font.stack }}
                      >
                        {font.label}
                      </span>
                    </button>
                  ))}
                </div>
              </label>

              <label>
                Static text effect
                <div className="effect-grid">
                  {proEffects.map((effect) => (
                    <button
                      type="button"
                      className={
                        settings.text_effect === effect.id ? "active" : ""
                      }
                      onClick={() =>
                        setSettings({
                          ...settings,
                          text_effect: effect.id,
                        })
                      }
                      key={effect.id}
                    >
                      {effect.label}
                    </button>
                  ))}
                </div>
              </label>
            
              </div>

              {!pro && (
                <div className="paid-preview-note">
                  Preview these controls now. Upgrade to Pro or Creator to save and use them.
                </div>
              )}
            </div>
          </details>

          <details className="panel settings-panel overlay-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <span className="overlay-tier-badge">PRO</span>
                <strong>Neon, motion &amp; link transitions</strong>
              </div>
              <span className="overlay-accordion-hint">
                {pro ? "Active" : "Preview"}
              </span>
            </summary>

            <div className="overlay-accordion-body">
              <div className="advanced-settings overlay-section-form overlay-compact-labels">

              <label>
                Neon
                <div className="effect-grid">
                  <button
                    type="button"
                    className={
                      settings.text_effect === "neon" ? "active" : ""
                    }
                    onClick={() =>
                      setSettings({
                        ...settings,
                        text_effect:
                          settings.text_effect === "neon" ? "none" : "neon",
                      })
                    }
                  >
                    Dual-color Neon
                  </button>
                </div>
              </label>

              <div className="overlay-color-grid">
                <label>
                  Neon color A
                  <div className="color-control">
                    <input
                      className="color-picker-input"
                      type="color"
                      value={settings.neon_primary_color}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          neon_primary_color: event.target.value,
                        })
                      }
                      aria-label="Neon color A"
                    />
                    <span
                      className="color-swatch"
                      style={{
                        backgroundColor: settings.neon_primary_color,
                      }}
                    />
                    <input
                      className="color-hex-input"
                      value={settings.neon_primary_color}
                      maxLength={7}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          neon_primary_color: event.target.value,
                        })
                      }
                      aria-label="Neon color A hex value"
                    />
                  </div>
                </label>

                <label>
                  Neon color B
                  <div className="color-control">
                    <input
                      className="color-picker-input"
                      type="color"
                      value={settings.neon_secondary_color}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          neon_secondary_color: event.target.value,
                        })
                      }
                      aria-label="Neon color B"
                    />
                    <span
                      className="color-swatch"
                      style={{
                        backgroundColor: settings.neon_secondary_color,
                      }}
                    />
                    <input
                      className="color-hex-input"
                      value={settings.neon_secondary_color}
                      maxLength={7}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          neon_secondary_color: event.target.value,
                        })
                      }
                      aria-label="Neon color B hex value"
                    />
                  </div>
                </label>
              </div>

              <label>
                Neon intensity
                <div className="range-row">
                  <input
                    type="range"
                    min="25"
                    max="250"
                    step="5"
                    value={Math.round(settings.neon_intensity * 100)}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        neon_intensity: Number(event.target.value) / 100,
                      })
                    }
                  />
                  <strong>{Math.round(settings.neon_intensity * 100)}%</strong>
                </div>
              </label>

              <label>
                Neon pulse rate
                <div className="range-row">
                  <input
                    type="range"
                    min="35"
                    max="400"
                    step="5"
                    value={Math.round((4.35 - settings.neon_speed) * 100)}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        neon_speed:
                          4.35 - Number(event.target.value) / 100,
                      })
                    }
                  />
                  <strong>
                    {settings.neon_speed <= 1 ? "Fast" :
                      settings.neon_speed >= 3 ? "Slow" : "Medium"}
                  </strong>
                </div>
              </label>

              <label>
                Text animation
                <div className="effect-grid creator-effect-grid">
                  {creatorAnimations.map((animation) => (
                    <button
                      type="button"
                      className={
                        settings.text_animation === animation.id
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setSettings({
                          ...settings,
                          text_animation: animation.id,
                        })
                      }
                      key={animation.id}
                    >
                      {animation.label}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                Animation speed
                <div className="range-row">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={speedSlider}
                    onChange={(event) => {
                      const uiValue = Number(event.target.value) / 100;
                      const duration = 4 - uiValue * (4 - 0.4);

                      setSettings({
                        ...settings,
                        animation_speed: Number(duration.toFixed(2)),
                      });
                    }}
                  />
                  <strong>
                    {speedSlider < 34 ? "Slow" :
                      speedSlider > 66 ? "Fast" : "Medium"}
                  </strong>
                </div>
              </label>

              <label>
                Next-link transition
                <div className="effect-grid creator-transition-grid">
                  {creatorTransitions.map((transition) => (
                    <button
                      type="button"
                      className={
                        settings.transition_effect === transition.id
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setSettings({
                          ...settings,
                          transition_effect: transition.id,
                        })
                      }
                      key={transition.id}
                    >
                      {transition.label}
                    </button>
                  ))}
                </div>
              </label>
            
              </div>

              {!pro && (
                <div className="paid-preview-note">
                  Everything here is live in the preview. Upgrade to Pro or Creator to save and use it in OBS.
                </div>
              )}
            </div>
          </details>

          <details className="panel settings-panel overlay-accordion creator-settings-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <span className="overlay-tier-badge creator">CREATOR</span>
                <strong>Saved Overlays</strong>
              </div>
              <span className="overlay-accordion-hint">
                {creator ? "Active" : "Preview"}
              </span>
            </summary>

            <div className="overlay-accordion-body">
              <div className="preset-manager">
                <div className="preset-save-row">
                  <input
                    value={presetName}
                    onChange={(event) => setPresetName(event.target.value)}
                    maxLength={40}
                    placeholder="Preset name"
                  />
                  <button
                    type="button"
                    className="button secondary"
                    disabled={!presetName.trim()}
                    onClick={() => void saveCurrentPreset()}
                  >
                    Save current
                  </button>
                </div>

                <div className="preset-list">
                  {presets.map((preset) => (
                    <div className="preset-row" key={preset.id}>
                      <strong>{preset.name}</strong>
                      <div>
                        <button
                          type="button"
                          onClick={() => applyPreset(preset)}
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          className="danger-lite"
                          onClick={() => void removePreset(preset.id)}
                          title="Delete preset"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {presets.length === 0 && (
                    <span className="preset-empty">
                      Name the overlay you are previewing, then try Save current.
                    </span>
                  )}
                </div>
              </div>

              {!creator && (
                <div className="paid-preview-note creator">
                  Saved Overlays are a Creator feature. You can preview the workflow, but saving requires Creator.
                </div>
              )}
            </div>
          </details>

          <details className="panel settings-panel overlay-accordion creator-settings-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <span className="overlay-tier-badge creator">CREATOR</span>
                <strong>Link Chain</strong>
              </div>
              <span className="overlay-accordion-hint">
                {creator ? "Active" : "Preview"}
              </span>
            </summary>

            <div className="overlay-accordion-body">
              <div className="overlay-chain-explainer">
                Give every link its own timing, visibility weight, preset and QR mode.
              </div>

              <div className="overlay-chain-list creator-chain-list">
                {links
                  .filter((item) => item.enabled)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((link, index) => {
                    const chain = chainItem(link.id);

                    return (
                      <div
                        className="creator-chain-card"
                        key={link.id}
                      >
                        <div className="creator-chain-title">
                          <span className="chain-index">{index + 1}</span>
                          <div>
                            <strong>{link.label}</strong>
                            <small>nuphub.com/{link.slug}</small>
                          </div>
                        </div>

                        <div className="creator-chain-controls">
                          <label>
                            Overlay
                            <select
                              value={chain.preset_id ?? ""}
                              onChange={(event) =>
                                updateChainItem(link.id, {
                                  preset_id:
                                    event.target.value || null,
                                })
                              }
                            >
                              <option value="">Default overlay</option>
                              {presets.map((preset) => (
                                <option
                                  value={preset.id}
                                  key={preset.id}
                                >
                                  {preset.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label>
                            Duration
                            <select
                              value={
                                chain.duration_seconds == null
                                  ? ""
                                  : String(chain.duration_seconds)
                              }
                              onChange={(event) =>
                                updateChainItem(link.id, {
                                  duration_seconds:
                                    event.target.value === ""
                                      ? null
                                      : Number(event.target.value),
                                })
                              }
                            >
                              <option value="">Default</option>
                              {[3, 5, 8, 10, 12, 15, 20, 30].map(
                                (seconds) => (
                                  <option
                                    value={seconds}
                                    key={seconds}
                                  >
                                    {seconds}s
                                  </option>
                                ),
                              )}
                            </select>
                          </label>

                          <label>
                            Weight
                            <select
                              value={chain.weight}
                              onChange={(event) =>
                                updateChainItem(link.id, {
                                  weight: Number(event.target.value),
                                })
                              }
                            >
                              {[1, 2, 3, 4, 5].map((weight) => (
                                <option value={weight} key={weight}>
                                  {weight}×
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="chain-qr-control">
                            QR Code
                            <button
                              type="button"
                              className={`chain-qr-toggle${
                                chain.qr_enabled ? " active" : ""
                              }`}
                              onClick={() =>
                                updateChainItem(link.id, {
                                  qr_enabled: !chain.qr_enabled,
                                })
                              }
                            >
                              {chain.qr_enabled ? "On" : "Off"}
                            </button>
                          </label>
                        </div>
                      </div>
                    );
                  })}

                {links.filter((item) => item.enabled).length === 0 && (
                  <span className="preset-empty">
                    Enable at least one link to build a chain.
                  </span>
                )}
              </div>

              <div className="creator-chain-save">
                <span>
                  Weight controls how often a link is selected. Duration controls how long it stays visible. The main Save button saves Link Chain too.
                </span>
              </div>


              {!creator && (
                <div className="paid-preview-note creator">
                  You can experiment with Link Chain in the live preview. Upgrade to Creator to save it to OBS.
                </div>
              )}
            </div>
          </details>

          <details className="panel settings-panel overlay-accordion creator-settings-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <span className="overlay-tier-badge creator">CREATOR</span>
                <strong>All Links Overlay</strong>
              </div>
              <span className="overlay-accordion-hint">
                {creator ? "Active" : "Preview"}
              </span>
            </summary>

            <div className="overlay-accordion-body creator-all-links-body">
              <div className="creator-all-links-copy">
                <strong>Dedicated OBS Browser Source</strong>
                <p>
                  Shows every enabled link at once for Starting Soon, BRB,
                  intermission, or stream-ending scenes. QR visibility follows
                  each link's QR setting in Link Chain.
                </p>
              </div>

              {creator ? (
                <>
                  <div className="creator-all-links-url-row">
                    <code>{allLinksUrl}</code>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() =>
                        void navigator.clipboard.writeText(allLinksUrl)
                      }
                      title="Copy All Links overlay URL"
                    >
                      <Copy size={16} />
                    </button>
                    <a
                      className="icon-button"
                      href={allLinksUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Open All Links overlay"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>

                  <div className="creator-all-links-specs">
                    <span>
                      <b>OBS size:</b> 960 × 540
                    </span>
                    <span>
                      <b>QR:</b> Controlled per link in Link Chain
                    </span>
                  </div>
                </>
              ) : (
                <div className="paid-preview-note creator creator-all-links-locked">
                  <span>
                    Creator Lifetime unlocks the dedicated All Links Browser Source.
                  </span>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setUpgradePrompt("creator")}
                  >
                    Upgrade to Creator
                  </button>
                </div>
              )}
            </div>
          </details>

          <details className="panel settings-panel overlay-accordion creator-settings-accordion">
            <summary className="overlay-accordion-summary">
              <div>
                <span className="overlay-tier-badge creator">CREATOR</span>
                <strong>Custom Text</strong>
              </div>
              <span className="overlay-accordion-hint">
                {creator ? "Active" : "Preview"}
              </span>
            </summary>

            <div className="overlay-accordion-body creator-custom-text-body">
              <div className="overlay-chain-explainer">
                Override the rotating overlay's visible title and Message text.
                Leave either field blank to use the link's normal value.
              </div>

              <div className="creator-custom-text-grid">
                <label>
                  Title text
                  <input
                    className="creator-custom-text-control"
                    value={settings.custom_label_text ?? ""}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        custom_label_text:
                          event.target.value.slice(0, 48),
                      })
                    }
                    maxLength={48}
                    placeholder="Use normal link title"
                  />
                </label>

                <label>
                  Message text
                  <textarea
                    className="creator-custom-text-control"
                    value={settings.custom_url_text ?? ""}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        custom_url_text:
                          event.target.value.slice(0, 72),
                      })
                    }
                    maxLength={72}
                    rows={3}
                    placeholder="Use the normal link URL, or write a short message"
                  />
                </label>
              </div>

              <div className="creator-custom-text-note">
                This changes only what viewers see in the overlay. It does not
                change the actual NupHub link or redirect destination.
              </div>

              {!creator && (
                <div className="paid-preview-note creator">
                  You can preview Custom Text here. Upgrade to Creator to save
                  it to the OBS overlay.
                </div>
              )}
            </div>
          </details>

          {message && <div className="form-success">{message}</div>}
        </div>



        <div className="panel overlay-preview-panel sticky-overlay-preview">
          <div className="panel-head overlay-preview-head">
            <div>
              <span className="panel-label">LIVE PREVIEW</span>
              <strong>What viewers see</strong>
            </div>
            <button
              className="button primary overlay-save-everything"
              onClick={() => void save()}
            >
              <Save size={17} />
              {saving ? "Saving…" : "Save Everything"}
            </button>
          </div>

          <div className="preview-backdrop-tabs">
            {(["dark", "light", "green", "checker"] as PreviewBackdrop[]).map(
              (backdrop) => (
                <button
                  type="button"
                  className={previewBackdrop === backdrop ? "active" : ""}
                  onClick={() => setPreviewBackdrop(backdrop)}
                  key={backdrop}
                >
                  {backdrop}
                </button>
              ),
            )}
          </div>

          <div
            className={`overlay-preview-stage overlay-preview-stage-clean preview-backdrop-${previewBackdrop}`}
          >
            <OverlayRenderer streamer={streamer} preview />
          </div>

          <div className="overlay-preview-note">
            Backdrop is preview-only. OBS stays transparent.
          </div>
        </div>
      </div>

      {upgradePrompt && (
        <div
          className="upgrade-modal-backdrop"
          role="presentation"
          onMouseDown={() => setUpgradePrompt(null)}
        >
          <div
            className="upgrade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span
              className={`overlay-tier-badge${
                upgradePrompt === "creator" ? " creator" : ""
              }`}
            >
              {upgradePrompt === "creator" ? "CREATOR" : "PRO"}
            </span>

            <h2 id="upgrade-modal-title">Upgrade required</h2>

            <p>
              Please upgrade your plan to Pro or Creator to unlock these features.
            </p>

            <div className="upgrade-modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => setUpgradePrompt(null)}
              >
                Not now
              </button>

              <Link
                className="button primary"
                to="/dashboard/billing"
                onClick={() => setUpgradePrompt(null)}
              >
                View plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
