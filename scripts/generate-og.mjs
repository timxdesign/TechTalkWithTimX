// Renders a 1200×630 social card for every published story with headless Chrome
// and uploads it to Supabase Storage (media/og/stories/<slug>.png). Pages serve
// it through /og/stories/<slug>.png, which falls back to og-default.png.
// Safe to re-run; existing cards are replaced.
//   npm run og:generate              (all published stories)
//   npm run og:generate -- <slug>    (one story)

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const font = (pkg, file) => pathToFileURL(join(root, "node_modules/@fontsource-variable", pkg, "files", file)).href;

const db = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const css = `
@font-face { font-family: "Schibsted"; src: url("${font("schibsted-grotesk", "schibsted-grotesk-latin-wght-normal.woff2")}") format("woff2"); font-weight: 400 900; }
@font-face { font-family: "GeistMono"; src: url("${font("geist-mono", "geist-mono-latin-wght-normal.woff2")}") format("woff2"); font-weight: 100 900; }
@font-face { font-family: "Newsreader"; font-style: italic; src: url("${font("newsreader", "newsreader-latin-opsz-italic.woff2")}") format("woff2"); }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; background: #000; color: #fff; font-family: "Schibsted", sans-serif; overflow: hidden; }
.grain { position: absolute; inset: 0; opacity: .08; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.mono { font-family: "GeistMono", monospace; text-transform: uppercase; letter-spacing: .1em; font-size: 18px; color: #ffffffa6; }
.title { font-weight: 800; letter-spacing: -.03em; line-height: 1.02; text-wrap: balance; }
.serif { font-family: "Newsreader", serif; font-style: italic; font-weight: 400; text-transform: none; }
`;

const mark = `<svg height="44" viewBox="0 0 474 145" xmlns="http://www.w3.org/2000/svg">
  <rect width="144.086" height="144.086" fill="#fff"/><path d="M110.852 28.3027V49.2726H83.4367V117.422H58.2909V49.2726H30.8756V28.3027H110.852Z" fill="#000"/>
  <rect width="144.086" height="144.086" transform="translate(164.957)" fill="#fff"/><path d="M275.809 28.3027V49.2726H248.394V117.422H223.248V49.2726H195.833V28.3027H275.809Z" fill="#000"/>
  <rect width="144.086" height="144.086" transform="translate(329.914)" fill="#fff"/><path d="M440.766 28.3027V49.2726H413.35V117.422H388.205V49.2726H360.789V28.3027H440.766Z" fill="#000"/></svg>`;

const esc = (s = "") => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Longer headlines get a smaller size so every card stays within four lines.
const titleSize = (t) => (t.length <= 45 ? 76 : t.length <= 70 ? 64 : 54);

const card = (s) => `
  <div class="grain"></div>
  <div style="position:absolute;inset:64px 72px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:flex;align-items:center;justify-content:space-between">${mark}<span class="mono">${esc(s.series?.name ?? "Story")}</span></div>
    <div class="title" style="font-size:${titleSize(s.title)}px;max-width:1040px">${esc(s.title)}</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #ffffff30;padding-top:22px">
      <span style="font-weight:800;font-size:22px;text-transform:uppercase">Tech Talk <span class="serif" style="font-size:25px">with</span> TimX</span>
      <span class="mono">${s.guest?.name ? `${esc(s.guest.name)} · ` : ""}techtalkwithtimx.com</span>
    </div>
  </div>`;

const only = process.argv[2];
let query = db
  .from("stories")
  .select("slug, title, series:series_id(name), guest:guest_id(name)")
  .eq("status", "published");
if (only) query = query.eq("slug", only);
const { data: stories, error } = await query;
if (error) throw error;

const dir = mkdtempSync(join(tmpdir(), "ttt-og-"));
for (const s of stories) {
  const html = join(dir, `${s.slug}.html`);
  const png = join(dir, `${s.slug}.png`);
  writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div style="position:relative;width:1200px;height:630px">${card(s)}</div></body></html>`);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "--virtual-time-budget=3000",
    `--screenshot=${png}`,
    pathToFileURL(html).href,
  ], { stdio: "ignore" });

  const { error: upErr } = await db.storage
    .from("media")
    .upload(`og/stories/${s.slug}.png`, readFileSync(png), { contentType: "image/png", upsert: true, cacheControl: "86400" });
  if (upErr) throw upErr;
  console.log(`✓ og/stories/${s.slug}.png`);
}
console.log(`${stories.length} cards in ${dir}`);
