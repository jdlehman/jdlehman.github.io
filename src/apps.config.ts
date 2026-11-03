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
    description: 'Mix coffee brewing water from mineral drops. Pick a recipe or set your own hardness, and it tells you how many drops of each to add.',
    repo: 'jdlehman/water_drop_bench',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Coffee',
  },
  {
    slug: 'water_for_coffee_crafter',
    title: 'Water for Coffee Crafter',
    description: 'Jonathan Gagné’s brew water spreadsheet as an app: start from your tap water and a target, and get the grams of each salt for a concentrate.',
    repo: 'jdlehman/water_for_coffee_crafter',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Coffee',
  },
  {
    slug: 'meticulous_profile_builder',
    title: 'Meticulous Profile Builder',
    description: 'Design espresso profiles for the Meticulous machine on a chart, and import or export them as Meticulous JSON.',
    repo: 'jdlehman/meticulous_profile_builder',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Coffee',
  },
  {
    slug: 'midi_studio',
    title: 'MIDI Studio',
    description: 'Play a MIDI keyboard and watch it become sheet music. Fix a wrong note by playing it again, then export MIDI or MusicXML.',
    repo: 'jdlehman/midi_studio',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Music',
  },
  {
    slug: 'sectional',
    title: 'Sectional',
    description: 'Learn your part in a choir piece. Hear it alone or with the others, slow it down, step through it note by note, and sing it to see which notes were off.',
    repo: 'jdlehman/midi_studio', // apps/sectional, built with midi_studio in deploy.yml
    buildDir: 'apps/sectional/dist',
    visibility: 'public',
    section: 'Music',
  },
  {
    slug: 'score-reader',
    title: 'Score Reader',
    description: 'Turn a PDF or photos of sheet music into a MusicXML file, in your browser, for Sectional or a notation program.',
    // not built here: a public AGPL repo with its own Pages workflow, served at /score-reader/ (APPS.md §5)
    repo: 'jdlehman/score-reader',
    buildDir: 'dist',
    visibility: 'public',
    section: 'Music',
  },
  // Note: Unlisted (UUID) apps like recipe_viewer are NOT listed here.
  // Their slugs are stored in GitHub Secrets (e.g. RECIPE_VIEWER_SLUG) and
  // handled entirely in .github/workflows/deploy.yml so the UUID never
  // appears in git history or in the hub's client bundle. See APPS.md §5.
]
