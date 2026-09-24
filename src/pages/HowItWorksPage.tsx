import { ArrowRight, Link2, MonitorUp, PencilLine } from "lucide-react";
import { Link } from "react-router-dom";

import { SiteHeader } from "../components/SiteHeader";

export default function HowItWorksPage() {
  return (
    <main className="marketing-page">
      <SiteHeader />

      <section className="marketing-section shell">
        <div className="marketing-intro">
          <span className="eyebrow">HOW IT WORKS</span>
          <h1>Three steps. That’s it.</h1>
          <p>
            Add the destination. NupHub generates the short link. Add your OBS
            source once and manage everything from the dashboard after that.
          </p>
        </div>

        <div className="marketing-step-grid">
          <article>
            <b>01</b>
            <PencilLine size={22} />
            <strong>Add a link</strong>
            <span>Name it and paste the real destination.</span>
          </article>

          <article>
            <b>02</b>
            <Link2 size={22} />
            <strong>NupHub creates the short URL</strong>
            <span>No slug setup. No remembering another setting.</span>
          </article>

          <article>
            <b>03</b>
            <MonitorUp size={22} />
            <strong>Add one OBS browser source</strong>
            <span>Enabled links rotate automatically on stream.</span>
          </article>
        </div>

        <div className="page-cta-row">
          <Link className="button primary" to="/signup">
            Create account <ArrowRight size={17} />
          </Link>
          <Link className="button ghost" to="/obs">
            See the OBS overlay
          </Link>
        </div>
      </section>
    </main>
  );
}
