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
        lead: 'Richiami su ℂ, topologia, limiti e punto all’infinito. Come si guarda una funzione ℂ → ℂ.',
        Component: lazy(() => import('./c1/FunzioniComplesse')),
      },
      {
        slug: 'cauchy-riemann',
        title: 'Derivata complessa e Cauchy–Riemann',
        lead: 'Derivabile = differenziabile + C–R: localmente una rotodilatazione. Olomorfa = derivabile con f′ continua.',
        Component: lazy(() => import('./c1/CauchyRiemann')),
      },
      {
        slug: 'curve-jordan',
        title: 'Curve e teorema di Jordan',
        lead: 'Cammini, circuiti semplici, interno ed esterno, aperti semplicemente connessi.',
        Component: lazy(() => import('./c1/CurveJordan')),
      },
      {
        slug: 'integrali-cauchy',
        title: 'Integrali curvilinei e teoremi di Cauchy',
        lead: 'Il dizionario con le forme differenziali, le primitive, i teoremi di Cauchy e la formula integrale.',
        Component: lazy(() => import('./c1/IntegraliCauchy')),
      },
      {
        slug: 'serie-analiticita',
        title: 'Serie di potenze e analiticità',
        lead: 'Convergenza totale, Cauchy–Hadamard, funzioni elementari. Olomorfa ⇔ analitica.',
        Component: lazy(() => import('./c1/SerieAnaliticita')),
      },
      {
        slug: 'liouville',
        title: 'Teorema di Liouville',
        lead: 'Intera e limitata ⇒ costante. Crescita delle funzioni intere e teorema fondamentale dell’algebra.',
        Component: lazy(() => import('./c1/Liouville')),
      },
      {
        slug: 'singolarita-laurent',
        title: 'Singolarità e serie di Laurent',
        lead: 'Serie bilatere e corone. Eliminabili, poli, essenziali, e come si riconoscono dallo sviluppo.',
        Component: lazy(() => import('./c1/SingolaritaLaurent')),
      },
      {
        slug: 'residui',
        title: 'Teorema dei residui e applicazioni',
        lead: 'Calcolo dei residui e integrali reali: trigonometrici, razionali, oscillanti.',
        Component: lazy(() => import('./c1/Residui')),
      },
    ],
  },
]

export const allTopics = chapters.flatMap((c) => c.topics.map((t, i) => ({ ...t, chapter: c, index: i + 1 })))
