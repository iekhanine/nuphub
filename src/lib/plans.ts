export type PlanId =
  | "free"
  | "pro"
  | "creator";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  linkLimit: number | null;
  badge: string;
  features: string[];
};

export const PLANS: Record<
  PlanId,
  PlanDefinition
> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    description:
      "Everything needed to put a clean, typeable link on stream.",
    linkLimit: 5,
    badge: "FREE",
    features: [
      "Up to 5 active links",
      "One OBS browser source",
      "Generated NupHub short URLs",
      "Link rotation controls",
      "Core readability controls",
      "Public streamer page",
    ],
  },

  pro: {
    id: "pro",
    name: "Pro Lifetime",
    price: 29,
    priceLabel: "$29",
    description:
      "The full overlay builder with advanced appearance and motion controls.",
    linkLimit: null,
    badge: "PRO",
    features: [
      "Unlimited links",
      "Full overlay color and opacity controls",
      "Glass, solid and minimal styles",
      "Independent title and link text sizing",
      "Font and alignment controls",
      "Shadow, glow and outline effects",
      "Dual-color neon controls",
      "Text animations and transitions",
      "Lifetime access with no subscription",
    ],
  },

  creator: {
    id: "creator",
    name: "Creator Lifetime",
    price: 69,
    priceLabel: "$69",
    description:
      "Everything in Pro plus NupHub's Creator-only workflow and presentation tools.",
    linkLimit: null,
    badge: "CREATOR",
    features: [
      "Everything in Pro",
      "Saved Overlays",
      "Creator Preset Library",
      "CSS Text Effects Library",
      "Custom NupHub URLs",
      "Custom Text",
      "Per-link Link Chain controls",
      "Per-link duration and weighted rotation",
      "Optional per-link QR codes",
      "All Links OBS overlay",
      "Editable All Links badge",
      "Creator features added as they ship",
      "Lifetime access with no subscription",
    ],
  },
};

export function planRank(
  plan: PlanId,
) {
  return plan === "creator"
    ? 2
    : plan === "pro"
      ? 1
      : 0;
}

export function hasPlan(
  plan: PlanId,
  required: PlanId,
) {
  return (
    planRank(plan) >=
    planRank(required)
  );
}
