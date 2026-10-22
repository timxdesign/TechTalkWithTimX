import type { APIRoute } from "astro";
import { getAdminClient } from "../../../lib/supabase";

// Raw HTML of an issue. Zoho Campaigns fetches this as the campaign content
// (content_url), so it must be readable before the issue is marked as sent.
export const GET: APIRoute = async ({ params }) => {
  const db = await getAdminClient();
  const { data } = await db.from("newsletter_issues").select("html").eq("slug", params.slug ?? "").maybeSingle();
  if (!data?.html) return new Response("Not found", { status: 404 });
  return new Response(data.html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-store" },
  });
};
