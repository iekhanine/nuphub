import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import QRCode from "qrcode";

import type {
  OverlayFontFamily,
  PublicStreamer,
} from "../types";
import "../styles/obs-svg.css";

type Props = {
  streamer: PublicStreamer;
  preview?: boolean;
};

type TransitionPhase = "idle" | "exit" | "enter";

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 144;

const ARTWORK_WIDTH = 520;
const ARTWORK_HEIGHT = 104;
const OFFSET_X = 20;
const OFFSET_Y = 20;

const fontStacks: Record<OverlayFontFamily, string> = {
  inter: 'Inter, "Segoe UI", Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  trebuchet: '"Trebuchet MS", Arial, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  impact: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
  courier: '"Courier New", Courier, monospace',
};

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1))}…`;
}

function clamp(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number,
) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value ?? fallback));
}

function chooseWeightedNext(
  links: PublicStreamer["links"],
  currentIndex: number,
) {
  if (links.length <= 1) return currentIndex;

  const candidates = links.map((item, index) => ({
    index,
    weight: Math.max(1, Math.min(10, item.weight ?? 1)),
  }));

  const pickOnce = () => {
    const total = candidates.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    let pick = Math.random() * total;

    for (const item of candidates) {
      pick -= item.weight;

      if (pick <= 0) {
        return item.index;
      }
    }

    return candidates[candidates.length - 1]?.index ?? currentIndex;
  };

  const firstPick = pickOnce();

  if (firstPick === currentIndex) {
    return pickOnce();
  }

  return firstPick;
}

export function OverlayRenderer({ streamer, preview = false }: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [qrMatrix, setQrMatrix] = useState<{
    size: number;
    data: boolean[];
  } | null>(null);

  const links = streamer.links;
  const link = links[index] ?? null;

  const effectiveSettings = useMemo(
    () => ({
      ...streamer.settings,
      ...(link?.overlay ?? {}),
    }),
    [streamer.settings, link],
  );

  useEffect(() => {
    setIndex(0);
    setPhase("idle");
  }, [streamer.handle, links.length]);

  useEffect(() => {
    if (!link?.qr_enabled) {
      setQrMatrix(null);
      return;
    }

    try {
      const qr = QRCode.create(`https://nuphub.com/${link.slug}`, {
        errorCorrectionLevel: "M",
      });

      setQrMatrix({
        size: qr.modules.size,
        data: Array.from(qr.modules.data, Boolean),
      });
    } catch {
      setQrMatrix(null);
    }
  }, [link?.slug, link?.qr_enabled]);

  useEffect(() => {
    if (!link || links.length <= 1) return;

    let swapTimer: number | undefined;
    let settleTimer: number | undefined;

    const seconds =
      link.duration_seconds ??
      streamer.settings.rotation_seconds;

    const timer = window.setTimeout(() => {
      setPhase("exit");

      swapTimer = window.setTimeout(() => {
        setIndex((current) =>
          chooseWeightedNext(links, current),
        );
        setPhase("enter");

        settleTimer = window.setTimeout(() => {
          setPhase("idle");
        }, 520);
      }, 420);
    }, Math.max(seconds, 3) * 1000);

    return () => {
      window.clearTimeout(timer);
      if (swapTimer) window.clearTimeout(swapTimer);
      if (settleTimer) window.clearTimeout(settleTimer);
    };
  }, [
    index,
    link,
    links,
    streamer.settings.rotation_seconds,
  ]);

  const qrEnabled = Boolean(link?.qr_enabled);

  const label = useMemo(
    () => truncate(link?.label ?? "", qrEnabled ? 18 : 24),
    [link?.label, qrEnabled],
  );

  const url = useMemo(
    () =>
      truncate(
        link ? `nuphub.com/${link.slug}` : "",
        qrEnabled ? 27 : 38,
      ),
    [link, qrEnabled],
  );

  if (!link) {
    if (!preview) return null;

    return (
      <div className="nh-svg-wrap nh-svg-preview">
        <svg
          className="nh-svg-overlay"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          width="100%"
          height="100%"
        >
          <g transform={`translate(${OFFSET_X} ${OFFSET_Y})`}>
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
          </g>
        </svg>
      </div>
    );
  }

  const settings = effectiveSettings;
  const accent = settings.accent_color || "#8b5cf6";
  const background = settings.background_color || "#0a080e";
  const textColor = settings.text_color || "#ffffff";
  const style = settings.style;
  const backgroundOpacity = clamp(settings.background_opacity, 0, 1, 0.94);
  const accentBarSide = settings.accent_bar_side ?? "left";
  const textAlign = settings.text_align ?? "left";
  const fontFamily = fontStacks[settings.font_family ?? "inter"];
  const textEffect = settings.text_effect ?? "none";
  const textAnimation = settings.text_animation ?? "none";
  const transitionEffect = settings.transition_effect ?? "fade";
  const fontScale = clamp(settings.font_scale, 0.8, 1.25, 1);
  const animationDuration = clamp(settings.animation_speed, 0.4, 4, 1.6);
  const neonDuration = clamp(settings.neon_speed, 0.35, 4, 1.8);
  const neonIntensity = clamp(settings.neon_intensity, 0.25, 2.5, 1);
  const neonPrimary = settings.neon_primary_color || accent;
  const neonSecondary = settings.neon_secondary_color || "#22d3ee";

  const showPanel = style !== "minimal";

  const textAreaLeft = 28;
  const textAreaRight = qrEnabled ? 398 : 492;
  const textAreaCenter = (textAreaLeft + textAreaRight) / 2;

  const textAnchor =
    textAlign === "center"
      ? "middle"
      : textAlign === "right"
        ? "end"
        : "start";

  const textX =
    textAlign === "center"
      ? textAreaCenter
      : textAlign === "right"
        ? textAreaRight
        : textAreaLeft;

  const labelY = settings.show_url ? (qrEnabled ? 38 : 40) : 60;
  const urlY = settings.show_label ? (qrEnabled ? 66 : 70) : 62;

  const labelFontSize = (qrEnabled ? 9.5 : 12) * fontScale;
  const urlFontSize = (qrEnabled ? 17 : 25) * fontScale;
  const labelLetterSpacing = qrEnabled ? 0.7 : 1.2;
  const urlLetterSpacing = qrEnabled ? -0.25 : -0.5;

  const staticFilter =
    textEffect === "shadow"
      ? "url(#nhTextShadow)"
      : textEffect === "glow"
        ? "url(#nhTextGlow)"
        : undefined;

  const outlineProps =
    textEffect === "outline"
      ? {
          stroke: accent,
          strokeWidth: 1.5,
          paintOrder: "stroke" as const,
        }
      : {};

  const motionClass = `nh-text-animation-${textAnimation}`;
  const neonClass =
    textEffect === "neon" ? "nh-text-effect-neon" : "";

  const effectStyle = {
    "--nh-animation-speed": `${animationDuration}s`,
    "--nh-neon-speed": `${neonDuration}s`,
    "--nh-neon-intensity": neonIntensity,
    "--nh-neon-primary": neonPrimary,
    "--nh-neon-secondary": neonSecondary,
  } as CSSProperties;

  const wrapClass = [
    "nh-svg-wrap",
    preview ? "nh-svg-preview" : "",
    `nh-transition-${transitionEffect}`,
    `nh-phase-${phase}`,
  ]
    .filter(Boolean)
    .join(" ");

  const leftAccentPath =
    "M 18 10 Q 8 10 8 20 L 8 84 Q 8 94 18 94";

  const rightAccentPath =
    "M 502 10 Q 512 10 512 20 L 512 84 Q 512 94 502 94";

  return (
    <div className={wrapClass}>
      <svg
        className="nh-svg-overlay"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
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

          <filter
            id="nhShadow"
            x="-25%"
            y="-60%"
            width="150%"
            height="220%"
          >
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="8"
              floodColor="#000000"
              floodOpacity=".28"
            />
          </filter>

          <filter
            id="nhTextShadow"
            x="-40%"
            y="-80%"
            width="180%"
            height="260%"
          >
            <feDropShadow
              dx="2"
              dy="3"
              stdDeviation="2.5"
              floodColor="#000000"
              floodOpacity=".72"
            />
          </filter>

          <filter
            id="nhTextGlow"
            x="-70%"
            y="-140%"
            width="240%"
            height="380%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2.5"
              floodColor={accent}
              floodOpacity=".95"
            />
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor={accent}
              floodOpacity=".58"
            />
          </filter>
        </defs>

        <g transform={`translate(${OFFSET_X} ${OFFSET_Y})`}>
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

          {accentBarSide === "left" && (
            <path
              d={leftAccentPath}
              fill="none"
              stroke={accent}
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}

          {accentBarSide === "right" && (
            <path
              d={rightAccentPath}
              fill="none"
              stroke={accent}
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}

          <g
            className={`nh-text-motion ${motionClass}`}
            style={effectStyle}
          >
            <g className={`nh-text-visual ${neonClass}`}>
              {settings.show_label && (
                <text
                  x={textX}
                  y={labelY}
                  fill={textColor}
                  fillOpacity=".72"
                  fontSize={labelFontSize}
                  fontWeight="900"
                  letterSpacing={labelLetterSpacing}
                  fontFamily={fontFamily}
                  textAnchor={textAnchor}
                  filter={staticFilter}
                  {...outlineProps}
                >
                  {label.toUpperCase()}
                </text>
              )}

              {settings.show_url && (
                <text
                  x={textX}
                  y={urlY}
                  fill={textColor}
                  fontSize={urlFontSize}
                  fontWeight="800"
                  letterSpacing={urlLetterSpacing}
                  fontFamily={fontFamily}
                  textAnchor={textAnchor}
                  filter={staticFilter}
                  {...outlineProps}
                >
                  {url}
                </text>
              )}
            </g>
          </g>

          {qrEnabled && qrMatrix && (
            <g className="nh-qr-tile">
              {(() => {
                const tileX = 424;
                const tileY = 16;
                const tileSize = 72;
                const quiet = 4;
                const totalModules = qrMatrix.size + quiet * 2;
                const moduleSize = tileSize / totalModules;

                return (
                  <>
                    <rect
                      x={tileX}
                      y={tileY}
                      width={tileSize}
                      height={tileSize}
                      rx="7"
                      fill="#ffffff"
                    />

                    <g shapeRendering="crispEdges">
                      {qrMatrix.data.map((filled, moduleIndex) => {
                        if (!filled) return null;

                        const row = Math.floor(
                          moduleIndex / qrMatrix.size,
                        );
                        const col = moduleIndex % qrMatrix.size;

                        return (
                          <rect
                            key={moduleIndex}
                            x={tileX + (col + quiet) * moduleSize}
                            y={tileY + (row + quiet) * moduleSize}
                            width={moduleSize}
                            height={moduleSize}
                            fill="#000000"
                          />
                        );
                      })}
                    </g>
                  </>
                );
              })()}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
