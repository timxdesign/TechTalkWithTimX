import type { APIRoute } from "astro";
import { getAdminClient } from "../../../lib/supabase";
import { runDailyDigest } from "../../../lib/server/digest";
import { json } from "../../../lib/server/http";

// "Preview" (dry run: builds and saves today's issue) or "Send now" from the Studio.
export const POST: APIRoute = async ({ request }) => {
  const { dryRun = true } = (await request.json().catch(() => ({}))) as { dryRun?: boolean };
  try {
    return json(await runDailyDigest(await getAdminClient(), { dryRun }));
  } catch (err) {
    return json({ status: "error", error: err instanceof Error ? err.message : "Failed" }, 500);
  }
};
