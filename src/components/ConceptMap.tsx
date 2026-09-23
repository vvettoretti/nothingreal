import { Link } from 'react-router'
import { Text } from './Math'

type Node = { text: string; to: string }
type Step = { via?: string; nodes: Node[] }

// La catena logica del capitolo 1, nell'ordine in cui la costruisce il corso.
const STEPS: Step[] = [
  { nodes: [{ text: '$f$ derivabile in $z_0$ $\\iff$ $U,V$ differenziabili + C–R', to: '/cauchy-riemann' }] },
  {
    via: '+ $f\'$ continua',
    nodes: [
      { text: '$f$ **olomorfa** $\\iff$ $(u,-v)$, $(v,u)$ irrotazionali', to: '/integrali-cauchy' },
      { text: '$f$ ha **primitiva** $\\iff$ $\\int_\\gamma f=0$ su ogni circuito', to: '/integrali-cauchy' },
    ],
  },
  {
    via: 'Gauss–Green',
    nodes: [
      { text: '**Cauchy**: $\\int_\\gamma f=0$ se l\'interno di $\\gamma$ sta in $A$', to: '/integrali-cauchy' },
      { text: '$A$ semplicemente connesso ⇒ esiste la primitiva', to: '/curve-jordan' },
    ],
  },
  { via: 'circuiti equivalenti', nodes: [{ text: '**Formula integrale** $f(z_0)=\\frac1{2\\pi i}\\int_\\gamma\\frac{f(z)}{z-z_0}dz$', to: '/integrali-cauchy' }] },
  {
    via: 'serie geometrica',
    nodes: [
      { text: 'olomorfa $\\iff$ **analitica**, formula per le derivate', to: '/serie-analiticita' },
      { text: '**Liouville** ⇒ teorema fondamentale dell\'algebra', to: '/liouville' },
      { text: '**principio d\'identità**', to: '/serie-analiticita' },
    ],
  },
  {
    via: 'su una corona',
    nodes: [
      { text: '**Laurent**: parte singolare + parte regolare', to: '/singolarita-laurent' },
      { text: 'eliminabile · polo · essenziale', to: '/singolarita-laurent' },
    ],
  },
  { via: 'sopravvive solo $c_{-1}$', nodes: [{ text: '**Teorema dei residui** ⇒ integrali reali', to: '/residui' }] },
]

export default function ConceptMap() {
  return (
    <div className="flex flex-col items-center">
      {STEPS.map((s, i) => (
        <div key={i} className="flex w-full flex-col items-center">
          {s.via && (
            <div className="flex flex-col items-center py-1.5">
              <div className="h-4 w-px bg-line" />
              <div className="rounded-full border border-line bg-bg px-3 py-0.5 text-[12px] text-dim">
                <Text>{s.via}</Text>
              </div>
              <svg width="10" height="14" viewBox="0 0 10 14" className="text-line">
                <path d="M5 0v12M1 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
          )}
          <div className="flex w-full flex-wrap justify-center gap-3">
            {s.nodes.map((n) => (
              <Link
                key={n.text}
                to={n.to}
                className="min-w-0 max-w-full rounded-xl border border-line bg-card px-4 py-2.5 text-center text-[14px] leading-snug text-[#c9c8d2] transition hover:border-violet/50 hover:bg-card-2 sm:max-w-[340px]"
              >
                <Text>{n.text}</Text>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
