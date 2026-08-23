# App Requirements — for private repos aggregated under `inlehmansterms.net`

This hub (`jdlehman.github.io` → `inlehmansterms.net`) aggregates **private** client-side apps under subpaths (`/water_calculator`, `/<your_app>`). This doc is the checklist for any new private repo you want to mount.

## TL;DR Checklist

- [ ] Private repo under `jdlehman/<app_name>` (e.g. `jdlehman/water_calculator` lives at `../water_calculator` locally)
- [ ] Static only — no server, no secrets at runtime
- [ ] `package.json` with `build` script **or** plain `index.html` at repo root
- [ ] Build outputs to `dist/` (configurable via `src/apps.config.ts` → `buildDir`)
- [ ] `vite.config.ts` (if Vite) sets `base: '/<slug>/'`
- [ ] Added to hub: entry in `src/apps.config.ts` + 3-step block in `.github/workflows/deploy.yml`
- [ ] Optional: trigger workflow in private repo to auto-rebuild hub on push

If all boxes are checked, hub's deploy will pull, build, and copy `dist → dist/<slug>` on every `master` push.

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

## 5. Hub registration

Two places in `jdlehman.github.io`:

**a) `src/apps.config.ts`** — drives the landing page:

```ts
export const apps: AppConfig[] = [
  { slug: 'water_calculator', title: 'Water Calculator', description: '...', repo: 'jdlehman/water_calculator', buildDir: 'dist' },
  { slug: 'my_app', title: 'My App', description: '...', repo: 'jdlehman/my-app', buildDir: 'dist' },
]
```

**b) `.github/workflows/deploy.yml`** — duplicate the 3-step block:

```yaml
- name: Checkout my-app (private)
  if: ${{ secrets.APPS_PAT != '' }}
  uses: actions/checkout@v4
  with: { repository: jdlehman/my-app, token: ${{ secrets.APPS_PAT }}, path: /tmp/apps/my-app }
  continue-on-error: true

- name: Build my-app
  working-directory: /tmp/apps/my-app
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
    if [ -d /tmp/apps/my-app/dist ]; then
      mkdir -p dist/my_app
      cp -r /tmp/apps/my-app/dist/* dist/my_app/
    fi
```

## 6. Secrets & triggers

* **Hub secret `APPS_PAT`**: PAT (classic) with `repo` scope that can read each private app. Add in `jdlehman.github.io` → Settings → Secrets → Actions → `APPS_PAT`.

* **Auto-rebuild on private push** (optional but nice): copy `.github/workflows/app-trigger-hub.yml.example` into the private repo as `.github/workflows/trigger-hub.yml`, add secret `HUB_PAT` there (PAT that can `POST /repos/jdlehman/jdlehman.github.io/dispatches`). Hub listens on `repository_dispatch: app_updated` + `workflow_dispatch`.

## 7. Local dev

* **Hub:** `npm ci && npm run dev` → http://localhost:5173 — `src/pages/WaterCalculator.tsx` is a fallback stub until the private build overwrites `/water_calculator`.
* **Private app:** develop standalone (`npm run dev` in that repo). No hub needed until deploy.

## 8. What not to do

* Don't commit `dist/` or `node_modules/` in private repos.
* Don't add `CNAME` or enable Pages on private repos.
* Don't use absolute asset paths without `base: '/<slug>/'`.
* Don't require server-side code — Pages is static only.

---

## Quick start for a new app `jdlehman/foo`

```bash
# 1. create private repo jdlehman/foo, clone to ../foo
npm create vite@latest . -- --template react-ts
# edit vite.config.ts -> base: '/foo/'
# edit package.json -> ensure "build": "vite build"
echo "dist" >> .gitignore

# 2. hub: add to src/apps.config.ts and deploy.yml (see section 5)
# 3. push both repos; hub deploy copies dist/foo -> https://inlehmansterms.net/foo
```

Questions? See `README.md` and `.github/workflows/deploy.yml` — they are the source of truth.
