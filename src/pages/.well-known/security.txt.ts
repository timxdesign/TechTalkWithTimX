import type { APIRoute } from "astro";
import { SITE, absoluteUrl } from "../../lib/site";

export const prerender = true;

// RFC 9116. Expires is a year from each build; if the site goes a year without a
// deploy, the file correctly reports itself as stale. It's computed inside the
// handler because the Workers runtime reports the clock as 0 at module load.
export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + 365 * 86_400_000).toISOString().replace(/\.\d+Z$/, "Z");
  return new Response(
    `# Found a security issue on ${SITE.name}? Please tell us privately before
# disclosing it publicly. We read every report.
Contact: mailto:${SITE.email}
Expires: ${expires}
Preferred-Languages: en
Canonical: ${absoluteUrl("/.well-known/security.txt")}
`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
