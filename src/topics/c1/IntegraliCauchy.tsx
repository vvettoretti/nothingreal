import { Box, Prose, Text } from '../../components/Math'
import PathLab from '../../widgets/PathLab'
import PolyaLab from '../../widgets/PolyaLab'

// Dizionario Analisi 2 ↔ Analisi 3: f = u + iv ↔ i campi (u,−v) e (v,u).
const DICT: [string, string][] = [
  ['$\\int_\\gamma f\\,dz$', 'lavoro di $(u,-v)$ $+\\;i\\,\\cdot$ lavoro di $(v,u)$'],
  ['$f$ olomorfa', '$(u,-v)$ e $(v,u)$ di classe $C^1$ e **irrotazionali** (= C–R)'],
  ['$f$ ha primitiva $F=U+iV$', '$(u,-v)$ e $(v,u)$ **conservativi**, con potenziali $U$ e $V$'],
  ['$\\int_\\gamma f\\,dz=0$ su ogni circuito', 'lavoro nullo su ogni circuito'],
  ['$A$ semplicemente connesso: olomorfa ⇒ primitiva', 'irrotazionale ⇒ conservativo'],
]

function Dictionary() {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="grid grid-cols-2 border-b border-line bg-card-2 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
        <div>Analisi 3</div>
        <div>Analisi 2</div>
      </div>
      {DICT.map(([a, b]) => (
        <div key={a} className="grid grid-cols-2 gap-4 border-b border-line px-5 py-3 text-[15px] leading-relaxed text-[#c9c8d2] last:border-0">
          <div className="text-fg"><Text>{a}</Text></div>
          <div><Text>{b}</Text></div>
        </div>
      ))}
    </div>
  )
}

export default function IntegraliCauchy() {
  return (
    <>
      <Box kind="definizione" title="Integrale di linea in ℂ">
        {String.raw`
Per $\gamma:[a,b]\to\C$ regolare a tratti e $f=u+iv$ continua su un aperto che contiene il sostegno:
$$\int_\gamma f(z)\,dz := \int_a^b f(\gamma(t))\,\gamma'(t)\,dt = \int_\gamma (u\,dx - v\,dy) + i\int_\gamma (v\,dx + u\,dy).$$
Quindi è la somma di due integrali di II specie, quelli dei campi $(u,-v)$ e $(v,u)$. Non è l'integrale di I specie, perché manca il modulo su $\gamma'$.
`}
      </Box>

      <Prose>{String.raw`
Da questa formula tutta la teoria dell'integrazione complessa si traduce in quella delle forme differenziali di Analisi 2:
`}</Prose>

      <Dictionary />

      <Box kind="teorema" title="Primitive">
        {String.raw`
$F$ è una **primitiva** di $f$ su $A$ se $F$ è olomorfa e $F'=f$. Con $f$ continua su $A$ aperto:

1. **Teorema fondamentale**: $\int_\gamma f\,dz = F(\gamma(b))-F(\gamma(a))$, quindi l'integrale è nullo su ogni circuito.
2. $f$ ha primitiva $\iff$ le forme $u\,dx-v\,dy$ e $v\,dx+u\,dy$ sono esatte $\iff$ $\int_\gamma f\,dz=0$ per ogni circuito $\gamma$ in $A$.
3. Se $f$ ha primitiva, allora $f$ è olomorfa. **Il viceversa è falso**, e il controesempio è sempre lo stesso.
`}
      </Box>

      <Prose>{String.raw`
L'esempio fondamentale: per $m\in\Z$ e ogni $R>0$
$$\int_{C_R(0)} z^m\,dz = iR^{m+1}\int_0^{2\pi}e^{i(m+1)t}\,dt = \begin{cases}2\pi i & m=-1\\ 0 & m\neq-1.\end{cases}$$
Il risultato **non dipende da $R$**. $1/z$ è olomorfa su $\C\setminus\{0\}$ ma ha integrale $2\pi i$ su un circuito, quindi non ha primitiva lì. Tutte le altre potenze $z^m$ ce l'hanno.
`}</Prose>

      <PathLab />

      <Box kind="teorema" title="Teoremi di Cauchy">
        {String.raw`
Sia $f$ olomorfa sull'aperto $A$, e siano i circuiti semplici e regolari a tratti.

1. **Integrale nullo.** Se $\gamma$ ha sostegno in $A$ e **interno contenuto in $A$**, allora $\int_\gamma f\,dz = 0$. Di conseguenza, se $A$ è semplicemente connesso $f$ ha primitiva su $A$. Localmente, per esempio su ogni disco, una primitiva esiste sempre.
2. **Circuiti equivalenti.** Se $\gamma_1$ e $\gamma_2$ hanno lo stesso verso, $D_1\subset D_2$ (interni) e la regione tra i due, $D_2\setminus D_1$, sta in $A$, allora $\int_{\gamma_1}f\,dz = \int_{\gamma_2}f\,dz$. Dentro $D_1$ ci possono essere buchi del dominio.
3. **Formula integrale.** Se $\gamma$ è antiorario, con sostegno e interno $D$ in $A$, per ogni $z_0\in D$
$$f(z_0) = \frac{1}{2\pi i}\int_\gamma\frac{f(z)}{z-z_0}\,dz.$$
`}
      </Box>

      <Prose>{String.raw`
**Come si dimostrano.** (1) è Gauss–Green applicato ai campi $(u,-v)$ e $(v,u)$ sull'interno $D$. Gli integrandi $-v_x-u_y$ e $u_x-v_y$ sono nulli per Cauchy–Riemann. Qui serve $f\in C^1$, ed è il motivo per cui la definizione di olomorfa la include. (2) segue da (1) applicato alla regione tra le due curve. Per (3), si sostituisce $\gamma$ con un cerchietto $C_r(z_0)$ (circuiti equivalenti per $f(z)/(z-z_0)$), si separa $f(z_0)\int_{C_r}\frac{dz}{z-z_0} = 2\pi i\,f(z_0)$, e il resto si stima con $2\pi\max_{C_r}|f(z)-f(z_0)|$, che tende a 0 per continuità quando $r\to0$.

Il widget sotto visualizza (1). Invece di $(v,u)$ disegna $(u,-v)$: il lavoro di $(v,u)$ lungo $\gamma$ è il **flusso** di $(u,-v)$ attraverso $\gamma$. Quindi $\int_\gamma f\,dz$ è la circolazione di $(u,-v)$ più $i$ volte il suo flusso, e per le funzioni olomorfe sono entrambi nulli.
`}</Prose>

      <PolyaLab />

      <Box kind="esame">
        {String.raw`
Prima di calcolare, controlla sempre **quali punti "cattivi" stanno dentro** la curva:

- nessuno, e interno nel dominio: l'integrale è 0 (Cauchy);
- uno solo, della forma $\frac{f(z)}{z-z_0}$ con $f$ olomorfa: il risultato è $2\pi i\,f(z_0)$ (formula integrale);
- una curva complicata attorno al punto: si sostituisce con un cerchio $C_r(z_0)$ (circuiti equivalenti).

Esempio: $\int_{C_2(0)}\frac{\cos z}{z-1}\,dz = 2\pi i\cos 1$, mentre $\int_{C_{1/2}(0)}\frac{\cos z}{z-1}\,dz = 0$.
`}
      </Box>
    </>
  )
}
