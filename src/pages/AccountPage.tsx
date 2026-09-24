import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";

import { DashboardShell } from "../components/DashboardShell";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateProfile } from "../lib/data";
import type { Profile } from "../types";

export default function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getMyProfile().then((value) => {
      setProfile(value);
      setDisplayName(value?.display_name ?? "");
    });
  }, []);

  async function save() {
    const updated = await updateProfile({
      display_name: displayName.trim() || null,
    });

    setProfile(updated);
    setMessage("Saved.");

    window.setTimeout(() => setMessage(""), 1500);
  }

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading">
        <div>
          <span className="kicker">ACCOUNT</span>
          <h1>Your NupHub.</h1>
        </div>
      </div>

      <div className="account-grid">
        <div className="panel account-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">PROFILE</span>
              <strong>Streamer identity</strong>
            </div>
          </div>

          <div className="settings-form">
            <label>
              Handle
              <input value={profile?.handle ?? ""} disabled />
              <small>Handles are locked after signup for now.</small>
            </label>

            <label>
              Display name
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Your stream name"
                maxLength={50}
              />
            </label>

            <label>
              Account email
              <input value={user?.email ?? ""} disabled />
            </label>

            <button className="button primary" onClick={() => void save()}>
              <Save size={16} />
              Save profile
            </button>

            {message && <div className="form-success">{message}</div>}
          </div>
        </div>

        <div className="panel account-panel">
          <div className="panel-head">
            <div>
              <span className="panel-label">PUBLIC PAGE</span>
              <strong>Your shareable link page</strong>
            </div>
          </div>

          <div className="account-public-card">
            <span>nuphub.com/u/{profile?.handle ?? "yourname"}</span>

            {profile && (
              <a
                className="button ghost"
                href={`/u/${profile.handle}`}
                target="_blank"
                rel="noreferrer"
              >
                Open page <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
