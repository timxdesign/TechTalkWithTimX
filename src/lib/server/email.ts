import { MAIL_FROM_ADDRESS, ZEPTOMAIL_API_HOST, ZEPTOMAIL_TOKEN } from "astro:env/server";
import { SITE } from "../site";

// Transactional email through Zoho ZeptoMail. ZeptoMail is for one-to-one
// messages only (confirmations, receipts, alerts); the newsletter itself goes
// through Zoho Campaigns (see zoho.ts).

interface SendArgs {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, toName, subject, html, replyTo }: SendArgs) {
  if (!ZEPTOMAIL_TOKEN) {
    console.warn(`[email] ZEPTOMAIL_TOKEN not set; would send "${subject}" to ${to}`);
    return { sent: false as const };
  }
  const token = ZEPTOMAIL_TOKEN.startsWith("Zoho-enczapikey") ? ZEPTOMAIL_TOKEN : `Zoho-enczapikey ${ZEPTOMAIL_TOKEN}`;
  const res = await fetch(`https://${ZEPTOMAIL_API_HOST}/v1.1/email`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from: { address: MAIL_FROM_ADDRESS, name: SITE.name },
      to: [{ email_address: { address: to, name: toName ?? to } }],
      reply_to: replyTo ? [{ address: replyTo }] : undefined,
      subject,
      htmlbody: html,
    }),
  });
  if (!res.ok) {
    console.error("[email] ZeptoMail error", res.status, await res.text());
    return { sent: false as const };
  }
  return { sent: true as const };
}

// ─── Templates ──────────────────────────────────────────────────────────────
// Table-based, inline-styled, black and white: renders consistently in Gmail,
// Outlook and Apple Mail.

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function emailLayout({ preheader, body }: { preheader: string; body: string }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(SITE.name)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;">
<tr><td style="background:#000000;padding:22px 32px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="background:#ffffff;width:22px;height:22px;text-align:center;font:900 15px/22px Arial,sans-serif;color:#000;">T</td><td width="4"></td>
    <td style="background:#ffffff;width:22px;height:22px;text-align:center;font:900 15px/22px Arial,sans-serif;color:#000;">T</td><td width="4"></td>
    <td style="background:#ffffff;width:22px;height:22px;text-align:center;font:900 15px/22px Arial,sans-serif;color:#000;">T</td>
    <td style="padding-left:14px;font:800 13px/1 Arial,Helvetica,sans-serif;letter-spacing:.02em;text-transform:uppercase;color:#ffffff;">Tech Talk <span style="font:italic 400 14px Georgia,serif;text-transform:none;">with</span> TimX</td>
  </tr></table>
</td></tr>
<tr><td style="padding:40px 32px 32px;font:400 17px/1.6 Georgia,'Times New Roman',serif;color:#2b2b2b;">${body}</td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid #e4e4e4;font:400 12px/1.6 Arial,Helvetica,sans-serif;color:#6b6b6b;">
  ${esc(SITE.name)} · ${esc(SITE.tagline)}<br><a href="${SITE.url}" style="color:#000;">${SITE.url.replace(/^https?:\/\//, "")}</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr><td style="background:#000;border-radius:999px;"><a href="${href}" style="display:inline-block;padding:14px 26px;font:700 15px/1 Arial,Helvetica,sans-serif;color:#fff;text-decoration:none;">${esc(label)}</a></td></tr></table>`;

const h1 = (text: string) =>
  `<h1 style="margin:0 0 18px;font:800 30px/1.1 Arial,Helvetica,sans-serif;letter-spacing:-0.02em;color:#000;">${esc(text)}</h1>`;

export function confirmSubscriptionEmail(confirmUrl: string, firstName?: string | null) {
  return emailLayout({
    preheader: "One click to confirm your subscription.",
    body: `${h1("Confirm your subscription")}
<p style="margin:0 0 14px;">${firstName ? `Hi ${esc(firstName)}, thanks` : "Thanks"} for signing up to the ${esc(SITE.name)} newsletter: the stories behind what's being built, from the founders and builders doing the building.</p>
<p style="margin:0;">Confirm your email and your first issue arrives tomorrow morning.</p>
${button(confirmUrl, "Confirm my subscription")}
<p style="margin:0;font-size:14px;color:#6b6b6b;">Didn't sign up? Ignore this email and you won't hear from us again.</p>`,
  });
}

export function submissionReceivedEmail(name: string) {
  return emailLayout({
    preheader: "We've got your story. Here's what happens next.",
    body: `${h1("We've got your story")}
<p style="margin:0 0 14px;">Hi ${esc(name)}, thank you for telling us what you're building.</p>
<p style="margin:0 0 14px;">Our editors read every submission. If your story is a fit for a feature or a podcast conversation, we'll be in touch within two weeks to set up a call.</p>
<p style="margin:0;">In the meantime, here's what other founders have shared:</p>
${button(`${SITE.url}/stories`, "Read the stories")}`,
  });
}

export function editorAlertEmail(s: { name: string; email: string; company?: string | null; pitch: string; id: string }) {
  return emailLayout({
    preheader: `New story submission from ${s.name}`,
    body: `${h1("New story submission")}
<p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:15px;"><strong>${esc(s.name)}</strong>${s.company ? `, ${esc(s.company)}` : ""} · <a href="mailto:${esc(s.email)}" style="color:#000;">${esc(s.email)}</a></p>
<blockquote style="margin:18px 0;padding-left:16px;border-left:3px solid #000;">${esc(s.pitch).replace(/\n/g, "<br>")}</blockquote>
${button(`${SITE.url}/studio/submissions#${s.id}`, "Review in Studio")}`,
  });
}
