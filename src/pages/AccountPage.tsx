import { useEffect, useState } from "react";
import { Crown, ExternalLink, Save, ShieldCheck } from "lucide-react";

import { DashboardShell } from "../components/DashboardShell";
import { useAuth } from "../context/AuthContext";
import {
  getMyAdminRole,
  getMyEntitlement,
  getMyProfile,
  getOverlaySettings,
  saveOverlaySettings,
  updateProfile,
} from "../lib/data";
import { PLANS } from "../lib/plans";
import type { AdminRole, Entitlement, Profile } from "../types";
import "../styles/admin-users.css";

export default function AccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getMyEntitlement(),
      getMyAdminRole(),
      getOverlaySettings(),
    ]).then(
      ([
        value,
        nextEntitlement,
        nextAdminRole,
        overlaySettings,
      ]) => {
        setProfile(value);
        setDisplayName(value?.display_name ?? "");
        setBadgeText(overlaySettings.all_links_badge_text ?? "");
        setEntitlement(nextEntitlement);
        setAdminRole(nextAdminRole);
      },
    );
  }, []);

  async function save() {
    const [updated] = await Promise.all([
      updateProfile({
        display_name: displayName.trim() || null,
      }),
      saveOverlaySettings({
        all_links_badge_text:
          badgeText.trim() || null,
      }),
    ]);

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
              Badge text
              <div className="account-badge-row">
                <input
                  value={badgeText}
                  maxLength={4}
                  placeholder={
                    profile?.handle.slice(0, 2).toUpperCase() ?? "NH"
                  }
                  onChange={(event) =>
                    setBadgeText(event.target.value)
                  }
                />

                <span className="account-badge-preview">
                  {badgeText.trim() ||
                    (profile?.handle.slice(0, 2).toUpperCase() ?? "NH")}
                </span>
              </div>

              <small>
                Used on your public link page and All Links overlay.
                Up to 4 characters.
              </small>
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
              <span className="panel-label">ACCESS</span>
              <strong>Plan & role</strong>
            </div>
          </div>

          <div className="account-public-card account-access-card">
            <div>
              <span>Plan</span>
              <strong>
                {entitlement ? PLANS[entitlement.plan].name : "Loading…"}
              </strong>
            </div>

            {adminRole && (
              <div>
                <span>Admin role</span>
                <strong className="account-role-line">
                  {adminRole === "owner" ? (
                    <Crown size={15} />
                  ) : (
                    <ShieldCheck size={15} />
                  )}
                  {adminRole === "owner" ? "Owner" : "Admin"}
                </strong>
              </div>
            )}
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
