import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";
import { SITE, absoluteUrl } from "../lib/site";
import { escapeXml } from "../lib/format";

export const GET: APIRoute = async () => {
  const { data } = await supabase
    .from("stories")
    .select("slug, title, dek, body_html, cover_url, published_at, tags, author:people!stories_author_id_fkey(name)")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (data ?? [])
    .map((s) => {
      const author = (s.author as unknown as { name: string } | null)?.name;
      const url = absoluteUrl(`/stories/${s.slug}`);
      return `<item>
  <title>${escapeXml(s.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(s.published_at!).toUTCString()}</pubDate>
  ${author ? `<dc:creator>${escapeXml(author)}</dc:creator>` : ""}
  ${s.dek ? `<description>${escapeXml(s.dek)}</description>` : ""}
  ${(s.tags as string[]).map((t) => `<category>${escapeXml(t)}</category>`).join("")}
  ${s.cover_url ? `<media:content url="${escapeXml(s.cover_url)}" medium="image"/>` : ""}
  <content:encoded><![CDATA[${(s.body_html ?? "").replaceAll("]]>", "]]&gt;")}]]></content:encoded>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>${escapeXml(SITE.name)}</title>
  <link>${SITE.url}</link>
  <description>${escapeXml(SITE.description)}</description>
  <language>${SITE.language}</language>
  <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
  <image><url>${absoluteUrl(SITE.logo)}</url><title>${escapeXml(SITE.name)}</title><link>${SITE.url}</link></image>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
};
