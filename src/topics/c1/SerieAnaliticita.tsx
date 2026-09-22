import { Box, Prose } from '../../components/Math'
import TaylorLab from '../../widgets/TaylorLab'

export default function SerieAnaliticita() {
  return (
    <>
      <Box kind="richiamo" title="Serie di potenze in ℂ">
        {String.raw`
$\sum_{n\ge0}a_n(z-z_0)^n$ ha un **raggio di convergenza** $R\in[0,+\infty]$ dato da Cauchy–Hadamard, $\frac1R=\limsup_n|a_n|^{1/n}$. Il rapporto $|a_{n+1}/a_n|$ funziona solo quando il limite esiste. Valgono le seguenti proprietà:

- convergenza **assoluta** per $|z-z_0|<R$ e non convergenza per $|z-z_0|>R$; sul bordo può succedere di tutto ($\sum z^n/n^2$ converge ovunque su $|z|=1$, $\sum z^n$ da nessuna parte, $\sum z^n/n$ ovunque tranne in $z=1$);
- convergenza **uniforme** su ogni disco chiuso $|z-z_0|\le r<R$, ma in generale non su tutto il disco aperto;
- la somma è olomorfa nel disco e si deriva **termine a termine**, con lo stesso raggio: $f^{(k)}(z_0)=k!\,a_k$.
`}
      </Box>

      <Box kind="teorema" title="Analiticità delle funzioni olomorfe">
        {String.raw`
Se $f$ è olomorfa su $\Omega$ e $\overline{D(z_0,r)}\subset\Omega$, allora per $|z-z_0|<r$
$$f(z)=\sum_{n\ge0}a_n(z-z_0)^n,\qquad a_n=\frac{f^{(n)}(z_0)}{n!}=\frac1{2\pi i}\oint_{|\zeta-z_0|=r}\frac{f(\zeta)}{(\zeta-z_0)^{n+1}}\,d\zeta.$$
Il raggio della serie di Taylor è quindi **almeno la distanza di $z_0$ dal bordo di $\Omega$**, cioè dalla singolarità più vicina.
`}
      </Box>

      <Prose>{String.raw`
La dimostrazione sta in una riga: nella formula integrale si sviluppa il nucleo di Cauchy in serie geometrica,
$$\frac{1}{\zeta-z}=\frac{1}{(\zeta-z_0)\left(1-\frac{z-z_0}{\zeta-z_0}\right)}=\sum_{n\ge0}\frac{(z-z_0)^n}{(\zeta-z_0)^{n+1}},$$
la serie converge uniformemente per $\zeta$ sulla circonferenza e si scambia serie con integrale. Nel caso reale $C^\infty$ non implica analitica ($e^{-1/x^2}$), mentre in $\C$ olomorfa $\Leftrightarrow$ analitica.

Il widget qui sotto calcola i coefficienti esattamente con questa formula, discretizzando l'integrale su una circonferenza: è una FFT.
`}</Prose>

      <TaylorLab />

      <Box kind="osservazione" title="Conseguenze dell'analiticità">
        {String.raw`
- **Principio d'identità**: se $f,g$ sono olomorfe su $\Omega$ connesso e coincidono su un insieme con un punto di accumulazione in $\Omega$, allora $f\equiv g$. Per questo $\sin^2z+\cos^2z=1$ in $\C$ è gratis: vale su $\R$.
- **Zeri isolati**: se $f\not\equiv 0$ ogni zero ha un ordine finito $m$, $f(z)=(z-z_0)^mg(z)$ con $g(z_0)\ne0$. In domain coloring si vedono $m$ giri di colore.
- **Prolungamento analitico**: il prolungamento di una funzione, se esiste, è unico. Il raggio di convergenza "sa" dove sta l'ostacolo anche quando l'ostacolo non si vede sulla retta reale.
- $\sum a_n z^n$ con $a_n\in\R$ ha la stessa $R$ in $\R$ e in $\C$: il dominio di convergenza reale è $(-R,R)$ proprio perché lo è quello complesso.
`}
      </Box>

      <Box kind="esame">
        {String.raw`
Il raggio della serie di Taylor di una funzione "esplicita" si trova **senza calcolare i coefficienti**: si trova la singolarità più vicina al centro. Per esempio, $\frac{z}{e^z-1}$ in $0$ ha raggio $2\pi$ (la singolarità in $0$ è eliminabile, le altre sono in $\pm2\pi i$) e $\frac{1}{\cos z}$ in $0$ ha raggio $\pi/2$. Per la convergenza sul bordo invece bisogna ragionare termine per termine.
`}
      </Box>
    </>
  )
}
