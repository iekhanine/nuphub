"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not logged in");
  }

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Admin profile not found");
  }

  if (profile.role?.toLowerCase() !== "admin") {
    throw new Error("Not authorized");
  }

  return user;
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();

  const allowedRoles = ["admin", "moderator", "contributor"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "contributor");

  if (!email || !password || !username) {
    throw new Error("Email, password, and username are required");
  }

  if (!["admin", "moderator", "contributor"].includes(role)) {
    throw new Error("Invalid role");
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user.id;

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email,
    username,
    display_name: displayName,
    role,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const currentUser = await requireAdmin();

  if (currentUser.id === userId) {
    throw new Error("You cannot delete yourself");
  }

  const admin = createAdminClient();

  await admin.from("posts").delete().eq("user_id", userId);
  await admin.from("profiles").delete().eq("id", userId);

  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/users");
}