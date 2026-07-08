import { reducedMotion } from "./motion.js";

// Terminal-style typing. The full text/markup ships in the HTML (no-JS
// floor); JS captures it, moves the real text into a visually-hidden node
// for screen readers, and retypes an aria-hidden copy character by
// character. [data-type-rich] additionally preserves child <span> markup
// (e.g. accent-colored words) by typing across text "runs" instead of a
// single flat string.
const CMD_DELAY = 55;
const OUT_DELAY = 14;
const PAUSE = 350;
const SELECTOR = "[data-type], [data-type-out], [data-type-rich]";

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderRuns(runs, count) {
  let remaining = count;
  let html = "";
  for (const run of runs) {
    if (remaining <= 0) break;
    const slice = run.text.slice(0, remaining);
    remaining -= slice.length;
    if (!slice) continue;
    html += run.cls ? `<span class="${run.cls}">${escapeHtml(slice)}</span>` : escapeHtml(slice);
  }
  return html;
}

function prepare(el) {
  const rich = el.hasAttribute("data-type-rich");
  const runs = rich
    ? [...el.childNodes].map((n) => ({
        text: n.textContent,
        cls: n.nodeType === 1 ? n.getAttribute("class") : null,
      }))
    : null;
  const text = el.textContent;
  el.textContent = "";
  const sr = document.createElement("span");
  sr.className = "visually-hidden";
  sr.textContent = text;
  const anim = document.createElement("span");
  anim.setAttribute("aria-hidden", "true");
  el.append(sr, anim);
  return {
    anim,
    text,
    runs,
    delay: el.hasAttribute("data-type-out") ? OUT_DELAY : CMD_DELAY,
  };
}

function typeInto(job) {
  const { anim, text, runs, delay } = job;
  return new Promise((resolve) => {
    let i = 0;
    const step = () => {
      i++;
      if (runs) anim.innerHTML = renderRuns(runs, i);
      else anim.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, delay);
      else resolve();
    };
    step();
  });
}

async function runGroup(nodes) {
  const jobs = [...nodes].map(prepare);
  for (const job of jobs) {
    await typeInto(job);
    await new Promise((r) => setTimeout(r, PAUSE));
  }
}

// A [data-type-trigger] container's typed lines run once when it scrolls
// into view (below-the-fold terminals), hiding its output until the typed
// command finishes — then the rest (e.g. a "cat"-ed paragraph) types out
// visibly in place, like real command output streaming in.
async function runTrigger(container) {
  const jobs = [...container.querySelectorAll(SELECTOR)].map(prepare);
  if (!jobs.length) return;

  container.classList.add("is-typing");
  await typeInto(jobs[0]);
  container.classList.remove("is-typing");
  container.classList.add("is-typed");
  await new Promise((r) => setTimeout(r, PAUSE));

  for (const job of jobs.slice(1)) {
    await typeInto(job);
    await new Promise((r) => setTimeout(r, PAUSE));
  }
}

export function init() {
  if (reducedMotion()) return;

  const triggers = [...document.querySelectorAll("[data-type-trigger]")];
  const deferred = new Set();
  triggers.forEach((t) => t.querySelectorAll(SELECTOR).forEach((n) => deferred.add(n)));

  const immediate = [...document.querySelectorAll(SELECTOR)].filter((n) => !deferred.has(n));
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
