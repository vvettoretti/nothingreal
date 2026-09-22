import { useMemo, useState } from 'react'
import { abs, arg, fmtNum, polar, type Complex } from '../lib/complex'
import { compile } from '../lib/parse'
import { domainColor, PALETTE } from '../lib/color'
import { Circle, Cross, Dot, GradPoly, Plane } from '../components/Plane'
import { M } from '../components/Math'
import { Explain, Hint, Panel, Select, Slider, Stats, TwoPanels, Widget } from '../components/ui'

const PRESETS = [
  { id: 'rem', label: 'sin z / z', expr: 'sin(z)/z', kind: 'eliminabile', explain: 'Singolarità **eliminabile**: $f$ è limitata vicino a 0 e si prolunga con $f(0)=1$. Il domain coloring è liscio, senza traccia del "buco", e l\'immagine della circonferenza non gira attorno a 0.' },
  { id: 'p1', label: '(eᶻ − 1)/z²', expr: '(exp(z)-1)/z^2', kind: 'polo di ordine 1', explain: 'A prima vista sembra un polo doppio, ma $e^z-1$ ha uno zero semplice in 0, quindi è un **polo semplice** con residuo 1. Ordine del polo = ordine al denominatore − ordine al numeratore.' },
  { id: 'p3', label: '1/z³', expr: '1/z^3', kind: 'polo di ordine 3', explain: '**Polo** di ordine 3: $|f|\\to\\infty$ e i colori girano 3 volte in senso orario. $f(\\gamma)$ gira 3 volte attorno a 0 in verso negativo.' },
  { id: 'ess', label: 'e^{1/z}', expr: 'exp(1/z)', kind: 'essenziale', explain: '**Essenziale**: dalla destra $|f|\\to\\infty$, dalla sinistra $|f|\\to0$, lungo l\'asse immaginario $|f|=1$. Zoomando il quadro non si stabilizza mai: in ogni intorno di 0 ci sono tutti i colori e tutti i moduli (Casorati–Weierstrass).' },
  { id: 'ess2', label: 'sin(1/z)', expr: 'sin(1/z)', kind: 'essenziale', explain: '**Essenziale**, con zeri in $1/(k\\pi)$ che si accumulano in 0. Ogni zoom rivela nuovi zeri: l\'indice di $f(\\gamma)$ attorno a 0 cresce senza limite al diminuire di $\\rho$. Non è una contraddizione, perché il principio dell\'argomento non si applica attraverso una singolarità essenziale.' },
]

export default function SingularityZoom() {
  const [pid, setPid] = useState('ess')
  const preset = PRESETS.find((p) => p.id === pid)!
  const f = useMemo(() => compile(preset.expr), [preset])
  const [lr, setLr] = useState(-0.3)
  const rho = Math.pow(10, lr)
  const L = rho * 1.7

  const paint = useMemo(() => (z: Complex, out: Uint8ClampedArray, i: number) => domainColor(f(z), out, i), [f])

  const { img, mn, mx, wind } = useMemo(() => {
    const n = 3000
    const img: Complex[] = []
    let mn = Infinity
    let mx = 0
    let tot = 0
    let prev = NaN
    for (let k = 0; k <= n; k++) {
      const w = f(polar(rho, (2 * Math.PI * k) / n))
      const m = abs(w)
      mn = Math.min(mn, m)
      mx = Math.max(mx, m)
      // scala radiale compressa: conserva l'argomento, |w| → log(1+|w|)
      img.push(polar(Math.log1p(m), arg(w)))
      const a = arg(w)
      if (!Number.isNaN(prev)) {
        let d = a - prev
        if (d > Math.PI) d -= 2 * Math.PI
        if (d < -Math.PI) d += 2 * Math.PI
        tot += d
      }
      prev = a
    }
    return { img, mn, mx, wind: Math.round(tot / (2 * Math.PI)) }
  }, [f, rho])

  const W = Math.max(1, ...img.map((p) => Math.max(Math.abs(p[0]), Math.abs(p[1])))) * 1.15

  return (
    <Widget
      title="Zoom sulla singolarità"
      description="A sinistra il domain coloring vicino a $z_0=0$ con la circonferenza $|z|=\rho$. A destra la sua immagine $f(\gamma)$, disegnata con il modulo compresso ($|w|\mapsto\log(1+|w|)$, l'argomento è esatto). Riduci $\rho$ e osserva cosa resta stabile e cosa no."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Select value={pid} onChange={setPid} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
          <Slider label={<>raggio <M>\rho</M> (scala log)</>} value={lr} min={-2} max={0.4} step={0.005} onChange={setLr} display={fmtNum(rho, 3)} />
        </div>
        <Explain>{preset.explain}</Explain>
      </div>
      <TwoPanels>
        <Panel label="Piano z vicino a 0">
          <Plane view={{ x: [-L, L], y: [-L, L] }} paint={paint} res={0.55}>
            <GradPoly width={3} pts={Array.from({ length: 241 }, (_, k) => polar(rho, (2 * Math.PI * k) / 240))} />
          </Plane>
        </Panel>
        <Panel label="f(γ), modulo compresso">
          <Plane view={{ x: [-W, W], y: [-W, W] }} labels={false}>
            <Circle c={[0, 0]} r={Math.log(2)} color={PALETTE.muted} width={1} dash="3 4" />
            <GradPoly pts={img} width={2} jump={W * 0.8} />
            <Cross p={[0, 0]} color={PALETTE.fg} size={5} />
            <Dot p={img[0]} r={5} />
          </Plane>
        </Panel>
      </TwoPanels>
      <Stats
        items={[
          { label: 'tipo', value: preset.kind, tone: 'accent' },
          { label: 'min |f| su |z| = ρ', value: fmtNum(mn, 3) },
          { label: 'max |f| su |z| = ρ', value: fmtNum(mx, 3) },
          { label: 'giri di f(γ) attorno a 0', value: String(wind) },
        ]}
      />
      <Hint>{String.raw`La circonferenza tratteggiata a destra corrisponde a $|w|=1$. Per un polo di ordine $m$ il numero di giri è $-m$ e il minimo di $|f|$ esplode. Per un'eliminabile i giri sono 0 e $\min|f|,\max|f|$ convergono entrambi a $|f(0)|$. Per un'essenziale $\min|f|\to 0$ e $\max|f|\to\infty$ insieme.`}</Hint>
    </Widget>
  )
}
