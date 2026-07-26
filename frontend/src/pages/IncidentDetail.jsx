import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Upload } from 'lucide-react'
import api from '../api/client'
import AppLayout from '../components/AppLayout'
import { INCIDENT_TYPES, SEVERITY_COLORS, STATUS_COLORS, formatDate } from '../utils/constants'

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchIncident = async () => {
    try {
      const { data } = await api.get(`/incidents/${id}/`)
      setIncident(data)
      setNotes(data.supervisor_notes || '')
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
    setActing(true)
    try {
      const { data } = await api.post(`/incidents/${id}/action/`, {
        status,
        supervisor_notes: notes,
      })
      setIncident(data.incident)
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed')
    } finally {
      setActing(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('media_type', file.type.startsWith('video') ? 'VIDEO' : 'IMAGE')
    try {
      await api.post(`/incidents/${id}/evidence/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchIncident()
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
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

  const primaryEvidence = incident.evidence_items?.[0]

  return (
    <AppLayout
      eyebrow="Evidence Review"
      title={`Incident #${incident.id}`}
      subtitle={INCIDENT_TYPES[incident.incident_type]}
      actions={
        <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1420]">
            {primaryEvidence ? (
              primaryEvidence.media_type === 'VIDEO' ? (
                <video
                  src={primaryEvidence.cloudinary_url}
                  controls
                  className="aspect-video w-full bg-black"
                  poster={primaryEvidence.thumbnail_url}
                />
              ) : (
                <img
                  src={primaryEvidence.cloudinary_url}
                  alt="Evidence"
                  className="aspect-video w-full object-cover"
                />
              )
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[#121a26] font-block text-xs uppercase tracking-[0.14em] text-slate-500">
                No Evidence Uploaded Yet
              </div>
            )}
          </div>

          {incident.evidence_items?.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {incident.evidence_items.map((ev) => (
                <img
                  key={ev.id}
                  src={ev.thumbnail_url || ev.cloudinary_url}
                  alt=""
                  className="h-16 w-24 shrink-0 rounded-lg border border-slate-700 object-cover"
                />
              ))}
            </div>
          )}

          <label className="btn-secondary mt-4 cursor-pointer">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Evidence'}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          </label>
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

          <div className="card">
            <h3 className="font-block text-xs font-bold uppercase tracking-[0.14em] text-white">
              Supervisor Action
            </h3>
            <textarea
              className="input-field mt-3 min-h-[80px] resize-none"
              placeholder="Add notes about your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="mt-4 grid gap-2">
              <button type="button" disabled={acting} onClick={() => handleAction('CONFIRMED')} className="btn-danger w-full">
                <CheckCircle className="h-4 w-4" />
                Confirm Malpractice
              </button>
              <button type="button" disabled={acting} onClick={() => handleAction('WARNING')} className="btn-secondary w-full">
                <AlertTriangle className="h-4 w-4" />
                Issue Warning
              </button>
              <button type="button" disabled={acting} onClick={() => handleAction('WATCHING')} className="btn-secondary w-full">
                Watch & Monitor
              </button>
              <button type="button" disabled={acting} onClick={() => handleAction('DISMISSED')} className="btn-success w-full">
                <XCircle className="h-4 w-4" />
                False Alarm — Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
