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
          role="img"
          aria-label="Empty NupHub overlay"
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
  const style = streamer.settings.style;

  const showPanel = style !== "minimal";
  const fill =
    style === "solid"
      ? "#0a0810"
      : style === "glass"
        ? "rgba(10, 8, 14, 0.94)"
        : "transparent";

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
        {showPanel && (
          <>
            <rect
              x="8"
              y="10"
              width="504"
              height="84"
              rx="10"
              fill={fill}
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
                opacity=".28"
              />
            )}
          </>
        )}

        <rect
          x="8"
          y={showPanel ? "10" : "18"}
          width="4"
          height={showPanel ? "84" : "68"}
          rx="2"
          fill={accent}
        />

        <defs>
          <linearGradient id="nhGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".08" />
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

        <g filter={showPanel ? "url(#nhShadow)" : undefined}>
          {streamer.settings.show_label && (
            <text
              x="28"
              y={streamer.settings.show_url ? "40" : "60"}
              fill="#b9b1c3"
              fontSize="12"
              fontWeight="900"
              letterSpacing="1.2"
              fontFamily='Inter, "Segoe UI", Arial, sans-serif'
            >
              {label.toUpperCase()}
            </text>
          )}

          {streamer.settings.show_url && (
            <text
              x="28"
              y={streamer.settings.show_label ? "70" : "62"}
              fill="#ffffff"
              fontSize="25"
              fontWeight="800"
              letterSpacing="-0.5"
              fontFamily='Inter, "Segoe UI", Arial, sans-serif'
            >
              {url}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
