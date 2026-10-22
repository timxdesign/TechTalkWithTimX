// Renders the PNG brand assets in /public with headless Chrome:
//   og-default.png (1200×630), podcast-cover.png (3000×3000, Apple's spec),
//   logo.png (512×512), apple-touch-icon.png (180×180), icon-512.png, icon-192.png
// Usage: node scripts/generate-brand-assets.mjs

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const font = (pkg, file) => pathToFileURL(join(root, "node_modules/@fontsource-variable", pkg, "files", file)).href;

const css = `
@font-face { font-family: "Schibsted"; src: url("${font("schibsted-grotesk", "schibsted-grotesk-latin-wght-normal.woff2")}") format("woff2"); font-weight: 400 900; }
@font-face { font-family: "Newsreader"; font-style: italic; src: url("${font("newsreader", "newsreader-latin-opsz-italic.woff2")}") format("woff2"); }
@font-face { font-family: "GeistMono"; src: url("${font("geist-mono", "geist-mono-latin-wght-normal.woff2")}") format("woff2"); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; background: #000; color: #fff; font-family: "Schibsted", sans-serif; overflow: hidden; }
.grain { position: absolute; inset: 0; opacity: .08; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.serif { font-family: "Newsreader", serif; font-style: italic; font-weight: 400; }
.mono { font-family: "GeistMono", monospace; text-transform: uppercase; letter-spacing: .1em; }
`;

// The TTT mark, white blocks with black T's.
const mark = (h) => `<svg height="${h}" viewBox="0 0 474 145" xmlns="http://www.w3.org/2000/svg">
  <rect width="144.086" height="144.086" fill="#fff"/><path d="M110.852 28.3027V49.2726H83.4367V117.422H58.2909V49.2726H30.8756V28.3027H110.852Z" fill="#000"/>
  <rect width="144.086" height="144.086" transform="translate(164.957)" fill="#fff"/><path d="M275.809 28.3027V49.2726H248.394V117.422H223.248V49.2726H195.833V28.3027H275.809Z" fill="#000"/>
  <rect width="144.086" height="144.086" transform="translate(329.914)" fill="#fff"/><path d="M440.766 28.3027V49.2726H413.35V117.422H388.205V49.2726H360.789V28.3027H440.766Z" fill="#000"/></svg>`;

const single = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 144 144" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" fill="#000"/><path d="M110.852 28.3027V49.2726H83.4367V117.422H58.2909V49.2726H30.8756V28.3027H110.852Z" transform="translate(0,-0.7)" fill="#fff"/></svg>`;

const pages = {
  "og-default.png": [1200, 630, `
    <div class="grain"></div>
    <div style="position:absolute;inset:72px;display:flex;flex-direction:column;justify-content:space-between">
      <div style="display:flex;align-items:center;justify-content:space-between">${mark(56)}<span class="mono" style="font-size:18px;color:#ffffff99">Stories · Podcast · Newsletter</span></div>
      <div style="font-weight:800;font-size:104px;line-height:.95;letter-spacing:-.035em">The stories behind<br>what's <span class="serif">being built.</span></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid #ffffff30;padding-top:24px">
        <span style="font-weight:800;font-size:24px;text-transform:uppercase">Tech Talk <span class="serif" style="text-transform:none;font-size:27px">with</span> TimX</span>
        <span class="mono" style="font-size:16px;color:#ffffff99">techtalkwithtimx.com</span>
      </div>
    </div>`],
  "podcast-cover.png": [3000, 3000, `
    <div class="grain"></div>
    <div style="position:absolute;inset:220px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start">
      ${mark(300)}
      <div>
        <div class="mono" style="font-size:72px;color:#ffffff99">The Podcast</div>
        <div style="margin-top:60px;font-weight:800;font-size:440px;line-height:.86;letter-spacing:-.045em;text-transform:uppercase">Tech<br>Talk</div>
        <div class="serif" style="font-size:300px;line-height:1;margin-top:20px">with TimX</div>
      </div>
    </div>`],
  "logo.png": [512, 512, `<div style="display:grid;place-items:center;height:100%">${single(512)}</div>`],
  "icon-512.png": [512, 512, `<div style="display:grid;place-items:center;height:100%">${single(512)}</div>`],
  "icon-192.png": [192, 192, `<div style="display:grid;place-items:center;height:100%">${single(192)}</div>`],
  "apple-touch-icon.png": [180, 180, `<div style="display:grid;place-items:center;height:100%">${single(180)}</div>`],
};

const dir = mkdtempSync(join(tmpdir(), "ttt-brand-"));
for (const [name, [w, h, body]] of Object.entries(pages)) {
  const html = join(dir, `${name}.html`);
  writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div style="position:relative;width:${w}px;height:${h}px">${body}</div></body></html>`);
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${w},${h}`,
    "--virtual-time-budget=3000",
    `--screenshot=${join(root, "public", name)}`,
    pathToFileURL(html).href,
  ], { stdio: "ignore" });
  console.log(`✓ public/${name}`);
}
