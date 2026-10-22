import type { APIRoute } from "astro";
import { PUBLIC_SUPABASE_URL } from "astro:env/client";

// Serves the social card rendered by `npm run og:generate` from Supabase Storage,
// so share URLs stay on our domain. Stories without a card get the default image.
export const GET: APIRoute = async ({ params, redirect }) => {
  const slug = params.slug ?? "";
  if (!/^[a-z0-9-]+$/.test(slug)) return redirect("/og-default.png", 302);

  const res = await fetch(`${PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/og/stories/${slug}.png`);
  if (!res.ok) {
    await res.body?.cancel();
    return redirect("/og-default.png", 302);
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
