import { useRef, useState, type ReactNode } from "react";
import { readJson } from "@/lib/read-json";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studioClient } from "@/lib/supabase-browser";
import type { ContentStatus } from "@/lib/types";

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

// Purges cached public pages after a save so the change is live immediately.
export async function revalidate(tags: string[]) {
  try {
    await fetch("/api/studio/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  } catch {}
}

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time.
export const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function PublishPanel({
  status,
  publishedAt,
  onChange,
}: {
  status: ContentStatus;
  publishedAt: string;
  onChange: (next: { status: ContentStatus; publishedAt: string }) => void;
}) {
  const future = publishedAt && new Date(publishedAt).getTime() > Date.now();
  return (
    <Panel title="Publishing">
      <Field label="Status">
        <Select value={status} onValueChange={(v) => onChange({ status: v as ContentStatus, publishedAt })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Publish date" hint={status === "scheduled" || future ? "Goes live automatically" : undefined}>
        <Input type="datetime-local" value={publishedAt} onChange={(e) => onChange({ status, publishedAt: e.target.value })} />
      </Field>
    </Panel>
  );
}

interface Uploaded {
  url: string;
  bytes: number;
  duration?: number;
}

export async function uploadFile(file: File, folder: "covers" | "avatars" | "audio" | "inline"): Promise<Uploaded> {
  const res = await fetch("/api/studio/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
  });
  const signed = await readJson<{ path?: string; token?: string; publicUrl?: string; error?: string }>(res);
  if (!res.ok || !signed.path) throw new Error(signed.error ?? "Upload failed");
  const { error } = await studioClient().storage.from("media").uploadToSignedUrl(signed.path, signed.token!, file, {
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  let duration: number | undefined;
  if (file.type.startsWith("audio/")) {
    duration = await new Promise<number | undefined>((resolve) => {
      const a = new Audio();
      a.preload = "metadata";
      a.onloadedmetadata = () => resolve(Math.round(a.duration));
      a.onerror = () => resolve(undefined);
      a.src = URL.createObjectURL(file);
    });
  }
  return { url: signed.publicUrl!, bytes: file.size, duration };
}

export function MediaField({
  label,
  value,
  onChange,
  folder,
  accept,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string, meta?: { bytes: number; duration?: number }) => void;
  folder: "covers" | "avatars" | "audio";
  accept: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const isAudio = folder === "audio";

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const up = await uploadFile(file, folder);
      onChange(up.url, { bytes: up.bytes, duration: up.duration });
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label={label} hint={hint}>
      {value && !isAudio && <img src={value} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />}
      {value && isAudio && <audio src={value} controls className="w-full" preload="none" />}
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https:// or upload" />
        <input ref={input} type="file" accept={accept} hidden onChange={(e) => pick(e.target.files?.[0])} />
        <Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </Field>
  );
}

type PersonOption = { id: string; name: string; company: string | null };

export function PersonSelect({
  value,
  onChange,
  people,
  placeholder = "None",
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  people: PersonOption[];
  placeholder?: string;
}) {
  return (
    <Select value={value ?? "none"} onValueChange={(v) => onChange(v === "none" ? null : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{placeholder}</SelectItem>
        {people.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
            {p.company ? `, ${p.company}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SeriesSelect({
  value,
  onChange,
  series,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  series: { id: string; name: string }[];
}) {
  return (
    <Select value={value ?? "none"} onValueChange={(v) => onChange(v === "none" ? null : v)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No series</SelectItem>
        {series.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
