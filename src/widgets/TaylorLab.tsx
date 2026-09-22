import { useMemo, useState } from 'react'
import { abs, add, dist, fmt, fmtNum, laurentCoeffs, mul, polar, sub, type Complex } from '../lib/complex'
import { compile } from '../lib/parse'
import { domainColor, PALETTE } from '../lib/color'
import { Circle, Cross, Handle, Plane, Seg, type View } from '../components/Plane'
import { Chart, Legend } from '../components/Chart'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../components/ui'

type Preset = { id: string; label: string; expr: string; sing: Complex[]; cut?: boolean; explain: string }
const H = Math.PI / 2
const PRESETS: Preset[] = [
  { id: 'lor', label: '1/(1 + z²)', expr: '1/(1+z^2)', sing: [[0, 1], [0, -1]], explain: 'Sull\'asse reale $\\frac1{1+x^2}$ è $C^\\infty$, limitata e senza problemi apparenti, eppure la serie di Maclaurin $\\sum(-1)^nx^{2n}$ converge solo per $|x|<1$. Il motivo sta fuori dall\'asse reale: i poli in $\\pm i$.' },
  { id: 'geo', label: '1/(1 − z)', expr: '1/(1-z)', sing: [[1, 0]], explain: 'La serie geometrica. Sposta il centro $z_0$: il raggio diventa $|1-z_0|$, sempre la distanza dal polo.' },
  { id: 'exp', label: 'eᶻ', expr: 'exp(z)', sing: [], explain: 'Intera: il raggio è infinito, e aumentando $N$ la somma parziale copre regioni sempre più grandi. La convergenza è uniforme sui compatti, non su tutto $\\C$.' },
  { id: 'tan', label: 'tan z', expr: 'tan(z)', sing: [[H, 0], [-H, 0], [3 * H, 0], [-3 * H, 0]], explain: 'Poli in $\\pi/2+k\\pi$. Da $z_0=0$ il raggio è $\\pi/2$. I coefficienti (numeri di Bernoulli) decrescono esattamente come $(2/\\pi)^n$.' },
  { id: 'log', label: 'Log(1 + z)', expr: 'log(1+z)', sing: [[-1, 0]], cut: true, explain: 'Il punto di diramazione in $-1$ fissa il raggio $|1+z_0|$. Se il disco attraversa il taglio $(-\\infty,-1]$, la serie converge anche oltre il taglio, ma verso **un altro ramo**: guarda il salto di colore tra il pannello di sinistra e quello di destra.' },
]

const view: View = { x: [-3, 3], y: [-2, 2] }
const NMAX = 40

export default function TaylorLab() {
  const [pid, setPid] = useState('lor')
  const preset = PRESETS.find((p) => p.id === pid)!
  const f = useMemo(() => compile(preset.expr), [preset])
  const [z0, setZ0] = useState<Complex>([0, 0])
  const [N, setN] = useState(8)

  const R = preset.sing.length ? Math.min(...preset.sing.map((s) => dist(s, z0))) : Infinity
  const cutDist = preset.cut ? (z0[0] <= -1 ? Math.abs(z0[1]) : dist(z0, [-1, 0])) : Infinity
  const rS = Math.min(Number.isFinite(R) ? 0.7 * R : 3, 0.7 * cutDist)
  const coeffs = useMemo(() => (rS > 0.01 ? laurentCoeffs(f, z0, rS, 0, NMAX, 256) : []), [f, z0[0], z0[1], rS])

  const SN = useMemo(() => {
    const a = coeffs.slice(0, N + 1)
    return (z: Complex): Complex => {
      const d = sub(z, z0)
      let s: Complex = [0, 0]
      for (let k = a.length - 1; k >= 0; k--) s = add(mul(s, d), a[k])
      return s
    }
  }, [coeffs, N, z0[0], z0[1]])

  const paintF = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i), [f])
  const paintS = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(SN(z), out, i), [SN])

  const rootEst = useMemo(() => {
    let m = 0
    for (let n = Math.max(1, N - 4); n <= N; n++) if (coeffs[n]) m = Math.max(m, Math.pow(abs(coeffs[n]), 1 / n))
    return m > 1e-12 ? 1 / m : Infinity
  }, [coeffs, N])

  const errR = Number.isFinite(R) ? R / 2 : 1.5
  const err = useMemo(() => {
    let e = 0
    for (let k = 0; k < 90; k++) {
      const z = add(z0, polar(errR, (2 * Math.PI * k) / 90))
      e = Math.max(e, abs(sub(f(z), SN(z))))
    }
    return e
  }, [f, SN, errR, z0[0], z0[1]])

  // nasconde i coefficienti che sono solo rumore numerico (es. i dispari nulli di 1/(1+z²))
  const maxF = coeffs.reduce((m, c, n) => Math.max(m, abs(c) * Math.pow(rS, n)), 0)
  const chartPts: [number, number][] = coeffs.map((c, n) => [n, abs(c) > (1e-13 * maxF) / Math.pow(rS, n) ? Math.log10(abs(c)) : NaN])
  const ref: [number, number][] = Number.isFinite(R) ? Array.from({ length: NMAX + 1 }, (_, n) => [n, -n * Math.log10(R)]) : []

  const overlays = (
    <>
      {preset.cut && <Seg a={[-1, 0]} b={[-4, 0]} color={PALETTE.fg} width={2} dash="5 5" opacity={0.8} />}
      {Number.isFinite(R) && <Circle c={z0} r={R} color="#fff" width={2} dash="6 5" />}
      {preset.sing.map((s, i) => (
        <Cross key={i} p={s} color="#fff" />
      ))}
    </>
  )

  return (
    <Widget
      title="Il disco di convergenza"
      description="A sinistra c'è $f$, a destra la somma parziale $S_N(z)=\sum_{n\le N}a_n(z-z_0)^n$, entrambe in domain coloring. Il cerchio tratteggiato è il disco di convergenza. I coefficienti sono calcolati con la formula di Cauchy $a_n=\frac1{2\pi i}\oint\frac{f(z)}{(z-z_0)^{n+1}}dz$, discretizzata. Trascina il centro $z_0$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={(v) => { setPid(v); setZ0([0, 0]) }} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>ordine <i>N</i></>} value={N} min={0} max={NMAX} step={1} onChange={setN} display={N} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <TwoPanels>
        <Panel label="f(z)">
          <Plane view={view} aspect={0.7} paint={paintF} res={0.5}>
            {overlays}
            <Handle
              p={z0}
              onChange={(p) => setZ0(preset.cut && p[0] <= -1 && Math.abs(p[1]) < 0.06 ? [p[0], p[1] < 0 ? -0.06 : 0.06] : p)}
            />
          </Plane>
        </Panel>
        <Panel label={`S_N(z), N = ${N}`}>
          <Plane view={view} aspect={0.7} paint={paintS} res={0.5}>
            {overlays}
          </Plane>
        </Panel>
      </TwoPanels>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel label="log₁₀ |aₙ| al variare di n">
          <Chart
            series={[
              { points: ref, color: PALETTE.muted, dash: '5 5', width: 1.5 },
              { points: chartPts, color: PALETTE.violet, dots: true },
            ]}
            x={[0, NMAX]}
            y={[-12, 4]}
            marker={N}
            height={220}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.violet, label: 'log₁₀|aₙ|' }, { color: PALETTE.muted, label: '−n log₁₀ R (pendenza)', dash: true }]} />
          </div>
        </Panel>
        <Stats
          items={[
            { label: 'z₀', value: fmt(z0) },
            { label: 'R = dist(z₀, singolarità)', value: Number.isFinite(R) ? fmtNum(R, 3) : '∞', tone: 'accent' },
            { label: 'stima 1 / |aₙ|^{1/n}', value: Number.isFinite(rootEst) ? fmtNum(rootEst, 3) : '∞' },
            { label: `max |f − S_N| su |z−z₀| = ${fmtNum(errR)}`, value: fmtNum(err, 3) },
          ]}
        />
      </div>
      <Hint>{String.raw`Fuori dal disco $S_N$ esplode (anelli fitti), dentro somiglia a $f$ sempre di più. Per $1/(1+z^2)$ i coefficienti dispari sono nulli e mancano dal grafico. Il limsup di Cauchy–Hadamard guarda proprio la pendenza di questa nuvola di punti.`}</Hint>
    </Widget>
  )
}
