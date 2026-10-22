import { SITE, absoluteUrl, storyImage } from "./site";
import { isoDuration, stripHtml } from "./format";
import type { EpisodeWithRefs, Person, StoryWithRefs } from "./types";

const publisher = () => ({
  "@type": "NewsMediaOrganization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: { "@type": "ImageObject", url: absoluteUrl(SITE.logo), width: 512, height: 512 },
});

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  ...publisher(),
  sameAs: [SITE.podcast.appleUrl, SITE.podcast.spotifyUrl, SITE.podcast.youtubeUrl].filter(Boolean),
  publishingPrinciples: absoluteUrl("/editorial-standards"),
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  publisher: { "@id": `${SITE.url}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

const personRef = (p: Pick<Person, "name" | "slug">) => ({
  "@type": "Person",
  name: p.name,
  url: absoluteUrl(`/people/${p.slug}`),
});

export const articleSchema = (story: StoryWithRefs) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: story.title,
  description: story.seo_description ?? story.dek ?? undefined,
  image: [storyImage(story)],
  datePublished: story.published_at,
  dateModified: story.updated_at,
  mainEntityOfPage: absoluteUrl(`/stories/${story.slug}`),
  author: story.author ? [personRef(story.author)] : [publisher()],
  publisher: publisher(),
  articleSection: story.series?.name,
  keywords: story.tags.join(", ") || undefined,
  about: story.guest ? personRef(story.guest) : undefined,
  wordCount: stripHtml(story.body_html).split(" ").length,
  isAccessibleForFree: true,
});

export const podcastSeriesSchema = () => ({
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  "@id": `${SITE.url}/podcast#series`,
  name: SITE.podcast.title,
  description: SITE.description,
  url: absoluteUrl("/podcast"),
  image: absoluteUrl(SITE.podcast.cover),
  webFeed: absoluteUrl("/podcast.xml"),
  author: { "@type": "Person", name: SITE.podcast.author },
});

export const episodeSchema = (ep: EpisodeWithRefs) => ({
  "@context": "https://schema.org",
  "@type": "PodcastEpisode",
  name: ep.title,
  description: ep.seo_description ?? ep.dek ?? undefined,
  url: absoluteUrl(`/podcast/${ep.slug}`),
  datePublished: ep.published_at,
  episodeNumber: ep.number ?? undefined,
  timeRequired: isoDuration(ep.duration_seconds),
  image: ep.cover_url ?? absoluteUrl(SITE.podcast.cover),
  associatedMedia: ep.audio_url
    ? { "@type": "MediaObject", contentUrl: ep.audio_url, encodingFormat: "audio/mpeg" }
    : undefined,
  partOfSeries: { "@id": `${SITE.url}/podcast#series` },
  actor: ep.guest ? [personRef(ep.guest)] : undefined,
});

export const personSchema = (p: Person) => ({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: p.name,
    url: absoluteUrl(`/people/${p.slug}`),
    jobTitle: p.role ?? undefined,
    worksFor: p.company ? { "@type": "Organization", name: p.company } : undefined,
    description: p.bio ?? undefined,
    image: p.avatar_url ?? undefined,
    sameAs: [
      p.website_url,
      p.linkedin_url,
      p.x_handle ? `https://x.com/${p.x_handle.replace(/^@/, "")}` : null,
    ].filter(Boolean),
  },
});
