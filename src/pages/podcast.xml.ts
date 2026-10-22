import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";
import { SITE, absoluteUrl } from "../lib/site";
import { escapeXml, stripHtml } from "../lib/format";

// Apple Podcasts / Spotify compatible feed. Submit this URL to each directory.
export const GET: APIRoute = async () => {
  const { data } = await supabase
    .from("episodes")
    .select("id, slug, season, number, title, dek, audio_url, audio_bytes, duration_seconds, cover_url, show_notes_html, explicit, published_at")
    .not("audio_url", "is", null)
    .order("published_at", { ascending: false })
    .limit(300);

  const cover = absoluteUrl(SITE.podcast.cover);
  const items = (data ?? [])
    .map((ep) => {
      const url = absoluteUrl(`/podcast/${ep.slug}`);
      const notes = ep.show_notes_html ?? (ep.dek ? `<p>${escapeXml(ep.dek)}</p>` : "");
      return `<item>
  <title>${escapeXml(ep.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="false">${ep.id}</guid>
  <pubDate>${new Date(ep.published_at!).toUTCString()}</pubDate>
  <description><![CDATA[${notes}]]></description>
  <itunes:summary>${escapeXml(ep.dek ?? stripHtml(notes).slice(0, 3900))}</itunes:summary>
  <enclosure url="${escapeXml(ep.audio_url!)}" length="${ep.audio_bytes ?? 0}" type="audio/mpeg"/>
  ${ep.duration_seconds ? `<itunes:duration>${ep.duration_seconds}</itunes:duration>` : ""}
  ${ep.season ? `<itunes:season>${ep.season}</itunes:season>` : ""}
  ${ep.number ? `<itunes:episode>${ep.number}</itunes:episode>` : ""}
  <itunes:episodeType>full</itunes:episodeType>
  <itunes:explicit>${ep.explicit ? "true" : "false"}</itunes:explicit>
  <itunes:image href="${escapeXml(ep.cover_url ?? cover)}"/>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:podcast="https://podcastindex.org/namespace/1.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeXml(SITE.podcast.title)}</title>
  <link>${absoluteUrl("/podcast")}</link>
  <atom:link href="${absoluteUrl("/podcast.xml")}" rel="self" type="application/rss+xml"/>
  <language>${SITE.language}</language>
  <copyright>© ${new Date().getFullYear()} ${escapeXml(SITE.name)}</copyright>
  <description>${escapeXml(SITE.description)}</description>
  <itunes:summary>${escapeXml(SITE.description)}</itunes:summary>
  <itunes:author>${escapeXml(SITE.podcast.author)}</itunes:author>
  <itunes:owner><itunes:name>${escapeXml(SITE.podcast.author)}</itunes:name><itunes:email>${SITE.email}</itunes:email></itunes:owner>
  <itunes:image href="${cover}"/>
  <image><url>${cover}</url><title>${escapeXml(SITE.podcast.title)}</title><link>${absoluteUrl("/podcast")}</link></image>
  <itunes:category text="${SITE.podcast.category}"><itunes:category text="${SITE.podcast.subcategory}"/></itunes:category>
  <itunes:explicit>false</itunes:explicit>
  <itunes:type>episodic</itunes:type>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600" },
  });
};
