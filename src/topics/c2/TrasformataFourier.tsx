import { Box, Prose } from '../../components/Math'
import FourierTransformLab from '../../widgets/c2/FourierTransformLab'

export default function TrasformataFourier() {
  return (
    <>
      <Box kind="definizione" title="Trasformata di Fourier in L¹">
        {String.raw`
Per $f\in L^1(\R^n)$
$$\hat f(\xi)=\int_{\R^n}f(x)\,e^{-2\pi i\,\xi\cdot x}\,dx,\qquad\xi\in\R^n.$$
L'integrale converge perché $|f(x)e^{-2\pi i\xi\cdot x}|=|f(x)|$. Anche per $f$ reale $\hat f$ è complessa; in dimensione 1, $f$ pari $\Rightarrow\hat f$ reale e pari, $f$ dispari $\Rightarrow\hat f$ immaginaria pura e dispari.
`}
      </Box>

      <Prose>{String.raw`
L'esempio guida è $\mathbf 1_{[-1,1]}$:
$$\hat f(\xi)=\int_{-1}^1e^{-2\pi ix\xi}dx=\frac{e^{2\pi i\xi}-e^{-2\pi i\xi}}{2\pi i\xi}=\frac{\sin2\pi\xi}{\pi\xi},\qquad\hat f(0)=2.$$
È continua, pari, infinitesima, ma **non** sta in $L^1$: la trasformata non preserva l'integrabilità.
`}</Prose>

      <FourierTransformLab />

      <Box kind="teorema" title="Continuità di 𝓕 su L¹ (dimostrazione richiesta all'esame)">
        {String.raw`
$\mathcal F:L^1(\R^n)\to L^\infty(\R^n)$ è lineare e continuo con $\|\hat f\|_{L^\infty}\le\|f\|_{L^1}$. Inoltre $\hat f\in C^0(\R^n)$ per ogni $f\in L^1$.
`}
      </Box>

      <Prose>{String.raw`
**Dimostrazione.** $|\hat f(\xi)|\le\int|f(x)||e^{-2\pi ix\cdot\xi}|dx=\|f\|_1$ per ogni $\xi$, quindi $\|\mathcal F\|\le1$. Per la continuità sia $\xi_k\to\xi$ e $g_k(x)=f(x)\big(e^{-2\pi ix\cdot\xi_k}-e^{-2\pi ix\cdot\xi}\big)$. Allora $g_k\to0$ q.o. (continuità dell'esponenziale) e $|g_k|\le2|f|\in L^1$: per **convergenza dominata** $\hat f(\xi_k)-\hat f(\xi)=\int g_k\to0$. In $\R^n$ la continuità sequenziale basta.

Anche se $f$ è discontinua, $\hat f$ è sempre continua.
`}</Prose>

      <Box kind="teorema" title="Riemann–Lebesgue">
        {String.raw`
Se $f\in L^1(\R^n)$, $\hat f(\xi)\to0$ per $|\xi|\to\infty$.
`}
      </Box>

      <Box kind="teorema" title="Regolarità ⇄ decadimento">
        {String.raw`
Con i multi-indici $\partial^\alpha=\partial_1^{\alpha_1}\cdots\partial_n^{\alpha_n}$, $x^\alpha=x_1^{\alpha_1}\cdots x_n^{\alpha_n}$: se $x^\alpha f\in L^1$ per ogni $|\alpha|\le k$, allora $\hat f\in C^k$ e
$$\partial_\xi^\alpha\hat f=(-2\pi i)^{|\alpha|}\,\mathcal F\big(x^\alpha f\big).$$
**Più $f$ decade, più $\hat f$ è regolare.** Le funzioni limitate a supporto compatto hanno $\hat f\in C^\infty$: $\frac{\sin2\pi\xi}{\pi\xi}$ è $C^\infty$ anche se $\mathbf 1_{[-1,1]}$ non è continua. Viceversa (lo si vede nel grafico del decadimento) più $f$ è regolare, più $\hat f$ decade.
`}
      </Box>

      <Box kind="teorema" title="Trasformata della convoluzione">
        {String.raw`
Se $f,g\in L^1(\R^n)$, allora $f*g\in L^1$ e
$$\widehat{f*g}=\hat f\,\hat g.$$
Per esempio $\mathbf 1_{[-1/2,1/2]}*\mathbf 1_{[-1/2,1/2]}$ è il triangolo $(1-|x|)^+$, e la sua trasformata è $\big(\frac{\sin\pi\xi}{\pi\xi}\big)^2$.
`}
      </Box>

      <Box kind="esame" title="Regole da sapere a memoria">
        {String.raw`
- $\widehat{f(\cdot-b)}(\xi)=e^{-2\pi ib\xi}\hat f(\xi)$ (traslazione $\to$ fase).
- $\widehat{e^{2\pi icx}f}(\xi)=\hat f(\xi-c)$ (modulazione $\to$ traslazione).
- $\widehat{f(a\,\cdot)}(\xi)=\frac1{|a|}\hat f(\xi/a)$ (dilatazione).
- $\widehat{e^{-\alpha x^2}}=\sqrt{\pi/\alpha}\,e^{-\pi^2\xi^2/\alpha}$, $\widehat{e^{-|x|}}=\frac{2}{1+4\pi^2\xi^2}$, $\widehat{\frac1{1+x^2}}=\pi e^{-2\pi|\xi|}$ (residui).
`}
      </Box>
    </>
  )
}
