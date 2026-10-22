# Tech Talk with TimX

The stories behind what's being built: long-form founder stories, a podcast and a daily newsletter.

**Stack:** Astro 7 + React islands + Tailwind v4 + shadcn/ui · Supabase (Postgres, Auth, Storage) · Cloudflare Workers (hosting, edge cache, cron, Turnstile) · Zoho ZeptoMail (transactional email) + Zoho Campaigns (newsletter) · GSAP + Lenis (motion).

## Run it locally

```sh
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm run preview` | Production build, previewed in Cloudflare's local runtime |
| `npm run check` | Type-check everything |
| `npm run editor:add -- you@example.com --admin` | Create a Studio login (prints a password once) |
| `npm run sample:add` / `npm run sample:remove` | Add / delete the sample stories, guests and episodes |
| `npm run brand:assets` | Re-render OG image, podcast cover and icons in `public/` |

## Where things live

```
src/pages/            Public pages, feeds (rss.xml, podcast.xml, sitemap.xml) and API routes
src/pages/studio/     Editor dashboard (login required)
src/components/       story/, podcast/ (persistent player), forms/, studio/, ui/ (shadcn)
src/lib/              content.ts (queries), schema.ts (JSON-LD), site.ts (name, URLs, podcast links)
src/lib/server/       email.ts (ZeptoMail), zoho.ts (Campaigns), digest.ts (daily brief), turnstile.ts
src/styles/global.css Design tokens: black & white palette, type, motion
supabase/             SQL schema + seed
workers/cron-newsletter/  Tiny Worker that triggers the daily digest each morning
assets/               Original brand files
```

## Publishing (the Studio)

Sign in at `/studio/login`. Stories and episodes save as drafts; **Publish** makes them live, and a future publish date schedules them (they go live automatically). Saving clears the edge cache for the affected pages, so changes show immediately. Story submissions from `/share-your-story` land in **Submissions**.

## Deploying to Cloudflare

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Import a repository**. Build command `npm run build`, deploy command `npx wrangler deploy`.
3. **Build variables** (needed at build time): `PUBLIC_SITE_URL`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`.
4. **Secrets** (runtime): `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `CRON_SECRET`, `ZEPTOMAIL_TOKEN`, `MAIL_FROM_ADDRESS`, `EDITOR_ALERT_ADDRESS`, and the `ZOHO_*` values. Set them in the dashboard or with `npx wrangler secret put NAME`.
5. Add your domain under the Worker's **Domains & Routes**, then update `PUBLIC_SITE_URL`.
6. Deploy the cron Worker once:
   ```sh
   npx wrangler deploy --config workers/cron-newsletter/wrangler.jsonc
   npx wrangler secret put CRON_SECRET --config workers/cron-newsletter/wrangler.jsonc
   ```
7. In Supabase → Authentication → URL configuration, set the Site URL to your domain (used by password-reset links).

## Email setup (Zoho)

- **ZeptoMail:** verify your sending domain (SPF + DKIM), create a Mail Agent and copy its *Send Mail token* into `ZEPTOMAIL_TOKEN`. Used for subscription confirmations, submission receipts and editor alerts.
- **Zoho Campaigns:** create a list for the daily brief and copy its list key into `ZOHO_CAMPAIGNS_LIST_KEY`. Create a Self Client in the Zoho API console with scopes `ZohoCampaigns.contact.ALL,ZohoCampaigns.campaign.ALL`, generate a refresh token, and fill in `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` and `ZOHO_REFRESH_TOKEN`. Use the `.eu` / `.in` hosts if your Zoho account is in those data centres. The site does its own double opt-in, so set the list to single opt-in.

Until Zoho is configured the site still works: sign-ups are stored in Supabase, and confirmation links are logged in development.

## SEO checklist after launch

- Submit `/sitemap.xml` and `/news-sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Submit `/podcast.xml` to Apple Podcasts and Spotify, then add the show links in `src/lib/site.ts`.
- Validate a story and an episode in Google's Rich Results Test.
