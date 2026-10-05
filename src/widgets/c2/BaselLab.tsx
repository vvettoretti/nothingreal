import { useState } from 'react'
import { fmtNum } from '../../lib/complex'
import { PALETTE } from '../../lib/color'
import { Chart, Legend } from '../../components/Chart'
import { M } from '../../components/Math'
import { Hint, Panel, Slider, Stats, TwoPanels, Widget } from '../../components/ui'

const PI = Math.PI
const NMAX = 40

export default function BaselLab() {
  const [N, setN] = useState(5)
  const s2: [number, number][] = []
  const s4: [number, number][] = []
  let a = 0
  let b = 0
  for (let n = 1; n <= NMAX; n++) {
    a += 1 / (n * n)
    b += 1 / n ** 4
    s2.push([n, a])
    s4.push([n, b])
  }
  const SN = (x: number) => {
    let s = (PI * PI) / 3
    for (let n = 1; n <= N; n++) s += ((4 * (-1) ** n) / (n * n)) * Math.cos(n * x)
    return s
  }
  const xs = Array.from({ length: 401 }, (_, k) => -PI + (2 * PI * k) / 400)

  return (
    <Widget
      title="Da x² alle somme notevoli"
      description="Con $f$ estensione periodica di $x^2$ su $[-\pi,\pi)$ si ha $S_f(x)=\frac{\pi^2}3+\sum_{n\ge1}\frac{4(-1)^n}{n^2}\cos nx$. Valutando in $x=\pi$ (convergenza puntuale) si ottiene $\sum\frac1{n^2}=\frac{\pi^2}6$; applicando Parseval si ottiene $\sum\frac1{n^4}=\frac{\pi^4}{90}$."
    >
      <Slider label={<>termini <M>N</M></>} value={N} min={1} max={NMAX} step={1} onChange={setN} display={N} />
      <TwoPanels>
        <Panel label="S_N(x) vicino a x = π">
          <Chart
            series={[
              { points: xs.map((x) => [x, x * x]), color: PALETTE.muted, width: 2, dash: '5 4' },
              { points: xs.map((x) => [x, SN(x)]), color: PALETTE.violet, width: 2.3 },
              { points: [[PI, SN(PI)]], color: PALETTE.pink, dots: true, r: 6 },
            ]}
            x={[-PI, PI]}
            y={[-0.5, 11]}
            height={220}
            marker={PI}
          />
        </Panel>
        <Panel label="somme parziali">
          <Chart
            series={[
              { points: [[1, (PI * PI) / 6], [NMAX, (PI * PI) / 6]], color: PALETTE.violet, dash: '5 4', width: 1.2 },
              { points: [[1, PI ** 4 / 90], [NMAX, PI ** 4 / 90]], color: PALETTE.gold, dash: '5 4', width: 1.2 },
              { points: s2, color: PALETTE.violet, dots: true, r: 2.5 },
              { points: s4, color: PALETTE.gold, dots: true, r: 2.5 },
            ]}
            x={[0, NMAX + 1]}
            y={[0.95, 1.7]}
            height={220}
            marker={N}
          />
          <div className="mt-2">
            <Legend items={[{ color: PALETTE.violet, label: 'Σ 1/n² → π²/6' }, { color: PALETTE.gold, label: 'Σ 1/n⁴ → π⁴/90' }]} />
          </div>
        </Panel>
      </TwoPanels>
      <Stats
        items={[
          { label: 'S_N(π)  →  π²', value: `${fmtNum(SN(PI), 5)} → ${fmtNum(PI * PI, 5)}` },
          { label: 'Σ 1/n² per n ≤ N', value: `${fmtNum(s2[N - 1][1], 6)}`, tone: 'accent' },
          { label: 'π²/6 − somma', value: fmtNum((PI * PI) / 6 - s2[N - 1][1], 4) },
          { label: 'π⁴/90 − Σ 1/n⁴ per n ≤ N', value: fmtNum(PI ** 4 / 90 - s4[N - 1][1], 3) },
        ]}
      />
      <Hint>{'La serie di $1/n^4$ converge molto più in fretta: lo scarto dopo $N$ termini è circa $\\frac1{3N^3}$, contro $\\frac1N$ per $1/n^2$. È la stessa gerarchia di decadimento dei coefficienti di Fourier, letta al contrario.'}</Hint>
    </Widget>
  )
}
