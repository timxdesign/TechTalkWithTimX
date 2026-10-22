import type { APIRoute } from "astro";
import { getAdminClient } from "../../../lib/supabase";
import { removeFromNewsletterList } from "../../../lib/server/zoho";

const UUID_RE = /^[0-9a-f-]{36}$/i;

// POST only, from the confirmation form on /newsletter/unsubscribe, so link
// scanners in inboxes can't unsubscribe people by prefetching a URL.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  if (!UUID_RE.test(token)) return redirect("/newsletter?status=invalid", 303);

  const db = await getAdminClient();
  const { data: sub } = await db
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("confirm_token", token)
    .select("email")
    .maybeSingle();

  if (sub) {
    try {
      await removeFromNewsletterList(sub.email);
    } catch (err) {
      console.error("[unsubscribe] Zoho sync failed", err);
    }
  }
  return redirect("/newsletter/unsubscribe?done=1", 303);
};
