# App Requirements — for private repos aggregated under `inlehmansterms.net`

This hub (`jdlehman.github.io` → `inlehmansterms.net`) aggregates **private** client-side apps under subpaths (`/water_calculator`, `/<your_app>`). This doc is the checklist for any new private repo you want to mount.

## TL;DR Checklist

- [ ] Private repo under `jdlehman/<app_name>` (e.g. `jdlehman/water_calculator` lives at `../water_calculator` locally)
- [ ] Static only — no server, no secrets at runtime
- [ ] `package.json` with `build` script **or** plain `index.html` at repo root
- [ ] Build outputs to `dist/` (configurable via `src/apps.config.ts` → `buildDir`)
- [ ] `vite.config.ts` (if Vite) sets `base: '/<slug>/'` — for unlisted use `base: '/<uuid>/'` where `<uuid>` is the same as the hub secret (see §5)
- [ ] Added to hub: **public** → entry in `src/apps.config.ts` (with its landing page `section`) + 3-step block in `.github/workflows/deploy.yml`; **unlisted** → NO config entry, instead hub secret `*_SLUG` + 4-step block (validate + checkout + build + merge) in `deploy.yml` (see §5)
- [ ] `index.html` has share preview metadata (OG/Twitter) + per-app icons (`favicon.svg`, `apple-touch-icon.png`, `og-image.png`, see §9)
- [ ] `vite.config.ts` has PWA auto-update + cache cleanup so redeploys are live without manual `CACHE` bumps (see §10)
- [ ] Analytics: GA4 `G-SC00ZQFH59` is auto-injected — nothing to do per-app (see §11). Manual snippet only if you deploy the private app outside the hub
- [ ] Optional: trigger workflow in private repo to auto-rebuild hub on push (see §6)

Public apps appear on the landing page and in `sitemap.xml`; unlisted apps are hidden and served with `noindex` (see §5).

If all boxes are checked, hub's deploy will pull, build, and copy `dist → dist/<slug>` on every `main` push.

---

## 1. Repo layout

```
jdlehman/my-app          # private repo, any stack
├── package.json         # required only if you need a build step
├── vite.config.ts       # or astro.config.mjs / next.config.js
├── index.html           # or src/index.html depending on framework
├── src/...
└── public/...           # static assets (copied as-is by most bundlers)
```

* **Location:** `jdlehman/<repo>` — hub references it as `repository: jdlehman/<repo>` in `deploy.yml`.
* **Visibility:** private is fine — hub authenticates with `secrets.APPS_PAT` (PAT with `repo` scope).
* **Do NOT enable GitHub Pages** on the private repo and do NOT add a `CNAME` there — only the hub has Pages + `inlehmansterms.net`.

## 2. Build contract

Hub does this for each app (see `.github/workflows/deploy.yml`):

```sh
# 1. checkout private repo to /tmp/apps/<slug>
# 2. build
if [ -f package.json ]; then
  npm ci
  npm run build        # must create dist/ (or $buildDir)
fi
if [ ! -d dist ] && [ -f index.html ]; then
  mkdir -p dist        # plain HTML fallback — single file at repo root
  cp index.html dist/
fi
# 3. merge
cp -r /tmp/apps/<slug>/dist/* dist/<slug>/
```

**Requirements:**

* **If you need a build** (Vite, Astro, Next static export, etc.): `package.json` must have:
  ```json
  {
    "scripts": { "build": "vite build" }
  }
  ```
  Hub runs `npm ci` + `npm run build`. No `dist` should be committed — `.gitignore` it.

* **If you're plain HTML/JS/CSS:** just commit `index.html` at repo root (and any `style.css` / `app.js` it references). Hub will wrap it into `dist/`.

* **Output dir:** default `dist/`. If your framework uses `build/` / `out/` etc., set it in the hub:
  ```ts
  // src/apps.config.ts
  { slug: 'my_app', repo: 'jdlehman/my-app', buildDir: 'out' }
  ```
  and ensure the workflow's `Build` + `Merge` steps use that dir.

* **Node version:** hub uses Node 20 (`actions/setup-node@v4` with `node-version: 20`). Match it locally or pin your private repo's `engines` if needed. No Ruby/Jekyll.

## 3. Base path (important)

Your app will be served at `https://inlehmansterms.net/<slug>/`, not at `/`.

* **Vite:** set the base so asset URLs are prefixed:
  ```ts
  // vite.config.ts in private repo
  import { defineConfig } from 'vite'
  export default defineConfig({
    base: '/my_app/',   // must match slug + trailing slash
    build: { outDir: 'dist' }
  })
  ```
* **Astro:** `astro.config.mjs` → `base: '/my_app'`
* **Next static export:** `next.config.js` → `basePath: '/my_app', assetPrefix: '/my_app/'`
* **Plain HTML:** use relative links (`./style.css`, `./app.js`) or absolute under `/my_app/`.

Without this, `<script src="/assets/...">` will 404 when served under `/my_app/`.

## 4. Examples

### Vite + React + TS (recommended)
```json
// package.json
{ "scripts": { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" } }
```
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()], base: '/my_app/', build: { outDir: 'dist' } })
```

### Plain HTML (like current `../water_calculator` Drop Bench)
```
my-app/
├── index.html   # 32k single-file app — no package.json needed
└── (optional) style.css / app.js referenced relatively
```

### Astro / Next static — same idea, ensure `dist`/`out` and `base`.

## 5. Hub registration — public, unlisted and secret apps

There are three kinds of app:

| Kind | URL | On the landing page / sitemap | Search engines | Analytics | Where it's configured |
|---|---|---|---|---|---|
| **Public** | `/<slug>/` | yes | indexed | GA4 | `src/apps.config.ts` + `deploy.yml` |
| **Unlisted** | readable `/<slug>/`, e.g. `/recipes/` | no | `noindex` | none | `deploy.yml` only |
| **Secret** | `/<uuid>/` from a hub secret | no | `noindex` | none | hub secret `<NAME>_SLUG` + `deploy.yml` |

Unlisted and secret apps are both left out of `src/apps.config.ts` (so the slug is not in the hub's
client bundle), the sitemap and `robots.txt`, and get `<meta name="robots" content="noindex, nofollow, noarchive">`
injected. In `deploy.yml`, their merge step writes a `.unlisted` marker file into the app folder so
analytics is skipped (their URLs can carry private data, e.g. recipe_viewer's `#pair=` links); the
markers are deleted before upload. A secret app's path is only as private as the people you share the
link with; an unlisted app's path is guessable. Neither is authentication.

Songwriter is **unlisted** at `/songwriter/` and Sectional at `/sectional/`, both built from the midi_studio repo (`apps/songwriter`, `apps/sectional`). New apps start unlisted until they are ready to share, then get an entry in `src/apps.config.ts` to become public.

Score reader is **unlisted** at `/score-reader/`, but the hub doesn't build it. It is a **public** repo (`jdlehman/score-reader`, AGPL, because it runs Audiveris) with its own GitHub Pages workflow, and GitHub serves a project site of this account under the hub's domain, at `/<repo>/`. Its page has its own `noindex` and no analytics. Don't add a `score-reader` folder to the hub: it would clash with the project site. Keep the AGPL code out of the hub and out of the private repos; Sectional only links to it and opens the `.mxl` files it saves.

recipe_viewer is **unlisted** at `/recipes/`. It used to be secret at `/<RECIPE_VIEWER_SLUG>/`; that
path now holds only a redirect to `/recipes/` and a service worker that retires installed copies.

### Secret (UUID) apps

This hub supports **secret** apps that are not shown on the landing page and not discoverable via `robots.txt`/`sitemap.xml`. They are accessed only via a UUID URL (e.g. `https://inlehmansterms.net/<uuid>/`). The deploy injects `noindex` so search engines don't index them even if the link is shared — obscurity, not auth. `robots.txt` intentionally does NOT contain `Disallow: /<uuid>/` (that would advertise the path).

* **Public** (`visibility: 'public'` or omitted): entry in `src/apps.config.ts`, shown on `/`, in `sitemap.xml`, indexed normally.
* **Unlisted** (`secret` UUID): **NOT** in `src/apps.config.ts` — slug stored in GitHub Secret (e.g. `RECIPE_VIEWER_SLUG`), hidden from `/`, excluded from `sitemap.xml` and `robots.txt`, served with `<meta name="robots" content="noindex, nofollow, noarchive">`. The UUID never appears in git history or the hub's client JS bundle. Each unlisted app needs its own `<NAME>_SLUG` secret or the deploy fails.

Generate a stable UUID once with `node -e "console.log(crypto.randomUUID())"`, store it as a secret in the **hub** repo (Settings → Secrets → Actions), and never regenerate it (changing it breaks existing links). Use the same UUID as `base: '/<uuid>/'` in the private app's `vite.config.ts`.

Two places in `jdlehman.github.io`:

**a) `src/apps.config.ts`** — drives the landing page (public only):

```ts
// Public — shows on landing, in sitemap
export const apps: AppConfig[] = [
  { slug: 'water_drop_bench', title: 'Water Drop Bench', description: '...', repo: 'jdlehman/water_drop_bench', buildDir: 'dist', visibility: 'public', section: 'Coffee' },
  { slug: 'my_app', title: 'My App', description: '...', repo: 'jdlehman/my-app', buildDir: 'dist', visibility: 'public', section: 'Music' },
]
// Unlisted apps are NOT here — see (b) below. Their UUIDs are in GitHub Secrets.
```

**a2) Unlisted apps — NO entry in `src/apps.config.ts`.** Instead, store the UUID as a hub secret:

- Hub repo → Settings → Secrets → Actions → `RECIPE_VIEWER_SLUG` = `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (generate with `node -e "console.log(crypto.randomUUID())"`)
- Private app → `vite.config.ts` → `base: '/<same-uuid>/'` (must match the secret)

Each unlisted app gets its own `*_SLUG` secret; deploy fails if any required secret is missing.

**b) `.github/workflows/deploy.yml`** — duplicate the 3-step block:

Public app:

```yaml
- name: Checkout my-app (private)
  uses: actions/checkout@v4
  with: { repository: jdlehman/my-app, token: ${{ secrets.APPS_PAT }}, path: apps/my-app }
  continue-on-error: true

- name: Build my-app
  working-directory: apps/my-app
  run: |
    if [ -f package.json ]; then
      npm ci
      npm run build
    fi
    if [ ! -d dist ] && [ -f index.html ]; then
      mkdir -p dist
      cp index.html dist/
    fi

- name: Merge my-app into hub dist
  run: |
    if [ -d apps/my-app/dist ]; then
      mkdir -p dist/my_app
      cp -r apps/my-app/dist/* dist/my_app/
    fi
```

Unlisted UUID app (secret `RECIPE_VIEWER_SLUG`):

```yaml
- name: Validate unlisted slugs (fail if secret missing)
  run: |
    if [ -z "${{ secrets.RECIPE_VIEWER_SLUG }}" ]; then echo "ERROR: RECIPE_VIEWER_SLUG not set"; exit 1; fi
    echo "${{ secrets.RECIPE_VIEWER_SLUG }}" | grep -Eq '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' || (echo "ERROR: RECIPE_VIEWER_SLUG not a UUID"; exit 1)

- name: Checkout recipe_viewer (private, unlisted UUID)
  uses: actions/checkout@v4
  with: { repository: jdlehman/recipe_viewer, token: ${{ secrets.APPS_PAT }}, path: apps/recipe_viewer }
  continue-on-error: true

- name: Build recipe_viewer
  working-directory: apps/recipe_viewer
  run: |
    if [ -f package.json ]; then
      npm ci
      APP_SHA=$(git rev-parse HEAD) npm run build
    fi
    if [ ! -d dist ] && [ -f index.html ]; then
      mkdir -p dist
      cp index.html dist/
    fi

- name: Merge recipe_viewer into hub dist (unlisted UUID from secret)
  run: |
    UUID="${{ secrets.RECIPE_VIEWER_SLUG }}"
    if [ -z "$UUID" ]; then echo "ERROR: RECIPE_VIEWER_SLUG empty"; exit 1; fi
    if [ -d apps/recipe_viewer/dist ]; then
      mkdir -p "dist/$UUID"
      cp -r apps/recipe_viewer/dist/* "dist/$UUID/"
    fi
```

`sitemap.xml` is generated from `src/apps.config.ts` public slugs only. `noindex` is injected into any `dist/*/index.html` whose folder is NOT a public slug (covers all secret UUIDs). Adding a new unlisted app requires only a new `*_SLUG` secret + its 3 deploy steps — no config list to update. GA injection auto-covers all `dist/*/index.html`.

## 6. Secrets & triggers

* **Hub secret `APPS_PAT`**: PAT (classic) with `repo` scope that can read each private app. Add in `jdlehman.github.io` → Settings → Secrets → Actions → `APPS_PAT`.

* **Hub secret `RECIPE_VIEWER_SLUG`** (and any future `*_SLUG` for unlisted apps): UUID for the unlisted path (generate with `node -e "console.log(crypto.randomUUID())"`). Never change it or old links break. Each unlisted app MUST have its secret or hub deploy fails (validated in `deploy.yml`). Also used locally as `VITE_RECIPE_VIEWER_SLUG` in `.env.local` for fallback routes (see `src/main.tsx`). See §5.

* **Hub secret `GA_MEASUREMENT_ID`** (optional): override `G-SC00ZQFH59` without code change.

* **Auto-rebuild on private push** (optional but recommended): copy `.github/workflows/app-trigger-hub.yml.example` into the private repo as `.github/workflows/trigger-hub.yml`, set `app: "recipe_viewer"` (or your app), add secret `HUB_PAT` there (PAT that can `POST /repos/jdlehman/jdlehman.github.io/dispatches`). Hub listens on `repository_dispatch: app_updated` + `workflow_dispatch`. Without this, pushing the private repo does NOT auto-update `inlehmansterms.net` — trigger hub manually via Actions → Deploy hub → Run workflow.

## 7. Local dev

* **Hub:** `npm ci && npm run dev` → http://localhost:5173 — `src/pages/WaterCalculator.tsx` is a fallback stub until the private build overwrites `/water_calculator`. For secret/unlisted apps, set `VITE_RECIPE_VIEWER_SLUG` in `.env.local` (see `.env.example`, `src/main.tsx`) to get a local fallback route at `http://localhost:5173/<uuid>/` — otherwise the UUID path has no SPA route locally (production uses the static `dist/<uuid>/index.html` directly).
* **Private app:** develop standalone (`npm run dev` in that repo). No hub needed until deploy. Ensure `vite.config.ts` → `base: '/<uuid>/'` matches the hub secret.

## 8. What not to do

* Don't commit `dist/` or `node_modules/` in private repos.
* Don't add `CNAME` or enable Pages on private repos.
* Don't use absolute asset paths without `base: '/<slug>/'`.
* Don't require server-side code — Pages is static only.

---

## 9. Share preview / link metadata (required)

Apps are shared in iMessage, Messenger, Slack, X, etc. Each app's `index.html` **must** include Open Graph + Twitter preview tags so links unfurl correctly when served at `https://inlehmansterms.net/<slug>/`. The hub does not inject this — your private app's build output must contain it.

**Required tags in your app's `index.html` `<head>`** (Vite: `index.html` at repo root; framework: ensure they survive the build):

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Water Drop Bench — Coffee Water Lab</title>
  <meta name="description" content="GH/KH drops for coffee — GH 58/27 Aviary base, share links, calibration." />

  <!-- Open Graph (iMessage, Messenger, Slack, Facebook, LinkedIn) -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://inlehmansterms.net/water_drop_bench/" />
  <meta property="og:title" content="Water Drop Bench — Coffee Water Lab" />
  <meta property="og:description" content="GH/KH drops for coffee — GH 58/27 Aviary base, share links, calibration." />
  <meta property="og:image" content="https://inlehmansterms.net/water_drop_bench/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Water Drop Bench — Coffee Water Lab" />
  <meta name="twitter:description" content="GH/KH drops for coffee — GH 58/27 Aviary base, share links, calibration." />
  <meta name="twitter:image" content="https://inlehmansterms.net/water_drop_bench/og-image.png" />

  <link rel="icon" href="/water_drop_bench/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/water_drop_bench/favicon-32x32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="/water_drop_bench/apple-touch-icon.png" sizes="180x180" />
</head>
```

**Rules:**

* **Icons are per-app** — each `public/` must ship its own `favicon.svg` + `favicon-32x32.png` + `apple-touch-icon.png` (180×180) under the slug. Don't reuse the hub's `/vite.svg` or root favicon — link as `/<slug>/favicon.svg` so the tab shows the app's icon when visited at `inlehmansterms.net/<slug>/`.
* `og:url` and `og:image` must be **absolute** `https://inlehmansterms.net/<slug>/...` — relative URLs break previews.
* `og:image` should be `1200×630` PNG/JPG under your app's `public/` (e.g. `public/og-image.png` → built to `dist/og-image.png` → served at `/<slug>/og-image.png`). Don't point to hub root.
* `og:title`/`twitter:title` should be human-readable (app name), `description` ≤ 160 chars.
* For Vite, keep `base: '/<slug>/'` so `og:image` path resolves, but still use absolute URL in the meta for crawlers.
* Validate with: [opengraph.xyz](https://www.opengraph.xyz/), [X Card Validator](https://cards-dev.twitter.com/validator), or `curl -s https://inlehmansterms.net/<slug>/ | grep -i og:` after deploy.

Don't rely on the hub fallback `WaterCalculator.tsx` for previews — once the private build overwrites `/<slug>`, only your app's `index.html` metadata is seen.

---

## 10. Offline / PWA & cache — redeploys must go live automatically

GitHub Pages serves HTML with `cache-control: max-age=600` (CDN + browser, cannot be changed).
Hashed `assets/index-*.js` bust on every build, but `index.html` and a Service Worker can
serve stale if cached `cache-first`. Do **not** hand-roll `public/sw.js` with a static
`const CACHE='v1'` + `caches.match||fetch` — that requires a manual bump on every deploy
and reproduces the bug where clicking from `inlehmansterms.net` shows the old app until
hard refresh.

**Required for Vite apps (copy-paste):**

```ts
// vite.config.ts in private repo
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  base: '/<slug>/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate', // update SW without waiting for tab close
      includeAssets: ['favicon.svg', 'og-image.png'],
      manifest: { /* scope/start_url must be /<slug>/, see §9 */ },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // only runtime cache for 3rd party (fonts); app shell via precache
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60*60*24*365 } } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60*60*24*365 } } }
        ]
      }
    })
  ]
})
```

Why it works automatically:
* Workbox `globPatterns` writes content hashes into `dist/sw.js` via `precacheAndRoute([{url:"index.html",revision:"<hash>"},{url:"assets/index-ABC123.js",revision:null}])`. Changing any file changes `sw.js` bytes.
* Browser checks `sw.js` on every navigation to scope `/<slug>/`; changed bytes → `install` → `skipWaiting`+`clientsClaim` → next navigation serves new precache. No manual `CACHE='v2'` bump.
* `cleanupOutdatedCaches` deletes old `precache-v*` automatically.
* `registerType: 'autoUpdate'` registers `/<slug>/sw.js` with periodic update checks (see `src/main.tsx: navigator.serviceWorker.register('/<slug>/sw.js')`).

**Do not:**
* commit a hand-written `public/sw.js` with a static cache name — delete it when using `vite-plugin-pwa` (it generates `dist/sw.js`).
* `CacheFirst` the app shell (`/` or `index.html`) — only precache it via `globPatterns`.

**Optional SHA safety net** (only if you want a guarantee even when Workbox misses a file):
* private repo: add `additionalManifestEntries: process.env.GITHUB_SHA ? [{url:'index.html',revision: process.env.GITHUB_SHA.slice(0,7)}] : undefined` to `workbox`, and have hub's `Build <slug>` step run with `env: { GITHUB_SHA: $(git -C apps/<slug> rev-parse HEAD) }`.
* hub deploy fallback: `echo "// ${{ github.sha }}" >> apps/<slug>/dist/sw.js` after build — forces `sw.js` to differ every hub deploy, but forces full re-download of precache each time.
* Prefer content hashes; use SHA fallback only if needed.

Validate after deploy: `curl -s https://inlehmansterms.net/<slug>/sw.js | head` should show `workbox`/`precacheAndRoute`, not `const CACHE='wfc-v1'`.

---

## 11. Analytics — GA4 (auto-injected, no per-app manual edit needed)

**Hub** (`inlehmansterms.net/`): GA4 `G-SC00ZQFH59` is hard-coded in `jdlehman.github.io/index.html`:

```html
<!-- Google tag (gtag.js) — GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SC00ZQFH59"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-SC00ZQFH59');
</script>
```

**Sub-apps** (`/water_drop_bench`, `/water_for_coffee_crafter`, `/meticulous_profile_builder`, and any future `<slug>` — including unlisted UUIDs): **do NOT manually add GA** — the hub's deploy workflow **dynamically injects** the same tag into each `dist/<slug>/index.html` after building/merging (loops `dist/*/index.html`).

* How: `.github/workflows/deploy.yml` → `Inject GA4 into sub-apps` runs after all `Merge <slug>` steps. For each slug, if `dist/<slug>/index.html` exists and doesn't already contain `googletagmanager.com/gtag`, it inserts the snippet before `</head>` (python replace, idempotent).
* Same `GA_ID` as hub (`G-SC00ZQFH59`), override-able without code via repo secret `GA_MEASUREMENT_ID` (set in hub → Settings → Secrets → Actions → `GA_MEASUREMENT_ID` to rotate).
* If your private app **already** has a `gtag` snippet, injection is skipped — no double pageview.
* New public or unlisted apps are auto-covered — no list to maintain (GA loops `dist/*/index.html`).

**Manual alternative** (only if you deploy your private app *outside* the hub, e.g. standalone preview):

```html
<head>
  <!-- Google tag (gtag.js) — GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SC00ZQFH59"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-SC00ZQFH59');
  </script>
</head>
```

The hub injector will detect this and skip, so manual + auto don't double-fire.

**Validate after deploy:**

```bash
curl -s https://inlehmansterms.net/ | grep -q "G-SC00ZQFH59" && echo "hub OK"
curl -s https://inlehmansterms.net/water_drop_bench/ | grep -q "G-SC00ZQFH59" && echo "bench OK"
curl -s https://inlehmansterms.net/water_for_coffee_crafter/ | grep -q "G-SC00ZQFH59" && echo "crafter OK"
```

Why not "dynamic at runtime" via hub JS? Each `inlehmansterms.net/<slug>/` is a **separate HTML document** (copied from the private repo's `dist`), not the hub's SPA — hub JS never runs there. Build-time injection is the only single-source way to keep one GA ID.

---

## Quick start for a new app `jdlehman/foo`

### Public app

```bash
# 1. create private repo jdlehman/foo, clone to ../foo
npm create vite@latest . -- --template react-ts
# edit vite.config.ts -> base: '/foo/'
# edit package.json -> ensure "build": "vite build"
echo "dist" >> .gitignore

# 2. hub: add to src/apps.config.ts (visibility: 'public') and 3-step block in deploy.yml (see §5)
# 3. push both repos; hub deploy copies dist/foo -> https://inlehmansterms.net/foo
```

### Unlisted (secret) app — like `recipe_viewer`

```bash
# 1. generate UUID: node -e "console.log(crypto.randomUUID())"
#    hub repo → Settings → Secrets → Actions → RECIPE_VIEWER_SLUG=<uuid>
#    echo "VITE_RECIPE_VIEWER_SLUG=<uuid>" >> hub/.env.local  # for local fallback
# 2. create private repo jdlehman/recipe_viewer, vite.config.ts -> base: '/<uuid>/'
# 3. hub: add 4-step block (validate + checkout + build + merge) in deploy.yml using the secret — NO entry in src/apps.config.ts (see §5)
# 4. private repo: copy .github/workflows/app-trigger-hub.yml.example → .github/workflows/trigger-hub.yml, add HUB_PAT secret, so pushes auto-trigger hub (see §6)
```

Questions? See `README.md` and `.github/workflows/deploy.yml` — they are the source of truth.
