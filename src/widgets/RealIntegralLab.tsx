import { useMemo, useState } from 'react'
import { abs, add, circleIntegral, fmt, fmtNum, mul, pathIntegral, polar, scale, type Complex, type Fn } from '../lib/complex'
import { compile } from '../lib/parse'
import { domainColor, PALETTE } from '../lib/color'
import { Cross, Label, OrientArrow, Plane, Poly } from '../components/Plane'
import { Chart, Legend } from '../components/Chart'
import { M } from '../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../components/ui'

type Preset = { id: string; label: string; expr: string; poles: Complex[]; part: 're' | 'im'; target: number; targetTex: string; explain: string }
const s2 = Math.SQRT1_2
const PRESETS: Preset[] = [
  { id: 'lor', label: '∫ dx / (1 + x²)', expr: '1/(1+z^2)', poles: [[0, 1]], part: 're', target: Math.PI, targetTex: '\\pi', explain: 'Si usa $f(z)=\\frac1{1+z^2}$. Sull\'arco $|f|\\le\\frac1{R^2-1}$, quindi per la stima ML il contributo è $\\le\\frac{\\pi R}{R^2-1}\\to0$. Resta $2\\pi i\\,\\Res(f,i)=2\\pi i\\cdot\\frac1{2i}=\\pi$.' },
  { id: 'x4', label: '∫ dx / (1 + x⁴)', expr: '1/(1+z^4)', poles: [[s2, s2], [-s2, s2]], part: 're', target: Math.PI / Math.SQRT2, targetTex: '\\pi/\\sqrt2', explain: 'Nel semipiano superiore ci sono due poli, $e^{i\\pi/4}$ ed $e^{3i\\pi/4}$. Per un polo semplice di $1/Q$ conviene $\\Res = \\frac{1}{Q\'(p)}=\\frac1{4p^3}=-\\frac p4$. La somma è $-\\frac{i\\sqrt2}{4}$, e moltiplicando per $2\\pi i$ si ottiene $\\frac{\\pi}{\\sqrt2}$.' },
  { id: 'cos', label: '∫ cos x / (1 + x²) dx', expr: 'exp(i z)/(1+z^2)', poles: [[0, 1]], part: 're', target: Math.PI / Math.E, targetTex: '\\pi/e', explain: 'Non si usa $\\cos z$, che esplode come $e^{|\\Im z|}$ nel semipiano superiore, ma $e^{iz}$, che lì è limitata ($|e^{iz}|=e^{-y}$). Poi si prende la parte reale. $\\Res(f,i)=\\frac{e^{-1}}{2i}$, quindi l\'integrale vale $\\pi/e$.' },
  { id: 'xsin', label: '∫ x sin x / (1 + x²) dx', expr: 'z exp(i z)/(1+z^2)', poles: [[0, 1]], part: 'im', target: Math.PI / Math.E, targetTex: '\\pi/e', explain: 'Qui $|f|\\sim 1/R$ sull\'arco e la stima ML dà solo $\\le\\pi R\\cdot\\frac{R}{R^2-1}\\to\\pi$, che **non basta**. Serve il lemma di Jordan, che sfrutta il decadimento $e^{-R\\sin\\theta}$. Guarda il grafico: la stima ML resta alta, l\'arco va a zero come $1/R$.' },
]

const RMIN = 0.5
const RMAX = 60

function pieces(f: Fn, R: number) {
  const seg = pathIntegral(f, (t) => [t, 0], () => [1, 0], -R, R, Math.max(2000, Math.ceil(R * 80)))
  const arc = pathIntegral(f, (t) => polar(R, t), (t) => mul([0, 1], polar(R, t)), 0, Math.PI, Math.max(2000, Math.ceil(R * 80)))
  let mx = 0
  for (let k = 0; k <= 400; k++) mx = Math.max(mx, abs(f(polar(R, (Math.PI * k) / 400))))
  return { seg, arc, ml: mx * Math.PI * R }
}

export default function RealIntegralLab() {
  const [pid, setPid] = useState('xsin')
  const preset = PRESETS.find((p) => p.id === pid)!
  const f = useMemo(() => compile(preset.expr), [preset])
  const [lR, setLR] = useState(Math.log10(3))
  const R = Math.pow(10, lR)

  const res = useMemo(() => preset.poles.map((p) => scale(circleIntegral(f, p, 0.05, 512), 1 / (2 * Math.PI)) as Complex).map((v) => [v[1], -v[0]] as Complex), [f, preset])
  const inside = preset.poles.map((p, i) => ({ p, r: res[i] })).filter((q) => abs(q.p) < R)
  const predicted = mul([0, 2 * Math.PI], inside.reduce<Complex>((s, q) => add(s, q.r), [0, 0]))
  const { seg, arc, ml } = useMemo(() => pieces(f, R), [f, R])
  const total = add(seg, arc)
  const segVal = preset.part === 're' ? seg[0] : seg[1]

  const curve = useMemo(() => {
    const A: [number, number][] = []
    const B: [number, number][] = []
    for (let k = 0; k <= 36; k++) {
      const lr = Math.log10(RMIN) + ((Math.log10(RMAX) - Math.log10(RMIN)) * k) / 36
      const p = pieces(f, Math.pow(10, lr))
      A.push([lr, Math.log10(abs(p.arc))])
      B.push([lr, Math.log10(p.ml)])
    }
    return { A, B }
  }, [f])

  const paint = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i, { dim: 0.5 }), [f])
  const arcPts = Array.from({ length: 181 }, (_, k) => polar(R, (Math.PI * k) / 180))
  const pad = R * 0.15

  return (
    <Widget
      title="Integrali reali con il semicerchio"
      description="Il contorno è il segmento $[-R,R]$ seguito dal semicerchio $C_R$ nel semipiano superiore. Per il teorema dei residui $\int_{-R}^{R}f+\int_{C_R}f=2\pi i\sum\Res$ (poli con $\Im p>0$, $|p|<R$). Quando $R\to\infty$ l'arco sparisce e resta l'integrale reale."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>raggio <M>R</M></>} value={lR} min={Math.log10(RMIN)} max={Math.log10(RMAX)} step={0.002} onChange={setLR} display={fmtNum(R)} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Contorno">
          <Plane view={{ x: [-R - pad, R + pad], y: [-pad * 1.5, R + pad] }} aspect={0.62} paint={paint} res={0.5}>
            <Poly pts={[[-R, 0], [R, 0]]} color="#fff" width={2.5} />
            <Poly pts={arcPts} color={PALETTE.pink} width={2.5} />
            <OrientArrow at={[0, 0]} dir={[1, 0]} color="#fff" />
            <OrientArrow at={[0, R]} dir={[-1, 0]} color={PALETTE.pink} />
            {preset.poles.map((p, i) => (
              <g key={i}>
                <Cross p={p} color={abs(p) < R ? '#fff' : PALETTE.muted} />
                <Label p={p} dx={10} dy={-8} size={11}>{`Res = ${fmt(res[i], 3)}`}</Label>
              </g>
            ))}
          </Plane>
        </Panel>
        <Panel label="|∫ arco|  vs  R (log-log)">
          <Chart
            series={[
              { points: curve.B, color: PALETTE.muted, dash: '5 4', width: 1.5 },
              { points: curve.A, color: PALETTE.pink, width: 2.5 },
            ]}
            x={[Math.log10(RMIN), Math.log10(RMAX)]}
            y={[-4, 1.5]}
            marker={lR}
            height={290}
            xTicks={[0, 1].map((v) => ({ v, label: `10^${v}` }))}
            yTicks={[-4, -3, -2, -1, 0, 1].map((v) => ({ v, label: `10^${v}` }))}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.pink, label: '|∫ su C_R|' }, { color: PALETTE.muted, label: 'stima ML: πR · max|f|', dash: true }]} />
          </div>
        </Panel>
      </div>
      <Stats
        items={[
          { label: `${preset.part === 're' ? 'Re' : 'Im'} ∫ su [−R, R]`, value: fmtNum(segVal, 5) },
          { label: '∫ su C_R', value: fmt(arc, 4) },
          { label: 'stima ML dell’arco', value: fmtNum(ml, 4) },
          { label: 'segmento + arco', value: fmt(total, 4) },
          { label: '2πi Σ Res (poli interni)', value: fmt(predicted, 4) },
          { label: 'valore esatto', value: `${fmtNum(preset.target, 5)}`, tone: 'accent' },
        ]}
      />
      <Hint>{String.raw`Per $R<1$ il polo resta fuori e segmento più arco danno 0. Appena il cerchio lo include, il totale salta a $2\pi i\,\Res$ e da lì non cambia più: al crescere di $R$ si sposta solo il peso tra segmento e arco.`}</Hint>
    </Widget>
  )
}
