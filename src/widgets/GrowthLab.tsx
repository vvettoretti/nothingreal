import { useMemo, useState } from 'react'
import { abs, fmtNum, laurentCoeffs, polar, type Complex, type Fn } from '../lib/complex'
import { compile } from '../lib/parse'
import { domainColor, PALETTE } from '../lib/color'
import { Circle, Dot, Plane } from '../components/Plane'
import { Chart, Legend } from '../components/Chart'
import { M } from '../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../components/ui'

const PRESETS = [
  { id: 'p2', label: 'z² + 1', expr: 'z^2+1', explain: 'Polinomio di grado 2: $M(R)\\sim R^2$, pendenza 2 in scala log-log. Le stime di Cauchy danno $|a_n|\\le M(R)/R^n\\to 0$ per $n>2$: un\'intera che cresce al più come $R^k$ è un polinomio di grado $\\le k$.' },
  { id: 'p5', label: 'z⁵ − 3z', expr: 'z^5-3z', explain: 'Per $R$ piccolo domina $-3z$ (pendenza 1), per $R$ grande domina $z^5$ (pendenza 5). Guarda il ginocchio nel grafico.' },
  { id: 'exp', label: 'eᶻ', expr: 'exp(z)', explain: '$M(R)=e^R$: nessun polinomio la controlla, e la pendenza log-log $= R$ cresce senza limite. È limitata sul semipiano sinistro, e questo non contraddice Liouville.' },
  { id: 'sin', label: 'sin z', expr: 'sin(z)', explain: 'Limitata sull\'asse reale ma **non** in $\\C$: $M(R)\\approx\\sinh R$, raggiunto in $\\pm iR$. Liouville dice che non poteva essere altrimenti.' },
  { id: 'exp2', label: 'e^{−z²}', expr: 'exp(-z^2)', explain: 'La gaussiana: tende a 0 lungo l\'asse reale ed è limitata su tutto $\\R$, ma su $|z|=R$ raggiunge $e^{R^2}$ lungo l\'asse immaginario.' },
  { id: 'lor', label: '1/(1 + z²) (non intera)', expr: '1/(1+z^2)', explain: 'Limitata in un intorno di $\\infty$, anzi infinitesima: $M(R)\\to0$. Non è un controesempio a Liouville perché non è intera: esplode su $|z|=1$, dove stanno i poli $\\pm i$.' },
]

const RMIN = 0.1
const RMAX = 20

function maxOnCircle(f: Fn, R: number, n = 540): { M: number; at: Complex } {
  let M = 0
  let at: Complex = [R, 0]
  for (let k = 0; k < n; k++) {
    const z = polar(R, (2 * Math.PI * k) / n)
    const m = abs(f(z))
    if (m > M || !Number.isFinite(m)) {
      M = m
      at = z
      if (!Number.isFinite(m)) break
    }
  }
  return { M, at }
}

export default function GrowthLab() {
  const [pid, setPid] = useState('p5')
  const preset = PRESETS.find((p) => p.id === pid)!
  const f = useMemo(() => compile(preset.expr), [preset])
  const [lR, setLR] = useState(Math.log10(2))
  const R = Math.pow(10, lR)
  const [n, setN] = useState(3)

  const curve = useMemo(() => {
    const pts: [number, number][] = []
    for (let k = 0; k <= 160; k++) {
      const lr = Math.log10(RMIN) + ((Math.log10(RMAX) - Math.log10(RMIN)) * k) / 160
      pts.push([lr, Math.log10(maxOnCircle(f, Math.pow(10, lr), 360).M)])
    }
    return pts
  }, [f])
  const coeffs = useMemo(() => laurentCoeffs(f, [0, 0], 0.5, 0, 10, 256), [f])
  const { M: MR, at } = maxOnCircle(f, R)
  const MR2 = maxOnCircle(f, R * 1.02).M
  const slope = (Math.log(MR2) - Math.log(MR)) / Math.log(1.02)
  const bound = MR / Math.pow(R, n)
  // per 1/(1+z²) le stime valgono solo per R < 1 (poli su |z| = 1)
  const bestBound = Math.min(...curve.filter(([lr]) => pid !== 'lor' || lr < 0).map(([lr, lm]) => Math.pow(10, lm - n * lr)))
  const an = abs(coeffs[n])

  const Rv = Math.max(1.5, R * 1.25)
  const paint = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i), [f])

  return (
    <Widget
      title="Quanto cresce una funzione intera?"
      description="$M(R)=\max_{|z|=R}|f(z)|$. A sinistra il domain coloring di $f$ con la circonferenza $|z|=R$ e il punto in cui si raggiunge il massimo, a destra $\log_{10}M(R)$ in funzione di $\log_{10}R$. Più sotto la stima di Cauchy $|a_n|\le M(R)/R^n$ per il coefficiente $n$-esimo."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>raggio <M>R</M></>} value={lR} min={Math.log10(RMIN)} max={Math.log10(RMAX)} step={0.005} onChange={setLR} display={fmtNum(R)} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Piano z">
          <Plane view={{ x: [-Rv, Rv], y: [-Rv, Rv] }} paint={paint} res={0.5}>
            <Circle c={[0, 0]} r={R} color="#fff" width={2.5} />
            <Dot p={at} color={PALETTE.pink} r={6} />
          </Plane>
        </Panel>
        <Panel label="log₁₀ M(R)  vs  log₁₀ R">
          <Chart
            series={[
              { points: curve, color: PALETTE.violet, width: 2.5 },
              { points: curve.map(([x]) => [x, curve[80][1] + (x - curve[80][0])]), color: PALETTE.muted, dash: '3 5', width: 1 },
              { points: curve.map(([x]) => [x, curve[80][1] + 2 * (x - curve[80][0])]), color: PALETTE.muted, dash: '3 5', width: 1 },
            ]}
            x={[Math.log10(RMIN), Math.log10(RMAX)]}
            y={[-4, 10]}
            marker={lR}
            height={300}
            xTicks={[-1, 0, 1].map((v) => ({ v, label: `10^${v}` }))}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.violet, label: 'log M(R)' }, { color: PALETTE.muted, label: 'pendenze 1 e 2 (riferimento)', dash: true }]} />
          </div>
        </Panel>
      </div>
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Panel label="Stima di Cauchy">
          <Slider label={<>coefficiente <M>n</M></>} value={n} min={0} max={8} step={1} onChange={setN} display={n} />
        </Panel>
        <Stats
          items={[
            { label: 'M(R)', value: fmtNum(MR, 3) },
            { label: 'pendenza log-log', value: fmtNum(slope, 2), tone: 'accent' },
            { label: `|a_${n}| (vero)`, value: fmtNum(an, 4) },
            { label: `M(R)/R^${n}  ·  inf_R`, value: `${fmtNum(bound, 3)} · ${fmtNum(bestBound, 3)}` },
          ]}
        />
      </div>
      <Hint>{String.raw`Liouville è la stima di Cauchy con $n=1$ e $R\to\infty$: se $|f|\le M$ allora $|f'(0)|\le M/R\to0$, e lo stesso vale in ogni punto, quindi $f'\equiv0$. Con $n>k$ e $M(R)\le CR^k$ si ottiene che $f$ è un polinomio. Per $e^z$ e $\sin z$ l'estremo inferiore sui raggi $R$ resta positivo per ogni $n$: sono intere trascendenti.`}</Hint>
    </Widget>
  )
}
