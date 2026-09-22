import { Box, Prose } from '../../components/Math'
import DerivativeLab from '../../widgets/DerivativeLab'

export default function CauchyRiemann() {
  return (
    <>
      <Box kind="definizione" title="Derivata complessa, olomorfia">
        {String.raw`
$f:\Omega\to\C$, $\Omega$ aperto, è **derivabile in senso complesso** in $z_0$ se esiste
$$f'(z_0)=\lim_{h\to 0,\ h\in\C}\frac{f(z_0+h)-f(z_0)}{h}.$$
$f$ è **olomorfa** su $\Omega$ se è derivabile in ogni punto di $\Omega$. L'olomorfia è una proprietà degli aperti: "olomorfa in un punto" significa olomorfa in un intorno di quel punto.
`}
      </Box>

      <Prose>{String.raw`
Equivalentemente, $f(z_0+h) = f(z_0) + f'(z_0)\,h + o(h)$: il differenziale di $f$, visto come mappa $\R^2\to\R^2$, è la **moltiplicazione per il numero complesso** $f'(z_0) = a+ib$, cioè
$$J_f(z_0)=\begin{pmatrix}a & -b\\ b & a\end{pmatrix} = |f'(z_0)|\begin{pmatrix}\cos\varphi & -\sin\varphi\\ \sin\varphi & \cos\varphi\end{pmatrix}.$$
Tra le matrici $2\times 2$ reali, queste formano un sottospazio di dimensione 2 su 4: sono esattamente le rotodilatazioni. Da qui viene tutto il resto.
`}</Prose>

      <Box kind="teorema" title="Cauchy–Riemann">
        {String.raw`
Sia $f = u+iv$. Allora $f$ è derivabile in senso complesso in $z_0=x_0+iy_0$ se e solo se

1. $f$ è differenziabile in $(x_0,y_0)$ come funzione $\R^2\to\R^2$;
2. valgono in $(x_0,y_0)$ le equazioni $u_x = v_y$, $u_y = -v_x$.

In tal caso $f'(z_0) = u_x + i v_x = v_y - i u_y$.

In forma compatta, con gli operatori di Wirtinger $\partial_z = \tfrac12(\partial_x - i\partial_y)$ e $\partial_{\bar z} = \tfrac12(\partial_x + i\partial_y)$, le equazioni si riducono a $\dfrac{\partial f}{\partial \bar z}=0$. Pensando $f$ come funzione di $z$ e $\bar z$, olomorfa significa che $f$ **non dipende da** $\bar z$.
`}
      </Box>

      <DerivativeLab />

      <Box kind="osservazione" title="Sottigliezze che all'orale piacciono">
        {String.raw`
- **La 1 non si può togliere.** $f(x+iy)=\sqrt{|xy|}$ soddisfa C–R nell'origine (tutte le derivate parziali sono nulle) ma non è differenziabile lì: lungo la bisettrice il rapporto incrementale non tende a 0. Una condizione sufficiente comoda: derivate parziali continue in un intorno + C–R ⇒ olomorfa.
- **Derivabile in un punto ≠ olomorfa.** $|z|^2$ è derivabile solo in 0 e non è olomorfa da nessuna parte.
- **Conformità.** Se $f'(z_0)\neq 0$, $f$ conserva gli angoli orientati tra curve passanti per $z_0$: tutte le direzioni ruotano di $\arg f'(z_0)$ e vengono dilatate di $|f'(z_0)|$. Vale anche il viceversa: una mappa $C^1$ che conserva angoli e orientamento è olomorfa. $\bar z$ conserva gli angoli ma inverte l'orientamento.
- **$\det J_f = |f'|^2 \ge 0$**: una funzione olomorfa non inverte mai l'orientamento.
`}
      </Box>

      <Prose>{String.raw`
### Conseguenze immediate

Su un aperto **connesso** $\Omega$, con $f$ olomorfa:

- $f'\equiv 0 \Rightarrow f$ costante. Se $\Re f$, $\Im f$, $|f|$ o $\arg f$ è costante, allora $f$ è costante: si dimostra con C–R. Per $|f|$ costante, derivando $u^2+v^2=c$ si ottiene un sistema lineare in $(u,v)$ con determinante $u_x^2+v_x^2 = |f'|^2$.
- $u$ e $v$ sono **armoniche**: $\Delta u = u_{xx}+u_{yy} = v_{yx}-v_{xy} = 0$. Per ora serve l'ipotesi $C^2$; con il teorema di analiticità verrà gratis.
- Le curve di livello $u = c_1$ e $v = c_2$ si intersecano ortogonalmente dove $f'\neq 0$, perché $\nabla u\cdot\nabla v = u_xv_x+u_yv_y = 0$.
`}</Prose>

      <Box kind="esame" title="Coniugata armonica">
        {String.raw`
Data $u$ armonica, trovare $v$ tale che $f = u+iv$ sia olomorfa. Si integra $v_y = u_x$ in $y$, poi si fissa la funzione di $x$ imponendo $v_x = -u_y$. Una scorciatoia: $f'(z) = u_x - i u_y$, calcolata sulla retta reale ($y=0$) e integrata in $z$, dà $f$ a meno di una costante. Esempio: $u = x^3-3xy^2$ dà $f'(x) = 3x^2$, quindi $f = z^3 + ic$.

Su domini non semplicemente connessi la coniugata può non esistere globalmente: $u=\ln|z|$ su $\C\setminus\{0\}$ avrebbe come coniugata $\arg z$, che non è una funzione continua.
`}
      </Box>
    </>
  )
}
