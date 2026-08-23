// Generic fallback for private apps not yet built.
// Once private repo `jdlehman/water_drop_bench` builds, hub's deploy will
// overwrite `dist/water_drop_bench` with that repo's `dist`. This component
// then is never served in production — static files win. Keep for local dev.

import { Link, useLocation } from 'react-router-dom'

export default function WaterCalculator() {
  const loc = useLocation()
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm font-mono tracking-wide text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">App not found</h1>
        <p className="mt-3 text-sm text-zinc-600">
          No build found for <code className="rounded bg-zinc-100 px-1.5 py-0.5">{loc.pathname}</code>
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          This is the hub&apos;s fallback. The private app&apos;s <code>dist</code> will replace it after the next deploy.
        </p>
        <Link to="/" className="mt-8 inline-block rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50">
          ← Back to home
        </Link>
      </header>
    </div>
  )
}
