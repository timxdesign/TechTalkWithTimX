import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE } from "../site";
import { episodeLabel, formatDuration } from "../format";
import { addToNewsletterList, sendCampaign, zohoConfigured } from "./zoho";

// Builds and sends the daily digest: everything published in the last 24 hours.
// Called by the Cloudflare cron worker and by "Send now" in the Studio.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

interface DigestStory {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  reading_minutes: number | null;
  series: { name: string } | null;
}
interface DigestEpisode {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  season: number | null;
  number: number | null;
  duration_seconds: number | null;
}

export function digestHtml({ date, stories, episodes }: { date: string; stories: DigestStory[]; episodes: DigestEpisode[] }) {
  const [lead, ...rest] = stories;
  const storyBlock = (s: DigestStory, big = false) => `
  <tr><td style="padding:${big ? "0 0 28px" : "22px 0"};${big ? "" : "border-top:1px solid #e4e4e4;"}">
    <p style="margin:0 0 8px;font:500 11px/1 'Courier New',monospace;letter-spacing:.1em;text-transform:uppercase;color:#6b6b6b;">${esc(s.series?.name ?? "Story")}${s.reading_minutes ? ` · ${s.reading_minutes} min read` : ""}</p>
    <a href="${SITE.url}/stories/${s.slug}" style="text-decoration:none;color:#000;"><span style="font:800 ${big ? "30px/1.1" : "21px/1.2"} Arial,Helvetica,sans-serif;letter-spacing:-0.02em;">${esc(s.title)}</span></a>
    ${s.dek ? `<p style="margin:10px 0 0;font:400 ${big ? "18px" : "16px"}/1.55 Georgia,serif;color:#2b2b2b;">${esc(s.dek)}</p>` : ""}
    <p style="margin:12px 0 0;"><a href="${SITE.url}/stories/${s.slug}" style="font:700 14px Arial,sans-serif;color:#000;">Read the story →</a></p>
  </td></tr>`;

  const episodeBlock = (e: DigestEpisode) => `
  <tr><td style="padding:24px;background:#000;">
    <p style="margin:0 0 8px;font:500 11px/1 'Courier New',monospace;letter-spacing:.1em;text-transform:uppercase;color:#9a9a9a;">New episode · ${esc(episodeLabel(e))}${e.duration_seconds ? ` · ${formatDuration(e.duration_seconds)}` : ""}</p>
    <a href="${SITE.url}/podcast/${e.slug}" style="text-decoration:none;color:#fff;"><span style="font:800 22px/1.2 Arial,Helvetica,sans-serif;">${esc(e.title)}</span></a>
    ${e.dek ? `<p style="margin:10px 0 0;font:400 16px/1.55 Georgia,serif;color:#cfcfcf;">${esc(e.dek)}</p>` : ""}
    <p style="margin:14px 0 0;"><a href="${SITE.url}/podcast/${e.slug}" style="display:inline-block;background:#fff;color:#000;border-radius:999px;padding:10px 18px;font:700 14px Arial,sans-serif;text-decoration:none;">▶ Listen</a></p>
  </td></tr><tr><td style="height:12px"></td></tr>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(SITE.name)}: ${esc(date)}</title></head>
<body style="margin:0;background:#f4f4f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;">
  <tr><td style="background:#000;padding:26px 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="background:#fff;width:22px;height:22px;text-align:center;font:900 15px/22px Arial,sans-serif;color:#000;">T</td><td width="4"></td>
      <td style="background:#fff;width:22px;height:22px;text-align:center;font:900 15px/22px Arial,sans-serif;color:#000;">T</td><td width="4"></td>
      <td style="background:#fff;width:22px;height:22px;text-align:center;font:900 15px/22px Arial,sans-serif;color:#000;">T</td>
      <td style="padding-left:14px;font:800 13px/1 Arial,sans-serif;text-transform:uppercase;color:#fff;">The Daily Brief</td>
    </tr></table>
    <p style="margin:18px 0 0;font:500 11px/1 'Courier New',monospace;letter-spacing:.1em;text-transform:uppercase;color:#9a9a9a;">${esc(date)}</p>
  </td></tr>
  <tr><td style="padding:32px 32px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${lead ? storyBlock(lead, true) : ""}
    ${episodes.map(episodeBlock).join("")}
    ${rest.map((s) => storyBlock(s)).join("")}
  </table></td></tr>
  <tr><td style="padding:24px 32px 32px;border-top:1px solid #e4e4e4;">
    <p style="margin:0 0 6px;font:700 15px Arial,sans-serif;color:#000;">Building something?</p>
    <p style="margin:0;font:400 15px/1.5 Georgia,serif;color:#2b2b2b;">We'd love to hear the story. <a href="${SITE.url}/share-your-story" style="color:#000;">Tell us about it →</a></p>
  </td></tr>
  <tr><td style="padding:20px 32px;background:#f4f4f4;font:400 12px/1.6 Arial,sans-serif;color:#6b6b6b;">
    You're receiving this because you subscribed at ${SITE.url.replace(/^https?:\/\//, "")}.<br>
    <a href="$[LI:UNSUBSCRIBE]$" style="color:#000;">Unsubscribe</a> · <a href="${SITE.url}/newsletter/archive" style="color:#000;">Archive</a>
  </td></tr>
</table></td></tr></table></body></html>`;
}

export async function runDailyDigest(db: SupabaseClient, { dryRun = false } = {}) {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const now = new Date().toISOString();
  const slug = now.slice(0, 10);

  const { data: existing } = await db.from("newsletter_issues").select("id, sent_at").eq("slug", slug).maybeSingle();
  if (existing?.sent_at) return { status: "already-sent" as const, slug };

  const [{ data: stories }, { data: episodes }] = await Promise.all([
    db
      .from("stories")
      .select("id, slug, title, dek, reading_minutes, series:series(name)")
      .in("status", ["published", "scheduled"])
      .gte("published_at", since)
      .lte("published_at", now)
      .order("published_at", { ascending: false }),
    db
      .from("episodes")
      .select("id, slug, title, dek, season, number, duration_seconds")
      .in("status", ["published", "scheduled"])
      .gte("published_at", since)
      .lte("published_at", now)
      .order("published_at", { ascending: false }),
  ]);

  const s = (stories ?? []) as unknown as DigestStory[];
  const e = (episodes ?? []) as DigestEpisode[];
  if (!s.length && !e.length) return { status: "nothing-new" as const, slug };

  const date = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date());
  const subject = s[0]?.title ?? e[0]!.title;
  const preview = s[0]?.dek ?? e[0]?.dek ?? "Today's stories from the people building tech.";
  const html = digestHtml({ date, stories: s, episodes: e });

  const { error } = await db.from("newsletter_issues").upsert(
    { slug, subject, preview_text: preview, html, story_ids: s.map((x) => x.id), episode_ids: e.map((x) => x.id) },
    { onConflict: "slug" },
  );
  if (error) throw error;
  if (dryRun) return { status: "dry-run" as const, slug, subject };

  // Make sure every confirmed subscriber is on the Zoho list before sending.
  const { data: unsynced } = await db
    .from("subscribers")
    .select("id, email, first_name")
    .eq("status", "confirmed")
    .is("zoho_synced_at", null)
    .limit(500);
  for (const sub of unsynced ?? []) {
    try {
      await addToNewsletterList(sub.email, sub.first_name);
      await db.from("subscribers").update({ zoho_synced_at: new Date().toISOString() }).eq("id", sub.id);
    } catch (err) {
      console.error("[digest] sync failed", sub.email, err);
    }
  }

  if (!zohoConfigured()) return { status: "saved-not-sent" as const, slug, subject, reason: "Zoho Campaigns not configured" };

  const campaignKey = await sendCampaign({
    name: `Daily Brief ${slug}`,
    subject,
    contentUrl: `${SITE.url}/newsletter/email/${slug}`,
  });
  await db.from("newsletter_issues").update({ sent_at: new Date().toISOString(), zoho_campaign_key: campaignKey }).eq("slug", slug);
  return { status: "sent" as const, slug, subject };
}
