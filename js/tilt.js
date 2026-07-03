import { reducedMotion } from "./motion.js";

// Pointer tilt on cards. CSS consumes --tilt-x/--tilt-y in a transform;
// JS only updates custom properties. Fine pointers with hover only.
const MAX_TILT = 5; // degrees

export function init() {
  if (reducedMotion()) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  document.querySelectorAll(".card--tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-py * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(px * MAX_TILT).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}
