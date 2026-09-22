import { Box, Prose } from '../../components/Math'
import GrowthLab from '../../widgets/GrowthLab'

export default function Liouville() {
  return (
    <>
      <Box kind="teorema" title="Stime di Cauchy">
        {String.raw`
Se $f$ è olomorfa su un aperto che contiene $\overline{D(z_0,R)}$ e $M(R)=\max_{|z-z_0|=R}|f|$, allora
$$|f^{(n)}(z_0)|\le\frac{n!\,M(R)}{R^n},\qquad\text{cioè}\qquad|a_n|\le\frac{M(R)}{R^n}.$$
Si ottiene applicando la stima ML alla formula integrale per le derivate.
`}
      </Box>

      <Box kind="teorema" title="Liouville">
        {String.raw`
Una funzione **intera** (olomorfa su tutto $\C$) e **limitata** è costante.

Più in generale: se $f$ è intera e $|f(z)|\le C(1+|z|)^k$, allora $f$ è un polinomio di grado $\le k$.
`}
      </Box>

      <Prose>{String.raw`
La dimostrazione usa solo le stime di Cauchy: con $|f|\le M$ e $n=1$ si ha $|f'(z_0)|\le M/R$ per ogni $R$, quindi $f'(z_0)=0$ in ogni $z_0$. Il teorema dice che la **rigidità** delle olomorfe è globale: una funzione intera non costante deve andare all'infinito, almeno lungo qualche direzione. È il motivo per cui $\sin$ e $\cos$, così tranquille sull'asse reale, esplodono esponenzialmente lungo quello immaginario.
`}</Prose>

      <GrowthLab />

      <Box kind="osservazione" title="Applicazioni classiche">
        {String.raw`
- **Teorema fondamentale dell'algebra.** Se $p$ è un polinomio non costante senza zeri, allora $1/p$ è intera e tende a 0 all'infinito, quindi è limitata e per Liouville costante: assurdo. Per induzione, $p$ ha esattamente $\deg p$ radici contate con molteplicità.
- **Immagine densa.** Se $f$ è intera non costante, $f(\C)$ è denso in $\C$. Altrimenti esisterebbero $w_0$ e $\varepsilon$ con $|f(z)-w_0|\ge\varepsilon$ per ogni $z$, e $g=1/(f-w_0)$ sarebbe intera e limitata. Il piccolo teorema di Picard (non in programma) dice molto di più: $f(\C)$ manca al più un punto, come $e^z$ che manca solo lo 0.
- **Esercizio tipico**: se $f$ è intera e $\Re f\le c$, allora $f$ è costante. Basta applicare Liouville a $e^{f}$, che ha modulo $e^{\Re f}\le e^c$. Lo stesso trucco funziona con $\Im f$ limitata dall'alto o dal basso, oppure con $f$ che evita un semipiano.
`}
      </Box>

      <Box kind="esame">
        {String.raw`
"Esiste $f$ intera con $|f(z)|\le|z|^{3/2}$ e $f(1)=2$?" Per le stime di Cauchy $f$ è un polinomio di grado $\le 1$. Da $|f(0)|\le 0$ segue $f(z)=az$, e per $|z|\to 0$ serve $|a|\,|z|\le|z|^{3/2}$, cioè $a=0$. Quindi no. Negli esercizi di questo tipo **si confronta la crescita** di $f$ con le potenze di $|z|$.
`}
      </Box>
    </>
  )
}
