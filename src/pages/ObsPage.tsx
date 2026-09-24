import { ArrowRight, Eye, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

import { SiteHeader } from "../components/SiteHeader";

export default function ObsPage() {
  return (
    <main className="marketing-page">
      <SiteHeader />

      <section className="marketing-section shell obs-info-layout">
        <div className="marketing-intro">
          <span className="eyebrow">OBS OVERLAY</span>
          <h1>One source. Tiny footprint.</h1>
          <p>
            Add your personal NupHub browser source to OBS once. The SVG overlay
            updates from your dashboard without rebuilding the scene.
          </p>

          <div className="page-cta-row">
            <Link className="button primary" to="/signup">
              Create account <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="obs-marketing-demo">
          <div className="scene-grid" />
          <span className="live-badge">LIVE</span>
          <div className="obs-marketing-pill">
            <span>JOIN THE DISCORD</span>
            <strong>nuphub.com/ivanwigglyotter</strong>
          </div>
        </div>

        <div className="obs-option-grid">
          <article>
            <SlidersHorizontal size={21} />
            <strong>Adjust the overlay</strong>
            <span>Transparency, accent color, bar position, alignment, and timing.</span>
          </article>
          <article>
            <Eye size={21} />
            <strong>Keep the text sharp</strong>
            <span>The visible overlay is rendered as SVG on a transparent OBS page.</span>
          </article>
        </div>
      </section>
    </main>
  );
}
