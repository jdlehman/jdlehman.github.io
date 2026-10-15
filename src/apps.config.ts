// Hub config: each app is a private repo that builds to a static subpath.
// Hub workflow checks out each repo, builds it, and copies dist -> dist/<slug>
// Apps can use any framework (Vite, Next static export, plain HTML) as long as
// they output to `dist` (or configure `app.buildDir`).

export type AppVisibility = 'public' | 'unlisted'

// Landing page headings, in the order they are shown. Each app in `apps` names one as its `section`.
export const sections = ['Coffee', 'Music'] as const
export type Section = (typeof sections)[number]

export interface AppConfig {
  slug: string // URL path: /<slug> — for private apps use a UUID (e.g. '550e8400-e29b-41d4-a716-446655440000') so the URL is unguessable
  title: string
  description: string
  repo: string // e.g. "jdlehman/water_calculator" (private)
  buildDir: string // relative to app repo root, after `npm run build`
  // optional: branch to checkout, default main
  branch?: string
  // visibility controls discovery. 'public' (default) => shown on landing, indexed, in sitemap.
  // 'unlisted' => hidden from landing, excluded from sitemap/robots discovery, served with noindex.
  // The page is still accessible to anyone with the UUID link — obscurity, not auth.
  visibility?: AppVisibility
  section: Section // the landing page heading it is listed under
}

export const apps: AppConfig[] = [
  {
    slug: 'water_drop_bench',
    title: 'Water Drop Bench',
    description: 'Drop Bench — Coffee Water Lab. GH/KH drops, JL Water 58/27 Aviary base, share links.',
    repo: 'jdlehman/water_drop_bench',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Coffee',
  },
  {
    slug: 'water_for_coffee_crafter',
    title: 'Water for Coffee Crafter',
    description: 'Brew water concentrate — Gagné replica, tap → target, single dose. Credit: Jonathan Gagné (Coffee Ad Astra).',
    repo: 'jdlehman/water_for_coffee_crafter',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Coffee',
  },
  {
    slug: 'meticulous_profile_builder',
    title: 'Meticulous Profile Builder',
    description: 'Meticulous espresso profile builder — variables, stages, limits, triggers, interpolation.',
    repo: 'jdlehman/meticulous_profile_builder',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Coffee',
  },
  {
    slug: 'midi_studio',
    title: 'MIDI Studio',
    description: 'Record from a MIDI keyboard and see the score as you play. Fix notes by playing them again; export MIDI or MusicXML.',
    repo: 'jdlehman/midi_studio',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Music',
  },
  // Note: Unlisted (UUID) apps like recipe_viewer are NOT listed here.
  // Their slugs are stored in GitHub Secrets (e.g. RECIPE_VIEWER_SLUG) and
  // handled entirely in .github/workflows/deploy.yml so the UUID never
  // appears in git history or in the hub's client bundle. See APPS.md §5.
]
