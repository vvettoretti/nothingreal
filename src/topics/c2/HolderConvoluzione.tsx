import { Box, Prose } from '../../components/Math'
import ConvolutionLab from '../../widgets/c2/ConvolutionLab'
import MollifierLab from '../../widgets/c2/MollifierLab'

export default function HolderConvoluzione() {
  return (
    <>
      <Box kind="teorema" title="Disuguaglianza di Hölder">
        {String.raw`
Siano $p,q\in[1,\infty]$ **coniugati**, $\frac1p+\frac1q=1$ (con $\frac1\infty=0$). Se $f\in L^p(\Omega)$ e $g\in L^q(\Omega)$, allora $fg\in L^1(\Omega)$ e
$$\|fg\|_{L^1}\le\|f\|_{L^p}\,\|g\|_{L^q}.$$
Per $p=q=2$ è la disuguaglianza di Cauchy–Schwarz.
`}
      </Box>

      <Box kind="teorema" title="Corollario: inclusioni su domini di misura finita">
        {String.raw`
Se $\Omega$ ha misura finita, $L^r(\Omega)\subseteq L^p(\Omega)$ per $1\le p<r\le\infty$. Si applica Hölder a $|f|^p\cdot1$ con esponente $r/p$:
$$\int_\Omega|f|^p\le\Big(\int_\Omega|f|^r\Big)^{p/r}|\Omega|^{1-p/r}.$$
Su $\R$ invece non c'è nessuna inclusione: $|x|^{-1/2}\mathbf 1_{0<|x|\le1}\in L^1\setminus L^2$ e $\frac1x\mathbf 1_{|x|>1}\in L^2\setminus L^1$ (il widget $x^{-a}$ della pagina precedente).
`}
      </Box>

      <Box kind="teorema" title="Fubini–Tonelli">
        {String.raw`
Se $f\in L^1(\R^{n+k})$ gli integrali iterati esistono (q.o.) e coincidono con l'integrale doppio, in qualsiasi ordine. Per $f\ge0$ misurabile (Tonelli) l'uguaglianza vale sempre, anche quando i valori sono $+\infty$: per sapere se $f\in L^1$ basta calcolare un integrale iterato di $|f|$.
`}
      </Box>

      <Prose>{String.raw`
### Convoluzione

Per $f,g$ definite su $\R^n$ si pone
$$(f*g)(x)=\int_{\R^n}f(x-y)\,g(y)\,dy.$$
È il valore in $x$ di una media di $g$ pesata con $f$ ribaltata e traslata. È commutativa e, per Fubini–Tonelli, $\|f*g\|_1\le\|f\|_1\|g\|_1$ con uguaglianza se $f,g\ge0$.
`}</Prose>

      <Box kind="teorema" title="Disuguaglianza di Young">
        {String.raw`
Se $f\in L^1(\R^n)$ e $g\in L^p(\R^n)$, $1\le p\le\infty$, allora $f*g$ è definita q.o., sta in $L^p$ e
$$\|f*g\|_{L^p}\le\|f\|_{L^1}\,\|g\|_{L^p}.$$
`}
      </Box>

      <ConvolutionLab />

      <Box kind="definizione" title="Supporto e funzioni test">
        {String.raw`
$\mathrm{supp}(f)=\overline{\{x\in\Omega: f(x)\neq0\}}$ (chiusura in $\Omega$). $C_0^\infty(\Omega)$ sono le funzioni $C^\infty$ con supporto **compatto contenuto in $\Omega$**.
`}
      </Box>

      <Box kind="teorema" title="Densità">
        {String.raw`
Se $\Omega\subseteq\R^n$ è aperto, $C_0^\infty(\Omega)$ è denso in $L^p(\Omega)$ per ogni $p\in[1,\infty)$: per ogni $f\in L^p$ esistono $f_m\in C_0^\infty$ con $\|f_m-f\|_{L^p}\to0$.

**Falso per $p=\infty$.** Su funzioni continue $\|\cdot\|_{L^\infty}$ è il sup, quindi un limite in $L^\infty$ di funzioni continue è continuo. $\mathbf 1_{[0,1]}$ non coincide q.o. con nessuna funzione continua, e infatti $\|\varphi-\mathbf 1_{[0,1]}\|_{L^\infty}\ge\frac12$ per ogni $\varphi$ continua.
`}
      </Box>

      <Prose>{String.raw`
Lo strumento concreto per costruire le approssimanti è proprio la convoluzione con un **mollificatore**: una funzione test $\rho\ge0$ di integrale 1, riscalata come $\rho_\varepsilon(x)=\varepsilon^{-n}\rho(x/\varepsilon)$. $f*\rho_\varepsilon$ eredita la regolarità di $\rho_\varepsilon$ e, se $f$ ha supporto compatto, ha supporto entro distanza $\varepsilon$ da quello di $f$.
`}</Prose>

      <MollifierLab />
    </>
  )
}
