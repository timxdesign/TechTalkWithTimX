import { useEffect, useRef, useState } from "react";
import { PUBLIC_TURNSTILE_SITE_KEY } from "astro:env/client";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// Cloudflare Turnstile in "invisible/managed" mode. Without a site key (local
// dev) it's a no-op and the server skips verification too.
export function useTurnstile(theme: "light" | "dark" | "auto" = "auto") {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const enabled = Boolean(PUBLIC_TURNSTILE_SITE_KEY);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widget.current = window.turnstile.render(ref.current, {
        sitekey: PUBLIC_TURNSTILE_SITE_KEY,
        theme,
        appearance: "interaction-only",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(null),
      });
    });
    return () => {
      cancelled = true;
      if (widget.current) window.turnstile?.remove(widget.current);
    };
  }, [enabled, theme]);

  const reset = () => {
    setToken(null);
    if (widget.current) window.turnstile?.reset(widget.current);
  };

  return { ref, token, ready: !enabled || Boolean(token), reset };
}
