import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { StreamLink } from "../types";
import { validHttpUrl } from "../lib/validation";
import { customSlugAvailable } from "../lib/data";
import "../styles/link-editor.css";

type Props = {
  open: boolean;
  link?: StreamLink | null;
  defaultSortOrder: number;
  creator: boolean;
  onClose: () => void;
  onSave: (values: {
    label: string;
    destination_url: string;
    sort_order: number;
    custom_slug: string | null;
  }) => Promise<void>;
};

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

  return "Could not save link.";
}

export function LinkEditorModal({
  open,
  link,
  defaultSortOrder,
  creator,
  onClose,
  onSave,
}: Props) {
  const [label, setLabel] = useState("");
  const [destination, setDestination] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [slugState, setSlugState] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLabel(link?.label ?? "");
    setDestination(link?.destination_url ?? "");
    setCustomSlug(link?.custom_slug ?? "");
    setSlugState("idle");
    setError("");
  }, [open, link]);

  if (!open) return null;


  async function checkSlug(value = customSlug) {
    const clean = value.trim().toLowerCase();

    if (!clean) {
      setSlugState("idle");
      return true;
    }

    if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(clean)) {
      setSlugState("taken");
      return false;
    }

    if (!creator) {
      setSlugState("idle");
      return true;
    }

    setSlugState("checking");

    try {
      const available = await customSlugAvailable(
        clean,
        link?.id ?? null,
      );

      setSlugState(available ? "available" : "taken");
      return available;
    } catch {
      setSlugState("idle");
      return false;
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const cleanLabel = label.trim();
    const cleanDestination = destination.trim();
    const cleanCustomSlug = customSlug.trim().toLowerCase();

    if (!cleanLabel) {
      setError("Enter a name for this link.");
      return;
    }

    if (cleanLabel.length > 24) {
      setError("Link names can be up to 24 characters.");
      return;
    }

    if (!validHttpUrl(cleanDestination)) {
      setError("Enter a full URL beginning with http:// or https://");
      return;
    }

    if (
      cleanCustomSlug &&
      !/^[a-z0-9][a-z0-9-]{2,39}$/.test(cleanCustomSlug)
    ) {
      setError(
        "Custom URLs must be 3–40 characters using lowercase letters, numbers, and hyphens.",
      );
      return;
    }

    if (cleanCustomSlug && !creator) {
      setError(
        "Please upgrade your plan to Creator to use custom NupHub URLs.",
      );
      return;
    }

    if (cleanCustomSlug) {
      const available = await checkSlug(cleanCustomSlug);

      if (!available) {
        setError("That NupHub URL is already in use or reserved.");
        return;
      }
    }

    setSaving(true);

    try {
      await onSave({
        label: cleanLabel,
        destination_url: cleanDestination,
        sort_order: link?.sort_order ?? defaultSortOrder,
        custom_slug: cleanCustomSlug || null,
      });

      onClose();
    } catch (err) {
      console.error("NupHub link save failed:", err);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="nh-link-modal"
        role="dialog"
        aria-modal="true"
        aria-label={link ? "Edit link" : "Add link"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="nh-link-modal-header">
          <div>
            <span className="nh-link-eyebrow">STREAM LINK</span>
            <h2>{link ? "Edit link" : "Add a link"}</h2>
          </div>

          <button
            className="nh-link-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        <form className="nh-link-form" onSubmit={submit}>
          <div className="nh-link-field">
            <div className="nh-link-field-head">
              <label htmlFor="nh-link-name">Name</label>
              <span>{label.length}/24</span>
            </div>

            <input
              id="nh-link-name"
              value={label}
              onChange={(event) => setLabel(event.target.value.slice(0, 24))}
              placeholder="Join the Discord"
              maxLength={24}
              autoFocus
            />
          </div>

          <div className="nh-link-field">
            <label htmlFor="nh-link-destination">Destination</label>

            <input
              id="nh-link-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="https://discord.gg/..."
              inputMode="url"
            />
          </div>

          <div className="nh-link-field nh-custom-url-field">
            <div className="nh-link-field-head">
              <label htmlFor="nh-link-custom-slug">
                Custom NupHub URL
                <span className="nh-creator-mini-badge">CREATOR</span>
              </label>
              {slugState === "checking" && <span>Checking…</span>}
              {slugState === "available" && (
                <span className="nh-slug-available">Available</span>
              )}
              {slugState === "taken" && (
                <span className="nh-slug-taken">Unavailable</span>
              )}
            </div>

            <div className="nh-custom-slug-input">
              <span>nuphub.com/</span>
              <input
                id="nh-link-custom-slug"
                value={customSlug}
                onChange={(event) => {
                  const value = event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "")
                    .slice(0, 40);

                  setCustomSlug(value);
                  setSlugState("idle");
                }}
                onBlur={() => void checkSlug()}
                placeholder="my-youtube"
                maxLength={40}
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>

            <small>
              {creator
                ? "Choose a memorable Creator URL. Leave blank to keep the generated short URL."
                : "Preview the field now. Creator Lifetime is required to claim a custom URL."}
            </small>
          </div>

          <div className="nh-link-generated">
            {link ? (
              <>
                <span>Short URL</span>
                <strong>
                  nuphub.com/{customSlug || link.custom_slug || link.slug}
                </strong>
              </>
            ) : (
              <span>
                A short NupHub URL will be generated automatically when you save.
              </span>
            )}
          </div>

          {error && <div className="nh-link-error">{error}</div>}

          <footer className="nh-link-actions">
            <button
              className="nh-link-button nh-link-button-secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="nh-link-button nh-link-button-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : link ? "Save" : "Add link"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
