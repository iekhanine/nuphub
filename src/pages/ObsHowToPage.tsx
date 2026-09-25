import {
  CheckCircle2,
  Copy,
  ExternalLink,
  MonitorUp,
  Move,
  Plus,
  Ruler,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import { DashboardShell } from "../components/DashboardShell";
import { getMyProfile } from "../lib/data";
import type { Profile } from "../types";

const qualityRows = [
  {
    name: "Standard 1x",
    size: "560 × 144",
    note: "Lowest render cost",
  },
  {
    name: "High 2x",
    size: "1120 × 288",
    note: "Good balance",
  },
  {
    name: "Ultra 3x",
    size: "1680 × 432",
    note: "Best resizing flexibility",
  },
];

export default function ObsHowToPage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  useEffect(() => {
    void getMyProfile().then(setProfile);
  }, []);

  const obsUrl = profile
    ? `${window.location.origin}/obs/${profile.handle}?scale=3`
    : "";

  return (
    <DashboardShell
      handle={profile?.handle}
    >
      <div className="dash-heading compact-heading">
        <div>
          <span className="kicker">
            OBS HOW-TO
          </span>

          <h1>
            Add NupHub to OBS.
          </h1>

          <p className="dash-subtitle">
            Ultra 3x is recommended if you
            want to freely resize the overlay
            in OBS and keep the text crisp.
          </p>
        </div>
      </div>

      <div className="obs-howto-grid">
        <section className="panel obs-howto-main">
          <div className="panel-head">
            <div>
              <span className="panel-label">
                YOUR BROWSER SOURCE
              </span>

              <strong>
                Ultra 3x URL
              </strong>
            </div>

            <MonitorUp size={17} />
          </div>

          <div className="obs-howto-url">
            <code>
              {obsUrl || "Loading…"}
            </code>

            <button
              type="button"
              className="icon-button"
              disabled={!obsUrl}
              onClick={() =>
                void navigator.clipboard.writeText(
                  obsUrl,
                )
              }
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
              <span className="obs-step-number">
                1
              </span>

              <div>
                <strong>
                  Add a Browser Source
                </strong>

                <p>
                  In OBS, click the <b>+</b>{" "}
                  under Sources and choose{" "}
                  <b>Browser</b>.
                </p>
              </div>

              <Plus size={18} />
            </div>

            <div className="obs-step">
              <span className="obs-step-number">
                2
              </span>

              <div>
                <strong>
                  Paste the 3x NupHub URL
                </strong>

                <p>
                  Paste the browser-source
                  URL above. The{" "}
                  <b>?scale=3</b> parameter
                  tells NupHub to render at
                  Ultra quality.
                </p>
              </div>

              <Copy size={18} />
            </div>

            <div className="obs-step">
              <span className="obs-step-number">
                3
              </span>

              <div>
                <strong>
                  Set the Browser Source size
                </strong>

                <p>
                  Width <b>1680</b> · Height{" "}
                  <b>432</b>
                </p>
              </div>

              <Ruler size={18} />
            </div>

            <div className="obs-step">
              <span className="obs-step-number">
                4
              </span>

              <div>
                <strong>
                  Resize it however you want
                </strong>

                <p>
                  Ultra 3x gives OBS a much
                  larger rendered texture, so
                  you can resize the overlay
                  much more freely while
                  keeping the text and QR
                  detail sharp.
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
                  Changes saved in NupHub
                  update the same Browser
                  Source automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="panel obs-howto-reference">
          <div className="panel-head">
            <div>
              <span className="panel-label">
                RENDER QUALITY
              </span>

              <strong>
                Pick the resolution that fits
                your setup.
              </strong>
            </div>
          </div>

          <div className="obs-quality-reference">
            {qualityRows.map((row) => (
              <div
                className={`obs-quality-row${
                  row.name === "Ultra 3x"
                    ? " recommended"
                    : ""
                }`}
                key={row.name}
              >
                <div>
                  <strong>{row.name}</strong>

                  {row.name === "Ultra 3x" && (
                    <span>
                      <Sparkles size={11} />
                      Recommended
                    </span>
                  )}
                </div>

                <code>{row.size}</code>
                <small>{row.note}</small>
              </div>
            ))}
          </div>

          <div className="obs-howto-note">
            <strong>
              Why 3x looks better
            </strong>

            <p>
              OBS turns the Browser Source
              into a texture before it scales
              it in your scene. Ultra 3x
              starts with nine times the pixel
              area of the 1x source, giving
              OBS much more detail to work
              with while resizing.
            </p>
          </div>

          <div className="obs-howto-note">
            <strong>
              Want less render overhead?
            </strong>

            <p>
              High 2x at 1120 × 288 is the
              balanced option. Standard 1x is
              best when you plan to keep the
              overlay near its native size.
            </p>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
