# inlehmansterms.net — hub

Vite + React + Tailwind hub for `inlehmansterms.net` (GitHub Pages, `jdlehman.github.io`).

## Architecture

- This repo is the **hub**: landing page at `/`, and aggregator for sub-apps.
- Each app (e.g. `/water_calculator`) lives in **its own private repo**, any stack, any build tool. The hub's deploy workflow checks it out, builds it, and copies its static output to `dist/<slug>`.
- No Jekyll/Ruby. Fully client-side.

```
jdlehman.github.io            (public hub)  -> https://inlehmansterms.net/
jdlehman/water-calculator     (private)     -> https://inlehmansterms.net/water_calculator
jdlehman/another-app          (private)     -> https://inlehmansterms.net/another_app
```

## Local dev

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build && npm run preview
```

`src/apps.config.ts` lists all apps shown on the landing page.

## Adding a new app

See [APPS.md](./APPS.md) — full requirements for any private app repo (npm `build` → `dist`, `base: '/<slug>/'`, hub registration, secrets).

## Adding a new app (quick)

1. Create a private repo (e.g. `jdlehman/my-app`) with any stack that builds to `dist/index.html` (Vite, Astro, Next static export, etc.).
2. Add it to `src/apps.config.ts`.
3. Duplicate the 3 steps in `.github/workflows/deploy.yml` for the new slug (checkout → build → copy).
4. (Optional) Copy `.github/workflows/app-trigger-hub.yml.example` into the private app so pushes auto-trigger a hub rebuild.

## Deploy

- Push to `main` triggers `.github/workflows/deploy.yml` → builds hub, pulls each private app via `secrets.APPS_PAT`, merges to `dist/`, deploys to Pages.
- Ensure repo Settings → Pages → Source = **GitHub Actions**.
- `public/CNAME` must stay `inlehmansterms.net` (copied to `dist/CNAME`).

## Secrets

- `APPS_PAT` (in hub): PAT with `repo` scope that can read each private app repo.
- `HUB_PAT` (in each private app, if using trigger): PAT that can `POST /repos/jdlehman/jdlehman.github.io/dispatches`.

## Migrating from Jekyll

Old Jekyll files (`_config.yml`, `_posts`, `_layouts`, `Gemfile`, etc.) are obsolete. After verifying deploy, delete them. Keep `CNAME` (now at `public/CNAME`).

## Water calculator

Current `src/pages/WaterCalculator.tsx` is a fallback stub. Once `jdlehman/water-calculator` exists, its build overwrites `/water_calculator` on deploy. Replace its heuristic formula with the exact Meta AI build logic (https://www.meta.ai/share/a/81bfdb45-bdb2-423c-8506-2c147da7a1e3) when you export it.
