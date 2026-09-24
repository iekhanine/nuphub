import { ArrowRight, Link2, ListRestart, MousePointer2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { SiteHeader } from "../components/SiteHeader";

const features = [
  {
    icon: Link2,
    title: "Generated short links",
    copy: "NupHub creates a memorable URL automatically when you add a link.",
  },
  {
    icon: MousePointer2,
    title: "Change the destination",
    copy: "Point an existing short URL somewhere new without changing what viewers type.",
  },
  {
    icon: ListRestart,
    title: "Control rotation",
    copy: "Enable, disable, and reorder the links that appear in your OBS overlay.",
  },
  {
    icon: UserRound,
    title: "Public streamer page",
    copy: "Your profile also gets one page with your currently enabled links.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="marketing-page">
      <SiteHeader />

      <section className="marketing-section shell">
        <div className="marketing-intro">
          <span className="eyebrow">FEATURES</span>
          <h1>The useful stuff.</h1>
          <p>
            NupHub is intentionally small: manage the links, make them easy to
            type, and put them on stream without rebuilding your OBS scene.
          </p>
        </div>

        <div className="feature-page-grid">
          {features.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <Icon size={22} />
              <strong>{title}</strong>
              <span>{copy}</span>
            </article>
          ))}
        </div>

        <div className="page-cta-row">
          <Link className="button primary" to="/signup">
            Create account <ArrowRight size={17} />
          </Link>
          <Link className="button ghost" to="/how-it-works">
            How it works
          </Link>
        </div>
      </section>
    </main>
  );
}
