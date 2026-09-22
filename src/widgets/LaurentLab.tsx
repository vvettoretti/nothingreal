import { useMemo, useState } from 'react'
import { abs, fmt, fmtNum, laurentCoeffs, polar, type Complex } from '../lib/complex'
import { compile } from '../lib/parse'
import { domainColor, PALETTE } from '../lib/color'
import { Circle, Cross, GradPoly, Plane, usePlane } from '../components/Plane'
import { Chart } from '../components/Chart'
import { M } from '../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../components/ui'

type Preset = { id: string; label: string; expr: string; sing: Complex[]; explain: string }
const PRESETS: Preset[] = [
  {
    id: 'two',
    label: '1/((z − 1)(z − 2))',
    expr: '1/((z-1)(z-2))',
    sing: [[1, 0], [2, 0]],
    explain: 'Con i fratti semplici $\\frac{1}{z-2}-\\frac1{z-1}$ si ottengono tre sviluppi diversi. Per $|z|<1$ è una serie di Taylor, per $1<|z|<2$ il termine $-\\frac1{z-1}=-\\frac1z\\sum(1/z)^n$ contribuisce potenze negative, per $|z|>2$ ci sono solo potenze negative, a partire da $z^{-2}$.',
  },
  {
    id: 'zz1',
    label: '1/(z(z − 1))',
    expr: '1/(z(z-1))',
    sing: [[0, 0], [1, 0]],
    explain: 'Su $0<|z|<1$: $-\\frac1z-1-z-z^2-\\dots$, cioè un polo semplice in 0 con residuo $-1$. Su $|z|>1$: $\\frac1{z^2}+\\frac1{z^3}+\\dots$, e il coefficiente di $z^{-1}$ è **0**. Non contraddice nulla: quello non è il residuo in 0, perché la corona non è un intorno bucato di 0.',
  },
  {
    id: 'sin4',
    label: 'sin z / z⁴',
    expr: 'sin(z)/z^4',
    sing: [[0, 0]],
    explain: '$\\frac{\\sin z}{z^4}=\\frac1{z^3}-\\frac1{6z}+\\frac{z}{120}-\\dots$: polo di ordine 3 con residuo $-\\tfrac16$. Una sola corona, $0<|z|<\\infty$, quindi lo sviluppo non dipende da $r$.',
  },
  {
    id: 'ess',
    label: 'e^{1/z}',
    expr: 'exp(1/z)',
    sing: [[0, 0]],
    explain: '$e^{1/z}=\\sum_{n\\ge0}\\frac{1}{n!\\,z^n}$: la parte principale ha **infiniti** termini, e questo caratterizza la singolarità essenziale. Residuo 1.',
  },
  {
    id: 'mix',
    label: 'e^{1/z} / (z − 2)',
    expr: 'exp(1/z)/(z-2)',
    sing: [[0, 0], [2, 0]],
    explain: 'Essenziale in 0 e polo semplice in 2. Sulla corona $0<|z|<2$ la parte principale in 0 è infinita, per $|z|>2$ cambia tutto. Il residuo in 0 si legge solo nella corona $0<|z|<2$.',
  },
]

function Annulus({ r1, r2 }: { r1: number; r2: number }) {
  const { toPx, scale, W } = usePlane()
  const [cx, cy] = toPx([0, 0])
  const R2 = Math.min(r2 * scale, W * 3)
  const R1 = r1 * scale
  const d = `M${cx - R2},${cy} a${R2},${R2} 0 1,0 ${2 * R2},0 a${R2},${R2} 0 1,0 ${-2 * R2},0 Z` + (R1 > 0 ? ` M${cx - R1},${cy} a${R1},${R1} 0 1,0 ${2 * R1},0 a${R1},${R1} 0 1,0 ${-2 * R1},0 Z` : '')
  return <path d={d} fill="#fff" fillOpacity={0.14} fillRule="evenodd" stroke="none" />
}

const NR = 12

export default function LaurentLab() {
  const [pid, setPid] = useState('two')
  const preset = PRESETS.find((p) => p.id === pid)!
  const f = useMemo(() => compile(preset.expr), [preset])
  const [lr, setLr] = useState(Math.log10(1.4))
  const r = Math.pow(10, lr)

  const radii = [...new Set(preset.sing.map((s) => abs(s)))].sort((a, b) => a - b)
  const r1 = Math.max(0, ...radii.filter((x) => x < r))
  const r2 = Math.min(Infinity, ...radii.filter((x) => x > r))
  const near = radii.some((x) => Math.abs(x - r) / Math.max(x, 0.05) < 0.04)

  const coeffs = useMemo(() => laurentCoeffs(f, [0, 0], r, -NR, NR, 1024), [f, r])
  const a = (n: number) => coeffs[n + NR]
  // soglia di rumore: l'errore di arrotondamento su a_n è ~ ε·max|f| / rⁿ
  const maxF = coeffs.reduce((m, c, i) => Math.max(m, abs(c) * Math.pow(r, i - NR)), 0)
  const real = (c: Complex, n: number) => abs(c) > Math.max(1e-10, (1e-12 * maxF) / Math.pow(r, n))
  const bars = coeffs.map((c, i) => {
    const n = i - NR
    return { x: n, y: real(c, n) ? Math.log10(abs(c)) : -99, color: n === -1 ? PALETTE.pink : n < 0 ? PALETTE.violet : PALETTE.gold }
  })
  const principal = coeffs.slice(0, NR).filter((c, i) => real(c, i - NR)).length

  const paint = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i, { dim: 0.6 }), [f])

  return (
    <Widget
      title="Laurent: una funzione, più sviluppi"
      description="I coefficienti $a_n=\frac1{2\pi i}\oint_{|z|=r}\frac{f(z)}{z^{n+1}}dz$ calcolati sulla circonferenza $|z|=r$. Muovendo $r$ i coefficienti restano **costanti** finché non attraversi una singolarità, poi cambiano di colpo. La zona chiara è la corona di convergenza in cui ti trovi."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>raggio <M>r</M> (scala log)</>} value={lr} min={-1.1} max={0.7} step={0.002} onChange={setLr} display={fmtNum(r, 3)} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Panel label="Piano z · centro 0">
          <Plane view={{ x: [-3, 3], y: [-3, 3] }} paint={paint} res={0.5}>
            <Annulus r1={r1} r2={r2} />
            {radii.filter((x) => x > 0).map((x) => (
              <Circle key={x} c={[0, 0]} r={x} color="#fff" width={1} dash="4 5" opacity={0.6} />
            ))}
            <GradPoly width={3} pts={Array.from({ length: 241 }, (_, k) => polar(r, (2 * Math.PI * k) / 240))} />
            {preset.sing.map((s, i) => (
              <Cross key={i} p={s} color="#fff" />
            ))}
          </Plane>
        </Panel>
        <Panel label="log₁₀ |aₙ|,  n = −12 … 12">
          <Chart series={[]} bars={bars} x={[-NR - 0.8, NR + 0.8]} y={[-8, 3]} height={330} xTicks={[-12, -8, -4, -1, 0, 4, 8, 12].map((v) => ({ v, label: String(v) }))} />
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-violet" />parte principale (n &lt; 0)</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-pink" />a₋₁</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-gold" />parte regolare (n ≥ 0)</span>
          </div>
        </Panel>
      </div>
      <Stats
        items={[
          { label: 'corona', value: near ? 'r su una singolarità' : `${fmtNum(r1)} < |z| < ${Number.isFinite(r2) ? fmtNum(r2) : '∞'}`, tone: near ? 'bad' : 'accent' },
          { label: 'a₋₁', value: fmt(a(-1), 4) },
          { label: 'a₀', value: fmt(a(0), 4) },
          { label: 'termini n<0 non nulli (fino a −12)', value: principal === NR ? '≥ 12 (infiniti?)' : String(principal) },
        ]}
      />
      <Hint>{String.raw`$a_{-1}$ è il residuo in 0 **solo** nella corona più interna $0<|z|<r_1$, cioè in un intorno bucato di 0. Nella corona esterna $a_{-1}$ è invece $\frac1{2\pi i}\oint f$ su una curva che racchiude tutte le singolarità, ossia la somma di tutti i residui.`}</Hint>
    </Widget>
  )
}
