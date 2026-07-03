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

async function runGroup(nodes) {
  const jobs = [...nodes].map((el) => ({
    ...prepare(el),
    delay: el.hasAttribute("data-type") ? CMD_DELAY : OUT_DELAY,
  }));
  for (const job of jobs) {
    await typeInto(job.anim, job.text, job.delay);
    await new Promise((r) => setTimeout(r, PAUSE));
  }
}

// A [data-type-trigger] container's typed lines run once when it scrolls
// into view (below-the-fold terminals), hiding its output until the typed
// command finishes so the file content doesn't just appear mid-type.
async function runTrigger(container) {
  container.classList.add("is-typing");
  await runGroup(container.querySelectorAll("[data-type], [data-type-out]"));
  container.classList.remove("is-typing");
  container.classList.add("is-typed");
}

export function init() {
  if (reducedMotion()) return;

  const triggers = [...document.querySelectorAll("[data-type-trigger]")];
  const deferred = new Set();
  triggers.forEach((t) =>
    t.querySelectorAll("[data-type], [data-type-out]").forEach((n) => deferred.add(n))
  );

  const immediate = [...document.querySelectorAll("[data-type], [data-type-out]")].filter(
    (n) => !deferred.has(n)
  );
  if (immediate.length) runGroup(immediate);

  if (!triggers.length) return;
  if (!("IntersectionObserver" in window)) {
    triggers.forEach(runTrigger);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        runTrigger(entry.target);
      }
    },
    { threshold: 0.3 }
  );
  triggers.forEach((t) => io.observe(t));
}
