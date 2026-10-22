import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const { data } = await locals.supabase!
    .from("subscribers")
    .select("email, first_name, status, frequency, source, created_at, confirmed_at, unsubscribed_at")
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  const cols = ["email", "first_name", "status", "frequency", "source", "created_at", "confirmed_at", "unsubscribed_at"] as const;
  const cell = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
};
