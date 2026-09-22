import { memo, useEffect, useMemo, useState } from 'react'
import { abs, arg, deg, dist, fmt, fmtNum, type Complex, type Fn } from '../lib/complex'
import { tryCompile } from '../lib/parse'
import { PALETTE } from '../lib/color'
import { Dot, GradPoly, Handle, Plane, Poly, Seg, type View } from '../components/Plane'
import { Button, Explain, FnInput, Hint, Panel, Segmented, Select, Stats, TwoPanels, Widget } from '../components/ui'

type Grid = 'cartesiana' | 'polare'
type Preset = { id: string; label: string; expr: string; grid: Grid; x: [number, number]; y: [number, number]; explain: string }

const PI = Math.PI
const PRESETS: Preset[] = [
  { id: 'z2', label: 'z²', expr: 'z^2', grid: 'cartesiana', x: [-1.5, 1.5], y: [-1.5, 1.5], explain: '$|w| = |z|^2$, $\\arg w = 2\\arg z$. Gli angoli raddoppiano: un settore di 90° diventa di 180°. In $z=0$ gli angoli tra curve non si conservano: lì $f\'(0)=0$.' },
  { id: 'z3', label: 'z³', expr: 'z^3', grid: 'polare', x: [-1.3, 1.3], y: [-1.3, 1.3], explain: 'Ogni raggio di angolo $\\theta$ va nel raggio di angolo $3\\theta$: il piano viene coperto 3 volte. Ogni $w\\neq 0$ ha esattamente 3 controimmagini, le radici cubiche.' },
  { id: 'inv', label: '1/z', expr: '1/z', grid: 'cartesiana', x: [-1.5, 1.5], y: [-1.5, 1.5], explain: 'Inversione rispetto al cerchio unitario composta con il coniugio: $|w|=1/|z|$ e $\\arg w=-\\arg z$. Le rette che non passano per 0 diventano circonferenze per l\'origine.' },
  { id: 'exp', label: 'eᶻ', expr: 'exp(z)', grid: 'cartesiana', x: [-1.5, 1.5], y: [-PI, PI], explain: '$e^{x+iy}=e^x(\\cos y+i\\sin y)$. Le rette orizzontali vanno in raggi e quelle verticali in circonferenze. È periodica di periodo $2\\pi i$: la striscia $|\\Im z|<\\pi$ copre $\\C\\setminus\\{0\\}$ una volta sola.' },
  { id: 'log', label: 'Log z (ramo principale)', expr: 'log(z)', grid: 'polare', x: [-2, 2], y: [-2, 2], explain: '$\\Log z = \\ln|z| + i\\Arg z$ con $\\Arg\\in(-\\pi,\\pi]$. È l\'inversa di $e^z$ sulla striscia: le circonferenze vanno in segmenti verticali e i raggi in rette orizzontali. Il taglio su $\\R^-$ produce il salto di $2\\pi i$.' },
  { id: 'sqrt', label: '√z (ramo principale)', expr: 'sqrt(z)', grid: 'cartesiana', x: [-1.5, 1.5], y: [-1.5, 1.5], explain: 'Dimezza gli argomenti: $\\C\\setminus\\R^-$ va nel semipiano $\\Re w>0$. Le rette orizzontali diventano rami di iperbole. Fai girare il punto attorno a 0: l\'immagine salta quando attraversi il taglio.' },
  { id: 'sin', label: 'sin z', expr: 'sin(z)', grid: 'cartesiana', x: [-PI / 2, PI / 2], y: [-1.2, 1.2], explain: '$\\sin(x+iy)=\\sin x\\cosh y + i\\cos x\\sinh y$. Le rette verticali vanno in iperboli e quelle orizzontali in ellissi, tutte con fuochi in $\\pm1$. Non è limitata: $|\\sin(iy)|=\\sinh|y|$.' },
  { id: 'jouk', label: 'z + 1/z (Žukovskij)', expr: 'z + 1/z', grid: 'polare', x: [-2, 2], y: [-2, 2], explain: 'Manda la circonferenza unitaria nel segmento $[-2,2]$ e le circonferenze $|z|=r$ in ellissi. $f(z)=f(1/z)$, quindi l\'interno e l\'esterno del disco hanno la stessa immagine. Da qui nascono i profili alari.' },
  { id: 'cay', label: '(z − i)/(z + i) (Cayley)', expr: '(z-i)/(z+i)', grid: 'cartesiana', x: [-2, 2], y: [0.001, 2.5], explain: 'Una trasformazione di Möbius che manda il semipiano superiore nel disco unitario: l\'asse reale va nella circonferenza e $i$ va in $0$. Le rette vanno in circonferenze, perché è conforme e manda circonferenze generalizzate in circonferenze generalizzate.' },
  { id: 'custom', label: 'Personalizzata…', expr: 'z^2 + 1/z', grid: 'cartesiana', x: [-2, 2], y: [-2, 2], explain: '' },
]

const SAMPLES = 260
type Line = Complex[]

function sourceLines(p: Preset, grid: Grid): Line[] {
  const lines: Line[] = []
  const [x0, x1] = p.x
  const [y0, y1] = p.y
  if (grid === 'cartesiana') {
    const n = 7
    for (let k = 0; k < n; k++) {
      const x = x0 + ((x1 - x0) * k) / (n - 1)
      lines.push(Array.from({ length: SAMPLES }, (_, j) => [x, y0 + ((y1 - y0) * j) / (SAMPLES - 1)] as Complex))
    }
    for (let k = 0; k < n; k++) {
      const y = y0 + ((y1 - y0) * k) / (n - 1)
      lines.push(Array.from({ length: SAMPLES }, (_, j) => [x0 + ((x1 - x0) * j) / (SAMPLES - 1), y] as Complex))
    }
  } else {
    const R = Math.min(Math.max(Math.abs(x0), Math.abs(x1)), Math.max(Math.abs(y0), Math.abs(y1)))
    for (let k = 1; k <= 6; k++) {
      const r = (R * k) / 6
      lines.push(Array.from({ length: SAMPLES + 1 }, (_, j) => [r * Math.cos(-PI + (2 * PI * j) / SAMPLES), r * Math.sin(-PI + (2 * PI * j) / SAMPLES)] as Complex))
    }
    for (let k = 0; k < 12; k++) {
      const t = -PI + (2 * PI * (k + 0.5)) / 12
      lines.push(Array.from({ length: SAMPLES }, (_, j) => {
        const r = R * (0.004 + (0.996 * j) / (SAMPLES - 1))
        return [r * Math.cos(t), r * Math.sin(t)] as Complex
      }))
    }
  }
  return lines
}

/** colore di ogni linea: posizione (cartesiana) o raggio/angolo (polare) */
function lineT(k: number, total: number, grid: Grid) {
  if (grid === 'cartesiana') {
    const n = total / 2
    return (k % n) / (n - 1)
  }
  return k < 6 ? k / 5 : (k - 6) / 11
}

function imageView(img: Line[]): { view: View; L: number } {
  const vals: number[] = []
  for (const l of img) for (const p of l) if (Number.isFinite(p[0]) && Number.isFinite(p[1])) vals.push(Math.max(Math.abs(p[0]), Math.abs(p[1])))
  vals.sort((a, b) => a - b)
  const q = vals[Math.floor(vals.length * 0.97)] ?? 1
  const L = Math.max(0.6, Math.min(q * 1.1, 60))
  return { view: { x: [-L, L], y: [-L, L] }, L }
}

const Lines = memo(function Lines({ lines, grid, jump }: { lines: Line[]; grid: Grid; jump?: number }) {
  return (
    <g>
      {lines.map((l, k) => (
        <GradPoly key={k} pts={l} from={lineT(k, lines.length, grid)} to={lineT(k, lines.length, grid)} width={2} jump={jump} />
      ))}
    </g>
  )
})

export default function ComplexExplorer() {
  const [pid, setPid] = useState('z2')
  const preset = PRESETS.find((p) => p.id === pid)!
  const [grid, setGrid] = useState<Grid>(preset.grid)
  const [custom, setCustom] = useState(PRESETS[PRESETS.length - 1].expr)
  const expr = pid === 'custom' ? custom : preset.expr
  const compiled = useMemo(() => tryCompile(expr), [expr])
  const [lastGood, setLastGood] = useState<Fn>(() => tryCompile('z^2').f!)
  useEffect(() => {
    if (compiled.f) setLastGood(() => compiled.f!)
  }, [compiled])
  const f = compiled.f ?? lastGood

  const [z, setZ] = useState<Complex>([0.6, 0.6])
  const [trail, setTrail] = useState<Complex[]>([])

  const choose = (id: string) => {
    const p = PRESETS.find((q) => q.id === id)!
    setPid(id)
    setGrid(p.grid)
    setTrail([])
    const cx = (p.x[0] + p.x[1]) / 2
    const cy = (p.y[0] + p.y[1]) / 2
    setZ([cx + (p.x[1] - p.x[0]) * 0.2, cy + (p.y[1] - p.y[0]) * 0.2])
  }

  const src = useMemo(() => sourceLines(preset, grid), [preset, grid])
  const img = useMemo(() => src.map((l) => l.map(f)), [src, f])
  const { view: wView, L } = useMemo(() => imageView(img), [img])
  const pad = 0.15 * Math.max(preset.x[1] - preset.x[0], preset.y[1] - preset.y[0])
  const zView: View = { x: [preset.x[0] - pad, preset.x[1] + pad], y: [preset.y[0] - pad, preset.y[1] + pad] }

  const moveZ = (p: Complex) => {
    setZ(p)
    setTrail((t) => (t.length && dist(t[t.length - 1], p) < 0.015 ? t : [...t.slice(-1500), p]))
  }

  const w = f(z)
  const imgTrail = useMemo(() => trail.map(f), [trail, f])

  return (
    <Widget
      title="Esploratore di funzioni complesse"
      description="A sinistra il piano $z$ (dominio), a destra il piano $w=f(z)$ (immagine). Trascina il punto viola nel piano di sinistra e osserva come si muove la sua immagine. Le linee della griglia mostrano come $f$ deforma l'intero piano: ogni linea ha lo stesso colore della sua immagine."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={choose} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <div className="flex flex-wrap items-center gap-2">
            <Segmented value={grid} onChange={(g) => setGrid(g)} options={[{ value: 'cartesiana', label: 'Griglia cartesiana' }, { value: 'polare', label: 'Polare' }]} />
            {trail.length > 1 && <Button onClick={() => setTrail([])}>Cancella traccia</Button>}
          </div>
        </div>
        {pid === 'custom' ? (
          <div className="flex flex-col gap-2">
            <FnInput value={custom} onChange={setCustom} error={compiled.error} />
            <div className="px-1 text-[13px] text-muted">Operatori: + − * / ^, funzioni sin cos tan exp log sqrt sinh cosh conj re im abs, costanti i e pi. La moltiplicazione può essere implicita: 2z, iz, z sin z.</div>
          </div>
        ) : (
          <Explain>{preset.explain}</Explain>
        )}
      </div>

      <TwoPanels>
        <Panel label="Piano z">
          <Plane view={zView}>
            <Lines lines={src} grid={grid} />
            <Poly pts={trail} color={PALETTE.violet} width={2} opacity={0.45} />
            <Seg a={[0, 0]} b={z} color={PALETTE.violet} width={2} />
            <Handle p={z} onChange={moveZ} />
          </Plane>
        </Panel>
        <Panel label="Piano w = f(z)">
          <Plane view={wView}>
            <Lines lines={img} grid={grid} jump={L * 0.6} />
            <Poly pts={imgTrail} color={PALETTE.pink} width={2} opacity={0.5} jump={L * 0.6} />
            <Dot p={w} />
          </Plane>
        </Panel>
      </TwoPanels>

      <Stats
        items={[
          { label: 'z', value: fmt(z) },
          { label: '|z|, arg(z)', value: `${fmtNum(abs(z))}, ${deg(arg(z))}` },
          { label: 'w = f(z)', value: fmt(w) },
          { label: '|w|, arg(w)', value: `${fmtNum(abs(w))}, ${deg(arg(w))}` },
        ]}
      />
      <Hint>{String.raw`Trascina il punto viola nel piano z. Prova a farlo girare intorno all'origine: la traccia mostra quante volte gira il punto immagine (per $z^n$ sono $n$ giri, per $\sqrt z$ e $\Log z$ c'è un salto sul taglio).`}</Hint>
    </Widget>
  )
}
