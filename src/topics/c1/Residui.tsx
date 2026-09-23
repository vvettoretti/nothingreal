import { Box, Prose } from '../../components/Math'
import RealIntegralLab from '../../widgets/RealIntegralLab'
import ResidueLab from '../../widgets/ResidueLab'

export default function Residui() {
  return (
    <>
      <Box kind="definizione" title="Residuo">
        {String.raw`
Se $z_0$ è una singolarità isolata di $f$, il **residuo** è il coefficiente $c_{-1}$ dello sviluppo di Laurent sul disco bucato:
$$\Res(f,z_0)=c_{-1}=\frac1{2\pi i}\int_{C_r(z_0)}f(z)\,dz.$$
Integrando la serie termine a termine (la convergenza è totale), sopravvive solo $c_{-1}$, perché $\int_{C_r(z_0)}(z-z_0)^n\,dz=0$ per $n\neq-1$ e vale $2\pi i$ per $n=-1$.
`}
      </Box>

      <Box kind="richiamo" title="Calcolo dei residui">
        {String.raw`
- **Eliminabile**: residuo 0.
- **Polo di ordine $N$**: $\Res(f,z_0)=\dfrac{1}{(N-1)!}\lim_{z\to z_0}\dfrac{d^{N-1}}{dz^{N-1}}\big[(z-z_0)^Nf(z)\big]$. Per $N=1$ si riduce a $\lim_{z\to z_0}(z-z_0)f(z)$, e se $f=g/h$ con $h$ che ha uno zero semplice diventa $\frac{g(z_0)}{h'(z_0)}$.
- **Essenziale**, o quando le derivate diventano pesanti: si scrive lo sviluppo e si legge $c_{-1}$. Per esempio $\frac{\sin z}{z^3}=\frac1{z^2}-\frac16+\dots$ ha residuo $0$ in 0, e $\Res(e^{1/z},0)=1$.
`}
      </Box>

      <Box kind="teorema" title="Teorema dei residui">
        {String.raw`
Sia $A$ semplicemente connesso e $f$ olomorfa su $A\setminus\{z_0,\dots,z_n\}$. Se $\gamma$ è un circuito semplice, regolare a tratti e antiorario, con sostegno che non passa per le $z_j$, allora
$$\int_\gamma f(z)\,dz = 2\pi i\sum_{j}\Res(f,z_j)\,I(\gamma,z_j),$$
dove l'indice $I(\gamma,z_j)$ vale 1 se $z_j$ è interno a $\gamma$ e 0 se è esterno. Contano **solo le singolarità dentro**.
`}
      </Box>

      <Prose>{String.raw`
Per la dimostrazione non serve niente di nuovo: con i circuiti equivalenti si sostituisce $\gamma$ con cerchietti attorno alle singolarità interne, e su ciascuno l'integrale vale $2\pi i\,c_{-1}$. Esempio: $\int_{C_1(i)}\frac{dz}{z^2+1}$ contiene solo il polo $i$, con residuo $\frac1{2i}$, quindi vale $\pi$.
`}</Prose>

      <ResidueLab />

      <Prose>{String.raw`
### Applicazioni: integrali reali

L'idea è sempre la stessa: si trasforma l'integrale reale in un integrale su un circuito, dove una parte è l'integrale cercato e le altre si calcolano oppure tendono a zero.

1. **Trigonometrici** $\int_0^{2\pi}F(\cos t,\sin t)\,dt$. Con $z=e^{it}$ si ha $\cos t=\frac{z+z^{-1}}2$, $\sin t = \frac{z-z^{-1}}{2i}$ e $dt=\frac{dz}{iz}$, e si integra su $C_1(0)$ contando i poli dentro il disco unitario.
2. **Razionali** $\int_{-\infty}^{+\infty}\frac{P(x)}{Q(x)}\,dx$, con $\deg Q\ge\deg P+2$ e $Q$ senza zeri reali. Si chiude con la semicirconferenza $C_R^+(0)$, e l'arco tende a 0 per la stima $\max|f|\cdot\pi R$.
3. **Oscillanti** $\int_{-\infty}^{+\infty}f(x)\,e^{i\omega x}\,dx$, che servono per la trasformata di Fourier. Si chiude in alto per $\omega>0$, e per l'arco serve il lemma di Jordan.
`}</Prose>

      <Box kind="esame" title="Esempio trigonometrico">
        {String.raw`
$\int_0^{2\pi}\frac{dt}{2+\sin t}$: con $z=e^{it}$ diventa $\int_{C_1(0)}\frac{2\,dz}{z^2+4iz-1}$. I poli sono $i(-2\pm\sqrt3)$, e solo $z_0=i(\sqrt3-2)$ sta nel disco unitario. $\Res = \frac{2}{z_0-z_1}=\frac{2}{2i\sqrt3}$, quindi l'integrale vale $2\pi i\cdot\frac{1}{i\sqrt3}=\frac{2\pi}{\sqrt3}$.
`}
      </Box>

      <Box kind="teorema" title="Lemma di Jordan">
        {String.raw`
Se $g$ è continua per $\Im z\ge0$, $|z|$ grande, e $M(R)=\max_{C_R^+}|g|\to0$, allora per $\omega>0$
$$\left|\int_{C_R^+}g(z)e^{i\omega z}\,dz\right|\le\frac{\pi}{\omega}M(R)\longrightarrow0.$$
Il fattore $e^{-\omega R\sin\theta}$ compensa la lunghezza $\pi R$ dell'arco, quindi basta $g\to0$ e non serve $g=o(1/R)$.
`}
      </Box>

      <RealIntegralLab />

      <Box kind="esame" title="Checklist">
        {String.raw`
1. Controlla la **convergenza** dell'integrale reale. Se la funzione è pari, $\int_0^\infty = \tfrac12\int_{-\infty}^{\infty}$.
2. Al posto di $\cos$ e $\sin$ usa $e^{iz}$, e **dichiara** se alla fine prendi $\Re$ o $\Im$.
3. Elenca le singolarità e tieni **solo quelle interne** al circuito.
4. Giustifica esplicitamente perché l'arco tende a zero (stima ML oppure Jordan) e scrivi le stime.
5. Verifica il risultato: l'integrale di una funzione positiva deve essere reale e positivo.
`}
      </Box>
    </>
  )
}
