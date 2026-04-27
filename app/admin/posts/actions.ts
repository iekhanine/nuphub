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
}

export async function deletePost(postId: string) {
  await requireAdmin();

  const admin = createAdminClient();

  const { error } = await admin.from("posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
}

export async function updatePostStatus(postId: string, status: string) {
  await requireAdmin();

  if (!["draft", "published"].includes(status)) {
    throw new Error("Invalid status");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("posts")
    .update({ status })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
}