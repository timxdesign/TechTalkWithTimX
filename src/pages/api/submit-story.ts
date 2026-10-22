import type { APIRoute } from "astro";
import { EDITOR_ALERT_ADDRESS } from "astro:env/server";
import { getAdminClient } from "../../lib/supabase";
import { verifyTurnstile } from "../../lib/server/turnstile";
import { editorAlertEmail, sendEmail, submissionReceivedEmail } from "../../lib/server/email";
import { EMAIL_RE, clean, clientIp, json } from "../../lib/server/http";

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (clean(body.website)) return json({ ok: true }); // honeypot

  const submission = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    role: clean(body.role, 120) || null,
    company: clean(body.company, 160) || null,
    company_url: clean(body.company_url, 300) || null,
    stage: clean(body.stage, 60) || null,
    location: clean(body.location, 120) || null,
    pitch: clean(body.pitch, 5000),
    links: (Array.isArray(body.links) ? body.links : String(body.links ?? "").split(/[\s,]+/))
      .map((l) => clean(l, 300))
      .filter((l) => /^https?:\/\//.test(l))
      .slice(0, 8),
  };

  const errors: Record<string, string> = {};
  if (submission.name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(submission.email)) errors.email = "Please enter a valid email address.";
  if (submission.pitch.length < 80) errors.pitch = "Give us a little more: at least a few sentences.";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  if (!(await verifyTurnstile(clean(body.token, 4096), clientIp(request)))) {
    return json({ ok: false, error: "We couldn't verify you're human. Please try again." }, 400);
  }

  const db = await getAdminClient();
  const { data, error } = await db.from("submissions").insert(submission).select("id").single();
  if (error) {
    console.error("[submit-story]", error.message);
    return json({ ok: false, error: "Something went wrong saving your story. Please try again." }, 500);
  }

  await Promise.allSettled([
    sendEmail({
      to: submission.email,
      toName: submission.name,
      subject: "We've got your story",
      html: submissionReceivedEmail(submission.name),
    }),
    EDITOR_ALERT_ADDRESS
      ? sendEmail({
          to: EDITOR_ALERT_ADDRESS,
          subject: `New story: ${submission.name}${submission.company ? `, ${submission.company}` : ""}`,
          html: editorAlertEmail({ ...submission, id: data.id }),
          replyTo: submission.email,
        })
      : Promise.resolve(),
  ]);

  return json({ ok: true });
};
