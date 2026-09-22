import { Box, Prose } from '../../components/Math'
import ComplexExplorer from '../../widgets/ComplexExplorer'
import DomainColoring from '../../widgets/DomainColoring'

export default function FunzioniComplesse() {
  return (
    <>
      <Box kind="richiamo" title="Il campo ℂ in tre righe">
        {String.raw`
$z = x+iy = \rho e^{i\theta}$, con $|z|=\rho$ e $\arg z = \theta + 2k\pi$: l'argomento è un **insieme**, $\Arg z\in(-\pi,\pi]$ è la sua determinazione principale. Moltiplicare per $w$ significa ruotare di $\arg w$ e dilatare di $|w|$. Da qui le radici $n$-esime: $w^{1/n}$ ha esattamente $n$ valori, disposti su un poligono regolare.

$\C$ è un campo, ma **non è ordinato**: scritture come $z_1 < z_2$ o $\max\{z_1, z_2\}$ non hanno senso. Le disuguaglianze si fanno sempre sui moduli.
`}
      </Box>

      <Prose>{String.raw`
Una funzione $f:\Omega\subseteq\C\to\C$ è, dal punto di vista topologico, una funzione $\R^2\to\R^2$, $f = u + iv$. Limiti e continuità sono quelli di $\R^2$ con la norma $|\cdot|$: $\lim_{z\to z_0} f(z) = \ell$ se $|f(z)-\ell|\to 0$ **lungo qualunque percorso**. Conviene aggiungere il punto all'infinito, $\hat\C = \C\cup\{\infty\}$ (sfera di Riemann): $f(z)\to\infty$ significa $|f(z)|\to+\infty$ e $z\to\infty$ significa $|z|\to+\infty$, senza distinzione di direzioni.

Il problema pratico è che non si può disegnare il grafico di $f$, perché vive in $\R^4$. Due strategie standard:

1. **Deformazione del piano**: si guarda dove $f$ manda una griglia (qui sotto).
2. **Domain coloring**: si colora il dominio in base al valore di $f$ (più sotto). Zeri, poli e singolarità si riconoscono a colpo d'occhio.
`}</Prose>

      <ComplexExplorer />

      <Box kind="osservazione" title="Cosa guardare">
        {String.raw`
- Per le funzioni olomorfe con $f'\neq 0$ le linee della griglia si incontrano ancora ad **angolo retto** anche dopo la deformazione: è la conformità, che ritroverai nella pagina su Cauchy–Riemann.
- Dove $f'(z_0)=0$ (per esempio $z^2$ in 0) gli angoli vengono moltiplicati per l'ordine dello zero di $f'$ più uno.
- $\Log$ e $\sqrt{\cdot}$ non sono continue su tutto $\C\setminus\{0\}$: la traccia salta quando attraversi il semiasse reale negativo.
`}
      </Box>

      <Prose>{String.raw`
### Rami e funzioni "multivoche"

$e^z$ non è iniettiva ($e^{z+2\pi i}=e^z$), quindi "il" logaritmo non esiste come funzione su $\C\setminus\{0\}$. Si sceglie un **ramo**: una funzione continua $L$ su un aperto $\Omega$ con $e^{L(z)}=z$. Il ramo principale è
$$\Log z = \ln|z| + i\Arg z,\qquad z\in\C\setminus(-\infty,0],$$
e da questo seguono le potenze $z^\alpha := e^{\alpha\Log z}$. Attenzione alle identità "ovvie": in generale $\Log(z_1z_2)\neq\Log z_1+\Log z_2$ e $(z^\alpha)^\beta\neq z^{\alpha\beta}$. Per esempio $\Log((-1)\cdot(-1)) = 0$, mentre $\Log(-1)+\Log(-1) = 2\pi i$.

Esiste un ramo continuo del logaritmo su $\Omega$ se e solo se esiste un ramo continuo dell'argomento. Su $\C\setminus\{0\}$ nessuno dei due esiste: ogni cammino che gira attorno all'origine fa crescere l'argomento di $2\pi$. Lo stesso fenomeno tornerà con l'indice di avvolgimento e con $\oint dz/z = 2\pi i$.
`}</Prose>

      <DomainColoring />

      <Box kind="esame">
        {String.raw`
Esercizi tipici: risolvere $\sin z = 2$, $e^z = -1$, $z^4 = -16$ oppure calcolare $i^i$. La strategia è sempre riscrivere tutto con esponenziali e passare a modulo e argomento. Per esempio $\sin z = 2$ diventa $e^{2iz} - 4ie^{iz} - 1 = 0$, un'equazione di secondo grado in $e^{iz}$. Ricorda che $i^i = e^{i\log i}$ ha infiniti valori $e^{-\pi/2 - 2k\pi}$, tutti reali.
`}
      </Box>
    </>
  )
}
