import type { APIRoute } from "astro";
import { getAdminClient } from "../../../lib/supabase";
import { addToNewsletterList } from "../../../lib/server/zoho";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export const GET: APIRoute = async ({ url, redirect }) => {
  const token = url.searchParams.get("token") ?? "";
  if (!UUID_RE.test(token)) return redirect("/newsletter?status=invalid", 303);

  const db = await getAdminClient();
  const { data: sub } = await db
    .from("subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("confirm_token", token)
    .neq("status", "confirmed")
    .select("id, email, first_name")
    .maybeSingle();

  if (sub) {
    try {
      if (await addToNewsletterList(sub.email, sub.first_name)) {
        await db.from("subscribers").update({ zoho_synced_at: new Date().toISOString() }).eq("id", sub.id);
      }
    } catch (err) {
      // The subscriber is confirmed either way; the digest job retries unsynced rows.
      console.error("[confirm] Zoho sync failed", err);
    }
  }

  return redirect("/newsletter/confirmed", 303);
};
