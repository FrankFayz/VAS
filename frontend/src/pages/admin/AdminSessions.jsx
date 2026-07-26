import { useEffect, useState } from 'react'
import { Plus, Radio } from 'lucide-react'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
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
        <div className="card py-16 text-center text-slate-500">
          No exam sessions yet. Create one after rooms and cameras are set up.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-block text-sm font-bold uppercase tracking-[0.08em] text-white">
                    {session.title}
                  </h3>
                  {session.status === 'LIVE' && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-red-800 bg-[#1a1014] px-2 py-0.5 font-block text-[10px] font-bold uppercase tracking-[0.14em] text-red-400">
                      <Radio className="h-3 w-3" />
                      Live
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-slate-400">
                  {session.subject} · {session.hall_name} · {session.student_count} students
                </p>
                <p className="mt-1 font-block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {formatDate(session.start_time)} — {formatDate(session.end_time)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-block text-xs font-bold uppercase tracking-[0.1em] text-vas-400">
                  {session.incident_count} Incidents
                </p>
                <p className="mt-1 font-block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {session.online_cameras} Cameras Online
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
