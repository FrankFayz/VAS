import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, User, Inbox } from 'lucide-react'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/constants'

export default function AdminApprovals() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [rejectReason, setRejectReason] = useState({})
  const [showReject, setShowReject] = useState(null)

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/auth/admin/pending/')
      setUsers(data.results || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const approve = async (userId) => {
    setActing(userId)
    try {
      await api.post(`/auth/admin/users/${userId}/approve/`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (err) {
      alert(err.response?.data?.detail || 'Approval failed')
    } finally {
      setActing(null)
    }
  }

  const reject = async (userId) => {
    setActing(userId)
    try {
      await api.post(`/auth/admin/users/${userId}/reject/`, {
        reason: rejectReason[userId] || '',
      })
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setShowReject(null)
    } catch (err) {
      alert(err.response?.data?.detail || 'Rejection failed')
    } finally {
      setActing(null)
    }
  }

  return (
    <AppLayout
      eyebrow="Access Control"
      title="Supervisor Approvals"
      subtitle="Review and approve new supervisor registration requests"
    >
      {loading ? (
        <div className="card py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
          Loading Requests...
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No Pending Approvals"
          description="New supervisor sign-ups will appear here for review."
        />
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="card">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <div className="icon-box h-12 w-12 shrink-0">
                    <User className="h-6 w-6 text-vas-400" />
                  </div>
                  <div>
                    <h3 className="font-block text-sm font-bold uppercase tracking-[0.08em] text-white">
                      {user.full_name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-3 font-block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                      {user.employee_id && <span>ID: {user.employee_id}</span>}
                      {user.department && <span>Dept: {user.department}</span>}
                      {user.phone && <span>Phone: {user.phone}</span>}
                      <span>Registered: {formatDate(user.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                  <button
                    type="button"
                    disabled={acting === user.id}
                    onClick={() => approve(user.id)}
                    className="btn-success"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReject(showReject === user.id ? null : user.id)}
                    className="btn-danger"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>

              {showReject === user.id && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <input
                    className="input-field"
                    placeholder="Reason for rejection (optional)"
                    value={rejectReason[user.id] || ''}
                    onChange={(e) => setRejectReason({ ...rejectReason, [user.id]: e.target.value })}
                  />
                  <button
                    type="button"
                    disabled={acting === user.id}
                    onClick={() => reject(user.id)}
                    className="btn-danger mt-3"
                  >
                    Confirm Rejection
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
