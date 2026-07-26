import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Radio, Users, AlertTriangle, Camera, ArrowLeftRight } from 'lucide-react'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import StatCard from '../components/StatCard'
import IncidentCard from '../components/IncidentCard'
import { useSupervision } from '../context/SupervisionContext'

export default function Dashboard() {
  const { selectedHall, clearHall } = useSupervision()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('NEW')

  useEffect(() => {
    if (!selectedHall) return undefined

    let cancelled = false

    const fetchData = async () => {
      try {
        const hallParams = { hall: selectedHall.id }
        const [statsRes, incidentsRes, sessionsRes] = await Promise.all([
          api.get('/exams/dashboard-stats/', { params: hallParams }),
          api.get('/incidents/', {
            params: {
              hall: selectedHall.id,
              status: filter === 'ALL' ? undefined : filter,
            },
          }),
          api.get('/exams/sessions/live/', { params: hallParams }),
        ])
        if (cancelled) return
        setStats(statsRes.data)
        setIncidents(incidentsRes.data.results || incidentsRes.data)
        setSessions(sessionsRes.data.results || sessionsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setLoading(true)
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [filter, selectedHall])

  if (!selectedHall) {
    return <Navigate to="/select-room" replace />
  }

  const changeRoom = () => {
    clearHall()
    navigate('/select-room')
  }

  const liveSession = sessions[0]

  return (
    <AppLayout
      eyebrow="Supervisor Console"
      title={selectedHall.name}
      subtitle={
        liveSession
          ? `${liveSession.title} · ${liveSession.student_count} students`
          : selectedHall.location || 'Exam room monitoring'
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {liveSession && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-red-800 bg-[#1a1014] px-2.5 py-1 font-block text-[11px] font-bold uppercase tracking-[0.14em] text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Live
            </span>
          )}
          <button type="button" onClick={changeRoom} className="btn-secondary py-2">
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Change Room
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students Monitored" value={stats?.total_students ?? '—'} icon={Users} color="vas" />
        <StatCard label="New Incidents" value={stats?.new_incidents ?? '—'} icon={AlertTriangle} color="red" trend="Needs Review" />
        <StatCard label="Live Sessions" value={stats?.live_sessions ?? '—'} icon={Radio} color="emerald" />
        <StatCard label="Cameras Online" value={stats?.online_cameras ?? '—'} icon={Camera} color="vas" />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="type-label">Incident Feed · {selectedHall.name}</p>
            <h2 className="section-title mt-1">Live Incidents</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['NEW', 'WATCHING', 'ALL'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={filter === f ? 'filter-pill-active' : 'filter-pill-inactive'}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="card py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
            Loading Incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="card py-16 text-center">
            <p className="font-block text-sm font-bold uppercase tracking-[0.1em] text-white">
              Hall Is Clear
            </p>
            <p className="section-desc mt-1">
              No incidents for {selectedHall.name} matching this filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  )
}
