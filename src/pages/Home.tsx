import { Link } from 'react-router'
import { chapters } from '../topics'

export default function Home() {
  return (
    <div>
      <div className="max-w-3xl">
        <div className="text-[13px] font-semibold uppercase tracking-[0.1em] text-dim">Analisi Matematica 3 · Politecnico di Milano</div>
        <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-fg sm:text-6xl">
          nothing<span className="bg-gradient-to-r from-[#8b6cf6] via-[#e2507a] to-[#d9a95b] bg-clip-text text-transparent">real</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Visualizzazioni interattive per preparare il corso. Non è un libro di testo: ogni pagina richiama gli enunciati in breve e poi ti fa
          toccare con mano cosa dicono, trascinando punti, curve e contorni.
        </p>
      </div>

      {chapters.map((c) => (
        <section key={c.n} className="mt-14">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
            Capitolo {c.n} · {c.title}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {c.topics.map((t, i) => (
              <Link
                key={t.slug}
                to={`/${t.slug}`}
                className="group rounded-2xl border border-line bg-card p-5 transition hover:border-[#3a3944] hover:bg-card-2"
              >
                <div className="font-mono text-[12px] text-dim">
                  {c.n}.{i + 1}
                </div>
                <div className="mt-2 text-[17px] font-semibold leading-snug text-fg">{t.title}</div>
                <div className="mt-2 text-[14px] leading-relaxed text-muted">{t.lead}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
