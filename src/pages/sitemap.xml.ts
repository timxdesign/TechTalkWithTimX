import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";
import { absoluteUrl } from "../lib/site";

const STATIC = [
  "/",
  "/stories",
  "/podcast",
  "/people",
  "/newsletter",
  "/newsletter/archive",
  "/share-your-story",
  "/about",
  "/editorial-standards",
  "/advertise",
  "/contact",
  "/privacy",
  "/terms",
];

export const GET: APIRoute = async () => {
  const [stories, episodes, people, series, issues] = await Promise.all([
    supabase.from("stories").select("slug, updated_at, tags, cover_url").order("published_at", { ascending: false }),
    supabase.from("episodes").select("slug, updated_at").order("published_at", { ascending: false }),
    supabase.from("people").select("slug, updated_at"),
    supabase.from("series").select("slug"),
    supabase.from("newsletter_issues").select("slug, sent_at"),
  ]);

  const urls: { loc: string; lastmod?: string; image?: string | null }[] = [
    ...STATIC.map((p) => ({ loc: absoluteUrl(p) })),
    ...(stories.data ?? []).map((s) => ({ loc: absoluteUrl(`/stories/${s.slug}`), lastmod: s.updated_at, image: s.cover_url })),
    ...(episodes.data ?? []).map((e) => ({ loc: absoluteUrl(`/podcast/${e.slug}`), lastmod: e.updated_at })),
    ...(people.data ?? []).map((p) => ({ loc: absoluteUrl(`/people/${p.slug}`), lastmod: p.updated_at })),
    ...(series.data ?? []).map((s) => ({ loc: absoluteUrl(`/series/${s.slug}`) })),
    ...(issues.data ?? []).map((i) => ({ loc: absoluteUrl(`/newsletter/archive/${i.slug}`), lastmod: i.sent_at })),
  ];

  const tags = new Set((stories.data ?? []).flatMap((s) => s.tags as string[]));
  for (const t of tags) urls.push({ loc: absoluteUrl(`/topics/${encodeURIComponent(t)}`) });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) =>
      `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ""}${
        u.image ? `<image:image><image:loc>${u.image}</image:loc></image:image>` : ""
      }</url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};
