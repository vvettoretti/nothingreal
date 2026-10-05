import { useMemo, useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { normP, sample, type RFn } from '../../lib/real'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../../components/ui'

type Op = {
  id: string
  label: string
  /** famiglia di prova fₙ */
  f: (n: number) => RFn
  /** Tfₙ: funzione (per gli operatori a valori funzione) oppure numero (funzionali) */
  T: (n: number) => RFn | number
  normX: (n: number) => number
  normY: (n: number) => number
  X: string
  Y: string
  /** ‖T‖, Infinity se illimitato */
  norm: number
  explain: string
}

const tent = (n: number, c = 0.5): RFn => (x) => Math.max(0, 1 - n * Math.abs(x - c))
const l1 = (f: RFn) => normP(f, 0, 1, 1, 6000)

const OPS: Op[] = [
  {
    id: 'evsup', label: 'δ(x₀): f ↦ f(1/2) su (C⁰, ‖·‖∞)', X: '‖·‖∞', Y: '|·|', norm: 1,
    f: (n) => tent(n), T: () => 1, normX: () => 1, normY: () => 1,
    explain: 'La valutazione in un punto è un funzionale lineare **limitato** rispetto al sup: $|f(x_0)|\\le\\|f\\|_\\infty$, con norma 1. Qualsiasi successione di prova dà rapporto $\\le 1$.',
  },
  {
    id: 'evl1', label: 'δ(x₀): f ↦ f(1/2) su (C⁰, ‖·‖₁)', X: '‖·‖₁', Y: '|·|', norm: Infinity,
    f: (n) => tent(n), T: () => 1, normX: (n) => 1 / n, normY: () => 1,
    explain: 'Stesso funzionale, norma diversa sul dominio. Le tende di altezza 1 e base $2/n$ hanno $\\|f_n\\|_1=1/n\\to0$ ma $f_n(1/2)=1$: il rapporto vale $n$. Il funzionale **non è continuo**, ed è il motivo per cui $\\delta$ non si può scrivere come $\\int f g$ con $g\\in L^\\infty$.',
  },
  {
    id: 'dsup', label: 'd/dx su (C¹, ‖·‖∞) → (C⁰, ‖·‖∞)', X: '‖·‖∞', Y: '‖·‖∞', norm: Infinity,
    f: (n) => (x) => Math.sin(n * Math.PI * x), T: (n) => (x) => n * Math.PI * Math.cos(n * Math.PI * x), normX: () => 1, normY: (n) => n * Math.PI,
    explain: 'Se su $C^1$ si mette solo la norma del sup, la derivata è **illimitata**: $\\sin(n\\pi x)$ ha sup 1 ma derivata con sup $n\\pi$. Oscillare velocemente costa poco in $\\|\\cdot\\|_\\infty$ e tantissimo nella derivata.',
  },
  {
    id: 'dc1', label: 'd/dx su (C¹, ‖·‖_C¹) → (C⁰, ‖·‖∞)', X: '‖·‖_C¹', Y: '‖·‖∞', norm: 1,
    f: (n) => (x) => Math.sin(n * Math.PI * x), T: (n) => (x) => n * Math.PI * Math.cos(n * Math.PI * x), normX: (n) => 1 + n * Math.PI, normY: (n) => n * Math.PI,
    explain: 'Con la norma giusta, $\\|f\\|_{C^1}=\\|f\\|_\\infty+\\|f\'\\|_\\infty$, la stessa derivata diventa continua: $\\|f\'\\|_\\infty\\le\\|f\\|_{C^1}$, quindi $\\|T\\|\\le1$. Il rapporto $\\frac{n\\pi}{1+n\\pi}$ tende a 1, quindi $\\|T\\|=1$.',
  },
  {
    id: 'mult', label: 'f ↦ α f con α(x) = 4x(1 − x), su L¹', X: '‖·‖₁', Y: '‖·‖₁', norm: 1,
    f: (n) => (x) => n * Math.max(0, 1 - n * Math.abs(x - 0.5 + 0.3 / n)), T: (n) => (x) => 4 * x * (1 - x) * n * Math.max(0, 1 - n * Math.abs(x - 0.5 + 0.3 / n)),
    normX: (n) => l1((x) => n * Math.max(0, 1 - n * Math.abs(x - 0.5 + 0.3 / n))), normY: (n) => l1((x) => 4 * x * (1 - x) * n * Math.max(0, 1 - n * Math.abs(x - 0.5 + 0.3 / n))),
    explain: 'Moltiplicare per $\\alpha\\in L^\\infty$ è limitato su ogni $L^p$, con $\\|T\\|=\\|\\alpha\\|_{L^\\infty}$. Le funzioni di prova si concentrano dove $|\\alpha|$ è massimo ($x=1/2$, $\\alpha=1$), e il rapporto sale verso 1 senza superarlo.',
  },
]

export default function OperatorNormLab() {
  const [oid, setOid] = useState('evl1')
  const op = OPS.find((o) => o.id === oid)!
  const [n, setN] = useState(5)
  const fn = op.f(n)
  const Tn = op.T(n)
  const nx = op.normX(n)
  const ny = op.normY(n)
  const ratios = useMemo(() => Array.from({ length: 30 }, (_, k): [number, number] => [k + 1, op.normY(k + 1) / op.normX(k + 1)]), [op])
  const yTop = Math.max(...ratios.map((r) => r[1])) * 1.1
  const isFun = typeof Tn === 'function'

  return (
    <Widget
      title="Limitato o no? La norma di un operatore"
      description="$\|T\|=\sup_{f\neq0}\frac{\|Tf\|_Y}{\|f\|_X}$. Si prova l'operatore su una famiglia $f_n$ e si guarda il rapporto: se resta sotto una costante l'operatore può essere continuo, se esplode non lo è. Lo stesso operatore cambia natura cambiando la norma."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={oid} onChange={setOid} options={OPS.map((o) => ({ value: o.id, label: o.label }))} />
          <Slider label={<>funzione di prova <M>f_n</M></>} value={n} min={1} max={30} step={1} onChange={setN} display={n} />
        </div>
        <Explain>{op.explain}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label={isFun ? 'fₙ e Tfₙ su [0, 1]' : 'fₙ su [0, 1] e il valore Tfₙ'}>
          <Chart
            series={[
              { points: sample(fn, 0, 1, 1201), color: PALETTE.violet, width: 2.2, fill: 0.12 },
              ...(isFun ? [{ points: sample(Tn as RFn, 0, 1, 1201), color: PALETTE.pink, width: 1.6 }] : [{ points: [[0.5, Tn as number]] as [number, number][], color: PALETTE.pink, dots: true, r: 6 }]),
            ]}
            x={[0, 1]}
            y={oid.startsWith('d') ? [-Math.max(4, n * Math.PI * 1.05), Math.max(4, n * Math.PI * 1.05)] : oid === 'mult' ? [-0.1, n * 1.1] : [-0.1, 1.2]}
            height={240}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.violet, label: 'fₙ' }, { color: PALETTE.pink, label: isFun ? 'Tfₙ' : 'Tfₙ = fₙ(1/2)' }]} />
          </div>
        </Panel>
        <Panel label="‖Tfₙ‖ / ‖fₙ‖ al variare di n">
          <Chart
            series={[
              ...(Number.isFinite(op.norm) ? [{ points: [[1, op.norm], [30, op.norm]] as [number, number][], color: PALETTE.green, dash: '5 4', width: 1.5 }] : []),
              { points: ratios, color: PALETTE.gold, dots: true, r: 3.5 },
              { points: [[n, ny / nx]], color: PALETTE.pink, dots: true, r: 6 },
            ]}
            x={[0, 31]}
            y={[0, Math.max(1.3, yTop)]}
            height={240}
            marker={n}
          />
        </Panel>
      </div>
      <Stats
        items={[
          { label: `‖fₙ‖ in ${op.X}`, value: fmtNum(nx, 4) },
          { label: `‖Tfₙ‖ in ${op.Y}`, value: fmtNum(ny, 4) },
          { label: 'rapporto', value: fmtNum(ny / nx, 4), tone: 'accent' },
          { label: '‖T‖', value: Number.isFinite(op.norm) ? fmtNum(op.norm) : '∞ (non continuo)', tone: Number.isFinite(op.norm) ? 'good' : 'bad' },
        ]}
      />
      <Hint>{'In dimensione finita ogni operatore lineare è continuo. Gli esempi illimitati qui sopra sono possibili solo perché $C^0$ e $C^1$ hanno dimensione infinita: c\'è sempre spazio per oscillare più in fretta o concentrarsi di più.'}</Hint>
    </Widget>
  )
}
