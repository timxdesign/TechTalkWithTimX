import type { APIRoute } from "astro";
import { getAdminClient } from "../../lib/supabase";
import { verifyTurnstile } from "../../lib/server/turnstile";
import { confirmSubscriptionEmail, sendEmail } from "../../lib/server/email";
import { EMAIL_RE, clean, clientIp, json } from "../../lib/server/http";
import { SITE } from "../../lib/site";

// Double opt-in: store as "pending" and email a confirmation link.
export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (clean(body.website)) return json({ ok: true }); // honeypot

  const email = clean(body.email, 254).toLowerCase();
  const firstName = clean(body.first_name, 80) || null;
  const source = clean(body.source, 80) || "site";
  const frequency = body.frequency === "weekly" ? "weekly" : "daily";

  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please enter a valid email address." }, 400);
  if (!(await verifyTurnstile(clean(body.token, 4096), clientIp(request)))) {
    return json({ ok: false, error: "We couldn't verify you're human. Please try again." }, 400);
  }

  const db = await getAdminClient();
  const { data: existing } = await db
    .from("subscribers")
    .select("id, status, confirm_token")
    .eq("email", email)
    .maybeSingle();

  if (existing?.status === "confirmed") {
    return json({ ok: true, status: "already" });
  }

  let token = existing?.confirm_token as string | undefined;
  if (existing) {
    const { data } = await db
      .from("subscribers")
      .update({ status: "pending", first_name: firstName, frequency, source, unsubscribed_at: null })
      .eq("id", existing.id)
      .select("confirm_token")
      .single();
    token = data?.confirm_token;
  } else {
    const { data, error } = await db
      .from("subscribers")
      .insert({ email, first_name: firstName, frequency, source })
      .select("confirm_token")
      .single();
    if (error) {
      console.error("[subscribe]", error.message);
      return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
    }
    token = data.confirm_token;
  }

  const confirmUrl = `${SITE.url}/api/newsletter/confirm?token=${token}`;
  const { sent } = await sendEmail({
    to: email,
    toName: firstName ?? undefined,
    subject: "Confirm your Tech Talk with TimX subscription",
    html: confirmSubscriptionEmail(confirmUrl, firstName),
  });
  if (!sent && import.meta.env.DEV) console.info(`[subscribe] confirm link: ${confirmUrl}`);

  return json({ ok: true, status: "pending" });
};
