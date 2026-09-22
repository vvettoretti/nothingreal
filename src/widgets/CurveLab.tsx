import { useMemo, useState } from 'react'
import { fmt, polar, type Complex } from '../lib/complex'
import { PALETTE } from '../lib/color'
import { Cross, Dot, Handle, OrientArrow, Plane, Poly, Seg } from '../components/Plane'
import { Button, Explain, Hint, Panel, Select, Stats, Widget } from '../components/ui'

const PRESETS: { id: string; label: string; pts: Complex[]; explain: string }[] = [
  {
    id: 'fagiolo',
    label: 'Curva semplice (non convessa)',
    pts: [[-1.6, -0.4], [-0.9, -1.3], [0.4, -1.1], [1.6, -0.9], [1.5, 0.6], [0.5, 1.2], [0.2, 0.2], [-0.8, 1.1], [-1.7, 0.6]],
    explain: 'Una curva di Jordan: l\'indice vale $\\pm 1$ all\'interno e $0$ all\'esterno, e il raggio uscente dal punto di prova interseca la curva un numero dispari di volte esattamente quando il punto è interno. Trascina i vertici per creare un\'autointersezione e osserva cosa succede.',
  },
  {
    id: 'stella',
    label: 'Stella (pentagramma)',
    pts: [0, 2, 4, 1, 3].map((k) => polar(1.7, Math.PI / 2 + (2 * Math.PI * k) / 5)),
    explain: 'Non è semplice. Il pentagono centrale ha indice 2: il complementare ha ancora una sola componente illimitata, ma l\'"interno" si spezza in componenti con indici diversi. Il test di parità dice solo se l\'indice è pari o dispari.',
  },
  {
    id: 'otto',
    label: 'Otto',
    pts: [[0, 0], [1, 0.9], [1.9, 0.3], [1.8, -0.5], [1, -0.9], [0, 0], [-1, 0.9], [-1.8, 0.5], [-1.9, -0.3], [-1, -0.9]],
    explain: 'Due lobi percorsi in versi opposti: indice $+1$ in uno e $-1$ nell\'altro. Il segno dell\'indice dipende dall\'orientamento locale, non da quello "globale".',
  },
  {
    id: 'lumaca',
    label: 'Lumaca con cappio',
    pts: Array.from({ length: 12 }, (_, k) => {
      const t = (2 * Math.PI * k) / 12
      const r = 0.55 + 1.15 * Math.cos(t)
      return [r * Math.cos(t) - 0.2, r * Math.sin(t)] as Complex
    }),
    explain: 'La lumaca di Pascal $r = a + b\\cos\\theta$ con $b>a$: il cappio interno ha indice 2 e la regione esterna al cappio ha indice 1. Con $\\oint \\frac{dz}{z-q}$ questi numeri sono proprio i multipli di $2\\pi i$ che otterresti.',
  },
]

/** Catmull–Rom chiusa: curva C¹ per i punti di controllo. */
function spline(P: Complex[], per = 36): Complex[] {
  const n = P.length
  const out: Complex[] = []
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n]
    const p1 = P[i]
    const p2 = P[(i + 1) % n]
    const p3 = P[(i + 2) % n]
    for (let k = 0; k < per; k++) {
      const t = k / per
      const t2 = t * t
      const t3 = t2 * t
      const c = (a: number, b: number, c_: number, d: number) => 0.5 * (2 * b + (-a + c_) * t + (2 * a - 5 * b + 4 * c_ - d) * t2 + (-a + 3 * b - 3 * c_ + d) * t3)
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(out[0])
  return out
}

/** Indice di avvolgimento (algoritmo di Sunday, senza trigonometria). */
function winding(q: Complex, poly: Complex[]): number {
  let w = 0
  for (let i = 0; i < poly.length - 1; i++) {
    const a = poly[i]
    const b = poly[i + 1]
    const cross = (b[0] - a[0]) * (q[1] - a[1]) - (q[0] - a[0]) * (b[1] - a[1])
    if (a[1] <= q[1]) {
      if (b[1] > q[1] && cross > 0) w++
    } else if (b[1] <= q[1] && cross < 0) w--
  }
  return w
}

function segX(a: Complex, b: Complex, c: Complex, d: Complex): Complex | null {
  const r: Complex = [b[0] - a[0], b[1] - a[1]]
  const s: Complex = [d[0] - c[0], d[1] - c[1]]
  const den = r[0] * s[1] - r[1] * s[0]
  if (Math.abs(den) < 1e-12) return null
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den
  return t >= 0 && t < 1 && u >= 0 && u < 1 ? [a[0] + t * r[0], a[1] + t * r[1]] : null
}

const FILL: Record<string, [number, number, number, number]> = {
  '1': [167, 139, 250, 70],
  '-1': [217, 169, 91, 70],
  '2': [236, 111, 176, 110],
  '-2': [240, 113, 120, 110],
}

export default function CurveLab() {
  const [pid, setPid] = useState('fagiolo')
  const [pts, setPts] = useState<Complex[]>(PRESETS[0].pts)
  const [q, setQ] = useState<Complex>([0.9, -0.2])
  const preset = PRESETS.find((p) => p.id === pid)!

  const curve = useMemo(() => spline(pts), [pts])
  const selfX = useMemo(() => {
    const X: Complex[] = []
    const n = curve.length - 1
    for (let i = 0; i < n; i++)
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue
        const p = segX(curve[i], curve[i + 1], curve[j], curve[j + 1])
        if (p) X.push(p)
      }
    return X
  }, [curve])
  const area = useMemo(() => {
    let s = 0
    for (let i = 0; i < curve.length - 1; i++) s += curve[i][0] * curve[i + 1][1] - curve[i + 1][0] * curve[i][1]
    return s / 2
  }, [curve])

  const paint = useMemo(
    () => (z: Complex, out: Uint8ClampedArray, i: number) => {
      const w = winding(z, curve)
      const c = FILL[String(w)] ?? (w === 0 ? null : [127, 209, 168, 110])
      if (!c) {
        out[i + 3] = 0
        return
      }
      out[i] = c[0]
      out[i + 1] = c[1]
      out[i + 2] = c[2]
      out[i + 3] = c[3]
    },
    [curve],
  )

  const ind = winding(q, curve)
  const rayEnd: Complex = [4, q[1]]
  const hits = useMemo(() => {
    const H: Complex[] = []
    for (let i = 0; i < curve.length - 1; i++) {
      const p = segX(q, rayEnd, curve[i], curve[i + 1])
      if (p) H.push(p)
    }
    return H
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, curve])

  const arrows = [0.12, 0.45, 0.78].map((t) => {
    const k = Math.floor(t * (curve.length - 2))
    return { at: curve[k], dir: [curve[k + 1][0] - curve[k][0], curve[k + 1][1] - curve[k][1]] as Complex }
  })

  const choose = (id: string) => {
    setPid(id)
    setPts(PRESETS.find((p) => p.id === id)!.pts)
  }

  return (
    <Widget
      title="Interno, esterno, indice"
      description="Una curva chiusa $C^1$ passante per i punti viola, che puoi trascinare. Lo sfondo è colorato con l'indice di avvolgimento $\Ind_\gamma(z)$ di ogni punto: viola $=+1$, oro $=-1$, rosa $=+2$, trasparente $=0$. Il punto rosa è un punto di prova e da lì parte un raggio orizzontale."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={choose} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setPts([...pts].reverse())}>Inverti orientamento</Button>
            <Button onClick={() => setPts(preset.pts)}>Ripristina</Button>
          </div>
        </div>
        <Explain>{preset.explain}</Explain>
      </div>

      <Panel label="Piano z · colore = indice di avvolgimento">
        <Plane view={{ x: [-2.4, 2.4], y: [-1.9, 1.9] }} aspect={0.62} paint={paint} res={0.35}>
          <Seg a={q} b={rayEnd} color={PALETTE.pink} width={1.5} dash="5 5" opacity={0.8} />
          <Poly pts={curve} color={PALETTE.fg} width={2.5} />
          {arrows.map((a, i) => (
            <OrientArrow key={i} at={a.at} dir={a.dir} />
          ))}
          {selfX.map((p, i) => (
            <Cross key={i} p={p} color={PALETTE.red} size={5} />
          ))}
          {hits.map((p, i) => (
            <Dot key={i} p={p} r={4} color={PALETTE.pink} ring={false} />
          ))}
          {pts.map((p, i) => (
            <Handle key={i} p={p} r={6} onChange={(np) => setPts(pts.map((x, j) => (j === i ? np : x)))} />
          ))}
          <Handle p={q} onChange={setQ} color={PALETTE.pink} r={7} />
        </Plane>
      </Panel>

      <Stats
        items={[
          { label: 'Curva', value: selfX.length ? `${selfX.length} autointersez.` : 'semplice (Jordan)', tone: selfX.length ? 'bad' : 'good' },
          { label: 'Orientamento', value: area > 0 ? 'antiorario' : 'orario' },
          { label: `Ind(γ, ${fmt(q, 1)})`, value: String(ind), tone: 'accent' },
          { label: 'Intersezioni del raggio', value: `${hits.length} (${hits.length % 2 ? 'dispari' : 'pari'})` },
        ]}
      />
      <Hint>{String.raw`La parità delle intersezioni coincide sempre con la parità dell'indice. Per le curve semplici, dispari significa interno. Attraversando la curva l'indice cambia di $\pm1$, in base al verso con cui la curva passa. Le croci rosse segnano le autointersezioni.`}</Hint>
    </Widget>
  )
}
