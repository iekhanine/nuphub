import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import QRCode from "qrcode";

import { Brand } from "./Brand";
import type { PublicAllLinksOverlay } from "../types";
import "../styles/obs-all-links.css";

type Props = {
  overlay: PublicAllLinksOverlay;
};

type QrMatrix = {
  size: number;
  data: boolean[];
};

function VectorQr({ slug }: { slug: string }) {
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
      className="nh-all-profile-qr"
      viewBox="0 0 100 100"
      aria-label={`QR code for nuphub.com/${slug}`}
    >
      <rect x="0" y="0" width="100" height="100" rx="8" fill="#ffffff" />

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
              fill="#000000"
            />
          );
        })}
      </g>
    </svg>
  );
}

export function AllLinksOverlayRenderer({ overlay }: Props) {
  return (
    <main className="public-profile-page nh-all-profile-page">
      <header className="public-profile-top">
        <Brand />
      </header>

      <section className="public-profile-card">
        <div className="public-avatar">
          {overlay.badge_text?.trim() ||
            overlay.handle.slice(0, 2).toUpperCase()}
        </div>

        <h1>{overlay.display_name || overlay.handle}</h1>
        <span className="public-handle">@{overlay.handle}</span>

        <div className="public-link-list nh-all-profile-link-list">
          {overlay.links.map((link) => {
            const publicUrl = `https://nuphub.com/${link.slug}`;

            return (
              <a
                href={publicUrl}
                key={link.slug}
                target="_blank"
                rel="noreferrer"
                className={link.qr_enabled ? "with-qr" : ""}
              >
                <div className="nh-all-profile-link-copy">
                  <span className="nh-all-profile-label">
                    {link.label}
                  </span>

                  <span className="nh-all-profile-url">
                    nuphub.com/{link.slug}
                  </span>
                </div>

                {link.qr_enabled ? (
                  <VectorQr slug={link.slug} />
                ) : (
                  <ExternalLink
                    className="nh-all-profile-external"
                    size={16}
                  />
                )}
              </a>
            );
          })}
        </div>

        {overlay.links.length === 0 && (
          <div className="empty-panel">No public links yet.</div>
        )}
      </section>
    </main>
  );
}
