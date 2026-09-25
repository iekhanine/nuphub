import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import QRCode from "qrcode";

import {
  CreatorTextEffect,
  isCreatorCssTextEffect,
} from "./CreatorTextEffect";

import type {
  OverlayFontFamily,
  PublicStreamer,
} from "../types";
import "../styles/obs-svg.css";

type Props = {
  streamer: PublicStreamer;
  preview?: boolean;
  renderScale?: 1 | 2 | 3;
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

export function OverlayRenderer({
  streamer,
  preview = false,
  renderScale = 1,
}: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [qrMatrix, setQrMatrix] = useState<{
    size: number;
    data: boolean[];
  } | null>(null);

  const effectiveRenderScale = preview ? 1 : renderScale;
  const renderWidth = VIEW_WIDTH * effectiveRenderScale;
  const renderHeight = VIEW_HEIGHT * effectiveRenderScale;

  const renderSizeStyle = {
    "--nh-render-width": `${renderWidth}px`,
    "--nh-render-height": `${renderHeight}px`,
  } as CSSProperties;

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

  const label = useMemo(() => {
    const source =
      effectiveSettings.custom_label_text?.trim() ||
      link?.label ||
      "";

    return truncate(source, qrEnabled ? 18 : 24);
  }, [
    effectiveSettings.custom_label_text,
    link?.label,
    qrEnabled,
  ]);

  const url = useMemo(() => {
    const source =
      effectiveSettings.custom_url_text?.trim() ||
      (link ? `nuphub.com/${link.slug}` : "");

    return truncate(source, qrEnabled ? 27 : 38);
  }, [
    effectiveSettings.custom_url_text,
    link,
    qrEnabled,
  ]);

  if (!link) {
    if (!preview) return null;

    return (
      <div
        className="nh-svg-wrap nh-svg-preview"
        style={renderSizeStyle}
      >
        <svg
          className="nh-svg-overlay"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          width={renderWidth}
          height={renderHeight}
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
  const glassLeft = settings.glass_left_color || background || "#17101f";
  const glassRight = settings.glass_right_color || accent || "#3b1768";
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
  const textAreaCenter = Math.round(
    (textAreaLeft + textAreaRight) / 2,
  );

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

  const labelFontSize = (qrEnabled ? 10 : 12) * fontScale;
  const urlFontSize = (qrEnabled ? 18 : 25) * fontScale;
  const labelLetterSpacing = qrEnabled ? 1 : 1;
  const urlLetterSpacing = qrEnabled ? 0 : 0;

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

  const creatorCssEffect =
    isCreatorCssTextEffect(textEffect)
      ? textEffect
      : null;

  const resolvedMotionClass = motionClass;

  const creatorTextStyle = {
    color: textColor,
  } as CSSProperties;

  const creatorLineClass =
    textAlign === "center"
      ? "nh-fx-line nh-fx-line-center"
      : textAlign === "right"
        ? "nh-fx-line nh-fx-line-right"
        : "nh-fx-line nh-fx-line-left";

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
    <div className={wrapClass} style={renderSizeStyle}>
      <svg
        className="nh-svg-overlay"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        width={renderWidth}
        height={renderHeight}
        role="img"
        aria-label={`${label} ${url}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <defs>
          <linearGradient id="nhGlassFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={glassLeft} stopOpacity=".96" />
            <stop offset="48%" stopColor={background} stopOpacity=".90" />
            <stop offset="100%" stopColor={glassRight} stopOpacity=".96" />
          </linearGradient>
          <linearGradient id="nhGlassHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".25" />
            <stop offset="36%" stopColor="#ffffff" stopOpacity=".08" />
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
                fill={style === "glass" ? "url(#nhGlassFade)" : background}
                fillOpacity={
                  style === "glass"
                    ? Math.min(0.96, Math.max(0.72, backgroundOpacity))
                    : backgroundOpacity
                }
                stroke={
                  style === "glass"
                    ? "rgba(255,255,255,.24)"
                    : "rgba(255,255,255,.13)"
                }
              />

              {style === "glass" && (
                <>
                  <rect x="9" y="11" width="502" height="82" rx="9" fill="url(#nhGlassHighlight)" opacity=".72" />
                  <path d="M 22 14 H 498" stroke="rgba(255,255,255,.30)" strokeWidth="1" strokeLinecap="round" />
                  <path d="M 22 90 H 498" stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeLinecap="round" />
                </>
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
            className={`nh-text-motion ${resolvedMotionClass}`}
            style={effectStyle}
          >
            {creatorCssEffect ? (
              <>
                {settings.show_label && (
                  <foreignObject
                    x={textAreaLeft}
                    y={settings.show_url ? 8 : 25}
                    width={textAreaRight - textAreaLeft}
                    height={settings.show_url ? 38 : 58}
                    overflow="visible"
                  >
                    <div
                      className={creatorLineClass}
                    >
                      <CreatorTextEffect
                        effect={creatorCssEffect}
                        text={label.toUpperCase()}
                        style={creatorTextStyle}
                      />
                    </div>
                  </foreignObject>
                )}

                {settings.show_url && (
                  <foreignObject
                    x={textAreaLeft}
                    y={settings.show_label ? 43 : 24}
                    width={textAreaRight - textAreaLeft}
                    height={settings.show_label ? 47 : 60}
                    overflow="visible"
                  >
                    <div
                      className={creatorLineClass}
                    >
                      <CreatorTextEffect
                        effect={creatorCssEffect}
                        text={url}
                        style={creatorTextStyle}
                      />
                    </div>
                  </foreignObject>
                )}
              </>
            ) : (
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
            )}
          </g>

          {qrEnabled && qrMatrix && (
            <g className="nh-qr-tile">
              {(() => {
                /*
                 * Integer-only QR geometry.
                 *
                 * Never divide the fixed tile by module count. That produces
                 * fractional module widths which Chromium/OBS antialiases.
                 *
                 * Instead, choose an integer module size and derive the QR
                 * canvas from that. Every black square lands exactly on the
                 * SVG pixel grid.
                 */
                const quietModules = 4;
                const modulePx = 2;
                const qrModules = qrMatrix.size + quietModules * 2;
                const qrSize = qrModules * modulePx;

                const tileX = 424;
                const tileY = 14;

                return (
                  <>
                    <rect
                      x={tileX}
                      y={tileY}
                      width={qrSize}
                      height={qrSize}
                      rx="6"
                      fill="#ffffff"
                      shapeRendering="crispEdges"
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
                            x={
                              tileX +
                              (col + quietModules) * modulePx
                            }
                            y={
                              tileY +
                              (row + quietModules) * modulePx
                            }
                            width={modulePx}
                            height={modulePx}
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
