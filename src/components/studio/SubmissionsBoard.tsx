import { useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studioClient } from "@/lib/supabase-browser";
import type { Submission, SubmissionStatus } from "@/lib/types";

const STATUSES: SubmissionStatus[] = ["new", "reviewing", "accepted", "declined"];
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function SubmissionsBoard({ initial }: { initial: Submission[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<SubmissionStatus | "all">("new");
  const [open, setOpen] = useState<string | null>(typeof window !== "undefined" ? window.location.hash.slice(1) || null : null);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, items.filter((i) => i.status === s).length])), [items]);
  const visible = filter === "all" ? items : items.filter((i) => i.status === filter);

  async function update(id: string, patch: Partial<Submission>) {
    const { error } = await studioClient().from("submissions").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    toast.success("Updated");
  }

  return (
    <div>
      <Toaster position="bottom-right" />
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s} <span className="ml-1.5 text-muted-foreground">{counts[s]}</span>
            </TabsTrigger>
          ))}
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
        {visible.length === 0 && <li className="p-10 text-center text-muted-foreground">Nothing here.</li>}
        {visible.map((s) => (
          <li key={s.id} id={s.id}>
            <button type="button" onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full items-start gap-4 p-5 text-left hover:bg-muted/50" aria-expanded={open === s.id}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {s.name}
                  {s.company && <span className="font-normal text-muted-foreground">, {s.company}</span>}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{s.pitch}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge variant={s.status === "new" ? "default" : "secondary"} className="capitalize">{s.status}</Badge>
                <span className="text-xs text-muted-foreground">{fmt(s.created_at)}</span>
              </div>
            </button>
            {open === s.id && (
              <div className="space-y-5 border-t border-border bg-muted/30 p-5">
                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
                  <dt className="text-muted-foreground">Email</dt><dd><a href={`mailto:${s.email}`} className="underline">{s.email}</a></dd>
                  {s.role && <><dt className="text-muted-foreground">Role</dt><dd>{s.role}</dd></>}
                  {s.stage && <><dt className="text-muted-foreground">Stage</dt><dd>{s.stage}</dd></>}
                  {s.location && <><dt className="text-muted-foreground">Based in</dt><dd>{s.location}</dd></>}
                  {s.company_url && <><dt className="text-muted-foreground">Website</dt><dd><a href={s.company_url} target="_blank" rel="noopener noreferrer" className="underline">{s.company_url}</a></dd></>}
                  {s.links.length > 0 && (
                    <><dt className="text-muted-foreground">Links</dt><dd className="space-y-1">{s.links.map((l) => <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="block truncate underline">{l}</a>)}</dd></>
                  )}
                </dl>
                <p className="whitespace-pre-line font-serif text-lg leading-relaxed">{s.pitch}</p>
                <Textarea
                  defaultValue={s.editor_notes ?? ""}
                  placeholder="Private editor notes"
                  onBlur={(e) => e.target.value !== (s.editor_notes ?? "") && update(s.id, { editor_notes: e.target.value })}
                />
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter((st) => st !== s.status).map((st) => (
                    <Button key={st} size="sm" variant={st === "accepted" ? "default" : "outline"} onClick={() => update(s.id, { status: st })} className="capitalize">
                      Mark {st}
                    </Button>
                  ))}
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`mailto:${s.email}?subject=${encodeURIComponent("Your story on Tech Talk with TimX")}`}>Reply by email</a>
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
