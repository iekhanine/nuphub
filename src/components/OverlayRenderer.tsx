import { useEffect, useMemo, useState } from "react";

import type { PublicStreamer } from "../types";
import "../styles/obs-svg.css";

type Props = {
  streamer: PublicStreamer;
  preview?: boolean;
};

const WIDTH = 520;
const HEIGHT = 104;

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1))}…`;
}

function clampOpacity(value: number | undefined) {
  if (!Number.isFinite(value)) return 0.94;
  return Math.min(1, Math.max(0, value ?? 0.94));
}

export function OverlayRenderer({ streamer, preview = false }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const links = streamer.links;

  useEffect(() => {
    setIndex(0);
  }, [streamer.handle, links.length]);

  useEffect(() => {
    if (links.length <= 1) return;

    let fadeTimer: number | undefined;
    const interval = Math.max(streamer.settings.rotation_seconds, 3) * 1000;

    const timer = window.setInterval(() => {
      setVisible(false);

      fadeTimer = window.setTimeout(() => {
        setIndex((current) => (current + 1) % links.length);
        setVisible(true);
      }, 320);
    }, interval);

    return () => {
      window.clearInterval(timer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [links.length, streamer.settings.rotation_seconds]);

  const link = links[index] ?? null;

  const label = useMemo(
    () => truncate(link?.label ?? "", 24),
    [link?.label],
  );

  const url = useMemo(
    () => truncate(link ? `nuphub.com/${link.slug}` : "", 38),
    [link],
  );

  if (!link) {
    if (!preview) return null;

    return (
      <div className="nh-svg-wrap nh-svg-preview">
        <svg
          className="nh-svg-overlay"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height="100%"
        >
          <rect
            x="8"
            y="14"
            width="504"
            height="76"
            rx="10"
            fill="#0b090e"
            stroke="#43384f"
            strokeDasharray="6 5"
          />
          <text
            x="28"
            y="58"
            fill="#766e80"
            fontSize="13"
            fontWeight="700"
            fontFamily='Inter, "Segoe UI", Arial, sans-serif'
          >
            Enable a link to preview your overlay.
          </text>
        </svg>
      </div>
    );
  }

  const accent = streamer.settings.accent_color || "#8b5cf6";
  const background = streamer.settings.background_color || "#0a080e";
  const textColor = streamer.settings.text_color || "#ffffff";
  const style = streamer.settings.style;
  const backgroundOpacity = clampOpacity(streamer.settings.background_opacity);
  const accentBarSide = streamer.settings.accent_bar_side ?? "left";
  const textAlign = streamer.settings.text_align ?? "left";

  const showPanel = style !== "minimal";
  const textAnchor = textAlign === "right" ? "end" : "start";
  const textX = textAlign === "right" ? 492 : 28;
  const labelY = streamer.settings.show_url ? 40 : 60;
  const urlY = streamer.settings.show_label ? 70 : 62;

  const accentRectX = accentBarSide === "right" ? 504 : 8;
  const accentRectY = showPanel ? 10 : 18;
  const accentRectH = showPanel ? 84 : 68;

  return (
    <div
      className={`nh-svg-wrap${preview ? " nh-svg-preview" : ""}${
        visible ? "" : " nh-svg-fading"
      }`}
    >
      <svg
        className="nh-svg-overlay"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height="100%"
        role="img"
        aria-label={`${label} ${url}`}
        preserveAspectRatio="xMinYMid meet"
      >
        <defs>
          <linearGradient id="nhGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <filter id="nhShadow" x="-20%" y="-40%" width="140%" height="180%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="8"
              floodColor="#000000"
              floodOpacity=".28"
            />
          </filter>
        </defs>

        {showPanel && (
          <g filter="url(#nhShadow)">
            <rect
              x="8"
              y="10"
              width="504"
              height="84"
              rx="10"
              fill={background}
              fillOpacity={backgroundOpacity}
              stroke="rgba(255,255,255,.13)"
            />

            {style === "glass" && (
              <rect
                x="9"
                y="11"
                width="502"
                height="82"
                rx="9"
                fill="url(#nhGlass)"
                opacity={Math.min(0.34, backgroundOpacity * 0.34)}
              />
            )}
          </g>
        )}

        {accentBarSide !== "none" && (
          <rect
            x={accentRectX}
            y={accentRectY}
            width="4"
            height={accentRectH}
            rx="2"
            fill={accent}
          />
        )}

        {streamer.settings.show_label && (
          <text
            x={textX}
            y={labelY}
            fill={textColor}
            fillOpacity=".72"
            fontSize="12"
            fontWeight="900"
            letterSpacing="1.2"
            fontFamily='Inter, "Segoe UI", Arial, sans-serif'
            textAnchor={textAnchor}
          >
            {label.toUpperCase()}
          </text>
        )}

        {streamer.settings.show_url && (
          <text
            x={textX}
            y={urlY}
            fill={textColor}
            fontSize="25"
            fontWeight="800"
            letterSpacing="-0.5"
            fontFamily='Inter, "Segoe UI", Arial, sans-serif'
            textAnchor={textAnchor}
          >
            {url}
          </text>
        )}
      </svg>
    </div>
  );
}
