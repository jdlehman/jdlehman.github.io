import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      try {
        // Read apps.config.ts to determine public slugs.
        // NOTE: Shared heuristic with .github/workflows/deploy.yml (Generate sitemap + Inject noindex).
        // Keep the 3 blocks in sync: slug regex + 1200-char snippet + 'unlisted'+'visibility' within 300 chars.
        const configPath = path.resolve(__dirname, 'src/apps.config.ts')
        const text = fs.readFileSync(configPath, 'utf-8')
        const publicSlugs: string[] = []
        const slugRe = /slug:\s*['"]([^'"]+)['"]/g
        let m: RegExpExecArray | null
        while ((m = slugRe.exec(text))) {
          const slug = m[1]
          const snippet = text.slice(m.index, m.index + 1200)
          const nextSlug = text.indexOf('slug:', m.index + m[0].length)
          const unlistedPos = snippet.indexOf('unlisted')
          let isUnlisted = false
          if (unlistedPos !== -1) {
            const absUnlisted = m.index + unlistedPos
            if (nextSlug === -1 || absUnlisted < nextSlug) {
              const visIdx = snippet.indexOf('visibility')
              if (visIdx !== -1 && Math.abs(visIdx - unlistedPos) < 300) isUnlisted = true
            }
          }
          if (!isUnlisted) publicSlugs.push(slug)
        }
        // Dedupe preserve order
        const seen = new Set<string>()
        const ordered = publicSlugs.filter((s) => {
          if (seen.has(s)) return false
          seen.add(s)
          return true
        })
        const site = 'https://inlehmansterms.net'
        const today = new Date().toISOString().slice(0, 10)
        const lines = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          `  <url><loc>${site}/</loc><lastmod>${today}</lastmod></url>`,
          ...ordered.map((s) => `  <url><loc>${site}/${s}/</loc><lastmod>${today}</lastmod></url>`),
          '</urlset>',
        ]
        const out = path.resolve(__dirname, 'dist/sitemap.xml')
        fs.mkdirSync(path.dirname(out), { recursive: true })
        fs.writeFileSync(out, lines.join('\n') + '\n', 'utf-8')
        // Also ensure robots.txt is present (vite already copies public/robots.txt, but guard)
        const robotsSrc = path.resolve(__dirname, 'public/robots.txt')
        const robotsDest = path.resolve(__dirname, 'dist/robots.txt')
        if (fs.existsSync(robotsSrc) && !fs.existsSync(robotsDest)) {
          fs.copyFileSync(robotsSrc, robotsDest)
        }
        console.log(`[sitemap] generated ${ordered.length} public slugs -> dist/sitemap.xml`)
      } catch (e) {
        console.warn('[sitemap] failed to generate', e)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  base: '/',
  build: {
    outDir: 'dist',
  },
})
