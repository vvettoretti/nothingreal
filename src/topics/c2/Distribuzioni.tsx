import { Box, Prose } from '../../components/Math'
import DeltaLab from '../../widgets/c2/DeltaLab'
import TestFunctionLab from '../../widgets/c2/TestFunctionLab'

export default function Distribuzioni() {
  return (
    <>
      <Prose>{String.raw`
### Perché servono

Nell'equazione di Poisson $\Delta U=f$, $f$ è una densità di carica. Una soluzione **classica** è $U\in C^2$ con $\Delta U=f$ punto per punto, e richiede $f$ continua (che non basta nemmeno). Ma una carica puntiforme in $w_0$ non ha densità: è una **misura** concentrata in un punto. Il suo potenziale $U=\frac{c}{|w-w_0|}$ è armonico fuori da $w_0$, quindi "$\Delta U=0$ quasi ovunque", eppure fisicamente $\Delta U=-4\pi c\,\delta_{w_0}$. Serve una nozione di funzione e di derivata che veda queste differenze.
`}</Prose>

      <Box kind="definizione" title="Funzioni test e convergenza in 𝒟">
        {String.raw`
$\mathcal D(\Omega)=C_0^\infty(\Omega)$ sono le **funzioni test**. $\varphi_j\to\varphi$ in $\mathcal D(\Omega)$ se esiste un compatto $K\subset\Omega$ tale che

1. $\mathrm{supp}\,\varphi_j\subseteq K$ per ogni $j$ (e $\mathrm{supp}\,\varphi\subseteq K$);
2. $\partial^\alpha\varphi_j\to\partial^\alpha\varphi$ uniformemente su $K$ per **ogni** multi-indice $\alpha$.
`}
      </Box>

      <TestFunctionLab />

      <Box kind="definizione" title="Distribuzione">
        {String.raw`
Una **distribuzione** è un funzionale $T:\mathcal D(\Omega)\to\mathbb K$ lineare e continuo rispetto alla convergenza in $\mathcal D$:
$$\varphi_j\to\varphi\ \text{in }\mathcal D(\Omega)\implies\langle T,\varphi_j\rangle\to\langle T,\varphi\rangle.$$
L'insieme delle distribuzioni è $\mathcal D'(\Omega)$, ed è uno spazio vettoriale.
`}
      </Box>

      <Box kind="teorema" title="Le funzioni sono distribuzioni">
        {String.raw`
Se $f\in L^1_{loc}$ (integrabile su ogni compatto), allora $\langle T_f,\varphi\rangle=\int f\varphi$ definisce $T_f\in\mathcal D'$. Se $\mathrm{supp}\,\varphi_j\subseteq[a,b]$:
$$|\langle T_f,\varphi_j\rangle|\le\|\varphi_j\|_{C^0([a,b])}\int_a^b|f|\to0.$$
Per il lemma di annullamento $T_f=0\Rightarrow f=0$ q.o., quindi si può **identificare** $f$ con $T_f$. $C^0$, $L^p$ e $L^\infty$ stanno in $L^1_{loc}$; $|x|^{-1/2}\in L^1_{loc}\setminus L^1$; $\frac1x\notin L^1_{loc}(\R)$.
`}
      </Box>

      <Box kind="teorema" title="Le misure sono distribuzioni">
        {String.raw`
Se $\mu$ è una misura boreliana finita sui limitati, $\langle T_\mu,\varphi\rangle=\int\varphi\,d\mu$ è una distribuzione, con $|\langle T_\mu,\varphi\rangle|\le\|\varphi\|_{C^0([a,b])}\mu([a,b])$. Se $d\mu=f\,dx$, $T_\mu=T_f$. L'esempio fondamentale è la **delta di Dirac**
$$\langle\delta_{x_0},\varphi\rangle=\varphi(x_0),$$
cioè la misura concentrata in $x_0$. **Non** esiste $f\in L^1_{loc}$ con $\delta=T_f$.
`}
      </Box>

      <DeltaLab />

      <Box kind="osservazione" title="Né funzione né misura">
        {String.raw`
$T:\varphi\mapsto\varphi'(x_0)$ è lineare e continua su $\mathcal D$ (perché $|\varphi_j'(x_0)|\le\|\varphi_j'\|_{C^0}\to0$), ma non viene né da una funzione né da una misura. Nella pagina successiva si scopre che è $-\delta_{x_0}'$.
`}
      </Box>
    </>
  )
}
