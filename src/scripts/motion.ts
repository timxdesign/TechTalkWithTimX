import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Tells the failsafe in BaseLayout that motion loaded, so it keeps content hidden
// until each element's reveal runs.
(window as Window & { __tttMotion?: boolean }).__tttMotion = true;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
let observer: IntersectionObserver | null = null;

function initSmoothScroll() {
  if (reduceMotion || lenis) return;
  lenis = new Lenis({ lerp: 0.12 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function reveal(el: HTMLElement) {
  const delay = Number(el.dataset.revealDelay ?? 0);
  gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay });
}

function initPage() {
  ctx?.revert();
  observer?.disconnect();
  if (reduceMotion) return;

  ctx = gsap.context(() => {
    // Reveals use IntersectionObserver: it fires immediately for anything already
    // on screen and doesn't depend on scroll events.
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          ctx?.add(() => reveal(entry.target as HTMLElement));
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    // Opening sections use CSS (data-intro); everything further down reveals here.
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => observer!.observe(el));

    // Images marked data-parallax drift slightly against the scroll.
    gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

initSmoothScroll();
// Re-run after every view-transition navigation; Astro handles scroll restoration.
document.addEventListener("astro:page-load", () => {
  lenis?.resize();
  initPage();
});
