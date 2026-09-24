import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function validSquareSignature(rawBody, signature) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl =
    process.env.SQUARE_WEBHOOK_URL ||
    "https://nuphub.com/api/square/webhook";

  if (!signatureKey || !signature) return false;

  const expected = crypto
    .createHmac("sha256", signatureKey)
    .update(notificationUrl + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-square-hmacsha256-signature") || "";

  if (!validSquareSignature(rawBody, signature)) {
    return json({ error: "Invalid Square signature." }, 403);
  }

  let event;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  if (event.type !== "payment.updated") {
    return json({ ok: true });
  }

  const payment = event?.data?.object?.payment;

  if (!payment || payment.status !== "COMPLETED") {
    return json({ ok: true });
  }

  const match = /^nuphub:([0-9a-f-]{36}):(pro|creator)$/i.exec(
    payment.note || "",
  );

  if (!match) {
    return json({ ok: true });
  }

  const [, sessionId, requestedPlan] = match;

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json(
      { error: "Supabase server credentials are missing." },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: checkout, error: checkoutError } = await supabase
    .from("nuphub_checkout_sessions")
    .select("id, user_id, plan, status, amount_cents")
    .eq("id", sessionId)
    .maybeSingle();

  if (checkoutError || !checkout) {
    return json({ ok: true });
  }

  if (
    checkout.plan !== requestedPlan ||
    Number(payment.total_money?.amount) !== checkout.amount_cents
  ) {
    return json({ error: "Checkout verification failed." }, 403);
  }

  if (checkout.status === "completed") {
    return json({ ok: true });
  }

  const { data: current } = await supabase
    .from("nuphub_entitlements")
    .select("plan")
    .eq("user_id", checkout.user_id)
    .maybeSingle();

  const rank = { free: 0, pro: 1, creator: 2 };
  const currentPlan = current?.plan || "free";
  const finalPlan =
    rank[currentPlan] > rank[requestedPlan]
      ? currentPlan
      : requestedPlan;

  const now = new Date().toISOString();

  const { error: entitlementError } = await supabase
    .from("nuphub_entitlements")
    .upsert({
      user_id: checkout.user_id,
      plan: finalPlan,
      source: "square",
      purchased_at: now,
      square_payment_id: payment.id,
      updated_at: now,
    });

  if (entitlementError) {
    return json({ error: entitlementError.message }, 500);
  }

  const { error: updateError } = await supabase
    .from("nuphub_checkout_sessions")
    .update({
      status: "completed",
      square_payment_id: payment.id,
      completed_at: now,
    })
    .eq("id", checkout.id);

  if (updateError) {
    return json({ error: updateError.message }, 500);
  }

  return json({ ok: true });
}
