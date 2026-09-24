import { useEffect, useState } from "react";
import { Check, CreditCard, ExternalLink, LoaderCircle, ShieldCheck } from "lucide-react";

import { DashboardShell } from "../components/DashboardShell";
import {
  getMyEntitlement,
  getMyProfile,
  startSquareCheckout,
} from "../lib/data";
import { hasPlan, PLANS } from "../lib/plans";
import type { Entitlement, PlanId, Profile } from "../types";

const paidPlans: Array<Exclude<PlanId, "free">> = ["pro", "creator"];

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<Exclude<PlanId, "free"> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMyProfile(), getMyEntitlement()]).then(
      ([nextProfile, nextEntitlement]) => {
        setProfile(nextProfile);
        setEntitlement(nextEntitlement);
      },
    );
  }, []);

  const currentPlan = entitlement?.plan ?? "free";

  async function checkout(plan: Exclude<PlanId, "free">) {
    setCheckoutPlan(plan);
    setError("");

    try {
      const url = await startSquareCheckout(plan);
      window.location.assign(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start checkout.",
      );
      setCheckoutPlan(null);
    }
  }

  return (
    <DashboardShell handle={profile?.handle}>
      <div className="dash-heading compact-heading">
        <div>
          <span className="kicker">PLAN</span>
          <h1>{PLANS[currentPlan].name}</h1>
          <p className="dash-subtitle">
            One-time upgrades. No NupHub subscription.
          </p>
        </div>

        <span className={`current-plan-pill plan-${currentPlan}`}>
          {PLANS[currentPlan].badge}
        </span>
      </div>

      {error && <div className="form-error page-error">{error}</div>}

      <section className="billing-current panel">
        <div>
          <ShieldCheck size={22} />
          <span>
            <strong>Your access is permanent.</strong>
            <small>
              {currentPlan === "free"
                ? "Free stays free."
                : "Your purchased tier does not expire."}
            </small>
          </span>
        </div>

        {entitlement?.purchased_at && (
          <small>
            Upgraded {new Date(entitlement.purchased_at).toLocaleDateString()}
          </small>
        )}
      </section>

      <div className="billing-plan-grid">
        {paidPlans.map((id) => {
          const plan = PLANS[id];
          const alreadyHas = hasPlan(currentPlan, id);

          return (
            <article className={`billing-plan-card${id === "creator" ? " creator" : ""}`} key={id}>
              <div className="billing-plan-head">
                <div>
                  <span>{plan.badge}</span>
                  <h2>{plan.name}</h2>
                </div>

                <strong>{plan.priceLabel}</strong>
              </div>

              <p>{plan.description}</p>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={14} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`button ${id === "creator" ? "primary" : "ghost"} full`}
                disabled={alreadyHas || checkoutPlan !== null}
                onClick={() => void checkout(id)}
              >
                {checkoutPlan === id ? (
                  <>
                    <LoaderCircle size={16} className="spin-icon" />
                    Opening Square…
                  </>
                ) : alreadyHas ? (
                  "Included in your plan"
                ) : (
                  <>
                    <CreditCard size={16} />
                    Buy with Square
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>

      <div className="square-note">
        <ExternalLink size={15} />
        Checkout opens on Square’s secure hosted payment page.
      </div>
    </DashboardShell>
  );
}
