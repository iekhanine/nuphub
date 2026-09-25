import type {
  CSSProperties,
} from "react";

import type {
  OverlayTextEffect,
} from "../types";

import "../styles/text-effects.css";

export type CreatorCssTextEffect = Extract<
  OverlayTextEffect,
  | "glitch"
  | "typewriter"
  | "scanner"
  | "echo"
  | "pop"
  | "spotlight"
  | "vapor"
  | "negative"
>;

export const creatorCssTextEffects: Array<{
  id: CreatorCssTextEffect;
  label: string;
}> = [
  { id: "glitch", label: "Glitch" },
  { id: "typewriter", label: "Typewriter" },
  { id: "scanner", label: "Scanner" },
  { id: "echo", label: "Echo" },
  { id: "pop", label: "Pop" },
  { id: "spotlight", label: "Spotlight" },
  { id: "vapor", label: "Vapor" },
  { id: "negative", label: "Negative" },
];

export function isCreatorCssTextEffect(
  effect: OverlayTextEffect,
): effect is CreatorCssTextEffect {
  return creatorCssTextEffects.some(
    (item) => item.id === effect,
  );
}

type Props = {
  effect: CreatorCssTextEffect;
  text: string;
  className?: string;
  style?: CSSProperties;
};

function safeText(value: string) {
  return value || " ";
}

export function CreatorTextEffect({
  effect,
  text,
  className = "",
  style,
}: Props) {
  const value = safeText(text);

  const rootClass = [
    "nh-fx-root",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedInk =
    typeof style?.color === "string"
      ? style.color
      : "#ffffff";

  const rootStyle = {
    ...style,
    "--ink": resolvedInk,
  } as CSSProperties;

  if (effect === "glitch") {
    return (
      <div className={rootClass} style={rootStyle}>
        <div
          className="fx-glitch"
          data-text={value}
        >
          {value}
        </div>
      </div>
    );
  }

  if (effect === "typewriter") {
    const typeStyle = {
      "--fx-chars": `${Math.max(value.length, 1)}ch`,
      "--fx-steps": Math.max(value.length, 1),
    } as CSSProperties;

    return (
      <div className={rootClass} style={rootStyle}>
        <div
          className="fx-typewriter"
          style={typeStyle}
        >
          {value}
        </div>
      </div>
    );
  }

  if (effect === "scanner") {
    return (
      <div className={rootClass} style={rootStyle}>
        <div className="fx-scanner">
          {value}
        </div>
      </div>
    );
  }

  if (effect === "echo") {
    return (
      <div className={rootClass} style={rootStyle}>
        <div
          className="fx-echo"
          data-text={value}
        >
          {value}
        </div>
      </div>
    );
  }

  if (effect === "pop") {
    return (
      <div className={rootClass} style={rootStyle}>
        <div
          className="fx-pop"
          role="img"
          aria-label={value}
        >
          {Array.from(value).map((character, index) => (
            <b
              aria-hidden="true"
              style={
                {
                  "--i": index,
                } as CSSProperties
              }
              key={`${character}-${index}`}
            >
              {character === " " ? "\u00A0" : character}
            </b>
          ))}
        </div>
      </div>
    );
  }

  if (effect === "spotlight") {
    return (
      <div className={rootClass} style={rootStyle}>
        <div className="fx-spotlight">
          {value}
        </div>
      </div>
    );
  }

  if (effect === "negative") {
    return (
      <div className={rootClass} style={rootStyle}>
        <div className="fx-negative">
          {value}
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass} style={rootStyle}>
      <div
        className="fx-vapor"
        data-text={value}
      >
        {value}
      </div>
    </div>
  );
}
