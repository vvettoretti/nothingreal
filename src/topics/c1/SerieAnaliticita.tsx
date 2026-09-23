import { Box, Prose } from '../../components/Math'
import TaylorLab from '../../widgets/TaylorLab'

export default function SerieAnaliticita() {
  return (
    <>
      <Box kind="richiamo" title="Tipi di convergenza per serie di funzioni">
        {String.raw`
Per $\sum f_n(z)$ su un insieme $\Omega$: **puntuale** (converge in ogni punto), **assoluta** ($\sum|f_n(z)|$ converge), **uniforme** ($\sup_\Omega\big|\sum_{k>n}f_k\big|\to0$), **totale** ($\sum_n\sup_\Omega|f_n|<\infty$). Le implicazioni sono queste, e non ce ne sono altre:
$$\begin{array}{ccccc} & & \text{uniforme} & & \\ & \nearrow & & \searrow & \\ \text{totale} & & & & \text{puntuale} \\ & \searrow & & \nearrow & \\ & & \text{assoluta} & & \end{array}$$
La totale è quella che si usa sempre, perché permette di **scambiare serie e integrale**.
`}
      </Box>

      <Box kind="teorema" title="Serie di potenze: Abel e Cauchy–Hadamard">
        {String.raw`
Sia $\sum_{n\ge0}c_n(z-z_0)^n$ e sia
$$R = \Big(\limsup_{n}\sqrt[n]{|c_n|}\Big)^{-1}\in[0,+\infty].$$

- **Abel**: se la serie converge in un punto $w$, converge totalmente su ogni disco $B_r(z_0)$ con $r<|w-z_0|$.
- Converge assolutamente in $B_R(z_0)$, **totalmente** su ogni $\overline{B_r(z_0)}$ con $r<R$, e non converge fuori da $\overline{B_R(z_0)}$. Sul bordo può succedere di tutto.
- La somma è **olomorfa** in $B_R(z_0)$ e si deriva termine a termine, con lo stesso raggio (perché $\sqrt[n]{n}\to1$). Quindi è $C^\infty$ e $c_n=\dfrac{f^{(n)}(z_0)}{n!}$: è la sua serie di Taylor.
`}
      </Box>

      <Prose>{String.raw`
Il $\limsup$ serve quando $\sqrt[n]{|c_n|}$ non ha limite. Per esempio $\sum\frac{z^{2n}}{2n}$ ha i coefficienti dispari nulli, la radice vale 0 sui dispari e tende a 1 sui pari, e il $\limsup$ è 1, quindi $R=1$.
`}</Prose>

      <Box kind="definizione" title="Funzioni elementari">
        {String.raw`
$$e^z=\sum_{n\ge0}\frac{z^n}{n!},\qquad \sin z=\sum_{n\ge0}(-1)^n\frac{z^{2n+1}}{(2n+1)!},\qquad \cos z=\sum_{n\ge0}(-1)^n\frac{z^{2n}}{(2n)!}$$

Le tre serie hanno $R=+\infty$, quindi sono **intere**, e su $\R$ coincidono con quelle reali. Derivando termine a termine si ottiene $(e^z)'=e^z$ e $(\sin z)'=\cos z$.

- $e^{z+w}=e^ze^w$: la derivata di $e^ze^{\beta-z}$ è nulla, quindi il prodotto è costante e vale $e^\beta$. Ne segue $|e^{x+iy}|=e^x$.
- $\cos z=\frac{e^{iz}+e^{-iz}}2$, $\sin z=\frac{e^{iz}-e^{-iz}}{2i}$, $e^{iz}=\cos z+i\sin z$ e $\sin^2z+\cos^2z=1$ valgono su tutto $\C$.
- Però **$\sin$ e $\cos$ non sono limitate**: $|\sin(iy)|=\frac{|e^{-y}-e^{y}|}{2}\to+\infty$.
`}
      </Box>

      <Box kind="teorema" title="Olomorfa ⇔ analitica">
        {String.raw`
$f$ è **analitica** su $A$ se attorno a ogni punto $z_0\in A$ è somma di una serie di potenze centrata in $z_0$. Le serie di potenze sono analitiche nel loro disco, e vale
$$f \text{ olomorfa su } A \iff f \text{ analitica su } A.$$
I coefficienti sono dati dalla **formula di Cauchy per le derivate**:
$$c_n=\frac{f^{(n)}(z_0)}{n!}=\frac1{2\pi i}\int_{C_r(z_0)}\frac{f(w)}{(w-z_0)^{n+1}}\,dw,\qquad 0<r<d(z_0,\partial A).$$
La serie di Taylor converge in ogni disco $B_r(z_0)$ contenuto in $A$: il raggio è **almeno la distanza dalla singolarità più vicina**.
`}
      </Box>

      <Prose>{String.raw`
L'idea della dimostrazione ($\Rightarrow$): nella formula integrale su $C_R(z_0)$ si sviluppa il nucleo in serie geometrica,
$$\frac{1}{w-z}=\frac{1}{w-z_0}\cdot\frac{1}{1-\frac{z-z_0}{w-z_0}}=\sum_{n\ge0}\frac{(z-z_0)^n}{(w-z_0)^{n+1}},\qquad \Big|\tfrac{z-z_0}{w-z_0}\Big|<1.$$
La convergenza è totale su $C_R(z_0)$, quindi si scambiano serie e integrale. Il widget qui sotto calcola i coefficienti esattamente con questa formula, discretizzando l'integrale sulla circonferenza.
`}</Prose>

      <TaylorLab />

      <Box kind="osservazione" title="Conseguenze dell'analiticità">
        {String.raw`
- **Regolarità gratis**: olomorfa ($C^1$) implica $C^\infty$. Nel caso reale non è così, e ci sono funzioni $C^\infty$ non analitiche, come $e^{-1/x^2}$ in 0.
- **Principio d'identità**: se $A$ è connesso e $z_0\in A$, sono equivalenti: $f^{(n)}(z_0)=0$ per ogni $n$; $f=0$ su un disco $B_R(z_0)$; $f=0$ su tutto $A$. Quindi due funzioni olomorfe che coincidono su un disco coincidono ovunque.
- Il raggio "sa" dove sta l'ostacolo anche quando non si vede sulla retta reale: $\frac1{1+x^2}$ è regolare su tutto $\R$, ma in $0$ ha raggio 1 per colpa dei poli in $\pm i$.
`}
      </Box>

      <Box kind="esame">
        {String.raw`
Il raggio della serie di Taylor di una funzione "esplicita" si trova **senza calcolare i coefficienti**: basta trovare la singolarità più vicina al centro. Per esempio $\frac{1}{\cos z}$ in $0$ ha raggio $\pi/2$, e $\frac{1}{z^2+4}$ in $z_0=1$ ha raggio $|1-2i|=\sqrt5$. Per la convergenza sul bordo invece bisogna ragionare termine per termine.
`}
      </Box>
    </>
  )
}
