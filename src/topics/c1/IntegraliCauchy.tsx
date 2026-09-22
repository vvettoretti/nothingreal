import { Box, Prose } from '../../components/Math'
import PathLab from '../../widgets/PathLab'
import PolyaLab from '../../widgets/PolyaLab'

export default function IntegraliCauchy() {
  return (
    <>
      <Box kind="definizione" title="Integrale curvilineo in ℂ">
        {String.raw`
Per $\gamma:[a,b]\to\C$ regolare a tratti e $f$ continua su $\gamma^*$:
$$\int_\gamma f(z)\,dz := \int_a^b f(\gamma(t))\,\gamma'(t)\,dt.$$
Scrivendo $f=u+iv$ e $dz = dx+i\,dy$:
$$\int_\gamma f\,dz = \int_\gamma (u\,dx - v\,dy) + i\int_\gamma (v\,dx + u\,dy),$$
cioè due integrali di forme differenziali reali. È **invariante per riparametrizzazioni** che conservano il verso e cambia segno con il verso opposto.
`}
      </Box>

      <Prose>{String.raw`
Due strumenti da avere sempre pronti:

- **Stima ML**: $\left|\int_\gamma f\,dz\right| \le \max_{\gamma^*}|f|\cdot L(\gamma)$. È la base del lemma del grande cerchio, delle stime di Cauchy e di quasi tutti i "questo pezzo tende a zero".
- **Teorema fondamentale**: se $f$ ha una primitiva $F$ su $\Omega$ ($F'=f$), allora $\int_\gamma f = F(\gamma(b))-F(\gamma(a))$, e in particolare è nullo su ogni curva chiusa. Vale anche il viceversa: $f$ continua ha primitiva su $\Omega$ connesso se e solo se l'integrale su ogni curva chiusa è nullo.

Quindi la domanda "$f$ ha una primitiva?" coincide con "gli integrali su curve chiuse sono nulli?". L'esempio fondamentale è $\oint_{|z|=1} z^n\,dz = 2\pi i$ se $n=-1$ e $0$ altrimenti: tutte le potenze tranne $z^{-1}$ hanno primitiva su $\C\setminus\{0\}$.
`}</Prose>

      <Box kind="teorema" title="Cauchy (Cauchy–Goursat) e formula integrale">
        {String.raw`
Sia $f$ olomorfa su un aperto $\Omega$.

1. **Cauchy.** Se $\gamma$ è chiusa in $\Omega$ e omotopa a un punto in $\Omega$ (per esempio se $\Omega$ è semplicemente connesso), allora $\oint_\gamma f\,dz = 0$. In particolare $f$ ha primitiva su ogni aperto semplicemente connesso.
2. **Formula integrale.** Se $\overline{D}\subset\Omega$, con $D$ un disco o più in generale l'interno di una curva di Jordan $\gamma$ positivamente orientata, allora per ogni $z_0\in D$
$$f(z_0) = \frac{1}{2\pi i}\oint_\gamma\frac{f(z)}{z-z_0}\,dz,\qquad f^{(n)}(z_0) = \frac{n!}{2\pi i}\oint_\gamma\frac{f(z)}{(z-z_0)^{n+1}}\,dz.$$
`}
      </Box>

      <Prose>{String.raw`
Goursat dimostra il teorema senza supporre $f'$ continua: triangoli sempre più piccoli e stima ML. Se si accetta $f\in C^1$, basta Green più Cauchy–Riemann. È proprio quello che mostra il campo di Pólya qui sotto: la parte reale e la parte immaginaria di $\oint f\,dz$ sono la **circolazione** e il **flusso** di $\overline{f}$.
`}</Prose>

      <PolyaLab />

      <Box kind="osservazione" title="Cosa porta via la formula integrale">
        {String.raw`
- **Regolarità gratis**: olomorfa ⇒ $C^\infty$. Dalla formula integrale si deriva sotto il segno di integrale quante volte si vuole. Nel caso reale non esiste nulla del genere.
- **Media integrale**: con $\gamma$ la circonferenza di raggio $r$, $f(z_0) = \frac1{2\pi}\int_0^{2\pi}f(z_0+re^{i\theta})\,d\theta$. Da qui segue il principio del massimo modulo.
- **Morera** (inverso di Cauchy): se $f$ è continua e $\oint_{\partial T} f = 0$ per ogni triangolo $T$, allora $f$ è olomorfa. Serve per mostrare che limiti uniformi di olomorfe sono olomorfe.
- **Deformazione dei contorni**: se due curve chiuse sono omotope in $\Omega$, danno lo stesso integrale. È questo che rende utili le circonferenze piccole attorno alle singolarità.
`}
      </Box>

      <PathLab />

      <Box kind="esame">
        {String.raw`
Esercizio tipico: $\oint_{|z|=2}\frac{e^{z}}{(z-1)^3}\,dz$. Con la formula per le derivate ($n=2$, $f=e^z$, $z_0=1$) il risultato è $\frac{2\pi i}{2!}e = \pi i e$. Prima di calcolare, controlla sempre **quali punti stanno dentro** la curva, e ricorda che una curva percorsa due volte raddoppia il risultato.
`}
      </Box>
    </>
  )
}
