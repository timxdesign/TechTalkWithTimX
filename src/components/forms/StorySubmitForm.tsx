import { useState, type FormEvent, type ReactNode } from "react";
import { useTurnstile } from "./useTurnstile";

const STAGES = ["Idea", "Pre-seed", "Seed", "Series A+", "Bootstrapped & profitable", "Not a founder: I build at a company"];

type Errors = Partial<Record<"name" | "email" | "pitch", string>>;

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-3">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && (
        <span role="alert" className="mt-1.5 block text-sm font-medium text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

const input =
  "w-full border-0 border-b border-rule bg-transparent px-0 py-3 text-lg outline-none transition-colors placeholder:text-ink-3/70 focus:border-ink";

export default function StorySubmitForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pitchLength, setPitchLength] = useState(0);
  const turnstile = useTurnstile();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setStatus("sending");
    setErrors({});
    setFormError(null);
    try {
      const res = await fetch("/api/submit-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token: turnstile.token }),
      });
      const body = (await res.json()) as { ok: boolean; errors?: Errors; error?: string };
      if (body.ok) {
        setStatus("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (body.errors) setErrors(body.errors);
      setFormError(body.error ?? (body.errors ? "Please fix the highlighted fields." : "Something went wrong."));
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    }
    setStatus("idle");
    turnstile.reset();
  }

  return (
    <>
      {status === "done" ? (
        <div className="animate-in fade-in slide-in-from-bottom-3 py-10 duration-700" aria-live="polite">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-3">Received</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Thank you. We've got your story.</h2>
          <p className="mt-5 max-w-xl font-serif text-xl text-ink-2">
            Our editors read every submission. If it's a fit for a feature or a podcast conversation, we'll email you within two weeks.
          </p>
          <a href="/stories" className="btn-ink mt-8">Read other founders' stories →</a>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-10">
          <div className="grid gap-10 sm:grid-cols-2">
            <Field label="Your name" error={errors.name}>
              <input name="name" required autoComplete="name" className={input} placeholder="Ada Obi" />
            </Field>
            <Field label="Email" error={errors.email}>
              <input name="email" type="email" required autoComplete="email" className={input} placeholder="ada@company.com" />
            </Field>
            <Field label="Your role" hint="Optional">
              <input name="role" autoComplete="organization-title" className={input} placeholder="Co-founder & CEO" />
            </Field>
            <Field label="Company or project" hint="Optional">
              <input name="company" autoComplete="organization" className={input} placeholder="Company name" />
            </Field>
            <Field label="Website" hint="Optional">
              <input name="company_url" type="url" inputMode="url" className={input} placeholder="https://" />
            </Field>
            <Field label="Where are you based?" hint="Optional">
              <input name="location" className={input} placeholder="Lagos, Nigeria" />
            </Field>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Stage</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {STAGES.map((stage) => (
                <label key={stage} className="cursor-pointer">
                  <input type="radio" name="stage" value={stage} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-rule px-4 py-2 text-sm transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-ink hover:border-ink">
                    {stage}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Your story" hint={`${pitchLength} / 5000`} error={errors.pitch}>
            <textarea
              name="pitch"
              required
              rows={7}
              maxLength={5000}
              onChange={(e) => setPitchLength(e.target.value.length)}
              className={`${input} resize-y font-serif leading-relaxed`}
              placeholder="What are you building, why does it matter, and what's the moment in your journey you'd want to talk about?"
            />
          </Field>

          <Field label="Links" hint="Optional">
            <input name="links" className={input} placeholder="LinkedIn, X, press, a demo: separate with spaces" />
          </Field>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div ref={turnstile.ref} />

          {formError && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {formError}
            </p>
          )}

          <div className="flex flex-col items-start gap-4 border-t border-rule pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm text-ink-3">
              We'll only use your details to get back to you about your story. See our <a href="/privacy" className="underline">privacy policy</a>.
            </p>
            <button type="submit" disabled={status === "sending" || !turnstile.ready} className="btn-ink !px-8 !py-4 disabled:opacity-60">
              {status === "sending" ? "Sending…" : "Send my story →"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
