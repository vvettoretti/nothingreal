import type { ReactNode } from 'react'
import { Text } from './Math'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-card ${className}`}>{children}</div>
}

/** Pannello con etichetta maiuscola grigia (PIANO Z, PIANO W = F(Z), ...). */
export function Panel({ label, children, right }: { label: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <Card className="flex flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</div>
        {right}
      </div>
      {children}
    </Card>
  )
}

/** Contenitore standard di una visualizzazione: titolo, descrizione, contenuto. */
export function Widget({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold tracking-tight text-fg">{title}</h2>
      {description && (
        <div className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted">
          <Text>{description}</Text>
        </div>
      )}
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function Select<T extends string>({ value, onChange, options, className = '' }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  return (
    <div className={`relative w-full self-start ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none rounded-xl border border-line bg-card px-4 py-3 pr-10 text-[15px] font-medium text-fg outline-none transition hover:border-[#3a3944] focus:border-violet/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-card p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${value === o.value ? 'bg-card-2 text-fg shadow-[inset_0_0_0_1px_#3a3944]' : 'text-muted hover:text-fg'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({ label, value, min, max, step = 0.01, onChange, display }: { label: ReactNode; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; display?: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-fg">{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="range" />
    </label>
  )
}

export function Button({ children, onClick, active }: { children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${active ? 'border-violet/50 bg-violet/10 text-fg' : 'border-line bg-card text-muted hover:border-[#3a3944] hover:text-fg'}`}
    >
      {children}
    </button>
  )
}

export function Stats({ items }: { items: { label: ReactNode; value: ReactNode; tone?: 'good' | 'bad' | 'accent' }[] }) {
  const tone = { good: 'text-green', bad: 'text-red', accent: 'text-violet' }
  return (
    <Card className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-6 gap-y-5 px-6 py-5">
      {items.map((it, i) => (
        <div key={i} className="min-w-0">
          <div className="text-[13px] text-muted">{it.label}</div>
          <div className={`mt-1 truncate font-mono text-[17px] font-semibold ${it.tone ? tone[it.tone] : 'text-fg'}`}>{it.value}</div>
        </div>
      ))}
    </Card>
  )
}

export function Explain({ children }: { children: string }) {
  return (
    <Card className="flex items-center bg-card-2 px-5 py-4 text-[15px] leading-relaxed text-fg">
      <div>
        <Text>{children}</Text>
      </div>
    </Card>
  )
}

export function Hint({ children }: { children: string }) {
  return (
    <p className="px-1 text-[14px] leading-relaxed text-muted">
      <Text>{children}</Text>
    </p>
  )
}

export function FnInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error: string | null }) {
  return (
    <div>
      <div className={`flex items-center gap-2 rounded-xl border bg-card px-4 py-3 font-mono text-[15px] ${error ? 'border-red/60' : 'border-line focus-within:border-violet/60'}`}>
        <span className="text-muted">f(z) =</span>
        <input value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="min-w-0 flex-1 bg-transparent text-fg outline-none" />
      </div>
      {error && <div className="mt-1.5 px-1 text-[12px] text-red">{error}</div>}
    </div>
  )
}

export function TwoPanels({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}
