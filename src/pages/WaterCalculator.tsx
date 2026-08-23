// Fallback placeholder for /water_calculator.
// Once private repo `jdlehman/water-calculator` exists, the hub workflow will
// overwrite `dist/water_calculator` with that repo's build. This component
// then is never served for that subpath (static file wins). Keep it as a
// local dev fallback and as a stub before the private repo is created.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateWater } from '../lib/waterCalculator'

export default function WaterCalculator() {
  const [weight, setWeight] = useState(160)
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial')
  const [activityMinutes, setActivityMinutes] = useState(30)
  const [level, setLevel] = useState<'low' | 'moderate' | 'high'>('moderate')
  const [climate, setClimate] = useState<'temperate' | 'hot' | 'humid'>('temperate')

  const result = calculateWater({ weight, unitSystem: unit, activityMinutes, activityLevel: level, climate })

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto max-w-3xl px-6 py-8">
        <Link to="/" className="text-sm underline">← Home</Link>
        <h1 className="mt-4 text-3xl font-bold">Water Calculator</h1>
        <p className="text-zinc-600 text-sm mt-1">Fallback stub — will be replaced by private app build at /water_calculator.</p>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-16 grid gap-6">
        <div className="rounded-2xl border p-6 grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Weight ({unit === 'imperial' ? 'lbs' : 'kg'})</span>
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="border rounded-lg px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Units</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value as never)} className="border rounded-lg px-3 py-2">
              <option value="imperial">Imperial (lbs)</option>
              <option value="metric">Metric (kg)</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Activity minutes/day</span>
            <input type="number" value={activityMinutes} onChange={(e) => setActivityMinutes(Number(e.target.value))} className="border rounded-lg px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Intensity</span>
            <select value={level} onChange={(e) => setLevel(e.target.value as never)} className="border rounded-lg px-3 py-2">
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Climate</span>
            <select value={climate} onChange={(e) => setClimate(e.target.value as never)} className="border rounded-lg px-3 py-2">
              <option value="temperate">Temperate</option>
              <option value="hot">Hot</option>
              <option value="humid">Humid</option>
            </select>
          </label>
        </div>
        <div className="rounded-2xl bg-zinc-900 text-white p-6">
          <div className="text-sm opacity-70">Estimated daily water</div>
          <div className="text-3xl font-bold mt-1">{result.liters} L · {result.ounces} oz · {result.cups} cups</div>
          <p className="text-xs opacity-60 mt-2">Heuristic: 33ml/kg + activity + climate. Replace with exact Meta AI formula in private repo.</p>
        </div>
        <p className="text-xs text-zinc-500">Private repo: <code>jdlehman/water-calculator</code> — hub will copy its <code>dist</code> to <code>/water_calculator</code> on deploy.</p>
      </main>
    </div>
  )
}
