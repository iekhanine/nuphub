import { supabase } from "./supabase";
import type {
  AdminRole,
  AdminUser,
  Entitlement,
  OverlayPreset,
  OverlayPresetConfig,
  OverlaySequenceItem,
  OverlaySettings,
  PlanId,
  Profile,
  PublicAllLinksOverlay,
  PublicStreamer,
  StreamLink,
} from "../types";

async function currentUserId() {
  /*
   * The dashboard route guard already relies on Supabase's persisted
   * session. Use that same source here instead of getUser().
   *
   * getUser() performs a server-backed user lookup and can throw
   * AuthSessionMissingError during auth hydration / HMR even while the
   * persisted browser session is being restored. When every dashboard
   * data function calls it at once, one timing race can make the whole
   * application appear signed out.
   */
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("AUTH_SESSION_MISSING");
  }

  return userId;
}

export async function getMyProfile() {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_profiles")
    .select("id, handle, display_name, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Profile | null;
}

export async function requireMyProfile() {
  const profile = await getMyProfile();
  if (!profile) throw new Error("NUPHUB_PROFILE_REQUIRED");
  return profile;
}

export async function createNupHubProfile(handle: string) {
  const { data, error } = await supabase.rpc("nuphub_create_profile", {
    p_handle: handle,
  });

  if (error) throw error;
  return data as Profile;
}

export async function getMyEntitlement() {
  const userId = await currentUserId();

  const fallback: Entitlement = {
    user_id: userId,
    plan: "free",
    source: "default",
    purchased_at: null,
    square_payment_id: null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.rpc("nuphub_my_entitlement");

  if (error) {
    // Keep the rest of NupHub usable during a staggered deployment,
    // but never let an old direct-table read decide feature access.
    if (
      error.code === "PGRST202" ||
      error.code === "PGRST205" ||
      error.code === "42883" ||
      error.message?.includes("nuphub_my_entitlement")
    ) {
      console.warn(
        "NupHub entitlement RPC is unavailable; defaulting to Free.",
        error,
      );
      return fallback;
    }

    throw error;
  }

  return (data ?? fallback) as Entitlement;
}

export async function getMyLinks() {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_links")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as StreamLink[];
}

export async function createLink(input: {
  label: string;
  destination_url: string;
  sort_order: number;
}) {
  const { data, error } = await supabase.rpc("nuphub_create_link", {
    p_label: input.label,
    p_destination_url: input.destination_url,
    p_sort_order: input.sort_order,
  });

  if (error) throw error;
  return data as StreamLink;
}

export async function updateLink(
  id: string,
  changes: Partial<
    Pick<
      StreamLink,
      "label" | "destination_url" | "enabled" | "sort_order"
    >
  >,
) {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_links")
    .update(changes)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as StreamLink;
}

export async function deleteLink(id: string) {
  const userId = await currentUserId();

  const { error } = await supabase
    .from("nuphub_links")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getOverlaySettings() {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_overlay_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("NUPHUB_PROFILE_REQUIRED");

  return data as OverlaySettings;
}

export async function saveOverlaySettings(
  changes: Partial<
    Pick<
      OverlaySettings,
      | "rotation_seconds"
      | "position"
      | "accent_color"
      | "background_color"
      | "glass_left_color"
      | "glass_right_color"
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
    >
  >,
) {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_overlay_settings")
    .update(changes)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as OverlaySettings;
}


export async function setCreatorCustomText(input: {
  customLabelText: string | null;
  customUrlText: string | null;
}) {
  const { data, error } = await supabase.rpc(
    "nuphub_set_creator_custom_text",
    {
      p_custom_label_text: input.customLabelText,
      p_custom_url_text: input.customUrlText,
    },
  );

  if (error) throw error;
  return data as OverlaySettings;
}


export async function getOverlayPresets() {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_overlay_presets")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as OverlayPreset[];
}

export async function saveOverlayPreset(input: {
  id?: string | null;
  name: string;
  config: OverlayPresetConfig;
}) {
  const { data, error } = await supabase.rpc("nuphub_save_overlay_preset", {
    p_preset_id: input.id ?? null,
    p_name: input.name,
    p_config: input.config,
  });

  if (error) throw error;
  return data as OverlayPreset;
}

export async function deleteOverlayPreset(id: string) {
  const { error } = await supabase.rpc("nuphub_delete_overlay_preset", {
    p_preset_id: id,
  });

  if (error) throw error;
}

export async function getOverlaySequence() {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_overlay_sequence")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []) as OverlaySequenceItem[];
}

export async function setOverlaySequenceItem(
  linkId: string,
  input: {
    presetId: string | null;
    durationSeconds: number | null;
    weight: number;
    qrEnabled: boolean;
  },
) {
  const { error } = await supabase.rpc("nuphub_set_overlay_sequence_item", {
    p_link_id: linkId,
    p_preset_id: input.presetId,
    p_duration_seconds: input.durationSeconds,
    p_weight: input.weight,
    p_qr_enabled: input.qrEnabled,
  });

  if (error) throw error;
}

export async function updateProfile(changes: {
  display_name?: string | null;
}) {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_profiles")
    .update(changes)
    .eq("id", userId)
    .select("id, handle, display_name, created_at")
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function handleAvailable(handle: string) {
  const { data, error } = await supabase.rpc("nuphub_handle_available", {
    p_handle: handle,
  });

  if (error) throw error;
  return Boolean(data);
}


export async function customSlugAvailable(
  slug: string,
  linkId?: string | null,
) {
  const { data, error } = await supabase.rpc(
    "nuphub_custom_slug_available",
    {
      p_slug: slug,
      p_link_id: linkId ?? null,
    },
  );

  if (error) throw error;
  return Boolean(data);
}

export async function setCustomLinkSlug(
  linkId: string,
  slug: string | null,
) {
  const { data, error } = await supabase.rpc(
    "nuphub_set_custom_link_slug",
    {
      p_link_id: linkId,
      p_slug: slug,
    },
  );

  if (error) throw error;
  return data as StreamLink;
}

export async function getPublicAllLinksOverlay(handle: string) {
  const { data, error } = await supabase.rpc(
    "nuphub_public_all_links_overlay",
    {
      p_handle: handle,
    },
  );

  if (error) throw error;
  return (data ?? null) as PublicAllLinksOverlay | null;
}

export async function getPublicStreamer(handle: string) {
  const { data, error } = await supabase.rpc("nuphub_public_streamer", {
    p_handle: handle,
  });

  if (error) throw error;
  return (data ?? null) as PublicStreamer | null;
}

export async function resolveShortLink(slug: string) {
  const { data, error } = await supabase.rpc("nuphub_resolve_short_link", {
    p_slug: slug,
  });

  if (error) throw error;
  return (data ?? null) as string | null;
}

export async function startSquareCheckout(plan: Exclude<PlanId, "free">) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session?.access_token) throw new Error("You are not signed in.");

  const response = await fetch("/api/square/create-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ plan }),
  });

  const raw = await response.text();

  let payload: {
    url?: string;
    error?: string;
    details?: string;
  } = {};

  if (raw.trim()) {
    try {
      payload = JSON.parse(raw) as {
        url?: string;
        error?: string;
        details?: string;
      };
    } catch {
      throw new Error(
        `Checkout endpoint returned ${response.status} ${response.statusText} with a non-JSON response.`,
      );
    }
  }

  if (!response.ok || !payload.url) {
    const detail = payload.details ? ` (${payload.details})` : "";

    throw new Error(
      payload.error
        ? `${payload.error}${detail}`
        : `Checkout endpoint returned ${response.status} ${response.statusText} with an empty response.`,
    );
  }

  return payload.url;
}


export async function getMyAdminRole() {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("nuphub_admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (
      error.code === "PGRST205" ||
      error.code === "42P01" ||
      error.message?.includes("nuphub_admins")
    ) {
      return null;
    }

    throw error;
  }

  return (data?.role ?? null) as AdminRole | null;
}

export async function adminListUsers() {
  const { data, error } = await supabase.rpc("nuphub_admin_list_accounts");

  if (error) throw error;

  return (data ?? []) as AdminUser[];
}

export async function adminSetUserPlan(userId: string, plan: PlanId) {
  const { data, error } = await supabase.rpc(
    "nuphub_admin_set_account_access",
    {
      p_user_id: userId,
      p_action: "plan",
      p_value: plan,
    },
  );

  if (error) throw error;
  return data as { ok: boolean; user_id: string; plan: PlanId };
}

export async function adminSetOtlRole(
  userId: string,
  role: "none" | "employee" | "admin" | "owner",
) {
  const { data, error } = await supabase.rpc(
    "nuphub_admin_set_account_access",
    {
      p_user_id: userId,
      p_action: "otl_role",
      p_value: role,
    },
  );

  if (error) throw error;

  return data as {
    ok: boolean;
    user_id: string;
    otl_role: "none" | "employee" | "admin" | "owner";
  };
}

export async function adminSetNupHubRole(
  userId: string,
  role: "user" | "moderator" | "admin" | "owner",
) {
  const { data, error } = await supabase.rpc(
    "nuphub_admin_set_account_access",
    {
      p_user_id: userId,
      p_action: "nuphub_role",
      p_value: role,
    },
  );

  if (error) throw error;

  return data as {
    ok: boolean;
    user_id: string;
    role: "user" | "moderator" | "admin" | "owner";
  };
}
