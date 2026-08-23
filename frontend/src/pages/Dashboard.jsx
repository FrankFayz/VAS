import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Radio,
  AlertTriangle,
  ArrowLeftRight,
  Maximize2,
  ChevronDown,
} from 'lucide-react'
import api from '../api/client'
import { fetchHalls } from '../api/halls'
import AppLayout from '../components/AppLayout'
import EmptyState from '../components/EmptyState'
import IncidentCard from '../components/IncidentCard'
import IncidentActions, { actionResolves } from '../components/IncidentActions'
import { useSupervision } from '../context/SupervisionContext'
import {
  INCIDENT_TYPES,
  SEVERITY_COLORS,
  STATUS_COLORS,
  formatDate,
} from '../utils/constants'

function StatStrip({ stats, loading }) {
  const items = [
    { label: 'Students', value: stats?.total_students },
    { label: 'New', value: stats?.new_incidents, accent: true },
    { label: 'Live', value: stats?.live_sessions },
    { label: 'Cams', value: stats?.online_cameras },
  ]

  return (
    <div className="stat-strip">
      {items.map((item) => (
        <div key={item.label} className="stat-strip-item !min-w-0 !px-3 !py-2">
          <p className="font-block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
            {item.label}
          </p>
          <p
            className={`mt-0.5 font-block text-lg font-bold tabular-nums tracking-tight ${
              item.accent && Number(item.value) > 0 ? 'text-red-400' : 'text-white'
            }`}
          >
            {loading ? '—' : (item.value ?? '—')}
          </p>
        </div>
      ))}
    </div>
  )
}

function QueuePreview({
  incident,
  notes,
  onNotesChange,
  actingStatus,
  onAction,
  actionError,
  actionMessage,
}) {
  if (!incident) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="font-block text-xs uppercase tracking-[0.12em] text-slate-500">
          Select an alert from the queue
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Compact evidence — not full-bleed hero */}
      <div className="flex gap-3">
        <div className="h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-[var(--vas-bg)] sm:h-32 sm:w-48">
          {incident.primary_evidence_url ? (
            <img
              src={incident.primary_evidence_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-block text-[9px] uppercase tracking-[0.1em] text-slate-600">
              No frame
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            <span className={`badge ${STATUS_COLORS[incident.status]}`}>{incident.status}</span>
            <span className={`badge ${SEVERITY_COLORS[incident.severity]}`}>{incident.severity}</span>
          </div>
          <h3 className="mt-2 font-block text-sm font-bold uppercase tracking-[0.04em] text-white">
            {INCIDENT_TYPES[incident.incident_type] || incident.incident_type}
          </h3>
          <dl className="mt-2 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Seat</dt>
              <dd className="text-slate-200">{incident.seat_label}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Confidence</dt>
              <dd className="tabular-nums text-slate-200">{incident.confidence}%</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Detected</dt>
              <dd className="text-right text-slate-200">{formatDate(incident.detected_at)}</dd>
            </div>
          </dl>
          <Link
            to={`/incidents/${incident.id}`}
            className="mt-2 inline-flex items-center gap-1 font-block text-[10px] font-bold uppercase tracking-[0.12em] text-vas-400 hover:text-vas-300"
          >
            <Maximize2 className="h-3 w-3" />
            Full review
          </Link>
        </div>
      </div>

      {incident.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{incident.description}</p>
      )}

      <div className="mt-auto border-t border-slate-800 pt-3">
        {actionError && <div className="alert-error mb-2 py-2 text-xs">{actionError}</div>}
        {actionMessage && <p className="mb-2 text-xs text-emerald-400">{actionMessage}</p>}
        <IncidentActions
          status={incident.status}
          actingStatus={actingStatus}
          onAction={onAction}
          notesValue={notes}
          onNotesChange={onNotesChange}
          showNotes
          compact
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { selectedHall, clearHall } = useSupervision()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [sessions, setSessions] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [filter, setFilter] = useState('NEW')
  /** Held separately so resolving an alert does not jump/replace the preview */
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [actingStatus, setActingStatus] = useState(null)
  const actingStatusRef = useRef(null)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    actingStatusRef.current = actingStatus
  }, [actingStatus])

  const selectIncident = useCallback((incident) => {
    setSelected(incident)
    setActionError('')
    setActionMessage('')
  }, [])

  useEffect(() => {
    setNotes(selected?.supervisor_notes || '')
  }, [selected?.id])

  const fetchPage = useCallback(
    async (pageNum, { append = false } = {}) => {
      if (!selectedHall) return
      const hallParams = { hall: selectedHall.id }
      const incidentsRes = await api.get('/incidents/', {
        params: {
          hall: selectedHall.id,
          status: filter === 'ALL' ? undefined : filter,
          page: pageNum,
        },
      })

      const payload = incidentsRes.data
      const list = payload.results || payload

      setTotalCount(payload.count ?? list.length)
      setHasMore(Boolean(payload.next))
      setPage(pageNum)

      if (append) {
        setIncidents((prev) => [...prev, ...list])
      } else {
        setIncidents(list)
        setSelected((prev) => {
          if (!prev) return list[0] ?? null
          const fresh = list.find((i) => i.id === prev.id)
          // Keep current preview if it left the filter (e.g. just resolved)
          return fresh ?? prev
        })
      }

      // Refresh stats/sessions lightly on first page only
      if (!append) {
        const [statsRes, sessionsRes] = await Promise.all([
          api.get('/exams/dashboard-stats/', { params: hallParams }),
          api.get('/exams/sessions/live/', { params: hallParams }),
        ])
        setStats(statsRes.data)
        setSessions(sessionsRes.data.results || sessionsRes.data)
      }
    },
    [filter, selectedHall],
  )

  const reloadFirstPage = useCallback(async () => {
    await fetchPage(1, { append: false })
  }, [fetchPage])

  useEffect(() => {
    if (!selectedHall) return undefined

    let cancelled = false
    let intervalId

    const load = async () => {
      try {
        await reloadFirstPage()
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    }

    load()
    fetchHalls().catch(() => {})

    intervalId = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      // Don't yank the queue while a decision is saving
      if (actingStatusRef.current) return
      reloadFirstPage().catch(() => {})
    }, 30000)

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !actingStatusRef.current) {
        reloadFirstPage().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reloadFirstPage, selectedHall])

  if (!selectedHall) {
    return <Navigate to="/select-room" replace />
  }

  const changeRoom = () => {
    clearHall()
    navigate('/select-room', { state: { pickRoom: true } })
  }

  const liveSession = sessions[0]

  const loadMore = async () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      await fetchPage(page + 1, { append: true })
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleAction = async (status) => {
    if (!selected || actingStatus) return
    setActingStatus(status)
    setActionError('')
    setActionMessage('')
    try {
      const { data } = await api.post(`/incidents/${selected.id}/action/`, {
        status,
        supervisor_notes: notes,
      })
      const updated = data.incident
      setActionMessage(data.message || 'Decision saved.')
      // Keep the same preview — no navigation, no jump to next alert
      setSelected(updated)

      const leavesFilter =
        (actionResolves(status) && filter !== 'ALL') ||
        (status === 'WATCHING' && filter === 'NEW')

      if (leavesFilter) {
        setIncidents((prev) => prev.filter((i) => i.id !== selected.id))
        setTotalCount((c) => Math.max(0, c - 1))
        if (selected.status === 'NEW' || filter === 'NEW') {
          setStats((s) =>
            s
              ? {
                  ...s,
                  new_incidents: Math.max(
                    0,
                    (s.new_incidents || 0) - (selected.status === 'NEW' ? 1 : 0),
                  ),
                }
              : s,
          )
        }
      } else {
        setIncidents((prev) =>
          prev.map((i) => (i.id === selected.id ? { ...i, ...updated } : i)),
        )
      }
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          err.response?.data?.status?.[0] ||
          'Could not save decision. Check that the API is running.',
      )
    } finally {
      setActingStatus(null)
    }
  }

  const setFilterSafe = (f) => {
    if (f === filter) return
    setFilter(f)
    setInitialLoading(true)
    setIncidents([])
    setSelected(null)
    setActionError('')
    setActionMessage('')
  }

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
              <span className="live-dot" />
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
      <StatStrip stats={stats} loading={initialLoading && !stats} />

      <section className="mt-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="section-title">Queue</h2>
            <span className="font-block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {totalCount || incidents.length} alerts
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['NEW', 'WATCHING', 'ALL'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterSafe(f)}
                className={filter === f ? 'filter-pill-active' : 'filter-pill-inactive'}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {initialLoading && incidents.length === 0 && !selected ? (
          <div className="card py-12 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
            Loading Queue...
          </div>
        ) : incidents.length === 0 && !selected ? (
          <EmptyState
            icon={liveSession ? Radio : AlertTriangle}
            title={liveSession ? 'Hall Is Clear' : 'No Live Session'}
            description={
              liveSession
                ? `No ${filter === 'ALL' ? '' : filter.toLowerCase() + ' '}incidents for ${selectedHall.name}.`
                : 'Ask an admin to start an exam session for this room.'
            }
          />
        ) : (
          <>
            {/* Mobile: full-page scroll, dense list — no nested scroll trap */}
            <div className="space-y-0 overflow-hidden rounded-xl border border-slate-800 bg-[var(--vas-bg-panel)] lg:hidden">
              {incidents.length === 0 ? (
                <p className="px-4 py-8 text-center font-block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                  No more alerts in this filter
                </p>
              ) : (
                incidents.map((inc) => (
                  <Link key={inc.id} to={`/incidents/${inc.id}`} className="block">
                    <IncidentCard incident={inc} />
                  </Link>
                ))
              )}
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex w-full items-center justify-center gap-1 border-t border-slate-800 py-3 font-block text-[11px] font-bold uppercase tracking-[0.12em] text-vas-400 hover:bg-[var(--vas-bg-hover)] disabled:opacity-50"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
            </div>

            {/* Desktop: list + compact review — list scrolls, page stays calm */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-800 lg:grid lg:h-[min(68vh,640px)] lg:grid-cols-5">
              <div className="flex min-h-0 flex-col border-r border-slate-800 bg-[var(--vas-bg-panel)] lg:col-span-2">
                <div className="shrink-0 border-b border-slate-800 px-3 py-2 font-block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Showing {incidents.length}
                  {totalCount > incidents.length ? ` of ${totalCount}` : ''}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  {incidents.length === 0 ? (
                    <p className="px-4 py-8 text-center font-block text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      No more alerts in this filter
                    </p>
                  ) : (
                    incidents.map((inc) => (
                      <IncidentCard
                        key={inc.id}
                        incident={inc}
                        selected={inc.id === selected?.id}
                        onSelect={selectIncident}
                      />
                    ))
                  )}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex w-full items-center justify-center gap-1 py-3 font-block text-[11px] font-bold uppercase tracking-[0.12em] text-vas-400 hover:bg-[var(--vas-bg-hover)] disabled:opacity-50"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      {loadingMore ? 'Loading…' : 'Load more'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col overflow-y-auto overscroll-contain bg-[var(--vas-bg-raised)] p-4 lg:col-span-3">
                <QueuePreview
                  incident={selected}
                  notes={notes}
                  onNotesChange={setNotes}
                  actingStatus={actingStatus}
                  onAction={handleAction}
                  actionError={actionError}
                  actionMessage={actionMessage}
                />
              </div>
            </div>
          </>
        )}
      </section>
    </AppLayout>
  )
}
