import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

import type { PublicAllLinksOverlay } from "../types";
import "../styles/obs-all-links.css";

type Props = {
  overlay: PublicAllLinksOverlay;
};

type QrMatrix = {
  size: number;
  data: boolean[];
};

function VectorQr({
  slug,
}: {
  slug: string;
}) {
  const [matrix, setMatrix] = useState<QrMatrix | null>(null);

  useEffect(() => {
    try {
      const qr = QRCode.create(`https://nuphub.com/${slug}`, {
        errorCorrectionLevel: "M",
      });

      setMatrix({
        size: qr.modules.size,
        data: Array.from(qr.modules.data, Boolean),
      });
    } catch {
      setMatrix(null);
    }
  }, [slug]);

  if (!matrix) return null;

  const quiet = 4;
  const total = matrix.size + quiet * 2;
  const module = 100 / total;

  return (
    <svg
      className="nh-all-qr"
      viewBox="0 0 100 100"
      aria-label={`QR code for nuphub.com/${slug}`}
    >
      <rect x="0" y="0" width="100" height="100" rx="8" fill="#fff" />
      <g shapeRendering="crispEdges">
        {matrix.data.map((filled, index) => {
          if (!filled) return null;

          const row = Math.floor(index / matrix.size);
          const col = index % matrix.size;

          return (
            <rect
              key={index}
              x={(col + quiet) * module}
              y={(row + quiet) * module}
              width={module}
              height={module}
              fill="#000"
            />
          );
        })}
      </g>
    </svg>
  );
}

export function AllLinksOverlayRenderer({
  overlay,
}: Props) {
  const count = overlay.links.length;

  const densityClass = useMemo(() => {
    if (count > 10) return "dense";
    if (count > 6) return "compact";
    return "comfortable";
  }, [count]);

  return (
    <section
      className={`nh-all-board ${densityClass}`}
      style={{
        "--nh-all-accent": overlay.accent_color,
        "--nh-all-background": overlay.background_color,
        "--nh-all-text": overlay.text_color,
      } as React.CSSProperties}
    >
      <header className="nh-all-header">
        <span>FIND ME ONLINE</span>
        <strong>{overlay.display_name || overlay.handle}</strong>
      </header>

      <div className="nh-all-grid">
        {overlay.links.map((link) => (
          <article
            className={`nh-all-link${link.qr_enabled ? " with-qr" : ""}`}
            key={link.slug}
          >
            <div className="nh-all-link-copy">
              <strong>{link.label}</strong>
              <span>nuphub.com/{link.slug}</span>
            </div>

            {link.qr_enabled && <VectorQr slug={link.slug} />}
          </article>
        ))}
      </div>
    </section>
  );
}
