import { reducedMotion, onMotionChange } from "./motion.js";

// Canvas particle field behind the hero: sparse drifting dots with
// connecting lines. Skipped entirely under reduced motion (CSS gradient
// fallback remains), paused when the tab is hidden.
const DENSITY = 1 / 22000; // particles per px²
const MAX_PARTICLES = 90;
const LINK_DIST = 130;

export function init() {
  const canvas = document.querySelector(".hero__canvas");
  if (!canvas || reducedMotion()) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let raf = null;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { offsetWidth: w, offsetHeight: h } = canvas;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const count = Math.min(Math.round(w * h * DENSITY), MAX_PARTICLES);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 1.6,
    }));
  }

  function frame() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x = (p.x + p.vx + w) % w;
      p.y = (p.y + p.vy + h) % h;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 217, 126, 0.45)";
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(0, 217, 126, ${0.14 * (1 - d / LINK_DIST)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  const start = () => { if (raf === null) raf = requestAnimationFrame(frame); };
  const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };

  resize();
  start();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
  onMotionChange((e) => {
    if (e.matches) { stop(); ctx.clearRect(0, 0, canvas.width, canvas.height); }
    else { resize(); start(); }
  });
}
