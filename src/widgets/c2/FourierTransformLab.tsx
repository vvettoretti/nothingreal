import { useMemo, useState } from 'react'
import { abs, exp, fmt, fmtNum, mul, scale, type Complex } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { integrate, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../../components/ui'

const PI = Math.PI
const sinc = (t: number) => (Math.abs(t) < 1e-9 ? 1 : Math.sin(PI * t) / (PI * t))

type Preset = { id: string; label: string; f: RFn; hat: (xi: number) => Complex; l1: number; decay: string; explain: string }
const PRESETS: Preset[] = [
  { id: 'box', l1: 2, label: '1[−1,1]', f: (x) => (Math.abs(x) <= 1 ? 1 : 0), hat: (k) => [2 * sinc(2 * k), 0], decay: '1/ξ', explain: '$\\hat f(\\xi)=\\frac{\\sin 2\\pi\\xi}{\\pi\\xi}$: reale e pari come $f$, continua anche se $f$ salta, e infinitesima (Riemann–Lebesgue). Ma decade solo come $1/|\\xi|$, quindi $\\hat f\\notin L^1$: la trasformata **non preserva** l\'integrabilità. Essendo $f$ a supporto compatto, $\\hat f$ è $C^\\infty$.' },
  { id: 'tri', l1: 1, label: 'triangolo (1 − |x|)⁺', f: (x) => Math.max(0, 1 - Math.abs(x)), hat: (k) => [sinc(k) ** 2, 0], decay: '1/ξ²', explain: 'Il triangolo è $\\mathbf 1_{[-1/2,1/2]}*\\mathbf 1_{[-1/2,1/2]}$, quindi la trasformata è un sinc **al quadrato** (trasformata della convoluzione = prodotto). Ora $f$ è continua e $\\hat f\\in L^1$.' },
  { id: 'gau', l1: 1, label: 'gaussiana e^(−πx²)', f: (x) => Math.exp(-PI * x * x), hat: (k) => [Math.exp(-PI * k * k), 0], decay: 'più veloce di ogni potenza', explain: '$e^{-\\pi x^2}$ è **punto fisso** della trasformata: $\\hat f=f$. Con $\\alpha$ generico, $\\widehat{e^{-\\alpha x^2}}=\\sqrt{\\pi/\\alpha}\\,e^{-\\pi^2\\xi^2/\\alpha}$: dilata e guarda la trasformata stringersi. Una gaussiana è in $\\mathcal S$ e la sua trasformata pure.' },
  { id: 'abs', l1: 2, label: 'e^(−|x|)', f: (x) => Math.exp(-Math.abs(x)), hat: (k) => [2 / (1 + 4 * PI * PI * k * k), 0], decay: '1/ξ²', explain: '$\\hat f(\\xi)=\\frac{2}{1+4\\pi^2\\xi^2}$: l\'angolo in $x=0$ si paga con un decadimento solo $1/\\xi^2$. Viceversa $f$ decade esponenzialmente e quindi $\\hat f$ è analitica (anche se qui si vede solo che è liscia).' },
  { id: 'one', l1: 1, label: 'e^(−x) H(x)', f: (x) => (x >= 0 ? Math.exp(-x) : 0), hat: (k) => { const d = 1 + 4 * PI * PI * k * k; return [1 / d, (-2 * PI * k) / d] }, decay: '1/ξ', explain: 'Né pari né dispari: $\\hat f(\\xi)=\\frac1{1+2\\pi i\\xi}$ è complessa, con parte reale pari e parte immaginaria dispari ($\\hat f(-\\xi)=\\overline{\\hat f(\\xi)}$ perché $f$ è reale). Il salto in 0 dà di nuovo decadimento $1/\\xi$.' },
  { id: 'lor', l1: PI, label: '1/(1 + x²)', f: (x) => 1 / (1 + x * x), hat: (k) => [PI * Math.exp(-2 * PI * Math.abs(k)), 0], decay: 'esponenziale', explain: 'Si calcola con i residui (capitolo 1): $\\hat f(\\xi)=\\pi e^{-2\\pi|\\xi|}$. È il "duale" di $e^{-|x|}$: ruoli scambiati tra decadimento e regolarità. L\'angolo ora è in $\\hat f$, perché $f$ decade solo come $1/x^2$ e già $xf\\notin L^1$.' },
]

const A = 60

export default function FourierTransformLab() {
  const [pid, setPid] = useState('box')
  const p = PRESETS.find((q) => q.id === pid)!
  const [la, setLa] = useState(0)
  const a = Math.pow(2, la)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)

  // g(x) = e^{2πicx} f(a(x − b))  ⇒  ĝ(ξ) = (1/a) e^{−2πib(ξ−c)} f̂((ξ−c)/a)
  const g = (x: number): Complex => scale(exp([0, 2 * PI * c * x]), p.f(a * (x - b)))
  const ghat = (xi: number): Complex => scale(mul(exp([0, -2 * PI * b * (xi - c)]), p.hat((xi - c) / a)), 1 / a)

  const xs = linspace(-6, 6, 900)
  const ks = linspace(-3, 3, 900)
  const gx = xs.map(g)
  const gk = ks.map(ghat)
  const top = Math.max(1.1, ...gk.map(abs)) * 1.1

  // finestra di integrazione proporzionale alla scala 1/a, centrata in b
  const lo = b - A / a
  const hi = b + A / a
  // ‖g‖₁ = ‖f‖₁ / a (cambio di variabile), noto in forma chiusa per ogni preset
  const l1 = p.l1 / a
  const intRe = useMemo(() => integrate((x) => g(x)[0], lo, hi, 20000), [p, a, b, c])
  const intIm = useMemo(() => integrate((x) => g(x)[1], lo, hi, 20000), [p, a, b, c])
  const supHat = Math.max(...gk.map(abs))

  const decay = useMemo(() => {
    const out: [number, number][] = []
    for (let k = 0; k <= 400; k++) {
      const lx = -1 + (k / 400) * 3
      const m = abs(p.hat(Math.pow(10, lx)))
      out.push([lx, m > 1e-14 ? Math.log10(m) : NaN])
    }
    return out
  }, [p])

  return (
    <Widget
      title="La trasformata di Fourier e le sue regole"
      description="$\hat g(\xi)=\int g(x)e^{-2\pi i\xi x}dx$ con $g(x)=e^{2\pi i c x}f\big(a(x-b)\big)$: una funzione base dilatata di $a$, traslata di $b$ e modulata con frequenza $c$. Linea continua = parte reale, tratteggio = parte immaginaria, grigio = modulo."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((q) => ({ value: q.id, label: 'f(x) = ' + q.label }))} />
          <Slider label={<>dilatazione <M>a</M></>} value={la} min={-1.5} max={2} step={0.01} onChange={setLa} display={fmtNum(a, 2)} />
          <Slider label={<>traslazione <M>b</M></>} value={b} min={-3} max={3} step={0.01} onChange={setB} display={fmtNum(b)} />
          <Slider label={<>modulazione <M>c</M></>} value={c} min={-2} max={2} step={0.01} onChange={setC} display={fmtNum(c)} />
        </div>
        <Explain>{p.explain}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="g(x)">
          <Chart
            series={[
              { points: xs.map((x, i) => [x, abs(gx[i])]), color: PALETTE.muted, width: 1.2 },
              { points: xs.map((x, i) => [x, gx[i][1]]), color: PALETTE.gold, width: 1.6, dash: '4 3' },
              { points: xs.map((x, i) => [x, gx[i][0]]), color: PALETTE.violet, width: 2.3 },
            ]}
            x={[-6, 6]}
            y={[-1.15, 1.15]}
            height={230}
          />
        </Panel>
        <Panel label="ĝ(ξ)">
          <Chart
            series={[
              { points: ks.map((k, i) => [k, abs(gk[i])]), color: PALETTE.muted, width: 1.2 },
              { points: ks.map((k, i) => [k, gk[i][1]]), color: PALETTE.gold, width: 1.6, dash: '4 3' },
              { points: ks.map((k, i) => [k, gk[i][0]]), color: PALETTE.pink, width: 2.3 },
            ]}
            x={[-3, 3]}
            y={[-top, top]}
            height={230}
            marker={c}
          />
        </Panel>
      </div>
      <div className="mt-1">
        <Legend items={[{ color: PALETTE.violet, label: 'Re g' }, { color: PALETTE.pink, label: 'Re ĝ' }, { color: PALETTE.gold, label: 'Im', dash: true }, { color: PALETTE.muted, label: 'modulo' }]} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel label={`decadimento: log₁₀|f̂(ξ)| vs log₁₀ ξ  (${p.decay})`}>
          <Chart
            series={[
              { points: [[-1, 0.3], [2, -2.7]], color: PALETTE.muted, dash: '4 4', width: 1 },
              { points: [[-1, 0.3], [2, -5.7]], color: PALETTE.muted, dash: '2 5', width: 1 },
              { points: decay, color: PALETTE.gold, width: 1.8 },
            ]}
            x={[-1, 2]}
            y={[-8, 1]}
            height={190}
            xTicks={[-1, 0, 1, 2].map((v) => ({ v, label: `10^${v}` }))}
          />
        </Panel>
        <Stats
          items={[
            { label: '‖g‖₁ = ‖f‖₁ / a', value: fmtNum(l1, 4) },
            { label: 'sup |ĝ|  ≤  ‖g‖₁', value: `${fmtNum(supHat, 4)} ≤ ${fmtNum(l1, 4)}`, tone: 'good' },
            { label: '∫ g (numerico)', value: fmt([intRe, intIm], 4) },
            { label: 'ĝ(0) (formula)', value: fmt(ghat(0), 4), tone: 'accent' },
          ]}
        />
      </div>
      <Hint>{'Le tre regole: **dilatare** $f(ax)$ dà $\\frac1a\\hat f(\\xi/a)$, quindi stringere in $x$ allarga in $\\xi$. **Traslare** di $b$ moltiplica per $e^{-2\\pi i b\\xi}$: il modulo non cambia, la fase ruota (guarda Re e Im oscillare). **Modulare** con $e^{2\\pi icx}$ trasla la trasformata in $c$. La stima $\\sup|\\hat g|\\le\\|g\\|_1$ è la continuità di $\\mathcal F:L^1\\to L^\\infty$.'}</Hint>
    </Widget>
  )
}
