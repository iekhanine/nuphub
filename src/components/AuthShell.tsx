import { useState } from "react";
import { Check, LockKeyhole } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Brand } from "./Brand";
import { supabase } from "../lib/supabase";

type Props = {
  mode: "login" | "signup";
};

export function AuthShell({ mode }: Props) {
  const signup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || password.length < 6) {
      setError("Enter your email and a password with at least 6 characters.");
      return;
    }

    if (signup && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      if (signup) {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) throw authError;

        if (data.session) {
          navigate("/setup");
        } else {
          setMessage(
            "Account created. Check your email to confirm it, then NupHub will ask you to choose a streamer handle.",
          );
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) throw authError;

        const from =
          (location.state as { from?: string } | null)?.from ?? "/dashboard";

        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-left">
        <div className="auth-brand">
          <Brand />
        </div>

        <div className="auth-pitch">
          <span className="eyebrow">ONE LOGIN. NUPHUB TOO.</span>
          <h1>{signup ? "Create your account." : "Welcome back."}</h1>
          <ul>
            <li>
              <Check size={16} />
              Existing OneTime Labs accounts work here
            </li>
            <li>
              <Check size={16} />
              Unlimited NupHub links
            </li>
            <li>
              <Check size={16} />
              OBS browser source
            </li>
          </ul>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">
          <div className="auth-lock">
            <LockKeyhole size={18} />
            <span>ONETIME LABS ACCOUNT</span>
          </div>

          <h2>{signup ? "Create account" : "Sign in"}</h2>
          <p>
            {signup
              ? "Create your shared account. NupHub setup comes next."
              : "Use the same account you already use with OneTime Labs."}
          </p>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete={signup ? "new-password" : "current-password"}
              />
            </label>

            {signup && (
              <label>
                Confirm password
                <input
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </label>
            )}

            {error && <div className="form-error">{error}</div>}
            {message && <div className="form-success">{message}</div>}

            <button className="button primary full" type="submit" disabled={busy}>
              {busy ? "Working…" : signup ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="auth-switch">
            {signup ? (
              <>
                Already have a OneTime Labs account?{" "}
                <Link to="/login">Sign in</Link>
              </>
            ) : (
              <>
                Need an account? <Link to="/signup">Create one</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
