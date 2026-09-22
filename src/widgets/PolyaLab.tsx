import { memo, useMemo, useState } from 'react'
import { abs, add, circleIntegral, dist, fmt, mul, type Complex, type Fn } from '../lib/complex'
import { compile } from '../lib/parse'
import { gradient, PALETTE } from '../lib/color'
import { ArrowPx, Circle, Cross, Handle, OrientArrow, Plane, usePlane } from '../components/Plane'
import { Explain, Hint, Panel, Select, Stats, Widget } from '../components/ui'

type Preset = {
  id: string
  label: string
  expr: string
  /** poli con residuo, per la previsione teorica */
  poles: { p: Complex; res: Complex }[]
  /** previsione per f non olomorfe: funzione di centro e raggio */
  predict?: (c: Complex, r: number) => Complex
  explain: string
}

const PRESETS: Preset[] = [
  { id: 'z2', label: 'z²', expr: 'z^2', poles: [], explain: 'Olomorfa su tutto $\\C$: il campo di Pólya $\\overline{f}$ è irrotazionale e solenoidale. Circolazione e flusso sono nulli su **ogni** curva chiusa.' },
  { id: 'inv', label: '1/z', expr: '1/z', poles: [{ p: [0, 0], res: [1, 0] }], explain: '$\\overline{1/z} = z/|z|^2$ è il campo di una **sorgente** in 0. Il flusso attraverso una curva che circonda l\'origine vale $2\\pi$ e la circolazione è nulla, quindi $\\oint dz/z = 2\\pi i$.' },
  { id: 'iinv', label: 'i/z', expr: 'i/z', poles: [{ p: [0, 0], res: [0, 1] }], explain: '$\\overline{i/z}$ è un **vortice**: circolazione $-2\\pi$ e flusso nullo, quindi $\\oint \\frac{i}{z}dz = -2\\pi$. Moltiplicare per $i$ scambia il ruolo di sorgente e vortice.' },
  { id: 'inv2', label: '1/z²', expr: '1/z^2', poles: [{ p: [0, 0], res: [0, 0] }], explain: 'Polo doppio con residuo nullo: $1/z^2 = \\frac{d}{dz}(-1/z)$ ha una primitiva su $\\C\\setminus\\{0\\}$, quindi l\'integrale su ogni curva chiusa è 0 anche se la curva circonda la singolarità. Il campo è un dipolo.' },
  { id: 'dip', label: '1/(z² + 1)', expr: '1/(z^2+1)', poles: [{ p: [0, 1], res: [0, -0.5] }, { p: [0, -1], res: [0, 0.5] }], explain: 'Poli semplici in $\\pm i$ con residui $\\mp\\tfrac i2$. Se la curva li circonda entrambi i contributi si cancellano, e infatti $f = O(1/z^2)$ all\'infinito.' },
  { id: 'expz', label: 'eᶻ / z', expr: 'exp(z)/z', poles: [{ p: [0, 0], res: [1, 0] }], explain: 'Con la formula integrale di Cauchy per $g=e^z$: $\\oint \\frac{e^z}{z-0}dz = 2\\pi i\\, g(0) = 2\\pi i$ per ogni curva che gira una volta attorno a 0, qualunque sia la sua forma.' },
  { id: 'conj', label: 'z̄ (non olomorfa)', expr: 'conj(z)', poles: [], predict: (_c, r) => [0, 2 * Math.PI * r * r], explain: 'Non olomorfa: il campo di Pólya è $\\overline{\\bar z} = z$, il campo radiale con divergenza 2. Per Gauss–Green $\\oint \\bar z\\,dz = 2i\\cdot\\text{Area}$, e la curva può stare ovunque.' },
]

/** Frecce del campo di Pólya V = conj(f), lunghezza compressa in modo logaritmico. */
const Field = memo(function Field({ f }: { f: Fn }) {
  const { W, H, toWorld } = usePlane()
  const step = 34
  const arrows = []
  for (let py = step / 2; py < H; py += step)
    for (let px = step / 2; px < W; px += step) {
      const z = toWorld(px, py)
      const w = f(z)
      const m = abs(w)
      if (!Number.isFinite(m) || m < 1e-9) continue
      const len = Math.min(step * 0.8, 8 + 7 * Math.log1p(m))
      const t = Math.min(1, Math.log1p(m) / 3)
      // V = (u, −v): in pixel l'asse y è invertito → (u, v) normalizzato
      arrows.push(<ArrowPx key={`${px},${py}`} from={z} dx={(w[0] / m) * len} dy={(w[1] / m) * len} color={gradient(t)} opacity={0.75} width={1.4} />)
    }
  return <g>{arrows}</g>
})

export default function PolyaLab() {
  const [pid, setPid] = useState('inv')
  const preset = PRESETS.find((p) => p.id === pid)!
  const f = useMemo(() => compile(preset.expr), [preset])
  const [c, setC] = useState<Complex>([0.3, 0.2])
  const [rim, setRim] = useState<Complex>([1.5, 0.2])
  const r = Math.max(0.05, dist(c, rim))

  const I = useMemo(() => circleIntegral(f, c, r, 4096), [f, c, r])
  const inside = preset.poles.filter((p) => dist(p.p, c) < r)
  const onCurve = preset.poles.some((p) => Math.abs(dist(p.p, c) - r) < 0.03)
  const theory: Complex = preset.predict ? preset.predict(c, r) : inside.reduce<Complex>((s, p) => add(s, mul([0, 2 * Math.PI], p.res)), [0, 0])

  // spostando il centro, la maniglia del bordo va dal lato che resta visibile
  const moveC = (p: Complex) => {
    setRim([p[0] + r < 2.3 ? p[0] + r : p[0] - r, p[1]])
    setC(p)
  }

  return (
    <Widget
      title="Circolazione e flusso del campo di Pólya"
      description="Le frecce rappresentano il campo di Pólya $V = \overline{f} = (u,-v)$ (direzione normalizzata, colore = intensità). Trascina il centro e il bordo della circonferenza: l'integrale viene calcolato numericamente e confrontato con la previsione teorica."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
        <Explain>{preset.explain}</Explain>
      </div>

      <Panel label="Piano z · campo di Pólya">
        <Plane view={{ x: [-2.6, 2.6], y: [-1.7, 1.7] }} aspect={0.6}>
          <Field f={f} />
          <Circle c={c} r={r} color={PALETTE.fg} width={2.5} fill={PALETTE.violet} fillOpacity={0.08} />
          <OrientArrow at={add(c, [0, r])} dir={[-1, 0]} />
          <OrientArrow at={add(c, [0, -r])} dir={[1, 0]} />
          {preset.poles.map((p, i) => (
            <Cross key={i} p={p.p} color={PALETTE.red} />
          ))}
          <Handle p={c} onChange={moveC} r={6} />
          <Handle p={rim} onChange={setRim} color={PALETTE.pink} r={6} />
        </Plane>
      </Panel>

      <Stats
        items={[
          { label: '∮ f dz (numerico)', value: onCurve ? 'polo sul contorno' : fmt(I, 4), tone: onCurve ? 'bad' : undefined },
          { label: 'Circolazione di V  = Re', value: onCurve ? '—' : I[0].toFixed(4) },
          { label: 'Flusso di V  = Im', value: onCurve ? '—' : I[1].toFixed(4) },
          { label: preset.predict ? 'Previsione (2i·Area)' : 'Previsione 2πi Σ Res', value: fmt(theory, 4), tone: 'accent' },
        ]}
      />
      <Hint>{String.raw`Il campo di Pólya è costruito apposta: $f\,dz = (u\,dx - v\,dy) + i\,(v\,dx + u\,dy) = V\cdot T\,ds + i\,V\cdot N\,ds$, con $T$ tangente e $N$ normale uscente. Per il teorema di Green, $\oint f\,dz = 0$ su ogni curva di Jordan significa $\operatorname{rot}V=0$ e $\operatorname{div}V=0$, cioè le equazioni di Cauchy–Riemann.`}</Hint>
    </Widget>
  )
}

