import { Box, Prose } from '../../components/Math'
import LaurentLab from '../../widgets/LaurentLab'
import SingularityZoom from '../../widgets/SingularityZoom'

export default function SingolaritaLaurent() {
  return (
    <>
      <Box kind="definizione" title="Serie bilatera e corona di convergenza">
        {String.raw`
$$\sum_{n=-\infty}^{+\infty}c_n(z-z_0)^n=\underbrace{\sum_{n\le-1}c_n(z-z_0)^n}_{\text{parte singolare}}+\underbrace{\sum_{n\ge0}c_n(z-z_0)^n}_{\text{parte regolare}}$$

La serie bilatera converge se convergono entrambe le parti. La parte regolare converge per $|z-z_0|<R$. La parte singolare è una serie di potenze in $w=\frac1{z-z_0}$, e se ha raggio $R'$ converge per $|z-z_0|>\frac1{R'}=:\rho$. Se $\rho<R$, l'insieme di convergenza è la **corona** $C_{\rho,R}(z_0)=\{\rho<|z-z_0|<R\}$. Se $\rho=0$ è un **disco bucato**.
`}
      </Box>

      <Box kind="teorema" title="Sviluppo di Laurent">
        {String.raw`
Se $f$ è olomorfa sulla corona $C_{R_1,R_2}(z_0)$, esiste un'unica successione $(c_n)_{n\in\Z}$ tale che
$$f(z)=\sum_{n=-\infty}^{+\infty}c_n(z-z_0)^n,\qquad c_n=\frac1{2\pi i}\int_{C_R(z_0)}\frac{f(z)}{(z-z_0)^{n+1}}\,dz\quad(R_1<R<R_2).$$
La convergenza è totale su ogni corona chiusa contenuta in $C_{R_1,R_2}(z_0)$. Lo sviluppo è unico **per quella corona**: la stessa $f$ ha sviluppi diversi su corone diverse.
`}
      </Box>

      <Prose>{String.raw`
Esempio: $\frac{1}{z-z^2}=\frac1z+\frac1{1-z}=\frac1z+\sum_{n\ge0}z^n$ sul disco bucato $0<|z|<1$. Per $|z|>1$ invece si scrive $\frac1{1-z}=-\frac1z\cdot\frac1{1-1/z}$, e compaiono solo potenze negative.
`}</Prose>

      <LaurentLab />

      <Box kind="definizione" title="Singolarità isolate">
        {String.raw`
$z_0$ è una **singolarità isolata** di $f$ se $f$ è olomorfa su un disco bucato $B_R(z_0)\setminus\{z_0\}$ ma non su $B_R(z_0)$. Per esempio, $\frac1{\sin z}$ ha singolarità isolate in $k\pi$. $\frac1{\sin(1/z)}$ ne ha in $\frac1{k\pi}$, ma in $0$ la singolarità **non è isolata**, perché quei punti si accumulano lì.

La singolarità isolata $z_0$ si dice:

- **eliminabile** se $\lim_{z\to z_0}f(z)$ esiste finito;
- **polo** se $\lim_{z\to z_0}f(z)=\infty$, di **ordine** $N$ se $\lim_{z\to z_0}(z-z_0)^Nf(z)$ è finito e non nullo;
- **essenziale** negli altri casi.
`}
      </Box>

      <Box kind="teorema" title="Caratterizzazione con Laurent">
        {String.raw`
Con lo sviluppo di Laurent di $f$ sul disco bucato attorno a $z_0$:

- eliminabile $\iff$ $c_{-n}=0$ per ogni $n\ge1$. Si prolunga con $f(z_0)=c_0$ e diventa olomorfa. Esempio: $\frac{\sin z}{z}$.
- polo di ordine $N$ $\iff$ $c_{-N}\neq0$ e $c_{-n}=0$ per $n>N$. Esempio: $\frac1{z^k}$.
- essenziale $\iff$ $c_{-n}\neq0$ per infiniti $n$. Esempio: $e^{1/z}=1+\sum_{n\ge1}\frac{z^{-n}}{n!}$.
`}
      </Box>

      <SingularityZoom />

      <Box kind="teorema" title="Casorati–Weierstrass">
        {String.raw`
Se $z_0$ è essenziale, per ogni $\lambda\in\C\cup\{\infty\}$ esiste $z_n\to z_0$ con $f(z_n)\to\lambda$. Vicino a una singolarità essenziale, $f$ si avvicina a qualunque valore. Nel widget, per $e^{1/z}$: da destra $|f|\to\infty$, da sinistra $f\to0$, e sull'asse immaginario $|f|=1$.
`}
      </Box>

      <Box kind="esame">
        {String.raw`
Per classificare velocemente si confrontano gli ordini degli zeri. Se $f=g/h$, con $g$ che ha uno zero di ordine $p$ in $z_0$ e $h$ uno zero di ordine $q$, allora per $q>p$ è un polo di ordine $q-p$, altrimenti è eliminabile. Esempio: $\frac{\sin z}{z^3}$ ha un polo di ordine $3-1=2$. Le singolarità essenziali compaiono quasi sempre come $e^{1/(z-z_0)}$, $\sin\frac1{z}$ e simili.
`}
      </Box>
    </>
  )
}
