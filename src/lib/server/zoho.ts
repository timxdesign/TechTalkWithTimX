import {
  MAIL_FROM_ADDRESS,
  ZOHO_ACCOUNTS_HOST,
  ZOHO_CAMPAIGNS_HOST,
  ZOHO_CAMPAIGNS_LIST_KEY,
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REFRESH_TOKEN,
} from "astro:env/server";
import { SITE } from "../site";

// Zoho Campaigns: holds the confirmed newsletter list and sends the daily digest.
// Supabase stays the source of truth; confirmed subscribers are copied here.
// OAuth scopes needed: ZohoCampaigns.contact.ALL, ZohoCampaigns.campaign.ALL

export const zohoConfigured = () =>
  Boolean(ZOHO_CLIENT_ID && ZOHO_CLIENT_SECRET && ZOHO_REFRESH_TOKEN && ZOHO_CAMPAIGNS_LIST_KEY);

let cachedToken: { value: string; expires: number } | null = null;

async function accessToken() {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const params = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN!,
    client_id: ZOHO_CLIENT_ID!,
    client_secret: ZOHO_CLIENT_SECRET!,
    grant_type: "refresh_token",
  });
  const res = await fetch(`https://${ZOHO_ACCOUNTS_HOST}/oauth/v2/token?${params}`, { method: "POST" });
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!data.access_token) throw new Error(`Zoho token refresh failed: ${data.error ?? res.status}`);
  cachedToken = { value: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cachedToken.value;
}

async function campaignsCall(path: string, params: Record<string, string>) {
  const token = await accessToken();
  const url = `https://${ZOHO_CAMPAIGNS_HOST}/api/v1.1/${path}?${new URLSearchParams({ resfmt: "JSON", ...params })}`;
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  const data = (await res.json()) as Record<string, unknown>;
  const status = String(data.status ?? data.code ?? "");
  if (!res.ok || status === "error") throw new Error(`Zoho Campaigns ${path} failed: ${JSON.stringify(data)}`);
  return data;
}

// Adds a confirmed subscriber to the list. We've already done double opt-in,
// so set the list's sign-up form to "single opt-in" in Zoho to avoid a second email.
export async function addToNewsletterList(email: string, firstName?: string | null) {
  if (!zohoConfigured()) return false;
  const contactinfo = JSON.stringify({ "Contact Email": email, ...(firstName ? { "First Name": firstName } : {}) });
  await campaignsCall("json/listsubscribe", { listkey: ZOHO_CAMPAIGNS_LIST_KEY!, contactinfo, source: "Website" });
  return true;
}

export async function removeFromNewsletterList(email: string) {
  if (!zohoConfigured()) return false;
  const contactinfo = JSON.stringify({ "Contact Email": email });
  await campaignsCall("json/listunsubscribe", { listkey: ZOHO_CAMPAIGNS_LIST_KEY!, contactinfo });
  return true;
}

// Creates a campaign whose content Zoho fetches from our public issue URL, then sends it.
export async function sendCampaign({ name, subject, contentUrl }: { name: string; subject: string; contentUrl: string }) {
  if (!zohoConfigured()) throw new Error("Zoho Campaigns is not configured");
  const created = await campaignsCall("createCampaign", {
    campaignname: name,
    from_email: MAIL_FROM_ADDRESS,
    subject,
    content_url: contentUrl,
    list_details: JSON.stringify({ [ZOHO_CAMPAIGNS_LIST_KEY!]: [] }),
  });
  const campaignKey = String(created.campaignKey ?? created.campaignkey ?? "");
  if (!campaignKey) throw new Error(`Zoho createCampaign returned no key: ${JSON.stringify(created)}`);
  await campaignsCall("sendcampaign", { campaignkey: campaignKey });
  return campaignKey;
}

export const newsletterFromName = SITE.name;
