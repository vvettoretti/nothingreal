import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { integrate, linspace, normP, sample, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../../components/ui'

type Fn = { id: string; label: string; f: RFn }
const FNS: Fn[] = [
  { id: 'box', label: 'rettangolo 1[−1,1]', f: (x) => (Math.abs(x) <= 1 ? 1 : 0) },
  { id: 'tri', label: 'triangolo', f: (x) => Math.max(0, 1 - Math.abs(x)) },
  { id: 'gau', label: 'gaussiana', f: (x) => Math.exp(-2 * x * x) },
  { id: 'exp', label: 'e^(−x) H(x)', f: (x) => (x >= 0 ? Math.exp(-1.5 * x) : 0) },
  { id: 'two', label: 'due impulsi', f: (x) => (Math.abs(x - 1.2) < 0.15 || Math.abs(x + 1.2) < 0.15 ? 2 : 0) },
  { id: 'saw', label: 'dente di sega su [0, 1]', f: (x) => (x >= 0 && x < 1 ? x : 0) },
]

const A = 5

export default function ConvolutionLab() {
  const [fid, setFid] = useState('box')
  const [gid, setGid] = useState('exp')
  const [x, setX] = useState(0.4)
  const f = FNS.find((q) => q.id === fid)!.f
  const g = FNS.find((q) => q.id === gid)!.f

  const conv = useMemo(() => {
    const xs = linspace(-A, A, 241)
    return xs.map((t): [number, number] => [t, integrate((y) => f(t - y) * g(y), -A, A, 1600)])
  }, [f, g])
  const prod: RFn = (y) => f(x - y) * g(y)
  const val = integrate(prod, -A, A, 2400)
  const n1f = normP(f, -A, A, 1, 4000)
  const n1g = normP(g, -A, A, 1, 4000)
  const n1c = conv.reduce((s, [, v], i) => s + (i ? Math.abs(v) * (conv[1][0] - conv[0][0]) : 0), 0)
  const supC = Math.max(...conv.map(([, v]) => Math.abs(v)))
  const supG = normP(g, -A, A, Infinity, 4000)
  const top = Math.max(2.2, supC * 1.1)

  return (
    <Widget
      title="La convoluzione come media mobile"
      description="$(f*g)(x)=\int f(x-y)\,g(y)\,dy$. Nel primo pannello, in funzione di $y$, ci sono $g(y)$ e la copia ribaltata e traslata $f(x-y)$: l'area rosa del loro prodotto è il valore $(f*g)(x)$. Sposta $x$ e guarda il secondo pannello che si costruisce punto per punto."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Select value={fid} onChange={setFid} options={FNS.map((q) => ({ value: q.id, label: 'f: ' + q.label }))} />
            <Select value={gid} onChange={setGid} options={FNS.map((q) => ({ value: q.id, label: 'g: ' + q.label }))} />
          </div>
          <Slider label={<>punto <M>x</M></>} value={x} min={-4} max={4} step={0.01} onChange={setX} display={fmtNum(x)} />
        </div>
        <Explain>{'La convoluzione **regolarizza**: rettangolo $*$ rettangolo è un triangolo (continuo), triangolo $*$ rettangolo è $C^1$. Ogni valore di $f*g$ è una media pesata di $g$ con peso $f$ ribaltato. Per la disuguaglianza di Young $\\|f*g\\|_p\\le\\|f\\|_1\\|g\\|_p$, e per funzioni $\\ge0$ con $p=1$ vale l\'uguaglianza (Fubini–Tonelli).'}</Explain>
      </div>
      <Panel label="in funzione di y">
        <Chart
          series={[
            { points: sample(prod, -A, A, 1201), color: PALETTE.pink, width: 1.5, fill: 0.35 },
            { points: sample(g, -A, A, 1201), color: PALETTE.gold, width: 2 },
            { points: sample((y) => f(x - y), -A, A, 1201), color: PALETTE.violet, width: 2, dash: '5 4' },
          ]}
          x={[-A, A]}
          y={[-0.1, 2.2]}
          height={200}
          marker={x}
        />
        <div className="mt-2">
          <Legend items={[{ color: PALETTE.gold, label: 'g(y)' }, { color: PALETTE.violet, label: 'f(x − y)', dash: true }, { color: PALETTE.pink, label: 'f(x − y) g(y)' }]} />
        </div>
      </Panel>
      <Panel label="(f ∗ g)(x)">
        <Chart
          series={[
            { points: conv.filter(([t]) => t <= x), color: PALETTE.green, width: 2.5, fill: 0.1 },
            { points: conv.filter(([t]) => t >= x), color: PALETTE.green, width: 1.2, dash: '3 4' },
            { points: [[x, val]], color: PALETTE.pink, dots: true, r: 6 },
          ]}
          x={[-A, A]}
          y={[-0.1, top]}
          height={200}
          marker={x}
        />
      </Panel>
      <Stats
        items={[
          { label: '(f ∗ g)(x)', value: fmtNum(val, 4), tone: 'accent' },
          { label: '‖f ∗ g‖₁  vs  ‖f‖₁‖g‖₁', value: `${fmtNum(n1c, 3)} ≤ ${fmtNum(n1f * n1g, 3)}` },
          { label: '‖f ∗ g‖∞  vs  ‖f‖₁‖g‖∞', value: `${fmtNum(supC, 3)} ≤ ${fmtNum(n1f * supG, 3)}` },
        ]}
      />
      <Hint>{'Scambia $f$ e $g$: il risultato non cambia, perché $f*g=g*f$ (cambio di variabile $y\\mapsto x-y$). Con il dente di sega e il rettangolo vedi bene che i salti di uno dei due fattori spariscono nel prodotto di convoluzione.'}</Hint>
    </Widget>
  )
}
