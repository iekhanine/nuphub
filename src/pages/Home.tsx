import {
  ArrowRight,
  ExternalLink,
  Link2,
  MonitorUp,
  MousePointer2,
  RadioTower,
  Sparkles,
  Store,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SiteHeader } from "../components/SiteHeader";

const tools = [
  {
    icon: Link2,
    title: "Short Links",
    copy: "nuphub.com/your-link",
    note: "Easy to say. Easy to type.",
  },
  {
    icon: MonitorUp,
    title: "OBS Link Rotator",
    copy: "One browser source",
    note: "Your links fade in on stream.",
  },
  {
    icon: WandSparkles,
    title: "Overlay Builder",
    copy: "Change the look",
    note: "Position, timing, color, style.",
  },
  {
    icon: MousePointer2,
    title: "Link Manager",
    copy: "Change destinations",
    note: "Keep the short URL the same.",
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">
            <RadioTower size={15} />
            BUILT FOR LIVE STREAMERS
          </span>

          <h1>
            Put your links
            <br />
            <span>on stream.</span>
          </h1>

          <p>
            Short URLs your viewers can type. OBS overlays that show them live.
          </p>

          <div className="hero-actions">
            <Link className="button primary" to="/signup">
              Create account <ArrowRight size={17} />
            </Link>
            <Link className="button ghost" to="/login">
              Sign in
            </Link>
          </div>

          <div className="hero-tags">
            <span>Discord</span>
            <span>Merch</span>
            <span>YouTube</span>
            <span>Socials</span>
            <span>Sponsors</span>
            <span>Anything</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="stream-window">
            <div className="stream-top">
              <span className="dot red" />
              <span className="dot" />
              <span className="dot" />
              <em>OBS PREVIEW</em>
            </div>

            <div className="stream-scene">
              <div className="scene-grid" />
              <span className="live-badge">LIVE</span>
              <div className="home-overlay-preview">
                <span>JOIN THE DISCORD</span>
                <strong>nuphub.com/yourname-discord</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tool-strip shell" aria-label="Streamer tools">
        {tools.map(({ icon: Icon, title, copy, note }) => (
          <article className="tool-card" key={title}>
            <Icon size={20} />
            <div>
              <strong>{title}</strong>
              <span>{copy}</span>
              <small>{note}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="how-it-works shell">
        <div className="section-title">
          <span>HOW IT WORKS</span>
          <h2>Set it once. Update it whenever.</h2>
        </div>

        <div className="steps">
          <div>
            <b>01</b>
            <strong>Add a link</strong>
            <span>Discord, merch, sponsor, whatever.</span>
          </div>
          <div>
            <b>02</b>
            <strong>Pick the short URL</strong>
            <span>nuphub.com/yourname-discord</span>
          </div>
          <div>
            <b>03</b>
            <strong>Add one OBS source</strong>
            <span>Your active links rotate automatically.</span>
          </div>
        </div>
      </section>

      <section className="store-callout shell">
        <div className="store-copy">
          <span className="eyebrow">
            <Sparkles size={15} />
            MORE FOR TWITCH
          </span>
          <h2>Twitch tools too.</h2>
          <p>Our Twitch app is in the OneTime Labs store.</p>
        </div>

        <a
          className="store-card"
          href="https://store.onetimelabs.net"
          target="_blank"
          rel="noreferrer"
        >
          <Store size={24} />
          <div>
            <span>ONETIME LABS STORE</span>
            <strong>Twitch App</strong>
            <small>
              View product <ExternalLink size={13} />
            </small>
          </div>
        </a>
      </section>

      <section className="final-cta shell">
        <div>
          <span>READY WHEN YOU ARE</span>
          <h2>Make the link easy to find.</h2>
        </div>
        <Link className="button primary" to="/signup">
          Create account <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
