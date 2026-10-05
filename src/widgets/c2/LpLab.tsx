import { useMemo, useState } from 'react'
import { fmtNum, type Complex } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { Handle, Label, Plane, Poly } from '../../components/Plane'
import { Chart } from '../../components/Chart'
import { Explain, Hint, Panel, Segmented, Stats, Widget } from '../../components/ui'

type Where = 'zero' | 'inf'

/** ∫ di x^{-s} su [ε, 1] (zero) oppure su [1, R] (inf), con L = log10(1/ε) o log10(R). */
function partial(s: number, L: number, where: Where): number {
  const t = Math.pow(10, L)
  if (Math.abs(s - 1) < 1e-9) return Math.log(t)
  // zero: ∫_ε^1 x^{-s} = (1 − ε^{1−s})/(1−s); inf: ∫_1^R x^{-s} = (R^{1−s} − 1)/(1−s)
  return where === 'zero' ? (1 - Math.pow(t, s - 1)) / (1 - s) : (Math.pow(t, 1 - s) - 1) / (1 - s)
}

export default function LpLab() {
  const [where, setWhere] = useState<Where>('zero')
  const [pt, setPt] = useState<Complex>([0.4, 2])
  const a = pt[0]
  const p = pt[1]
  const s = a * p
  const inLp = where === 'zero' ? s < 1 : s > 1
  const exact = inLp ? Math.pow(where === 'zero' ? 1 / (1 - s) : 1 / (s - 1), 1 / p) : Infinity

  const paint = useMemo(
    () => (z: Complex, out: Uint8ClampedArray, i: number) => {
      const good = z[0] > 0 && z[1] >= 1 && (where === 'zero' ? z[0] * z[1] < 1 : z[0] * z[1] > 1)
      const inBox = z[0] > 0 && z[0] <= 2.1 && z[1] >= 1 && z[1] <= 4.2
      const c = !inBox ? [28, 27, 34] : good ? [52, 70, 62] : [62, 40, 50]
      out[i] = c[0]
      out[i + 1] = c[1]
      out[i + 2] = c[2]
      out[i + 3] = 255
    },
    [where],
  )
  const hyper: Complex[] = useMemo(() => Array.from({ length: 200 }, (_, k) => { const x = 0.24 + (k / 199) * 1.8; return [x, 1 / x] }), [])

  const curve = useMemo(() => Array.from({ length: 121 }, (_, k): [number, number] => [k / 20, partial(s, k / 20, where)]), [s, where])
  const fgraph = useMemo(() => {
    const xs = where === 'zero' ? Array.from({ length: 400 }, (_, k) => 0.002 + (k / 399) * 0.998) : Array.from({ length: 400 }, (_, k) => 1 + (k / 399) * 19)
    return xs.map((x): [number, number] => [x, Math.pow(x, -s)])
  }, [s, where])
  const end = partial(s, 6, where)

  return (
    <Widget
      title="Quando x^(−a) sta in Lᵖ?"
      description="$f(x)=x^{-a}$ su $(0,1)$ oppure su $(1,+\infty)$. Trascina il punto nel piano $(a,p)$: la zona verde è dove $\int|f|^p<\infty$. A destra l'integrale troncato $\int_\varepsilon^1|f|^p$ (o $\int_1^R$) al variare del taglio: se si stabilizza, $f\in L^p$."
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
        <div className="flex flex-col gap-3">
          <Segmented value={where} onChange={setWhere} options={[{ value: 'zero', label: 'su (0, 1): problema in 0' }, { value: 'inf', label: 'su (1, ∞): problema all’infinito' }]} />
        </div>
        <Explain>
          {where === 'zero'
            ? '$|f|^p=x^{-ap}$ è integrabile vicino a 0 se e solo se $ap<1$. Su un intervallo limitato le $L^p$ sono **annidate**: aumentare $p$ peggiora le singolarità, quindi $L^r\\subset L^p$ per $p<r$. Esempio del corso: $x^{-1/2}\\in L^p(0,1)$ per $p<2$, ma non per $p=2$.'
            : '$|f|^p=x^{-ap}$ è integrabile all\'infinito se e solo se $ap>1$. Qui succede il contrario: aumentare $p$ **aiuta** il decadimento. Esempio del corso: $1/x\\in L^p(1,\\infty)$ per ogni $p>1$, ma non in $L^1$. Mettendo insieme i due casi si vede che su $\\R$ non c\'è alcuna inclusione tra $L^1$ e $L^2$.'}
        </Explain>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel label="Piano (a, p)">
          <Plane view={{ x: [-0.1, 2.1], y: [0.6, 4.2] }} aspect={0.8} paint={paint} res={0.5} yUnit="">
            <Poly pts={hyper} color={PALETTE.fg} width={1.5} dash="5 4" opacity={0.8} />
            <Label p={[1.55, 1 / 1.55]} dy={-6} color={PALETTE.muted}>ap = 1</Label>
            <Handle p={pt} onChange={(q) => setPt([Math.min(2, Math.max(0.02, q[0])), Math.min(4, Math.max(1, q[1]))])} />
          </Plane>
        </Panel>
        <div className="flex flex-col gap-4">
          <Panel label={where === 'zero' ? '∫ di |f|ᵖ su [ε, 1]  vs  log₁₀(1/ε)' : '∫ di |f|ᵖ su [1, R]  vs  log₁₀ R'}>
            <Chart
              series={[{ points: curve, color: inLp ? PALETTE.green : PALETTE.red, width: 2.5 }, ...(inLp ? [{ points: curve.map(([x]) => [x, Math.pow(exact, p)] as [number, number]), color: PALETTE.muted, dash: '4 4', width: 1 }] : [])]}
              x={[0, 6]}
              y={[0, Math.max(3, Math.min(12, end * 1.1))]}
              height={200}
            />
          </Panel>
          <Panel label={where === 'zero' ? '|f|ᵖ = x^(−ap) su (0, 1)' : '|f|ᵖ = x^(−ap) su (1, 20)'}>
            <Chart series={[{ points: fgraph, color: PALETTE.violet, width: 2, fill: 0.15 }]} x={where === 'zero' ? [0, 1] : [1, 20]} y={[0, where === 'zero' ? 12 : 1.05]} height={150} />
          </Panel>
        </div>
      </div>
      <Stats
        items={[
          { label: 'a', value: fmtNum(a, 3) },
          { label: 'p', value: fmtNum(p, 3) },
          { label: 'ap', value: fmtNum(s, 3), tone: 'accent' },
          { label: <>‖f‖<sub>p</sub></>, value: inLp ? fmtNum(exact, 4) : '∞', tone: inLp ? 'good' : 'bad' },
        ]}
      />
      <Hint>{String.raw`Prova $a=1/2$: su $(0,1)$ sta in $L^1$ ma non in $L^2$. Poi passa all'infinito con $a=1$: sta in $L^2$ ma non in $L^1$. Il bordo $ap=1$ è sempre escluso, perché lì l'integrale cresce come $\log$, lentamente ma senza limite.`}</Hint>
    </Widget>
  )
}
