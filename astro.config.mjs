// @ts-check
import { defineConfig, envField } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const secret = (optional = true) => envField.string({ context: 'server', access: 'secret', optional });
const publicVar = (opts = {}) => envField.string({ context: 'client', access: 'public', ...opts });

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://techtalkwithtimx.com',
  // Content comes from Supabase, so pages render on request at the edge and are
  // cached by Cloudflare; publishing in the Studio purges the affected tags.
  output: 'server',
  // Prerendered pages are emitted as about.html (not about/index.html) so /about
  // is served directly instead of redirecting to /about/.
  build: { format: 'file' },
  trailingSlash: 'never',
  adapter: cloudflare(),
  cache: {
    provider: { name: 'cloudflare', entrypoint: '@astrojs/cloudflare/cache/provider' },
  },
  integrations: [react()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  env: {
    schema: {
      PUBLIC_SITE_URL: publicVar({ default: 'https://techtalkwithtimx.com' }),
      PUBLIC_SUPABASE_URL: publicVar(),
      PUBLIC_SUPABASE_ANON_KEY: publicVar(),
      PUBLIC_TURNSTILE_SITE_KEY: publicVar({ optional: true }),

      SUPABASE_SERVICE_ROLE_KEY: secret(false),
      TURNSTILE_SECRET_KEY: secret(),
      CRON_SECRET: secret(),

      // Zoho ZeptoMail (transactional email)
      ZEPTOMAIL_TOKEN: secret(),
      ZEPTOMAIL_API_HOST: envField.string({ context: 'server', access: 'secret', default: 'api.zeptomail.com' }),
      MAIL_FROM_ADDRESS: envField.string({ context: 'server', access: 'secret', default: 'hello@techtalkwithtimx.com' }),
      EDITOR_ALERT_ADDRESS: secret(),

      // Zoho Campaigns (daily newsletter)
      ZOHO_CLIENT_ID: secret(),
      ZOHO_CLIENT_SECRET: secret(),
      ZOHO_REFRESH_TOKEN: secret(),
      ZOHO_ACCOUNTS_HOST: envField.string({ context: 'server', access: 'secret', default: 'accounts.zoho.com' }),
      ZOHO_CAMPAIGNS_HOST: envField.string({ context: 'server', access: 'secret', default: 'campaigns.zoho.com' }),
      ZOHO_CAMPAIGNS_LIST_KEY: secret(),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
