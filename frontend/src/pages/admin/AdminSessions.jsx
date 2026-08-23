import { useEffect, useState } from 'react'
import { Plus, Radio, Calendar } from 'lucide-react'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/constants'

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    subject: '',
    hall: '',
    student_count: 48,
    status: 'LIVE',
    start_time: '',
    end_time: '',
  })

  const fetchData = async () => {
    try {
      const [sessionsRes, hallsRes] = await Promise.all([
        api.get('/exams/sessions/'),
        api.get('/exams/halls/'),
      ])
      setSessions(sessionsRes.data.results || sessionsRes.data)
      setHalls(hallsRes.data.results || hallsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/exams/sessions/', form)
      setShowForm(false)
      setForm({ title: '', subject: '', hall: '', student_count: 48, status: 'LIVE', start_time: '', end_time: '' })
      fetchData()
    } catch (err) {
      alert(JSON.stringify(err.response?.data) || 'Create failed')
    }
  }

  return (
    <AppLayout
      eyebrow="Exam Operations"
      title="Exam Sessions"
      subtitle="Create and manage examination monitoring sessions"
      actions={
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" />
          New Session
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 grid gap-4 sm:grid-cols-2">
          <p className="type-label sm:col-span-2">Create Session</p>
          <input className="input-field" placeholder="Exam title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input-field" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <select className="input-field" value={form.hall} onChange={(e) => setForm({ ...form, hall: e.target.value })} required>
            <option value="">Select hall</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <input type="number" className="input-field" placeholder="Student count" value={form.student_count} onChange={(e) => setForm({ ...form, student_count: e.target.value })} />
          <input type="datetime-local" className="input-field" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
          <input type="datetime-local" className="input-field" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button type="submit" className="btn-primary sm:col-span-2">Create Session</button>
        </form>
      )}

      {loading ? (
        <div className="card py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
          Loading Sessions...
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Exam Sessions"
          description="Create a session after rooms and cameras are set up."
          action={
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              New Session
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-[var(--vas-bg-hover)]">
                  {['Session', 'Hall', 'Students', 'Status', 'Window'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:px-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--vas-bg-panel)]">
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-slate-800 hover:bg-[var(--vas-bg-hover)]">
                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <p className="font-block text-xs font-bold uppercase tracking-[0.06em] text-white">
                        {session.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{session.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300 sm:px-6">{session.hall_name}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-300 sm:px-6">{session.student_count}</td>
                    <td className="px-4 py-3 sm:px-6">
                      {session.status === 'LIVE' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-red-800 bg-[#1a1014] px-2 py-0.5 font-block text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">
                          <Radio className="h-3 w-3" />
                          Live
                        </span>
                      ) : (
                        <span className="badge text-slate-400">{session.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-block text-[10px] uppercase tracking-[0.08em] text-slate-500 sm:px-6">
                      {formatDate(session.start_time)} — {formatDate(session.end_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
