import { supabase } from "./supabase";
import type {
  OverlaySettings,
  Profile,
  PublicStreamer,
  StreamLink,
} from "../types";

async function currentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("You are not signed in.");

  return user.id;
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
      | "text_color"
      | "style"
      | "background_opacity"
      | "accent_bar_side"
      | "text_align"
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
