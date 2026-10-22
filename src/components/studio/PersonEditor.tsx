import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { studioClient } from "@/lib/supabase-browser";
import { slugify } from "@/lib/format";
import type { Person } from "@/lib/types";
import { Field, MediaField, Panel, revalidate } from "./shared";

export default function PersonEditor({ person }: { person: Person | null }) {
  const [id, setId] = useState(person?.id ?? null);
  const [f, setF] = useState({
    name: person?.name ?? "",
    slug: person?.slug ?? "",
    role: person?.role ?? "",
    company: person?.company ?? "",
    location: person?.location ?? "",
    bio: person?.bio ?? "",
    avatar_url: person?.avatar_url ?? "",
    website_url: person?.website_url ?? "",
    linkedin_url: person?.linkedin_url ?? "",
    x_handle: person?.x_handle ?? "",
    is_staff: person?.is_staff ?? false,
  });
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof typeof f>(k: K) => (v: (typeof f)[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const slug = f.slug || slugify(f.name);

  async function save() {
    if (!f.name.trim()) return toast.error("Add a name.");
    setSaving(true);
    const row = Object.fromEntries(
      Object.entries({ ...f, slug }).map(([k, v]) => [k, typeof v === "string" ? v.trim() || null : v]),
    );
    row.name = f.name.trim();
    row.slug = slug;
    const db = studioClient();
    const res = id
      ? await db.from("people").update(row).eq("id", id).select("id").single()
      : await db.from("people").insert(row).select("id").single();
    setSaving(false);
    if (res.error) return toast.error(res.error.code === "23505" ? "That URL is already used." : res.error.message);
    if (!id) {
      setId(res.data.id);
      window.history.replaceState(null, "", `/studio/people/${res.data.id}`);
    }
    await revalidate(["people", `person:${slug}`, "stories", "episodes"]);
    toast.success("Saved");
  }

  async function remove() {
    if (!id || !window.confirm("Delete this person? Their stories and episodes stay, without a link to them.")) return;
    const { error } = await studioClient().from("people").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await revalidate(["people"]);
    window.location.href = "/studio/people";
  }

  return (
    <>
    <Toaster position="bottom-right" />
    <div className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <Panel title="Profile">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name"><Input value={f.name} onChange={(e) => set("name")(e.target.value)} /></Field>
            <Field label="URL" hint={`/people/${slug || "…"}`}><Input value={slug} onChange={(e) => set("slug")(slugify(e.target.value))} /></Field>
            <Field label="Role"><Input value={f.role} onChange={(e) => set("role")(e.target.value)} placeholder="Co-founder & CEO" /></Field>
            <Field label="Company"><Input value={f.company} onChange={(e) => set("company")(e.target.value)} /></Field>
            <Field label="Location"><Input value={f.location} onChange={(e) => set("location")(e.target.value)} placeholder="Lagos, Nigeria" /></Field>
          </div>
          <Field label="Bio" hint="Two or three sentences, third person">
            <Textarea value={f.bio} onChange={(e) => set("bio")(e.target.value)} rows={5} className="font-serif" />
          </Field>
        </Panel>
        <Panel title="Links">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Website"><Input value={f.website_url} onChange={(e) => set("website_url")(e.target.value)} placeholder="https://" /></Field>
            <Field label="LinkedIn"><Input value={f.linkedin_url} onChange={(e) => set("linkedin_url")(e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
            <Field label="X handle"><Input value={f.x_handle} onChange={(e) => set("x_handle")(e.target.value.replace(/^@/, ""))} placeholder="handle" /></Field>
          </div>
        </Panel>
      </div>
      <aside className="space-y-5">
        <div className="flex gap-2 rounded-xl border border-border bg-card p-3">
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          {id && <Button asChild variant="ghost"><a href={`/people/${slug}`} target="_blank" rel="noopener">View ↗</a></Button>}
        </div>
        <Panel title="Photo">
          <MediaField label="Headshot" value={f.avatar_url} onChange={(url) => set("avatar_url")(url)} folder="avatars" accept="image/*" hint="Square" />
        </Panel>
        <Panel title="Team">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Staff / host</span>
            <Switch checked={f.is_staff} onCheckedChange={set("is_staff")} />
          </label>
        </Panel>
        {id && <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={remove}>Delete person</Button>}
      </aside>
    </div>
    </>
  );
}
