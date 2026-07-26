import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AppLayout({ children, title, subtitle, eyebrow, actions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#080c14]">
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
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0a0f18]">
          <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <button
                type="button"
                className="mt-0.5 rounded-lg border border-slate-700 bg-[#0d1420] p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                {eyebrow && <p className="type-label mb-1.5">{eyebrow}</p>}
                <h1 className="truncate font-block text-lg font-bold uppercase tracking-[-0.02em] text-white sm:text-xl lg:text-2xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 truncate text-sm text-slate-500">{subtitle}</p>
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
