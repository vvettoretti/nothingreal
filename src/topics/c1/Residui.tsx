import { Box, Prose } from '../../components/Math'
import RealIntegralLab from '../../widgets/RealIntegralLab'
import ResidueLab from '../../widgets/ResidueLab'

export default function Residui() {
  return (
    <>
      <Box kind="teorema" title="Teorema dei residui">
        {String.raw`
Sia $\Omega$ un aperto e $f$ olomorfa su $\Omega\setminus\{z_1,\dots,z_k\}$. Se $\gamma$ è una curva di Jordan positivamente orientata con $\gamma^*$ e il suo interno contenuti in $\Omega$, e nessuna $z_j$ sta su $\gamma^*$, allora
$$\oint_\gamma f(z)\,dz = 2\pi i\sum_{z_j\in I(\gamma)}\Res(f,z_j).$$
Per curve chiuse qualsiasi ogni residuo va pesato con l'indice $\Ind_\gamma(z_j)$.
`}
      </Box>

      <Prose>{String.raw`
La dimostrazione non ha niente di nuovo: si deforma $\gamma$ in piccole circonferenze attorno a ogni $z_j$ (Cauchy) e su ciascuna si integra lo sviluppo di Laurent termine a termine. Sopravvive solo $a_{-1}$. Tutta la difficoltà pratica sta nel **calcolare i residui** e nello **scegliere il contorno**.
`}</Prose>

      <Box kind="richiamo" title="Calcolo dei residui">
        {String.raw`
- **Polo semplice**: $\Res(f,z_0)=\lim_{z\to z_0}(z-z_0)f(z)$. Se $f=g/h$ con $g(z_0)\ne0$, $h(z_0)=0$, $h'(z_0)\neq0$, vale $\Res=\dfrac{g(z_0)}{h'(z_0)}$: è la formula più usata.
- **Polo di ordine $m$**: $\Res(f,z_0)=\dfrac{1}{(m-1)!}\lim_{z\to z_0}\dfrac{d^{m-1}}{dz^{m-1}}\big[(z-z_0)^mf(z)\big]$.
- **Singolarità essenziale** (o quando le derivate diventano pesanti): si scrive lo sviluppo di Laurent e si legge $a_{-1}$. Per esempio $\Res(e^{1/z},0) = 1$ e $\Res(z^2\sin\frac1z,0)=-\frac16$.
- **Eliminabile**: residuo 0. Per funzioni **pari** in $z_0=0$ il residuo è 0, perché $a_{-1}$ è il coefficiente di una potenza dispari.
`}
      </Box>

      <ResidueLab />

      <Prose>{String.raw`
### Applicazioni: integrali reali

L'idea è sempre la stessa: si trasforma l'integrale reale in un integrale su una curva chiusa, dove una parte è l'integrale cercato e le altre si calcolano oppure tendono a zero.

1. **Razionali su $\R$**: $\int_{-\infty}^{\infty}\frac{P}{Q}\,dx$ con $\deg Q\ge\deg P+2$ e $Q$ senza zeri reali. Si usa il semicerchio superiore e l'arco va a zero per la stima ML.
2. **Trasformate di Fourier**: $\int_{-\infty}^{\infty}R(x)e^{i\omega x}dx$ con $\omega>0$ e $\deg Q\ge\deg P+1$. Semicerchio superiore più **lemma di Jordan**. Per $\omega<0$ si chiude sotto e la curva va percorsa in verso orario.
3. **Trigonometrici**: $\int_0^{2\pi}R(\cos\theta,\sin\theta)\,d\theta$. Con $z=e^{i\theta}$ si ha $\cos\theta=\frac{z+z^{-1}}2$, $\sin\theta = \frac{z-z^{-1}}{2i}$, $d\theta=\frac{dz}{iz}$, e si integra su $|z|=1$.
4. Poli **sull'asse reale**: si aggira il polo con un piccolo semicerchio. Il suo contributo tende a $-\pi i\,\Res$ se il polo è semplice (valore principale).
`}</Prose>

      <Box kind="teorema" title="Lemma di Jordan">
        {String.raw`
Se $g$ è continua su $\{\Im z\ge0,\ |z|\ge R_0\}$ e $M(R)=\max_{C_R}|g|\to0$, allora per $\omega>0$
$$\left|\int_{C_R}g(z)e^{i\omega z}\,dz\right|\le\frac{\pi}{\omega}M(R)\longrightarrow0.$$
Il punto è la disuguaglianza $\sin\theta\ge\frac{2\theta}{\pi}$ su $[0,\pi/2]$: il fattore $e^{-\omega R\sin\theta}$ compensa la lunghezza $\pi R$ dell'arco.
`}
      </Box>

      <RealIntegralLab />

      <Box kind="esame">
        {String.raw`
Una checklist che evita metà degli errori:

1. controlla **convergenza** dell'integrale reale e parità: se $f$ è pari, $\int_0^\infty = \tfrac12\int_{-\infty}^{\infty}$;
2. scegli $f(z)$ con $e^{iz}$ al posto di $\cos$ e $\sin$, e **dichiara** se alla fine prendi $\Re$ o $\Im$;
3. elenca i poli e tieni **solo quelli dentro** il contorno;
4. giustifica esplicitamente perché l'arco va a zero (ML oppure Jordan) e scrivi le stime;
5. verifica il risultato: un integrale di una funzione positiva deve venire reale e positivo.
`}
      </Box>
    </>
  )
}
