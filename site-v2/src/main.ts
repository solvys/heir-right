import "./styles.css";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupNavigation(): void {
  const nav = document.querySelector<HTMLElement>("[data-site-nav]");
  if (!nav) return;

  const sync = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 32);
  };

  window.addEventListener("scroll", sync, { passive: true });
  sync();
}

function setupAnchorScroll(): void {
  const scrollToTarget = (target: HTMLElement) => {
    const nav = document.querySelector<HTMLElement>("[data-site-nav]");
    const navOffset = nav ? nav.getBoundingClientRect().height + 20 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
    const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

    window.scrollTo({ top, behavior });

    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus({ preventScroll: true });

    if (!reducedMotion) {
      window.setTimeout(() => {
        const distanceFromOffset = Math.abs(target.getBoundingClientRect().top - navOffset);
        if (distanceFromOffset > 32) {
          window.scrollTo({ top, behavior: "auto" });
        }
      }, 720);
    }
  };

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;

      event.preventDefault();
      window.history.pushState(null, "", hash);
      scrollToTarget(target);
    });
  });
}

function setupHeroMotion(): void {
  const hero = document.querySelector<HTMLElement>(".hero");
  const blurTexts = document.querySelectorAll<HTMLElement>("[data-blur-text]");
  if (!hero || blurTexts.length === 0) return;

  hero.classList.add("is-motion-ready");

  const reveal = (target: HTMLElement) => {
    target.classList.add("is-visible");
    hero.classList.add("is-visible");
  };

  blurTexts.forEach((target) => {
    const words = target.textContent?.trim().split(/\s+/).filter(Boolean) ?? [];
    target.textContent = "";
    target.setAttribute("aria-label", words.join(" "));

    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "blur-word";
      span.textContent = word;
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--word-delay", `${index * 100}ms`);
      target.append(span);
    });

    if (reducedMotion) {
      reveal(target);
      return;
    }

    if (target.getBoundingClientRect().top < window.innerHeight) {
      reveal(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
  });
}

function setupReviewForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-review-form]");
  const status = document.querySelector<HTMLElement>("[data-form-status]");
  if (!form || !status) return;

  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const setStatus = (message: string, state: "success" | "error" | "loading") => {
    status.textContent = message;
    status.hidden = false;
    status.dataset.state = state;
    status.focus();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    form.classList.add("is-prepared");
    form.setAttribute("aria-busy", "true");
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Submitting...";
    }
    setStatus("Submitting the review request...", "loading");

    try {
      const response = await fetch("/api/review-request", {
        method: "POST",
        headers: {
          "content-type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json() as { ok?: boolean; receiptId?: string; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "The request could not be submitted.");
      }

      form.reset();
      setStatus(`Review request received. Confirmation ${result.receiptId}.`, "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The request could not be submitted.", "error");
    } finally {
      form.removeAttribute("aria-busy");
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Submit review request";
      }
    }
  });
}

setupNavigation();
setupAnchorScroll();
setupHeroMotion();
setupReviewForm();
