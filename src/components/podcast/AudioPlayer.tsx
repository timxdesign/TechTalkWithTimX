import { useCallback, useEffect, useRef, useState } from "react";

// The persistent player. It survives page navigation (transition:persist) and is
// driven by markup anywhere on the site:
//   <button data-play-episode data-slug data-title data-audio data-cover data-label>
//   <button data-seek="125" data-slug="...">   jump to a chapter
// It marks matching play buttons with data-state="playing" | "paused".
//
// Episodes without an audio file play from YouTube (data-youtube="<video id>")
// through YouTube's official embedded player. YouTube's terms require that player
// to stay visible at 200×200px or more, so it's shown in the dock, never hidden.

interface Track {
  slug: string;
  title: string;
  audio?: string;
  youtube?: string;
  cover?: string;
  label?: string;
  duration?: number; // seconds, shown before the media has loaded
}

// The parts of the YouTube IFrame API we use.
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setPlaybackRate(rate: number): void;
  loadVideoById(opts: { videoId: string; startSeconds?: number }): void;
  destroy(): void;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_PLAYING = 1;
const YT_ENDED = 0;
let ytApi: Promise<YTNamespace> | null = null;
function loadYouTubeApi() {
  ytApi ??= new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.append(script);
  });
  return ytApi;
}

const SPEEDS = [1, 1.25, 1.5, 2];
const posKey = (slug: string) => `ttt-pos:${slug}`;
// The episode a visitor closed; it won't be queued for them again.
const DISMISSED_KEY = "ttt-autoplay-dismissed";
// Set once per browser session so autoplay only happens on the first page.
const SESSION_KEY = "ttt-autoplay";

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const s = Math.floor(t);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

function readTrack(el: HTMLElement): Track | null {
  const { slug, title, audio, youtube, cover, label } = el.dataset;
  if (!slug || !title || !(audio || youtube)) return null;
  return { slug, title, audio, youtube: audio ? undefined : youtube, cover, label };
}

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const pendingSeek = useRef<number | null>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const ytPending = useRef<{ id: string; start: number } | null>(null);
  // False while an auto-queued YouTube episode waits for a tap, so visitors who
  // never press play don't download YouTube's player.
  const [ytArmed, setYtArmed] = useState(true);
  const trackRef = useRef(track);
  trackRef.current = track;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const isYouTube = Boolean(track?.youtube);

  // One set of controls for both engines.
  const media = useCallback(() => {
    // The API's methods only exist once the player is ready.
    const yt = isYouTube && typeof ytRef.current?.playVideo === "function" ? ytRef.current : null;
    const a = audioRef.current;
    return {
      paused: () => (yt ? yt.getPlayerState() !== YT_PLAYING : (a?.paused ?? true)),
      play: () => (yt ? yt.playVideo() : void a?.play().catch(() => {})),
      pause: () => (yt ? yt.pauseVideo() : a?.pause()),
      current: () => (yt ? yt.getCurrentTime() : (a?.currentTime ?? 0)),
      length: () => (yt ? yt.getDuration() : (a?.duration ?? 0)),
      seek: (t: number) => {
        if (yt) yt.seekTo(t, true);
        else if (a) a.currentTime = t;
        setTime(t);
      },
      rate: (r: number) => (yt ? yt.setPlaybackRate(r) : a && (a.playbackRate = r)),
    };
  }, [isYouTube]);

  const syncButtons = useCallback(() => {
    document.querySelectorAll<HTMLElement>("[data-play-episode]").forEach((btn) => {
      const active = track && btn.dataset.slug === track.slug;
      btn.dataset.state = active ? (playing ? "playing" : "paused") : "idle";
      btn.setAttribute("aria-pressed", String(Boolean(active && playing)));
    });
  }, [track, playing]);

  const load = useCallback((next: Track, startAt?: number, opts: { auto?: boolean } = {}) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track?.slug === next.slug) {
      if (isYouTube && !ytArmed) {
        if (startAt != null && ytPending.current) ytPending.current.start = startAt;
        setYtArmed(true);
        return;
      }
      const m = media();
      if (startAt != null) m.seek(startAt);
      if (m.paused()) m.play();
      else if (startAt == null) m.pause();
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
    setTrack(next);
    setTime(resume);
    setDuration(next.duration ?? 0);

    if (next.youtube) {
      setYtArmed(!opts.auto);
      audio.pause();
      audio.removeAttribute("src");
      if (ytRef.current) ytRef.current.loadVideoById({ videoId: next.youtube, startSeconds: resume });
      else ytPending.current = { id: next.youtube, start: resume }; // created once the dock renders
      return;
    }

    ytRef.current?.destroy();
    ytRef.current = null;
    pendingSeek.current = resume;
    audio.src = next.audio!;
    audio.playbackRate = speed;
    // Browsers refuse to start sound before the visitor interacts with the page;
    // an auto-queued episode then simply waits in the dock for a tap.
    audio.play().catch(() => {});
  }, [track, speed, media, isYouTube, ytArmed]);

  // Queue the newest episode on the first page of a visit and try to play it.
  const loadRef = useRef(load);
  loadRef.current = load;
  useEffect(() => {
    if (location.pathname.startsWith("/studio")) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      return;
    }
    let cancelled = false;
    fetch("/api/latest-episode")
      .then((res) => (res.ok ? (res.json() as Promise<Track | null>) : null))
      .then((next) => {
        if (cancelled || !next || trackRef.current) return;
        try {
          if (localStorage.getItem(DISMISSED_KEY) === next.slug) return;
        } catch {}
        loadRef.current(next, undefined, { auto: true });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Create the YouTube player inside the dock once it has rendered.
  useEffect(() => {
    const pending = ytPending.current;
    const host = ytHostRef.current;
    if (!isYouTube || !ytArmed || !pending || !host) return;
    ytPending.current = null;
    let cancelled = false;
    void loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      // YouTube replaces the element it's given, so hand it a child React doesn't manage.
      const el = document.createElement("div");
      host.replaceChildren(el);
      ytRef.current = new YT.Player(el, {
        videoId: pending.id,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, start: Math.floor(pending.start) },
        events: {
          onReady: (e) => {
            e.target.setPlaybackRate(speedRef.current);
            e.target.playVideo();
          },
          onStateChange: (e) => {
            setPlaying(e.data === YT_PLAYING);
            if (e.data === YT_PLAYING) setDuration(e.target.getDuration());
            if (e.data === YT_ENDED) {
              try {
                localStorage.removeItem(posKey(trackRef.current?.slug ?? ""));
              } catch {}
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [isYouTube, ytArmed, track]);

  // YouTube has no timeupdate event, so poll while it plays.
  useEffect(() => {
    if (!isYouTube || !playing) return;
    const id = window.setInterval(() => {
      const yt = ytRef.current;
      if (!yt) return;
      setTime(yt.getCurrentTime());
      setDuration(yt.getDuration());
    }, 500);
    return () => window.clearInterval(id);
  }, [isYouTube, playing]);

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
        localStorage.setItem(posKey(track.slug), String(Math.floor(media().current())));
      } catch {}
    }, 5000);
    return () => window.clearInterval(id);
  }, [track, playing, media]);

  // Lock-screen and headphone controls.
  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: "Tech Talk with TimX",
      artwork: track.cover ? [{ src: track.cover, sizes: "512x512" }] : [],
    });
    const m = media();
    navigator.mediaSession.setActionHandler("play", () => m.play());
    navigator.mediaSession.setActionHandler("pause", () => m.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => m.seek(Math.max(0, m.current() - 15)));
    navigator.mediaSession.setActionHandler("seekforward", () => m.seek(m.current() + 30));
  }, [track, media]);

  const toggle = () => {
    if (isYouTube && !ytArmed) return setYtArmed(true);
    const m = media();
    if (m.paused()) m.play();
    else m.pause();
  };
  const skip = (delta: number) => {
    const m = media();
    m.seek(Math.min(Math.max(0, m.current() + delta), m.length() || Infinity));
  };
  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    media().rate(next);
  };
  const close = () => {
    try {
      if (track) localStorage.setItem(DISMISSED_KEY, track.slug);
    } catch {}
    audioRef.current?.pause();
    ytRef.current?.destroy();
    ytRef.current = null;
    setPlaying(false);
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
            {isYouTube && ytArmed && (
              <div className="px-3 pt-3 sm:px-4 sm:pt-4">
                <div ref={ytHostRef} className="h-[200px] w-full overflow-hidden rounded-lg bg-black sm:w-[356px]" />
              </div>
            )}
            <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              <a href={`/podcast/${track.slug}`} className={isYouTube && ytArmed ? "hidden" : "hidden shrink-0 sm:block"} aria-label="Open episode page">
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
                    onChange={(e) => media().seek(Number(e.target.value))}
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
