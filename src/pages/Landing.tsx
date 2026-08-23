import { apps } from '../apps.config'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-16">
        <div className="mb-12">
          <div className="text-[30px] font-[720] tracking-[-0.03em] leading-none">In Lehman's Terms</div>
        </div>

        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h1 className="text-[18px] font-[650] tracking-[-0.015em]">Tools</h1>
            <span className="text-xs text-zinc-400">{apps.length}</span>
          </div>
          <ul className="grid gap-3">
            {apps.map((app) => (
              <li key={app.slug}>
                <a
                  href={`/${app.slug}/`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 hover:border-zinc-900 hover:shadow-sm transition"
                >
                  <div>
                    <div className="text-[15px] font-[600] tracking-[-0.01em] group-hover:text-zinc-900">{app.title}</div>
                    <div className="text-[13px] leading-5 text-zinc-500">{app.description}</div>
                  </div>
                  <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition" aria-hidden>→</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="mx-auto max-w-2xl px-6 py-8 text-xs text-zinc-400 border-t border-zinc-100">
        inlehmansterms.net
      </footer>
    </div>
  )
}
