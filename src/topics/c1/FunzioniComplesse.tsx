import { Box, Prose } from '../../components/Math'
import ComplexExplorer from '../../widgets/ComplexExplorer'
import DomainColoring from '../../widgets/DomainColoring'

export default function FunzioniComplesse() {
  return (
    <>
      <Box kind="richiamo" title="Il campo ℂ in tre righe">
        {String.raw`
$z = x+iy = \rho e^{i\theta}$, con $\rho=|z|=\sqrt{z\bar z}$ e $\arg z$ definito a meno di multipli di $2\pi$. L'argomento principale è $\Arg z\in(-\pi,\pi]$. Moltiplicare per $w$ significa ruotare di $\arg w$ e dilatare di $|w|$, quindi $z^m = \rho^m e^{im\theta}$ (De Moivre), e le radici di $z^m=\rho e^{i\theta}$ sono $\rho^{1/m}e^{i(\theta+2\pi k)/m}$ con $k=0,\dots,m-1$, cioè i vertici di un poligono regolare. $\C$ è un campo, di dimensione 2 su $\R$ e 1 su $\C$, e ogni polinomio di grado $n\ge1$ ha $n$ radici contate con molteplicità (teorema fondamentale dell'algebra).

$\C$ **non è ordinato**: scritture come $z_1 < z_2$ non hanno senso. Le disuguaglianze si fanno sempre sui moduli, per esempio $\big||z_1|-|z_2|\big|\le|z_1+z_2|\le|z_1|+|z_2|$.
`}
      </Box>

      <Prose>{String.raw`
A una funzione $f:A\subseteq\C\to\C$ si associano due funzioni reali di due variabili, $U(x,y)=\Re f(x+iy)$ e $V(x,y)=\Im f(x+iy)$, e alcuni campi vettoriali su $\R^2$: $(U,V)$, $(V,U)$ e $(U,-V)$. Per esempio $z^2 = (x^2-y^2) + i\,2xy$. Gli ultimi due campi torneranno negli integrali di linea: sono il ponte con Analisi 2.
`}</Prose>

      <Box kind="richiamo" title="Topologia, limiti, infinito">
        {String.raw`
- $B_r(z_0)=\{|z-z_0|<r\}$ è il disco aperto. $A$ è **aperto** se contiene un disco attorno a ogni suo punto, **chiuso** se $\C\setminus A$ è aperto. $z_0$ è **di accumulazione** per $E$ se ogni disco bucato attorno a $z_0$ interseca $E$; la **chiusura** $\overline E$ è $E$ più i suoi punti di accumulazione.
- $\lim_{z\to z_0}f(z)=\lambda$ se $|f(z)-\lambda|\to0$ per $0<|z-z_0|\to0$, **da qualunque direzione**, ed equivale a $u\to\Re\lambda$ e $v\to\Im\lambda$. Per esempio $\bar z/z = e^{-2i\theta}$ vale $1$ sull'asse reale e $-1$ su quello immaginario, quindi il limite in 0 non esiste.
- $f(z)\to\infty$ significa $|f(z)|\to+\infty$ (in $\C$ non esistono $+\infty$ e $-\infty$: per esempio $1/z\to\infty$ per $z\to0$), e $z\to\infty$ significa $|z|\to+\infty$. Con la proiezione stereografica $\C\cup\{\infty\}$ diventa la **sfera di Riemann**, e gli intorni di $\infty$ sono i complementari dei dischi chiusi, $\{|z|>R\}$.
`}
      </Box>

      <Prose>{String.raw`
Il problema pratico è che il grafico di $f$ vive in $\R^4$ e non si può disegnare. Ci sono due strategie standard:

1. **Deformazione del piano**: si guarda dove $f$ manda una griglia (qui sotto).
2. **Domain coloring**: si colora il dominio in base al valore di $f$ (più sotto). Zeri, poli e singolarità si riconoscono a colpo d'occhio.
`}</Prose>

      <ComplexExplorer />

      <Box kind="osservazione" title="Cosa guardare">
        {String.raw`
- Per le funzioni olomorfe con $f'\neq 0$ le linee della griglia si incontrano ancora ad **angolo retto** anche dopo la deformazione. È la conformità, che ritroverai nella pagina su Cauchy–Riemann.
- Dove $f'(z_0)=0$ (per esempio $z^2$ in 0) gli angoli vengono moltiplicati per l'ordine dello zero di $f'$ più uno.
- $e^z$ non è iniettiva ($e^{z+2\pi i}=e^z$), quindi non ha un'inversa su tutto $\C\setminus\{0\}$. $\Log z$ e $\sqrt z$ nel menu sono i rami principali, definiti tagliando il semiasse reale negativo: la traccia salta quando lo attraversi.
`}
      </Box>

      <DomainColoring />

      <Box kind="esame">
        {String.raw`
Esercizi tipici: risolvere $\sin z = 2$, $e^z = -1$ o $z^4 = -16$. La strategia è sempre riscrivere tutto con esponenziali e passare a modulo e argomento. Per esempio $\sin z = 2$ diventa $e^{2iz} - 4ie^{iz} - 1 = 0$, un'equazione di secondo grado in $e^{iz}$, e $e^z=-1$ dà $e^x=1$, $y=\pi+2k\pi$.
`}
      </Box>
    </>
  )
}
