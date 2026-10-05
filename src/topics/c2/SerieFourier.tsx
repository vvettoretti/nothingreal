import { Box, Prose } from '../../components/Math'
import BaselLab from '../../widgets/c2/BaselLab'
import FourierSeriesLab from '../../widgets/c2/FourierSeriesLab'

export default function SerieFourier() {
  return (
    <>
      <Box kind="teorema" title="Il sistema trigonometrico">
        {String.raw`
$$\Big\{\tfrac1{\sqrt{2L}},\ \tfrac1{\sqrt L}\cos\tfrac{m\pi x}L,\ \tfrac1{\sqrt L}\sin\tfrac{m\pi x}L\Big\}_{m\ge1}$$
è un sistema ortonormale **completo** in $L^2(-L,L)$. Sviluppando i prodotti scalari la serie di Fourier astratta diventa quella classica
$$S_u(x)=\frac{a_0}2+\sum_{m\ge1}\Big(a_m\cos\frac{m\pi x}L+b_m\sin\frac{m\pi x}L\Big),\quad a_m=\frac1L\int_{-L}^{L}u\cos\frac{m\pi x}L,\quad b_m=\frac1L\int_{-L}^{L}u\sin\frac{m\pi x}L.$$
`}
      </Box>

      <Prose>{String.raw`
I coefficienti hanno senso già per $u\in L^1(-L,L)$, perché $|a_m|\le\frac1L\|u\|_{L^1}$ (Hölder con $\|\cos\|_\infty=1$), e su un intervallo limitato $L^2\subset L^1$. Il **lemma di Riemann–Lebesgue** dice che $a_m,b_m\to0$ per ogni $u\in L^1$.

Le somme parziali sono polinomi trigonometrici, cioè funzioni $2L$-periodiche su tutto $\R$: la serie rappresenta l'**estensione periodica** di $u$. Se $u$ è continua su $[-L,L)$, l'estensione è continua se e solo se vale la **condizione di raccordo** $\lim_{x\to L^-}u(x)=u(-L)$. Per esempio $x^2$ su $[-\pi,\pi)$ la soddisfa, $x$ no.
`}</Prose>

      <Box kind="teorema" title="Tre tipi di convergenza">
        {String.raw`
- **In $L^2$**: se $u\in L^2(-L,L)$, $\|u-S_u^{(N)}\|_{L^2}\to0$ e vale Parseval $\|u\|_{L^2}^2=L\big[\frac{a_0^2}2+\sum_{m\ge1}(a_m^2+b_m^2)\big]$. Non dice niente sulla convergenza puntuale o uniforme.
- **Puntuale**: criteri di Dirichlet. Per $f$ regolare a tratti la serie converge in ogni punto alla media $\frac{f(x^+)+f(x^-)}2$.
- **Totale (quindi uniforme)**: se $f$ è $2L$-periodica, **continua** e regolare a tratti, allora $\sum|a_n|+|b_n|<\infty$ e la serie converge totalmente a $f$ su $\R$. La continuità è necessaria: un limite uniforme di polinomi trigonometrici è continuo.
`}
      </Box>

      <FourierSeriesLab />

      <Box kind="esame" title="L'esempio x²">
        {String.raw`
$u(x)=x^2$ su $[-\pi,\pi)$ è pari, quindi $b_n=0$. $a_0=\frac{2\pi^2}3$ e, integrando per parti due volte, $a_n=\frac{4(-1)^n}{n^2}$. L'estensione è continua e regolare a tratti, quindi
$$x^2=\frac{\pi^2}3+\sum_{n\ge1}\frac{4(-1)^n}{n^2}\cos nx\quad\text{uniformemente su }[-\pi,\pi].$$

- In $x=\pi$: $\pi^2=\frac{\pi^2}3+4\sum\frac1{n^2}$, quindi $\sum\frac1{n^2}=\frac{\pi^2}6$.
- Parseval: $\frac{2\pi^5}5=\int_{-\pi}^\pi x^4=\pi\big(\frac{2\pi^4}9+16\sum\frac1{n^4}\big)$, quindi $\sum\frac1{n^4}=\frac{\pi^4}{90}$.
`}
      </Box>

      <BaselLab />

      <Box kind="osservazione" title="Quale intervallo usare">
        {String.raw`
Per una funzione $2L$-periodica l'integrale su un periodo non dipende dall'intervallo scelto, quindi i coefficienti si calcolano dove $u$ è esplicita. Una $f$ periodica non nulla non sta mai in $L^2(\R)$: la convergenza in $L^2$ è sempre su un periodo. Simmetrie: $f$ pari $\Rightarrow b_n=0$, $f$ dispari $\Rightarrow a_n=0$.
`}
      </Box>
    </>
  )
}
