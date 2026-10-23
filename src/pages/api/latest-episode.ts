import type { APIRoute } from "astro";
import { getEpisodes } from "../../lib/content";
import { episodeLabel } from "../../lib/format";
import { youtubeId } from "../../lib/youtube";

// The newest playable episode, for the player to queue up on a visitor's first
// page of a session. Fetched by the browser so prerendered pages stay current.
export const GET: APIRoute = async () => {
  const recent = await getEpisodes({ limit: 5 });
  const ep = recent.find((e) => e.audio_url || youtubeId(e.video_url));
  const body = ep
    ? {
        slug: ep.slug,
        title: ep.title,
        audio: ep.audio_url ?? undefined,
        youtube: ep.audio_url ? undefined : (youtubeId(ep.video_url) ?? undefined),
        cover: ep.cover_url ?? undefined,
        duration: ep.duration_seconds ?? undefined,
        label: ep.number == null ? "Latest episode" : `Latest · ${episodeLabel(ep)}`,
      }
    : null;
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300, s-maxage=300" },
  });
};
