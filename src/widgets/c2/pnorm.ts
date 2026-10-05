import type { Complex } from '../../lib/complex'

/** ‖v‖_p in ℝ² (per p < 1 la formula è la stessa, ma non è una norma). */
export function pnorm(v: Complex, p: number): number {
  const a = Math.abs(v[0])
  const b = Math.abs(v[1])
  if (p === Infinity) return Math.max(a, b)
  const m = Math.max(a, b)
  if (m === 0) return 0
  return m * Math.pow(Math.pow(a / m, p) + Math.pow(b / m, p), 1 / p)
}

/** Bordo della palla unitaria {‖v‖_p = 1}. */
export function ballPts(p: number, n = 360): Complex[] {
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = (2 * Math.PI * k) / n
    const u: Complex = [Math.cos(t), Math.sin(t)]
    const r = 1 / pnorm(u, p)
    return [u[0] * r, u[1] * r]
  })
}

/** Slider in [0, 1] → p in [0.5, 10] in scala logaritmica, con ∞ in fondo. */
export const sliderToP = (s: number) => (s >= 0.995 ? Infinity : 0.5 * Math.pow(20, s / 0.98))
export const pToSlider = (p: number) => (p === Infinity ? 1 : (0.98 * Math.log(p / 0.5)) / Math.log(20))
export const fmtP = (p: number) => (p === Infinity ? '∞' : String(Math.round(p * 100) / 100))
