import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, Users, AlertTriangle, Database, ChevronRight } from 'lucide-react'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
import StatCard from '../../components/StatCard'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/auth/admin/stats/'),
          api.get('/auth/admin/pending/'),
        ])
        setStats(statsRes.data)
        setPending((pendingRes.data.results || pendingRes.data).slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const seedDemo = async () => {
    try {
      const { data } = await api.post('/incidents/seed-demo/')
      alert(data.message)
    } catch (err) {
      alert(err.response?.data?.detail || 'Seed failed')
    }
  }

  return (
    <AppLayout
      eyebrow="Admin Console"
      title="System Overview"
      subtitle="Manage supervisors, exam sessions, and system health"
      actions={
        <button type="button" onClick={seedDemo} className="btn-secondary">
          <Database className="h-4 w-4" />
          Load Demo Data
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Approvals"
          value={stats?.pending_approvals ?? '—'}
          icon={UserCheck}
          color="amber"
          trend="Requires Action"
        />
        <StatCard label="Approved Supervisors" value={stats?.approved_supervisors ?? '—'} icon={Users} color="emerald" />
        <StatCard label="Total Users" value={stats?.total_users ?? '—'} icon={Users} color="vas" />
        <StatCard label="System" value="Online" icon={AlertTriangle} color="vas" trend="All Services Operational" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="type-label">Access Control</p>
              <h2 className="section-title mt-1">Pending Requests</h2>
            </div>
            <Link to="/admin/approvals" className="link-accent">
              View All
            </Link>
          </div>

          {loading ? (
            <p className="mt-6 font-block text-xs uppercase tracking-[0.12em] text-slate-500">Loading...</p>
          ) : pending.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No pending requests. All caught up!</p>
          ) : (
            <div className="mt-5 space-y-3">
              {pending.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#121a26] p-4"
                >
                  <div className="min-w-0">
                    <p className="font-block text-xs font-bold uppercase tracking-[0.08em] text-white">
                      {user.full_name}
                    </p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                    {user.employee_id && (
                      <p className="mt-0.5 font-block text-[10px] uppercase tracking-[0.1em] text-slate-500">
                        ID: {user.employee_id}
                      </p>
                    )}
                  </div>
                  <Link to="/admin/approvals" className="btn-primary shrink-0 py-2 text-[10px]">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <p className="type-label">Operations</p>
          <h2 className="section-title mt-1">Quick Actions</h2>
          <div className="mt-5 space-y-2">
            {[
              { to: '/admin/approvals', label: 'Review Supervisor Approvals', icon: UserCheck },
              { to: '/admin/sessions', label: 'Manage Exam Sessions', icon: AlertTriangle },
              { to: '/admin/users', label: 'View All Users', icon: Users },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#121a26] px-4 py-3 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="icon-box h-8 w-8">
                    <Icon className="h-4 w-4 text-vas-400" />
                  </div>
                  <span className="font-block text-xs font-semibold uppercase tracking-[0.1em] text-slate-200">
                    {label}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
