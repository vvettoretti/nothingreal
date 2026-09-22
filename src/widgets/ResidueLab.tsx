import { useMemo, useState } from 'react'
import { add, circleIntegral, dist, div, fmt, mul, sub, type Complex } from '../lib/complex'
import { domainColor, PALETTE } from '../lib/color'
import { Circle, Handle, Label, OrientArrow, Plane } from '../components/Plane'
import { Button, Card, Hint, Panel, Stats, Widget } from '../components/ui'

type Pole = { p: Complex; res: Complex }
const INITIAL: Pole[] = [
  { p: [-1.1, 0.4], res: [1, 0] },
  { p: [0.7, 0.7], res: [0, 1] },
  { p: [0.5, -0.8], res: [-1, 0] },
]

function NumIn({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      step={0.5}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 rounded-lg border border-line bg-bg px-2 py-1 text-right font-mono text-[13px] text-fg outline-none focus:border-violet/60"
    />
  )
}

export default function ResidueLab() {
  const [poles, setPoles] = useState<Pole[]>(INITIAL)
  const [c, setC] = useState<Complex>([0, 0.1])
  const [rim, setRim] = useState<Complex>([1.35, 0.1])
  const r = Math.max(0.05, dist(c, rim))

  const f = useMemo(() => (z: Complex): Complex => poles.reduce<Complex>((s, q) => add(s, div(q.res, sub(z, q.p))), [0, 0]), [poles])
  const paint = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i, { dim: 0.55 }), [f])
  const inside = poles.filter((q) => dist(q.p, c) < r)
  const sumRes = inside.reduce<Complex>((s, q) => add(s, q.res), [0, 0])
  const predicted = mul([0, 2 * Math.PI], sumRes)
  const onCurve = poles.some((q) => Math.abs(dist(q.p, c) - r) < 0.03)
  const I = useMemo(() => circleIntegral(f, c, r, 4096), [f, c, r])

  const update = (i: number, patch: Partial<Pole>) => setPoles(poles.map((q, j) => (j === i ? { ...q, ...patch } : q)))

  return (
    <Widget
      title="Teorema dei residui"
      description="$f(z)=\sum_k\frac{c_k}{z-p_k}$ con poli semplici trascinabili e residui $c_k$ modificabili. Sposta e allarga la circonferenza: l'integrale numerico coincide con $2\pi i$ per la somma dei residui dei poli interni."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Panel label="Piano z">
          <Plane view={{ x: [-2.4, 2.4], y: [-1.7, 1.7] }} aspect={0.68} paint={paint} res={0.5}>
            <Circle c={c} r={r} color="#fff" width={2.5} fill="#fff" fillOpacity={0.06} />
            <OrientArrow at={add(c, [0, r])} dir={[-1, 0]} />
            <OrientArrow at={add(c, [0, -r])} dir={[1, 0]} />
            {poles.map((q, i) => {
              const inn = dist(q.p, c) < r
              return (
                <g key={i}>
                  <Handle p={q.p} onChange={(p) => update(i, { p })} color={inn ? PALETTE.pink : '#6b6a76'} r={7} />
                  <Label p={q.p} dx={12} dy={-10} color={inn ? PALETTE.fg : PALETTE.muted}>{`p${i + 1}`}</Label>
                </g>
              )
            })}
            <Handle p={c} onChange={(p) => { setRim([p[0] + r < 2.1 ? p[0] + r : p[0] - r, p[1]]); setC(p) }} r={5} />
            <Handle p={rim} onChange={setRim} color={PALETTE.violet} r={6} />
          </Plane>
        </Panel>
        <Card className="flex flex-col gap-3 p-5">
          <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Residui</div>
          {poles.map((q, i) => (
            <div key={i} className="flex items-center gap-2 text-[13px]">
              <span className={`w-7 font-mono ${dist(q.p, c) < r ? 'text-pink' : 'text-dim'}`}>p{i + 1}</span>
              <NumIn value={q.res[0]} onChange={(v) => update(i, { res: [v, q.res[1]] })} />
              <span className="text-muted">+</span>
              <NumIn value={q.res[1]} onChange={(v) => update(i, { res: [q.res[0], v] })} />
              <span className="text-muted">i</span>
            </div>
          ))}
          <div className="mt-1 flex gap-2">
            {poles.length < 5 && <Button onClick={() => setPoles([...poles, { p: [1.6, -0.2], res: [1, 0] }])}>+ polo</Button>}
            {poles.length > 1 && <Button onClick={() => setPoles(poles.slice(0, -1))}>− polo</Button>}
          </div>
        </Card>
      </div>
      <Stats
        items={[
          { label: 'poli interni', value: inside.length ? inside.map((q) => 'p' + (poles.indexOf(q) + 1)).join(', ') : 'nessuno' },
          { label: 'Σ Res interni', value: fmt(sumRes, 3) },
          { label: '2πi Σ Res', value: fmt(predicted, 4), tone: 'accent' },
          { label: '∮ f dz numerico', value: onCurve ? 'polo sul contorno' : fmt(I, 4), tone: onCurve ? 'bad' : undefined },
        ]}
      />
      <Hint>{String.raw`Prova a mettere due residui opposti dentro la curva: l'integrale si annulla anche se $f$ non è olomorfa all'interno. Il teorema non dice "nessuna singolarità ⇒ 0", dice che conta solo la somma dei residui.`}</Hint>
    </Widget>
  )
}
