import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing'
import WaterCalculator from './pages/WaterCalculator'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  // Fallback route for hub dev: real /water_calculator will be a static
  // directory from the private app's build after deploy. Keep this for
  // local `npm run dev` before the private repo exists.
  { path: '/water_calculator', element: <WaterCalculator /> },
  { path: '/water_calculator/*', element: <WaterCalculator /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
