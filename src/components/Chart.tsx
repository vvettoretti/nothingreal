import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { PALETTE } from '../lib/color'

export type Series = { points: [number, number][]; color: string; dash?: string; dots?: boolean; width?: number; label?: string }

/** Piccolo grafico cartesiano in SVG, con assi e griglia leggera. */
export function Chart({
  series,
  x,
  y,
  height = 240,
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  marker,
  bars,
}: {
  series: Series[]
  x: [number, number]
  y: [number, number]
  height?: number
  xLabel?: string
  yLabel?: string
  xTicks?: { v: number; label: string }[]
  yTicks?: { v: number; label: string }[]
  marker?: number
  bars?: { x: number; y: number; color: string }[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const m = { l: 44, r: 12, t: 10, b: 30 }
  const iw = Math.max(1, W - m.l - m.r)
  const ih = height - m.t - m.b
  const sx = (v: number) => m.l + ((v - x[0]) / (x[1] - x[0])) * iw
  const sy = (v: number) => m.t + (1 - (v - y[0]) / (y[1] - y[0])) * ih
  const clampY = (v: number) => Math.min(y[1], Math.max(y[0], v))
  const tick = (a: [number, number]) => {
    const step = Math.pow(10, Math.floor(Math.log10((a[1] - a[0]) / 4)))
    const k = (a[1] - a[0]) / step > 8 ? step * 2 : step
    const out: { v: number; label: string }[] = []
    for (let v = Math.ceil(a[0] / k) * k; v <= a[1] + 1e-9; v += k) out.push({ v, label: String(Number(v.toFixed(6))) })
    return out
  }
  const xt = xTicks ?? tick(x)
  const yt = yTicks ?? tick(y)

  let content: ReactNode = null
  if (W > 0) {
    content = (
      <>
        {yt.map((t) => (
          <g key={'y' + t.v}>
            <line x1={m.l} x2={W - m.r} y1={sy(t.v)} y2={sy(t.v)} stroke="#26252e" />
            <text x={m.l - 8} y={sy(t.v) + 3.5} fontSize={10.5} fill={PALETTE.muted} textAnchor="end">{t.label}</text>
          </g>
        ))}
        {xt.map((t) => (
          <text key={'x' + t.v} x={sx(t.v)} y={height - 10} fontSize={10.5} fill={PALETTE.muted} textAnchor="middle">{t.label}</text>
        ))}
        <line x1={m.l} x2={W - m.r} y1={m.t + ih} y2={m.t + ih} stroke={PALETTE.axis} />
        {bars?.map((b, i) => {
          const w = Math.max(2, (iw / (x[1] - x[0])) * 0.62)
          const base = sy(y[0])
          const top = sy(clampY(b.y))
          return <rect key={i} x={sx(b.x) - w / 2} y={Math.min(top, base)} width={w} height={Math.abs(base - top)} rx={2} fill={b.color} opacity={0.85} />
        })}
        {marker !== undefined && <line x1={sx(marker)} x2={sx(marker)} y1={m.t} y2={m.t + ih} stroke={PALETTE.pink} strokeDasharray="4 4" />}
        {series.map((s, i) => {
          const pts = s.points.filter((p) => Number.isFinite(p[1]))
          const d = pts.map((p, j) => `${j ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(clampY(p[1])).toFixed(1)}`).join('')
          return (
            <g key={i}>
              {!s.dots && <path d={d} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} strokeDasharray={s.dash} strokeLinejoin="round" />}
              {s.dots && pts.map((p, j) => <circle key={j} cx={sx(p[0])} cy={sy(clampY(p[1]))} r={3} fill={s.color} />)}
            </g>
          )
        })}
        {xLabel && <text x={W - m.r} y={m.t + ih - 6} fontSize={11} fill={PALETTE.muted} textAnchor="end">{xLabel}</text>}
        {yLabel && <text x={m.l + 6} y={m.t + 12} fontSize={11} fill={PALETTE.muted}>{yLabel}</text>}
      </>
    )
  }
  return (
    <div ref={ref} className="w-full">
      <svg width={W} height={height}>{content}</svg>
    </div>
  )
}

export function Legend({ items }: { items: { color: string; label: string; dash?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-2">
          <svg width="18" height="6"><line x1="0" x2="18" y1="3" y2="3" stroke={it.color} strokeWidth="2.5" strokeDasharray={it.dash ? '4 3' : undefined} /></svg>
          {it.label}
        </span>
      ))}
    </div>
  )
}
