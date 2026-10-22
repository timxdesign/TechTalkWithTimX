import type { APIRoute } from "astro";
import { json } from "../../../lib/server/http";

// Purges edge-cached pages after an edit so changes appear immediately.
export const POST: APIRoute = async ({ request, cache }) => {
  const { tags } = (await request.json().catch(() => ({}))) as { tags?: string[] };
  const list = (tags ?? []).filter((t) => typeof t === "string" && /^[\w:-]{1,120}$/.test(t));
  if (!list.length) return json({ ok: false, error: "No tags" }, 400);
  if (cache?.enabled) {
    try {
      await cache.invalidate({ tags: list });
    } catch (err) {
      console.error("[revalidate]", err);
      return json({ ok: false, error: "Cache purge failed" }, 500);
    }
  }
  return json({ ok: true, purged: list });
};
