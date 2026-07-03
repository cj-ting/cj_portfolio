// Email de-obfuscation: the address never appears in the HTML source.
// Parts are stored reversed in data attributes and assembled only when
// a human interacts with the link — static scrapers get nothing.
const rev = (s) => [...s].reverse().join("");

export function init() {
  document.querySelectorAll("[data-email]").forEach((link) => {
    const assemble = () => {
      const addr = `${rev(link.dataset.u)}@${rev(link.dataset.d)}`;
      link.href = `mailto:${addr}`;
    };
    link.addEventListener("pointerenter", assemble, { once: true });
    link.addEventListener("focus", assemble, { once: true });
    // Touch devices: assemble on first tap, then follow the real href.
    link.addEventListener("click", assemble);
  });
}
