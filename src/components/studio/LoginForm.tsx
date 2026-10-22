import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { studioClient } from "@/lib/supabase-browser";

export default function LoginForm({ next, denied }: { next: string; denied: boolean }) {
  const [error, setError] = useState<string | null>(denied ? "This account isn't an editor. Ask an admin to add you." : null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [recovering, setRecovering] = useState(false);

  // Arriving from a password-reset email: Supabase signs the user in and fires
  // PASSWORD_RECOVERY, so show the "choose a new password" form instead.
  useEffect(() => {
    const { data } = studioClient().auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function setNewPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("new-password"));
    if (password.length < 10) return setError("Use at least 10 characters.");
    setBusy(true);
    const { error: err } = await studioClient().auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(err.message);
    window.location.href = "/studio";
  }

  if (recovering) {
    return (
      <form onSubmit={setNewPassword} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" name="new-password" type="password" autoComplete="new-password" minLength={10} required className="h-11" />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
        <Button type="submit" className="h-11 w-full" disabled={busy}>{busy ? "Saving…" : "Set password and sign in"}</Button>
      </form>
    );
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const { error: err } = await studioClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (err) {
      setBusy(false);
      setError(err.message === "Invalid login credentials" ? "Wrong email or password." : err.message);
      return;
    }
    window.location.href = next.startsWith("/studio") ? next : "/studio";
  }

  async function reset() {
    const email = (document.getElementById("email") as HTMLInputElement | null)?.value;
    if (!email) return setError("Enter your email first, then click reset.");
    await studioClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/studio/login` });
    setResetSent(true);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11" />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
      {resetSent && <p className="text-sm text-muted-foreground">If that email has an account, a reset link is on its way.</p>}
      <Button type="submit" className="h-11 w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <button type="button" onClick={reset} className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
        Forgot password?
      </button>
    </form>
  );
}
