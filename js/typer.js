import { reducedMotion } from "./motion.js";

// Hero terminal typing. The full text ships in the HTML (no-JS floor);
// JS captures it, moves the real text into a visually-hidden node for
// screen readers, and retypes an aria-hidden copy character by character.
const CMD_DELAY = 55;
const OUT_DELAY = 14;
const PAUSE = 350;

function prepare(el) {
  const text = el.textContent;
  el.textContent = "";
  const sr = document.createElement("span");
  sr.className = "visually-hidden";
  sr.textContent = text;
  const anim = document.createElement("span");
  anim.setAttribute("aria-hidden", "true");
  el.append(sr, anim);
  return { anim, text };
}

function typeInto(anim, text, delay) {
  return new Promise((resolve) => {
    let i = 0;
    const step = () => {
      anim.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, delay);
      else resolve();
    };
    step();
  });
}

export async function init() {
  if (reducedMotion()) return;
  const nodes = document.querySelectorAll("[data-type], [data-type-out]");
  if (!nodes.length) return;
  const jobs = [...nodes].map((el) => ({
    ...prepare(el),
    delay: el.hasAttribute("data-type") ? CMD_DELAY : OUT_DELAY,
  }));
  for (const job of jobs) {
    await typeInto(job.anim, job.text, job.delay);
    await new Promise((r) => setTimeout(r, PAUSE));
  }
}
