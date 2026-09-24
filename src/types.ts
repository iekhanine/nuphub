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
  custom_slug: string | null;
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
export type OverlayTextAlign = "left" | "center" | "right";
export type OverlayFontFamily =
  | "inter"
  | "arial"
  | "verdana"
  | "trebuchet"
  | "georgia"
  | "impact"
  | "courier";

export type OverlayTextEffect =
  | "none"
  | "shadow"
  | "glow"
  | "outline"
  | "neon";

export type OverlayTextAnimation =
  | "none"
  | "pulse"
  | "zoom"
  | "spin"
  | "wobble"
  | "bounce"
  | "flash"
  | "float"
  | "shake";

export type OverlayTransitionEffect =
  | "fade"
  | "explode"
  | "implode"
  | "slide-left"
  | "slide-right"
  | "flip"
  | "pop";

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
  font_family: OverlayFontFamily;
  text_effect: OverlayTextEffect;
  text_animation: OverlayTextAnimation;
  transition_effect: OverlayTransitionEffect;
  animation_speed: number;
  neon_primary_color: string;
  neon_secondary_color: string;
  neon_intensity: number;
  neon_speed: number;
  font_scale: number;
  show_label: boolean;
  show_url: boolean;
  updated_at: string;
};

export type OverlayPresetConfig = Pick<
  OverlaySettings,
  | "accent_color"
  | "background_color"
  | "text_color"
  | "style"
  | "background_opacity"
  | "accent_bar_side"
  | "text_align"
  | "font_family"
  | "text_effect"
  | "text_animation"
  | "transition_effect"
  | "animation_speed"
  | "neon_primary_color"
  | "neon_secondary_color"
  | "neon_intensity"
  | "neon_speed"
  | "font_scale"
  | "show_label"
  | "show_url"
>;

export type OverlayPreset = {
  id: string;
  user_id: string;
  name: string;
  config: OverlayPresetConfig;
  created_at: string;
  updated_at: string;
};

export type OverlaySequenceItem = {
  user_id: string;
  link_id: string;
  preset_id: string | null;
  duration_seconds: number | null;
  weight: number;
  qr_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicOverlayLink = {
  label: string;
  slug: string;
  overlay?: Partial<OverlayPresetConfig> | null;
  duration_seconds?: number | null;
  weight?: number;
  qr_enabled?: boolean;
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
    font_family: OverlayFontFamily;
    text_effect: OverlayTextEffect;
    text_animation: OverlayTextAnimation;
    transition_effect: OverlayTransitionEffect;
    animation_speed: number;
    neon_primary_color: string;
    neon_secondary_color: string;
    neon_intensity: number;
    neon_speed: number;
    font_scale: number;
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


export type PublicAllLinksOverlay = {
  handle: string;
  display_name: string | null;
  accent_color: string;
  background_color: string;
  text_color: string;
  links: Array<{
    label: string;
    slug: string;
    qr_enabled: boolean;
  }>;
};
