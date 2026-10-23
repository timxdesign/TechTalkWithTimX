import { useState, type FormEvent } from "react";
import { readJson } from "@/lib/read-json";
import { useTurnstile } from "./useTurnstile";

interface Props {
  source: string;
  tone?: "ink" | "paper"; // "paper" = on a black panel
  showName?: boolean;
}

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done"; already: boolean } | { kind: "error"; message: string };

export default function NewsletterForm({ source, tone = "ink", showName = false }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const turnstile = useTurnstile(tone === "paper" ? "dark" : "auto");
  const onDark = tone === "paper";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          first_name: form.get("first_name"),
          website: form.get("website"),
          source,
          token: turnstile.token,
        }),
      });
      const data = await readJson<{ ok: boolean; status?: string; error?: string }>(res);
      if (!data.ok) throw new Error(data.error ?? "Something went wrong.");
      setState({ kind: "done", already: data.status === "already" });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      turnstile.reset();
    }
  }

  const field = onDark
    ? "bg-transparent text-paper placeholder:text-paper/45 border-paper/30 focus:border-paper"
    : "bg-paper text-ink placeholder:text-ink-3 border-rule focus:border-ink";

  return (
    <div aria-live="polite">
      {state.kind === "done" ? (
          <div className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${onDark ? "text-paper" : "text-ink"}`}>
            <p className="text-xl font-bold">{state.already ? "You're already on the list." : "Check your inbox."}</p>
            <p className={`mt-1 font-serif ${onDark ? "text-paper/70" : "text-ink-2"}`}>
              {state.already
                ? "Thanks for reading. The next issue is on its way."
                : "We've sent a confirmation link. Click it and you're in."}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              {showName && (
                <label className="sm:w-44">
                  <span className="sr-only">First name</span>
                  <input
                    name="first_name"
                    autoComplete="given-name"
                    placeholder="First name"
                    className={`h-13 w-full rounded-full border px-5 text-base outline-none transition-colors ${field}`}
                  />
                </label>
              )}
              <label className="flex-1">
                <span className="sr-only">Email address</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`h-13 w-full rounded-full border px-5 text-base outline-none transition-colors ${field}`}
                />
              </label>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <button
                type="submit"
                disabled={state.kind === "sending" || !turnstile.ready}
                className={`h-13 shrink-0 rounded-full px-7 font-semibold transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 ${
                  onDark ? "bg-paper text-ink" : "bg-ink text-paper"
                }`}
              >
                {state.kind === "sending" ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            <div ref={turnstile.ref} className="mt-2" />
            {state.kind === "error" && (
              <p role="alert" className={`mt-3 text-sm font-medium ${onDark ? "text-paper" : "text-destructive"}`}>
                {state.message}
              </p>
            )}
            <p className={`mt-3 text-xs ${onDark ? "text-paper/50" : "text-ink-3"}`}>
              One email a day. No spam, unsubscribe in one click.
            </p>
          </form>
        )}
    </div>
  );
}
