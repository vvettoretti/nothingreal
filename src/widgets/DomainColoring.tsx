import { useEffect, useMemo, useState } from 'react'
import { abs, arg, deg, fmt, fmtNum, type Complex, type Fn } from '../lib/complex'
import { tryCompile } from '../lib/parse'
import { domainColor } from '../lib/color'
import { Plane } from '../components/Plane'
import { Button, FnInput, Hint, Panel, Select, Slider, Stats, Widget } from '../components/ui'

const PRESETS = [
  { value: '(z^2-1)(z-2-i)^2/(z^2+2+2i)', label: 'Zeri e poli misti' },
  { value: 'z', label: 'z (identità)' },
  { value: 'z^3-1', label: 'z³ − 1' },
  { value: '1/z', label: '1/z' },
  { value: 'exp(z)', label: 'eᶻ' },
  { value: 'sin(z)', label: 'sin z' },
  { value: 'exp(1/z)', label: 'e^{1/z}' },
  { value: 'log(z)', label: 'Log z' },
  { value: 'sqrt(z^2-1)', label: '√(z² − 1)' },
  { value: 'conj(z)', label: 'z̄ (non olomorfa)' },
]

/** Legenda: ruota dei colori per arg f. */
function Wheel() {
  const cells = Array.from({ length: 72 }, (_, k) => {
    const t = (k / 72) * 2 * Math.PI
    const out = new Uint8ClampedArray(4)
    domainColor([Math.cos(t), Math.sin(t)], out, 0, { rings: false })
    const a0 = t - 0.05
    const a1 = t + (2 * Math.PI) / 72 + 0.01
    const R = 34
    const r = 20
    const p = (a: number, rr: number) => `${50 + rr * Math.cos(a)},${50 - rr * Math.sin(a)}`
    return <path key={k} d={`M${p(a0, r)} L${p(a0, R)} A${R},${R} 0 0 0 ${p(a1, R)} L${p(a1, r)} A${r},${r} 0 0 1 ${p(a0, r)}Z`} fill={`rgb(${out[0]},${out[1]},${out[2]})`} />
  })
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0">
      {cells}
      <text x="92" y="53" fontSize="8" fill="#9d9ca8">0</text>
      <text x="44" y="11" fontSize="8" fill="#9d9ca8">π/2</text>
      <text x="1" y="53" fontSize="8" fill="#9d9ca8">π</text>
    </svg>
  )
}

export default function DomainColoring({ initial = PRESETS[0].value, title = 'Domain coloring', description }: { initial?: string; title?: string; description?: string }) {
  const [expr, setExpr] = useState(initial)
  const compiled = useMemo(() => tryCompile(expr), [expr])
  const [f, setF] = useState<Fn>(() => tryCompile(initial).f ?? ((z: Complex) => z))
  useEffect(() => {
    if (compiled.f) setF(() => compiled.f!)
  }, [compiled])
  const [R, setR] = useState(3)
  const [rings, setRings] = useState(true)
  const [phase, setPhase] = useState(false)
  const [hover, setHover] = useState<Complex | null>(null)

  const paint = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i, { rings, phaseLines: phase }), [f, rings, phase])
  const w = hover ? f(hover) : null

  return (
    <Widget
      title={title}
      description={
        description ??
        'Ogni punto $z$ è colorato in base a $f(z)$: la **tinta** indica $\\arg f(z)$, gli **anelli di luminosità** indicano $|f(z)|$ (ogni anello raddoppia il modulo). Attorno a uno zero di ordine $k$ i colori ruotano $k$ volte in senso antiorario, attorno a un polo di ordine $k$ ruotano $k$ volte in senso orario.'
      }
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <Select value={PRESETS.some((p) => p.value === expr) ? expr : ''} onChange={(v) => v && setExpr(v)} options={[...PRESETS, ...(PRESETS.some((p) => p.value === expr) ? [] : [{ value: '', label: 'Personalizzata' }])]} />
          <FnInput value={expr} onChange={setExpr} error={compiled.error} />
        </div>
        <div className="flex flex-col gap-3">
          <Slider label="Semi-ampiezza della vista" value={Math.log10(R)} min={-1.3} max={1.5} step={0.01} onChange={(v) => setR(Math.pow(10, v))} display={fmtNum(R)} />
          <div className="flex flex-wrap gap-2">
            <Button active={rings} onClick={() => setRings(!rings)}>Anelli di modulo</Button>
            <Button active={phase} onClick={() => setPhase(!phase)}>Linee di fase</Button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Panel label="Piano z, colorato da f(z)">
          <Plane view={{ x: [-R, R], y: [-R, R] }} aspect={0.62} paint={paint} onHover={setHover} res={0.7} />
        </Panel>
        <Panel label="Legenda">
          <div className="flex flex-col items-center gap-4 text-[13px] leading-relaxed text-muted">
            <Wheel />
            <p>La tinta indica l'argomento, come in figura. Il modulo cresce di un fattore 2 a ogni anello, passando da scuro a chiaro. Il bianco segna i punti dove il calcolo dà ∞.</p>
          </div>
        </Panel>
      </div>
      <Stats
        items={[
          { label: 'z (cursore)', value: hover ? fmt(hover) : '—' },
          { label: 'f(z)', value: w ? fmt(w) : '—' },
          { label: '|f(z)|', value: w ? fmtNum(abs(w)) : '—' },
          { label: 'arg f(z)', value: w ? deg(arg(w)) : '—' },
        ]}
      />
      <Hint>{String.raw`Conta i giri di colore attorno a ogni punto notevole: $+k$ giri indica uno zero di ordine $k$, $-k$ giri un polo di ordine $k$. È il principio dell'argomento visto a occhio. Per $\bar z$ i colori girano al contrario senza che ci sia un polo: è il segno che $\bar z$ non è olomorfa.`}</Hint>
    </Widget>
  )
}
