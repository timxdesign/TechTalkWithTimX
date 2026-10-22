// Publishes the researched editorial stories in scripts/content/ to Supabase.
// Safe to re-run: people and stories are matched by slug and updated in place.
//   npm run stories:publish

import { createClient } from "@supabase/supabase-js";
import * as founderFiles from "./content/founder-files.mjs";
import * as thePivot from "./content/the-pivot.mjs";
import * as deepDivesBuilders from "./content/deep-dives-builders.mjs";

const db = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const groups = [founderFiles, thePivot, deepDivesBuilders];
const people = groups.flatMap((g) => g.people);
const stories = groups.flatMap((g) => g.stories);

const words = (html) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
// Spread publish dates over recent days, each at 07:00 UTC.
const publishedAt = (daysAgo) => {
  const d = new Date();
  d.setUTCHours(7, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
};

const { error: pErr } = await db.from("people").upsert(people, { onConflict: "slug", defaultToNull: false });
if (pErr) throw pErr;

const [{ data: series }, { data: allPeople }] = await Promise.all([
  db.from("series").select("id, slug"),
  db.from("people").select("id, slug"),
]);
const seriesId = Object.fromEntries(series.map((s) => [s.slug, s.id]));
const personId = Object.fromEntries(allPeople.map((p) => [p.slug, p.id]));

const rows = stories.map((s) => ({
  slug: s.slug,
  title: s.title,
  dek: s.dek,
  body: null,
  body_html: s.body,
  series_id: seriesId[s.series] ?? null,
  author_id: personId.timx ?? null,
  guest_id: personId[s.guest] ?? null,
  tags: s.tags,
  featured: Boolean(s.featured),
  reading_minutes: Math.max(1, Math.round(words(s.body) / 230)),
  status: "published",
  published_at: publishedAt(s.daysAgo),
}));

const { error: sErr } = await db.from("stories").upsert(rows, { onConflict: "slug", defaultToNull: false });
if (sErr) throw sErr;

// Only one cover story on the home page.
const featured = rows.filter((r) => r.featured).map((r) => r.slug);
if (featured.length) await db.from("stories").update({ featured: false }).not("slug", "in", `(${featured.join(",")})`);

console.log(`Published ${people.length} people and ${rows.length} stories:`);
for (const r of rows) console.log(`  ${r.reading_minutes} min  ${r.slug}`);
