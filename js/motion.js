// Shared reduced-motion helper. Every animated module consults this first.
const query = window.matchMedia("(prefers-reduced-motion: reduce)");

export function reducedMotion() {
  return query.matches;
}

export function onMotionChange(fn) {
  query.addEventListener("change", fn);
}
