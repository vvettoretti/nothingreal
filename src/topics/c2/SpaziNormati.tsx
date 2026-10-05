import { Box, Prose } from '../../components/Math'
import LpLab from '../../widgets/c2/LpLab'
import NormBallLab from '../../widgets/c2/NormBallLab'
import NormSequenceLab from '../../widgets/c2/NormSequenceLab'

export default function SpaziNormati() {
  return (
    <>
      <Box kind="definizione" title="Norma, spazio normato">
        {String.raw`
Una **norma** su uno spazio vettoriale $X$ (su $\mathbb K=\R$ o $\C$) è una funzione $\|\cdot\|:X\to[0,+\infty)$ tale che

1. $\|x\|=0\iff x=0$;
2. $\|\lambda x\|=|\lambda|\,\|x\|$;
3. $\|x+y\|\le\|x\|+\|y\|$ (disuguaglianza triangolare).

Ogni spazio normato è metrico con $d(x,y)=\|x-y\|$: si parla di palle, aperti, limiti, serie e funzioni continue esattamente come in $\R^n$.
`}
      </Box>

      <Prose>{String.raw`
Gli esempi di base sono $\R^n$ con $\|x\|_2$, $\|x\|_1=\sum|x_i|$, $\|x\|_\infty=\max|x_i|$, e gli spazi di funzioni $C^0([a,b])$ con $\|f\|_\infty=\max|f|$ oppure $\|f\|_1=\int_a^b|f|$, e $C^k([a,b])$ con $\|f\|_{C^k}=\|f\|_\infty+\sum_{j\le k}\|f^{(j)}\|_\infty$. Convergere in $\|\cdot\|_\infty$ significa convergere **uniformemente**.

La differenza fondamentale è la dimensione. In $\R^n$ tutte le norme sono **equivalenti**: esistono $C,\tilde C>0$ con $C\|x\|_2\le\|x\|_1\le\tilde C\|x\|_2$, quindi definiscono gli stessi aperti e le stesse successioni convergenti. $C^0([a,b])$ contiene tutti i polinomi e ha dimensione infinita, e lì l'equivalenza cade.
`}</Prose>

      <NormBallLab />

      <NormSequenceLab />

      <Box kind="definizione" title="Successioni di Cauchy, spazi di Banach">
        {String.raw`
$\{x_n\}$ è **di Cauchy** se $\forall\varepsilon>0\ \exists n_0$ tale che $\|x_n-x_m\|<\varepsilon$ per $n,m\ge n_0$. Ogni successione convergente è di Cauchy, e ogni successione di Cauchy è limitata. Lo spazio è **completo** se vale il viceversa, e uno spazio normato completo si chiama **spazio di Banach**.

- $\R^n$, $\C^n$, $\big(C^k(\overline\Omega),\|\cdot\|_{C^k}\big)$ e $\big(C^0([a,b]),\|\cdot\|_\infty\big)$ sono di Banach.
- $\big(C^0([a,b]),\|\cdot\|_1\big)$ **non** lo è (la rampa qui sopra), come $\Q$ non è completo: $(1+\frac1n)^n\to e\notin\Q$.
- I sottospazi **chiusi** di uno spazio di Banach sono di Banach.
`}
      </Box>

      <Prose>{String.raw`
Per rendere completa la norma $\int|f|$ bisogna cambiare integrale. Con l'integrale di **Lebesgue** vale il teorema che manca a Riemann:
`}</Prose>

      <Box kind="teorema" title="Convergenza dominata (Lebesgue)">
        {String.raw`
Se $f_n\to f$ quasi ovunque in $\Omega$ ed esiste $g$ integrabile con $|f_n|\le g$ q.o. per ogni $n$, allora $f$ è integrabile e
$$\lim_n\int_\Omega f_n=\int_\Omega f,\qquad \lim_n\int_\Omega|f_n-f|=0.$$
Con Riemann fallisce: se $f_n$ è l'indicatrice dei primi $n$ razionali di $[0,1]$, ogni $\int f_n=0$, ma il limite puntuale $\mathbf 1_{\Q\cap[0,1]}$ non è Riemann-integrabile.
`}
      </Box>

      <Box kind="definizione" title="Spazi Lᵖ">
        {String.raw`
Si identificano le funzioni uguali quasi ovunque (altrimenti $\|f\|=0$ non implicherebbe $f=0$). Per $1\le p<\infty$
$$L^p(\Omega)=\Big\{f:\ \|f\|_{L^p}=\Big(\int_\Omega|f|^p\Big)^{1/p}<\infty\Big\},$$
e $L^\infty(\Omega)$ sono le funzioni **essenzialmente limitate**, con $\|f\|_{L^\infty}=\inf\{K: |f|\le K\text{ q.o.}\}$. La triangolare è la **disuguaglianza di Minkowski**, falsa per $p<1$.

**Teorema.** $L^p(\Omega)$ è di Banach per ogni $p\in[1,+\infty]$.
`}
      </Box>

      <LpLab />

      <Box kind="esame" title="Esempi da tenere a mente">
        {String.raw`
- $\frac1x\in L^p(1,+\infty)$ per ogni $p>1$, ma $\notin L^1(1,+\infty)$.
- $\frac1{\sqrt x}\in L^p(0,1)$ per $p\in[1,2)$, ma $\notin L^2(0,1)$.
- $f(x)=\sin x$ per $x\notin\Q$, $f(x)=x$ per $x\in\Q$: non è limitata, ma è essenzialmente limitata con $\|f\|_{L^\infty}=1$.
`}
      </Box>
    </>
  )
}
