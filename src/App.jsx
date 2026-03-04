import { useMemo } from 'react'
import { hasSupabaseEnv } from './lib/supabase'

const highlights = [
  'React + Vite frontend scaffold ready',
  'Tailwind design system configured',
  'Supabase client + booking service helpers added',
  'Sample schema for slots and bookings included'
]

function App() {
  const supabaseStatus = useMemo(
    () => (hasSupabaseEnv ? 'Connected config found' : 'Missing .env values'),
    []
  )

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-2xl border border-brand-100 bg-white/90 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-600">Kaveri Project</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Clinic Website Boilerplate</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            This starter is ready for building your booking-driven clinic website with React, Tailwind, and
            Supabase.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">React 19</span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">Tailwind CSS</span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">Supabase</span>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <article key={item} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-brand-700">Ready</p>
              <h2 className="mt-1 text-base font-medium text-slate-900">{item}</h2>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">Supabase Status</h3>
          <p className="mt-2 text-slate-600">{supabaseStatus}</p>
          {!hasSupabaseEnv && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
