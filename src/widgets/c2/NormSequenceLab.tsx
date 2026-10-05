import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { gradient, PALETTE } from '../../lib/color'
import { normP, sample, type RFn } from '../../lib/real'
import { Chart, Legend, type Series } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../../components/ui'

type Preset = { id: string; label: string; f: (n: number) => RFn; limit?: RFn; yMax: (n: number) => number; explain: string }

const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const PRESETS: Preset[] = [
  {
    id: 'pow',
    label: 'fₙ(x) = xⁿ',
    f: (n) => (x) => Math.pow(x, n),
    yMax: () => 1.1,
    explain: '$\\|x^n\\|_\\infty=1$ ma $\\|x^n\\|_1=\\frac1{n+1}$. Il rapporto $\\|f_n\\|_\\infty/\\|f_n\\|_1=n+1$ non è limitato, quindi **non esiste** $C$ con $\\|f\\|_\\infty\\le C\\|f\\|_1$: su $C^0([0,1])$ le due norme non sono equivalenti.',
  },
  {
    id: 'ramp',
    label: 'rampa → gradino',
    f: (n) => (x) => clamp01(0.5 + n * (x - 0.5)),
    limit: (x) => (x < 0.5 ? 0 : 1),
    yMax: () => 1.1,
    explain: 'Rampe continue sempre più ripide. In $\\|\\cdot\\|_1$ la successione è **di Cauchy** ($\\|f_n-f_{2n}\\|_1=\\frac1{8n}\\to0$), ma il suo limite naturale è un gradino, che non sta in $C^0$. Quindi $(C^0([0,1]),\\|\\cdot\\|_1)$ **non è completo**. In $\\|\\cdot\\|_\\infty$ invece non è nemmeno di Cauchy.',
  },
  {
    id: 'spike',
    label: 'picchi alti e stretti',
    f: (n) => (x) => Math.max(0, n - n * n * n * Math.abs(x - 0.5)),
    yMax: (n) => n * 1.1,
    explain: 'Triangoli di altezza $n$ e base $2/n^2$: l\'area è $1/n\\to0$, quindi $f_n\\to0$ in $\\|\\cdot\\|_1$, mentre $\\|f_n\\|_\\infty=n\\to\\infty$. Convergere in una norma non dice nulla sull\'altra.',
  },
  {
    id: 'shrink',
    label: 'fₙ = sin(nπx) / n',
    f: (n) => (x) => Math.sin(n * Math.PI * x) / n,
    yMax: () => 1.1,
    explain: '$\\|f_n\\|_\\infty=\\frac1n\\to0$: converge uniformemente a 0. Ma $\\|f_n\'\\|_\\infty=\\pi$ per ogni $n$, quindi in $C^1$ con $\\|f\\|_{C^1}=\\|f\\|_\\infty+\\|f\'\\|_\\infty$ la successione **non** tende a 0. La norma decide che cosa vuol dire "vicino".',
  },
]

export default function NormSequenceLab() {
  const [pid, setPid] = useState('pow')
  const preset = PRESETS.find((p) => p.id === pid)!
  const [n, setN] = useState(6)
  const fn = preset.f(n)
  const f2n = preset.f(2 * n)

  const series = useMemo(() => {
    const out: Series[] = []
    const prev = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32].filter((k) => k < n).slice(-5)
    prev.forEach((k, i) => out.push({ points: sample(preset.f(k), 0, 1, 500), color: gradient(i / 6), width: 1.2, dash: '3 4' }))
    if (preset.limit) out.push({ points: sample(preset.limit, 0, 1, 801), color: PALETTE.muted, width: 1.5, dash: '6 5' })
    out.push({ points: sample(fn, 0, 1, 1201), color: PALETTE.pink, width: 2.5, fill: 0.12 })
    return out
  }, [preset, n, fn])

  const sup = normP(fn, 0, 1, Infinity, 4000)
  const l1 = normP(fn, 0, 1, 1, 8000)
  const d1 = normP((x) => fn(x) - f2n(x), 0, 1, 1, 8000)
  const dInf = normP((x) => fn(x) - f2n(x), 0, 1, Infinity, 4000)
  const derivSup = pid === 'shrink' ? Math.PI : null

  return (
    <Widget
      title="Due norme sullo stesso spazio"
      description="Successioni in $C^0([0,1])$ misurate con $\|f\|_\infty=\max|f|$ e con $\|f\|_1=\int_0^1|f|$. In tratteggio alcuni termini precedenti. L'area colorata è $\|f_n\|_1$, l'altezza massima è $\|f_n\|_\infty$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>indice <M>n</M></>} value={n} min={1} max={40} step={1} onChange={setN} display={n} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <Panel label={`fₙ su [0, 1], n = ${n}`}>
        <Chart series={series} x={[0, 1]} y={[pid === 'shrink' ? -1.1 : -0.05, preset.yMax(n)]} height={280} />
        <div className="mt-2">
          <Legend items={[{ color: PALETTE.pink, label: 'fₙ' }, { color: gradient(0.3), label: 'termini precedenti', dash: true }, ...(preset.limit ? [{ color: PALETTE.muted, label: 'limite puntuale', dash: true }] : [])]} />
        </div>
      </Panel>
      <Stats
        items={[
          { label: '‖fₙ‖∞', value: fmtNum(sup, 4) },
          { label: '‖fₙ‖₁', value: fmtNum(l1, 4) },
          { label: '‖fₙ‖∞ / ‖fₙ‖₁', value: fmtNum(sup / l1, 3), tone: 'accent' },
          { label: '‖fₙ − f₂ₙ‖₁  ·  ‖fₙ − f₂ₙ‖∞', value: `${fmtNum(d1, 4)} · ${fmtNum(dInf, 3)}` },
          ...(derivSup ? [{ label: '‖fₙ′‖∞', value: fmtNum(derivSup, 4), tone: 'bad' as const }] : []),
        ]}
      />
      <Hint>{String.raw`L'ultima colonna è il test di Cauchy con $m=2n$: se tende a 0 in una norma ma il limite "esce" dallo spazio (rampa), lo spazio con quella norma non è di Banach. $(C^0([a,b]),\|\cdot\|_\infty)$ invece lo è: il limite uniforme di continue è continuo.`}</Hint>
    </Widget>
  )
}
