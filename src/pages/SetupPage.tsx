import { useEffect, useState } from "react";
import { Check, RadioTower } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Brand } from "../components/Brand";
import {
  createNupHubProfile,
  getMyProfile,
  handleAvailable,
} from "../lib/data";
import { normalizeHandle, validHandle } from "../lib/validation";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Could not create NupHub profile.";
}

export default function SetupPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [alreadySetUp, setAlreadySetUp] = useState(false);
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((profile) => {
        setAlreadySetUp(Boolean(profile));
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <main className="center-state">
        <div className="loader" />
        <span>Checking NupHub…</span>
      </main>
    );
  }

  if (alreadySetUp) {
    return <Navigate to="/dashboard" replace />;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const cleanHandle = normalizeHandle(handle);

    if (!validHandle(cleanHandle)) {
      setError("Use 3–24 letters, numbers, _ or -.");
      return;
    }

    setBusy(true);

    try {
      const available = await handleAvailable(cleanHandle);

      if (!available) {
        setError("That streamer handle is already taken.");
        return;
      }

      await createNupHubProfile(cleanHandle);

      const from =
        (location.state as { from?: string } | null)?.from ?? "/dashboard";

      navigate(from === "/setup" ? "/dashboard" : from, { replace: true });
    } catch (err) {
      console.error("NupHub profile creation failed:", err);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="setup-page">
      <div className="setup-top">
        <Brand />
      </div>

      <section className="setup-card">
        <span className="eyebrow">
          <RadioTower size={14} />
          SET UP NUPHUB
        </span>

        <h1>Claim your streamer handle.</h1>
        <p>Your OneTime Labs account is already signed in.</p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            Streamer handle
            <input
              value={handle}
              onChange={(event) =>
                setHandle(normalizeHandle(event.target.value))
              }
              placeholder="yourname"
              autoComplete="username"
              maxLength={24}
              autoFocus
            />
          </label>

          <div className="setup-preview">
            <span>YOUR PUBLIC PAGE</span>
            <strong>nuphub.com/u/{handle || "yourname"}</strong>
          </div>

          <div className="setup-preview">
            <span>YOUR OBS SOURCE</span>
            <strong>nuphub.com/obs/{handle || "yourname"}</strong>
          </div>

          <ul className="setup-checks">
            <li>
              <Check size={15} />
              Unlimited short links
            </li>
            <li>
              <Check size={15} />
              One OBS browser source
            </li>
            <li>
              <Check size={15} />
              Same OneTime Labs login
            </li>
          </ul>

          {error && <div className="form-error">{error}</div>}

          <button className="button primary full" disabled={busy}>
            {busy ? "Creating…" : "Create NupHub profile"}
          </button>
        </form>
      </section>
    </main>
  );
}
