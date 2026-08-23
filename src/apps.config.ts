// Hub config: each app is a private repo that builds to a static subpath.
// Hub workflow checks out each repo, builds it, and copies dist -> dist/<slug>
// Apps can use any framework (Vite, Next static export, plain HTML) as long as
// they output to `dist` (or configure `app.buildDir`).

export interface AppConfig {
  slug: string // URL path: /<slug>
  title: string
  description: string
  repo: string // e.g. "jdlehman/water_calculator" (private)
  buildDir: string // relative to app repo root, after `npm run build`
  // optional: branch to checkout, default main
  branch?: string
}

export const apps: AppConfig[] = [
  {
    slug: 'water_calculator',
    title: 'Water Calculator',
    description: 'Daily hydration estimate based on weight, activity, and climate.',
    repo: 'jdlehman/water_calculator',
    buildDir: 'dist',
  },
  // Add more apps here:
  // { slug: 'another_app', title: 'Another App', description: '...', repo: 'jdlehman/another-app', buildDir: 'dist' },
]
