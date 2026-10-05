// Strumenti numerici per funzioni reali di una variabile (capitolo 2).

export type RFn = (x: number) => number
export type Pt = [number, number]

export function linspace(a: number, b: number, n: number): number[] {
  return Array.from({ length: n }, (_, k) => a + ((b - a) * k) / (n - 1))
}

export function sample(f: RFn, a: number, b: number, n = 600): Pt[] {
  return linspace(a, b, n).map((x) => [x, f(x)])
}

/** Simpson composito su [a, b] con n intervalli (n pari). */
export function integrate(f: RFn, a: number, b: number, n = 2000): number {
  if (n % 2) n++
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h)
  return (s * h) / 3
}

/** ‖f‖_p su [a, b] (p = Infinity: max campionato). */
export function normP(f: RFn, a: number, b: number, p: number, n = 2000): number {
  if (p === Infinity) {
    let m = 0
    for (let k = 0; k <= n; k++) m = Math.max(m, Math.abs(f(a + ((b - a) * k) / n)))
    return m
  }
  return Math.pow(integrate((x) => Math.pow(Math.abs(f(x)), p), a, b, n), 1 / p)
}

/** Trasformata di Fourier f̂(ξ) = ∫ f(x) e^{-2πiξx} dx, troncata a [a, b]. Restituisce [Re, Im]. */
export function fourierAt(f: RFn, xi: number, a: number, b: number, n = 1600): Pt {
  const w = -2 * Math.PI * xi
  return [integrate((x) => f(x) * Math.cos(w * x), a, b, n), integrate((x) => f(x) * Math.sin(w * x), a, b, n)]
}

/** Trasformata su una griglia di frequenze, con campioni di f precalcolati (più veloce). */
export function fourierGrid(f: RFn, a: number, b: number, xis: number[], n = 1200): Pt[] {
  if (n % 2) n++
  const h = (b - a) / n
  const xs = Array.from({ length: n + 1 }, (_, k) => a + k * h)
  const ws = xs.map((_, k) => ((k === 0 || k === n ? 1 : k % 2 ? 4 : 2) * h) / 3)
  const fx = xs.map(f)
  return xis.map((xi) => {
    const w = -2 * Math.PI * xi
    let re = 0
    let im = 0
    for (let k = 0; k <= n; k++) {
      const v = fx[k] * ws[k]
      if (v === 0) continue
      re += v * Math.cos(w * xs[k])
      im += v * Math.sin(w * xs[k])
    }
    return [re, im]
  })
}

/** Convoluzione (f * g)(x) = ∫ f(x − y) g(y) dy, con g supportata (numericamente) in [a, b]. */
export function convolve(f: RFn, g: RFn, a: number, b: number, n = 600): RFn {
  return (x) => integrate((y) => f(x - y) * g(y), a, b, n)
}

/** Funzione test standard: e^{-1/(1-x²)} su (−1, 1), 0 fuori. */
export const bump: RFn = (x) => (Math.abs(x) < 1 ? Math.exp(-1 / (1 - x * x)) : 0)
/** bump normalizzata con integrale 1 */
export const BUMP_MASS = 0.443993816168
export const mollifier = (eps: number): RFn => (x) => bump(x / eps) / (eps * BUMP_MASS)

export const box: RFn = (x) => (Math.abs(x) <= 1 ? 1 : 0)
export const heaviside: RFn = (x) => (x > 0 ? 1 : 0)
export const gauss: RFn = (x) => Math.exp(-Math.PI * x * x)

/** Derivata numerica centrata. */
export const deriv = (f: RFn, h = 1e-4): RFn => (x) => (f(x + h) - f(x - h)) / (2 * h)

export function maxAbs(pts: Pt[]): number {
  return pts.reduce((m, p) => (Number.isFinite(p[1]) ? Math.max(m, Math.abs(p[1])) : m), 0)
}
