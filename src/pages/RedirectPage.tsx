import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { resolveShortLink } from "../lib/data";

export default function RedirectPage() {
  const { slug = "" } = useParams();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    resolveShortLink(slug)
      .then((destination) => {
        if (!destination) {
          setMissing(true);
          return;
        }
        window.location.replace(destination);
      })
      .catch(() => setMissing(true));
  }, [slug]);

  if (missing) {
    return (
      <main className="center-state">
        <strong>That NupHub link doesn’t exist.</strong>
        <Link to="/">Go to NupHub</Link>
      </main>
    );
  }

  return (
    <main className="center-state">
      <div className="loader" />
      <span>Opening link…</span>
    </main>
  );
}
