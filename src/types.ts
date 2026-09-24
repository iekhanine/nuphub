export type Profile = {
  id: string;
  handle: string;
  display_name: string | null;
  created_at: string;
};

export type StreamLink = {
  id: string;
  user_id: string;
  label: string;
  slug: string;
  destination_url: string;
  enabled: boolean;
  sort_order: number;
  clicks: number;
  created_at: string;
  updated_at: string;
};

export type OverlayPosition =
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "top-left"
  | "top-center"
  | "top-right";

export type OverlayStyle = "glass" | "solid" | "minimal";
export type OverlayAccentBarSide = "left" | "right" | "none";
export type OverlayTextAlign = "left" | "right";

export type PlanId = "free" | "pro" | "creator";
export type AdminRole = "admin" | "owner";
export type NupHubRole =
  | "not_enrolled"
  | "user"
  | "moderator"
  | "admin"
  | "owner";
export type OtlRole = "none" | "employee" | "admin" | "owner";

export type Entitlement = {
  user_id: string;
  plan: PlanId;
  source: string;
  purchased_at: string | null;
  square_payment_id: string | null;
  updated_at: string;
};

export type OverlaySettings = {
  user_id: string;
  rotation_seconds: number;
  position: OverlayPosition;
  accent_color: string;
  background_color: string;
  text_color: string;
  style: OverlayStyle;
  background_opacity: number;
  accent_bar_side: OverlayAccentBarSide;
  text_align: OverlayTextAlign;
  show_label: boolean;
  show_url: boolean;
  updated_at: string;
};

export type PublicOverlayLink = {
  label: string;
  slug: string;
};

export type PublicStreamer = {
  handle: string;
  display_name: string | null;
  settings: {
    rotation_seconds: number;
    position: OverlayPosition;
    accent_color: string;
    background_color: string;
    text_color: string;
    style: OverlayStyle;
    background_opacity: number;
    accent_bar_side: OverlayAccentBarSide;
    text_align: OverlayTextAlign;
    show_label: boolean;
    show_url: boolean;
  };
  links: PublicOverlayLink[];
};

export type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  handle: string | null;
  display_name: string | null;
  plan: PlanId;
  entitlement_source: string;
  purchased_at: string | null;
  admin_role: AdminRole | null;
  enrolled: boolean;
  nuphub_role: NupHubRole;
  otl_role: OtlRole;
};
