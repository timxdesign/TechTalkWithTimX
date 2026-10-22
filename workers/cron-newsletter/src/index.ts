// Fires once a day and asks the site to build and send the daily digest.
// Kept separate from the site Worker so the schedule can change (or pause)
// without redeploying the site.

interface Env {
  SITE_URL: string;
  CRON_SECRET: string;
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const res = await fetch(`${env.SITE_URL}/api/cron/daily-digest`, {
          method: "POST",
          headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
        });
        const body = await res.text();
        if (!res.ok) throw new Error(`Digest failed (${res.status}): ${body}`);
        console.log("Digest:", body);
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
