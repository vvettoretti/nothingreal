import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { gradient, PALETTE } from '../../lib/color'
import { linspace } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

const PI = Math.PI

/** erf con errore < 1.5·10⁻⁷ (Abramowitz–Stegun 7.1.26). */
function erf(x: number): number {
  const s = Math.sign(x)
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return s * y
}

/** Dato iniziale costante a tratti: somma di h·1[a,b]. */
type Step = { a: number; b: number; h: number }

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
}
const noisy = (() => {
  const r = rng(7)
  return Array.from({ length: 24 }, (_, k): Step => ({ a: -3 + k * 0.25, b: -2.75 + k * 0.25, h: 0.3 + 1.2 * r() }))
})()

const PRESETS: { id: string; label: string; steps: Step[]; explain: string }[] = [
  { id: 'box', label: 'blocco caldo 1[−1,1]', steps: [{ a: -1, b: 1, h: 1 }], explain: 'Il calore si diffonde: gli spigoli spariscono **subito**, per ogni $t>0$ la soluzione è $C^\\infty$ (anzi analitica in $x$). La massa $\\int u$ si conserva e il massimo scende come $t^{-1/2}$.' },
  { id: 'two', label: 'due blocchi diversi', steps: [{ a: -2.5, b: -1.5, h: 1.5 }, { a: 0.5, b: 2.5, h: 0.6 }], explain: 'L\'equazione è lineare: la soluzione è la somma delle soluzioni dei due blocchi. Quando i due "profili" si toccano si fondono in una sola campana.' },
  { id: 'step', label: 'gradino H(x)', steps: [{ a: 0, b: 50, h: 1 }], explain: 'Dato limitato ma non integrabile: $u(x,t)=\\tfrac12\\big(1+\\operatorname{erf}(x/\\sqrt{4t})\\big)$. Il fronte si allarga come $\\sqrt t$: la diffusione ha velocità infinita (al tempo $t>0$ $u>0$ ovunque) ma scala lentamente.' },
  { id: 'noise', label: 'dato rumoroso', steps: noisy, explain: 'Le frequenze alte vengono smorzate dal fattore $e^{-4\\pi^2\\xi^2t}$ molto più in fretta di quelle basse: il rumore sparisce in tempi brevissimi, l\'andamento medio sopravvive a lungo. È un filtro passa-basso.' },
]

function solution(steps: Step[], t: number) {
  if (t <= 0) return (x: number) => steps.reduce((s, q) => s + (x >= q.a && x <= q.b ? q.h : 0), 0)
  const w = Math.sqrt(4 * t)
  return (x: number) => steps.reduce((s, q) => s + (q.h / 2) * (erf((x - q.a) / w) - erf((x - q.b) / w)), 0)
}
/** |f̂(ξ)| per un dato costante a tratti. */
function hatAbs(steps: Step[], k: number) {
  if (Math.abs(k) < 1e-9) return Math.abs(steps.reduce((s, q) => s + q.h * (q.b - q.a), 0))
  let re = 0
  let im = 0
  for (const q of steps) {
    // ∫_a^b e^{−2πikx} dx = (sin(2πkb) − sin(2πka))/(2πk) + i (cos(2πkb) − cos(2πka))/(2πk)
    const w = 2 * PI * k
    re += (q.h * (Math.sin(w * q.b) - Math.sin(w * q.a))) / w
    im += (q.h * (Math.cos(w * q.b) - Math.cos(w * q.a))) / w
  }
  return Math.hypot(re, im)
}

export default function HeatLab() {
  const [pid, setPid] = useState('box')
  const p = PRESETS.find((q) => q.id === pid)!
  const [lt, setLt] = useState(-2)
  const t = Math.pow(10, lt)
  const xs = useMemo(() => linspace(-5, 5, 801), [])
  const u0 = solution(p.steps, 0)
  const u = solution(p.steps, t)
  const snaps = [-3, -2, -1, 0].filter((v) => v < lt - 0.05)
  const ks = linspace(-3, 3, 600)
  const mass = p.id === 'step' ? Infinity : p.steps.reduce((s, q) => s + q.h * (q.b - q.a), 0)
  const umax = Math.max(...xs.map(u))
  const dx = xs[1] - xs[0]
  const massNum = xs.reduce((s, x) => s + u(x) * dx, 0)

  return (
    <Widget
      title="Equazione del calore: il nucleo gaussiano"
      description="$u(x,t)=\big(G_t*f\big)(x)$ con $G_t(x)=\frac{e^{-x^2/4t}}{\sqrt{4\pi t}}$. In frequenza la stessa cosa è una moltiplicazione: $\hat u(\xi,t)=e^{-4\pi^2\xi^2t}\hat f(\xi)$. Il dato iniziale è costante a tratti, quindi la convoluzione si scrive esattamente con la funzione errore."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((q) => ({ value: q.id, label: 'f = ' + q.label }))} />
          <Slider label={<>tempo <M>t</M> (scala log)</>} value={lt} min={-4} max={1} step={0.01} onChange={setLt} display={fmtNum(t, 4)} />
        </div>
        <Explain>{p.explain}</Explain>
      </div>
      <Panel label={`u(x, t), t = ${fmtNum(t, 4)}`}>
        <Chart
          series={[
            { points: xs.map((x) => [x, u0(x)]), color: PALETTE.muted, width: 1.5, dash: '5 4' },
            ...snaps.map((s, i) => ({ points: xs.map((x) => [x, solution(p.steps, Math.pow(10, s))(x)] as [number, number]), color: gradient(i / 5), width: 1.1, dash: '2 4' })),
            { points: xs.map((x) => [x, u(x)]), color: PALETTE.pink, width: 2.6, fill: 0.12 },
          ]}
          x={[-5, 5]}
          y={[-0.05, 1.7]}
          height={260}
        />
        <div className="mt-2">
          <Legend items={[{ color: PALETTE.muted, label: 'dato iniziale f', dash: true }, { color: gradient(0.2), label: 't = 10⁻³, 10⁻², …', dash: true }, { color: PALETTE.pink, label: 'u(·, t)' }]} />
        </div>
      </Panel>
      <TwoPanels>
        <Panel label="|f̂(ξ)| e |û(ξ, t)| = e^(−4π²ξ²t) |f̂(ξ)|">
          <Chart
            series={[
              { points: ks.map((k) => [k, hatAbs(p.steps, k)]), color: PALETTE.muted, width: 1.2 },
              { points: ks.map((k) => [k, hatAbs(p.steps, k) * Math.exp(-4 * PI * PI * k * k * t)]), color: PALETTE.violet, width: 2.2, fill: 0.15 },
            ]}
            x={[-3, 3]}
            y={[0, p.id === 'step' ? 2 : Math.min(8, hatAbs(p.steps, 0) * 1.1)]}
            height={200}
          />
        </Panel>
        <Panel label="nucleo G_t(x)">
          <Chart
            series={[{ points: xs.map((x) => [x, Math.exp((-x * x) / (4 * t)) / Math.sqrt(4 * PI * t)]), color: PALETTE.gold, width: 2.2, fill: 0.15 }]}
            x={[-5, 5]}
            y={[0, 3]}
            height={200}
          />
        </Panel>
      </TwoPanels>
      <Stats
        items={[
          { label: 'larghezza del nucleo √(2t)', value: fmtNum(Math.sqrt(2 * t), 4) },
          { label: 'max u(·, t)', value: fmtNum(umax, 4), tone: 'accent' },
          { label: '∫ u(x, t) dx  (su [−5, 5])', value: fmtNum(massNum, 4) },
          { label: '∫ f', value: Number.isFinite(mass) ? fmtNum(mass, 4) : '∞' },
        ]}
      />
      <Hint>{'Il metodo della lezione in tre righe: trasformare in $x$ riduce l\'EDP a una EDO in $t$ per ogni $\\xi$, la EDO si risolve con un esponenziale, e un esponenziale gaussiano in $\\xi$ è la trasformata di una gaussiana in $x$. Il prodotto in frequenza torna convoluzione nello spazio.'}</Hint>
    </Widget>
  )
}
