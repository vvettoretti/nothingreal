import katex from 'katex'
import { Fragment, useMemo, type ReactNode } from 'react'

const MACROS = {
  '\\C': '\\mathbb{C}',
  '\\R': '\\mathbb{R}',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Res': '\\operatorname{Res}',
  '\\Ind': '\\operatorname{Ind}',
  '\\Log': '\\operatorname{Log}',
  '\\Arg': '\\operatorname{Arg}',
  '\\Re': '\\operatorname{Re}',
  '\\Im': '\\operatorname{Im}',
}

function render(tex: string, display: boolean) {
  return katex.renderToString(tex, { displayMode: display, throwOnError: false, macros: { ...MACROS } })
}

export function M({ children }: { children: string }) {
  const html = useMemo(() => render(children, false), [children])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function MB({ children }: { children: string }) {
  const html = useMemo(() => render(children, true), [children])
  return <div className="my-4 overflow-x-auto overflow-y-hidden" dangerouslySetInnerHTML={{ __html: html }} />
}

/** Testo inline con $…$, **grassetto** e *corsivo*. */
export function Text({ children }: { children: string }) {
  const parts = children.split(/(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('$') && p.endsWith('$') && p.length > 1) return <M key={i}>{p.slice(1, -1)}</M>
        if (p.startsWith('**')) return <strong key={i} className="font-semibold text-fg"><Text>{p.slice(2, -2)}</Text></strong>
        if (p.startsWith('*') && p.length > 2) return <em key={i}><Text>{p.slice(1, -1)}</Text></em>
        return <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}

/**
 * Mini-markdown per i contenuti: paragrafi separati da righe vuote, $$…$$ in display,
 * elenchi con "- " o "1. ", titoletti con "### ".
 */
export function Prose({ children }: { children: string }) {
  const blocks = children
    .replace(/^\n+|\s+$/g, '')
    .split(/\n\s*\n/)
    .map((b) => b.replace(/^[ \t]+/gm, ''))
  return (
    <div className="prose-nr">
      {blocks.map((b, i) => {
        if (b.startsWith('$$')) return <MB key={i}>{b.replace(/^\$\$|\$\$$/g, '')}</MB>
        if (b.startsWith('### ')) return <h3 key={i}><Text>{b.slice(4)}</Text></h3>
        const lines = b.split('\n')
        if (lines.every((l) => /^(- |\d+\. )/.test(l))) {
          const ordered = /^\d+\. /.test(lines[0])
          const items = lines.map((l) => <li key={l}><Text>{l.replace(/^(- |\d+\. )/, '')}</Text></li>)
          return ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>
        }
        // $$ in mezzo al paragrafo
        const segs = b.split(/(\$\$[\s\S]+?\$\$)/g)
        return (
          <Fragment key={i}>
            {segs.map((s, j) =>
              s.startsWith('$$') ? <MB key={j}>{s.slice(2, -2)}</MB> : s.trim() ? <p key={j}><Text>{s.replace(/\n/g, ' ').trim()}</Text></p> : null,
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

const KIND = {
  teorema: { label: 'Teorema', color: 'border-violet', tag: 'text-violet' },
  definizione: { label: 'Definizione', color: 'border-gold', tag: 'text-gold' },
  richiamo: { label: 'Richiamo', color: 'border-[#4a4955]', tag: 'text-muted' },
  osservazione: { label: 'Osservazione', color: 'border-pink', tag: 'text-pink' },
  esame: { label: 'All’esame', color: 'border-green', tag: 'text-green' },
}

export function Box({ kind, title, children }: { kind: keyof typeof KIND; title?: string; children: string | ReactNode }) {
  const k = KIND[kind]
  return (
    <div className={`my-6 rounded-r-xl border-l-2 ${k.color} bg-card/70 px-5 py-4`}>
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.08em]">
        <span className={k.tag}>{k.label}</span>
        {title && <span className="text-muted"> · {title}</span>}
      </div>
      {typeof children === 'string' ? <Prose>{children}</Prose> : children}
    </div>
  )
}
