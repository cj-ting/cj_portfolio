import * as nav from "./nav.js";
import * as email from "./email.js";
import * as reveal from "./reveal.js";
import * as counters from "./counters.js";
import * as typer from "./typer.js";
import * as particles from "./particles.js";
import * as tilt from "./tilt.js";
import * as term from "./term.js";

// Mark JS as available — CSS uses this to enable reveal-hiding, so the
// no-JS experience never has invisible content.
document.documentElement.classList.add("js-enabled");

nav.init();
email.init();
reveal.init();
counters.init();
typer.init();
particles.init();
tilt.init();
term.init();
