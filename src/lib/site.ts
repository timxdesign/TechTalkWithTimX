import { PUBLIC_SITE_URL } from "astro:env/client";

export const SITE = {
  name: "Tech Talk with TimX",
  shortName: "TimX",
  tagline: "The stories behind what's being built.",
  description:
    "Founders and builders share their journeys, what they're building and what they've learned, in long-form stories and podcast conversations.",
  url: PUBLIC_SITE_URL,
  locale: "en",
  language: "en-GB",
  twitter: "@techtalkwithtimx",
  email: "hello@techtalkwithtimx.com",
  defaultOgImage: "/og-default.png",
  logo: "/logo.png",
  podcast: {
    title: "Tech Talk with TimX",
    author: "TimX",
    category: "Technology",
    subcategory: "Entrepreneurship",
    cover: "/podcast-cover.png",
    // Fill these in once the show is listed.
    appleUrl: "",
    spotifyUrl: "",
    youtubeUrl: "",
  },
} as const;

export const NAV = [
  { label: "Stories", href: "/stories" },
  { label: "Podcast", href: "/podcast" },
  { label: "People", href: "/people" },
  { label: "Newsletter", href: "/newsletter" },
] as const;

export const absoluteUrl = (path: string) => new URL(path, SITE.url).toString();

// Social card for a story: its cover photo if it has one, else the generated card.
export const storyImage = (story: { slug: string; cover_url: string | null }) =>
  story.cover_url ?? absoluteUrl(`/og/stories/${story.slug}.png`);
