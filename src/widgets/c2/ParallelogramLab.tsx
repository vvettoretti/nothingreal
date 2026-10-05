import { useMemo, useState } from 'react'
import { add, fmtNum, sub, type Complex } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { Handle, Label, Plane, Poly, Seg } from '../../components/Plane'
import { Chart } from '../../components/Chart'
import { M } from '../../components/Math'
import { Button, Explain, Hint, Panel, Slider, Stats, Widget } from '../../components/ui'
import { ballPts, fmtP, pnorm, pToSlider, sliderToP } from './pnorm'

export default function ParallelogramLab() {
  const [s, setS] = useState(pToSlider(1))
  const p = sliderToP(s)
  const [x, setX] = useState<Complex>([1, 0])
  const [y, setY] = useState<Complex>([0, 1])
  const ball = useMemo(() => ballPts(p), [p])
  const lhs = (q: number) => pnorm(add(x, y), q) ** 2 + pnorm(sub(x, y), q) ** 2
  const rhs = (q: number) => 2 * (pnorm(x, q) ** 2 + pnorm(y, q) ** 2)
  const L = lhs(p)
  const R = rhs(p)
  const curve = useMemo(() => {
    const out: [number, number][] = []
    for (let k = 0; k <= 200; k++) {
      const q = 1 + (k / 200) * 9
      out.push([q, lhs(q) / rhs(q)])
    }
    return out
  }, [x[0], x[1], y[0], y[1]])
  const ok = Math.abs(L - R) < 1e-6 * Math.max(1, R)
  // ortogonalità "alla Pitagora" con la norma p
  const pyth = pnorm(add(x, y), p) ** 2 - pnorm(x, p) ** 2 - pnorm(y, p) ** 2
  const dot = x[0] * y[0] + x[1] * y[1]

  return (
    <Widget
      title="Identità del parallelogramma"
      description="Una norma viene da un prodotto scalare se e solo se $\|x+y\|^2+\|x-y\|^2=2\big(\|x\|^2+\|y\|^2\big)$ per ogni $x,y$: la somma dei quadrati delle diagonali è la somma dei quadrati dei lati. Trascina $x$ e $y$ e cambia $p$: l'uguaglianza regge solo per $p=2$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Slider label={<>norma <M>\|\cdot\|_p</M></>} value={s} min={pToSlider(1)} max={1} step={0.002} onChange={setS} display={fmtP(p)} />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, Infinity].map((q) => (
              <Button key={q} active={p === q} onClick={() => setS(pToSlider(q))}>
                p = {fmtP(q)}
              </Button>
            ))}
          </div>
        </div>
        <Explain>{'L\'esempio del corso in $L^1([0,2])$ con $f=\\mathbf 1_{[0,1]}$, $g=\\mathbf 1_{(1,2]}$ è lo stesso fenomeno di $x=e_1$, $y=e_2$ in $\\R^2$ con $\\|\\cdot\\|_1$: le diagonali hanno norma 2, quindi il primo membro vale 8 contro 4. Con $p=2$ la diagonale è $\\sqrt2$ e tutto torna. Solo $L^2$, fra gli $L^p$, è uno spazio di Hilbert.'}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <Panel label="ℝ² con ‖·‖ₚ: lati e diagonali">
          <Plane view={{ x: [-2, 2.4], y: [-1.6, 1.8] }} aspect={0.78} yUnit="">
            <Poly pts={ball} color={PALETTE.violet} width={1.2} opacity={0.5} fill={PALETTE.violet} fillOpacity={0.06} closed />
            <Poly pts={[[0, 0], x, add(x, y), y]} color={PALETTE.muted} width={1} closed dash="3 4" />
            <Seg a={[0, 0]} b={add(x, y)} color={PALETTE.pink} width={2.5} />
            <Seg a={y} b={x} color={PALETTE.green} width={2.5} />
            <Seg a={[0, 0]} b={x} color={PALETTE.violet} width={2.5} />
            <Seg a={[0, 0]} b={y} color={PALETTE.gold} width={2.5} />
            <Label p={add(x, y)} color={PALETTE.pink}>x + y</Label>
            <Label p={[(x[0] + y[0]) / 2, (x[1] + y[1]) / 2]} color={PALETTE.green}>x − y</Label>
            <Handle p={x} onChange={setX} />
            <Handle p={y} onChange={setY} color={PALETTE.gold} />
          </Plane>
        </Panel>
        <Panel label="rapporto diagonali² / (2 · lati²) al variare di p">
          <Chart
            series={[
              { points: [[1, 1], [10, 1]], color: PALETTE.muted, dash: '4 4', width: 1 },
              { points: curve, color: PALETTE.gold, width: 2.5 },
              ...(Number.isFinite(p) ? [{ points: [[p, L / R]] as [number, number][], color: PALETTE.pink, dots: true, r: 6 }] : []),
            ]}
            x={[1, 10]}
            y={[0.4, 2.2]}
            height={260}
            marker={2}
          />
        </Panel>
      </div>
      <Stats
        items={[
          { label: '‖x+y‖² + ‖x−y‖²', value: fmtNum(L, 4) },
          { label: '2(‖x‖² + ‖y‖²)', value: fmtNum(R, 4) },
          { label: 'identità', value: ok ? 'vale' : `scarto ${fmtNum(L - R, 3)}`, tone: ok ? 'good' : 'bad' },
          { label: '‖x+y‖² − ‖x‖² − ‖y‖²  ·  x·y', value: `${fmtNum(pyth, 3)} · ${fmtNum(dot, 3)}` },
        ]}
      />
      <Hint>{'L\'ultima colonna è Pitagora: con $p=2$ si ha $\\|x+y\\|^2-\\|x\\|^2-\\|y\\|^2=2\\,x\\cdot y$, quindi vale zero esattamente quando $x\\perp y$. Con le altre norme non c\'è un prodotto scalare che definisca l\'ortogonalità, e la quantità non ha questo significato.'}</Hint>
    </Widget>
  )
}
