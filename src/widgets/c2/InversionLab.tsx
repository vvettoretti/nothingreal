import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { integrate, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

const PI = Math.PI
const sinc = (t: number) => (Math.abs(t) < 1e-9 ? 1 : Math.sin(PI * t) / (PI * t))

type Preset = { id: string; label: string; f: RFn; re: RFn; im: RFn; hatL1: number; explain: string }
const PRESETS: Preset[] = [
  { id: 'box', label: '1[−1,1]', f: (x) => (Math.abs(x) < 1 ? 1 : Math.abs(x) === 1 ? 0.5 : 0), re: (k) => 2 * sinc(2 * k), im: () => 0, hatL1: Infinity, explain: '$\\hat f\\notin L^1$, quindi il teorema di inversione **non si applica**: e non potrebbe, perché $f$ non è continua mentre $\\int\\hat f e^{2\\pi i\\xi x}$, se convergesse assolutamente, sarebbe continua. Le ricostruzioni troncate oscillano vicino ai salti (Gibbs) e in $x=\\pm1$ convergono a $\\tfrac12$.' },
  { id: 'tri', label: 'triangolo', f: (x) => Math.max(0, 1 - Math.abs(x)), re: (k) => sinc(k) ** 2, im: () => 0, hatL1: 1, explain: '$f$ continua, $\\hat f=\\mathrm{sinc}^2\\in L^1$: l\'inversione vale **in ogni punto** e la convergenza è uniforme. Restano visibili solo gli angoli, che si arrotondano lentamente.' },
  { id: 'gau', label: 'gaussiana', f: (x) => Math.exp(-PI * x * x), re: (k) => Math.exp(-PI * k * k), im: () => 0, hatL1: 1, explain: 'Nello spazio di Schwartz tutto funziona al meglio: $\\hat f\\in\\mathcal S$, la coda di $\\hat f$ è trascurabile già per $R\\approx2$ e $f_R\\to f$ uniformemente con velocità superesponenziale.' },
  { id: 'abs', label: 'e^(−|x|)', f: (x) => Math.exp(-Math.abs(x)), re: (k) => 2 / (1 + 4 * PI * PI * k * k), im: () => 0, hatL1: 1, explain: '$\\hat f(\\xi)=\\frac{2}{1+4\\pi^2\\xi^2}\\in L^1$: l\'inversione vale ovunque. La cuspide in 0 viene ricostruita per ultima, perché è lì che servono le alte frequenze.' },
  { id: 'one', label: 'e^(−x) H(x)', f: (x) => (x > 0 ? Math.exp(-x) : x === 0 ? 0.5 : 0), re: (k) => 1 / (1 + 4 * PI * PI * k * k), im: (k) => (-2 * PI * k) / (1 + 4 * PI * PI * k * k), hatL1: Infinity, explain: '$|\\hat f(\\xi)|\\sim\\frac1{2\\pi|\\xi|}$ non è integrabile, coerentemente con il salto di $f$ in 0. Il limite delle ricostruzioni nel salto è di nuovo la media $\\tfrac12$.' },
]

export default function InversionLab() {
  const [pid, setPid] = useState('box')
  const p = PRESETS.find((q) => q.id === pid)!
  const [lR, setLR] = useState(0.3)
  const R = Math.pow(10, lR)

  const xs = useMemo(() => linspace(-3, 3, 481), [])
  const fR = useMemo(() => {
    const n = Math.max(300, Math.ceil(R * 50))
    // f_R(x) = ∫_{−R}^{R} f̂(ξ) e^{2πiξx} dξ, parte reale
    return xs.map((x) => integrate((k) => p.re(k) * Math.cos(2 * PI * k * x) - p.im(k) * Math.sin(2 * PI * k * x), -R, R, n))
  }, [p, R, xs])
  const errs = xs.map((x, i) => p.f(x) - fR[i])
  const supErr = Math.max(...errs.filter((_, i) => p.id === 'tri' || p.id === 'gau' || p.id === 'abs' || Math.min(...[-1, 0, 1].map((j) => Math.abs(xs[i] - j))) > 0.02).map(Math.abs))
  const l2 = Math.sqrt(errs.reduce((s, e) => s + e * e, 0) * (xs[1] - xs[0]))
  const tailL1 = Number.isFinite(p.hatL1) ? p.hatL1 - integrate((k) => Math.hypot(p.re(k), p.im(k)), -R, R, 4000) : Infinity
  const mid = p.id === 'box' ? fR[xs.findIndex((x) => Math.abs(x - 1) < 1e-9)] : p.id === 'one' ? fR[xs.findIndex((x) => Math.abs(x) < 1e-9)] : null

  return (
    <Widget
      title="Ricostruire f dalla sua trasformata"
      description="$f_R(x)=\int_{-R}^{R}\hat f(\xi)\,e^{2\pi i\xi x}\,d\xi$ usa solo le frequenze $|\xi|\le R$. A destra la trasformata con la finestra $[-R,R]$ evidenziata. Se $\hat f\in L^1$, per $R\to\infty$ si ritrova $f$ in ogni punto."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((q) => ({ value: q.id, label: 'f(x) = ' + q.label }))} />
          <Slider label={<>banda <M>R</M></>} value={lR} min={-0.5} max={1.5} step={0.01} onChange={setLR} display={fmtNum(R, 2)} />
        </div>
        <Explain>{p.explain}</Explain>
      </div>
      <TwoPanels>
        <Panel label={`f e f_R, R = ${fmtNum(R, 2)}`}>
          <Chart
            series={[
              { points: xs.map((x) => [x, p.f(x)]), color: PALETTE.muted, width: 2, dash: '5 4' },
              { points: xs.map((x, i) => [x, fR[i]]), color: PALETTE.violet, width: 2.4 },
            ]}
            x={[-3, 3]}
            y={[-0.25, 1.3]}
            height={240}
          />
        </Panel>
        <Panel label="|f̂(ξ)| e la finestra [−R, R]">
          <Chart
            series={[{ points: linspace(-6, 6, 900).map((k) => [k, Math.hypot(p.re(k), p.im(k))]), color: PALETTE.pink, width: 2, fill: 0.15 }]}
            x={[-6, 6]}
            y={[0, 2.1]}
            height={240}
            band={{ from: -R, to: R, color: PALETTE.violet }}
          />
        </Panel>
      </TwoPanels>
      <div className="mt-1">
        <Legend items={[{ color: PALETTE.muted, label: 'f', dash: true }, { color: PALETTE.violet, label: 'f_R' }, { color: PALETTE.pink, label: '|f̂|' }]} />
      </div>
      <Stats
        items={[
          { label: 'sup |f − f_R| (lontano dai salti)', value: fmtNum(supErr, 4) },
          { label: '‖f − f_R‖₂ su [−3, 3]', value: fmtNum(l2, 4), tone: 'good' },
          { label: 'coda: ∫ |f̂| per |ξ| > R', value: Number.isFinite(tailL1) ? fmtNum(tailL1, 4) : '∞ (f̂ ∉ L¹)', tone: Number.isFinite(tailL1) ? 'good' : 'bad' },
          ...(mid !== null ? [{ label: p.id === 'box' ? 'f_R(1)  →  1/2' : 'f_R(0)  →  1/2', value: fmtNum(mid ?? 0, 4), tone: 'accent' as const }] : []),
        ]}
      />
      <Hint>{'Per ogni $x$ si ha $|f(x)-f_R(x)|\\le\\int_{|\\xi|>R}|\\hat f|$: quando $\\hat f\\in L^1$ la coda va a zero e la convergenza è uniforme. È anche il motivo per cui $f$ deve essere (q.o. uguale a una funzione) continua.'}</Hint>
    </Widget>
  )
}
