import { useMemo, useState } from 'react'
import { add, fmt, mul, scale, sub, type Complex } from '../lib/complex'
import { compile } from '../lib/parse'
import { domainColor, PALETTE } from '../lib/color'
import { Cross, Handle, Label, OrientArrow, Plane, Poly } from '../components/Plane'
import { Explain, Hint, Panel, Select, Stats, Widget } from '../components/ui'

const PRESETS = [
  { id: 'inv', label: '1/z', expr: '1/z', sing: [[0, 0]] as Complex[], explain: 'Su $\\C\\setminus\\{0\\}$, $1/z$ **non ha primitiva**: il candidato naturale sarebbe $\\log z$. I due cammini danno lo stesso risultato solo se la regione tra loro non contiene 0. Se la contiene, differiscono di $2\\pi i$.' },
  { id: 'inv2', label: '1/z²', expr: '1/z^2', sing: [[0, 0]] as Complex[], explain: '$-1/z$ è una primitiva su tutto $\\C\\setminus\\{0\\}$, quindi l\'integrale dipende solo dagli estremi: $\\int_\\gamma = \\frac1A-\\frac1B$ anche se i cammini passano da lati opposti del polo.' },
  { id: 'exp', label: 'eᶻ', expr: 'exp(z)', sing: [] as Complex[], explain: 'Intera: per il teorema di Cauchy ogni cammino da $A$ a $B$ dà $e^B - e^A$.' },
  { id: 'conj', label: 'z̄', expr: 'conj(z)', sing: [] as Complex[], explain: 'Non olomorfa: la differenza tra i due cammini è $\\oint\\bar z\\,dz = 2i\\cdot$(area con segno racchiusa). Non c\'è nessuna singolarità, eppure l\'integrale dipende dal cammino.' },
]

function bezier(a: Complex, c: Complex, b: Complex, n = 300): Complex[] {
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n
    return add(add(scale(a, (1 - t) * (1 - t)), scale(c, 2 * t * (1 - t))), scale(b, t * t))
  })
}

function integrate(f: (z: Complex) => Complex, pts: Complex[]): Complex {
  // regola del punto medio sulla poligonale fine
  let s: Complex = [0, 0]
  for (let i = 0; i < pts.length - 1; i++) s = add(s, mul(f(scale(add(pts[i], pts[i + 1]), 0.5)), sub(pts[i + 1], pts[i])))
  return s
}

export default function PathLab() {
  const [pid, setPid] = useState('inv')
  const preset = PRESETS.find((p) => p.id === pid)!
  const f = useMemo(() => compile(preset.expr), [preset])
  const [A, setA] = useState<Complex>([-1.6, -0.3])
  const [B, setB] = useState<Complex>([1.6, 0.3])
  const [c1, setC1] = useState<Complex>([0, 1.6])
  const [c2, setC2] = useState<Complex>([0.2, -1.5])

  const g1 = useMemo(() => bezier(A, c1, B), [A, c1, B])
  const g2 = useMemo(() => bezier(A, c2, B), [A, c2, B])
  const I1 = useMemo(() => integrate(f, g1), [f, g1])
  const I2 = useMemo(() => integrate(f, g2), [f, g2])
  const d = sub(I1, I2)
  const paint = useMemo(() => {
    return (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i, { dim: 0.42 })
  }, [f])

  return (
    <Widget
      title="Dipende dal cammino?"
      description="Due cammini $\gamma_1$ (viola) e $\gamma_2$ (rosa) con gli stessi estremi $A$ e $B$. Trascina estremi e punti di controllo. Sullo sfondo, attenuato, c'è il domain coloring di $f$. La differenza $\int_{\gamma_1}-\int_{\gamma_2}$ è l'integrale sulla curva chiusa $\gamma_1\cup\gamma_2^-$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
        <Explain>{preset.explain}</Explain>
      </div>
      <Panel label="Piano z">
        <Plane view={{ x: [-2.6, 2.6], y: [-1.9, 1.9] }} aspect={0.6} paint={paint} res={0.5}>
          <Poly pts={[A, c1, B]} color={PALETTE.violet} width={1} dash="3 5" opacity={0.6} />
          <Poly pts={[A, c2, B]} color={PALETTE.pink} width={1} dash="3 5" opacity={0.6} />
          <Poly pts={g1} color={PALETTE.violet} width={3} />
          <Poly pts={g2} color={PALETTE.pink} width={3} />
          <OrientArrow at={g1[150]} dir={sub(g1[151], g1[149])} color={PALETTE.violet} />
          <OrientArrow at={g2[150]} dir={sub(g2[151], g2[149])} color={PALETTE.pink} />
          {preset.sing.map((s, i) => (
            <Cross key={i} p={s} />
          ))}
          <Handle p={c1} onChange={setC1} color={PALETTE.violet} r={5} />
          <Handle p={c2} onChange={setC2} color={PALETTE.pink} r={5} />
          <Handle p={A} onChange={setA} color={PALETTE.fg} r={7} />
          <Handle p={B} onChange={setB} color={PALETTE.fg} r={7} />
          <Label p={A} dx={-14} dy={-12} anchor="end">A</Label>
          <Label p={B} dx={14} dy={-12}>B</Label>
        </Plane>
      </Panel>
      <Stats
        items={[
          { label: '∫ su γ₁', value: fmt(I1, 4) },
          { label: '∫ su γ₂', value: fmt(I2, 4) },
          { label: 'differenza', value: fmt(d, 4), tone: Math.hypot(d[0], d[1]) < 1e-3 ? 'good' : 'accent' },
          { label: 'differenza / 2πi', value: fmt([d[1] / (2 * Math.PI), -d[0] / (2 * Math.PI)], 3) },
        ]}
      />
      <Hint>{String.raw`Se la regione tra i due cammini non contiene singolarità, l'integrale sulla curva chiusa è nullo (teorema di Cauchy) e i due cammini danno lo stesso risultato. Per $1/z$, "differenza$/2\pi i$" è proprio l'indice di $\gamma_1\cup\gamma_2^-$ rispetto a 0.`}</Hint>
    </Widget>
  )
}
