import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { integrate, linspace } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

const PI = Math.PI
const f = (x: number) => x / (1 + x * x)
/** f̂(ξ) = −πi sgn(ξ) e^{−2π|ξ|}: restituisce la parte immaginaria. */
const hatIm = (k: number) => -PI * Math.sign(k) * Math.exp(-2 * PI * Math.abs(k))

export default function L2TruncLab() {
  const [lR, setLR] = useState(1)
  const R = Math.pow(10, lR)
  const ks = useMemo(() => linspace(-1.2, 1.2, 241), [])
  // g_R(ξ) = ∫_{−R}^{R} f(x) e^{−2πixξ} dx: f è dispari, quindi resta solo −2i ∫_0^R f(x) sin(2πxξ) dx
  const gR = useMemo(() => {
    const n = Math.max(1000, Math.ceil(R * 60))
    return ks.map((k) => -2 * integrate((x) => f(x) * Math.sin(2 * PI * x * k), 0, R, n))
  }, [R, ks])
  const dk = ks[1] - ks[0]
  const l2err = Math.sqrt(ks.reduce((s, k, i) => s + (gR[i] - hatIm(k)) ** 2 * dk, 0))
  const i0 = ks.findIndex((k) => Math.abs(k - 0.25) < 1e-9)
  const l1R = 2 * Math.log(Math.sqrt(1 + R * R))

  return (
    <Widget
      title="Trasformata in L² come limite di troncate"
      description="$f(x)=\frac{x}{1+x^2}$ sta in $L^2(\R)$ ma non in $L^1(\R)$: l'integrale che definisce $\hat f$ non converge assolutamente. Si tronca, $g_R(\xi)=\int_{-R}^{R}f(x)e^{-2\pi ix\xi}dx$, e si passa al limite in $L^2$. Il limite calcolato con i residui è $\hat f(\xi)=-\pi i\,\mathrm{sgn}(\xi)\,e^{-2\pi|\xi|}$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <Slider label={<>troncamento <M>R</M></>} value={lR} min={0} max={2.3} step={0.01} onChange={setLR} display={fmtNum(R, 1)} />
        <Explain>{'$f$ è dispari e reale, quindi $\\hat f$ è immaginaria pura e dispari. Il salto in $\\xi=0$ (da $\\pi i$ a $-\\pi i$) è il prezzo del decadimento lento $1/x$ di $f$: la trasformata di una funzione $L^1$ sarebbe continua, questa no. Ogni $g_R$ è continua e vale 0 in $\\xi=0$; il salto compare solo al limite.'}</Explain>
      </div>
      <TwoPanels>
        <Panel label="f(x) e la finestra [−R, R]">
          <Chart
            series={[{ points: linspace(-30, 30, 900).map((x) => [x, f(x)]), color: PALETTE.violet, width: 2.2 }]}
            x={[-30, 30]}
            y={[-0.6, 0.6]}
            height={220}
            band={{ from: -R, to: R, color: PALETTE.violet }}
          />
        </Panel>
        <Panel label="Im g_R(ξ) e Im f̂(ξ)">
          <Chart
            series={[
              { points: ks.map((k) => [k, k === 0 ? NaN : hatIm(k)]), color: PALETTE.muted, width: 2, dash: '5 4' },
              { points: ks.map((k, i) => [k, gR[i]]), color: PALETTE.pink, width: 2.3 },
            ]}
            x={[-1.2, 1.2]}
            y={[-3.6, 3.6]}
            height={220}
          />
        </Panel>
      </TwoPanels>
      <div className="mt-1">
        <Legend items={[{ color: PALETTE.muted, label: '−π sgn(ξ) e^(−2π|ξ|)', dash: true }, { color: PALETTE.pink, label: 'Im g_R' }]} />
      </div>
      <Stats
        items={[
          { label: '‖g_R − f̂‖₂ su [−1.2, 1.2]', value: fmtNum(l2err, 4), tone: 'good' },
          { label: 'g_R(0)', value: '0' },
          { label: 'Im g_R(1/4)  →  −π e^(−π/2)', value: `${fmtNum(gR[i0], 4)} → ${fmtNum(hatIm(0.25), 4)}`, tone: 'accent' },
          { label: '∫ |f| su [−R, R] = log(1 + R²)', value: fmtNum(l1R, 3), tone: 'bad' },
        ]}
      />
      <Hint>{'L\'ultima colonna cresce senza limite: è il motivo per cui la definizione $L^1$ non si applica. La convergenza di $g_R$ è garantita in $L^2$ (Plancherel: $\\|g_R-\\hat f\\|_2=\\|f\\mathbf 1_{|x|>R}\\|_2\\to0$); che converga anche puntualmente qui lo si verifica a parte, con i residui.'}</Hint>
    </Widget>
  )
}
