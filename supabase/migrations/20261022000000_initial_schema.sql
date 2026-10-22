-- Tech Talk with TimX: initial schema.
-- Public visitors can read published content only. Submissions and subscribers
-- are written by the site's server code (service role) after spam checks, and
-- read by signed-in editors.

create extension if not exists citext;

-- ─── Types ──────────────────────────────────────────────────────────────────
create type content_status as enum ('draft', 'scheduled', 'published', 'archived');
create type submission_status as enum ('new', 'reviewing', 'accepted', 'declined');
create type subscriber_status as enum ('pending', 'confirmed', 'unsubscribed');
create type editor_role as enum ('admin', 'editor');

-- ─── Helpers ────────────────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Editors ────────────────────────────────────────────────────────────────
create table editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role editor_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function is_editor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from editors where user_id = auth.uid());
$$;

-- ─── People (guests, authors, hosts) ────────────────────────────────────────
create table people (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text,                       -- e.g. "Co-founder & CEO"
  company text,
  location text,
  bio text,
  avatar_url text,
  website_url text,
  x_handle text,
  linkedin_url text,
  is_staff boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Series (Founder Files, Builder Diaries, ...) ───────────────────────────
create table series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Stories (articles) ─────────────────────────────────────────────────────
create table stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  dek text,                        -- standfirst under the headline
  body jsonb,                      -- Tiptap document (editing)
  body_html text,                  -- rendered HTML (public pages)
  cover_url text,
  cover_alt text,
  series_id uuid references series (id) on delete set null,
  author_id uuid references people (id) on delete set null,
  guest_id uuid references people (id) on delete set null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  reading_minutes int,
  seo_title text,
  seo_description text,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_published_needs_date
    check (status not in ('published', 'scheduled') or published_at is not null)
);

create index stories_public_idx on stories (published_at desc) where status in ('published', 'scheduled');
create index stories_series_idx on stories (series_id);
create index stories_guest_idx on stories (guest_id);
create index stories_tags_idx on stories using gin (tags);

-- ─── Episodes (podcast) ─────────────────────────────────────────────────────
create table episodes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  season int,
  number int,
  title text not null,
  dek text,
  audio_url text,                  -- R2 URL
  audio_bytes bigint,              -- needed for the podcast RSS enclosure
  duration_seconds int,
  video_url text,                  -- optional YouTube embed
  cover_url text,
  cover_alt text,
  show_notes_html text,
  transcript text,
  chapters jsonb not null default '[]',  -- [{ "start": 0, "title": "Intro" }]
  series_id uuid references series (id) on delete set null,
  guest_id uuid references people (id) on delete set null,
  story_id uuid references stories (id) on delete set null,
  explicit boolean not null default false,
  seo_title text,
  seo_description text,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season, number),
  constraint episodes_published_needs_date
    check (status not in ('published', 'scheduled') or published_at is not null)
);

create index episodes_public_idx on episodes (published_at desc) where status in ('published', 'scheduled');
create index episodes_guest_idx on episodes (guest_id);

-- ─── Story submissions ("Share your story") ─────────────────────────────────
create table submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext not null,
  role text,
  company text,
  company_url text,
  stage text,                      -- idea / pre-seed / seed / series A+ / bootstrapped
  location text,
  pitch text not null,
  links text[] not null default '{}',
  status submission_status not null default 'new',
  editor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_status_idx on submissions (status, created_at desc);

-- ─── Newsletter ─────────────────────────────────────────────────────────────
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  first_name text,
  status subscriber_status not null default 'pending',
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  source text,                     -- which page/form they signed up from
  confirm_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  zoho_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table newsletter_issues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,       -- e.g. 2026-10-22
  subject text not null,
  preview_text text,
  html text,
  story_ids uuid[] not null default '{}',
  episode_ids uuid[] not null default '{}',
  zoho_campaign_key text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── updated_at triggers ────────────────────────────────────────────────────
create trigger people_updated_at before update on people for each row execute function set_updated_at();
create trigger stories_updated_at before update on stories for each row execute function set_updated_at();
create trigger episodes_updated_at before update on episodes for each row execute function set_updated_at();
create trigger submissions_updated_at before update on submissions for each row execute function set_updated_at();
create trigger subscribers_updated_at before update on subscribers for each row execute function set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table editors enable row level security;
alter table people enable row level security;
alter table series enable row level security;
alter table stories enable row level security;
alter table episodes enable row level security;
alter table submissions enable row level security;
alter table subscribers enable row level security;
alter table newsletter_issues enable row level security;

-- Editors can see the editor list; only admins manage it (via dashboard/service role).
create policy "editors read editors" on editors for select to authenticated using (is_editor());

-- Public reference data.
create policy "public read people" on people for select using (true);
create policy "editors write people" on people for all to authenticated using (is_editor()) with check (is_editor());

create policy "public read series" on series for select using (true);
create policy "editors write series" on series for all to authenticated using (is_editor()) with check (is_editor());

-- Published (and scheduled-and-due) content is public; everything is visible to editors.
create policy "public read live stories" on stories for select
  using (status in ('published', 'scheduled') and published_at <= now());
create policy "editors manage stories" on stories for all to authenticated
  using (is_editor()) with check (is_editor());

create policy "public read live episodes" on episodes for select
  using (status in ('published', 'scheduled') and published_at <= now());
create policy "editors manage episodes" on episodes for all to authenticated
  using (is_editor()) with check (is_editor());

create policy "public read sent issues" on newsletter_issues for select using (sent_at is not null);
create policy "editors manage issues" on newsletter_issues for all to authenticated
  using (is_editor()) with check (is_editor());

-- Private data: no public policies at all. Server code inserts with the service role.
create policy "editors manage submissions" on submissions for all to authenticated
  using (is_editor()) with check (is_editor());
create policy "editors read subscribers" on subscribers for select to authenticated using (is_editor());

-- ─── API grants (RLS above decides which rows each role actually sees) ──────
grant select on people, series, stories, episodes, newsletter_issues to anon;
grant select, insert, update, delete on people, series, stories, episodes, newsletter_issues, submissions to authenticated;
grant select on editors, subscribers to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function is_editor() to anon, authenticated;
