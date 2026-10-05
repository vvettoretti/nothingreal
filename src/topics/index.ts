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
  {
    n: 2,
    title: 'Analisi funzionale, Fourier e distribuzioni',
    topics: [
      {
        slug: 'spazi-normati',
        title: 'Spazi normati, Banach e Lᵖ',
        lead: 'Norme, equivalenza in dimensione finita e non, completezza, Lebesgue e gli spazi Lᵖ.',
        Component: lazy(() => import('./c2/SpaziNormati')),
      },
      {
        slug: 'holder-convoluzione',
        title: 'Hölder, convoluzione e densità',
        lead: 'Esponenti coniugati, inclusioni tra Lᵖ, Fubini–Tonelli, Young, mollificatori e densità delle funzioni test.',
        Component: lazy(() => import('./c2/HolderConvoluzione')),
      },
      {
        slug: 'operatori-duale',
        title: 'Operatori lineari e spazio duale',
        lead: 'Continuo = limitato, la norma di un operatore, il duale e la rappresentazione di Riesz.',
        Component: lazy(() => import('./c2/OperatoriDuale')),
      },
      {
        slug: 'hilbert',
        title: 'Spazi di Hilbert e serie di Fourier astratta',
        lead: 'Prodotto scalare, parallelogramma, Pitagora, proiezioni, Bessel, Parseval e sistemi completi.',
        Component: lazy(() => import('./c2/Hilbert')),
      },
      {
        slug: 'serie-fourier',
        title: 'Serie di Fourier trigonometriche',
        lead: 'Estensione periodica, convergenza in L², puntuale e totale, Gibbs, Basilea.',
        Component: lazy(() => import('./c2/SerieFourier')),
      },
      {
        slug: 'trasformata-fourier',
        title: 'Trasformata di Fourier in L¹',
        lead: 'Definizione, continuità, Riemann–Lebesgue, regolarità contro decadimento, convoluzione.',
        Component: lazy(() => import('./c2/TrasformataFourier')),
      },
      {
        slug: 'schwartz-calore',
        title: 'Inversione, Schwartz, calore e L²',
        lead: 'Quando si torna indietro, lo spazio 𝒮, l’equazione del calore e il teorema di Plancherel.',
        Component: lazy(() => import('./c2/SchwartzCalore')),
      },
      {
        slug: 'distribuzioni',
        title: 'Funzioni test e distribuzioni',
        lead: 'Lo spazio 𝒟, funzionali continui, funzioni e misure come distribuzioni, la delta di Dirac.',
        Component: lazy(() => import('./c2/Distribuzioni')),
      },
      {
        slug: 'derivate-distribuzioni',
        title: 'Derivate e convergenza in 𝒟′',
        lead: 'Derivare tutto, salti che diventano delta, traslazioni, dilatazioni, limiti deboli.',
        Component: lazy(() => import('./c2/DerivateDistribuzioni')),
      },
      {
        slug: 'distribuzioni-temperate',
        title: 'Distribuzioni temperate e Fourier in 𝒮′',
        lead: 'Perché 𝒟 non basta, crescita lenta, la trasformata di δ, di 1 e delle onde pure.',
        Component: lazy(() => import('./c2/Temperate')),
      },
    ],
  },
]

export const allTopics = chapters.flatMap((c) => c.topics.map((t, i) => ({ ...t, chapter: c, index: i + 1 })))
