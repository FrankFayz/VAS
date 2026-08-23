import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AppLayout({ children, title, subtitle, eyebrow, actions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--vas-bg)]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-[var(--vas-bg-raised)]">
          <div className="flex min-h-[4.25rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:min-h-[4.75rem] lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                className="shrink-0 rounded-lg border border-slate-700 bg-[var(--vas-bg-panel)] p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                {eyebrow && <p className="type-label mb-0.5">{eyebrow}</p>}
                <h1 className="truncate font-block text-base font-bold uppercase tracking-[-0.02em] text-white sm:text-lg lg:text-xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
            )}
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
