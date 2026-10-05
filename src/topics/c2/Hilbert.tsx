import { Box, Prose } from '../../components/Math'
import ParallelogramLab from '../../widgets/c2/ParallelogramLab'
import ProjectionLab from '../../widgets/c2/ProjectionLab'

export default function Hilbert() {
  return (
    <>
      <Box kind="definizione" title="Prodotto scalare, spazio di Hilbert">
        {String.raw`
Un **prodotto scalare** su $V$ è $\langle\cdot,\cdot\rangle:V\times V\to\mathbb K$ lineare nel primo argomento, con $\langle x,y\rangle=\overline{\langle y,x\rangle}$ (simmetrico se $\mathbb K=\R$, sesquilineare se $\mathbb K=\C$) e $\langle x,x\rangle>0$ per $x\neq0$. Induce la norma $\|x\|=\sqrt{\langle x,x\rangle}$, e vale **Cauchy–Schwarz** $|\langle x,y\rangle|\le\|x\|\|y\|$, da cui la continuità del prodotto scalare.

Uno spazio con prodotto scalare è **pre-hilbertiano**; se è completo è uno **spazio di Hilbert**. Esempi: $\R^n$, $\C^n$, $\ell^2$ con $\langle z,w\rangle=\sum z_n\overline{w_n}$, e soprattutto
$$L^2(\Omega),\qquad \langle f,g\rangle=\int_\Omega f\,\bar g.$$
`}
      </Box>

      <Box kind="teorema" title="Identità del parallelogramma">
        {String.raw`
Una norma è indotta da un prodotto scalare se e solo se
$$\|x+y\|^2+\|x-y\|^2=2\big(\|x\|^2+\|y\|^2\big)\qquad\forall x,y.$$
`}
      </Box>

      <ParallelogramLab />

      <Box kind="teorema" title="Pitagora generalizzato (dimostrazione richiesta all'esame)">
        {String.raw`
Sia $H$ di Hilbert e $\{x_n\}\subset H$ con $\langle x_i,x_j\rangle=0$ per $i\neq j$ e $\sum\|x_n\|^2<\infty$. Allora $\sum x_n$ converge in $H$ e
$$\Big\|\sum_{n=1}^\infty x_n\Big\|^2=\sum_{n=1}^\infty\|x_n\|^2.$$
`}
      </Box>

      <Prose>{String.raw`
**Dimostrazione.** La versione finita $\|\sum_{k\le N}x_k\|^2=\sum_{i,j}\langle x_i,x_j\rangle=\sum_k\|x_k\|^2$ vale in ogni spazio pre-hilbertiano. Posto $S_m=\sum_{k\le m}x_k$ e $s_m=\sum_{k\le m}\|x_k\|^2$, per $m>n$ la versione finita dà
$$\|S_m-S_n\|^2=\Big\|\sum_{k=n+1}^m x_k\Big\|^2=s_m-s_n\to0,$$
quindi $(S_m)$ è di Cauchy in $H$ e, **per la completezza**, converge a un $x\in H$. La norma è continua, quindi $\|x\|^2=\lim\|S_m\|^2=\lim s_m=\sum\|x_k\|^2$. Si usano sia l'ortogonalità sia la completezza.

### Sistemi ortonormali e proiezione

$\{e_n\}$ è **ortonormale** se $\langle e_i,e_j\rangle=\delta_{ij}$. Un sistema ortonormale finito è linearmente indipendente (per Pitagora $\|\sum c_ke_k\|^2=\sum|c_k|^2$), e $V_m=\mathrm{span}\{e_1,\dots,e_m\}$ è un sottospazio chiuso di dimensione $m$.
`}</Prose>

      <Box kind="teorema" title="Proiezione e disuguaglianza di Bessel">
        {String.raw`
Per ogni $x\in H$ esiste un unico $v\in V_m$ che minimizza $\|x-y\|$ su $y\in V_m$, ed è
$$P_{V_m}x=\sum_{k=1}^m\langle x,e_k\rangle e_k,\qquad x-P_{V_m}x\perp V_m.$$
Inoltre $\big\|x-P_{V_m}x\big\|^2=\|x\|^2-\sum_{k\le m}|\langle x,e_k\rangle|^2$, da cui, per $m\to\infty$, la **disuguaglianza di Bessel** $\sum_{k=1}^\infty|\langle x,e_k\rangle|^2\le\|x\|^2$.
`}
      </Box>

      <ProjectionLab />

      <Box kind="definizione" title="Sistema completo, serie di Fourier astratta">
        {String.raw`
$\sum_k\langle x,e_k\rangle e_k$ è la **serie di Fourier** di $x$, e $\langle x,e_k\rangle$ il $k$-esimo coefficiente. Il sistema è **completo** se $\langle x,e_k\rangle=0$ per ogni $k$ implica $x=0$.
`}
      </Box>

      <Box kind="teorema" title="Teorema di Fourier (dimostrazione richiesta all'esame)">
        {String.raw`
Se $\{e_k\}$ è un sistema ortonormale completo in $H$, per ogni $x,y\in H$:

1. $x=\sum_k\langle x,e_k\rangle e_k$ (convergenza in $H$);
2. **Plancherel**: $\langle x,y\rangle=\sum_k\langle x,e_k\rangle\overline{\langle y,e_k\rangle}$;
3. **Parseval**: $\|x\|^2=\sum_k|\langle x,e_k\rangle|^2$.
`}
      </Box>

      <Prose>{String.raw`
**Dimostrazione.** Per Bessel e Pitagora generalizzato (applicato a $x_k=\langle x,e_k\rangle e_k$) la serie converge in $H$ a qualche $s$. Il prodotto scalare è continuo, quindi passa dentro la serie:
$$\langle x-s,e_j\rangle=\langle x,e_j\rangle-\sum_m\langle x,e_m\rangle\langle e_m,e_j\rangle=\langle x,e_j\rangle-\langle x,e_j\rangle=0\quad\forall j,$$
e per la completezza del sistema $x=s$. Poi $\langle x,y\rangle=\big\langle\sum_m\langle x,e_m\rangle e_m,y\big\rangle=\sum_m\langle x,e_m\rangle\overline{\langle y,e_m\rangle}$, e con $y=x$ si ottiene Parseval.

Il significato: $\overline{\mathrm{span}\{e_k\}}=H$. Non si scrive ogni elemento come combinazione **finita**, ma lo si approssima bene quanto si vuole con proiezioni su sottospazi di dimensione finita.
`}</Prose>
    </>
  )
}
