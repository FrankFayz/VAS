import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  UserCheck,
  Calendar,
  LogOut,
  X,
} from 'lucide-react'
import VasCameraIcon from './VasCameraIcon'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ open = false, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdmin = user?.is_admin

  const supervisorLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/approvals', icon: UserCheck, label: 'Approvals' },
    { to: '/admin/sessions', icon: Calendar, label: 'Exam Sessions' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ]

  const links = isAdmin ? adminLinks : supervisorLinks

  const handleNav = () => onClose?.()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-[#0a0f18] transition-transform duration-200 lg:w-64 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <VasCameraIcon className="h-10 w-14 shrink-0" />
          <div>
            <p className="font-block text-sm font-bold uppercase tracking-[0.08em] text-white">VAS</p>
            <p className="font-block text-[10px] font-semibold uppercase tracking-[0.16em] text-vas-400">
              {isAdmin ? 'Admin Console' : 'Live Monitor'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-[#0d1420] hover:text-white lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="mb-2 px-3 font-block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Navigation
        </p>
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              onClick={handleNav}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-block text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                active
                  ? 'border border-slate-600 bg-[#121a26] text-vas-400'
                  : 'border border-transparent text-slate-400 hover:bg-[#0d1420] hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {!isAdmin && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-[#0d1420] p-3.5">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-block text-[10px] font-bold uppercase tracking-[0.14em]">
                Live Monitoring
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              AI-detected incidents appear here for your review.
            </p>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="mb-2 rounded-xl border border-slate-800 bg-[#0d1420] px-3 py-2.5">
          <p className="truncate font-block text-xs font-bold uppercase tracking-[0.08em] text-white">
            {user?.full_name}
          </p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 font-block text-xs font-semibold uppercase tracking-[0.1em] text-slate-400 transition-colors hover:bg-[#1a1014] hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
