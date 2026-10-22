import { TURNSTILE_SECRET_KEY } from "astro:env/server";

// Verifies a Cloudflare Turnstile token. When no secret is configured (local
// development) verification is skipped so forms still work.
export async function verifyTurnstile(token: string | null | undefined, ip?: string | null) {
  if (!TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const body = new FormData();
  body.append("secret", TURNSTILE_SECRET_KEY);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
