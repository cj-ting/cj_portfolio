# cj-ops — portfolio of Christopher Ting

Personal portfolio site: **DevOps · SecOps · IT Ops**. Hand-coded HTML, CSS, and
vanilla JavaScript. No frameworks, no build step, no runtime dependencies, no
trackers. The site itself — and the pipeline that ships it — is a working sample
of how I run infrastructure.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Markup/style/script | Hand-written HTML + CSS + ES modules | Nothing to patch, nothing to compile, fully auditable |
| Fonts | JetBrains Mono, self-hosted woff2 (OFL) | Zero external requests |
| Hosting | GitHub Pages | Static, immutable deploys |
| Deploy | GitHub Actions with OIDC | No long-lived tokens |

## Pipeline (`.github/workflows/ci.yml`)

Every push and PR runs four parallel checks; deploy to Pages only happens on
`main` after **all** of them pass:

1. **html-validate** — strict HTML validation (inline styles forbidden)
2. **lychee** — link checking (also weekly, to catch link rot)
3. **Lighthouse CI** — fails the build below 100 accessibility / 95 perf, best-practices, SEO
4. **zizmor + gitleaks** — workflow security audit and secret scanning

All actions are pinned to full commit SHAs; Dependabot keeps the pins fresh.
See [SECURITY.md](SECURITY.md) for the full security posture.

## Local development

No install needed:

```sh
# auto-reload while editing
npx live-server .

# or, plain serving exactly like Pages does it
python3 -m http.server 8000
```

## Deploying (first-time setup)

1. Create the GitHub repo and push:
   ```sh
   git remote add origin git@github.com:cj-ting/cj_portfolio.git
   git push -u origin main
   ```
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Replace every `USERNAME` placeholder (`grep -rn USERNAME .`) with your real
   GitHub username / LinkedIn handle, in:
   `index.html`, `cv.html`, `.well-known/security.txt`.
4. Set your git author to your GitHub noreply address before pushing:
   ```sh
   git config user.email "<id>+<username>@users.noreply.github.com"
   ```
5. Recommended repo hardening: branch protection on `main`,
   Actions → "Allow selected actions only", private vulnerability reporting on.

## Easter egg

Press <kbd>~</kbd> on the site. Try `sudo hire-me`.
