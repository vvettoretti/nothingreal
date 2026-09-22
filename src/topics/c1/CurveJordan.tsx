import { Box, Prose } from '../../components/Math'
import CurveLab from '../../widgets/CurveLab'

export default function CurveJordan() {
  return (
    <>
      <Box kind="richiamo" title="Lessico delle curve">
        {String.raw`
Una **curva** è una $\gamma:[a,b]\to\C$ continua. Il **sostegno** $\gamma^* = \gamma([a,b])$ è l'insieme dei punti, la curva è il sostegno insieme al modo di percorrerlo. È **chiusa** se $\gamma(a)=\gamma(b)$, **semplice** se è iniettiva su $[a,b)$, **regolare** se $C^1$ con $\gamma'\neq 0$, **regolare a tratti** se lo è su un numero finito di sottointervalli. Due parametrizzazioni sono **equivalenti** se differiscono per un cambio di parametro $C^1$ con derivata positiva. Gli integrali di linea dipendono solo dalla classe di equivalenza e cambiano segno con l'orientamento opposto, $\gamma^-(t) = \gamma(a+b-t)$.
`}
      </Box>

      <Box kind="teorema" title="Jordan">
        {String.raw`
Se $\gamma$ è una curva chiusa semplice (curva di Jordan), allora $\C\setminus\gamma^*$ ha esattamente **due componenti connesse**, una limitata (l'interno $I(\gamma)$) e una illimitata (l'esterno $E(\gamma)$), e $\gamma^*$ è la frontiera di entrambe.
`}
      </Box>

      <Prose>{String.raw`
L'enunciato sembra ovvio, e per curve regolari a tratti lo è abbastanza. Per curve solo continue la dimostrazione è difficile, perché esistono curve di Jordan con area positiva (curve di Osgood). Per il corso conta soprattutto come si usa: permette di parlare di "regione racchiusa da $\gamma$" e di **orientamento positivo** (antiorario: l'interno resta a sinistra), che sono le ipotesi del teorema di Cauchy e del teorema dei residui.

Lo strumento che rende quantitativo "stare dentro" è l'**indice di avvolgimento**:
$$\Ind_\gamma(z_0) = \frac{1}{2\pi i}\oint_\gamma\frac{dz}{z-z_0}\in\Z,\qquad z_0\notin\gamma^*.$$
Conta quante volte, al netto dei versi, $\gamma$ gira attorno a $z_0$: è la variazione totale di $\arg(z-z_0)$ divisa per $2\pi$. È costante sulle componenti connesse di $\C\setminus\gamma^*$ ed è nullo su quella illimitata. Per una curva di Jordan orientata positivamente vale $1$ dentro e $0$ fuori.
`}</Prose>

      <CurveLab />

      <Box kind="osservazione">
        {String.raw`
- Quando i teoremi dicono "per ogni curva chiusa semplice orientata positivamente contenuta in $\Omega$ il cui interno è contenuto in $\Omega$", l'ultima condizione è essenziale: la circonferenza unitaria sta in $\C\setminus\{0\}$, ma il suo interno no. Per questo $\oint dz/z = 2\pi i\neq 0$.
- **Semplicemente connesso** (aperto connesso in cui ogni curva chiusa è omotopa a un punto) equivale, nel piano, a: l'interno di ogni curva di Jordan in $\Omega$ sta in $\Omega$. Ancora equivalente: $\Ind_\gamma(z) = 0$ per ogni $\gamma$ chiusa in $\Omega$ e ogni $z\notin\Omega$. È questa l'ipotesi "giusta" per il teorema di Cauchy.
- Con curve non semplici i teoremi dei residui restano validi se si pesa ogni singolarità con il suo indice: $\oint_\gamma f = 2\pi i\sum_k \Ind_\gamma(z_k)\Res(f,z_k)$.
`}
      </Box>
    </>
  )
}
