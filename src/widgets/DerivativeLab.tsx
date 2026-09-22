import { useEffect, useMemo, useState } from 'react'
import { abs, add, fmt, fmtNum, mul, polar, scale, sub, div, type Complex, type Fn } from '../lib/complex'
import { tryCompile } from '../lib/parse'
import { PALETTE } from '../lib/color'
import { Circle, Dot, GradPoly, Handle, Plane, Poly, type View } from '../components/Plane'
import { M } from '../components/Math'
import { Card, Explain, FnInput, Hint, Panel, Select, Slider, Stats, Widget } from '../components/ui'

const PRESETS = [
  { id: 'z2', label: 'z²', expr: 'z^2', explain: 'Olomorfa ovunque, con $f\'(z)=2z$. Il quadratino viene ruotato di $\\arg 2z_0$ e dilatato di $|2z_0|$. Portalo in $z_0=0$: lì $f\'=0$ e l\'immagine locale collassa.' },
  { id: 'exp', label: 'eᶻ', expr: 'exp(z)', explain: '$f\'=f$. La rotazione locale è $\\Im z_0$ e il fattore di scala è $e^{\\Re z_0}$: muovi il punto in verticale e il quadratino ruota senza cambiare dimensione.' },
  { id: 'inv', label: '1/z', expr: '1/z', explain: '$f\'(z)=-1/z^2$. Avvicinati a 0: il fattore di dilatazione $1/|z_0|^2$ esplode.' },
  { id: 'conj', label: 'z̄', expr: 'conj(z)', explain: '$u=x$, $v=-y$: $u_x=1\\neq -1=v_y$. È una riflessione, una trasformazione $\\R$-lineare che inverte l\'orientamento. Il quoziente incrementale vale $e^{-2i\\theta}$ e **dipende dalla direzione**: descrive un intero cerchio.' },
  { id: 'abs2', label: '|z|²', expr: 'z conj(z)', explain: '$u=x^2+y^2$, $v=0$: le condizioni di C–R valgono solo in $z_0=0$. Lì $f$ è $\\C$-derivabile ma non olomorfa, perché non esiste un intorno aperto in cui sia derivabile. Altrove lo jacobiano ha rango 1 e il quadrato viene schiacciato su un segmento.' },
  { id: 'zre', label: 'z · Re z', expr: 'z re(z)', explain: '$f=x^2+ixy$: $u_x=2x$, $v_y=x$, $u_y=0$, $v_x=y$. Le condizioni di C–R valgono solo in $z_0=0$. In forma compatta $\\partial f/\\partial\\bar z = z_0/2$, che si annulla solo nell\'origine.' },
  { id: 'custom', label: 'Personalizzata…', expr: 'z^3 - conj(z)', explain: '' },
]

function jac(f: Fn, z: Complex) {
  const e = 1e-5
  const fx = scale(sub(f(add(z, [e, 0])), f(sub(z, [e, 0]))), 1 / (2 * e))
  const fy = scale(sub(f(add(z, [0, e])), f(sub(z, [0, e]))), 1 / (2 * e))
  // ∂f/∂z = (f_x − i f_y)/2 , ∂f/∂z̄ = (f_x + i f_y)/2
  const dz = scale(sub(fx, mul([0, 1], fy)), 0.5)
  const dzb = scale(add(fx, mul([0, 1], fy)), 0.5)
  return { ux: fx[0], vx: fx[1], uy: fy[0], vy: fy[1], dz, dzb }
}

function extent(pts: Complex[][], min = 1.5): View {
  let L = min
  for (const l of pts) for (const p of l) if (Number.isFinite(p[0]) && Number.isFinite(p[1])) L = Math.max(L, Math.abs(p[0]) * 1.15, Math.abs(p[1]) * 1.15)
  L = Math.min(L, 40)
  return { x: [-L, L], y: [-L, L] }
}

export default function DerivativeLab() {
  const [pid, setPid] = useState('z2')
  const preset = PRESETS.find((p) => p.id === pid)!
  const [custom, setCustom] = useState(PRESETS[PRESETS.length - 1].expr)
  const expr = pid === 'custom' ? custom : preset.expr
  const compiled = useMemo(() => tryCompile(expr), [expr])
  const [f, setF] = useState<Fn>(() => tryCompile('z^2').f!)
  useEffect(() => {
    if (compiled.f) setF(() => compiled.f!)
  }, [compiled])

  const [z0, setZ0] = useState<Complex>([0.7, 0.5])
  const [h, setH] = useState(0.35)
  const J = jac(f, z0)
  const f0 = f(z0)

  // quadratino di lato 2h attorno a z0 (griglia 5×5) e circonferenza di raggio h
  const n = 5
  const square = useMemo(() => {
    const L: Complex[][] = []
    for (let k = 0; k < n; k++) {
      const s = -h + (2 * h * k) / (n - 1)
      L.push(Array.from({ length: 40 }, (_, j) => add(z0, [s, -h + (2 * h * j) / 39])))
      L.push(Array.from({ length: 40 }, (_, j) => add(z0, [-h + (2 * h * j) / 39, s])))
    }
    return L
  }, [z0, h])
  const circle = useMemo(() => Array.from({ length: 181 }, (_, j) => add(z0, polar(h, (2 * Math.PI * j) / 180))), [z0, h])

  // immagine locale normalizzata: (f(z0+ζ) − f(z0)) / h
  const local = useMemo(() => square.map((l) => l.map((z) => scale(sub(f(z), f0), 1 / h))), [square, f, f0, h])
  const linear = useMemo(
    () => square.map((l) => l.map((z) => {
      const d = sub(z, z0)
      return scale([J.ux * d[0] + J.uy * d[1], J.vx * d[0] + J.vy * d[1]], 1 / h)
    })),
    [square, z0, h, J.ux, J.uy, J.vx, J.vy],
  )
  const quotient = useMemo(() => circle.map((z) => div(sub(f(z), f0), sub(z, z0))), [circle, f, f0, z0])
  const localView = useMemo(() => extent([...local, ...linear]), [local, linear])
  const qView = useMemo<View>(() => {
    const c = J.dz
    let L = Math.max(0.5, abs(J.dzb) * 1.4)
    for (const q of quotient) if (Number.isFinite(q[0]) && Number.isFinite(q[1])) L = Math.max(L, Math.abs(q[0] - c[0]) * 1.3, Math.abs(q[1] - c[1]) * 1.3)
    L = Math.min(L, 40)
    return { x: [c[0] - L, c[0] + L], y: [c[1] - L, c[1] + L] }
  }, [quotient, J.dz[0], J.dz[1], J.dzb[0], J.dzb[1]])

  const holo = abs(J.dzb) < 1e-6 * Math.max(1, abs(J.dz))
  const crA = J.ux - J.vy
  const crB = J.uy + J.vx

  return (
    <Widget
      title="Laboratorio della derivata"
      description="Nel piano $z$ c'è un quadratino di lato $2h$ attorno a $z_0$. Al centro vedi la sua immagine riscalata, $\big(f(z_0+\zeta)-f(z_0)\big)/h$, con tratteggiata l'immagine tramite il differenziale reale $J_f(z_0)$. A destra c'è il quoziente incrementale $\frac{f(z_0+he^{i\theta})-f(z_0)}{he^{i\theta}}$ al variare della direzione $\theta$: la funzione è $\C$-derivabile in $z_0$ esattamente quando questa curva si riduce a un punto per $h\to 0$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>raggio <M>h</M></>} value={h} min={0.02} max={0.8} step={0.01} onChange={setH} display={h.toFixed(2)} />
        </div>
        {pid === 'custom' ? <FnInput value={custom} onChange={setCustom} error={compiled.error} /> : <Explain>{preset.explain}</Explain>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel label="Piano z">
          <Plane view={{ x: [-2, 2], y: [-2, 2] }}>
            {square.map((l, k) => (
              <Poly key={k} pts={l} color={PALETTE.muted} width={1} opacity={0.5} />
            ))}
            <GradPoly pts={circle} width={3} />
            <Handle p={z0} onChange={setZ0} />
          </Plane>
        </Panel>
        <Panel label="Immagine locale / h">
          <Plane view={localView}>
            {linear.map((l, k) => (
              <Poly key={'l' + k} pts={l} color={PALETTE.muted} width={1} opacity={0.6} dash="3 4" />
            ))}
            {local.map((l, k) => (
              <Poly key={k} pts={l} color={PALETTE.fg} width={1} opacity={0.55} />
            ))}
            <GradPoly pts={circle.map((z) => scale(sub(f(z), f0), 1 / h))} width={3} />
          </Plane>
        </Panel>
        <Panel label="Quoziente incrementale">
          <Plane view={qView}>
            <Circle c={J.dz} r={abs(J.dzb)} color={PALETTE.muted} width={1.2} dash="4 4" />
            <GradPoly pts={quotient} width={3} />
            <Dot p={J.dz} color={PALETTE.pink} r={5} />
          </Plane>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Stats
          items={[
            { label: 'z₀', value: fmt(z0) },
            { label: '∂f/∂z (z₀)', value: fmt(J.dz, 3) },
            { label: '∂f/∂z̄ (z₀)', value: fmt(J.dzb, 3), tone: holo ? 'good' : 'bad' },
            { label: 'uₓ − v_y ,  u_y + vₓ', value: `${fmtNum(crA, 3)} , ${fmtNum(crB, 3)}`, tone: holo ? 'good' : 'bad' },
          ]}
        />
        <Card className="flex items-center justify-center px-5 py-4">
          <M>{`J_f(z_0)=\\begin{pmatrix} ${fmtNum(J.ux, 2).replace('−', '-')} & ${fmtNum(J.uy, 2).replace('−', '-')} \\\\ ${fmtNum(J.vx, 2).replace('−', '-')} & ${fmtNum(J.vy, 2).replace('−', '-')} \\end{pmatrix}`}</M>
        </Card>
      </div>
      <Hint>{String.raw`La circonferenza tratteggiata a destra ha centro $\partial f/\partial z$ e raggio $|\partial f/\partial\bar z|$: al primo ordine il quoziente vale $\partial_z f + \partial_{\bar z} f\, e^{-2i\theta}$. Riduci $h$ e guarda la curva colorata avvicinarsi a quella circonferenza. Se è olomorfa, la circonferenza si riduce a un punto.`}</Hint>
    </Widget>
  )
}
