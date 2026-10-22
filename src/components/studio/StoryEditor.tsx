import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { studioClient } from "@/lib/supabase-browser";
import { readingMinutes, slugify } from "@/lib/format";
import type { ContentStatus, Person, Series, Story } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import { Field, MediaField, Panel, PersonSelect, PublishPanel, SeriesSelect, revalidate, toLocalInput } from "./shared";

interface Props {
  story: Story | null;
  people: Pick<Person, "id" | "name" | "company" | "is_staff">[];
  series: Pick<Series, "id" | "name">[];
  siteUrl: string;
}

export default function StoryEditor({ story, people, series, siteUrl }: Props) {
  const [id, setId] = useState(story?.id ?? null);
  const [title, setTitle] = useState(story?.title ?? "");
  const [slug, setSlug] = useState(story?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(story));
  const [dek, setDek] = useState(story?.dek ?? "");
  const [body, setBody] = useState<{ json: unknown; html: string }>({ json: story?.body ?? null, html: story?.body_html ?? "" });
  const [cover, setCover] = useState(story?.cover_url ?? "");
  const [coverAlt, setCoverAlt] = useState(story?.cover_alt ?? "");
  const [seriesId, setSeriesId] = useState(story?.series_id ?? null);
  const [authorId, setAuthorId] = useState(story?.author_id ?? people.find((p) => p.is_staff)?.id ?? null);
  const [guestId, setGuestId] = useState(story?.guest_id ?? null);
  const [tags, setTags] = useState((story?.tags ?? []).join(", "));
  const [featured, setFeatured] = useState(story?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(story?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(story?.seo_description ?? "");
  const [status, setStatus] = useState<ContentStatus>(story?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(toLocalInput(story?.published_at ?? null));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const mark = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setDirty(true);
  };

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const minutes = useMemo(() => readingMinutes(body.html), [body.html]);
  const googleTitle = (seoTitle || title || "Untitled").slice(0, 60);
  const googleDesc = (seoDescription || dek || "").slice(0, 160);

  async function save(nextStatus?: ContentStatus) {
    const finalStatus = nextStatus ?? status;
    if (!title.trim()) return toast.error("Add a title first.");
    if (!effectiveSlug) return toast.error("Add a URL slug.");
    let when = publishedAt ? new Date(publishedAt).toISOString() : null;
    if ((finalStatus === "published" || finalStatus === "scheduled") && !when) when = new Date().toISOString();

    setSaving(true);
    const row = {
      title: title.trim(),
      slug: effectiveSlug,
      dek: dek.trim() || null,
      body: body.json,
      body_html: body.html,
      cover_url: cover || null,
      cover_alt: coverAlt || null,
      series_id: seriesId,
      author_id: authorId,
      guest_id: guestId,
      tags: tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      featured,
      reading_minutes: minutes,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      status: finalStatus,
      published_at: when,
    };
    const db = studioClient();
    const res = id
      ? await db.from("stories").update(row).eq("id", id).select("id").single()
      : await db.from("stories").insert(row).select("id").single();
    setSaving(false);

    if (res.error) {
      toast.error(res.error.code === "23505" ? "That URL slug is already used by another story." : res.error.message);
      return;
    }
    setStatus(finalStatus);
    setPublishedAt(toLocalInput(when));
    setDirty(false);
    if (!id) {
      setId(res.data.id);
      window.history.replaceState(null, "", `/studio/stories/${res.data.id}`);
    }
    await revalidate(["stories", `story:${story?.slug ?? effectiveSlug}`, `story:${effectiveSlug}`]);
    toast.success(nextStatus === "published" ? "Published" : nextStatus === "scheduled" ? "Scheduled" : "Saved");
  }

  async function remove() {
    if (!id || !window.confirm("Delete this story permanently?")) return;
    const { error } = await studioClient().from("stories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await revalidate(["stories", `story:${effectiveSlug}`]);
    window.location.href = "/studio/stories";
  }

  return (
    <>
    <Toaster position="bottom-right" />
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-6">
        <textarea
          value={title}
          onChange={(e) => mark(setTitle)(e.target.value)}
          placeholder="Headline"
          rows={2}
          className="w-full resize-none bg-transparent font-sans text-4xl font-extrabold leading-tight tracking-tight outline-none placeholder:text-muted-foreground/50 sm:text-5xl"
          aria-label="Headline"
        />
        <textarea
          value={dek}
          onChange={(e) => mark(setDek)(e.target.value)}
          placeholder="Standfirst: one or two sentences that make people want to read on."
          rows={2}
          className="w-full resize-none bg-transparent font-serif text-xl leading-snug text-muted-foreground outline-none"
          aria-label="Standfirst"
        />
        <RichTextEditor content={story?.body ?? null} html={story?.body_html} onChange={mark(setBody)} placeholder="Tell the story…" />
        <p className="text-xs text-muted-foreground">{minutes} min read</p>
      </div>

      <aside className="space-y-5">
        <div className="sticky top-4 z-20 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
          <Button onClick={() => save()} variant="outline" disabled={saving}>
            {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </Button>
          {status !== "published" && (
            <Button onClick={() => save(publishedAt && new Date(publishedAt) > new Date() ? "scheduled" : "published")} disabled={saving}>
              {publishedAt && new Date(publishedAt) > new Date() ? "Schedule" : "Publish"}
            </Button>
          )}
          {id && status === "published" && (
            <Button asChild variant="ghost">
              <a href={`/stories/${effectiveSlug}`} target="_blank" rel="noopener">View ↗</a>
            </Button>
          )}
        </div>

        <PublishPanel
          status={status}
          publishedAt={publishedAt}
          onChange={(v) => {
            setStatus(v.status);
            setPublishedAt(v.publishedAt);
            setDirty(true);
          }}
        />

        <Panel title="Story">
          <Field label="URL" hint={`/stories/${effectiveSlug || "…"}`}>
            <Input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                mark(setSlug)(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Series">
            <SeriesSelect value={seriesId} onChange={mark(setSeriesId)} series={series} />
          </Field>
          <Field label="Byline (author)">
            <PersonSelect value={authorId} onChange={mark(setAuthorId)} people={people} placeholder="No byline" />
          </Field>
          <Field label="Featured founder / builder">
            <PersonSelect value={guestId} onChange={mark(setGuestId)} people={people} placeholder="Nobody" />
          </Field>
          <Field label="Topics" hint="Comma separated">
            <Input value={tags} onChange={(e) => mark(setTags)(e.target.value)} placeholder="fintech, nigeria, hiring" />
          </Field>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Cover story on the home page</span>
            <Switch checked={featured} onCheckedChange={mark(setFeatured)} />
          </label>
        </Panel>

        <Panel title="Cover image">
          <MediaField label="Image" value={cover} onChange={mark(setCover)} folder="covers" accept="image/*" hint="1600×1200 or larger" />
          <Field label="Alt text / caption">
            <Input value={coverAlt} onChange={(e) => mark(setCoverAlt)(e.target.value)} placeholder="Amara Okafor at Balogun Market, Lagos" />
          </Field>
        </Panel>

        <Panel title="Search & sharing">
          <Field label="SEO title" hint={`${(seoTitle || title).length}/60`}>
            <Input value={seoTitle} onChange={(e) => mark(setSeoTitle)(e.target.value)} placeholder={title} />
          </Field>
          <Field label="Meta description" hint={`${(seoDescription || dek).length}/160`}>
            <Textarea value={seoDescription} onChange={(e) => mark(setSeoDescription)(e.target.value)} placeholder={dek} rows={3} />
          </Field>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="truncate text-xs text-muted-foreground">{siteUrl.replace(/^https?:\/\//, "")} › stories › {effectiveSlug}</p>
            <p className="mt-1 truncate font-semibold">{googleTitle}</p>
            <p className="mt-1 line-clamp-2 text-muted-foreground">{googleDesc || "Add a standfirst or meta description."}</p>
          </div>
        </Panel>

        {id && (
          <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={remove}>
            Delete story
          </Button>
        )}
      </aside>
    </div>
    </>
  );
}
