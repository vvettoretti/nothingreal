import { Box, Prose } from '../../components/Math'
import CompactSupportLab from '../../widgets/c2/CompactSupportLab'
import DeltaLimitLab from '../../widgets/c2/DeltaLimitLab'
import TemperateLab from '../../widgets/c2/TemperateLab'

export default function Temperate() {
  return (
    <>
      <Prose>{String.raw`
Per $f\in L^1$ e $\varphi$ test, Fubini dà la **formula dello scambio** $\int\hat f\varphi=\int f\hat\varphi$. Verrebbe da definire $\langle\hat T,\varphi\rangle:=\langle T,\hat\varphi\rangle$, ma c'è un ostacolo: $\hat\varphi$ non è una funzione test.
`}</Prose>

      <Box kind="teorema" title="Supporto compatto non passa alla trasformata">
        {String.raw`
Se $f\in L^1(\R^n)$, $f\not\equiv0$, ha supporto compatto, allora $\hat f$ **non** ha supporto compatto.

*Idea* ($n=1$, $\mathrm{supp}f\subseteq[-N,N]$): $\hat f(z)=\int_{-N}^Nf(x)e^{-2\pi ixz}dx$ ha senso per $z\in\C$ e, derivando sotto il segno (convergenza dominata), è **intera**. Se fosse nulla su un intervallo di $\R$, per il **principio d'identità** sarebbe identicamente nulla, e per l'iniettività di $\mathcal F$ anche $f$.
`}
      </Box>

      <CompactSupportLab />

      <Prose>{String.raw`
Lo spazio test giusto è quello lasciato invariato da $\mathcal F$: lo spazio di Schwartz. $\varphi_j\to0$ in $\mathcal S$ se $\sup_x|x|^k|\partial^\alpha\varphi_j(x)|\to0$ per ogni $k$ e ogni $\alpha$.
`}</Prose>

      <Box kind="definizione" title="Distribuzioni temperate">
        {String.raw`
$\mathcal S'(\R^n)$ è lo spazio dei funzionali lineari continui su $\mathcal S(\R^n)$. Poiché $\mathcal D\subset\mathcal S$ con immersione continua e densa, $\mathcal S'\subset\mathcal D'$: sono distribuzioni particolari.

Una $f\in L^1_{loc}$ è **a crescita lenta** se $f/(1+|x|)^m\in L^p$ per qualche $m\in\N$, $p\in[1,\infty]$ (per esempio $|f|\le C(1+|x|)^N$). Le funzioni a crescita lenta danno distribuzioni temperate: tutte le $L^p$, i polinomi, le funzioni limitate. $e^x$ invece è in $\mathcal D'$ ma non in $\mathcal S'$.
`}
      </Box>

      <TemperateLab />

      <Box kind="definizione" title="Trasformata in 𝒮′">
        {String.raw`
$$\langle\hat T,\varphi\rangle:=\langle T,\hat\varphi\rangle\qquad\forall\varphi\in\mathcal S.$$
È ben definita perché $\mathcal F:\mathcal S\to\mathcal S$ è continua, ed estende quella classica: se $f\in L^1$, $\widehat{T_f}=T_{\hat f}$. È invertibile con $\langle\mathcal F^{-1}T,\varphi\rangle=\langle T,\mathcal F^{-1}\varphi\rangle$, e $\mathcal F(\mathcal FT)=T^\vee$ dove $\langle T^\vee,\varphi\rangle=\langle T,\varphi(-\cdot)\rangle$.
`}
      </Box>

      <Box kind="esame" title="Le trasformate da sapere">
        {String.raw`
- $\hat\delta=1$: $\langle\hat\delta,\varphi\rangle=\hat\varphi(0)=\int\varphi$.
- $\hat1=\delta$: $\hat1=\hat{\hat\delta}=\delta^\vee=\delta$. Più in generale $\hat c=c\,\delta$.
- $\mathcal F(e^{2\pi iax})=\delta_a$ e quindi $\mathcal F(\cos2\pi ax)=\frac{\delta_a+\delta_{-a}}2$.
- $\mathcal F(\partial^\alpha T)=(2\pi i)^{|\alpha|}\xi^\alpha\hat T$ e $\mathcal F(x^\alpha T)=(-2\pi i)^{-|\alpha|}\partial^\alpha\hat T$.
- Polinomi: $\mathcal F(x^k)=(-2\pi i)^{-k}\delta^{(k)}$.
- Verifica con Heaviside: $\mathcal F(T_H')=2\pi i\xi\,\mathcal F(T_H)$ e $T_H'=\delta$, quindi $2\pi i\xi\,\hat H=1$.
`}
      </Box>

      <DeltaLimitLab />
    </>
  )
}
