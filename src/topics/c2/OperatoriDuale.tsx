import { Box, Prose } from '../../components/Math'
import OperatorNormLab from '../../widgets/c2/OperatorNormLab'

export default function OperatoriDuale() {
  return (
    <>
      <Box kind="teorema" title="Operatori lineari continui">
        {String.raw`
Sia $T:X\to Y$ lineare tra spazi normati. Sono equivalenti:

1. $T$ è continuo in 0;
2. $T$ è continuo in ogni punto;
3. $\sup_{\|x\|_X\le1}\|Tx\|_Y<+\infty$.

Un tale $T$ si dice **continuo** o **limitato**, e
$$\|T\|=\sup_{\|x\|_X=1}\|Tx\|_Y=\sup_{x\neq0}\frac{\|Tx\|_Y}{\|x\|_X}$$
è la più piccola costante con $\|Tx\|_Y\le C\|x\|_X$ per ogni $x$. Lo spazio $\mathcal L(X,Y)$ degli operatori continui è normato da $\|T\|$, ed è di Banach se lo è $Y$.
`}
      </Box>

      <Prose>{String.raw`
Per riscalamento, la condizione sulla palla unitaria diventa la stima lineare $\|Tx\|\le C\|x\|$ su tutto $X$: è questa la forma da usare negli esercizi. In dimensione finita ogni operatore lineare è continuo. In dimensione infinita no, e la continuità dipende dalle norme scelte su dominio **e** codominio.
`}</Prose>

      <OperatorNormLab />

      <Box kind="richiamo" title="Gli esempi del corso">
        {String.raw`
1. **Moltiplicazione** per $\alpha\in L^\infty(\R^n)$ su $L^p$: $\|\alpha f\|_p\le\|\alpha\|_\infty\|f\|_p$, e $\|T\|=\|\alpha\|_{L^\infty}$.
2. **Convoluzione** con $\beta\in L^1$ su $L^p$: per Young $\|T\|\le\|\beta\|_{L^1}$ (uguaglianza ad esempio per $p=1$ o $\beta\ge0$).
3. **Derivata** $C^1([a,b])\to C^0([a,b])$ con $\|f\|_{C^1}=\|f\|_\infty+\|f'\|_\infty$: $\|f'\|_\infty\le\|f\|_{C^1}$, quindi $\|T\|\le1$ (anzi $=1$).
4. **Valutazione** $f\mapsto f(x_0)$ su $(C^0([a,b]),\|\cdot\|_\infty)$: funzionale continuo di norma 1.
`}
      </Box>

      <Box kind="definizione" title="Spazio duale">
        {String.raw`
I **funzionali** sono gli operatori a valori in $\mathbb K$. Il **duale** di $X$ è $X^*=\mathcal L(X,\mathbb K)$, ed è sempre di Banach (perché $\mathbb K$ è completo), anche quando $X$ non lo è.
`}
      </Box>

      <Box kind="teorema" title="Rappresentazione di Riesz del duale di Lᵖ">
        {String.raw`
Sia $p\in[1,\infty)$ e $q$ il coniugato. Per ogni $T\in(L^p(\Omega))^*$ esiste un'unica $g\in L^q(\Omega)$ con
$$Tf=\int_\Omega f\,g\quad\forall f\in L^p,\qquad \|T\|=\|g\|_{L^q}.$$
Quindi $(L^p)^*\cong L^q$ isometricamente. Per $p=\infty$ è falso: $L^1$ è solo un sottospazio proprio di $(L^\infty)^*$. In particolare $(L^2)^*\cong L^2$: $L^2$ è il suo stesso duale, e ha in più un prodotto scalare.
`}
      </Box>

      <Box kind="osservazione">
        {String.raw`
Riesz spiega anche il secondo esempio del widget. La valutazione $f\mapsto f(x_0)$ non è un elemento di $(L^1)^*$: se lo fosse sarebbe $\int f g$ con $g\in L^\infty$, ma $\int fg$ non vede i valori in un singolo punto. Per dare un senso a "$\int f\,\delta_{x_0}=f(x_0)$" servono le distribuzioni, alla fine del capitolo.
`}
      </Box>
    </>
  )
}
