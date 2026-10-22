export type ContentStatus = "draft" | "scheduled" | "published" | "archived";
export type SubmissionStatus = "new" | "reviewing" | "accepted" | "declined";

export interface Person {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  x_handle: string | null;
  linkedin_url: string | null;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface Series {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  body: unknown;
  body_html: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  series_id: string | null;
  author_id: string | null;
  guest_id: string | null;
  tags: string[];
  featured: boolean;
  reading_minutes: number | null;
  seo_title: string | null;
  seo_description: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  start: number;
  title: string;
}

export interface Episode {
  id: string;
  slug: string;
  season: number | null;
  number: number | null;
  title: string;
  dek: string | null;
  audio_url: string | null;
  audio_bytes: number | null;
  duration_seconds: number | null;
  video_url: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  show_notes_html: string | null;
  transcript: string | null;
  chapters: Chapter[];
  series_id: string | null;
  guest_id: string | null;
  story_id: string | null;
  explicit: boolean;
  seo_title: string | null;
  seo_description: string | null;
  status: ContentStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: string | null;
  company_url: string | null;
  stage: string | null;
  location: string | null;
  pitch: string;
  links: string[];
  status: SubmissionStatus;
  editor_notes: string | null;
  created_at: string;
}

export interface NewsletterIssue {
  id: string;
  slug: string;
  subject: string;
  preview_text: string | null;
  html: string | null;
  story_ids: string[];
  episode_ids: string[];
  sent_at: string | null;
  created_at: string;
}

// Shapes returned by the joined queries in content.ts
export type StoryWithRefs = Story & {
  author: Person | null;
  guest: Person | null;
  series: Series | null;
};

export type EpisodeWithRefs = Episode & {
  guest: Person | null;
  series: Series | null;
  story: Pick<Story, "slug" | "title"> | null;
};
