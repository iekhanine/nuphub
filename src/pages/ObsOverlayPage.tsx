import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";

import { OverlayRenderer } from "../components/OverlayRenderer";
import { getPublicStreamer } from "../lib/data";
import type { PublicStreamer } from "../types";
import "../styles/obs-route.css";

function resolveRenderScale(): 1 | 2 | 3 {
  const value = new URLSearchParams(window.location.search).get("scale");

  if (value === "1") return 1;
  if (value === "3") return 3;

  return 2;
}

export default function ObsOverlayPage() {
  const { handle = "" } = useParams();
  const [streamer, setStreamer] = useState<PublicStreamer | null>(null);

  const renderScale = resolveRenderScale();
  const renderWidth = 560 * renderScale;
  const renderHeight = 144 * renderScale;

  const renderSizeStyle = {
    "--nh-render-width": `${renderWidth}px`,
    "--nh-render-height": `${renderHeight}px`,
  } as CSSProperties;

  useEffect(() => {
    document.documentElement.classList.add("nh-obs-transparent-route");
    document.body.classList.add("nh-obs-transparent-route");

    return () => {
      document.documentElement.classList.remove("nh-obs-transparent-route");
      document.body.classList.remove("nh-obs-transparent-route");
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const value = await getPublicStreamer(handle);
        if (active) setStreamer(value);
      } catch {
        if (active) setStreamer(null);
      }
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [handle]);

  return (
    <main className="nh-svg-page" style={renderSizeStyle}>
      {streamer && (
        <OverlayRenderer
          streamer={streamer}
          renderScale={renderScale}
        />
      )}
    </main>
  );
}
