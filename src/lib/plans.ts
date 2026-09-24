export type PlanId = "free" | "pro" | "creator";

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

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    description: "Everything needed to put a clean, typeable link on stream.",
    linkLimit: 5,
    badge: "FREE",
    features: [
      "Up to 5 active links",
      "One OBS browser source",
      "Generated NupHub short URLs",
      "Link rotation controls",
      "Accent + text color",
      "Background opacity + text size",
      "Public streamer page",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Lifetime",
    price: 29,
    priceLabel: "$29",
    description: "Unlock the full overlay builder and remove the practical limits.",
    linkLimit: null,
    badge: "PRO",
    features: [
      "Unlimited links",
      "Full background color controls",
      "Left / none / right edge accent",
      "Left / center / right text alignment",
      "Glass, solid and minimal styles",
      "Shadow, glow and outline text effects",
      "Font selection",
      "Dual-color neon controls",
      "Text motion and animated transitions",
      "Lifetime access — no subscription",
    ],
  },
  creator: {
    id: "creator",
    name: "Creator Lifetime",
    price: 69,
    priceLabel: "$69",
    description: "The full NupHub toolkit plus every Creator feature we add.",
    linkLimit: null,
    badge: "CREATOR",
    features: [
      "Everything in Pro",
      "Creator feature access",
      "Saved overlay presets",
      "Per-link overlay chains",
      "Custom NupHub URLs",
      "All Links OBS overlay",
      "Optional per-link QR codes",
      "Advanced analytics",
      "Overlay presets and scene packs",
      "Scheduling and campaign tools",
      "Twitch interactive tools as they ship",
      "Lifetime access — no subscription",
    ],
  },
};

export function planRank(plan: PlanId) {
  return plan === "creator" ? 2 : plan === "pro" ? 1 : 0;
}

export function hasPlan(plan: PlanId, required: PlanId) {
  return planRank(plan) >= planRank(required);
}
