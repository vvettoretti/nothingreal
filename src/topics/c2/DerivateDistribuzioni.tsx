import { Box, Prose } from '../../components/Math'
import DistDerivativeLab from '../../widgets/c2/DistDerivativeLab'
import WeakConvergenceLab from '../../widgets/c2/WeakConvergenceLab'

export default function DerivateDistribuzioni() {
  return (
    <>
      <Prose>{String.raw`
Se $f\in C^1$, integrando per parti contro una funzione test (i termini di bordo spariscono perché $\varphi$ ha supporto compatto)
$$\int f'\varphi=-\int f\varphi',\qquad\text{cioè}\qquad\langle T_{f'},\varphi\rangle=-\langle T_f,\varphi'\rangle.$$
Il secondo membro ha senso per **ogni** distribuzione, e diventa la definizione.
`}</Prose>

      <Box kind="definizione" title="Derivata di una distribuzione">
        {String.raw`
$$\langle T',\varphi\rangle:=-\langle T,\varphi'\rangle,\qquad\langle\partial_{x_j}T,\varphi\rangle:=-\langle T,\partial_{x_j}\varphi\rangle,\qquad\langle\partial^\alpha T,\varphi\rangle=(-1)^{|\alpha|}\langle T,\partial^\alpha\varphi\rangle.$$
**Ogni distribuzione è derivabile infinite volte**, la derivata è lineare, e per $f\in C^1$ si ha $\partial_{x_j}T_f=T_{\partial_{x_j}f}$.
`}
      </Box>

      <Box kind="esame" title="Gli esempi di base">
        {String.raw`
- $(T_{|x|})'=T_{\mathrm{sgn}}$: integrando per parti separatamente su $(-\infty,0)$ e $(0,\infty)$.
- $(T_H)'=\delta$: $-\int_0^\infty\varphi'=\varphi(0)$. La derivata quasi ovunque di $H$ è 0, che **non** è la derivata distribuzionale.
- $\langle\delta',\varphi\rangle=-\varphi'(0)$.
- Gradino da $k_2$ (a sinistra di $x_0$) a $k_1$ (a destra): $(T_f)'=(k_1-k_2)\delta_{x_0}$.
`}
      </Box>

      <Box kind="teorema" title="Derivata di funzioni C¹ a tratti">
        {String.raw`
1. Se $f$ è **continua** e $C^1$ tranne un numero finito di punti angolosi, $(T_f)'=T_{f'}$ con $f'$ derivata q.o.
2. Se $f$ è $C^1$ tranne un numero finito di **salti** $x_1,\dots,x_N$, allora $(T_f)'=T_{f'}+\sum_{i=1}^N\big(f(x_i^+)-f(x_i^-)\big)\,\delta_{x_i}$.
`}
      </Box>

      <DistDerivativeLab />

      <Box kind="definizione" title="Operazioni">
        {String.raw`
Si definiscono tutte spostando l'operazione sulla funzione test, con la regola suggerita dal caso $T=T_f$ (cambio di variabili):

- **traslazione**: $\langle\tau_aT,\varphi\rangle=\langle T,\tau_{-a}\varphi\rangle$, dove $\tau_af(x)=f(x+a)$;
- **dilatazione**: $\langle D_\lambda T,\varphi\rangle=\big\langle T,\lambda^{-n}\varphi(\cdot/\lambda)\big\rangle$, dove $D_\lambda f(x)=f(\lambda x)$;
- **prodotto per $g\in C^\infty$**: $\langle gT,\varphi\rangle=\langle T,g\varphi\rangle$. Serve $g\in C^\infty$ perché $g\varphi$ deve essere una funzione test; non serve supporto compatto. Il prodotto di due distribuzioni in generale **non** è definito.
`}
      </Box>

      <Box kind="definizione" title="Convergenza in 𝒟′">
        {String.raw`
$T_n\to T$ in $\mathcal D'$ se $\langle T_n,\varphi\rangle\to\langle T,\varphi\rangle$ per ogni $\varphi\in\mathcal D$. Esempio del corso: $\sin(nx)$ non converge in nessun punto di $\R\setminus\pi\Z$, ma
$$\int\varphi(x)\sin(nx)\,dx=\Im\,\hat\varphi\Big(-\frac n{2\pi}\Big)\to0$$
per Riemann–Lebesgue, quindi $T_{\sin nx}\to0$ in $\mathcal D'$.
`}
      </Box>

      <WeakConvergenceLab />
    </>
  )
}
