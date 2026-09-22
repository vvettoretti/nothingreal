import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type Topic = {
  slug: string
  title: string
  /** una riga, usata nella home e sotto il titolo */
  lead: string
  Component: LazyExoticComponent<ComponentType>
}

export type Chapter = { n: number; title: string; topics: Topic[] }

// Per aggiungere un argomento: crea un file in src/topics/ e aggiungilo qui.
export const chapters: Chapter[] = [
  {
    n: 1,
    title: 'Funzioni di variabile complessa',
    topics: [
      {
        slug: 'funzioni-complesse',
        title: 'Numeri complessi e funzioni',
        lead: 'Come si guarda una funzione ℂ → ℂ: deformazione del piano, domain coloring, rami.',
        Component: lazy(() => import('./c1/FunzioniComplesse')),
      },
      {
        slug: 'cauchy-riemann',
        title: 'Derivata complessa e Cauchy–Riemann',
        lead: 'Olomorfa = localmente una rotodilatazione. Perché ℂ-derivabile è molto più di ℝ²-differenziabile.',
        Component: lazy(() => import('./c1/CauchyRiemann')),
      },
      {
        slug: 'curve-jordan',
        title: 'Curve e teorema di Jordan',
        lead: 'Curve chiuse, semplici e non: interno, esterno e indice di avvolgimento.',
        Component: lazy(() => import('./c1/CurveJordan')),
      },
      {
        slug: 'integrali-cauchy',
        title: 'Integrali curvilinei e teoremi di Cauchy',
        lead: '∮ f dz come circolazione + i·flusso del campo di Pólya. Cauchy–Goursat e formula integrale.',
        Component: lazy(() => import('./c1/IntegraliCauchy')),
      },
      {
        slug: 'serie-analiticita',
        title: 'Serie di potenze e analiticità',
        lead: 'Il raggio di convergenza lo decide la singolarità più vicina, anche se non sta sull’asse reale.',
        Component: lazy(() => import('./c1/SerieAnaliticita')),
      },
      {
        slug: 'liouville',
        title: 'Teorema di Liouville',
        lead: 'Stime di Cauchy, crescita delle funzioni intere e teorema fondamentale dell’algebra.',
        Component: lazy(() => import('./c1/Liouville')),
      },
      {
        slug: 'singolarita-laurent',
        title: 'Singolarità e serie di Laurent',
        lead: 'Eliminabili, poli, essenziali. Laurent su corone diverse dà serie diverse.',
        Component: lazy(() => import('./c1/SingolaritaLaurent')),
      },
      {
        slug: 'residui',
        title: 'Teorema dei residui e applicazioni',
        lead: 'Calcolo dei residui, contorni che si chiudono all’infinito, lemma di Jordan.',
        Component: lazy(() => import('./c1/Residui')),
      },
    ],
  },
]

export const allTopics = chapters.flatMap((c) => c.topics.map((t, i) => ({ ...t, chapter: c, index: i + 1 })))
