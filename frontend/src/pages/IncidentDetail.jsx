import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, Camera } from 'lucide-react'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import IncidentActions from '../components/IncidentActions'
import { INCIDENT_TYPES, SEVERITY_COLORS, STATUS_COLORS, formatDate } from '../utils/constants'

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [actingStatus, setActingStatus] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [activeEvidenceId, setActiveEvidenceId] = useState(null)

  const fetchIncident = async () => {
    try {
      const { data } = await api.get(`/incidents/${id}/`)
      setIncident(data)
      setNotes(data.supervisor_notes || '')
      setActiveEvidenceId((prev) => {
        const items = data.evidence_items || []
        if (prev && items.some((e) => e.id === prev)) return prev
        return items[0]?.id ?? null
      })
    } catch {
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncident()
  }, [id])

  const handleAction = async (status) => {
    if (actingStatus) return
    setActingStatus(status)
    setActionError('')
    try {
      const { data } = await api.post(`/incidents/${id}/action/`, {
        status,
        supervisor_notes: notes,
      })
      // Stay on this page — update in place, no navigation / remount
      setIncident(data.incident)
    } catch (err) {
      setActionError(
        err.response?.data?.detail ||
          err.response?.data?.status?.[0] ||
          'Could not save decision. Is the API running?',
      )
    } finally {
      setActingStatus(null)
    }
  }

  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('Delete this camera evidence? This cannot be undone.')) return
    setDeletingId(evidenceId)
    try {
      await api.delete(`/incidents/${id}/evidence/${evidenceId}/`)
      await fetchIncident()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not delete evidence.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <AppLayout eyebrow="Evidence Review" title="Loading...">
        <div className="card py-20 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
          Loading Incident...
        </div>
      </AppLayout>
    )
  }

  if (!incident) return null

  const evidenceItems = incident.evidence_items || []
  const primaryEvidence =
    evidenceItems.find((e) => e.id === activeEvidenceId) || evidenceItems[0] || null

  return (
    <AppLayout
      eyebrow="Evidence Review"
      title={`Incident #${incident.id}`}
      subtitle={INCIDENT_TYPES[incident.incident_type]}
      actions={
        <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Queue
        </button>
      }
    >
      <div className="grid gap-5 pb-36 lg:grid-cols-5 lg:pb-0">
        <div className="lg:col-span-3">
          <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-slate-800 bg-[var(--vas-bg-panel)] lg:mx-0 lg:max-w-none">
            {primaryEvidence ? (
              primaryEvidence.media_type === 'VIDEO' ? (
                <video
                  src={primaryEvidence.cloudinary_url}
                  controls
                  className="aspect-video max-h-[42vh] w-full bg-black object-contain"
                  poster={primaryEvidence.thumbnail_url}
                />
              ) : (
                <img
                  src={primaryEvidence.cloudinary_url}
                  alt="Camera evidence"
                  className="aspect-video max-h-[42vh] w-full object-contain"
                />
              )
            ) : (
              <div className="flex aspect-video max-h-[42vh] flex-col items-center justify-center gap-2 bg-[var(--vas-bg-hover)] px-6 text-center">
                <Camera className="h-7 w-7 text-slate-600" />
                <p className="font-block text-xs uppercase tracking-[0.14em] text-slate-500">
                  Waiting for camera evidence
                </p>
              </div>
            )}
          </div>

          {evidenceItems.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="font-block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Captures · {evidenceItems.length}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {evidenceItems.map((ev) => (
                  <div key={ev.id} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveEvidenceId(ev.id)}
                      className={`block overflow-hidden rounded border ${
                        activeEvidenceId === ev.id
                          ? 'border-vas-500'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <img
                        src={ev.thumbnail_url || ev.cloudinary_url}
                        alt=""
                        loading="lazy"
                        className="h-12 w-16 object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      title="Delete evidence"
                      disabled={deletingId === ev.id}
                      onClick={() => handleDeleteEvidence(ev.id)}
                      className="absolute -right-1 -top-1 rounded border border-red-800 bg-[#1a1014] p-0.5 text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
              {primaryEvidence && (
                <button
                  type="button"
                  disabled={deletingId === primaryEvidence.id}
                  onClick={() => handleDeleteEvidence(primaryEvidence.id)}
                  className="btn-secondary py-2 text-red-400 hover:border-red-800 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingId === primaryEvidence.id ? 'Deleting…' : 'Delete frame'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <div className="flex flex-wrap gap-2">
              <span className={`badge ${STATUS_COLORS[incident.status]}`}>{incident.status}</span>
              <span className={`badge ${SEVERITY_COLORS[incident.severity]}`}>{incident.severity}</span>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              {[
                ['Seat', incident.seat_label],
                ['Hall', incident.hall_name],
                ['Session', incident.session_title],
                ['Camera', incident.camera_name || '—'],
                ['Confidence', `${incident.confidence}%`],
                ['Detected', formatDate(incident.detected_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-slate-800 pb-2">
                  <dt className="font-block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {label}
                  </dt>
                  <dd className="font-medium text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>

            {incident.description && (
              <p className="mt-4 text-sm leading-relaxed text-slate-400">{incident.description}</p>
            )}
          </div>

          {incident.timeline?.length > 0 && (
            <div className="card">
              <h3 className="font-block text-xs font-bold uppercase tracking-[0.14em] text-white">
                Timeline
              </h3>
              <ul className="mt-4 space-y-3">
                {incident.timeline.map((t) => (
                  <li key={t.id} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-block text-[10px] uppercase tracking-[0.08em] text-slate-500">
                      {formatDate(t.timestamp)}
                    </span>
                    <span className="text-slate-300">{t.event}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card hidden lg:block">
            <h3 className="font-block text-xs font-bold uppercase tracking-[0.14em] text-white">
              Supervisor Decision
            </h3>
            {actionError && <div className="alert-error mt-3 py-2 text-xs">{actionError}</div>}
            <div className="mt-4">
              <IncidentActions
                status={incident.status}
                actingStatus={actingStatus}
                onAction={handleAction}
                notesValue={notes}
                onNotesChange={setNotes}
                showNotes
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-[var(--vas-bg-raised)] p-3 lg:hidden">
        {actionError && <div className="alert-error mb-2 py-2 text-xs">{actionError}</div>}
        <IncidentActions
          status={incident.status}
          actingStatus={actingStatus}
          onAction={handleAction}
          notesValue={notes}
          onNotesChange={setNotes}
          showNotes
          compact
        />
      </div>
    </AppLayout>
  )
}
