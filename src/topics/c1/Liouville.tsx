import { Box, Prose } from '../../components/Math'
import GrowthLab from '../../widgets/GrowthLab'

export default function Liouville() {
  return (
    <>
      <Box kind="teorema" title="Liouville">
        {String.raw`
Se $f$ è **intera** (olomorfa su tutto $\C$), allora $f$ è **limitata** $\iff$ $f$ è **costante**.
`}
      </Box>

      <Prose>{String.raw`
**Dimostrazione.** Sia $|f|\le M$. $f$ è analitica su $\C$, quindi $f(z)=\sum c_nz^n$ con $c_n = \frac1{2\pi i}\int_{C_R(0)}\frac{f(w)}{w^{n+1}}\,dw$ per **ogni** $R>0$. Stimando l'integrale con max per lunghezza:
$$|c_n|\le\frac{1}{2\pi}\cdot\frac{M}{R^{n+1}}\cdot 2\pi R=\frac{M}{R^n}\xrightarrow[R\to\infty]{}0\qquad(n\ge1).$$
Resta solo $c_0$, quindi $f$ è costante.

Il teorema dice che la rigidità delle funzioni olomorfe è globale: una funzione intera non costante deve andare all'infinito, almeno lungo qualche direzione. Per questo $e^z$, $\sin z$ e $\cos z$ non possono essere limitate su $\C$, anche se $\sin$ e $\cos$ lo sono sull'asse reale.
`}</Prose>

      <GrowthLab />

      <Box kind="teorema" title="Teorema fondamentale dell'algebra (corollario)">
        {String.raw`
Un polinomio $P$ di grado $n\ge1$ ha almeno uno zero. Se non ne avesse, $1/P$ sarebbe intera. Poiché $P(z)\to\infty$ per $z\to\infty$, $1/P$ è limitata fuori da un disco, e dentro il disco lo è per Weierstrass. Per Liouville $1/P$ sarebbe costante, il che è assurdo. Applicando il risultato più volte, $P$ ha esattamente $n$ zeri contati con molteplicità.
`}
      </Box>

      <Box kind="osservazione">
        {String.raw`
La stessa stima con $|f(z)|\le C|z|^k$ per $|z|$ grande dà $|c_n|\le C R^{k-n}\to 0$ per $n>k$: $f$ è un polinomio di grado al più $k$. È quello che mostra la pendenza nel grafico log-log qui sopra.
`}
      </Box>

      <Box kind="esame">
        {String.raw`
- Se $f$ è intera e $\Re f\le c$, allora $f$ è costante. Basta applicare Liouville a $e^{f}$, che ha modulo $e^{\Re f}\le e^c$.
- "Esiste $f$ intera non costante con $|f(z)|\le 1+|z|^{1/2}$?" No: per l'osservazione sopra $f$ è un polinomio di grado $\le 0$, cioè una costante.
`}
      </Box>
    </>
  )
}
