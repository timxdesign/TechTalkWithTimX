import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /studio
Disallow: /api/
Disallow: /search
Disallow: /newsletter/email/

Sitemap: ${absoluteUrl("/sitemap.xml")}
Sitemap: ${absoluteUrl("/news-sitemap.xml")}
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
