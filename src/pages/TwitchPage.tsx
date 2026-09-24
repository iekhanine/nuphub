import { ExternalLink, MousePointerClick, Store } from "lucide-react";

import { SiteHeader } from "../components/SiteHeader";

export default function TwitchPage() {
  return (
    <main className="marketing-page">
      <SiteHeader />

      <section className="marketing-section shell twitch-page-layout">
        <div className="marketing-intro">
          <span className="eyebrow">TWITCH</span>
          <h1>Interactive comes next.</h1>
          <p>
            OBS can show a link, but viewers can’t click pixels in the video.
            The Twitch side of NupHub is where those same links can become
            interactive overlays for viewers.
          </p>
        </div>

        <div className="twitch-card-grid">
          <article>
            <MousePointerClick size={23} />
            <strong>Clickable viewer layer</strong>
            <span>
              The Twitch extension version can use the same NupHub-managed links
              as the OBS overlay.
            </span>
          </article>

          <a
            className="twitch-store-card"
            href="https://store.onetimelabs.net"
            target="_blank"
            rel="noreferrer"
          >
            <Store size={23} />
            <div>
              <strong>OneTime Labs Store</strong>
              <span>View Twitch tools and apps.</span>
            </div>
            <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}
