import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { gradient, PALETTE } from '../../lib/color'
import { bump, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../../components/ui'

type Seq = { id: string; label: string; phi: (j: number) => RFn; supp: (j: number) => [number, number]; inD: boolean; explain: string }
const SEQS: Seq[] = [
  { id: 'pow', label: 'φⱼ(x) = xʲ φ(x)', phi: (j) => (x) => Math.pow(x, j) * bump(x), supp: () => [-1, 1], inD: true, explain: 'Tutti i supporti stanno nel compatto fisso $K=[-1,1]$, e $\\varphi_j$ e tutte le derivate tendono a 0 uniformemente (le derivate crescono un po\' all\'inizio, poi crollano). Quindi $\\varphi_j\\to0$ **in** $\\mathcal D(\\R)$.' },
  { id: 'spread', label: 'φⱼ(x) = φ(x/j) / j', phi: (j) => (x) => bump(x / j) / j, supp: (j) => [-j, j], inD: false, explain: '$\\varphi_j\\to0$ uniformemente su $\\R$ insieme a tutte le derivate, ma $\\mathrm{supp}\\,\\varphi_j=[-j,j]$ **scappa all\'infinito**: non esiste un compatto $K$ che li contenga tutti. Quindi $\\varphi_j\\not\\to0$ in $\\mathcal D(\\R)$.' },
  { id: 'move', label: 'φⱼ(x) = φ(x − j) / j', phi: (j) => (x) => bump(x - j) / j, supp: (j) => [j - 1, j + 1], inD: false, explain: 'Altezza $\\to0$ e supporto di lunghezza fissa, ma il supporto **trasla** verso l\'infinito: di nuovo manca un compatto comune. Ed è giusto così: $T=\\sum_{k\\ge1}k\\,\\delta_k$ è una distribuzione (su ogni compatto la somma è finita), ma $\\langle T,\\varphi_j\\rangle=j\\cdot\\frac{\\varphi(0)}{j}=e^{-1}$ per ogni $j$. Se $\\varphi_j\\to0$ in $\\mathcal D$, $T$ non sarebbe continua.' },
  { id: 'narrow', label: 'φⱼ(x) = φ(j x)', phi: (j) => (x) => bump(j * x), supp: (j) => [-1 / j, 1 / j], inD: false, explain: 'I supporti si restringono (ok, stanno in $[-1,1]$) e $\\sup|\\varphi_j|=e^{-1}$ resta fisso: nemmeno la convergenza uniforme a 0 vale. In più $\\sup|\\varphi_j\'|$ cresce come $j$. Non converge a 0 in $\\mathcal D$, né a nient\'altro.' },
]

function supAbs(f: RFn, a: number, b: number, n = 4000) {
  let m = 0
  for (let k = 0; k <= n; k++) m = Math.max(m, Math.abs(f(a + ((b - a) * k) / n)))
  return m
}

export default function TestFunctionLab() {
  const [sid, setSid] = useState('pow')
  const s = SEQS.find((q) => q.id === sid)!
  const [j, setJ] = useState(4)
  const phi = s.phi(j)
  const [a, b] = s.supp(j)
  const h = 1e-3 * Math.max(1e-2, (b - a) / 2)
  const d1: RFn = (x) => (phi(x + h) - phi(x - h)) / (2 * h)
  const d2: RFn = (x) => (phi(x + h) - 2 * phi(x) + phi(x - h)) / (h * h)
  const view: [number, number] = sid === 'spread' ? [-14, 14] : sid === 'move' ? [-2, 14] : [-1.5, 1.5]
  const xs = useMemo(() => linspace(view[0], view[1], 1200), [view[0], view[1]])
  const prev = [1, 2, 3, 5, 8, 12].filter((k) => k < j).slice(-4)

  const s0 = supAbs(phi, a, b)
  const s1 = supAbs(d1, a, b)
  const s2 = supAbs(d2, a, b)

  return (
    <Widget
      title="Convergenza nello spazio delle funzioni test"
      description="$\varphi(x)=e^{-1/(1-x^2)}$ su $(-1,1)$, nulla fuori: è $C^\infty$ (tutte le derivate in $\pm1$ sono nulle) e ha supporto compatto. $\varphi_j\to0$ in $\mathcal D(\R)$ se i supporti stanno in **un compatto fisso** e **ogni derivata** tende a 0 uniformemente. La banda colorata è il supporto di $\varphi_j$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={sid} onChange={setSid} options={SEQS.map((q) => ({ value: q.id, label: q.label }))} />
          <Slider label={<>indice <M>j</M></>} value={j} min={1} max={12} step={1} onChange={setJ} display={j} />
        </div>
        <Explain>{s.explain}</Explain>
      </div>
      <Panel label={`φ_j, j = ${j}`}>
        <Chart
          series={[
            ...prev.map((k, i) => ({ points: xs.map((x) => [x, s.phi(k)(x)] as [number, number]), color: gradient(i / 5), width: 1.1, dash: '3 4' })),
            { points: xs.map((x) => [x, phi(x)]), color: PALETTE.pink, width: 2.6, fill: 0.15 },
          ]}
          x={view}
          y={[sid === 'pow' ? -0.25 : -0.05, 0.42]}
          height={240}
          band={{ from: a, to: b, color: PALETTE.gold }}
        />
        <div className="mt-2">
          <Legend items={[{ color: PALETTE.pink, label: 'φ_j' }, { color: gradient(0.3), label: 'termini precedenti', dash: true }]} />
        </div>
      </Panel>
      <Stats
        items={[
          { label: 'supp φ_j', value: `[${fmtNum(a, 2)}, ${fmtNum(b, 2)}]` },
          { label: 'sup |φ_j|', value: fmtNum(s0, 4) },
          { label: 'sup |φ_j′|', value: fmtNum(s1, 4) },
          { label: 'sup |φ_j″|', value: fmtNum(s2, 4) },
          { label: 'φ_j → 0 in 𝒟?', value: s.inD ? 'sì' : 'no', tone: s.inD ? 'good' : 'bad' },
        ]}
      />
      <Hint>{'Con $x^j\\varphi$ le derivate impiegano un po\' a scendere: la derivata di $x^j$ porta un fattore $j$, che però viene battuto da $(1-\\delta)^j$ lontano dal bordo e dalla piattezza di $\\varphi$ vicino al bordo. Porta $j$ a 12 e guarda i tre sup.'}</Hint>
    </Widget>
  )
}
