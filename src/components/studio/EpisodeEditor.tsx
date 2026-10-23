import { useState } from "react";
import { youtubeId } from "@/lib/youtube";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { studioClient } from "@/lib/supabase-browser";
import { formatClock, slugify } from "@/lib/format";
import type { Chapter, ContentStatus, Episode, Person, Series } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import { Field, MediaField, Panel, PersonSelect, PublishPanel, SeriesSelect, revalidate, toLocalInput } from "./shared";

interface Props {
  episode: Episode | null;
  people: Pick<Person, "id" | "name" | "company">[];
  series: Pick<Series, "id" | "name">[];
  stories: { id: string; title: string }[];
  nextNumber: number;
}

// "12:30 The pivot" per line  <->  [{ start: 750, title: "The pivot" }]
const chaptersToText = (chapters: Chapter[]) => chapters.map((c) => `${formatClock(c.start)} ${c.title}`).join("\n");
function parseChapters(text: string): Chapter[] {
  return text
    .split("\n")
    .map((line) => line.trim().match(/^(\d{1,2}(?::\d{2}){1,2})\s+(.+)$/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => ({ start: m[1].split(":").reduce((acc, n) => acc * 60 + Number(n), 0), title: m[2] }))
    .sort((a, b) => a.start - b.start);
}

export default function EpisodeEditor({ episode, people, series, stories, nextNumber }: Props) {
  const [id, setId] = useState(episode?.id ?? null);
  const [title, setTitle] = useState(episode?.title ?? "");
  const [slug, setSlug] = useState(episode?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(episode));
  const [dek, setDek] = useState(episode?.dek ?? "");
  const [season, setSeason] = useState(String(episode?.season ?? 1));
  const [number, setNumber] = useState(String(episode?.number ?? nextNumber));
  const [audio, setAudio] = useState(episode?.audio_url ?? "");
  const [bytes, setBytes] = useState(episode?.audio_bytes ?? null);
  const [duration, setDuration] = useState(String(episode?.duration_seconds ?? ""));
  const [video, setVideo] = useState(episode?.video_url ?? "");
  const [cover, setCover] = useState(episode?.cover_url ?? "");
  const [notes, setNotes] = useState<{ html: string }>({ html: episode?.show_notes_html ?? "" });
  const [transcript, setTranscript] = useState(episode?.transcript ?? "");
  const [chapters, setChapters] = useState(chaptersToText(episode?.chapters ?? []));
  const [guestId, setGuestId] = useState(episode?.guest_id ?? null);
  const [seriesId, setSeriesId] = useState(episode?.series_id ?? null);
  const [storyId, setStoryId] = useState(episode?.story_id ?? null);
  const [explicit, setExplicit] = useState(episode?.explicit ?? false);
  const [seoDescription, setSeoDescription] = useState(episode?.seo_description ?? "");
  const [status, setStatus] = useState<ContentStatus>(episode?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(toLocalInput(episode?.published_at ?? null));
  const [saving, setSaving] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  async function save(nextStatus?: ContentStatus) {
    const finalStatus = nextStatus ?? status;
    if (!title.trim()) return toast.error("Add a title first.");
    if (video && !youtubeId(video)) return toast.error("That YouTube link isn't recognised. Paste the video's share link.");
    if ((finalStatus === "published" || finalStatus === "scheduled") && !audio && !video)
      return toast.error("Upload the audio or add a YouTube link before publishing.");
    let when = publishedAt ? new Date(publishedAt).toISOString() : null;
    if ((finalStatus === "published" || finalStatus === "scheduled") && !when) when = new Date().toISOString();

    setSaving(true);
    const row = {
      title: title.trim(),
      slug: effectiveSlug,
      dek: dek.trim() || null,
      season: season ? Number(season) : null,
      number: number ? Number(number) : null,
      audio_url: audio || null,
      audio_bytes: bytes,
      duration_seconds: duration ? Number(duration) : null,
      video_url: video || null,
      cover_url: cover || null,
      show_notes_html: notes.html || null,
      transcript: transcript || null,
      chapters: parseChapters(chapters),
      guest_id: guestId,
      series_id: seriesId,
      story_id: storyId,
      explicit,
      seo_description: seoDescription || null,
      status: finalStatus,
      published_at: when,
    };
    const db = studioClient();
    const res = id
      ? await db.from("episodes").update(row).eq("id", id).select("id").single()
      : await db.from("episodes").insert(row).select("id").single();
    setSaving(false);
    if (res.error) {
      toast.error(res.error.code === "23505" ? "That slug or season/episode number is already taken." : res.error.message);
      return;
    }
    setStatus(finalStatus);
    setPublishedAt(toLocalInput(when));
    if (!id) {
      setId(res.data.id);
      window.history.replaceState(null, "", `/studio/episodes/${res.data.id}`);
    }
    await revalidate(["episodes", `episode:${effectiveSlug}`, "stories"]);
    toast.success(nextStatus === "published" ? "Published" : nextStatus === "scheduled" ? "Scheduled" : "Saved");
  }

  async function remove() {
    if (!id || !window.confirm("Delete this episode permanently?")) return;
    const { error } = await studioClient().from("episodes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await revalidate(["episodes"]);
    window.location.href = "/studio/episodes";
  }

  return (
    <>
    <Toaster position="bottom-right" />
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-6">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Episode title"
          rows={2}
          aria-label="Episode title"
          className="w-full resize-none bg-transparent text-4xl font-extrabold leading-tight tracking-tight outline-none placeholder:text-muted-foreground/50"
        />
        <textarea
          value={dek}
          onChange={(e) => setDek(e.target.value)}
          placeholder="One-line summary"
          rows={2}
          aria-label="Summary"
          className="w-full resize-none bg-transparent font-serif text-xl text-muted-foreground outline-none"
        />

        <Panel title="Audio">
          <MediaField
            label="Episode audio (MP3)"
            value={audio}
            folder="audio"
            accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac"
            onChange={(url, meta) => {
              setAudio(url);
              if (meta) {
                setBytes(meta.bytes);
                if (meta.duration) setDuration(String(meta.duration));
              }
            }}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Season">
              <Input inputMode="numeric" value={season} onChange={(e) => setSeason(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Episode">
              <Input inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Length (sec)" hint={duration ? formatClock(Number(duration)) : undefined}>
              <Input inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))} />
            </Field>
          </div>
          <Field label="Chapters" hint='One per line: "12:30 Title"'>
            <Textarea value={chapters} onChange={(e) => setChapters(e.target.value)} rows={5} className="font-mono text-sm" placeholder={"0:00 Intro\n4:15 The first customer"} />
          </Field>
        </Panel>

        <div>
          <h2 className="mb-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">Show notes</h2>
          <RichTextEditor content={null} html={episode?.show_notes_html} onChange={(v) => setNotes(v)} placeholder="What's in this episode, links mentioned…" compact />
        </div>

        <Field label="Transcript" hint='Blank line between paragraphs; "Name: text" adds a speaker label'>
          <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={14} className="font-serif" placeholder={"TimX: Welcome to the show.\n\nAmara: Thanks for having me."} />
        </Field>
      </div>

      <aside className="space-y-5">
        <div className="sticky top-4 z-20 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
          <Button variant="outline" onClick={() => save()} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          {status !== "published" && (
            <Button onClick={() => save(publishedAt && new Date(publishedAt) > new Date() ? "scheduled" : "published")} disabled={saving}>
              {publishedAt && new Date(publishedAt) > new Date() ? "Schedule" : "Publish"}
            </Button>
          )}
          {id && status === "published" && (
            <Button asChild variant="ghost"><a href={`/podcast/${effectiveSlug}`} target="_blank" rel="noopener">View ↗</a></Button>
          )}
        </div>

        <PublishPanel status={status} publishedAt={publishedAt} onChange={(v) => { setStatus(v.status); setPublishedAt(v.publishedAt); }} />

        <Panel title="Episode">
          <Field label="URL" hint={`/podcast/${effectiveSlug || "…"}`}>
            <Input value={effectiveSlug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
          </Field>
          <Field label="Guest">
            <PersonSelect value={guestId} onChange={setGuestId} people={people} placeholder="No guest" />
          </Field>
          <Field label="Series">
            <SeriesSelect value={seriesId} onChange={setSeriesId} series={series} />
          </Field>
          <Field label="Companion story">
            <PersonSelect
              value={storyId}
              onChange={setStoryId}
              people={stories.map((s) => ({ id: s.id, name: s.title, company: null }))}
              placeholder="None"
            />
          </Field>
          <Field label="YouTube link" hint="Plays on the site when there's no audio file. To turn it into an MP3 for Apple Podcasts and Spotify, run npm run episode:audio -- <slug>.">
            <Input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://youtu.be/…" />
          </Field>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Explicit language</span>
            <Switch checked={explicit} onCheckedChange={setExplicit} />
          </label>
        </Panel>

        <Panel title="Artwork & search">
          <MediaField label="Episode artwork" value={cover} onChange={setCover} folder="covers" accept="image/*" hint="Square, 3000×3000" />
          <Field label="Meta description" hint={`${(seoDescription || dek).length}/160`}>
            <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={dek} rows={3} />
          </Field>
        </Panel>

        {id && (
          <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={remove}>Delete episode</Button>
        )}
      </aside>
    </div>
    </>
  );
}
