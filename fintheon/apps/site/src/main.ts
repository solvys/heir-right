import "./styles.css";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const WEB_APP_ORIGIN = import.meta.env.VITE_WEB_APP_URL ?? "http://127.0.0.1:3100";

function authUrl(path: string): string {
  return new URL(path, WEB_APP_ORIGIN).toString();
}

function setupAuthLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>("[data-auth-cta]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    link.href = authUrl(href);
  });
}

function setupNavigation(): void {
  const nav = document.querySelector<HTMLElement>("[data-site-nav]");
  if (!nav) return;

  const sync = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 48);
  };

  window.addEventListener("scroll", sync, { passive: true });
  sync();
}

function setupSmoothScroll(): void {
  if (reducedMotion) return;

  const smoothScroller = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    syncTouch: false
  });

  smoothScroller.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    smoothScroller.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;

      event.preventDefault();
      window.history.pushState(null, "", hash);
      smoothScroller.scrollTo(target, { offset: -70, duration: 1.15 });
    });
  });
}

function setupReveals(): void {
  if (reducedMotion) return;

  gsap.utils.toArray<HTMLElement>(".proof-strip article, .steps-grid li, .hermes-card, .features-grid article").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%"
        }
      }
    );
  });
}

function setupTerminalTypewriter(): void {
  if (reducedMotion) return;

  const terminal = document.querySelector<HTMLElement>(".hero-terminal");
  if (!terminal) return;

  gsap.from(terminal, {
    y: 24,
    opacity: 0,
    duration: 1,
    delay: 0.4,
    ease: "power2.out"
  });
}

setupAuthLinks();
setupNavigation();
setupSmoothScroll();
setupReveals();
setupTerminalTypewriter();
