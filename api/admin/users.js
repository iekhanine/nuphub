import { createClient } from "@supabase/supabase-js";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function serverClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function requireAdmin(request, supabase) {
  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!bearer) {
    return { error: json({ error: "Sign in first." }, 401) };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(bearer);

  if (userError || !user) {
    return { error: json({ error: "Your session is no longer valid." }, 401) };
  }

  const { data: admin, error: adminError } = await supabase
    .from("nuphub_admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    adminError ||
    !admin ||
    !["admin", "owner"].includes(admin.role)
  ) {
    return { error: json({ error: "Owner or admin access required." }, 403) };
  }

  return { user, admin };
}

export async function GET(request) {
  const supabase = serverClient();

  if (!supabase) {
    return json(
      { error: "Supabase server credentials are not configured." },
      500,
    );
  }

  const auth = await requireAdmin(request, supabase);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();

  const { data: usersResult, error: usersError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (usersError) {
    return json({ error: usersError.message }, 500);
  }

  const authUsers = usersResult?.users || [];
  const ids = authUsers.map((user) => user.id);

  let profiles = [];
  let entitlements = [];
  let admins = [];
  let moderators = [];
  let classifications = [];

  if (ids.length) {
    const [
      profileResult,
      entitlementResult,
      adminResult,
      moderatorResult,
      classificationResult,
    ] = await Promise.all([
      supabase
        .from("nuphub_profiles")
        .select("id, handle, display_name")
        .in("id", ids),
      supabase
        .from("nuphub_entitlements")
        .select("user_id, plan, source, purchased_at, updated_at")
        .in("user_id", ids),
      supabase
        .from("nuphub_admins")
        .select("user_id, role")
        .in("user_id", ids),
      supabase
        .from("nuphub_moderators")
        .select("user_id")
        .in("user_id", ids),
      supabase
        .from("nuphub_account_classifications")
        .select("user_id, is_otl_employee")
        .in("user_id", ids),
    ]);

    const failures = [
      profileResult.error,
      entitlementResult.error,
      adminResult.error,
      moderatorResult.error,
      classificationResult.error,
    ].filter(Boolean);

    if (failures.length) {
      return json({ error: failures[0].message }, 500);
    }

    profiles = profileResult.data || [];
    entitlements = entitlementResult.data || [];
    admins = adminResult.data || [];
    moderators = moderatorResult.data || [];
    classifications = classificationResult.data || [];
  }

  const profileMap = new Map(profiles.map((item) => [item.id, item]));
  const entitlementMap = new Map(
    entitlements.map((item) => [item.user_id, item]),
  );
  const adminMap = new Map(admins.map((item) => [item.user_id, item]));
  const moderatorSet = new Set(moderators.map((item) => item.user_id));
  const classificationMap = new Map(
    classifications.map((item) => [item.user_id, item]),
  );

  const rows = authUsers
    .map((user) => {
      const profile = profileMap.get(user.id) || null;
      const entitlement = entitlementMap.get(user.id) || null;
      const admin = adminMap.get(user.id) || null;
      const classification = classificationMap.get(user.id) || null;

      let nuphubRole = "not_enrolled";

      if (admin?.role === "owner") {
        nuphubRole = "owner";
      } else if (admin?.role === "admin") {
        nuphubRole = "admin";
      } else if (moderatorSet.has(user.id)) {
        nuphubRole = "moderator";
      } else if (profile) {
        nuphubRole = "user";
      }

      return {
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        handle: profile?.handle || null,
        display_name: profile?.display_name || null,
        plan: entitlement?.plan || "free",
        entitlement_source: entitlement?.source || "default",
        purchased_at: entitlement?.purchased_at || null,
        updated_at: entitlement?.updated_at || null,
        admin_role: admin?.role || null,
        enrolled: Boolean(profile),
        nuphub_role: nuphubRole,
        is_otl_employee: Boolean(classification?.is_otl_employee),
      };
    })
    .filter((row) => {
      if (!query) return true;

      return [row.email, row.handle, row.display_name, row.nuphub_role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .sort((a, b) => {
      if (a.enrolled !== b.enrolled) return a.enrolled ? -1 : 1;
      return a.email.localeCompare(b.email);
    });

  return json({ users: rows, viewer_role: auth.admin.role });
}

export async function POST(request) {
  const supabase = serverClient();

  if (!supabase) {
    return json(
      { error: "Supabase server credentials are not configured." },
      500,
    );
  }

  const auth = await requireAdmin(request, supabase);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const userId = String(body?.user_id || "");
  const action = String(body?.action || "plan");

  if (!userId) {
    return json({ error: "A valid user is required." }, 400);
  }

  const { data: targetUser, error: targetUserError } =
    await supabase.auth.admin.getUserById(userId);

  if (targetUserError || !targetUser?.user) {
    return json({ error: "That account no longer exists." }, 404);
  }

  const { data: targetAdmin } = await supabase
    .from("nuphub_admins")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  const targetIsOwner = targetAdmin?.role === "owner";
  const viewerIsOwner = auth.admin.role === "owner";

  if (action === "plan") {
    const plan = String(body?.plan || "");

    if (!["free", "pro", "creator"].includes(plan)) {
      return json({ error: "A valid plan is required." }, 400);
    }

    if (targetIsOwner && !viewerIsOwner) {
      return json(
        { error: "Only the owner can change the owner's plan." },
        403,
      );
    }

    const now = new Date().toISOString();

    const { error: entitlementError } = await supabase
      .from("nuphub_entitlements")
      .upsert({
        user_id: userId,
        plan,
        source: "admin_grant",
        purchased_at: plan === "free" ? null : now,
        square_payment_id: null,
        updated_at: now,
      });

    if (entitlementError) {
      return json({ error: entitlementError.message }, 500);
    }

    return json({ ok: true, user_id: userId, plan });
  }

  if (action === "otl_employee") {
    if (!viewerIsOwner) {
      return json(
        { error: "Only the owner can change OTL employee classification." },
        403,
      );
    }

    const isOtlEmployee = Boolean(body?.is_otl_employee);

    const { error: classificationError } = await supabase
      .from("nuphub_account_classifications")
      .upsert({
        user_id: userId,
        is_otl_employee: isOtlEmployee,
        updated_at: new Date().toISOString(),
      });

    if (classificationError) {
      return json({ error: classificationError.message }, 500);
    }

    return json({
      ok: true,
      user_id: userId,
      is_otl_employee: isOtlEmployee,
    });
  }

  if (action === "nuphub_role") {
    if (!viewerIsOwner) {
      return json(
        { error: "Only the owner can change NupHub staff roles." },
        403,
      );
    }

    const role = String(body?.role || "");

    if (!["user", "moderator", "admin", "owner"].includes(role)) {
      return json({ error: "A valid NupHub role is required." }, 400);
    }

    if (targetIsOwner && userId === auth.user.id && role !== "owner") {
      return json(
        { error: "You cannot remove your own owner role." },
        400,
      );
    }

    if (role === "owner") {
      const { error: adminError } = await supabase
        .from("nuphub_admins")
        .upsert({
          user_id: userId,
          role: "owner",
          updated_at: new Date().toISOString(),
        });

      if (adminError) return json({ error: adminError.message }, 500);

      await supabase
        .from("nuphub_moderators")
        .delete()
        .eq("user_id", userId);
    }

    if (role === "admin") {
      const { error: adminError } = await supabase
        .from("nuphub_admins")
        .upsert({
          user_id: userId,
          role: "admin",
          updated_at: new Date().toISOString(),
        });

      if (adminError) return json({ error: adminError.message }, 500);

      await supabase
        .from("nuphub_moderators")
        .delete()
        .eq("user_id", userId);
    }

    if (role === "moderator") {
      await supabase
        .from("nuphub_admins")
        .delete()
        .eq("user_id", userId);

      const { error: moderatorError } = await supabase
        .from("nuphub_moderators")
        .upsert({
          user_id: userId,
          updated_at: new Date().toISOString(),
        });

      if (moderatorError) {
        return json({ error: moderatorError.message }, 500);
      }
    }

    if (role === "user") {
      await supabase
        .from("nuphub_admins")
        .delete()
        .eq("user_id", userId);

      await supabase
        .from("nuphub_moderators")
        .delete()
        .eq("user_id", userId);
    }

    return json({ ok: true, user_id: userId, role });
  }

  return json({ error: "Unknown admin action." }, 400);
}
