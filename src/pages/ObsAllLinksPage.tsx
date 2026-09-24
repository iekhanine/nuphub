import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AllLinksOverlayRenderer } from "../components/AllLinksOverlayRenderer";
import { getPublicAllLinksOverlay } from "../lib/data";
import type { PublicAllLinksOverlay } from "../types";
import "../styles/obs-all-links.css";

export default function ObsAllLinksPage() {
  const { handle = "" } = useParams();
  const [overlay, setOverlay] =
    useState<PublicAllLinksOverlay | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("nh-obs-all-links-route");
    document.body.classList.add("nh-obs-all-links-route");

    return () => {
      document.documentElement.classList.remove("nh-obs-all-links-route");
      document.body.classList.remove("nh-obs-all-links-route");
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const value = await getPublicAllLinksOverlay(handle);
        if (active) setOverlay(value);
      } catch {
        if (active) setOverlay(null);
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
    <main className="nh-all-page">
      {overlay && <AllLinksOverlayRenderer overlay={overlay} />}
    </main>
  );
}
