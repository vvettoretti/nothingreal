import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router'
import { chapters } from './topics'
import Home from './pages/Home'
import TopicPage from './pages/TopicPage'

function Brand() {
  return (
    <Link to="/" className="group block">
      <div className="text-[21px] font-extrabold tracking-tight text-fg">
        nothing<span className="bg-gradient-to-r from-[#8b6cf6] via-[#e2507a] to-[#d9a95b] bg-clip-text text-transparent">real</span>
      </div>
      <div className="mt-0.5 text-[12px] text-dim">Analisi Matematica 3 · Polimi</div>
    </Link>
  )
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-8">
      <Brand />
      {chapters.map((c) => (
        <div key={c.n}>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-dim">
            Capitolo {c.n} · {c.title}
          </div>
          <ul className="flex flex-col gap-0.5">
            {c.topics.map((t, i) => (
              <li key={t.slug}>
                <NavLink
                  to={`/${t.slug}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex gap-3 rounded-lg px-3 py-2 text-[14px] leading-snug transition ${isActive ? 'bg-card-2 text-fg' : 'text-muted hover:bg-card hover:text-fg'}`
                  }
                >
                  <span className="w-4 shrink-0 font-mono text-[12px] leading-[20px] text-dim">{i + 1}</span>
                  <span>{t.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-line bg-bg px-5 py-7 lg:block">
        <Sidebar />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button onClick={() => setOpen(true)} className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-muted">
          Argomenti
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto border-r border-line bg-bg px-5 py-7">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="lg:pl-72">
        <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-8 lg:py-14">
          <Suspense fallback={<div className="py-20 text-center text-muted">Caricamento…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/:slug" element={<TopicPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
