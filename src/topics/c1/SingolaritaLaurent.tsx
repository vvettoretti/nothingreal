import { Box, Prose } from '../../components/Math'
import LaurentLab from '../../widgets/LaurentLab'
import SingularityZoom from '../../widgets/SingularityZoom'

export default function SingolaritaLaurent() {
  return (
    <>
      <Box kind="teorema" title="Laurent">
        {String.raw`
Se $f$ è olomorfa sulla corona $A=\{r_1<|z-z_0|<r_2\}$ ($0\le r_1<r_2\le\infty$), allora
$$f(z)=\sum_{n=-\infty}^{+\infty}a_n(z-z_0)^n,\qquad a_n=\frac1{2\pi i}\oint_{|z-z_0|=r}\frac{f(z)}{(z-z_0)^{n+1}}\,dz\quad(r_1<r<r_2),$$
con convergenza assoluta in $A$ e uniforme sulle corone chiuse contenute in $A$. Lo sviluppo è **unico per quella corona**. $\sum_{n<0}$ è la **parte principale**, $\sum_{n\ge0}$ la **parte regolare**.
`}
      </Box>

      <Prose>{String.raw`
La dimostrazione applica la formula integrale di Cauchy al bordo della corona, che ha due componenti. Sul bordo esterno si sviluppa $\frac1{\zeta-z}$ in potenze di $\frac{z-z_0}{\zeta-z_0}$, come per Taylor. Sul bordo interno si sviluppa in potenze di $\frac{\zeta-z_0}{z-z_0}$, e da qui escono le potenze negative. Da ricordare: **lo sviluppo dipende dalla corona**, non solo dal centro.
`}</Prose>

      <LaurentLab />

      <Box kind="definizione" title="Classificazione delle singolarità isolate">
        {String.raw`
$z_0$ è una singolarità isolata se $f$ è olomorfa su $0<|z-z_0|<r$. Guardando lo sviluppo di Laurent in quella corona bucata:

- **eliminabile**: parte principale nulla $\Leftrightarrow$ $f$ limitata vicino a $z_0$ (Riemann) $\Leftrightarrow$ $\lim_{z\to z_0}f$ esiste finito;
- **polo di ordine $m$**: parte principale finita, con $a_{-m}\neq0$ $\Leftrightarrow$ $\lim_{z\to z_0}|f|=\infty$ $\Leftrightarrow$ $(z-z_0)^mf$ ha limite finito non nullo $\Leftrightarrow$ $1/f$ ha uno zero di ordine $m$;
- **essenziale**: infiniti $a_{-n}\ne0$ $\Leftrightarrow$ $\lim_{z\to z_0} f$ non esiste nemmeno in $\hat\C$.

Il **residuo** è $\Res(f,z_0)=a_{-1}=\frac1{2\pi i}\oint_{|z-z_0|=\varepsilon}f(z)\,dz$: è l'unico coefficiente che sopravvive all'integrazione, perché $\oint(z-z_0)^n\,dz=0$ per $n\neq-1$.
`}
      </Box>

      <SingularityZoom />

      <Box kind="teorema" title="Casorati–Weierstrass">
        {String.raw`
Se $z_0$ è essenziale, per ogni $r>0$ l'immagine $f(\{0<|z-z_0|<r\})$ è **densa** in $\C$.

La dimostrazione è breve: se $|f(z)-w|\ge\varepsilon$ vicino a $z_0$, allora $g=\frac1{f-w}$ è limitata, quindi ha una singolarità eliminabile, e $f = w+1/g$ avrebbe un polo o una singolarità eliminabile. Il grande teorema di Picard (fuori programma) dice che in realtà $f$ assume ogni valore complesso, salvo al più uno, infinite volte.
`}
      </Box>

      <Box kind="osservazione" title="Il punto all'infinito">
        {String.raw`
Il tipo di singolarità in $\infty$ si studia con $g(w)=f(1/w)$ in $w=0$. I polinomi di grado $m$ hanno un polo di ordine $m$ all'infinito, $e^z$ ha una singolarità essenziale: le funzioni intere non polinomiali sono esattamente quelle con singolarità essenziale all'infinito. Il residuo all'infinito ha un segno meno, $\Res(f,\infty)=-a_{-1}$ nello sviluppo per $|z|>R$, e la somma di **tutti** i residui, $\infty$ compreso, è zero.
`}
      </Box>

      <Box kind="esame">
        {String.raw`
Per classificare velocemente si confrontano gli ordini: se $f=g/h$ con $g$ con zero di ordine $p$ e $h$ con zero di ordine $q$ in $z_0$, allora per $q>p$ è un polo di ordine $q-p$, altrimenti è eliminabile. Esempio: $\frac{1-\cos z}{z^5}$ ha numeratore di ordine 2, quindi polo di ordine 3. Il residuo è il coefficiente di $z^4$ in $1-\cos z$, cioè $-\tfrac1{24}$. Le singolarità essenziali compaiono quasi sempre come $e^{1/(z-z_0)}$, $\sin\frac1{z}$ e simili.
`}
      </Box>
    </>
  )
}
