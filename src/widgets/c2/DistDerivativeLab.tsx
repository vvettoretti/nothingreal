import { useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { bump, integrate, linspace, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

type Preset = { id: string; label: string; f: RFn; df: RFn; jumps: (lo: number, hi: number) => { x: number; h: number }[]; explain: string }
const frac = (x: number) => x - Math.floor(x)
const PRESETS: Preset[] = [
  { id: 'abs', label: '|x|', f: Math.abs, df: Math.sign, jumps: () => [], explain: 'Continua con un punto angoloso: nessun salto, quindi $(T_{|x|})\'=T_{\\mathrm{sgn}}$. La derivata distribuzionale coincide con quella quasi ovunque. Derivando ancora, $\\mathrm{sgn}$ salta di 2 in 0 e $(T_{|x|})\'\'=2\\delta$.' },
  { id: 'H', label: 'Heaviside H(x)', f: (x) => (x > 0 ? 1 : 0), df: () => 0, jumps: () => [{ x: 0, h: 1 }], explain: 'La derivata quasi ovunque è 0, ma $\\langle T_H\',\\varphi\\rangle=-\\int_0^\\infty\\varphi\'=\\varphi(0)$: tutta la derivata è concentrata nel salto, $T_H\'=\\delta$. La parte "a.e." da sola darebbe 0, il che è falso.' },
  { id: 'step', label: 'gradino −½ / 1 in x₀ = 0.8', f: (x) => (x > 0.8 ? 1 : -0.5), df: () => 0, jumps: () => [{ x: 0.8, h: 1.5 }], explain: 'Un gradino da $k_2=-\\tfrac12$ a $k_1=1$: $(T_f)\'=(k_1-k_2)\\delta_{x_0}=\\tfrac32\\delta_{0.8}$. Conta l\'altezza **con segno** del salto.' },
  { id: 'mix', label: 'x²/2 per x < 0, 1 − x/2 per x ≥ 0', f: (x) => (x < 0 ? 0.5 * x * x : 1 - x / 2), df: (x) => (x < 0 ? x : -0.5), jumps: () => [{ x: 0, h: 1 }], explain: '$C^1$ a tratti con un salto: la regola generale dà $(T_f)\'=T_{f\'}+\\big(f(0^+)-f(0^-)\\big)\\delta_0$, con $f\'$ la derivata quasi ovunque. Muovi $\\varphi$: quando il suo supporto non contiene 0 il contributo del salto sparisce.' },
  { id: 'saw', label: 'dente di sega x − ⌊x⌋ − ½', f: (x) => frac(x) - 0.5, df: () => 1, jumps: (lo, hi) => { const out = []; for (let k = Math.ceil(lo); k <= Math.floor(hi); k++) out.push({ x: k, h: -1 }); return out }, explain: 'Pendenza 1 ovunque e un salto di $-1$ in ogni intero: $(T_f)\'=1-\\sum_{k\\in\\Z}\\delta_k$. La parte regolare e quella singolare si compensano in media (la funzione è periodica e limitata).' },
]

export default function DistDerivativeLab() {
  const [pid, setPid] = useState('mix')
  const p = PRESETS.find((q) => q.id === pid)!
  const [c, setC] = useState(0.2)
  const [w, setW] = useState(1.2)
  const phi: RFn = (x) => bump((x - c) / w) * (1 + 0.4 * Math.sin(2 * x))
  const dphi: RFn = (x) => (phi(x + 1e-5) - phi(x - 1e-5)) / 2e-5
  const lo = c - w
  const hi = c + w
  const jumps = p.jumps(lo, hi).filter((j) => j.x > lo && j.x < hi)
  // integra a pezzi spezzando nei salti
  // si spezza anche in 0, dove |x| ha l'angolo (lì f′ salta)
  const cuts = [lo, ...new Set([...jumps.map((j) => j.x), ...(lo < 0 && hi > 0 ? [0] : [])])].concat(hi).sort((a, b) => a - b)
  const piece = (g: RFn) => cuts.slice(1).reduce((s, b, i) => s + integrate(g, cuts[i] + 1e-9, b - 1e-9, 3000), 0)
  const lhs = -piece((x) => p.f(x) * dphi(x))
  const reg = piece((x) => p.df(x) * phi(x))
  const sing = jumps.reduce((s, j) => s + j.h * phi(j.x), 0)

  const xs = linspace(-2.5, 2.5, 1001)
  const brk = (g: RFn): [number, number][] => {
    const out: [number, number][] = []
    xs.forEach((x, i) => {
      if (i && Math.abs(g(x) - g(xs[i - 1])) > 0.3) out.push([x, NaN])
      out.push([x, g(x)])
    })
    return out
  }
  const allJumps = p.jumps(-2.5, 2.5)

  return (
    <Widget
      title="Derivata nel senso delle distribuzioni"
      description="$\langle T_f',\varphi\rangle:=-\langle T_f,\varphi'\rangle=-\int f\varphi'$. Per $f$ di classe $C^1$ a tratti il conto si spezza in una parte regolare $\int f'\varphi$ (derivata quasi ovunque) più un contributo $\big(f(x_i^+)-f(x_i^-)\big)\varphi(x_i)$ per ogni salto. Le frecce rosa sono le delta, con l'altezza del salto."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((q) => ({ value: q.id, label: 'f(x) = ' + q.label }))} />
          <div className="flex gap-4">
            <Slider label={<>centro di <M>\varphi</M></>} value={c} min={-1.5} max={1.5} step={0.01} onChange={setC} display={fmtNum(c)} />
            <Slider label={<>raggio di <M>\varphi</M></>} value={w} min={0.3} max={1.5} step={0.01} onChange={setW} display={fmtNum(w)} />
          </div>
        </div>
        <Explain>{p.explain}</Explain>
      </div>
      <TwoPanels>
        <Panel label="f, la sua derivata distribuzionale e φ">
          <Chart
            series={[
              { points: xs.map((x) => [x, phi(x)]), color: PALETTE.gold, width: 1.5, dash: '4 3', fill: 0.08 },
              { points: brk(p.f), color: PALETTE.muted, width: 2 },
              { points: brk(p.df), color: PALETTE.violet, width: 2.4 },
            ]}
            spikes={allJumps.map((j) => ({ x: j.x, y: j.h, color: PALETTE.pink, label: `${fmtNum(j.h)}δ` }))}
            x={[-2.5, 2.5]}
            y={[-1.4, 1.8]}
            height={260}
            band={{ from: lo, to: hi, color: PALETTE.gold }}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.muted, label: 'f' }, { color: PALETTE.violet, label: 'f′ quasi ovunque' }, { color: PALETTE.pink, label: 'salti · δ' }, { color: PALETTE.gold, label: 'φ', dash: true }]} />
          </div>
        </Panel>
        <Panel label="−f φ′: la sua area è ⟨T_f′, φ⟩">
          <Chart
            series={[{ points: brk((x) => (x > lo && x < hi ? -p.f(x) * dphi(x) : 0)), color: PALETTE.pink, width: 1.8, fill: 0.25 }]}
            x={[-2.5, 2.5]}
            y={[-3, 3]}
            height={260}
            band={{ from: lo, to: hi, color: PALETTE.gold }}
          />
        </Panel>
      </TwoPanels>
      <Stats
        items={[
          { label: '−∫ f φ′  (definizione)', value: fmtNum(lhs, 5), tone: 'accent' },
          { label: '∫ f′ φ  (parte a.e.)', value: fmtNum(reg, 5) },
          { label: 'Σ salti · φ(xᵢ)', value: fmtNum(sing, 5) },
          { label: 'somma delle due', value: fmtNum(reg + sing, 5), tone: Math.abs(reg + sing - lhs) < 1e-3 ? 'good' : 'bad' },
        ]}
      />
      <Hint>{'Prova il dente di sega con un supporto largo, che contenga due interi: la parte regolare vale $\\int\\varphi$, ogni salto toglie un $\\varphi(k)$. La formula vale anche per $\\varphi$ che non tocca i salti, ma lì i salti non si vedono: le distribuzioni sono **locali**.'}</Hint>
    </Widget>
  )
}
