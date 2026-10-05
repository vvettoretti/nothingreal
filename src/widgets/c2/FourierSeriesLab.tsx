import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { integrate, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Segmented, Select, Slider, Stats, Widget } from '../../components/ui'

const PI = Math.PI
type Preset = { id: string; label: string; u: RFn; cont: boolean; y: [number, number]; explain: string }
const PRESETS: Preset[] = [
  { id: 'sq', label: 'x² su [−π, π)', u: (x) => x * x, cont: true, y: [-1, 11], explain: 'Estensione **continua** ($u(-\\pi)=u(\\pi)$) e regolare a tratti: i coefficienti $a_n=\\frac{4(-1)^n}{n^2}$ sono sommabili e la serie converge **totalmente**. Già con pochi termini la somma parziale è indistinguibile da $f$.' },
  { id: 'saw', label: 'x su [−π, π) (dente di sega)', u: (x) => x, cont: false, y: [-4.5, 4.5], explain: 'L\'estensione periodica **salta** di $2\\pi$ in $\\pm\\pi$. $b_n=\\frac{2(-1)^{n+1}}{n}$ decade solo come $1/n$: la serie converge in $L^2$ ma non uniformemente (le somme parziali sono continue, il limite no). Vicino al salto c\'è un\'oscillazione che non si riduce: il **fenomeno di Gibbs**.' },
  { id: 'sqw', label: 'onda quadra sgn x', u: (x) => Math.sign(x), cont: false, y: [-1.6, 1.6], explain: 'Due salti per periodo. Nel punto di salto la serie converge alla **media** dei limiti destro e sinistro (qui 0), non al valore di $f$. Il picco di Gibbs resta al $\\approx9\\%$ del salto per ogni $N$, si sposta solo verso la discontinuità.' },
  { id: 'abs', label: '|x| su [−π, π)', u: (x) => Math.abs(x), cont: true, y: [-0.5, 4], explain: 'Continua con angoli: solo coseni, $a_n=-\\frac{4}{\\pi n^2}$ per $n$ dispari e 0 per $n$ pari. La decrescita $1/n^2$ dei coefficienti corrisponde a una funzione continua con derivata a salti.' },
  { id: 'exp', label: 'eˣ su [−π, π)', u: (x) => Math.exp(x), cont: false, y: [-3, 26], explain: 'Liscia su $(-\\pi,\\pi)$, ma la condizione di raccordo $u(-\\pi)=u(\\pi)$ fallisce: l\'estensione periodica salta da $e^{\\pi}$ a $e^{-\\pi}$. A contare è la funzione **periodica**, non solo $u$ sull\'intervallo.' },
  { id: 'smooth', label: 'e^(cos x) (periodica liscia)', u: (x) => Math.exp(Math.cos(x)), cont: true, y: [-0.2, 3.2], explain: 'Periodica e $C^\\infty$ (anzi analitica): i coefficienti decadono più velocemente di ogni potenza di $1/n$. Nel grafico logaritmico la nuvola scende a picco.' },
]

const NMAX = 60
const wrap = (x: number) => x - 2 * PI * Math.floor((x + PI) / (2 * PI))

export default function FourierSeriesLab() {
  const [pid, setPid] = useState('saw')
  const preset = PRESETS.find((p) => p.id === pid)!
  const [N, setN] = useState(8)
  const [zoom, setZoom] = useState<'all' | 'jump'>('all')
  const f: RFn = (x) => preset.u(wrap(x))

  const { a, b, norm2 } = useMemo(() => {
    const a: number[] = []
    const b: number[] = [0]
    for (let n = 0; n <= NMAX; n++) {
      a.push(integrate((x) => preset.u(x) * Math.cos(n * x), -PI, PI, 6000) / PI)
      if (n) b.push(integrate((x) => preset.u(x) * Math.sin(n * x), -PI, PI, 6000) / PI)
    }
    return { a, b, norm2: integrate((x) => preset.u(x) ** 2, -PI, PI, 6000) }
  }, [preset])

  const S: RFn = (x) => {
    let s = a[0] / 2
    for (let n = 1; n <= N; n++) s += a[n] * Math.cos(n * x) + b[n] * Math.sin(n * x)
    return s
  }

  const view: [number, number] = zoom === 'all' ? [-3 * PI, 3 * PI] : [PI - 0.9, PI + 0.9]
  const xs = linspace(view[0], view[1], 1400)
  // f a tratti: spezza la curva nei salti
  const fPts: [number, number][] = []
  xs.forEach((x, i) => {
    if (i && !preset.cont && Math.floor((x + PI) / (2 * PI)) !== Math.floor((xs[i - 1] + PI) / (2 * PI))) fPts.push([x, NaN])
    fPts.push([x, f(x)])
  })

  const parseval = PI * (a[0] ** 2 / 2 + a.slice(1, N + 1).reduce((s, v, i) => s + v * v + b[i + 1] ** 2, 0))
  const err2 = Math.sqrt(Math.max(0, norm2 - parseval))
  const grid = linspace(-PI + 1e-6, PI - 1e-6, 3000)
  const supErr = Math.max(...grid.map((x) => Math.abs(f(x) - S(x))))
  const coefPts: [number, number][] = []
  for (let n = 1; n <= NMAX; n++) {
    const m = Math.hypot(a[n], b[n])
    coefPts.push([Math.log10(n), m > 1e-9 ? Math.log10(m) : NaN])
  }
  const ref = (k: number): [number, number][] => [[0, 0.3], [Math.log10(NMAX), 0.3 - k * Math.log10(NMAX)]]

  return (
    <Widget
      title="Somme parziali della serie di Fourier"
      description="$S_N(x)=\frac{a_0}{2}+\sum_{n=1}^N\big(a_n\cos nx+b_n\sin nx\big)$ per l'estensione $2\pi$-periodica di $u$. I coefficienti sono calcolati numericamente con le formule $a_n=\frac1\pi\int_{-\pi}^{\pi}u\cos nx$, $b_n=\frac1\pi\int_{-\pi}^{\pi}u\sin nx$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>armoniche <M>N</M></>} value={N} min={0} max={NMAX} step={1} onChange={setN} display={N} />
          <Segmented value={zoom} onChange={setZoom} options={[{ value: 'all', label: 'tre periodi' }, { value: 'jump', label: 'zoom su x = π' }]} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <Panel label={`f periodica e S_N, N = ${N}`}>
        <Chart
          series={[
            { points: fPts, color: PALETTE.muted, width: 2, dash: '5 4' },
            { points: xs.map((x) => [x, S(x)]), color: PALETTE.violet, width: 2.3 },
          ]}
          x={view}
          y={preset.y}
          height={260}
          xTicks={zoom === 'all' ? [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ v: k * PI, label: k === 0 ? '0' : `${k === 1 ? '' : k === -1 ? '−' : String(k).replace('-', '−')}π` })) : undefined}
          marker={zoom === 'jump' ? PI : undefined}
        />
        <div className="mt-2">
          <Legend items={[{ color: PALETTE.muted, label: 'estensione periodica di u', dash: true }, { color: PALETTE.violet, label: 'S_N' }]} />
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel label="log₁₀ √(aₙ² + bₙ²)  vs  log₁₀ n">
          <Chart
            series={[
              { points: ref(1), color: PALETTE.muted, dash: '4 4', width: 1 },
              { points: ref(2), color: PALETTE.muted, dash: '2 5', width: 1 },
              { points: coefPts, color: PALETTE.gold, dots: true, r: 2.8 },
            ]}
            x={[0, Math.log10(NMAX)]}
            y={[-8, 1]}
            height={200}
            marker={N > 0 ? Math.log10(N) : undefined}
            xTicks={[1, 3, 10, 30].map((n) => ({ v: Math.log10(n), label: String(n) }))}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.muted, label: 'pendenze −1 (salto) e −2 (angolo)', dash: true }]} />
          </div>
        </Panel>
        <Stats
          items={[
            { label: '‖f − S_N‖₂ su un periodo', value: fmtNum(err2, 4), tone: 'good' },
            { label: 'sup |f − S_N|', value: fmtNum(supErr, 3), tone: preset.cont ? 'good' : 'bad' },
            { label: '‖f‖₂²', value: fmtNum(norm2, 4) },
            { label: 'π [a₀²/2 + Σ (aₙ² + bₙ²)]', value: fmtNum(parseval, 4), tone: 'accent' },
          ]}
        />
      </div>
      <Hint>{'Con le funzioni che saltano, aumenta $N$: l\'errore in $L^2$ va a zero (Parseval), il sup no. Riemann–Lebesgue garantisce solo $a_n,b_n\\to0$; quanto in fretta dipende dalla regolarità della funzione **periodica**: salto $\\Rightarrow 1/n$, angolo $\\Rightarrow 1/n^2$, liscia $\\Rightarrow$ più veloce di ogni potenza.'}</Hint>
    </Widget>
  )
}
