# AGENTS.md

## Cursor Cloud specific instructions

This repo is the **Cursor Miami** landing page: a self-contained static site with
**no build step and no dependencies**. There is nothing to install.

### Services
- **Static site** — `index.html` (main landing page) and `projects.html`, plus images in `assets/`.
  Run it with a static file server from the repo root:
  ```bash
  python3 -m http.server 8080   # → http://localhost:8080
  ```
- **Serverless functions** (`api/luma.js`, `api/submit.js`) — Vercel-only Node functions for the
  live Luma calendar proxy and the Airtable contact-form storage. They are **not** served by
  `python3 -m http.server`, so requests to `/api/*` return 404 in local dev.
  - This is expected and **not** a blocker. The frontend gracefully degrades: the events section
    falls back to Luma's public API, and the contact form simply fails its POST.
  - Exercising these functions requires deploying on Vercel (`vercel dev`) with the secrets
    documented at the top of each file (`LUMA_API_KEY`, `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`).
    These external API keys are not needed for general development.

### Lint / test / build
- There is **no** lint config, **no** test suite, and **no** build step in this repo. Verify changes
  by opening the page in a browser (see above) and checking interactive elements render correctly.
