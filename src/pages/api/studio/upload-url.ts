import type { APIRoute } from "astro";
import { getAdminClient } from "../../../lib/supabase";
import { json } from "../../../lib/server/http";
import { slugify } from "../../../lib/format";

const ALLOWED = /^(image\/(jpeg|png|webp|avif|gif)|audio\/(mpeg|mp4|x-m4a|aac))$/;

// Returns a one-time signed URL so the browser uploads straight to Supabase
// Storage (large audio files never pass through the Worker). Editors only:
// the middleware has already checked the session.
export const POST: APIRoute = async ({ request }) => {
  const { filename, contentType, folder } = (await request.json()) as {
    filename?: string;
    contentType?: string;
    folder?: string;
  };
  if (!filename || !contentType || !ALLOWED.test(contentType)) {
    return json({ error: "Unsupported file type" }, 400);
  }
  const dir = ["covers", "avatars", "audio", "inline"].includes(folder ?? "") ? folder : "inline";
  const ext = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const base = slugify(filename.replace(/\.[^.]+$/, "")) || "file";
  const path = `${dir}/${new Date().toISOString().slice(0, 7)}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const db = await getAdminClient();
  const { data, error } = await db.storage.from("media").createSignedUploadUrl(path);
  if (error) return json({ error: error.message }, 500);
  const { data: pub } = db.storage.from("media").getPublicUrl(path);
  return json({ path, token: data.token, publicUrl: pub.publicUrl });
};
