import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getMyProfile } from "../lib/data";

export function NupHubProfileRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">(
    "loading",
  );
  const location = useLocation();

  useEffect(() => {
    let active = true;

    getMyProfile()
      .then((profile) => {
        if (!active) return;
        setState(profile ? "ready" : "missing");
      })
      .catch(() => {
        if (active) setState("error");
      });

    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <main className="center-state">
        <div className="loader" />
        <span>Opening NupHub…</span>
      </main>
    );
  }

  if (state === "missing") {
    return (
      <Navigate
        to="/setup"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (state === "error") {
    return (
      <main className="center-state">
        <strong>Could not load your NupHub profile.</strong>
        <span>Refresh the page or sign in again.</span>
      </main>
    );
  }

  return children;
}
