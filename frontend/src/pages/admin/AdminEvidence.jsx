import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HardDrive, Trash2, Image as ImageIcon } from 'lucide-react'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
import EmptyState from '../../components/EmptyState'
import { formatDate } from '../../utils/constants'

export default function AdminEvidence() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/incidents/evidence/')
      setItems(data.results || data)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load evidence library.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Delete camera evidence from ${item.hall_name} (Incident #${item.incident_id})?`,
      )
    ) {
      return
    }
    setDeletingId(item.id)
    try {
      await api.delete(`/incidents/${item.incident_id}/evidence/${item.id}/`)
      setItems((prev) => prev.filter((e) => e.id !== item.id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete failed.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppLayout
      eyebrow="Evidence Archive"
      title="Camera Evidence"
      subtitle="Frames received from hall cameras stay here until an admin or supervisor deletes them"
    >
      {error && <div className="alert-error mb-6">{error}</div>}

      {loading ? (
        <div className="card py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
          Loading Evidence...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={HardDrive}
          title="No Camera Evidence Yet"
          description="When cameras (or an admin camera test) send a capture, it is stored here for review."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-800 bg-[var(--vas-bg-panel)]"
            >
              <div className="relative aspect-video bg-[var(--vas-bg)]">
                {item.thumbnail_url || item.cloudinary_url ? (
                  <img
                    src={item.thumbnail_url || item.cloudinary_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-600" />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded border border-slate-700 bg-[var(--vas-bg)] px-2 py-0.5 font-block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">
                  {item.media_type}
                </span>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <p className="font-block text-xs font-bold uppercase tracking-[0.08em] text-white">
                    {item.hall_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {item.session_title} · {item.seat_label}
                  </p>
                  <p className="mt-1 font-block text-[10px] uppercase tracking-[0.1em] text-slate-500">
                    {item.camera_name || 'Camera'} · {formatDate(item.captured_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/incidents/${item.incident_id}`}
                    className="btn-secondary flex-1 py-2 text-[10px]"
                  >
                    Open Incident
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item)}
                    className="btn-secondary py-2 text-red-400 hover:border-red-800 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === item.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
