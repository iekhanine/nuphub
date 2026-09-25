import {
  CheckCircle2,
  Copy,
  ExternalLink,
  MonitorUp,
  Move,
  Plus,
  Ruler,
} from "lucide-react";

import { DashboardShell } from "../components/DashboardShell";
import { useEffect, useState } from "react";
import { getMyProfile } from "../lib/data";
import type { Profile } from "../types";

export default function ObsHowToPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    void getMyProfile().then(setProfile);
  }, []);

  const obsUrl = profile
    ? `${window.location.origin}/obs/${profile.handle}`
    : "";
  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading compact-heading">
        <div>
          <span className="kicker">OBS HOW-TO</span>
          <h1>Add NupHub to OBS.</h1>
          <p className="dash-subtitle">
            One Browser Source. 520 × 104. Put it wherever you want.
          </p>
        </div>
      </div>

      <div className="obs-howto-grid">
        <section className="panel obs-howto-main">
          <div className="panel-head">
            <div>
              <span className="panel-label">YOUR BROWSER SOURCE</span>
              <strong>Use this URL in OBS</strong>
            </div>
            <MonitorUp size={17} />
          </div>

          <div className="obs-howto-url">
            <code>{obsUrl || "Loading…"}</code>
            <button
              type="button"
              className="icon-button"
              disabled={!obsUrl}
              onClick={() => void navigator.clipboard.writeText(obsUrl)}
              title="Copy URL"
            >
              <Copy size={17} />
            </button>
            {obsUrl && (
              <a
                className="icon-button"
                href={obsUrl}
                target="_blank"
                rel="noreferrer"
                title="Open browser source"
              >
                <ExternalLink size={17} />
              </a>
            )}
          </div>

          <div className="obs-howto-steps">
            <div className="obs-step">
              <span className="obs-step-number">1</span>
              <div>
                <strong>Add a Browser Source</strong>
                <p>
                  In OBS, click the <b>+</b> under Sources and choose
                  <b> Browser</b>.
                </p>
              </div>
              <Plus size={18} />
            </div>

            <div className="obs-step">
              <span className="obs-step-number">2</span>
              <div>
                <strong>Paste your NupHub URL</strong>
                <p>
                  Paste the browser-source URL above into the URL field.
                </p>
              </div>
              <Copy size={18} />
            </div>

            <div className="obs-step">
              <span className="obs-step-number">3</span>
              <div>
                <strong>Set the source size</strong>
                <p>
                  Width <b>520</b> · Height <b>104</b>
                </p>
              </div>
              <Ruler size={18} />
            </div>

            <div className="obs-step">
              <span className="obs-step-number">4</span>
              <div>
                <strong>Place it anywhere</strong>
                <p>
                  Drag the Browser Source wherever it looks best in your scene.
                  NupHub does not control the OBS position.
                </p>
              </div>
              <Move size={18} />
            </div>

            <div className="obs-step complete">
              <span className="obs-step-number">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <strong>Done.</strong>
                <p>
                  Changes saved in NupHub will appear in the same Browser
                  Source. You do not need to recreate it.
                </p>
              </div>
            </div>
          </div>



        </section>

        <aside className="panel obs-howto-reference">
          <div className="panel-head">
            <div>
              <span className="panel-label">QUICK REFERENCE</span>
              <strong>Recommended OBS settings</strong>
            </div>
          </div>

          <dl className="obs-reference-list">
            <div>
              <dt>Width</dt>
              <dd>520 px</dd>
            </div>
            <div>
              <dt>Height</dt>
              <dd>104 px</dd>
            </div>
            <div>
              <dt>Custom CSS</dt>
              <dd>None required</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>Wherever you want</dd>
            </div>
            <div>
              <dt>Background</dt>
              <dd>Transparent</dd>
            </div>
          </dl>

          <div className="obs-howto-note">
            <strong>Tip</strong>
            <p>
              Keep the source at its native 520 × 104 size for the sharpest
              text. If you need it larger or smaller, resize the source in OBS
              after adding it.
            </p>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
