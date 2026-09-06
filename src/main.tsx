import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import WaterCalculator from './pages/WaterCalculator'
import { apps } from './apps.config'

// Generate fallback routes for local dev so `npm run dev` works before private builds exist.
// In production, the static `dist/<slug>/index.html` from the private repo takes precedence
// and this SPA fallback is never hit.
const appFallbackRoutes = apps.flatMap((app) => [
  { path: `/${app.slug}`, element: <WaterCalculator /> },
  { path: `/${app.slug}/*`, element: <WaterCalculator /> },
])

// Secret/unlisted slugs are NOT in apps.config.ts (so they don't leak into git/bundle).
// For local dev of a secret app, set VITE_RECIPE_VIEWER_SLUG in .env.local and it will
// get a fallback route too — without committing the UUID.
// We use (import.meta as unknown as { env: Record<string, string|undefined> }) to avoid needing vite/client types.
const _env = (import.meta as unknown as { env: Record<string, string | undefined> }).env ?? {}
const secretSlugs = [
  _env.VITE_RECIPE_VIEWER_SLUG,
  // Add more: _env.VITE_OTHER_APP_SLUG,
].filter(Boolean) as string[]

const secretFallbackRoutes = secretSlugs.flatMap((slug) => [
  { path: `/${slug}`, element: <WaterCalculator /> },
  { path: `/${slug}/*`, element: <WaterCalculator /> },
])

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  ...appFallbackRoutes,
  ...secretFallbackRoutes,
  // legacy alias — keep old link alive (water_drop_bench was previously /water_calculator)
  { path: '/water_calculator', element: <WaterCalculator /> },
  { path: '/water_calculator/*', element: <WaterCalculator /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
