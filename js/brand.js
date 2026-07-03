import { reducedMotion } from "./motion.js";

// Nav brand: infinite type → pause → delete → pause loop. Unlike typer.js
// (types once, for real content) this repeats forever, so it's purely
// decorative — the real "cj-ops" text stays in a visually-hidden node the
// whole time and is never touched by the loop.
const TYPE_DELAY = 140;
const DELETE_DELAY = 80;
const HOLD_TYPED = 2200;
const HOLD_EMPTY = 500;

export function init() {
  const el = document.querySelector(".nav__brand-name");
  if (!el || reducedMotion()) return;

  const text = el.textContent;
  el.textContent = "";
  const sr = document.createElement("span");
  sr.className = "visually-hidden";
  sr.textContent = text;
  const anim = document.createElement("span");
  anim.setAttribute("aria-hidden", "true");
  el.append(sr, anim);

  let i = 0;
  let deleting = false;
  const tick = () => {
    anim.textContent = text.slice(0, i);
    let delay;
    if (!deleting) {
      if (i < text.length) {
        i++;
        delay = TYPE_DELAY;
      } else {
        deleting = true;
        delay = HOLD_TYPED;
      }
    } else if (i > 0) {
      i--;
      delay = DELETE_DELAY;
    } else {
      deleting = false;
      delay = HOLD_EMPTY;
    }
    setTimeout(tick, delay);
  };
  tick();
}
