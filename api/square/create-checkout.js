import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const PLANS = {
  pro: {
    name: "NupHub Pro ",
    amount: 2900,
  },
  creator: {
    name: "NupHub Creator ",
    amount: 6900,
  },
};

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function safeDetail(value, max = 500) {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function POST(request) {
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const siteUrl =
      process.env.SITE_URL ||
      process.env.VITE_SITE_URL ||
      "https://nuphub.com";

    if (!supabaseUrl || !serviceRoleKey) {
      return json(
        { error: "Supabase server credentials are not configured." },
        500,
      );
    }

    if (!accessToken || !locationId) {
      return json(
        { error: "Square is not configured on this deployment." },
        500,
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const bearer = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!bearer) {
      return json({ error: "Sign in before upgrading." }, 401);
    }

    const body = await request.json().catch(() => ({}));
    const planId = body?.plan;
    const plan = PLANS[planId];

    if (!plan) {
      return json({ error: "Invalid NupHub plan." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(bearer);

    if (userError || !user) {
      return json(
        {
          error: "Your session is no longer valid.",
          details: userError?.message || undefined,
        },
        401,
      );
    }

    const { data: entitlement, error: entitlementError } = await supabase
      .from("nuphub_entitlements")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (entitlementError) {
      return json(
        {
          error: "Could not read your NupHub entitlement.",
          details: entitlementError.message,
        },
        500,
      );
    }

    const rank = { free: 0, pro: 1, creator: 2 };

    if ((rank[entitlement?.plan || "free"] ?? 0) >= rank[planId]) {
      return json(
        { error: "That plan is already included in your account." },
        409,
      );
    }

    const sessionId = crypto.randomUUID();

    const { error: sessionError } = await supabase
      .from("nuphub_checkout_sessions")
      .insert({
        id: sessionId,
        user_id: user.id,
        plan: planId,
        amount_cents: plan.amount,
        status: "pending",
      });

    if (sessionError) {
      return json(
        {
          error: "Could not create the NupHub checkout session.",
          details: sessionError.message,
        },
        500,
      );
    }

    let squareResponse;

    try {
      squareResponse = await fetch(
        `${squareBaseUrl()}/v2/online-checkout/payment-links`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Square-Version": "2026-09-16",
          },
          body: JSON.stringify({
            idempotency_key: sessionId,
            description: `${plan.name} for NupHub`,
            quick_pay: {
              name: plan.name,
              price_money: {
                amount: plan.amount,
                currency: "USD",
              },
              location_id: locationId,
            },
            checkout_options: {
              redirect_url: `${siteUrl.replace(/\/$/, "")}/dashboard/billing?checkout=complete`,
            },
            pre_populated_data: user.email
              ? {
                  buyer_email: user.email,
                }
              : undefined,
            payment_note: `nuphub:${sessionId}:${planId}`,
          }),
        },
      );
    } catch (fetchError) {
      await supabase
        .from("nuphub_checkout_sessions")
        .update({ status: "failed" })
        .eq("id", sessionId);

      return json(
        {
          error: "Could not reach Square.",
          details:
            fetchError instanceof Error
              ? fetchError.message
              : "Unknown network error.",
        },
        502,
      );
    }

    const squareRaw = await squareResponse.text();

    let squarePayload = {};

    if (squareRaw.trim()) {
      try {
        squarePayload = JSON.parse(squareRaw);
      } catch {
        squarePayload = {};
      }
    }

    if (
      !squareResponse.ok ||
      !squarePayload?.payment_link?.url
    ) {
      await supabase
        .from("nuphub_checkout_sessions")
        .update({ status: "failed" })
        .eq("id", sessionId);

      const squareMessage =
        squarePayload?.errors?.[0]?.detail ||
        squarePayload?.errors?.[0]?.code ||
        null;

      return json(
        {
          error: squareMessage || "Square could not create checkout.",
          details:
            safeDetail(squareRaw) ||
            `Square returned HTTP ${squareResponse.status} ${squareResponse.statusText}.`,
        },
        502,
      );
    }

    const { error: updateError } = await supabase
      .from("nuphub_checkout_sessions")
      .update({
        square_payment_link_id: squarePayload.payment_link.id,
        square_payment_link_url: squarePayload.payment_link.url,
      })
      .eq("id", sessionId);

    if (updateError) {
      return json(
        {
          error:
            "Square created the checkout link, but NupHub could not save it.",
          details: updateError.message,
        },
        500,
      );
    }

    return json({
      url: squarePayload.payment_link.url,
    });
  } catch (error) {
    console.error("NupHub Square checkout failure:", error);

    return json(
      {
        error: "Checkout failed before a Square payment link was created.",
        details:
          error instanceof Error ? error.message : "Unknown server error.",
      },
      500,
    );
  }
}
