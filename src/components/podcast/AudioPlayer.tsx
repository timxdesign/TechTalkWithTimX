import { useCallback, useEffect, useRef, useState } from "react";

// The persistent player. It survives page navigation (transition:persist) and is
// driven by markup anywhere on the site:
//   <button data-play-episode data-slug data-title data-audio data-cover data-label>
//   <button data-seek="125" data-slug="...">   jump to a chapter
// It marks matching play buttons with data-state="playing" | "paused".

interface Track {
  slug: string;
  title: string;
  audio: string;
  cover?: string;
  label?: string;
}

const SPEEDS = [1, 1.25, 1.5, 2];
const posKey = (slug: string) => `ttt-pos:${slug}`;

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const s = Math.floor(t);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

function readTrack(el: HTMLElement): Track | null {
  const { slug, title, audio, cover, label } = el.dataset;
  if (!slug || !title || !audio) return null;
  return { slug, title, audio, cover, label };
}

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const pendingSeek = useRef<number | null>(null);

  const syncButtons = useCallback(() => {
    document.querySelectorAll<HTMLElement>("[data-play-episode]").forEach((btn) => {
      const active = track && btn.dataset.slug === track.slug;
      btn.dataset.state = active ? (playing ? "playing" : "paused") : "idle";
      btn.setAttribute("aria-pressed", String(Boolean(active && playing)));
    });
  }, [track, playing]);

  const load = useCallback((next: Track, startAt?: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track?.slug === next.slug) {
      if (startAt != null) audio.currentTime = startAt;
      if (audio.paused) void audio.play();
      else if (startAt == null) audio.pause();
      return;
    }
    let resume = startAt;
    if (resume == null) {
      try {
        resume = Number(localStorage.getItem(posKey(next.slug))) || 0;
      } catch {
        resume = 0;
      }
    }
    pendingSeek.current = resume;
    setTrack(next);
    setTime(resume);
    audio.src = next.audio;
    audio.playbackRate = speed;
    void audio.play();
  }, [track, speed]);

  // Delegated clicks: works for buttons on any page, including after navigation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const playBtn = target?.closest<HTMLElement>("[data-play-episode]");
      if (playBtn) {
        e.preventDefault();
        const next = readTrack(playBtn);
        if (next) load(next);
        return;
      }
      const seekBtn = target?.closest<HTMLElement>("[data-seek]");
      if (seekBtn) {
        e.preventDefault();
        const at = Number(seekBtn.dataset.seek);
        const source = document.querySelector<HTMLElement>(`[data-play-episode][data-slug="${seekBtn.dataset.slug}"]`);
        const next = source ? readTrack(source) : null;
        if (next) load(next, at);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [load]);

  useEffect(() => {
    syncButtons();
    document.addEventListener("astro:page-load", syncButtons);
    return () => document.removeEventListener("astro:page-load", syncButtons);
  }, [syncButtons]);

  // Remember where the listener got to.
  useEffect(() => {
    if (!track || !playing) return;
    const id = window.setInterval(() => {
      try {
        localStorage.setItem(posKey(track.slug), String(Math.floor(audioRef.current?.currentTime ?? 0)));
      } catch {}
    }, 5000);
    return () => window.clearInterval(id);
  }, [track, playing]);

  // Lock-screen and headphone controls.
  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: "Tech Talk with TimX",
      artwork: track.cover ? [{ src: track.cover, sizes: "512x512" }] : [],
    });
    const a = audioRef.current;
    navigator.mediaSession.setActionHandler("play", () => a?.play());
    navigator.mediaSession.setActionHandler("pause", () => a?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => a && (a.currentTime -= 15));
    navigator.mediaSession.setActionHandler("seekforward", () => a && (a.currentTime += 30));
  }, [track]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };
  const skip = (delta: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.min(Math.max(0, a.currentTime + delta), a.duration || Infinity);
  };
  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };
  const close = () => {
    audioRef.current?.pause();
    setTrack(null);
  };

  const progress = duration ? (time / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          if (pendingSeek.current) e.currentTarget.currentTime = pendingSeek.current;
          pendingSeek.current = null;
        }}
        onEnded={() => {
          try {
            if (track) localStorage.removeItem(posKey(track.slug));
          } catch {}
        }}
      />
      {track && (
          <section
            aria-label="Podcast player"
            className="animate-in fade-in slide-in-from-bottom-10 duration-500 ease-[var(--ease-editorial)] fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl overflow-hidden rounded-2xl bg-ink text-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-paper/10 sm:inset-x-6 sm:bottom-5"
          >
            <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              <a href={`/podcast/${track.slug}`} className="hidden shrink-0 sm:block" aria-label="Open episode page">
                {track.cover ? (
                  <img src={track.cover} alt="" width={48} height={48} className="size-12 rounded-md object-cover" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-md bg-paper text-ink text-xl font-black">T</span>
                )}
              </a>

              <button
                type="button"
                onClick={toggle}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform hover:scale-105"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11a.5.5 0 0 0 .76.43l9-5.5a.5.5 0 0 0 0-.86l-9-5.5A.5.5 0 0 0 4 2.5Z" /></svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <a href={`/podcast/${track.slug}`} className="truncate text-sm font-semibold hover:underline">
                    {track.label && <span className="mr-2 font-mono text-[0.68rem] uppercase tracking-wider text-paper/55">{track.label}</span>}
                    {track.title}
                  </a>
                  <span className="hidden shrink-0 font-mono text-[0.7rem] tabular-nums text-paper/60 sm:block">
                    {fmt(time)} / {fmt(duration)}
                  </span>
                </div>
                <div className="relative mt-2 h-1.5 rounded-full bg-paper/15">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-paper" style={{ width: `${progress}%` }} />
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={1}
                    value={time}
                    onChange={(e) => {
                      const a = audioRef.current;
                      if (a) a.currentTime = Number(e.target.value);
                    }}
                    aria-label="Seek"
                    aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" onClick={() => skip(-15)} className="hidden rounded-full px-2 py-1.5 font-mono text-xs text-paper/80 hover:bg-paper/10 sm:block" aria-label="Back 15 seconds">−15</button>
                <button type="button" onClick={() => skip(30)} className="hidden rounded-full px-2 py-1.5 font-mono text-xs text-paper/80 hover:bg-paper/10 sm:block" aria-label="Forward 30 seconds">+30</button>
                <button type="button" onClick={cycleSpeed} className="rounded-full px-2 py-1.5 font-mono text-xs tabular-nums text-paper/80 hover:bg-paper/10" aria-label={`Playback speed ${speed}x`}>{speed}×</button>
                <button type="button" onClick={close} className="grid size-8 place-items-center rounded-full text-paper/70 hover:bg-paper/10" aria-label="Close player">
                  <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12" /></svg>
                </button>
              </div>
            </div>
          </section>
        )}
    </>
  );
}
