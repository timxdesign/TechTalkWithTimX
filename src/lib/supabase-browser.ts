import { createBrowserClient } from "@supabase/ssr";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "astro:env/client";

// Studio islands use this client: it carries the editor's session cookie, so
// every read and write goes through the editors-only RLS policies.
let client: ReturnType<typeof createBrowserClient> | null = null;
export function studioClient() {
  client ??= createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  return client;
}
