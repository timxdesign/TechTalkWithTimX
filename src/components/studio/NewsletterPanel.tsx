import { useState } from "react";
import { readJson } from "@/lib/read-json";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";

type Result = { status: string; slug?: string; subject?: string; reason?: string; error?: string };

const MESSAGES: Record<string, string> = {
  "nothing-new": "Nothing was published in the last 24 hours, so there's no issue to send.",
  "already-sent": "Today's issue has already gone out.",
  "dry-run": "Today's issue is built and saved. Preview it below.",
  "saved-not-sent": "Issue saved, but not sent: Zoho Campaigns isn't connected yet.",
  sent: "Sent to all confirmed subscribers.",
};

export default function NewsletterPanel({ zohoReady }: { zohoReady: boolean }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run(dryRun: boolean) {
    if (!dryRun && !window.confirm("Send today's issue to every confirmed subscriber now?")) return;
    setBusy(true);
    const res = await fetch("/api/studio/send-digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun }),
    });
    const data = await readJson<Result>(res);
    setBusy(false);
    setResult(data);
    if (data.status === "error") toast.error(data.error ?? "Failed");
    else toast.success(MESSAGES[data.status] ?? data.status);
  }

  return (
    <div className="space-y-4">
      <Toaster position="bottom-right" />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={busy} onClick={() => run(true)}>Build today's issue</Button>
        <Button disabled={busy || !zohoReady} onClick={() => run(false)} title={zohoReady ? undefined : "Connect Zoho Campaigns first"}>
          Send now
        </Button>
      </div>
      {!zohoReady && (
        <p className="text-sm text-muted-foreground">
          Sending is off until the Zoho Campaigns keys are added. The issue is still built and archived each morning.
        </p>
      )}
      {result && result.status !== "error" && (
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p>{MESSAGES[result.status] ?? result.status}</p>
          {result.slug && result.status !== "nothing-new" && (
            <a className="mt-2 inline-block font-semibold underline" href={`/newsletter/email/${result.slug}`} target="_blank" rel="noopener">
              Preview email ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
