import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { bump, BUMP_MASS, integrate, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

type Kernel = { id: string; label: string; rho: (e: number) => RFn; range?: (e: number) => [number, number]; explain: string }
const KERNELS: Kernel[] = [
  { id: 'box', label: '(1/ε) 1[0, ε]', rho: (e) => (x) => (x >= 0 && x <= e ? 1 / e : 0), range: (e) => [0, e], explain: '$\\langle T_{\\rho_\\varepsilon},\\varphi\\rangle=\\frac1\\varepsilon\\int_0^\\varepsilon\\varphi$ è la **media** di $\\varphi$ su $[0,\\varepsilon]$, che tende a $\\varphi(0)$ per continuità. Non serve che il nucleo sia simmetrico, né liscio.' },
  { id: 'gau', label: 'gaussiana di varianza ε²', rho: (e) => (x) => Math.exp(-(x * x) / (2 * e * e)) / (e * Math.sqrt(2 * Math.PI)), range: (e) => [-9 * e, 9 * e], explain: 'Massa 1, sempre più concentrata. Non ha supporto compatto ma va bene lo stesso: conta solo che la massa fuori da ogni intorno di 0 tenda a zero.' },
  { id: 'bump', label: 'mollificatore ρ_ε', rho: (e) => (x) => bump(x / e) / (e * BUMP_MASS), range: (e) => [-e, e], explain: 'Il mollificatore della pagina sulla densità. Ogni $\\rho_\\varepsilon$ è una funzione test, eppure il limite $\\delta$ non è una funzione: $\\mathcal D\'$ contiene oggetti più singolari delle funzioni.' },
  { id: 'osc', label: 'sin(x/ε) / (πx)', rho: (e) => (x) => (Math.abs(x) < 1e-12 ? 1 / (Math.PI * e) : Math.sin(x / e) / (Math.PI * x)), explain: 'Il nucleo di Dirichlet continuo: **non** positivo, non integrabile in modulo, e non si concentra (le code oscillano senza sparire). Eppure $\\int\\frac{\\sin(x/\\varepsilon)}{\\pi x}\\varphi(x)dx\\to\\varphi(0)$: la convergenza in $\\mathcal D\'$ è molto debole.' },
]

export default function DeltaLab() {
  const [kid, setKid] = useState('gau')
  const K = KERNELS.find((k) => k.id === kid)!
  const [le, setLe] = useState(-0.6)
  const eps = Math.pow(10, le)
  const [c, setC] = useState(0.4)
  const [w, setW] = useState(1.6)
  // funzione test: bump centrata in c, larghezza w, con un'oscillazione per renderla meno banale
  const phi: RFn = (x) => bump((x - c) / w) * (1 + 0.5 * Math.cos(3 * x))
  const rho = K.rho(eps)
  const lo = Math.min(-4, c - w)
  const hi = Math.max(4, c + w)
  const pairing = (e: number) => {
    const [a, b] = K.range ? K.range(e) : [lo, hi]
    return integrate((x) => K.rho(e)(x) * phi(x), a, b, K.range ? 2000 : Math.max(3000, Math.ceil(80 / e)))
  }
  const pair = pairing(eps)
  const xs = linspace(-3, 3, 1200)

  const curve = useMemo(() => {
    const out: [number, number][] = []
    for (let k = 0; k <= 60; k++) {
      const l = -2.2 + (k / 60) * 2.2
      const e = Math.pow(10, l)
      out.push([l, pairing(e)])
    }
    return out
  }, [K, c, w])
  const yTop = Math.min(6, Math.max(2, 1.2 / eps))

  return (
    <Widget
      title="La delta di Dirac come limite"
      description="$\rho_\varepsilon$ ha integrale 1 e si concentra in 0. Come funzioni non convergono a niente (in 0 esplodono, altrove vanno a 0), ma **come distribuzioni** sì: $\langle T_{\rho_\varepsilon},\varphi\rangle=\int\rho_\varepsilon\varphi\to\varphi(0)=\langle\delta,\varphi\rangle$ per ogni funzione test. L'area rosa è $\int\rho_\varepsilon\varphi$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={kid} onChange={setKid} options={KERNELS.map((k) => ({ value: k.id, label: 'ρ_ε = ' + k.label }))} />
          <Slider label={<><M>\varepsilon</M></>} value={le} min={-2.2} max={0} step={0.01} onChange={setLe} display={fmtNum(eps, 3)} />
          <div className="flex gap-4">
            <Slider label={<>centro di <M>\varphi</M></>} value={c} min={-1.5} max={1.5} step={0.01} onChange={setC} display={fmtNum(c)} />
            <Slider label={<>supporto di <M>\varphi</M></>} value={w} min={0.6} max={2.5} step={0.01} onChange={setW} display={fmtNum(w)} />
          </div>
        </div>
        <Explain>{K.explain}</Explain>
      </div>
      <TwoPanels>
        <Panel label={`ρ_ε, φ e ρ_ε φ  (ε = ${fmtNum(eps, 3)})`}>
          <Chart
            series={[
              { points: xs.map((x) => [x, rho(x) * phi(x)]), color: PALETTE.pink, width: 1.2, fill: 0.3 },
              { points: xs.map((x) => [x, rho(x)]), color: PALETTE.gold, width: 1.8 },
              { points: xs.map((x) => [x, phi(x)]), color: PALETTE.violet, width: 2.4 },
            ]}
            x={[-3, 3]}
            y={[kid === 'osc' ? -yTop * 0.3 : -0.1, yTop]}
            height={250}
            marker={0}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.violet, label: 'φ' }, { color: PALETTE.gold, label: 'ρ_ε' }, { color: PALETTE.pink, label: 'ρ_ε φ' }]} />
          </div>
        </Panel>
        <Panel label="⟨T_ρε, φ⟩ al variare di ε  (ε → 0 a sinistra)">
          <Chart
            series={[
              { points: [[-2.2, phi(0)], [0, phi(0)]], color: PALETTE.green, dash: '5 4', width: 1.5 },
              { points: curve, color: PALETTE.gold, width: 2.2 },
              { points: [[le, pair]], color: PALETTE.pink, dots: true, r: 6 },
            ]}
            x={[-2.2, 0]}
            y={[Math.min(-0.1, ...curve.map((p) => p[1])) - 0.1, Math.max(phi(0), ...curve.map((p) => p[1])) + 0.2]}
            height={250}
            xTicks={[-2, -1, 0].map((v) => ({ v, label: `ε=10^${v}` }))}
          />
        </Panel>
      </TwoPanels>
      <Stats
        items={[
          { label: '⟨T_ρε, φ⟩ = ∫ ρ_ε φ', value: fmtNum(pair, 5), tone: 'accent' },
          { label: '⟨δ, φ⟩ = φ(0)', value: fmtNum(phi(0), 5) },
          { label: 'scarto', value: fmtNum(pair - phi(0), 4), tone: Math.abs(pair - phi(0)) < 1e-2 ? 'good' : undefined },
          { label: 'ρ_ε(0)', value: fmtNum(rho(0), 3) },
        ]}
      />
      <Hint>{'Sposta il supporto di $\\varphi$ in modo che non contenga 0: il limite è 0, come deve essere ($\\varphi(0)=0$). La $\\delta$ "vede" solo il valore nel punto, ed è per questo che non può essere $T_f$ per nessuna $f\\in L^1_{loc}$: un punto ha misura nulla.'}</Hint>
    </Widget>
  )
}
