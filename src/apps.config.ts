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
    slug: 'water_drop_bench',
    title: 'Water Drop Bench',
    description: 'Drop Bench — Coffee Water Lab. GH/KH drops, JL Water 58/27 Aviary base, share links.',
    repo: 'jdlehman/water_drop_bench',
    buildDir: 'dist',
  },
  {
    slug: 'water_for_coffee_crafter',
    title: 'Water for Coffee Crafter',
    description: 'Brew water concentrate — Gagné replica, tap → target, single dose. Credit: Jonathan Gagné (Coffee Ad Astra).',
    repo: 'jdlehman/water_for_coffee_crafter',
    buildDir: 'dist',
  },
]
