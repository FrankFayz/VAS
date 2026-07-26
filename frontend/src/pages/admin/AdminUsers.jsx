import { useEffect, useState } from 'react'
import { Ban, CheckCircle, Clock, XCircle } from 'lucide-react'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
import { formatDate } from '../../utils/constants'

const STATUS_BADGE = {
  PENDING: 'border-amber-800 bg-[#1a160e] text-amber-400',
  APPROVED: 'border-emerald-800 bg-[#0e1a14] text-emerald-400',
  REJECTED: 'border-red-800 bg-[#1a1014] text-red-400',
  SUSPENDED: 'border-orange-800 bg-[#1a120e] text-orange-400',
}

const STATUS_ICON = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  SUSPENDED: Ban,
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/admin/users/')
      setUsers(data.results || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const suspend = async (userId) => {
    const reason = prompt('Reason for suspension (optional):')
    if (reason === null) return
    try {
      await api.post(`/auth/admin/users/${userId}/suspend/`, { reason })
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Suspend failed')
    }
  }

  return (
    <AppLayout
      eyebrow="User Directory"
      title="User Management"
      subtitle="All registered supervisors and staff"
    >
      {loading ? (
        <div className="card py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
          Loading Users...
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-[#121a26]">
                  {['Name', 'Email', 'Employee ID', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const Icon = STATUS_ICON[user.approval_status] || Clock
                  return (
                    <tr key={user.id} className="border-b border-slate-800 transition-colors hover:bg-[#121a26]">
                      <td className="px-6 py-4 font-block text-xs font-bold uppercase tracking-[0.06em] text-white">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{user.email}</td>
                      <td className="px-6 py-4 text-slate-400">{user.employee_id || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${STATUS_BADGE[user.approval_status]}`}>
                          <Icon className="mr-1 inline h-3 w-3" />
                          {user.approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-block text-[11px] uppercase tracking-[0.08em] text-slate-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {user.approval_status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => suspend(user.id)}
                            className="font-block text-[11px] font-bold uppercase tracking-[0.12em] text-red-400 hover:text-red-300"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
