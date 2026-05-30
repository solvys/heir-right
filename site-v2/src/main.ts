import "./styles.css";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const phoneUrl = "tel://17869623457";
let lenis: Lenis | null = null;

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
  lenis = smoothScroller;

  smoothScroller.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    smoothScroller.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

function setupAnchorScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;

      event.preventDefault();
      window.history.pushState(null, "", hash);

      if (lenis && !reducedMotion) {
        lenis.scrollTo(target, { offset: -70, duration: 1.15 });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });
}

function setupHeroScrub(): void {
  const video = document.querySelector<HTMLVideoElement>("[data-hero-video]");
  if (!video || reducedMotion) return;

  const scrub = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    video.pause();
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        video.currentTime = Math.min(video.duration - 0.05, self.progress * video.duration);
      }
    });
  };

  if (video.readyState >= 1) {
    scrub();
  } else {
    video.addEventListener("loadedmetadata", scrub, { once: true });
  }
}

function setupProcessReveal(): void {
  if (reducedMotion) return;

  document.querySelectorAll<HTMLElement>(".process-grid article").forEach((card) => {
    gsap.fromTo(
      card,
      { y: 82, opacity: 0.001 },
      {
        y: 0,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          end: "top 54%",
          scrub: 0.45
        }
      }
    );
  });
}

async function setupAmbientCanvas(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-ambient-canvas]");
  if (!canvas || reducedMotion) return;

  try {
    const THREE = await import("three");
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 50);
    camera.position.z = 4.8;

    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const teal = new THREE.Color(0x0d57a6);
    const gold = new THREE.Color(0xbb9038);

    for (let i = 0; i < count; i += 1) {
      const ix = i * 3;
      positions[ix] = (Math.random() - 0.5) * 9;
      positions[ix + 1] = (Math.random() - 0.5) * 5.6;
      positions[ix + 2] = (Math.random() - 0.5) * 3.2;

      const color = Math.random() > 0.86 ? gold : teal;
      colors[ix] = color.r;
      colors[ix + 1] = color.g;
      colors[ix + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = new THREE.Vector2(0, 0);
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);
    resize();

    const tick = () => {
      const scroll = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1);
      points.rotation.x += (pointer.y * 0.035 - points.rotation.x) * 0.025;
      points.rotation.y += (pointer.x * 0.055 + scroll * 0.3 - points.rotation.y) * 0.018;
      points.position.y = scroll * -0.8;
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };
    tick();
  } catch {
    document.documentElement.classList.add("no-webgl");
  }
}

function setupBridgeForm(): void {
  const form = document.querySelector<HTMLFormElement>(".bridge-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "https://heirright.com/#get_your_offer";
  });

  document.querySelectorAll<HTMLAnchorElement>(`a[href="${phoneUrl}"]`).forEach((link) => {
    link.setAttribute("aria-label", "Call HeirRight at 786-962-3457");
  });
}

setupNavigation();
setupSmoothScroll();
setupAnchorScroll();
setupHeroScrub();
setupProcessReveal();
void setupAmbientCanvas();
setupBridgeForm();
