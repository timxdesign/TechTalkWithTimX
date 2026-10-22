export function formatDate(iso: string | null | undefined, style: "long" | "short" = "long") {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// "12:04" or "1:02:09"
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

// "48 min" / "1 hr 12 min"
export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} hr ${mins % 60} min`;
}

// ISO 8601 duration for schema.org, e.g. PT48M12S
export function isoDuration(seconds: number | null | undefined) {
  if (!seconds) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}` || "PT0S";
}

export function stripHtml(html: string | null | undefined) {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(html: string | null | undefined) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function excerpt(text: string | null | undefined, max = 160) {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max - 1)).replace(/[,.;:]$/, "") + "…";
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function episodeLabel(ep: { season: number | null; number: number | null }) {
  if (ep.number == null) return "Episode";
  return ep.season ? `S${ep.season} · E${String(ep.number).padStart(2, "0")}` : `Ep. ${String(ep.number).padStart(2, "0")}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
