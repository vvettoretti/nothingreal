// Aritmetica complessa minimale: un numero complesso è la coppia [re, im].
export type Complex = [number, number]
export type Fn = (z: Complex) => Complex

export const C = (re: number, im = 0): Complex => [re, im]
export const ZERO: Complex = [0, 0]
export const ONE: Complex = [1, 0]
export const I: Complex = [0, 1]

export const add = (a: Complex, b: Complex): Complex => [a[0] + b[0], a[1] + b[1]]
export const sub = (a: Complex, b: Complex): Complex => [a[0] - b[0], a[1] - b[1]]
export const neg = (a: Complex): Complex => [-a[0], -a[1]]
export const conj = (a: Complex): Complex => [a[0], -a[1]]
export const scale = (a: Complex, k: number): Complex => [a[0] * k, a[1] * k]
export const mul = (a: Complex, b: Complex): Complex => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
export const div = (a: Complex, b: Complex): Complex => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
export const inv = (a: Complex) => div(ONE, a)
export const abs = (a: Complex) => Math.hypot(a[0], a[1])
export const arg = (a: Complex) => Math.atan2(a[1], a[0])
export const polar = (r: number, t: number): Complex => [r * Math.cos(t), r * Math.sin(t)]
export const dist = (a: Complex, b: Complex) => Math.hypot(a[0] - b[0], a[1] - b[1])
export const isFiniteC = (a: Complex) => Number.isFinite(a[0]) && Number.isFinite(a[1])

export const exp = (z: Complex): Complex => {
  const e = Math.exp(z[0])
  return [e * Math.cos(z[1]), e * Math.sin(z[1])]
}
export const log = (z: Complex): Complex => [Math.log(abs(z)), arg(z)]
export const sqrt = (z: Complex): Complex => polar(Math.sqrt(abs(z)), arg(z) / 2)
export const sin = (z: Complex): Complex => [Math.sin(z[0]) * Math.cosh(z[1]), Math.cos(z[0]) * Math.sinh(z[1])]
export const cos = (z: Complex): Complex => [Math.cos(z[0]) * Math.cosh(z[1]), -Math.sin(z[0]) * Math.sinh(z[1])]
export const tan = (z: Complex) => div(sin(z), cos(z))
export const sinh = (z: Complex): Complex => [Math.sinh(z[0]) * Math.cos(z[1]), Math.cosh(z[0]) * Math.sin(z[1])]
export const cosh = (z: Complex): Complex => [Math.cosh(z[0]) * Math.cos(z[1]), Math.sinh(z[0]) * Math.sin(z[1])]
export const tanh = (z: Complex) => div(sinh(z), cosh(z))

export function powInt(z: Complex, n: number): Complex {
  if (n < 0) return inv(powInt(z, -n))
  let r: Complex = ONE
  let b = z
  while (n > 0) {
    if (n & 1) r = mul(r, b)
    b = mul(b, b)
    n >>= 1
  }
  return r
}

export function pow(a: Complex, b: Complex): Complex {
  if (a[0] === 0 && a[1] === 0) return b[0] > 0 ? ZERO : [NaN, NaN]
  return exp(mul(b, log(a)))
}

const round = (x: number, d: number) => {
  const r = Number(x.toFixed(d))
  return Object.is(r, -0) ? 0 : r
}

export function fmtNum(x: number, d = 2): string {
  if (!Number.isFinite(x)) return Number.isNaN(x) ? 'non def.' : x > 0 ? '∞' : '−∞'
  if (Math.abs(x) >= 1e4 || (Math.abs(x) < 1e-3 && Math.abs(x) > 0 && round(x, d) === 0)) {
    const [m, e] = x.toExponential(1).split('e')
    return `${m.replace('-', '−')}·10^${Number(e)}`
  }
  return String(round(x, d)).replace('-', '−')
}

/** Formato "a + bi", come nel resto della UI. */
export function fmt(z: Complex, d = 2): string {
  if (!isFiniteC(z)) return abs(z) === Infinity ? '∞' : 'non def.'
  const re = round(z[0], d)
  const im = round(z[1], d)
  if (Math.abs(z[0]) >= 1e4 || Math.abs(z[1]) >= 1e4) return `${fmtNum(z[0], d)} + ${fmtNum(z[1], d)}i`
  return `${String(re).replace('-', '−')} ${im < 0 ? '−' : '+'} ${Math.abs(im)}i`
}

export const deg = (t: number) => `${Math.round((t * 180) / Math.PI)}°`

/** Integrale ∮ f dz su una circonferenza (trapezi: convergenza spettrale per integrandi periodici). */
export function circleIntegral(f: Fn, c: Complex, r: number, n = 2048): Complex {
  let s: Complex = ZERO
  for (let k = 0; k < n; k++) {
    const t = (2 * Math.PI * k) / n
    const e = polar(1, t)
    const z = add(c, scale(e, r))
    const dz = mul(I, scale(e, r)) // dz/dt
    s = add(s, mul(f(z), dz))
  }
  return scale(s, (2 * Math.PI) / n)
}

/** Integrale su una curva parametrica γ:[a,b]→ℂ con Simpson composito. */
export function pathIntegral(f: Fn, gamma: (t: number) => Complex, dgamma: (t: number) => Complex, a: number, b: number, n = 2000): Complex {
  if (n % 2) n++
  const h = (b - a) / n
  let s: Complex = ZERO
  for (let k = 0; k <= n; k++) {
    const t = a + k * h
    const w = k === 0 || k === n ? 1 : k % 2 ? 4 : 2
    s = add(s, scale(mul(f(gamma(t)), dgamma(t)), w))
  }
  return scale(s, h / 3)
}

/**
 * Coefficienti di Laurent/Taylor a_n, n ∈ [nMin, nMax], centrati in c, calcolati sulla
 * circonferenza |z − c| = r con la formula di Cauchy discretizzata (DFT).
 */
export function laurentCoeffs(f: Fn, c: Complex, r: number, nMin: number, nMax: number, m = 256): Complex[] {
  const samples: Complex[] = []
  for (let k = 0; k < m; k++) samples.push(f(add(c, polar(r, (2 * Math.PI * k) / m))))
  const out: Complex[] = []
  for (let n = nMin; n <= nMax; n++) {
    let s: Complex = ZERO
    for (let k = 0; k < m; k++) s = add(s, mul(samples[k], polar(1, (-2 * Math.PI * n * k) / m)))
    out.push(scale(s, 1 / (m * Math.pow(r, n))))
  }
  return out
}
