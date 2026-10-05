import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { gradient, PALETTE } from '../../lib/color'
import { integrate, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Segmented, Select, Slider, Stats, Widget } from '../../components/ui'

type Basis = 'leg' | 'trig'

/** k-esimo elemento del sistema ortonormale in L²(−1, 1). */
function basisFn(b: Basis, k: number): RFn {
  if (b === 'trig') {
    if (k === 0) return () => 1 / Math.SQRT2
    const m = Math.ceil(k / 2)
    return k % 2 ? (x) => Math.cos(m * Math.PI * x) : (x) => Math.sin(m * Math.PI * x)
  }
  const c = Math.sqrt((2 * k + 1) / 2)
  return (x) => {
    // ricorrenza di Bonnet per i polinomi di Legendre
    let p0 = 1
    let p1 = x
    if (k === 0) return c
    for (let j = 1; j < k; j++) {
      const p2 = ((2 * j + 1) * x * p1 - j * p0) / (j + 1)
      p0 = p1
      p1 = p2
    }
    return c * p1
  }
}

const TARGETS: { id: string; label: string; f: RFn }[] = [
  { id: 'abs', label: '|x|', f: (x) => Math.abs(x) },
  { id: 'sgn', label: 'sgn x', f: (x) => Math.sign(x) },
  { id: 'exp', label: 'eˣ', f: (x) => Math.exp(x) },
  { id: 'step', label: '1 se x > 0.3', f: (x) => (x > 0.3 ? 1 : 0) },
  { id: 'bump', label: 'cos²(πx/2) + x/2', f: (x) => Math.cos((Math.PI * x) / 2) ** 2 + x / 2 },
]

const KMAX = 24

export default function ProjectionLab() {
  const [basis, setBasis] = useState<Basis>('leg')
  const [tid, setTid] = useState('abs')
  const [m, setM] = useState(4)
  const f = TARGETS.find((t) => t.id === tid)!.f

  const { E, c, norm2 } = useMemo(() => {
    const E = Array.from({ length: KMAX }, (_, k) => basisFn(basis, k))
    const c = E.map((e) => integrate((x) => f(x) * e(x), -1, 1, 4000))
    const norm2 = integrate((x) => f(x) ** 2, -1, 1, 4000)
    return { E, c, norm2 }
  }, [basis, f])

  const P: RFn = (x) => {
    let s = 0
    for (let k = 0; k < m; k++) s += c[k] * E[k](x)
    return s
  }
  const xs = linspace(-1, 1, 601)
  const bessel = c.slice(0, m).reduce((s, v) => s + v * v, 0)
  const err2 = integrate((x) => (f(x) - P(x)) ** 2, -1, 1, 4000)
  const orth = m > 0 ? integrate((x) => (f(x) - P(x)) * E[m - 1](x), -1, 1, 4000) : 0

  const bars = c.map((v, k) => ({ x: k, y: v * v, color: k < m ? gradient(k / KMAX) : '#3a3944' }))
  const cum: [number, number][] = c.map((_, k) => [k, c.slice(0, k + 1).reduce((s, v) => s + v * v, 0)])
  const top = Math.max(norm2 * 1.08, 0.2)

  return (
    <Widget
      title="Proiezione ortogonale e disuguaglianza di Bessel"
      description="In $H=L^2(-1,1)$ si proietta $f$ sul sottospazio $V_m$ generato dai primi $m$ elementi di un sistema ortonormale: $P_{V_m}f=\sum_{k<m}\langle f,e_k\rangle e_k$ è il punto di $V_m$ più vicino a $f$. A destra i quadrati dei coefficienti $|\langle f,e_k\rangle|^2$, che si accumulano senza mai superare $\|f\|^2$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Segmented value={basis} onChange={setBasis} options={[{ value: 'leg', label: 'Legendre (polinomi)' }, { value: 'trig', label: 'trigonometrico' }]} />
          <Select value={tid} onChange={setTid} options={TARGETS.map((t) => ({ value: t.id, label: 'f(x) = ' + t.label }))} />
          <Slider label={<>dimensione <M>m</M> di <M>V_m</M></>} value={m} min={0} max={KMAX} step={1} onChange={setM} display={m} />
        </div>
        <Explain>
          {basis === 'leg'
            ? 'I polinomi di Legendre normalizzati $\\sqrt{\\tfrac{2k+1}2}P_k$ sono ciò che si ottiene applicando Gram–Schmidt a $1,x,x^2,\\dots$ in $L^2(-1,1)$. $P_{V_m}f$ è il polinomio di grado $<m$ più vicino a $f$ **in media quadratica**, non quello di Taylor.'
            : 'Il sistema trigonometrico con $L=1$: $\\tfrac1{\\sqrt2},\\cos(\\pi x),\\sin(\\pi x),\\cos(2\\pi x),\\dots$ La proiezione è la somma parziale della serie di Fourier. Per $e^x$ guarda gli estremi: l\'estensione periodica salta, e la proiezione fatica proprio lì.'}
        </Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={`f e P_{V_m} f, m = ${m}`}>
          <Chart
            series={[
              { points: xs.map((x) => [x, f(x)]), color: PALETTE.muted, width: 2, dash: '5 4' },
              { points: xs.map((x) => [x, f(x) - P(x)]), color: PALETTE.pink, width: 1.2, fill: 0.18 },
              { points: xs.map((x) => [x, P(x)]), color: PALETTE.violet, width: 2.5 },
            ]}
            x={[-1, 1]}
            y={tid === 'exp' ? [-0.6, 3] : [-1.3, 1.5]}
            height={260}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.muted, label: 'f', dash: true }, { color: PALETTE.violet, label: 'P f' }, { color: PALETTE.pink, label: 'f − P f (⊥ V_m)' }]} />
          </div>
        </Panel>
        <Panel label="|⟨f, e_k⟩|² e somme parziali">
          <Chart
            series={[
              { points: [[-0.5, norm2], [KMAX - 0.5, norm2]], color: PALETTE.green, dash: '5 4', width: 1.5 },
              { points: cum.slice(0, Math.max(1, m)), color: PALETTE.gold, width: 2 },
            ]}
            bars={bars}
            x={[-0.5, KMAX - 0.5]}
            y={[0, top]}
            height={260}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.green, label: '‖f‖²', dash: true }, { color: PALETTE.gold, label: 'Σ |⟨f, e_k⟩|² per k < m' }]} />
          </div>
        </Panel>
      </div>
      <Stats
        items={[
          { label: '‖f‖²', value: fmtNum(norm2, 4) },
          { label: 'Σ |⟨f, e_k⟩|² (Bessel)', value: fmtNum(bessel, 4), tone: 'accent' },
          { label: '‖f − Pf‖²  =  ‖f‖² − Σ', value: `${fmtNum(err2, 4)} = ${fmtNum(norm2 - bessel, 4)}` },
          { label: m > 0 ? `⟨f − Pf, e_${m - 1}⟩` : '⟨f − Pf, e_k⟩', value: m > 0 ? fmtNum(orth, 4) : '—', tone: 'good' },
        ]}
      />
      <Hint>{'L\'identità $\\|f-P_{V_m}f\\|^2=\\|f\\|^2-\\sum_{k<m}|\\langle f,e_k\\rangle|^2$ è Pitagora applicato a $f=P f+(f-Pf)$ con i due pezzi ortogonali. Entrambi i sistemi qui sono **completi**, quindi lo scarto tende a 0 e la disuguaglianza di Bessel diventa l\'uguaglianza di Parseval.'}</Hint>
    </Widget>
  )
}
