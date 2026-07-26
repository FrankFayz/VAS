import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function AuthBrandHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#0a0f18]">
      <div className="flex h-14 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-3 focus:outline-none"
        >
          <Logo size="sm" />
          <span className="hidden border-l border-slate-700 pl-3 font-block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:inline">
            Network Video Supervision
          </span>
        </Link>
        <Link
          to="/"
          className="font-block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:text-white"
        >
          Back Home
        </Link>
      </div>
    </header>
  )
}
