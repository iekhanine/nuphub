import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("code");

    if (!code) {
      setError("Missing confirmation code.");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: authError }) => {
      if (authError) {
        setError(authError.message);
        return;
      }

      navigate("/setup", { replace: true });
    });
  }, [params, navigate]);

  return (
    <main className="center-state">
      {error ? (
        <>
          <strong>Could not confirm account.</strong>
          <span>{error}</span>
        </>
      ) : (
        <>
          <div className="loader" />
          <span>Confirming your account…</span>
        </>
      )}
    </main>
  );
}
