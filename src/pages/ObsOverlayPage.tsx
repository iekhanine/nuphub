import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { OverlayRenderer } from "../components/OverlayRenderer";
import { getPublicStreamer } from "../lib/data";
import type { PublicStreamer } from "../types";
import "../styles/obs-route.css";

export default function ObsOverlayPage() {
  const { handle = "" } = useParams();
  const [streamer, setStreamer] = useState<PublicStreamer | null>(null);

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
    <main className="nh-svg-page">
      {streamer && <OverlayRenderer streamer={streamer} />}
    </main>
  );
}
