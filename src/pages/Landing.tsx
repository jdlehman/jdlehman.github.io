import { Link } from 'react-router-dom'
import { apps } from '../apps.config'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">In Lehman's Terms</h1>
        <p className="mt-2 text-zinc-600">Jonathan Lehman — notes, tools, and experiments.</p>
        <nav className="mt-6 flex gap-4 text-sm">
          <a href="https://github.com/jdlehman" className="underline underline-offset-4">GitHub</a>
          <a href="https://twitter.com/jlehman_" className="underline underline-offset-4">Twitter</a>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-16">
        <section className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Tools</h2>
          <ul className="mt-4 grid gap-3">
            {apps.map((app) => (
              <li key={app.slug}>
                <Link to={`/${app.slug}`} className="block rounded-xl border p-4 hover:bg-zinc-50 transition">
                  <div className="font-medium">{app.title}</div>
                  <div className="text-sm text-zinc-600">{app.description}</div>
                  <div className="text-xs text-zinc-400 mt-1">/{app.slug} → {app.repo} (private)</div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-zinc-500">
            Each app lives in its own private repo and can be built with any stack. The hub just aggregates their static builds under one domain.
          </p>
        </section>
        <section className="mt-10 prose prose-zinc">
          <p className="text-zinc-600">More soon. This site is fully client-side.</p>
        </section>
      </main>
      <footer className="mx-auto max-w-3xl px-6 py-8 text-sm text-zinc-500 border-t">
        © {new Date().getFullYear()} Jonathan Lehman · inlehmansterms.net
      </footer>
    </div>
  )
}
