import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { bump, integrate, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

type Seq = { id: string; label: string; f: (n: number) => RFn; range: (n: number, lo: number, hi: number) => [number, number]; limit: string; target: (phi: RFn, dphi: RFn) => number; yMax: (n: number) => number; explain: string }
const SEQS: Seq[] = [
  { id: 'sin', label: 'sin(nx)', f: (n) => (x) => Math.sin(n * x), range: (_n, lo, hi) => [lo, hi], limit: '0', target: () => 0, yMax: () => 1.3, explain: '$\\sin(nx)$ non converge in nessun punto fuori da $\\pi\\Z$, eppure $T_{\\sin(nx)}\\to0$ in $\\mathcal D\'$: $\\int\\varphi\\sin(nx)=\\Im\\,\\hat\\varphi(-n/2\\pi)\\to0$ per Riemann–Lebesgue. Le oscillazioni veloci si cancellano contro ogni $\\varphi$ liscia.' },
  { id: 'nsin', label: 'n sin(nx)', f: (n) => (x) => n * Math.sin(n * x), range: (_n, lo, hi) => [lo, hi], limit: '0', target: () => 0, yMax: (n) => n * 1.2, explain: 'Ampiezza che **cresce** come $n$, eppure il limite è ancora 0: integrando per parti $\\int n\\sin(nx)\\varphi=\\int\\cos(nx)\\varphi\'\\to0$. Nel senso delle distribuzioni conta la media contro $\\varphi$, non il sup.' },
  { id: 'box', label: 'n · 1[0, 1/n]', f: (n) => (x) => (x >= 0 && x <= 1 / n ? n : 0), range: (n) => [0, 1 / n], limit: 'δ', target: (phi) => phi(0), yMax: (n) => n * 1.15, explain: 'Rettangoli di area 1 sempre più alti e stretti: $\\int_0^{1/n}n\\varphi\\to\\varphi(0)$, quindi $T_{f_n}\\to\\delta$. Puntualmente invece $f_n\\to0$ per $x\\neq0$: il limite puntuale perde tutta la massa.' },
  { id: 'dip', label: 'n² (1[0,1/n] − 1[−1/n,0])', f: (n) => (x) => (x >= 0 && x <= 1 / n ? n * n : x < 0 && x >= -1 / n ? -n * n : 0), range: (n) => [-1 / n, 1 / n], limit: '−δ′', target: (_phi, dphi) => dphi(0), yMax: (n) => n * n * 1.15, explain: 'Un **dipolo**: due rettangoli opposti di area $\\pm n$. Le aree esplodono, ma $\\int f_n\\varphi=n^2\\int_0^{1/n}\\big(\\varphi(x)-\\varphi(-x)\\big)dx\\to\\varphi\'(0)=\\langle-\\delta\',\\varphi\\rangle$. Il limite non è né una funzione né una misura.' },
]

export default function WeakConvergenceLab() {
  const [sid, setSid] = useState('sin')
  const s = SEQS.find((q) => q.id === sid)!
  const [n, setN] = useState(6)
  const [c, setC] = useState(0.3)
  const w = 1.3
  const phi: RFn = (x) => bump((x - c) / w) * (1 + 0.5 * x)
  const dphi: RFn = (x) => (phi(x + 1e-5) - phi(x - 1e-5)) / 2e-5
  const lo = c - w
  const hi = c + w
  const pairing = (k: number) => {
    const [a, b] = s.range(k, lo, hi)
    const A = Math.max(a, lo)
    const B = Math.min(b, hi)
    if (B <= A) return 0
    if (s.id === 'dip') return integrate((x) => s.f(k)(x) * phi(x), Math.max(-1 / k, lo), Math.min(0, hi) - 1e-12, 2000) + integrate((x) => s.f(k)(x) * phi(x), Math.max(0, lo), Math.min(1 / k, hi), 2000)
    return integrate((x) => s.f(k)(x) * phi(x), A, B, Math.max(2000, k * 200))
  }
  const val = pairing(n)
  const target = s.target(phi, dphi)
  const curve = useMemo(() => Array.from({ length: 40 }, (_, k): [number, number] => [k + 1, pairing(k + 1)]), [s, c])
  const xs = linspace(-2, 2, 2000)
  const fn = s.f(n)
  const yM = s.yMax(n)
  const ys = curve.map((p) => p[1])

  return (
    <Widget
      title="Convergenza in 𝒟′"
      description="$T_n\to T$ in $\mathcal D'$ se $\langle T_n,\varphi\rangle\to\langle T,\varphi\rangle$ per ogni funzione test. A sinistra $f_n$ (scala adattata) e la funzione test $\varphi$; a destra il numero $\int f_n\varphi$ al variare di $n$, con il valore limite tratteggiato."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={sid} onChange={setSid} options={SEQS.map((q) => ({ value: q.id, label: `fₙ = ${q.label}  →  ${q.limit}` }))} />
          <Slider label={<>indice <M>n</M></>} value={n} min={1} max={40} step={1} onChange={setN} display={n} />
          <Slider label={<>centro di <M>\varphi</M></>} value={c} min={-0.9} max={0.9} step={0.01} onChange={setC} display={fmtNum(c)} />
        </div>
        <Explain>{s.explain}</Explain>
      </div>
      <TwoPanels>
        <Panel label={`f_n (n = ${n}) e φ riscalata`}>
          <Chart
            series={[
              { points: xs.map((x) => [x, fn(x)]), color: PALETTE.violet, width: 1.4 },
              { points: xs.map((x) => [x, phi(x) * yM * 0.6]), color: PALETTE.gold, width: 2.2, dash: '5 4' },
            ]}
            x={[-2, 2]}
            y={[-yM, yM]}
            height={240}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.violet, label: 'fₙ' }, { color: PALETTE.gold, label: 'φ (scala ridotta)', dash: true }]} />
          </div>
        </Panel>
        <Panel label="⟨T_fn, φ⟩ al variare di n">
          <Chart
            series={[
              { points: [[0, target], [41, target]], color: PALETTE.green, dash: '5 4', width: 1.5 },
              { points: curve, color: PALETTE.gold, dots: true, r: 3 },
              { points: [[n, val]], color: PALETTE.pink, dots: true, r: 6 },
            ]}
            x={[0, 41]}
            y={[Math.min(target, ...ys) - 0.15, Math.max(target, ...ys) + 0.15]}
            height={240}
            marker={n}
          />
        </Panel>
      </TwoPanels>
      <Stats
        items={[
          { label: '⟨T_fn, φ⟩', value: fmtNum(val, 5), tone: 'accent' },
          { label: `⟨${s.limit}, φ⟩`, value: fmtNum(target, 5) },
          { label: 'scarto', value: fmtNum(val - target, 4) },
          { label: 'sup |fₙ|', value: fmtNum(({ sin: 1, nsin: n, box: n, dip: n * n } as Record<string, number>)[s.id], 4) },
        ]}
      />
      <Hint>{'La convergenza in $\\mathcal D\'$ si conserva per derivazione: se $T_n\\to T$ allora $T_n\'\\to T\'$, perché $\\langle T_n\',\\varphi\\rangle=-\\langle T_n,\\varphi\'\\rangle$ e $\\varphi\'$ è ancora una funzione test. Per esempio $-\\cos(nx)/n\\to0$ e la sua derivata è $\\sin(nx)$.'}</Hint>
    </Widget>
  )
}
