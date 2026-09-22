import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Complex } from '../lib/complex'
import { gradient, PALETTE } from '../lib/color'

export type View = { x: [number, number]; y: [number, number] }

type PlaneCtx = {
  W: number
  H: number
  scale: number
  toPx: (p: Complex) => [number, number]
  toWorld: (px: number, py: number) => Complex
  svg: React.RefObject<SVGSVGElement | null>
}

const Ctx = createContext<PlaneCtx | null>(null)
export const usePlane = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('usePlane fuori da <Plane>')
  return c
}

export type Painter = (z: Complex, out: Uint8ClampedArray, i: number) => void

type PlaneProps = {
  view: View
  /** altezza / larghezza */
  aspect?: number
  /** colore per pixel dello sfondo (es. domain coloring) */
  paint?: Painter
  /** lo sfondo si ridisegna quando cambia `paint` (memoizzalo) o questa chiave */
  paintKey?: unknown
  /** risoluzione del canvas rispetto ai pixel CSS */
  res?: number
  axes?: boolean
  labels?: boolean
  onHover?: (z: Complex | null) => void
  onPointerDownWorld?: (z: Complex) => void
  children?: ReactNode
}

function niceStep(range: number) {
  const raw = range / 6
  const p = Math.pow(10, Math.floor(Math.log10(raw)))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p
}

export function Plane({ view, aspect = 1, paint, paintKey, res = 0.6, axes = true, labels = true, onHover, onPointerDownWorld, children }: PlaneProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [W, setW] = useState(0)

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    setW(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])

  const H = Math.round(W * aspect)
  const [x0, x1] = view.x
  const [y0, y1] = view.y
  const ctx = useMemo<PlaneCtx>(() => {
    const scale = W > 0 ? Math.min(W / (x1 - x0), H / (y1 - y0)) : 1
    const cx = (x0 + x1) / 2
    const cy = (y0 + y1) / 2
    return {
      W,
      H,
      scale,
      svg,
      toPx: (p) => [W / 2 + (p[0] - cx) * scale, H / 2 - (p[1] - cy) * scale],
      toWorld: (px, py) => [cx + (px - W / 2) / scale, cy - (py - H / 2) / scale],
    }
  }, [W, H, x0, x1, y0, y1])

  useEffect(() => {
    const cv = canvas.current
    if (!cv || !paint || W === 0) return
    const cw = Math.max(1, Math.round(W * res))
    const ch = Math.max(1, Math.round(H * res))
    cv.width = cw
    cv.height = ch
    const g = cv.getContext('2d')!
    const img = g.createImageData(cw, ch)
    const d = img.data
    for (let py = 0; py < ch; py++) {
      for (let px = 0; px < cw; px++) {
        const z = ctx.toWorld(((px + 0.5) / cw) * W, ((py + 0.5) / ch) * H)
        paint(z, d, (py * cw + px) * 4)
      }
    }
    g.putImageData(img, 0, 0)
  }, [ctx, paint, paintKey, res])

  const worldFromEvent = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    return ctx.toWorld(e.clientX - r.left, e.clientY - r.top)
  }

  let axesEl: ReactNode = null
  if (axes && W > 0) {
    const [ox, oy] = ctx.toPx([0, 0])
    const [vx0, vy1] = ctx.toWorld(0, 0)
    const [vx1, vy0] = ctx.toWorld(W, H)
    const step = niceStep(Math.min(vx1 - vx0, vy1 - vy0))
    const ticks: ReactNode[] = []
    if (labels) {
      for (let t = Math.ceil(vx0 / step) * step; t <= vx1; t += step) {
        if (Math.abs(t) < step / 2) continue
        const [px] = ctx.toPx([t, 0])
        const y = Math.min(Math.max(oy, 0), H)
        ticks.push(
          <g key={'x' + t}>
            <line x1={px} x2={px} y1={y - 3} y2={y + 3} stroke={PALETTE.axis} />
            <text x={px} y={Math.min(y + 15, H - 4)} fill={PALETTE.muted} fontSize={10} textAnchor="middle" opacity={0.7}>
              {Number(t.toFixed(6))}
            </text>
          </g>,
        )
      }
      for (let t = Math.ceil(vy0 / step) * step; t <= vy1; t += step) {
        if (Math.abs(t) < step / 2) continue
        const [, py] = ctx.toPx([0, t])
        const x = Math.min(Math.max(ox, 0), W)
        ticks.push(
          <g key={'y' + t}>
            <line x1={x - 3} x2={x + 3} y1={py} y2={py} stroke={PALETTE.axis} />
            <text x={Math.max(x - 6, 22)} y={py + 3.5} fill={PALETTE.muted} fontSize={10} textAnchor="end" opacity={0.7}>
              {Number(t.toFixed(6))}i
            </text>
          </g>,
        )
      }
    }
    axesEl = (
      <g>
        {oy >= 0 && oy <= H && <line x1={0} x2={W} y1={oy} y2={oy} stroke={PALETTE.axis} strokeWidth={1.2} />}
        {ox >= 0 && ox <= W && <line x1={ox} x2={ox} y1={0} y2={H} stroke={PALETTE.axis} strokeWidth={1.2} />}
        {ticks}
      </g>
    )
  }

  return (
    <div ref={wrap} className="relative w-full select-none overflow-hidden rounded-xl" style={{ height: H || undefined, aspectRatio: W ? undefined : `${1 / aspect}` }}>
      {paint && <canvas ref={canvas} className="absolute inset-0 h-full w-full rounded-xl" style={{ imageRendering: 'auto' }} />}
      <svg
        ref={svg}
        width={W}
        height={H}
        className="absolute inset-0 touch-none overflow-hidden"
        onPointerMove={onHover ? (e) => onHover(worldFromEvent(e)) : undefined}
        onPointerLeave={onHover ? () => onHover(null) : undefined}
        onPointerDown={onPointerDownWorld ? (e) => onPointerDownWorld(worldFromEvent(e)) : undefined}
      >
        <Ctx.Provider value={ctx}>
          {axesEl}
          {W > 0 && children}
        </Ctx.Provider>
      </svg>
    </div>
  )
}

/* ---------- primitive da usare dentro <Plane> ---------- */

const MAX = 1e5

function toPath(pts: Complex[], toPx: PlaneCtx['toPx'], closed = false, jump = Infinity): string {
  let d = ''
  let open = false
  let prev: Complex | null = null
  for (const p of pts) {
    const ok = Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) < MAX && Math.abs(p[1]) < MAX
    if (!ok) {
      open = false
      prev = null
      continue
    }
    if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) > jump) open = false
    const [x, y] = toPx(p)
    d += `${open ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
    open = true
    prev = p
  }
  if (closed && d) d += 'Z'
  return d
}

type Stroke = { color?: string; width?: number; opacity?: number; dash?: string }

export function Poly({ pts, color = PALETTE.fg, width = 2, opacity = 1, dash, closed, jump, fill, fillOpacity }: Stroke & { pts: Complex[]; closed?: boolean; jump?: number; fill?: string; fillOpacity?: number }) {
  const { toPx } = usePlane()
  return (
    <path
      d={toPath(pts, toPx, closed, jump)}
      fill={fill ?? 'none'}
      fillOpacity={fillOpacity}
      stroke={color}
      strokeWidth={width}
      strokeOpacity={opacity}
      strokeDasharray={dash}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  )
}

/** Polilinea colorata lungo il gradiente del sito (t = 0 → viola, t = 1 → oro). */
export function GradPoly({ pts, width = 2.5, opacity = 1, jump, from = 0, to = 1 }: { pts: Complex[]; width?: number; opacity?: number; jump?: number; from?: number; to?: number }) {
  const { toPx } = usePlane()
  const bins = 40
  const paths: { d: string; c: string }[] = []
  let cur = -1
  let d = ''
  let prev: Complex | null = null
  const n = pts.length
  const flush = () => {
    if (d) paths.push({ d, c: gradient(from + ((to - from) * (cur + 0.5)) / bins) })
    d = ''
  }
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const ok = Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) < MAX && Math.abs(p[1]) < MAX
    if (!ok || (prev && jump !== undefined && Math.hypot(p[0] - prev[0], p[1] - prev[1]) > jump)) {
      flush()
      prev = ok ? p : null
      if (ok) {
        const [x, y] = toPx(p)
        d = `M${x.toFixed(1)},${y.toFixed(1)}`
        cur = Math.min(bins - 1, Math.floor((i / Math.max(1, n - 1)) * bins))
      }
      continue
    }
    const b = Math.min(bins - 1, Math.floor((i / Math.max(1, n - 1)) * bins))
    const [x, y] = toPx(p)
    if (b !== cur && prev) {
      flush()
      const [px, py] = toPx(prev)
      d = `M${px.toFixed(1)},${py.toFixed(1)}`
    }
    cur = b
    d += `${d ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
    prev = p
  }
  flush()
  return (
    <g strokeWidth={width} strokeOpacity={opacity} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => (
        <path key={i} d={p.d} stroke={p.c} />
      ))}
    </g>
  )
}

export function Seg({ a, b, ...s }: Stroke & { a: Complex; b: Complex }) {
  const { toPx } = usePlane()
  const [x1, y1] = toPx(a)
  const [x2, y2] = toPx(b)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={s.color ?? PALETTE.fg} strokeWidth={s.width ?? 2} strokeOpacity={s.opacity ?? 1} strokeDasharray={s.dash} strokeLinecap="round" />
}

export function Circle({ c, r, fill, fillOpacity = 0.12, ...s }: Stroke & { c: Complex; r: number; fill?: string; fillOpacity?: number }) {
  const { toPx, scale } = usePlane()
  const [x, y] = toPx(c)
  return (
    <circle
      cx={x}
      cy={y}
      r={Math.max(0, r * scale)}
      fill={fill ?? 'none'}
      fillOpacity={fillOpacity}
      stroke={s.color ?? PALETTE.fg}
      strokeWidth={s.width ?? 2}
      strokeOpacity={s.opacity ?? 1}
      strokeDasharray={s.dash}
    />
  )
}

export function Dot({ p, color = PALETTE.pink, r = 7, ring = true }: { p: Complex; color?: string; r?: number; ring?: boolean }) {
  const { toPx } = usePlane()
  if (!Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null
  const [x, y] = toPx(p)
  return <circle cx={x} cy={y} r={r} fill={color} stroke={ring ? '#fff' : 'none'} strokeWidth={2} />
}

export function Cross({ p, color = PALETTE.fg, size = 6 }: { p: Complex; color?: string; size?: number }) {
  const { toPx } = usePlane()
  const [x, y] = toPx(p)
  return (
    <g stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <line x1={x - size} y1={y - size} x2={x + size} y2={y + size} />
      <line x1={x - size} y1={y + size} x2={x + size} y2={y - size} />
    </g>
  )
}

export function Label({ p, children, color = PALETTE.fg, dx = 8, dy = -8, anchor = 'start', size = 12 }: { p: Complex; children: ReactNode; color?: string; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end'; size?: number }) {
  const { toPx } = usePlane()
  const [x, y] = toPx(p)
  return (
    <text x={x + dx} y={y + dy} fill={color} fontSize={size} textAnchor={anchor} fontWeight={600} style={{ paintOrder: 'stroke', stroke: '#16151b', strokeWidth: 3 }}>
      {children}
    </text>
  )
}

/** Freccia in coordinate pixel a partire da un punto del piano. */
export function ArrowPx({ from, dx, dy, color, width = 1.6, opacity = 1 }: { from: Complex; dx: number; dy: number; color: string; width?: number; opacity?: number }) {
  const { toPx } = usePlane()
  const [x, y] = toPx(from)
  const len = Math.hypot(dx, dy)
  if (len < 0.5) return null
  const ux = dx / len
  const uy = dy / len
  const hx = x + dx
  const hy = y + dy
  const s = Math.min(5, len * 0.45)
  return (
    <g stroke={color} strokeWidth={width} strokeOpacity={opacity} fill={color} fillOpacity={opacity} strokeLinecap="round">
      <line x1={x} y1={y} x2={hx - ux * s * 0.6} y2={hy - uy * s * 0.6} />
      <path d={`M${hx},${hy} L${hx - ux * s - uy * s * 0.55},${hy - uy * s + ux * s * 0.55} L${hx - ux * s + uy * s * 0.55},${hy - uy * s - ux * s * 0.55} Z`} stroke="none" />
    </g>
  )
}

/** Freccia di orientamento posta a metà di un arco. */
export function OrientArrow({ at, dir, color = PALETTE.fg, size = 7 }: { at: Complex; dir: Complex; color?: string; size?: number }) {
  const { toPx } = usePlane()
  const [x, y] = toPx(at)
  const l = Math.hypot(dir[0], dir[1]) || 1
  const ux = dir[0] / l
  const uy = -dir[1] / l
  return (
    <path
      d={`M${x + ux * size},${y + uy * size} L${x - ux * size - uy * size * 0.8},${y - uy * size + ux * size * 0.8} L${x - ux * size + uy * size * 0.8},${y - uy * size - ux * size * 0.8} Z`}
      fill={color}
      stroke="#16151b"
      strokeWidth={1}
    />
  )
}

/** Punto trascinabile (con area di presa più ampia del disegno). */
export function Handle({ p, onChange, color = PALETTE.violet, r = 8, constrain }: { p: Complex; onChange: (p: Complex) => void; color?: string; r?: number; constrain?: (p: Complex) => Complex }) {
  const { toPx, toWorld, svg, W, H } = usePlane()
  const drag = useRef(false)
  const [x, y] = toPx(p)
  const move = (e: React.PointerEvent) => {
    if (!drag.current || !svg.current) return
    const rect = svg.current.getBoundingClientRect()
    // il punto non può uscire dal pannello: margine di qualche pixel dai bordi
    const m = r + 4
    const px = Math.min(W - m, Math.max(m, e.clientX - rect.left))
    const py = Math.min(H - m, Math.max(m, e.clientY - rect.top))
    const w = toWorld(px, py)
    onChange(constrain ? constrain(w) : w)
  }
  return (
    <g
      style={{ cursor: 'grab' }}
      onPointerDown={(e) => {
        e.stopPropagation()
        drag.current = true
        ;(e.target as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={move}
      onPointerUp={() => (drag.current = false)}
      onPointerCancel={() => (drag.current = false)}
    >
      <circle cx={x} cy={y} r={r + 10} fill="transparent" />
      <circle cx={x} cy={y} r={r + 5} fill={color} fillOpacity={0.18} />
      <circle cx={x} cy={y} r={r} fill={color} stroke="#fff" strokeWidth={2} />
    </g>
  )
}
