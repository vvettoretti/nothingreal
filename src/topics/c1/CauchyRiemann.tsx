import { Box, Prose } from '../../components/Math'
import DerivativeLab from '../../widgets/DerivativeLab'

export default function CauchyRiemann() {
  return (
    <>
      <Box kind="definizione" title="Derivata complessa, olomorfia">
        {String.raw`
$f:A\to\C$, $A$ aperto, è **derivabile** in $z_0\in A$ se esiste finito
$$f'(z_0)=\lim_{h\to 0,\ h\in\C}\frac{f(z_0+h)-f(z_0)}{h}.$$
$f$ è **olomorfa** su $A$ se è derivabile in ogni punto di $A$ **e** $f'$ è continua ($f\in C^1(A)$). Se $A=\C$, $f$ si dice **intera**. Polinomi e funzioni razionali $P/Q$ (dove $Q\neq0$) sono olomorfi.
`}
      </Box>

      <Prose>{String.raw`
L'incremento $h$ è complesso, quindi il limite deve essere lo stesso **da tutte le direzioni**. Già $\bar z$ fallisce: il rapporto incrementale è $\bar h/h = e^{-2i\theta}$, che dipende dalla direzione. $\bar z$ è continua ovunque ma non è derivabile in nessun punto.

Derivabile equivale a $f(z_0+h) = f(z_0) + f'(z_0)\,h + o(h)$: il differenziale di $f$, vista come mappa $\R^2\to\R^2$, è la **moltiplicazione per il numero complesso** $f'(z_0) = a+ib$, cioè
$$J(z_0)=\begin{pmatrix}a & -b\\ b & a\end{pmatrix} = |f'(z_0)|\begin{pmatrix}\cos\varphi & -\sin\varphi\\ \sin\varphi & \cos\varphi\end{pmatrix}.$$
Queste matrici sono esattamente le **rotodilatazioni**. Da qui viene tutto il resto.
`}</Prose>

      <Box kind="teorema" title="Cauchy–Riemann">
        {String.raw`
Sia $f = U+iV$. $f$ è derivabile in $z_0=x_0+iy_0$ se e solo se $U$ e $V$ sono **differenziabili** in $(x_0,y_0)$ e valgono le condizioni
$$U_x = V_y,\qquad U_y = -V_x.$$
In tal caso $f'(z_0) = U_x + i V_x = V_y - i U_y$.

Le condizioni si ottengono calcolando il limite lungo $h=\Delta x$ reale ($f'=U_x+iV_x$) e lungo $h=i\Delta y$ immaginario ($f'=V_y-iU_y$) e uguagliando.
`}
      </Box>

      <DerivativeLab />

      <Prose>{String.raw`
Il widget misura anche $\partial f/\partial\bar z = \tfrac12\big[(U_x-V_y)+i(V_x+U_y)\big]$, che è nullo esattamente quando valgono C–R: è solo un modo compatto di leggere le due condizioni insieme.
`}</Prose>

      <Box kind="osservazione" title="Conseguenze e controesempi">
        {String.raw`
- **Jacobiano**: con C–R, $\det J = U_xV_y-U_yV_x = |f'|^2 \ge 0$. Una funzione olomorfa non inverte mai l'orientamento ($\bar z$, che è una riflessione, sì).
- **$f'\equiv 0$ su un aperto connesso $\Rightarrow f$ costante**: con C–R si ha $\nabla U=\nabla V=0$.
- **Funzioni a valori reali**: lungo $h$ reale il rapporto incrementale è reale, lungo $h$ immaginario è immaginario puro, quindi se $f'$ esiste vale 0. Per questo $\Re z$, $\Im z$ e $|z|$ non sono derivabili su nessun aperto, altrimenti sarebbero costanti.
- **Derivabile in un punto non vuol dire olomorfa**: $|z|^2$ ha $U=x^2+y^2$, $V=0$, e C–R valgono solo in $0$. È derivabile solo nell'origine.
- **La differenziabilità non si può togliere**: $\sqrt{|xy|}$ soddisfa C–R nell'origine (le derivate parziali sono tutte nulle) ma lì non è differenziabile.
- **Conformità**: se $f'(z_0)\neq 0$, tutte le direzioni uscenti da $z_0$ ruotano dello stesso angolo $\arg f'(z_0)$ e vengono dilatate dello stesso fattore $|f'(z_0)|$, quindi gli angoli tra curve si conservano.
`}
      </Box>
    </>
  )
}
