// Makes a real podcast MP3 from an episode's YouTube video, for videos you own.
// It downloads the audio track, encodes a speech-friendly MP3 (mono, 64 kbps,
// loudness-normalised to -16 LUFS, the podcast standard), uploads it to Supabase
// Storage and sets the episode's audio_url, audio_bytes and duration_seconds.
// After that the site plays real audio and the episode appears in podcast.xml
// (Apple Podcasts, Spotify).
//
//   npm run episode:audio -- <episode-slug>     one episode
//   npm run episode:audio -- --all              every episode with a YouTube link and no audio
//   add --force to replace audio that's already there
//
// Needs yt-dlp and ffmpeg:  brew install yt-dlp ffmpeg
// Only for videos on your own channel: set YOUTUBE_CHANNEL_ID in .env (the UC… ID
// from YouTube Studio → Settings → Channel → Advanced) and any other channel's
// video is refused. Without it, pass --mine to confirm the video is yours.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const all = args.includes("--all");
const force = args.includes("--force");
const mine = args.includes("--mine");
const slug = args.find((a) => !a.startsWith("--"));
const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();

if (!slug && !all) {
  console.error("Usage: npm run episode:audio -- <episode-slug> | --all  [--force] [--mine]");
  process.exit(1);
}
for (const [bin, flag] of [["yt-dlp", "--version"], ["ffmpeg", "-version"], ["ffprobe", "-version"]]) {
  try {
    execFileSync(bin, [flag], { stdio: "ignore" });
  } catch {
    console.error(`${bin} isn't installed. Run: brew install yt-dlp ffmpeg`);
    process.exit(1);
  }
}

const db = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Supabase's free plan caps a single upload at 50 MB; 64 kbps mono fits about 1h45m.
const MAX_BYTES = 50 * 1024 * 1024;
const youtubeId = (url) =>
  url?.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/)?.[1] ?? null;

let query = db.from("episodes").select("id, slug, title, video_url, audio_url, duration_seconds").not("video_url", "is", null);
if (slug) query = query.eq("slug", slug);
const { data: episodes, error } = await query;
if (error) throw error;

const todo = episodes.filter((e) => force || !e.audio_url);
if (!todo.length) {
  console.log(slug ? `Nothing to do: "${slug}" has no YouTube link, already has audio (use --force), or doesn't exist.` : "Every episode with a YouTube link already has audio.");
  process.exit(0);
}

for (const ep of todo) {
  const id = youtubeId(ep.video_url);
  if (!id) {
    console.error(`✗ ${ep.slug}: can't read the YouTube link "${ep.video_url}"`);
    continue;
  }
  const url = `https://www.youtube.com/watch?v=${id}`;
  console.log(`\n${ep.title}\n  ${url}`);

  // Ownership check before downloading anything.
  const info = JSON.parse(execFileSync("yt-dlp", ["--dump-json", "--no-warnings", "--skip-download", url], { encoding: "utf8" }));
  if (channelId ? info.channel_id !== channelId : !mine) {
    console.error(
      channelId
        ? `✗ Skipped: this video is on "${info.channel}" (${info.channel_id}), not your channel (${channelId}).`
        : `✗ Skipped: set YOUTUBE_CHANNEL_ID in .env, or pass --mine to confirm "${info.channel}" is your channel.`,
    );
    continue;
  }

  const dir = mkdtempSync(join(tmpdir(), "ttt-audio-"));
  try {
    console.log("  downloading audio…");
    execFileSync("yt-dlp", ["-f", "bestaudio", "--no-playlist", "--no-warnings", "-q", "-o", join(dir, "source.%(ext)s"), url], { stdio: "inherit" });
    const source = execFileSync("ls", [dir], { encoding: "utf8" }).trim().split("\n").find((f) => f.startsWith("source."));

    const encode = (kbps) => {
      const out = join(dir, `${ep.slug}.mp3`);
      execFileSync("ffmpeg", [
        "-y", "-loglevel", "error", "-i", join(dir, source),
        "-vn", "-ac", "1", "-ar", "44100", "-b:a", `${kbps}k`,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-metadata", `title=${ep.title}`, "-metadata", "artist=Tech Talk with TimX", "-metadata", "album=Tech Talk with TimX",
        out,
      ]);
      return out;
    };
    console.log("  encoding MP3 (64 kbps mono, -16 LUFS)…");
    let mp3 = encode(64);
    if (statSync(mp3).size > MAX_BYTES) {
      console.log("  over 50 MB, re-encoding at 48 kbps…");
      mp3 = encode(48);
    }
    const bytes = statSync(mp3).size;
    if (bytes > MAX_BYTES) throw new Error("Still over 50 MB. Raise the upload limit in Supabase (Storage → Settings) or trim the episode.");
    const duration = Math.round(
      Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3], { encoding: "utf8" })),
    );

    const path = `audio/${new Date().toISOString().slice(0, 7)}/${ep.slug}-${id}.mp3`;
    console.log(`  uploading ${(bytes / 1024 / 1024).toFixed(1)} MB…`);
    const { error: upErr } = await db.storage
      .from("media")
      .upload(path, readFileSync(mp3), { contentType: "audio/mpeg", upsert: true, cacheControl: "31536000" });
    if (upErr) throw upErr;
    const { data: pub } = db.storage.from("media").getPublicUrl(path);

    const { error: updErr } = await db
      .from("episodes")
      .update({ audio_url: pub.publicUrl, audio_bytes: bytes, duration_seconds: ep.duration_seconds ?? duration })
      .eq("id", ep.id);
    if (updErr) throw updErr;
    console.log(`✓ ${ep.slug}: ${Math.floor(duration / 60)}m${String(duration % 60).padStart(2, "0")}s of audio attached`);
  } catch (err) {
    console.error(`✗ ${ep.slug}: ${err.message}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
