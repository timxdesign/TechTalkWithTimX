import type { APIRoute } from "astro";
import { CRON_SECRET } from "astro:env/server";
import { getAdminClient } from "../../../lib/supabase";
import { runDailyDigest } from "../../../lib/server/digest";
import { json } from "../../../lib/server/http";

// Called each morning by workers/cron-newsletter with the shared CRON_SECRET.
export const POST: APIRoute = async ({ request }) => {
  if (!CRON_SECRET || request.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return json({ error: "Unauthorized" }, 401);
  }
  try {
    const result = await runDailyDigest(await getAdminClient());
    return json(result);
  } catch (err) {
    console.error("[cron] digest failed", err);
    return json({ error: err instanceof Error ? err.message : "Digest failed" }, 500);
  }
};
