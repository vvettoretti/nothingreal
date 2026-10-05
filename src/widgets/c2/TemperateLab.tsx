import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { bump, integrate, linspace } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

const dbump = (x: number) => (Math.abs(x) < 1 ? (bump(x) * -2 * x) / (1 - x * x) ** 2 : 0)
const DB_L1 = integrate((x) => Math.abs(dbump(x)), -1, 1, 4000)

type F = { id: string; label: string; f: (x: number) => number; tempered: boolean; log10Pair: (j: number) => number; bound?: boolean; explain: string }
const FS: F[] = [
  { id: 'exp', label: 'eˣ', f: Math.exp, tempered: false, log10Pair: (j) => Math.log10(Math.exp(j / 2) * integrate((y) => Math.exp(y) * bump(y), -1, 1, 2000)), explain: '$\\langle e^x,\\varphi_j\\rangle=e^{j/2}\\int e^y\\chi(y)dy\\to+\\infty$ mentre $\\varphi_j\\to0$ in $\\mathcal S$. Quindi $e^x$ definisce una distribuzione ($e^x\\in L^1_{loc}$) ma **non** temperata: cresce troppo per essere controllata dal decadimento rapido.' },
  { id: 'poly', label: 'x²', f: (x) => x ** 2, tempered: true, log10Pair: (j) => Math.log10(Math.exp(-j / 2) * integrate((y) => (y + j) ** 2 * bump(y), -1, 1, 2000)), explain: 'Un polinomio è a crescita lenta: $|x^2|\\le(1+|x|)^2$. Contro $\\varphi_j$ il fattore $e^{-j/2}$ vince su $j^2$ e il pairing tende a 0, come deve per un elemento di $\\mathcal S\'$.' },
  { id: 'osc', label: 'eˣ cos(eˣ)', f: (x) => Math.exp(x) * Math.cos(Math.exp(x)), tempered: true, bound: true, log10Pair: (j) => Math.log10(Math.exp(-j / 2) * DB_L1), explain: 'Cresce come $e^x$ in ampiezza, eppure **è** temperata: è la derivata di $\\sin(e^x)$, che è limitata, e le derivate di distribuzioni temperate sono temperate. Integrando per parti $|\\langle f,\\varphi_j\\rangle|=|\\langle\\sin e^x,\\varphi_j\'\\rangle|\\le\\|\\varphi_j\'\\|_1\\to0$. Crescita lenta è sufficiente, non necessaria.' },
]

export default function TemperateLab() {
  const [fid, setFid] = useState('exp')
  const F = FS.find((q) => q.id === fid)!
  const [j, setJ] = useState(4)
  const phiJ = (x: number) => Math.exp(-j / 2) * bump(x - j)
  const xs = linspace(j - 1.5, j + 1.5, 1500)
  const curve = useMemo(() => Array.from({ length: 25 }, (_, k): [number, number] => [k, F.log10Pair(k)]), [F])
  const sem = (k: number) => Math.exp(-j / 2) * Math.max(...linspace(j - 1, j + 1, 801).map((x) => Math.abs(x) ** k * bump(x - j)))
  const pair = Math.pow(10, F.log10Pair(j))
  const fMax = Math.max(...xs.map((x) => Math.abs(F.f(x)) * phiJ(x)))

  return (
    <Widget
      title="Distribuzioni temperate: chi passa il test?"
      description="$\varphi_j(x)=e^{-j/2}\chi(x-j)$, con $\chi$ funzione test fissata. Per ogni $k$ si ha $\sup|x|^k|\varphi_j|\sim j^ke^{-j/2}\to0$ (e lo stesso per le derivate), quindi $\varphi_j\to0$ in $\mathcal S(\R)$. Una $T\in\mathcal S'$ deve dare $\langle T,\varphi_j\rangle\to0$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={fid} onChange={setFid} options={FS.map((q) => ({ value: q.id, label: 'f(x) = ' + q.label }))} />
          <Slider label={<>indice <M>j</M></>} value={j} min={0} max={24} step={1} onChange={setJ} display={j} />
        </div>
        <Explain>{F.explain}</Explain>
      </div>
      <TwoPanels>
        <Panel label={`φ_j e f · φ_j vicino a x = ${j} (normalizzati)`}>
          <Chart
            series={[
              { points: xs.map((x) => [x, phiJ(x) / (Math.exp(-j / 2) * Math.exp(-1))]), color: PALETTE.gold, width: 2, dash: '5 4' },
              ...(F.id === 'osc' && j > 3 ? [] : [{ points: xs.map((x) => [x, (F.f(x) * phiJ(x)) / (fMax || 1)] as [number, number]), color: PALETTE.pink, width: 1.4, fill: 0.2 }]),
            ]}
            x={[j - 1.5, j + 1.5]}
            y={[-1.1, 1.1]}
            height={220}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.gold, label: 'φ_j / max', dash: true }, { color: PALETTE.pink, label: 'f φ_j / max' }]} />
          </div>
        </Panel>
        <Panel label={F.bound ? 'log₁₀ della stima ‖φ_j′‖₁ di |⟨f, φ_j⟩|' : 'log₁₀ |⟨f, φ_j⟩| al variare di j'}>
          <Chart
            series={[
              { points: [[0, 0], [24, 0]], color: PALETTE.muted, dash: '4 4', width: 1 },
              { points: curve, color: F.tempered ? PALETTE.green : PALETTE.red, width: 2.2 },
              { points: [[j, F.log10Pair(j)]], color: PALETTE.pink, dots: true, r: 6 },
            ]}
            x={[0, 24]}
            y={[-6, 6]}
            height={220}
            marker={j}
          />
        </Panel>
      </TwoPanels>
      <Stats
        items={[
          { label: 'sup |x|² |φ_j|', value: fmtNum(sem(2), 4), tone: 'good' },
          { label: F.bound ? '|⟨f, φ_j⟩| ≤' : '⟨f, φ_j⟩', value: fmtNum(pair, 4), tone: F.tempered ? 'good' : 'bad' },
          { label: 'f ∈ 𝒮′ ?', value: F.tempered ? 'sì' : 'no', tone: F.tempered ? 'good' : 'bad' },
        ]}
      />
      <Hint>{'Il test qui sopra dimostra solo il "no": per $e^x$ basta una successione che va a 0 in $\\mathcal S$ e su cui il pairing esplode. Per il "sì" serve un argomento per tutte le $\\varphi$: crescita lenta più Hölder per $x^2$, integrazione per parti per $e^x\\cos e^x$.'}</Hint>
    </Widget>
  )
}
