import { Box, Prose } from '../../components/Math'
import HeatLab from '../../widgets/c2/HeatLab'
import InversionLab from '../../widgets/c2/InversionLab'
import L2TruncLab from '../../widgets/c2/L2TruncLab'

export default function SchwartzCalore() {
  return (
    <>
      <Box kind="teorema" title="Teorema di inversione">
        {String.raw`
Se $f\in L^1(\R^n)$ **e** $\hat f\in L^1(\R^n)$, allora
$$f(x)=\int_{\R^n}\hat f(\xi)\,e^{2\pi i\xi\cdot x}\,d\xi=\hat{\hat f}(-x)\qquad\text{per q.o. }x.$$
**Corollario (iniettività).** Se $f\in L^1$ e $\hat f=0$, allora $f=0$ q.o.; quindi due funzioni $L^1$ con la stessa trasformata coincidono q.o.
`}
      </Box>

      <Prose>{String.raw`
L'ipotesi $\hat f\in L^1$ non è automatica: $\mathbf 1_{[-1,1]}\in L^1$ ma $\frac{\sin2\pi\xi}{\pi\xi}\notin L^1$. Anzi, condizione necessaria perché $\hat f\in L^1$ è che $f$ sia (q.o. uguale a una funzione) continua, perché il secondo membro della formula è la trasformata di una funzione $L^1$.
`}</Prose>

      <InversionLab />

      <Box kind="definizione" title="Spazio di Schwartz">
        {String.raw`
$$\mathcal S(\R^n)=\Big\{f\in C^\infty(\R^n):\ \lim_{|x|\to\infty}|x|^k\,|\partial^\beta f(x)|=0\ \ \forall k\in\N,\ \forall\beta\Big\},$$
le funzioni lisce **a decrescenza rapida** con tutte le derivate. La gaussiana $e^{-|x|^2}$ ci sta. $\mathcal S$ è chiuso per derivate e per moltiplicazione per $x^\beta$, ed è denso in ogni $L^p$, $p<\infty$. La sua topologia viene da una famiglia numerabile di seminorme $\sup|x^\gamma\partial^\beta f|$: è completo ma non è di Banach.
`}
      </Box>

      <Box kind="teorema" title="Fourier su 𝒮">
        {String.raw`
1. $\mathcal F:\mathcal S\to\mathcal S$ è biiettiva, con $f(x)=\mathcal F(\hat f)(-x)$ per **ogni** $x$.
2. $\int f\bar g=\int\hat f\,\overline{\hat g}$ per $f,g\in\mathcal S$; in particolare $\|f\|_{L^2}=\|\hat f\|_{L^2}$.
3. $\partial^\alpha_\xi\hat f=(-2\pi i)^{|\alpha|}\mathcal F(x^\alpha f)$ e $\widehat{\partial^\alpha f}=(2\pi i)^{|\alpha|}\xi^\alpha\hat f$: le derivate diventano moltiplicazioni.

La trasformata della gaussiana: $\int_\R e^{-\alpha x^2}e^{-2\pi i\xi x}dx=\sqrt{\pi/\alpha}\,e^{-\pi^2\xi^2/\alpha}$, e in $\R^n$ l'integrale si fattorizza: $\widehat{e^{-\alpha|x|^2}}=(\pi/\alpha)^{n/2}e^{-\pi^2|\xi|^2/\alpha}$.
`}
      </Box>

      <Prose>{String.raw`
### Equazione del calore

$$\begin{cases}\partial_tu=\Delta u, & x\in\R^n,\ t>0,\\ u(x,0)=f(x).\end{cases}$$
Si trasforma nella sola $x$. Siccome $\widehat{\partial_{x_k}^2u}=-4\pi^2\xi_k^2\hat u$, per ogni $\xi$ fissato si ottiene una **EDO** in $t$:
$$\partial_t\hat u(\xi,t)=-4\pi^2|\xi|^2\,\hat u(\xi,t)\quad\Longrightarrow\quad\hat u(\xi,t)=e^{-4\pi^2|\xi|^2t}\hat f(\xi).$$
Con la formula della gaussiana ($\alpha=\frac1{4t}$) il fattore $e^{-4\pi^2|\xi|^2t}$ è la trasformata del **nucleo del calore** $G_t(x)=(4\pi t)^{-n/2}e^{-|x|^2/4t}$; un prodotto di trasformate è la trasformata della convoluzione, e per iniettività
$$u(x,t)=(G_t*f)(x)=\int_{\R^n}\frac{e^{-|x-y|^2/4t}}{(4\pi t)^{n/2}}\,f(y)\,dy.$$
`}</Prose>

      <HeatLab />

      <Box kind="teorema" title="Fourier in L² e teorema di Plancherel">
        {String.raw`
Per $f\in L^2$ si prende $f_k\in\mathcal S$ con $f_k\to f$ in $L^2$ (esiste per densità). Poiché $\|\hat f_k-\hat f_h\|_2=\|f_k-f_h\|_2$, la successione $\hat f_k$ è di Cauchy in $L^2$, quindi converge; il limite non dipende dalla successione scelta, e si **definisce** $\hat f:=\lim\hat f_k$ in $L^2$.

**Plancherel.** $\mathcal F:L^2\to L^2$ è una biiezione isometrica: $\langle f,g\rangle=\langle\hat f,\hat g\rangle$, $\|\hat f\|_2=\|f\|_2$, e $f(x)=\mathcal F(\hat f)(-x)$ q.o. Su $L^1\cap L^2$ le due definizioni coincidono.
`}
      </Box>

      <Box kind="teorema" title="Come si calcola in pratica">
        {String.raw`
Se $f\in L^2(\R^n)$ e $g_R(\xi)=\int_{B_R(0)}f(x)e^{-2\pi ix\cdot\xi}dx$, allora $g_R\to\hat f$ in $L^2$ per $R\to\infty$. Se inoltre $g_R(\xi)$ converge q.o., il limite puntuale è $\hat f$. Infatti $g_R=\mathcal F(f\mathbf 1_{B_R})$ e $f\mathbf 1_{B_R}\to f$ in $L^2$.
`}
      </Box>

      <L2TruncLab />

      <Box kind="esame" title="Il conto di f = x/(1+x²)">
        {String.raw`
Per $\xi<0$ si chiude $[-R,R]$ con la semicirconferenza superiore: $|e^{-2\pi iz\xi}|=e^{2\pi\xi y}\le1$ per $y\ge0$ e $\frac{z}{1+z^2}\to0$, quindi per Jordan l'arco sparisce e
$$\lim_R g_R(\xi)=2\pi i\,\Res\Big(\frac{z\,e^{-2\pi iz\xi}}{1+z^2},i\Big)=\pi i\,e^{2\pi\xi}.$$
Per $\xi>0$ si chiude in basso (verso orario) e si trova $-\pi i\,e^{-2\pi\xi}$; in $\xi=0$ l'integranda è dispari e $g_R(0)=0$. In totale $\hat f(\xi)=-\pi i\,\mathrm{sgn}(\xi)\,e^{-2\pi|\xi|}$.
`}
      </Box>
    </>
  )
}
