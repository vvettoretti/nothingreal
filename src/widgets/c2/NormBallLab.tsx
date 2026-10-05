import { useMemo, useState } from 'react'
import { add, fmtNum, type Complex } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { Handle, Label, Plane, Poly, Seg } from '../../components/Plane'
import { M } from '../../components/Math'
import { Button, Explain, Hint, Panel, Slider, Stats, Widget } from '../../components/ui'
import { ballPts, fmtP, pnorm, pToSlider, sliderToP } from './pnorm'

function explain(p: number) {
  if (p < 1) return `Con $p=${fmtP(p)}<1$ la palla **non è convessa** e la formula $\\big(|x_1|^p+|x_2|^p\\big)^{1/p}$ non soddisfa la disuguaglianza triangolare: con $x=(1,0)$, $y=(0,1)$ si ha $\\|x+y\\|=2^{1/p}>2=\\|x\\|+\\|y\\|$. Non è una norma.`
  if (p === 1) return '$\\|x\\|_1=|x_1|+|x_2|$: la palla è un rombo. La disuguaglianza triangolare è un\'uguaglianza ogni volta che $x$ e $y$ stanno nello stesso quadrante.'
  if (p === 2) return 'La norma euclidea, l\'unica di questa famiglia che viene da un prodotto scalare. La palla è un cerchio e l\'uguaglianza nella triangolare vale solo per vettori paralleli e concordi.'
  if (p === Infinity) return '$\\|x\\|_\\infty=\\max_i|x_i|$: la palla è un quadrato. Sulle funzioni diventa la norma del sup, cioè la convergenza uniforme.'
  return `Per ogni $p\\ge1$ la palla è **convessa**, ed è esattamente questo che rende vera la triangolare (Minkowski). Al crescere di $p$ la palla si gonfia dal rombo verso il quadrato.`
}

export default function NormBallLab() {
  const [s, setS] = useState(pToSlider(2))
  const p = sliderToP(s)
  const [x, setX] = useState<Complex>([1.1, 0.25])
  const [y, setY] = useState<Complex>([-0.2, 0.9])
  const ball = useMemo(() => ballPts(p), [p])
  const refs = useMemo(() => [1, 2, Infinity].map((q) => ballPts(q, 120)), [])
  const xy = add(x, y)
  const nx = pnorm(x, p)
  const ny = pnorm(y, p)
  const nxy = pnorm(xy, p)
  const ok = nxy <= nx + ny + 1e-9
  // equivalenza con la norma euclidea in ℝ²: c‖v‖₂ ≤ ‖v‖_p ≤ C‖v‖₂
  const ratios = ball.map((v) => 1 / Math.hypot(v[0], v[1]))
  const c = Math.min(...ratios)
  const C = Math.max(...ratios)

  return (
    <Widget
      title="La palla unitaria di ‖·‖ₚ in ℝ²"
      description="La regione colorata è $\{v:\|v\|_p\le1\}$, i contorni tratteggiati sono le palle di $\|\cdot\|_1$, $\|\cdot\|_2$, $\|\cdot\|_\infty$. Trascina $x$ (viola) e $y$ (oro): il vettore rosa è $x+y$. Abbassando $p$ sotto 1 la disuguaglianza triangolare si rompe."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Slider label={<>esponente <M>p</M></>} value={s} min={0} max={1} step={0.002} onChange={setS} display={fmtP(p)} />
          <div className="flex flex-wrap gap-2">
            {[0.5, 1, 2, 4, Infinity].map((q) => (
              <Button key={q} active={p === q} onClick={() => setS(pToSlider(q))}>
                p = {fmtP(q)}
              </Button>
            ))}
            <Button onClick={() => { setX([1, 0]); setY([0, 1]) }}>x = e₁, y = e₂</Button>
          </div>
        </div>
        <Explain>{explain(p)}</Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel label="ℝ² con la norma ‖·‖ₚ">
          <Plane view={{ x: [-2.2, 2.2], y: [-1.7, 1.7] }} aspect={0.75} yUnit="">
            {refs.map((r, i) => (
              <Poly key={i} pts={r} color={PALETTE.muted} width={1} opacity={0.45} dash="4 4" />
            ))}
            <Poly pts={ball} color={PALETTE.violet} width={2.5} fill={PALETTE.violet} fillOpacity={0.14} closed />
            <Seg a={x} b={xy} color={PALETTE.gold} width={1.2} dash="4 4" opacity={0.6} />
            <Seg a={y} b={xy} color={PALETTE.violet} width={1.2} dash="4 4" opacity={0.6} />
            <Seg a={[0, 0]} b={xy} color={PALETTE.pink} width={2.5} />
            <Seg a={[0, 0]} b={x} color={PALETTE.violet} width={2.5} />
            <Seg a={[0, 0]} b={y} color={PALETTE.gold} width={2.5} />
            <Label p={xy} color={PALETTE.pink}>x + y</Label>
            <Handle p={x} onChange={setX} />
            <Handle p={y} onChange={setY} color={PALETTE.gold} />
          </Plane>
        </Panel>
        <div className="flex flex-col gap-4">
          <Stats
            items={[
              { label: '‖x‖ₚ', value: fmtNum(nx, 3) },
              { label: '‖y‖ₚ', value: fmtNum(ny, 3) },
              { label: '‖x + y‖ₚ', value: fmtNum(nxy, 3), tone: 'accent' },
              { label: '‖x‖ₚ + ‖y‖ₚ', value: fmtNum(nx + ny, 3) },
            ]}
          />
          <Stats
            items={[
              { label: 'disuguaglianza triangolare', value: ok ? 'vale' : 'violata', tone: ok ? 'good' : 'bad' },
              { label: 'c ≤ ‖v‖ₚ / ‖v‖₂ ≤ C', value: `${fmtNum(c, 3)} … ${fmtNum(C, 3)}` },
            ]}
          />
        </div>
      </div>
      <Hint>{String.raw`L'ultima riga è l'equivalenza delle norme in dimensione finita: il rapporto con la norma euclidea resta sempre tra due costanti positive (è il minimo e il massimo della distanza del bordo della palla dall'origine, al reciproco). Qui sotto vedrai che in $C^0([0,1])$ questo non succede più.`}</Hint>
    </Widget>
  )
}
