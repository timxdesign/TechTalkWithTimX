import { defineMiddleware } from "astro:middleware";
import { getSessionClient } from "./lib/supabase";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const isStudioPage = (path: string) => path === "/studio" || path.startsWith("/studio/");
const isStudioApi = (path: string) => path.startsWith("/api/studio/");

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if ((isStudioPage(pathname) && pathname !== "/studio/login") || isStudioApi(pathname)) {
    const supabase = getSessionClient(context.request, context.cookies);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // RLS lets editors read the editors table, so a row back means "is an editor".
    const { data: editor } = user
      ? await supabase.from("editors").select("role").eq("user_id", user.id).maybeSingle()
      : { data: null };

    if (!user || !editor) {
      if (isStudioApi(pathname)) {
        return new Response(JSON.stringify({ error: "Not signed in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const nextPath = encodeURIComponent(pathname + context.url.search);
      return context.redirect(`/studio/login?next=${nextPath}${user ? "&denied=1" : ""}`);
    }

    context.locals.supabase = supabase;
    context.locals.editor = { id: user.id, email: user.email ?? "", role: editor.role };
  }

  let response: Response;
  try {
    response = await next();
  } catch (err) {
    // An API route crashed (for example, a missing secret on the Worker). Answer in
    // JSON so the page can show it; only signed-in editors see the actual reason.
    if (!pathname.startsWith("/api/")) throw err;
    console.error(`${pathname}:`, err);
    const message = isStudioApi(pathname) && err instanceof Error ? err.message : "Something went wrong. Please try again.";
    response = new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(k)) response.headers.set(k, v);
  }
  if (isStudioPage(pathname) || isStudioApi(pathname)) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
});
