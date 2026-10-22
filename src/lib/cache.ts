import type { AstroGlobal } from "astro";

// Edge-cache a public page. Tags let the Studio purge exactly what changed:
// "stories", "episodes", "people", "series", "newsletter", plus per-item tags
// such as "story:<slug>". Cache is a no-op in dev.
export function cachePage(Astro: AstroGlobal, tags: string[], maxAge = 300) {
  if (!Astro.cache?.enabled) return;
  Astro.cache.set({ maxAge, swr: 86_400, tags: ["site", ...tags] });
}
