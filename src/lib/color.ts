import type { Complex } from './complex'

// Gradiente del sito: viola → magenta → rosa → oro
const STOPS: [number, number, number][] = [
  [124, 92, 240],
  [192, 79, 208],
  [226, 80, 122],
  [217, 169, 91],
]

export function gradientRGB(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * (STOPS.length - 1)
  const i = Math.min(STOPS.length - 2, Math.floor(x))
  const f = x - i
  const a = STOPS[i]
  const b = STOPS[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

export function gradient(t: number): string {
  const [r, g, b] = gradientRGB(t)
  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`
}

export const PALETTE = {
  violet: '#a78bfa',
  pink: '#ec6fb0',
  gold: '#d9a95b',
  red: '#f07178',
  green: '#7fd1a8',
  cyan: '#6cc7e0',
  axis: '#4a4955',
  fg: '#ededf0',
  muted: '#9d9ca8',
  bg: [22, 21, 27] as [number, number, number],
}

function hsv(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  switch (((i % 6) + 6) % 6) {
    case 0: return [v, t, p]
    case 1: return [q, v, p]
    case 2: return [p, v, t]
    case 3: return [p, q, v]
    case 4: return [t, p, v]
    default: return [v, p, q]
  }
}

export type DomainOpts = { rings?: boolean; phaseLines?: boolean; dim?: number }

/**
 * Domain coloring: tinta = arg f, anelli di luminosità = log₂|f| (ogni anello raddoppia il modulo).
 * Scrive RGBA in out[i..i+3].
 */
export function domainColor(w: Complex, out: Uint8ClampedArray, i: number, o: DomainOpts = {}) {
  const [x, y] = w
  const r = Math.hypot(x, y)
  if (!Number.isFinite(r)) {
    // polo / valore non definito: bianco se ∞, sfondo se NaN
    const c = r === Infinity ? 235 : 30
    out[i] = out[i + 1] = out[i + 2] = c
    out[i + 3] = 255
    return
  }
  const h = (Math.atan2(y, x) / (2 * Math.PI) + 1) % 1
  let v = 0.9
  if (o.rings !== false && r > 0) {
    const l = Math.log2(r)
    v = 0.62 + 0.33 * (l - Math.floor(l))
  }
  if (o.phaseLines) {
    const g = (h * 12) % 1
    if (g < 0.04 || g > 0.96) v *= 0.55
  }
  // vicino a 0 e a ∞ scurisci / schiarisci leggermente per leggere zeri e poli
  const s = 0.6
  const [R, G, B] = hsv(h, s, v * (o.dim ?? 0.8))
  out[i] = R * 255
  out[i + 1] = G * 255
  out[i + 2] = B * 255
  out[i + 3] = 255
}
