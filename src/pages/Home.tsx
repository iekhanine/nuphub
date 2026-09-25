import {
  ArrowRight,
  LayoutDashboard,
  Link2,
  MonitorUp,
  MousePointer2,
  RadioTower,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { SiteHeader } from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";

const tools = [
  {
    icon: Link2,
    title: "Short Links",
    copy: "Generated for you",
    note: "Easy to say. Easy to type.",
    to: "/features",
  },
  {
    icon: MonitorUp,
    title: "OBS Overlay",
    copy: "One browser source",
    note: "Your links fade in on stream.",
    to: "/obs",
  },
  {
    icon: WandSparkles,
    title: "Overlay Builder",
    copy: "Change the look",
    note: "Transparency, alignment, bar, style.",
    to: "/obs",
  },
  {
    icon: MousePointer2,
    title: "Link Manager",
    copy: "Change destinations",
    note: "Keep the short URL the same.",
    to: "/features",
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="marketing-page marketing-home">
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
            Short URLs viewers can type. 
            <br /><br />
            OBS overlay that show them live.
          </p>

          <div className="hero-actions">
            {!loading && user ? (
              <Link className="button primary" to="/dashboard">
                <LayoutDashboard size={17} />
                Open dashboard
              </Link>
            ) : !loading ? (
              <>
                <Link className="button primary" to="/signup">
                  Create account <ArrowRight size={17} />
                </Link>
                <Link className="button ghost" to="/login">
                  Sign in
                </Link>
              </>
            ) : null}
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
                <strong>nuphub.com/ivanwigglyotter</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tool-strip shell" aria-label="Streamer tools">
        {tools.map(({ icon: Icon, title, copy, note, to }) => (
          <Link className="tool-card tool-card-link" to={to} key={title}>
            <Icon size={20} />
            <div>
              <strong>{title}</strong>
              <span>{copy}</span>
              <small>{note}</small>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
