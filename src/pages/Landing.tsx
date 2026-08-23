import { Link } from 'react-router-dom'
import { apps } from '../apps.config'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      <header className="mx-auto max-w-2xl px-6 pt-20 pb-12">
        <h1 className="text-[2.25rem] font-[720] tracking-[-0.03em] leading-none">In Lehman's Terms</h1>
        <p className="mt-3 text-[15px] leading-6 text-zinc-700 max-w-[36ch]">
          Jonathan Lehman — notes, tools, and small experiments. A minimal hub; each tool lives in its own repo.
        </p>
        <nav className="mt-8 flex gap-5 text-[13.5px]">
          <a href="https://github.com/jdlehman" className="text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 hover:decoration-zinc-900 transition">GitHub</a>
          <a href="https://twitter.com/jlehman_" className="text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 hover:decoration-zinc-900 transition">Twitter</a>
          <a href="https://github.com/jdlehman/jdlehman.github.io/blob/master/APPS.md" className="text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 hover:decoration-zinc-900 transition">App docs</a>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20">
        <section className="border border-zinc-200 p-7 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[13px] font-semibold tracking-wide text-zinc-900">Tools</h2>
            <span className="text-xs text-zinc-500">{apps.length} {apps.length === 1 ? 'app' : 'apps'}</span>
          </div>
          <ul className="mt-6 grid gap-4">
            {apps.map((app) => (
              <li key={app.slug}>
                <Link
                  to={`/${app.slug}`}
                  className="group block border border-zinc-200 p-5 hover:border-zinc-900 hover:bg-zinc-50/60 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="font-[600] text-[15px] tracking-[-0.01em]">{app.title}</div>
                    <span className="shrink-0 text-zinc-400 group-hover:text-zinc-900 transition text-[13px] leading-none pt-1" aria-hidden>→</span>
                  </div>
                  <div className="mt-1 text-[13.5px] leading-5 text-zinc-600">{app.description}</div>
                  <div className="mt-3 text-xs text-zinc-500">/{app.slug}</div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-5 text-zinc-500">
            Each app is a private repo aggregated at build time. See <a href="https://github.com/jdlehman/jdlehman.github.io/blob/master/APPS.md" className="underline decoration-zinc-300 underline-offset-4 hover:text-zinc-700">APPS.md</a> for the build contract.
          </p>
        </section>

        <section className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-[14px] leading-6 text-zinc-600">
            More soon. This site is fully client-side and deployed via GitHub Pages.
          </p>
        </section>
      </main>

      <footer className="mx-auto max-w-2xl px-6 py-8 text-xs text-zinc-500 border-t border-zinc-100">
        © {new Date().getFullYear()} Jonathan Lehman · inlehmansterms.net
      </footer>
    </div>
  )
}
