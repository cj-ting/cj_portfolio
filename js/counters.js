import { reducedMotion } from "./motion.js";

// Stat counters animate 0 → target on first view. The HTML already contains
// the final numbers, so no-JS and reduced-motion users see correct values.
const DURATION = 1200;

function animate(el) {
  const target = Number(el.dataset.target);
  if (!Number.isFinite(target)) return;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / DURATION, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function init() {
  if (reducedMotion() || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-counter]").forEach((el) => io.observe(el));
}
