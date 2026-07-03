// Interactive terminal easter egg. Output is written with textContent
// only — no innerHTML, no parsing of user input as markup.
const COMMANDS = {
  help: () => [
    ["muted", "available commands:"],
    ["", "  whoami      who is this guy"],
    ["", "  skills      tech I actually use"],
    ["", "  projects    featured work"],
    ["", "  contact     get in touch"],
    ["", "  sudo hire-me"],
    ["", "  clear · exit"],
  ],
  whoami: () => [
    ["ok", "Christopher Ting"],
    ["", "Systems Administrator · Hybrid Infrastructure · DevOps / SecOps"],
    ["muted", "7+ years. Ottawa, Canada. Currently DevOps Engineer @ Slice Labs."],
  ],
  skills: () => [
    ["", "cloud:      AWS · Terraform · Kubernetes/EKS · Docker"],
    ["", "systems:    RHEL · Ubuntu · CentOS · Windows Server · Proxmox · VMware"],
    ["", "security:   SIEM · incident response · SOC 2 · IAM · Okta"],
    ["", "automation: Jenkins · Git · Bash · Python"],
    ["", "observe:    DataDog · Splunk"],
  ],
  projects: () => [
    ["", "1. Secure EKS Infrastructure & Access Control"],
    ["", "2. CI/CD Pipeline Automation (Jenkins + Terraform + Docker)"],
    ["", "3. SOC 2 Readiness & Security Operations"],
    ["", "4. Observability with DataDog & Splunk"],
    ["", "5. This website (view source — it's hand-written)"],
    ["muted", "scroll to #projects for details"],
  ],
  contact: () => [
    ["", "email:    hover the 'Email Me' button — it assembles itself"],
    ["", "linkedin: see the contact section"],
    ["muted", "no phone number here. OPSEC."],
  ],
  "sudo hire-me": () => [
    ["muted", "[sudo] password for guest: ********"],
    ["ok", "permission granted."],
    ["", "hiring process initiated — check the contact section."],
  ],
  exit: null,
  clear: null,
};

export function init() {
  const dialog = document.querySelector(".termdialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const log = dialog.querySelector(".termdialog__log");
  const input = dialog.querySelector(".termdialog__input");

  const print = (kind, text) => {
    const line = document.createElement("div");
    if (kind) line.className = kind;
    line.textContent = text;
    log.append(line);
    log.scrollTop = log.scrollHeight;
  };

  const greet = () => {
    if (log.childElementCount) return;
    print("ok", "cj-ops terminal v1.0 — unauthenticated guest session");
    print("muted", "type 'help' to get started");
  };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    print("muted", `$ ${raw}`);
    if (cmd === "exit") { dialog.close(); return; }
    if (cmd === "clear") { log.textContent = ""; return; }
    const handler = COMMANDS[cmd];
    if (handler) handler().forEach(([kind, text]) => print(kind, text));
    else {
      print("", `command not found: ${cmd}`);
      print("muted", "try 'help'");
    }
  };

  const open = () => {
    greet();
    dialog.showModal();
    input.focus();
  };

  document.querySelectorAll("[data-term-open]").forEach((btn) =>
    btn.addEventListener("click", open)
  );
  dialog.querySelector("[data-term-close]").addEventListener("click", () => dialog.close());
  document.addEventListener("keydown", (e) => {
    if (e.key === "~" && !dialog.open && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      open();
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      run(input.value);
      input.value = "";
    }
  });
  // Close when clicking the backdrop (outside the terminal window).
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
}
