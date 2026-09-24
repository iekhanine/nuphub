import { useEffect, useState } from "react";

const demoLinks = [
  { label: "JOIN THE DISCORD", url: "nuphub.com/yourname-discord" },
  { label: "MERCH + GEAR", url: "nuphub.com/yourname-shop" },
  { label: "LATEST VIDEO", url: "nuphub.com/yourname-video" },
];

export function RotatingOverlay({ compact = false }: { compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let fadeTimer: number | undefined;

    const timer = window.setInterval(() => {
      setVisible(false);
      fadeTimer = window.setTimeout(() => {
        setIndex((value) => (value + 1) % demoLinks.length);
        setVisible(true);
      }, 550);
    }, 4200);

    return () => {
      window.clearInterval(timer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, []);

  const item = demoLinks[index];

  return (
    <div className={`overlay-preview${compact ? " compact" : ""}`}>
      <div className={`overlay-pill${visible ? "" : " fading"}`}>
        <span>{item.label}</span>
        <strong>{item.url}</strong>
      </div>
    </div>
  );
}
