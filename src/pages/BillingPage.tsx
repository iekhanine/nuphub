import {
  useEffect,
  useState,
} from "react";
import {
  Check,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DashboardShell } from "../components/DashboardShell";
import {
  getMyEntitlement,
  getMyProfile,
  startSquareCheckout,
} from "../lib/data";
import {
  hasPlan,
  PLANS,
} from "../lib/plans";
import type {
  Entitlement,
  PlanId,
  Profile,
} from "../types";

const paidPlans: Array<
  Exclude<PlanId, "free">
> = [
  "pro",
  "creator",
];

const proAdds = [
  "Unlimited links",
  "Full overlay color, opacity and edge controls",
  "Glass, solid and minimal card styles",
  "Independent title and link text sizing",
  "Font selection and alignment controls",
  "Shadow, glow and outline text effects",
  "Dual-color neon controls",
  "Text animations and link transitions",
  "Lifetime access with no subscription",
];

const creatorAdds = [
  "Saved Overlays",
  "Creator Preset Library",
  "Quick-load user presets",
  "CSS Text Effects Library",
  "Custom NupHub URLs",
  "Custom Text for overlay title/message",
  "Per-link Link Chain controls",
  "Per-link duration and weighted rotation",
  "Optional per-link QR codes",
  "All Links OBS overlay",
  "Editable All Links badge text",
  "Creator features added to NupHub as they ship",
];

export default function BillingPage() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [entitlement, setEntitlement] =
    useState<Entitlement | null>(null);

  const [checkoutPlan, setCheckoutPlan] =
    useState<
      Exclude<PlanId, "free"> | null
    >(null);

  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getMyEntitlement(),
    ]).then(
      ([
        nextProfile,
        nextEntitlement,
      ]) => {
        setProfile(nextProfile);
        setEntitlement(nextEntitlement);
      },
    );
  }, []);

  const currentPlan =
    entitlement?.plan ?? "free";

  async function checkout(
    plan: Exclude<PlanId, "free">,
  ) {
    setCheckoutPlan(plan);
    setError("");

    try {
      const url =
        await startSquareCheckout(plan);

      window.location.assign(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start checkout.",
      );

      setCheckoutPlan(null);
    }
  }

  function buttonLabel(
    id: Exclude<PlanId, "free">,
  ) {
    if (hasPlan(currentPlan, id)) {
      return currentPlan === id
        ? "Current plan"
        : "Included in your plan";
    }

    if (
      currentPlan === "pro" &&
      id === "creator"
    ) {
      return "Upgrade to Creator";
    }

    return id === "pro"
      ? "Get Pro Lifetime"
      : "Get Creator Lifetime";
  }

  return (
    <DashboardShell
      handle={profile?.handle}
    >
      <div className="dash-heading compact-heading">
        <div>
          <span className="kicker">
            PLAN
          </span>

          <h1>
            {PLANS[currentPlan].name}
          </h1>

          <p className="dash-subtitle">
            Buy the tier once. Keep the
            features. No NupHub subscription.
          </p>
        </div>

        <span
          className={`current-plan-pill plan-${currentPlan}`}
        >
          {PLANS[currentPlan].badge}
        </span>
      </div>

      {error && (
        <div className="form-error page-error">
          {error}
        </div>
      )}

      <section className="billing-current panel">
        <div>
          <ShieldCheck size={22} />

          <span>
            <strong>
              Your access is permanent.
            </strong>

            <small>
              {currentPlan === "free"
                ? "Free stays free. Upgrade only if you want the extra controls."
                : `${PLANS[currentPlan].name} does not expire.`}
            </small>
          </span>
        </div>

        {entitlement?.purchased_at && (
          <small>
            Upgraded{" "}
            {new Date(
              entitlement.purchased_at,
            ).toLocaleDateString()}
          </small>
        )}
      </section>

      <section className="billing-compare-intro">
        <div>
          <span className="panel-label">
            PRO LIFETIME
          </span>
          <strong>
            The full overlay builder.
          </strong>
        </div>

        <div>
          <span className="panel-label">
            CREATOR LIFETIME
          </span>
          <strong>
            Everything in Pro, plus the
            Creator tools.
          </strong>
        </div>
      </section>

      <div className="billing-plan-grid">
        {paidPlans.map((id) => {
          const plan = PLANS[id];
          const alreadyHas =
            hasPlan(currentPlan, id);

          const features =
            id === "pro"
              ? proAdds
              : creatorAdds;

          return (
            <article
              className={`billing-plan-card${
                id === "creator"
                  ? " creator"
                  : ""
              }`}
              key={id}
            >
              <div className="billing-plan-head">
                <div>
                  <span>{plan.badge}</span>
                  <h2>{plan.name}</h2>
                </div>

                <strong>
                  {plan.priceLabel}
                </strong>
              </div>

              <p>
                {id === "pro"
                  ? "Everything in Free, plus:"
                  : "Everything in Pro, plus:"}
              </p>

              <ul>
                {features.map((feature) => (
                  <li key={feature}>
                    {id === "creator" ? (
                      <Sparkles size={14} />
                    ) : (
                      <Check size={14} />
                    )}

                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`button ${
                  id === "creator"
                    ? "primary"
                    : "ghost"
                } full`}
                disabled={
                  alreadyHas ||
                  checkoutPlan !== null
                }
                onClick={() =>
                  void checkout(id)
                }
              >
                {checkoutPlan === id ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="spin-icon"
                    />
                    Opening Square…
                  </>
                ) : alreadyHas ? (
                  buttonLabel(id)
                ) : (
                  <>
                    <CreditCard size={16} />
                    {buttonLabel(id)}
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>

      <div className="square-note">
        <ExternalLink size={15} />

        <span>
          Checkout opens on Square’s secure
          hosted payment page. Payment
          information is handled directly by
          Square and never touches our
          servers.
          <br />
          * Lifetime access refers to the
          duration of the NupHub product or
          service.
        </span>
      </div>
    </DashboardShell>
  );
}
