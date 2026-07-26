import { Clock, XCircle, Ban } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import LoadingScreen from '../components/LoadingScreen'

export default function Pending() {
  const { user, loading, logout } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  const status = user?.approval_status

  const content = {
    PENDING: {
      icon: Clock,
      color: 'text-amber-400',
      bg: 'border-amber-800 bg-[#1a160e]',
      title: 'Awaiting Admin Approval',
      message: 'Your account is pending review. An administrator will approve your access shortly.',
    },
    REJECTED: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'border-red-800 bg-[#1a1014]',
      title: 'Registration Rejected',
      message: user?.rejection_reason || 'Your registration was not approved. Contact the examinations office.',
    },
    SUSPENDED: {
      icon: Ban,
      color: 'text-orange-400',
      bg: 'border-orange-800 bg-[#1a120e]',
      title: 'Account Suspended',
      message: user?.rejection_reason || 'Your account has been suspended. Contact the administrator.',
    },
  }

  const c = content[status] || content.PENDING
  const Icon = c.icon

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c14] px-5 py-10">
      <div className="w-full max-w-md text-center">
        <Logo size="hero" layout="vertical" />

        <p className="type-eyebrow mt-8">Account Status</p>

        <div className={`mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-xl border ${c.bg}`}>
          <Icon className={`h-7 w-7 ${c.color}`} />
        </div>

        <h2 className="mt-6 font-block text-2xl font-bold uppercase tracking-[-0.02em] text-white">
          {c.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{c.message}</p>

        {user && (
          <div className="card mt-6 text-left text-sm">
            <p className="font-block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Registered As
            </p>
            <p className="mt-1 font-block text-sm font-bold uppercase tracking-[0.06em] text-white">
              {user.full_name}
            </p>
            <p className="text-slate-500">{user.email}</p>
            {user.employee_id && (
              <p className="mt-1 font-block text-[11px] uppercase tracking-[0.1em] text-slate-600">
                ID: {user.employee_id}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={logout} className="btn-secondary">
            Sign Out
          </button>
          {status === 'PENDING' && (
            <button type="button" onClick={() => window.location.reload()} className="btn-primary">
              Check Status
            </button>
          )}
          {status === 'REJECTED' && (
            <Link to="/signup" className="btn-primary">
              Register Again
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
