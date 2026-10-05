import { useMemo, useState } from 'react'
import { abs, div, exp, fmtNum, mul, scale, sub, type Complex } from '../../lib/complex'
import { domainColor, PALETTE } from '../../lib/color'
import { linspace } from '../../lib/real'
import { Plane, Seg } from '../../components/Plane'
import { Chart } from '../../components/Chart'
import { M } from '../../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, Widget } from '../../components/ui'

const PI = Math.PI
const I: Complex = [0, 1]

/** ∫_a^b e^{−2πixz} dx per z complesso. */
function boxHat(a: number, b: number, z: Complex): Complex {
  if (abs(z) < 1e-9) return [b - a, 0]
  const w = scale(mul(I, z), -2 * PI)
  return div(sub(exp(scale(w, b)), exp(scale(w, a))), w)
}

type Preset = { id: string; label: string; hat: (N: number, z: Complex) => Complex; explain: string }
const PRESETS: Preset[] = [
  { id: 'box', label: '1[−N, N]', hat: (N, z) => boxHat(-N, N, z), explain: '$\\hat f(z)=\\frac{\\sin(2\\pi Nz)}{\\pi z}$ è **intera**. Sull\'asse reale ha zeri isolati in $k/2N$, quindi non può annullarsi su un intervallo: per il principio d\'identità sarebbe identicamente nulla.' },
  { id: 'two', label: '1[−N, −N/2] + 2·1[N/3, N]', hat: (N, z) => { const a = boxHat(-N, -N / 2, z); const b = boxHat(N / 3, N, z); return [a[0] + 2 * b[0], a[1] + 2 * b[1]] }, explain: 'Un dato asimmetrico: $\\hat f$ è complessa sull\'asse reale (la tinta cambia lungo l\'asse) ma resta intera, con zeri isolati nel piano. Nessuna zona di $\\R$ dove sia nulla.' },
  { id: 'tri', label: 'triangolo di base [−N, N]', hat: (N, z) => { const s = boxHat(-N / 2, N / 2, z); return scale(mul(s, s), 1 / N) }, explain: 'Il triangolo è la convoluzione di due rettangoli, quindi $\\hat f$ è un sinc al quadrato: zeri **doppi** sull\'asse reale (guarda: due giri di colore attorno a ciascuno). Ancora intera, ancora non nulla su nessun intervallo.' },
]

export default function CompactSupportLab() {
  const [pid, setPid] = useState('box')
  const p = PRESETS.find((q) => q.id === pid)!
  const [N, setN] = useState(1)
  const paint = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(p.hat(N, z), out, i), [p, N])
  const ks = linspace(-3, 3, 900)
  const absLog = ks.map((k): [number, number] => { const m = abs(p.hat(N, [k, 0])); return [k, m > 1e-12 ? Math.log10(m) : NaN] })
  const y = 0.6
  const growth = abs(p.hat(N, [0, y]))

  return (
    <Widget
      title="Supporto compatto ⇒ trasformata intera"
      description="Se $f$ è nulla fuori da $[-N,N]$, la formula $\hat f(z)=\int_{-N}^{N}f(x)e^{-2\pi ixz}dx$ ha senso per ogni $z\in\C$ e definisce una funzione **olomorfa su tutto $\C$**. A sinistra il domain coloring di $\hat f$ (capitolo 1), a destra $\log_{10}|\hat f|$ sull'asse reale: picchi verso il basso negli zeri, mai un tratto piatto a $-\infty$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((q) => ({ value: q.id, label: 'f = ' + q.label }))} />
          <Slider label={<>semi-ampiezza del supporto <M>N</M></>} value={N} min={0.3} max={2} step={0.01} onChange={setN} display={fmtNum(N)} />
        </div>
        <Explain>{p.explain}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="f̂(z) per z = ξ + iη">
          <Plane view={{ x: [-3, 3], y: [-1.2, 1.2] }} aspect={0.5} paint={paint} res={0.5}>
            <Seg a={[-3, 0]} b={[3, 0]} color="#fff" width={1.5} opacity={0.7} />
          </Plane>
        </Panel>
        <Panel label="log₁₀ |f̂(ξ)| sull'asse reale">
          <Chart series={[{ points: absLog, color: PALETTE.pink, width: 1.8 }]} x={[-3, 3]} y={[-4, 1]} height={220} />
        </Panel>
      </div>
      <Stats
        items={[
          { label: 'supporto di f', value: `[−${fmtNum(N)}, ${fmtNum(N)}]` },
          { label: `|f̂(${y}i)|`, value: fmtNum(growth, 4), tone: 'accent' },
          { label: `ordine di grandezza: e^(2πN·${y})`, value: fmtNum(Math.exp(2 * PI * N * y), 4) },
        ]}
      />
      <Hint>{'Lungo l\'asse immaginario $|e^{-2\\pi ixz}|=e^{2\\pi x\\eta}$ cresce come $e^{2\\pi N|\\eta|}$: più largo è il supporto, più in fretta cresce $\\hat f$ fuori dall\'asse reale (teorema di Paley–Wiener). È per questo che $\\mathcal D$ non va bene come spazio di funzioni test per la trasformata: $\\mathcal F(\\mathcal D)\\cap\\mathcal D=\\{0\\}$.'}</Hint>
    </Widget>
  )
}
