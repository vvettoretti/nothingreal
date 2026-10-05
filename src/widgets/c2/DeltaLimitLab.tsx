import { useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { integrate, linspace } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Segmented, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

const PI = Math.PI
type Mode = 'exp' | 'cos'

export default function DeltaLimitLab() {
  const [mode, setMode] = useState<Mode>('exp')
  const [a, setA] = useState(0.8)
  const [lR, setLR] = useState(0.3)
  const R = Math.pow(10, lR)
  const win = (x: number) => Math.exp(-PI * (x / R) ** 2)
  // f_R = e^{2πiax}·w_R  ⇒  f̂_R(ξ) = R e^{−πR²(ξ−a)²}
  const g = (k: number) => R * Math.exp(-PI * R * R * k * k)
  const hat = (k: number) => (mode === 'exp' ? g(k - a) : (g(k - a) + g(k + a)) / 2)
  const phi = (k: number) => Math.exp(-((k - 0.3) ** 2) / 0.8) * (1 + 0.6 * Math.sin(2 * k))
  const target = mode === 'exp' ? phi(a) : (phi(a) + phi(-a)) / 2
  const pair = integrate((k) => hat(k) * phi(k), -6, 6, Math.max(3000, Math.ceil(R * 400)))
  const xs = linspace(-8, 8, 1600)
  const ks = linspace(-3, 3, 1500)
  const top = Math.max(1.5, R * 1.1)

  return (
    <Widget
      title="La trasformata di un’onda pura è una delta"
      description="$e^{2\pi iax}$ non è integrabile, quindi la sua trasformata esiste solo in $\mathcal S'$. Moltiplicandola per una finestra gaussiana larga $R$ si ottiene una funzione $L^1$ con trasformata $R\,e^{-\pi R^2(\xi-a)^2}$: una campana di area 1 centrata in $a$, sempre più alta e stretta. Per $R\to\infty$ il pairing con una funzione test tende a $\varphi(a)$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Segmented value={mode} onChange={setMode} options={[{ value: 'exp', label: 'e^(2πiax)' }, { value: 'cos', label: 'cos(2πax)' }]} />
          <Slider label={<>frequenza <M>a</M></>} value={a} min={0} max={2} step={0.01} onChange={setA} display={fmtNum(a)} />
          <Slider label={<>larghezza della finestra <M>R</M></>} value={lR} min={-0.3} max={1.3} step={0.01} onChange={setLR} display={fmtNum(R, 2)} />
        </div>
        <Explain>
          {mode === 'exp'
            ? 'Con $a=0$ la funzione è la costante 1 e il limite è $\\hat 1=\\delta$, coerente con $\\hat\\delta=1$ e l\'inversione $\\hat{\\hat\\delta}=\\delta^\\vee=\\delta$. Per $a\\neq0$ la modulazione trasla: $\\mathcal F(e^{2\\pi iax})=\\delta_a$. Una sola frequenza pura, un solo punto nello spettro.'
            : '$\\cos(2\\pi ax)=\\frac{e^{2\\pi iax}+e^{-2\\pi iax}}2$, quindi per linearità $\\mathcal F(\\cos 2\\pi ax)=\\frac{\\delta_a+\\delta_{-a}}2$: due picchi simmetrici di peso $\\tfrac12$. Una funzione reale e pari ha trasformata reale e pari anche in $\\mathcal S\'$.'}
        </Explain>
      </div>
      <TwoPanels>
        <Panel label="Re f_R(x) = finestra · onda">
          <Chart
            series={[
              { points: xs.map((x) => [x, win(x)]), color: PALETTE.muted, width: 1.2, dash: '4 4' },
              { points: xs.map((x) => [x, Math.cos(2 * PI * a * x) * win(x)]), color: PALETTE.violet, width: 1.8 },
            ]}
            x={[-8, 8]}
            y={[-1.15, 1.15]}
            height={230}
          />
        </Panel>
        <Panel label="f̂_R(ξ) e la funzione test φ">
          <Chart
            series={[
              { points: ks.map((k) => [k, phi(k)]), color: PALETTE.gold, width: 2, dash: '5 4' },
              { points: ks.map((k) => [k, hat(k)]), color: PALETTE.pink, width: 2.2, fill: 0.2 },
            ]}
            spikes={R > 8 ? (mode === 'exp' ? [{ x: a, y: top * 0.9, color: PALETTE.green, label: 'δₐ' }] : [{ x: a, y: top * 0.5, color: PALETTE.green, label: '½δₐ' }, { x: -a, y: top * 0.5, color: PALETTE.green, label: '½δ₋ₐ' }]) : []}
            x={[-3, 3]}
            y={[-0.1, top]}
            height={230}
          />
        </Panel>
      </TwoPanels>
      <div className="mt-1">
        <Legend items={[{ color: PALETTE.violet, label: 'Re f_R' }, { color: PALETTE.pink, label: 'f̂_R' }, { color: PALETTE.gold, label: 'φ', dash: true }]} />
      </div>
      <Stats
        items={[
          { label: 'altezza del picco', value: fmtNum(mode === 'exp' ? R : R / 2, 3) },
          { label: 'larghezza ~ 1/R', value: fmtNum(1 / R, 3) },
          { label: '⟨f̂_R, φ⟩', value: fmtNum(pair, 5), tone: 'accent' },
          { label: mode === 'exp' ? 'φ(a)' : '(φ(a) + φ(−a)) / 2', value: fmtNum(target, 5) },
        ]}
      />
      <Hint>{'È lo stesso meccanismo della pagina sulle distribuzioni: una famiglia di funzioni di area 1 che si concentra converge a una delta in $\\mathcal D\'$. Qui viene dalla regola di dilatazione: allargare la finestra in $x$ stringe la campana in $\\xi$. Più a lungo ascolti un segnale, più precisamente ne misuri la frequenza.'}</Hint>
    </Widget>
  )
}
