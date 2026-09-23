import { Box, Prose } from '../../components/Math'
import CurveLab from '../../widgets/CurveLab'
import SimplyConnectedGallery from '../../widgets/SimplyConnectedGallery'

export default function CurveJordan() {
  return (
    <>
      <Box kind="definizione" title="Lessico dei cammini">
        {String.raw`
- **Cammino**: $\gamma:[a,b]\to\C$ continua. Il **sostegno** è l'insieme $\gamma([a,b])$, la parametrizzazione fissa anche il **verso** (da $\gamma(a)$ a $\gamma(b)$).
- **Regolare**: $\gamma\in C^1$ con $\gamma'(t)\neq0$. **Regolare a tratti**: continua e regolare su un numero finito di sottointervalli.
- **Circuito**: cammino chiuso, $\gamma(a)=\gamma(b)$. Il verso positivo è quello antiorario.
- **Semplice**: $\gamma(t_1)\neq\gamma(t_2)$ per $t_1\neq t_2$, tranne al più gli estremi.
- Notazioni: $[z_0,z_1]$ è il segmento $tz_1+(1-t)z_0$, $C_r(z_0)$ è la circonferenza $z_0+re^{it}$ con $t\in[0,2\pi]$, e $C_r^{\pm}(z_0)$ sono le semicirconferenze superiore e inferiore.
`}
      </Box>

      <Box kind="teorema" title="Jordan">
        {String.raw`
Un circuito semplice e regolare a tratti $\gamma$ divide il piano in **due aperti connessi**: l'**interno** (limitato) e l'**esterno** (illimitato). Il sostegno di $\gamma$ è la loro frontiera comune.
`}
      </Box>

      <Prose>{String.raw`
L'enunciato sembra ovvio. Per il corso conta come si usa: permette di parlare di "interno di $\gamma$", che è l'ipotesi chiave dei teoremi di Cauchy e del teorema dei residui. Nel teorema dei residui compare l'**indice** $I(\gamma,z_0)$, che per un circuito semplice antiorario vale $1$ se $z_0$ è interno e $0$ se è esterno. In generale conta quante volte $\gamma$ gira attorno a $z_0$:
$$I(\gamma,z_0) = \frac{1}{2\pi i}\int_\gamma\frac{dz}{z-z_0}.$$
Il widget colora ogni punto del piano con questo numero. Prova anche le curve non semplici, per vedere che cosa cambia.
`}</Prose>

      <CurveLab />

      <Box kind="definizione" title="Aperto semplicemente connesso">
        {String.raw`
Un aperto **connesso** $A$ è **semplicemente connesso** se, per ogni circuito semplice $\gamma$ con sostegno in $A$, anche l'**interno** di $\gamma$ è contenuto in $A$. Intuitivamente, $A$ non ha buchi.
`}
      </Box>

      <SimplyConnectedGallery />

      <Box kind="osservazione">
        {String.raw`
La condizione "l'interno di $\gamma$ sta in $A$" è essenziale: la circonferenza unitaria sta in $\C\setminus\{0\}$, ma il suo interno no. Per questo $\int_{C_1(0)} dz/z = 2\pi i\neq 0$ anche se $1/z$ è olomorfa lungo tutta la curva.
`}
      </Box>
    </>
  )
}
