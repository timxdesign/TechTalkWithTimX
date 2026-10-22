export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const clean = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const clientIp = (request: Request) => request.headers.get("CF-Connecting-IP");
