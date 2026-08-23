import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import LoadingScreen from '../components/LoadingScreen'

function HeroConsole() {
  return (
    <div className="relative h-full overflow-hidden border-l border-slate-800 bg-[var(--vas-bg)]">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            linear-gradient(rgba(28, 39, 51, 0.65) 1px, transparent 1px),
            linear-gradient(90deg, rgba(28, 39, 51, 0.65) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--vas-bg)] via-transparent to-[rgba(7,11,16,0.4)]" />

      <div className="relative flex h-full min-h-[420px] flex-col justify-between p-8 xl:p-10">
        <div className="flex items-center justify-between gap-3">
          <span className="font-block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Hall B · Live Session
          </span>
          <span className="inline-flex items-center gap-1.5 font-block text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">
            <span className="live-dot" />
            Recording
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-6xl font-bold uppercase tracking-[-0.03em] text-white xl:text-7xl">
            VAS
          </p>
          <p className="mt-3 font-block text-xs font-semibold uppercase tracking-[0.18em] text-vas-400">
            Virtual Assistant Supervisor
          </p>
        </div>

        <div className="rounded-lg border border-red-900/60 bg-[#1a1014]/90 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-block text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">
                New Alert
              </p>
              <p className="mt-1 font-block text-sm font-bold uppercase tracking-[0.06em] text-white">
                Possible Copying · Row 4 Seat 12
              </p>
              <p className="mt-1 text-xs text-slate-400">Evidence ready · Awaiting supervisor</p>
            </div>
            <span className="shrink-0 rounded border border-amber-800 bg-[#1a160e] px-2 py-0.5 font-block text-[10px] font-bold uppercase tracking-[0.1em] text-amber-400">
              High
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <header className="relative z-40 border-b border-slate-800 bg-[var(--vas-bg-raised)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md px-3 py-2 font-block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary py-2">
              Get Access
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 border-b border-slate-800">
          <div className="mx-auto grid w-full max-w-7xl flex-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
              <p className="font-display text-5xl font-bold uppercase tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                VAS
              </p>
              <p className="mt-2 font-block text-xs font-semibold uppercase tracking-[0.2em] text-vas-400 sm:text-sm">
                Virtual Assistant Supervisor
              </p>

              <h1 className="mt-6 max-w-md font-display text-xl font-bold uppercase tracking-[-0.02em] text-white sm:mt-8 sm:text-2xl lg:text-3xl">
                Exam integrity,
                <span className="type-hero-accent"> under human control</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
                Cameras watch the hall. AI flags suspicious behaviour. Supervisors review
                evidence and decide.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <Link to="/signup" className="btn-primary px-7 py-3">
                  Request Access
                </Link>
                <Link to="/login" className="btn-secondary px-7 py-3">
                  Open Console
                </Link>
              </div>
            </div>

            {/* Visual only on large screens — keeps mobile to one clean composition */}
            <div className="hidden lg:block">
              <HeroConsole />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <span className="font-block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Virtual Assistant Supervisor
          </span>
          <p className="font-block text-[11px] uppercase tracking-[0.14em] text-slate-600">© 2026 VAS</p>
        </div>
      </footer>
    </div>
  )
}
