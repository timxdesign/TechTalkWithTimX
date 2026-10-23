import { supabase } from "./supabase";
import type {
  EpisodeWithRefs,
  NewsletterIssue,
  Person,
  Series,
  StoryWithRefs,
} from "./types";

// RLS already hides drafts and future-dated items from the public client, so
// these queries only need to sort and join.

const STORY_SELECT = `*,
  author:people!stories_author_id_fkey(*),
  guest:people!stories_guest_id_fkey(*),
  series:series(*)`;

const STORY_CARD_SELECT = `id, slug, title, dek, cover_url, cover_alt, tags, featured, reading_minutes, published_at, updated_at,
  author:people!stories_author_id_fkey(id, slug, name),
  guest:people!stories_guest_id_fkey(id, slug, name, role, company, avatar_url),
  series:series(id, slug, name)`;

const EPISODE_SELECT = `*,
  guest:people!episodes_guest_id_fkey(*),
  series:series(*),
  story:stories!episodes_story_id_fkey(slug, title)`;

const EPISODE_CARD_SELECT = `id, slug, season, number, title, dek, audio_url, video_url, duration_seconds, cover_url, cover_alt, published_at, chapters,
  guest:people!episodes_guest_id_fkey(id, slug, name, role, company, avatar_url),
  series:series(id, slug, name)`;

export type StoryCard = Pick<
  StoryWithRefs,
  "id" | "slug" | "title" | "dek" | "cover_url" | "cover_alt" | "tags" | "featured" | "reading_minutes" | "published_at" | "updated_at"
> & {
  author: Pick<Person, "id" | "slug" | "name"> | null;
  guest: Pick<Person, "id" | "slug" | "name" | "role" | "company" | "avatar_url"> | null;
  series: Pick<Series, "id" | "slug" | "name"> | null;
};

export type EpisodeCard = Pick<
  EpisodeWithRefs,
  "id" | "slug" | "season" | "number" | "title" | "dek" | "audio_url" | "video_url" | "duration_seconds" | "cover_url" | "cover_alt" | "published_at" | "chapters"
> & {
  guest: Pick<Person, "id" | "slug" | "name" | "role" | "company" | "avatar_url"> | null;
  series: Pick<Series, "id" | "slug" | "name"> | null;
};

function unwrap<T>(result: { data: T | null; error: { message: string } | null }, fallback: T): T {
  if (result.error) {
    console.error("[content]", result.error.message);
    return fallback;
  }
  return result.data ?? fallback;
}

// ─── Stories ────────────────────────────────────────────────────────────────

export async function getLatestStories({ limit = 12, offset = 0 } = {}) {
  const res = await supabase
    .from("stories")
    .select(STORY_CARD_SELECT, { count: "exact" })
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return { stories: unwrap(res, []) as unknown as StoryCard[], total: res.count ?? 0 };
}

export async function getFeaturedStories(limit = 3) {
  const res = await supabase
    .from("stories")
    .select(STORY_CARD_SELECT)
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return unwrap(res, []) as unknown as StoryCard[];
}

export async function getStoryBySlug(slug: string) {
  const res = await supabase.from("stories").select(STORY_SELECT).eq("slug", slug).maybeSingle();
  return unwrap(res, null) as StoryWithRefs | null;
}

export async function getEpisodeForStory(storyId: string) {
  const res = await supabase
    .from("episodes")
    .select(EPISODE_CARD_SELECT)
    .eq("story_id", storyId)
    .limit(1)
    .maybeSingle();
  return unwrap(res, null) as unknown as EpisodeCard | null;
}

export async function getRelatedStories(story: StoryWithRefs, limit = 3) {
  let query = supabase.from("stories").select(STORY_CARD_SELECT).neq("id", story.id);
  if (story.series_id) query = query.eq("series_id", story.series_id);
  else if (story.tags.length) query = query.overlaps("tags", story.tags);
  const res = await query.order("published_at", { ascending: false }).limit(limit);
  const related = unwrap(res, []) as unknown as StoryCard[];
  if (related.length >= limit) return related;
  // Top up with the latest stories so the rail is never empty.
  const { stories } = await getLatestStories({ limit: limit + 1 });
  const seen = new Set([story.id, ...related.map((s) => s.id)]);
  return [...related, ...stories.filter((s) => !seen.has(s.id))].slice(0, limit);
}

export async function getStoriesByTag(tag: string) {
  const res = await supabase
    .from("stories")
    .select(STORY_CARD_SELECT)
    .contains("tags", [tag])
    .order("published_at", { ascending: false });
  return unwrap(res, []) as unknown as StoryCard[];
}

export async function getAllTags() {
  const res = await supabase.from("stories").select("tags");
  const counts = new Map<string, number>();
  for (const row of unwrap(res, []) as { tags: string[] }[]) {
    for (const tag of row.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
}

// ─── Episodes ───────────────────────────────────────────────────────────────

export async function getEpisodes({ limit = 50, offset = 0 } = {}) {
  const res = await supabase
    .from("episodes")
    .select(EPISODE_CARD_SELECT)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return unwrap(res, []) as unknown as EpisodeCard[];
}

export async function getEpisodeBySlug(slug: string) {
  const res = await supabase.from("episodes").select(EPISODE_SELECT).eq("slug", slug).maybeSingle();
  return unwrap(res, null) as EpisodeWithRefs | null;
}

// ─── People ─────────────────────────────────────────────────────────────────

export async function getPeople() {
  const res = await supabase.from("people").select("*").order("name");
  return unwrap(res, []) as Person[];
}

export async function getPersonBySlug(slug: string) {
  const res = await supabase.from("people").select("*").eq("slug", slug).maybeSingle();
  const person = unwrap(res, null) as Person | null;
  if (!person) return null;
  const [stories, episodes] = await Promise.all([
    supabase
      .from("stories")
      .select(STORY_CARD_SELECT)
      .or(`guest_id.eq.${person.id},author_id.eq.${person.id}`)
      .order("published_at", { ascending: false }),
    supabase
      .from("episodes")
      .select(EPISODE_CARD_SELECT)
      .eq("guest_id", person.id)
      .order("published_at", { ascending: false }),
  ]);
  return {
    person,
    stories: unwrap(stories, []) as unknown as StoryCard[],
    episodes: unwrap(episodes, []) as unknown as EpisodeCard[],
  };
}

// People who have appeared as a guest on something published, newest first.
export async function getFeaturedGuests(limit = 6) {
  const res = await supabase
    .from("stories")
    .select("published_at, guest:people!stories_guest_id_fkey(*)")
    .not("guest_id", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit * 3);
  const seen = new Set<string>();
  const guests: Person[] = [];
  for (const row of unwrap(res, []) as unknown as { guest: Person | null }[]) {
    if (row.guest && !seen.has(row.guest.id)) {
      seen.add(row.guest.id);
      guests.push(row.guest);
    }
  }
  return guests.slice(0, limit);
}

// ─── Series ─────────────────────────────────────────────────────────────────

export async function getSeriesList() {
  const res = await supabase.from("series").select("*").order("sort_order");
  return unwrap(res, []) as Series[];
}

export async function getSeriesBySlug(slug: string) {
  const res = await supabase.from("series").select("*").eq("slug", slug).maybeSingle();
  const series = unwrap(res, null) as Series | null;
  if (!series) return null;
  const [stories, episodes] = await Promise.all([
    supabase
      .from("stories")
      .select(STORY_CARD_SELECT)
      .eq("series_id", series.id)
      .order("published_at", { ascending: false }),
    supabase
      .from("episodes")
      .select(EPISODE_CARD_SELECT)
      .eq("series_id", series.id)
      .order("published_at", { ascending: false }),
  ]);
  return {
    series,
    stories: unwrap(stories, []) as unknown as StoryCard[],
    episodes: unwrap(episodes, []) as unknown as EpisodeCard[],
  };
}

// ─── Search ─────────────────────────────────────────────────────────────────

export async function search(q: string) {
  const term = q.trim().replace(/[%_,()]/g, " ").slice(0, 80);
  if (term.length < 2) return { stories: [], episodes: [], people: [] };
  const like = `%${term}%`;
  const [stories, episodes, people] = await Promise.all([
    supabase
      .from("stories")
      .select(STORY_CARD_SELECT)
      .or(`title.ilike.${like},dek.ilike.${like}`)
      .order("published_at", { ascending: false })
      .limit(20),
    supabase
      .from("episodes")
      .select(EPISODE_CARD_SELECT)
      .or(`title.ilike.${like},dek.ilike.${like}`)
      .order("published_at", { ascending: false })
      .limit(10),
    supabase.from("people").select("*").or(`name.ilike.${like},company.ilike.${like}`).limit(10),
  ]);
  return {
    stories: unwrap(stories, []) as unknown as StoryCard[],
    episodes: unwrap(episodes, []) as unknown as EpisodeCard[],
    people: unwrap(people, []) as Person[],
  };
}

// ─── Newsletter ─────────────────────────────────────────────────────────────

export async function getNewsletterIssues(limit = 60) {
  const res = await supabase
    .from("newsletter_issues")
    .select("id, slug, subject, preview_text, sent_at, created_at")
    .order("sent_at", { ascending: false })
    .limit(limit);
  return unwrap(res, []) as NewsletterIssue[];
}

export async function getNewsletterIssue(slug: string) {
  const res = await supabase.from("newsletter_issues").select("*").eq("slug", slug).maybeSingle();
  return unwrap(res, null) as NewsletterIssue | null;
}
