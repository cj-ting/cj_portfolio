# Security posture

This is a static portfolio site, but it's built the way I'd build production
infrastructure. This document states what is enforced, what is intentionally
accepted, and why.

## Reporting

Please report issues via GitHub private vulnerability reporting
(`Security → Report a vulnerability` on this repo). Contact details:
[`.well-known/security.txt`](.well-known/security.txt) (RFC 9116).

## What is enforced

- **Zero runtime dependencies.** No frameworks, no CDN scripts, no external
  fonts, no analytics. Every byte served comes from this repo. This makes SRI
  unnecessary — the stronger claim than needing it.
- **Content Security Policy** (meta tag):
  `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self';
  font-src 'self'; base-uri 'none'; form-action 'none';`
  No `unsafe-inline` anywhere: no inline styles, no inline scripts, no inline
  event handlers.
- **DOM hygiene.** The interactive terminal writes output with `textContent`
  only — user input is never parsed as HTML.
- **No data collection.** No forms, no cookies, no storage, no third-party
  requests. `referrer: no-referrer` on all pages.
- **PII minimization.** No phone number or street address anywhere in the repo
  or its history. The email address never appears in the HTML source — it is
  assembled client-side on first human interaction.
- **Supply chain / CI.**
  - All GitHub Actions pinned to full commit SHAs, refreshed by Dependabot.
  - Top-level workflow permission is `contents: read`; the deploy job alone
    gets `pages: write` + `id-token: write` and deploys via **OIDC** — no
    long-lived deploy tokens exist.
  - `zizmor` audits the workflows themselves; `gitleaks` scans history for
    secrets on every push.
  - Deploys are gated on validation, link check, Lighthouse, and security lint.

## Accepted limitations (and why)

- **GitHub Pages cannot send custom response headers.** Therefore:
  - CSP is delivered via `<meta http-equiv>`, which cannot enforce
    `frame-ancestors` or reporting.
  - `X-Content-Type-Options`, `Permissions-Policy`, and `HSTS` beyond what
    GitHub sends are not configurable.
  - **Risk assessment:** the site has no authentication, no sessions, no
    forms, and no sensitive state — clickjacking and MIME-sniffing attacks
    have nothing to exploit here.
  - **Upgrade path:** front the site with Cloudflare (free tier) and set real
    headers via Transform Rules, or move to Cloudflare Pages and use a
    `_headers` file.
- **`robots.txt` allows everything.** It is not an access-control mechanism,
  and nothing sensitive is published to need hiding.
