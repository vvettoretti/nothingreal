import { Link, Navigate, useParams } from 'react-router'
import { allTopics } from '../topics'

export default function TopicPage() {
  const { slug } = useParams()
  const idx = allTopics.findIndex((t) => t.slug === slug)
  if (idx < 0) return <Navigate to="/" replace />
  const t = allTopics[idx]
  const prev = allTopics[idx - 1]
  const next = allTopics[idx + 1]
  const { Component } = t

  return (
    <article>
      <div className="text-[13px] font-semibold uppercase tracking-[0.1em] text-dim">
        {t.chapter.n}.{t.index} · {t.chapter.title}
      </div>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-fg sm:text-[44px]">{t.title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">{t.lead}</p>

      <div className="mt-8">
        <Component />
      </div>

      <nav className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
        {prev ? (
          <Link to={`/${prev.slug}`} className="rounded-2xl border border-line bg-card p-5 transition hover:bg-card-2">
            <div className="text-[12px] text-dim">Precedente</div>
            <div className="mt-1 font-semibold text-fg">{prev.title}</div>
          </Link>
        ) : (
          <div />
        )}
        {next && (
          <Link to={`/${next.slug}`} className="rounded-2xl border border-line bg-card p-5 text-right transition hover:bg-card-2">
            <div className="text-[12px] text-dim">Successivo</div>
            <div className="mt-1 font-semibold text-fg">{next.title}</div>
          </Link>
        )}
      </nav>
    </article>
  )
}
