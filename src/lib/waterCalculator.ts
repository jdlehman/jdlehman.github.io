// Pure math for water calculator — port of Meta AI build.
// TODO: replace formula with exact paste from https://www.meta.ai/share/a/81bfdb45-bdb2-423c-8506-2c147da7a1e3 once exported.

export type UnitSystem = 'imperial' | 'metric'
export type ActivityLevel = 'low' | 'moderate' | 'high'
export type Climate = 'temperate' | 'hot' | 'humid'

export interface Inputs {
  weight: number // lbs if imperial, kg if metric
  unitSystem: UnitSystem
  activityMinutes: number // per day
  activityLevel: ActivityLevel
  climate: Climate
}

export interface Result {
  liters: number
  ounces: number
  cups: number // 8oz cups
}

export function calculateWater(inputs: Inputs): Result {
  const weightKg = inputs.unitSystem === 'imperial' ? inputs.weight * 0.453592 : inputs.weight
  if (weightKg <= 0) return { liters: 0, ounces: 0, cups: 0 }

  // Base: 33ml per kg (common heuristic) ≈ 0.5 oz per lb
  let liters = weightKg * 0.033

  // Activity: ~350ml per 30min moderate, scaled by level
  const intensityFactor = inputs.activityLevel === 'low' ? 0.6 : inputs.activityLevel === 'high' ? 1.4 : 1.0
  liters += (inputs.activityMinutes / 30) * 0.35 * intensityFactor

  // Climate adjustment
  if (inputs.climate === 'hot') liters += 0.5
  if (inputs.climate === 'humid') liters += 0.3

  liters = Math.round(liters * 10) / 10
  const ounces = Math.round(liters * 33.814 * 10) / 10
  const cups = Math.round((ounces / 8) * 10) / 10
  return { liters, ounces, cups }
}
