import { createClient } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "astro:env/client";

const url = PUBLIC_SUPABASE_URL;
const publishableKey = PUBLIC_SUPABASE_ANON_KEY;

// Anonymous client for public pages: RLS limits it to published content.
export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Full-access client for server code only (API routes, cron). Never import into
// a component that ships to the browser.
export async function getAdminClient() {
  const { SUPABASE_SERVICE_ROLE_KEY } = await import("astro:env/server");
  return createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Per-request client that carries the signed-in editor's session cookies.
export function getSessionClient(request: Request, cookies: AstroCookies) {
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map(({ name, value }) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(list) {
        for (const { name, value, options } of list) cookies.set(name, value, options);
      },
    },
  });
}
