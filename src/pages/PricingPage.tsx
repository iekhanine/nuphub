import { Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { SiteHeader } from "../components/SiteHeader";
import { PLANS } from "../lib/plans";
import type { PlanId } from "../types";
import { useAuth } from "../context/AuthContext";

const order: PlanId[] = ["free", "pro", "creator"];

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <main>
      <SiteHeader />

      <section className="public-page shell pricing-page">
        <div className="public-page-heading pricing-heading">
          <span className="eyebrow">
            <Sparkles size={15} />
            ONE-TIME UPGRADES
          </span>
          <h1>Use it free. Pay once when you want more.</h1>
          <p>No monthly subscription just to put a URL on your stream.</p>
        </div>

        <div className="pricing-grid">
          {order.map((id) => {
            const plan = PLANS[id];

            return (
              <article
                className={`pricing-card${id === "pro" ? " featured" : ""}`}
                key={id}
              >
                <span className="pricing-badge">{plan.badge}</span>
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>

                <div className="price-line">
                  <strong>{plan.priceLabel}</strong>
                  <span>{id === "free" ? "forever" : "one time"}</span>
                </div>

                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  className={`button ${id === "free" ? "ghost" : "primary"} full`}
                  to={
                    user
                      ? id === "free"
                        ? "/dashboard"
                        : "/dashboard/billing"
                      : "/signup"
                  }
                >
                  {id === "free" ? "Start free" : "Get  access"}
                </Link>
              </article>
            );
          })}
        </div>

        <p className="pricing-footnote">
          Existing beta accounts are grandfathered into Creator .
        </p>
      </section>
    </main>
  );
}
