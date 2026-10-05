import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { integrate, linspace, mollifier, normP, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../../components/ui'

type Preset = { id: string; label: string; f: RFn; jumps: number[]; explain: string }
const PRESETS: Preset[] = [
  { id: 'ind', label: '1[0,1]', f: (x) => (x >= 0 && x <= 1 ? 1 : 0), jumps: [0, 1], explain: 'L\'indicatrice ha due salti di altezza 1. Vicino a ogni salto $f_\\varepsilon$ passa per il valore $\\tfrac12$, quindi $\\|f-f_\\varepsilon\\|_\\infty=\\tfrac12$ per ogni $\\varepsilon$: in $L^\\infty$ nessuna funzione continua la approssima. In $L^p$ con $p<\\infty$ invece l\'errore è concentrato su intervalli di lunghezza $\\sim\\varepsilon$, e tende a 0.' },
  { id: 'saw', label: 'dente di sega', f: (x) => (x >= -1 && x < 1 ? (x + 1) / 2 : 0), jumps: [1], explain: 'Un salto solo in $x=1$ (in $-1$ la funzione è continua ma ha un angolo). Gli angoli vengono smussati con errore $O(\\varepsilon)$ anche in norma del sup, i salti no.' },
  { id: 'abs', label: '(1 − |x|)⁺ (continua)', f: (x) => Math.max(0, 1 - Math.abs(x)), jumps: [], explain: 'Continua e a supporto compatto: qui $f_\\varepsilon\\to f$ **uniformemente**, perché la convoluzione con un mollificatore è una media su intervalli di raggio $\\varepsilon$ e $f$ è uniformemente continua.' },
  { id: 'sing', label: '|x|^(−1/3) su [−1, 1]', f: (x) => (Math.abs(x) <= 1 && x !== 0 ? Math.pow(Math.abs(x), -1 / 3) : 0), jumps: [-1, 1], explain: 'Illimitata in 0 ma in $L^p(\\R)$ per $p<3$. Le $f_\\varepsilon$ sono $C^\\infty$ e limitate, eppure si avvicinano a $f$ in $L^1$ e $L^2$: la densità non richiede che $f$ sia limitata.' },
]

const A = 2.5

export default function MollifierLab() {
  const [pid, setPid] = useState('ind')
  const preset = PRESETS.find((p) => p.id === pid)!
  const [le, setLe] = useState(-0.7)
  const eps = Math.pow(10, le)
  const rho = useMemo(() => mollifier(eps), [eps])

  const xs = useMemo(() => linspace(-A, A, 501), [])
  const fe = useMemo(() => {
    const vals = xs.map((x) => integrate((y) => preset.f(x - y) * rho(y), -eps, eps, 400))
    return (x: number) => {
      const t = ((x + A) / (2 * A)) * (xs.length - 1)
      const i = Math.min(xs.length - 2, Math.max(0, Math.floor(t)))
      return vals[i] + (vals[i + 1] - vals[i]) * (t - i)
    }
  }, [preset, rho, eps, xs])

  const err: RFn = (x) => preset.f(x) - fe(x)
  const e1 = normP(err, -A, A, 1, 6000)
  const e2 = normP(err, -A, A, 2, 6000)
  // il sup si legge sui salti (dove l'errore vale ~1/2 del salto) e sul resto della griglia
  const eInf = Math.max(normP(err, -A, A, Infinity, 5000), ...preset.jumps.map((j) => Math.max(Math.abs(err(j - 1e-9)), Math.abs(err(j + 1e-9)))))
  const top = pid === 'sing' ? 4 : 1.3

  return (
    <Widget
      title="Densità delle funzioni test in Lᵖ: il mollificatore"
      description="$f_\varepsilon=f*\rho_\varepsilon$, dove $\rho_\varepsilon(x)=\varepsilon^{-1}\rho(x/\varepsilon)$ è la funzione test $e^{-1/(1-x^2)}$ riscalata e normalizzata ad avere integrale 1. Ogni $f_\varepsilon$ è $C^\infty$ e, se $f$ ha supporto compatto, ha supporto compatto. Rimpicciolisci $\varepsilon$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>raggio <M>\varepsilon</M></>} value={le} min={-2} max={0} step={0.01} onChange={setLe} display={fmtNum(eps, 3)} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <Panel label={`f e f_ε = f ∗ ρ_ε, ε = ${fmtNum(eps, 3)}`}>
        <Chart
          series={[
            { points: xs.map((x) => [x, preset.f(x)]), color: PALETTE.muted, width: 1.5, dash: '5 4' },
            { points: xs.map((x) => [x, Math.min(top * 0.95, rho(x) * 0.25 * eps)]), color: PALETTE.gold, width: 1.2, fill: 0.15 },
            { points: xs.map((x) => [x, fe(x)]), color: PALETTE.violet, width: 2.5 },
          ]}
          x={[-A, A]}
          y={[-0.1, top]}
          height={260}
        />
        <div className="mt-2">
          <Legend items={[{ color: PALETTE.muted, label: 'f', dash: true }, { color: PALETTE.violet, label: 'f_ε (C∞)' }, { color: PALETTE.gold, label: 'ρ_ε (scala ridotta)' }]} />
        </div>
      </Panel>
      <Panel label="errore f − f_ε">
        <Chart series={[{ points: xs.map((x) => [x, err(x)]), color: PALETTE.pink, width: 1.8, fill: 0.2 }]} x={[-A, A]} y={[-0.8, 0.8]} height={140} />
      </Panel>
      <Stats
        items={[
          { label: '‖f − f_ε‖₁', value: fmtNum(e1, 4), tone: 'good' },
          { label: '‖f − f_ε‖₂', value: fmtNum(e2, 4), tone: 'good' },
          { label: '‖f − f_ε‖∞', value: fmtNum(eInf, 3), tone: preset.jumps.length ? 'bad' : 'good' },
          { label: 'supp ρ_ε', value: `[−${fmtNum(eps, 3)}, ${fmtNum(eps, 3)}]` },
        ]}
      />
      <Hint>{'Dimezzando $\\varepsilon$ l\'errore in $L^1$ si dimezza circa (salti: area $\\sim\\varepsilon$), quello in $L^2$ scala come $\\sqrt\\varepsilon$, quello in $L^\\infty$ non si muove. È la ragione per cui il teorema di densità vale per $p\\in[1,\\infty)$ ed è falso per $p=\\infty$.'}</Hint>
    </Widget>
  )
}
