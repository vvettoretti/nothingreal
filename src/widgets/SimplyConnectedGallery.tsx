import type { ReactNode } from 'react'
import { Text } from '../components/Math'
import { Card } from '../components/ui'

type Tile = { title: string; ok: boolean | null; why: string; hole: ReactNode; loop?: ReactNode }

const W = 200
const H = 130
const cx = W / 2
const cy = H / 2
// Circuito di prova: se il suo interno esce dal dominio, il dominio non è semplicemente connesso.
const loopAround = <ellipse cx={cx} cy={cy} rx={46} ry={32} className="fill-pink/15 stroke-pink" strokeWidth={1.8} strokeDasharray="5 4" />
const removed = 'stroke-bg'

const TILES: Tile[] = [
  { title: '$\\C$', ok: true, why: "Ogni circuito ha l'interno nel dominio.", hole: null, loop: <ellipse cx={cx} cy={cy} rx={46} ry={32} className="fill-violet/20 stroke-violet" strokeWidth={1.8} strokeDasharray="5 4" /> },
  {
    title: '$\\C\\setminus\\{z_0\\}$',
    ok: false,
    why: 'Connesso, ma un circuito attorno a $z_0$ ha il buco nel suo interno.',
    hole: <circle cx={cx} cy={cy} r={5} className="fill-bg stroke-fg" strokeWidth={1.5} />,
    loop: loopAround,
  },
  {
    title: '$\\C\\setminus\\{\\text{semiretta}\\}$',
    ok: true,
    why: 'Nessun circuito può girare attorno al taglio senza attraversarlo.',
    hole: <line x1={cx} y1={cy} x2={W} y2={cy} className={removed} strokeWidth={5} />,
    loop: <ellipse cx={cx - 45} cy={cy} rx={34} ry={28} className="fill-violet/20 stroke-violet" strokeWidth={1.8} strokeDasharray="5 4" />,
  },
  {
    title: '$\\C\\setminus[z_0,z_1]$',
    ok: false,
    why: 'Un circuito può girare attorno al segmento.',
    hole: <line x1={cx - 22} y1={cy} x2={cx + 22} y2={cy} className={removed} strokeWidth={5} />,
    loop: loopAround,
  },
  {
    title: '$\\C\\setminus\\{\\text{retta}\\}$',
    ok: null,
    why: 'Non è nemmeno connesso: due semipiani separati.',
    hole: <line x1={0} y1={cy} x2={W} y2={cy} className={removed} strokeWidth={5} />,
  },
]

export default function SimplyConnectedGallery() {
  return (
    <div className="my-6 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
      {TILES.map((t) => (
        <Card key={t.title} className="overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full bg-violet/10">
            {t.loop}
            {t.hole}
          </svg>
          <div className="px-4 py-3">
            <div className="flex items-baseline justify-between gap-2 text-[15px] text-fg">
              <Text>{t.title}</Text>
              <span className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${t.ok === true ? 'text-green' : t.ok === false ? 'text-red' : 'text-muted'}`}>
                {t.ok ? 'sì' : 'no'}
              </span>
            </div>
            <div className="mt-1 text-[13px] leading-snug text-muted">
              <Text>{t.why}</Text>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
