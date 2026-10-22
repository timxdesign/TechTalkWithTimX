import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";
import { SITE, absoluteUrl } from "../lib/site";
import { escapeXml } from "../lib/format";

// Google News sitemap: articles from the last 48 hours only.
export const GET: APIRoute = async () => {
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data } = await supabase
    .from("stories")
    .select("slug, title, published_at, tags")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .limit(1000);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${(data ?? [])
  .map(
    (s) => `<url><loc>${absoluteUrl(`/stories/${s.slug}`)}</loc><news:news>
  <news:publication><news:name>${escapeXml(SITE.name)}</news:name><news:language>en</news:language></news:publication>
  <news:publication_date>${new Date(s.published_at!).toISOString()}</news:publication_date>
  <news:title>${escapeXml(s.title)}</news:title>
</news:news></url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
};
