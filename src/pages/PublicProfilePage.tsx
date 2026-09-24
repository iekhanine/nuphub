import { useEffect, useState } from "react";
import { ExternalLink, RadioTower } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Brand } from "../components/Brand";
import { getPublicStreamer } from "../lib/data";
import type { PublicStreamer } from "../types";

export default function PublicProfilePage() {
  const { handle = "" } = useParams();
  const [streamer, setStreamer] = useState<PublicStreamer | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getPublicStreamer(handle)
      .then(setStreamer)
      .catch(() => setStreamer(null));
  }, [handle]);

  if (streamer === undefined) {
    return (
      <main className="center-state">
        <div className="loader" />
      </main>
    );
  }

  if (!streamer) {
    return (
      <main className="center-state">
        <strong>Streamer not found.</strong>
        <Link to="/">Go to NupHub</Link>
      </main>
    );
  }

  return (
    <main className="public-profile-page">
      <header className="public-profile-top">
        <Brand />
      </header>

      <section className="public-profile-card">
        <div className="public-avatar">
          {streamer.handle.slice(0, 2).toUpperCase()}
        </div>
        <span className="eyebrow">
          <RadioTower size={14} />
          NUPHUB STREAMER
        </span>
        <h1>{streamer.display_name || streamer.handle}</h1>
        <span className="public-handle">@{streamer.handle}</span>

        <div className="public-link-list">
          {streamer.links.map((item) => (
            <a href={`/${item.slug}`} key={item.slug}>
              <span>{item.label}</span>
              <ExternalLink size={16} />
            </a>
          ))}
        </div>

        {streamer.links.length === 0 && (
          <div className="empty-panel">No public links yet.</div>
        )}
      </section>
    </main>
  );
}
