// Pulls the 11-character video ID out of any common YouTube link:
// youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID,
// m.youtube.com, music.youtube.com and youtube-nocookie.com.
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url
    .trim()
    .match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
  return match?.[1] ?? null;
}

export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
