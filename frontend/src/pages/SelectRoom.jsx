import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MapPin, DoorOpen, Camera, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSupervision } from '../context/SupervisionContext'
import { fetchHalls } from '../api/halls'
import Logo from '../components/Logo'
import LoadingScreen from '../components/LoadingScreen'
import EmptyState from '../components/EmptyState'
import api from '../api/client'

function hallPayload(room) {
  return {
    id: room.id,
    name: room.name,
    location: room.location || '',
    capacity: room.capacity ?? 0,
    camera_count: room.camera_count ?? room.cameras?.length ?? 0,
  }
}

export default function SelectRoom() {
  const { user, loading: authLoading, logout } = useAuth()
  const { selectedHall, selectHall } = useSupervision()
  const navigate = useNavigate()
  const location = useLocation()
  /** User explicitly tapped Change Room — never auto-bounce back to a hall */
  const pickRoom = Boolean(location.state?.pickRoom)

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [booting, setBooting] = useState(!pickRoom)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        // Always force-refresh when changing room so we never show a stale empty list
        const { halls: hallList } = await fetchHalls({ force: true })
        if (cancelled) return
        setRooms(hallList)
        setLoading(false)

        // Manual room change: show chooser immediately, no auto-join
        if (pickRoom) {
          setBooting(false)
          return
        }

        // Already supervising — skip chooser
        if (selectedHall && hallList.some((r) => r.id === selectedHall.id)) {
          navigate('/dashboard', { replace: true })
          return
        }

        // First entry only: auto-join when there is exactly one obvious room
        let liveSessions = []
        try {
          const liveRes = await api.get('/exams/sessions/live/')
          liveSessions = liveRes.data.results || liveRes.data || []
        } catch {
          liveSessions = []
        }
        if (cancelled) return

        const liveHallIds = [
          ...new Set(liveSessions.map((s) => s.hall || s.hall_id).filter(Boolean)),
        ]
        if (liveHallIds.length === 1) {
          const room = hallList.find((r) => r.id === liveHallIds[0])
          if (room) {
            selectHall(hallPayload(room))
            navigate('/dashboard', { replace: true })
            return
          }
        }

        if (hallList.length === 1) {
          selectHall(hallPayload(hallList[0]))
          navigate('/dashboard', { replace: true })
          return
        }

        setBooting(false)
      } catch {
        if (!cancelled) {
          setError('Could not load rooms. Ask an admin to add or enable exam rooms.')
          setLoading(false)
          setBooting(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [pickRoom])

  if (authLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.is_admin) return <Navigate to="/admin" replace />
  if (!user.can_access_dashboard) return <Navigate to="/pending" replace />
  if (booting) return <LoadingScreen />

  const handleSelect = (room) => {
    selectHall(hallPayload(room))
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-[var(--vas-bg-raised)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo size="sm" />
          <button
            type="button"
            onClick={logout}
            className="font-block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <p className="type-label">Supervisor Access</p>
        <h1 className="mt-3 font-block text-3xl font-bold uppercase tracking-[-0.02em] text-white sm:text-4xl">
          {pickRoom ? 'Change Room' : 'Choose A Room'}
          <span className="type-hero-accent block">To Supervise</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-500">
          {pickRoom
            ? 'Pick a different exam room. Your previous room has been cleared.'
            : 'Select the exam room you are covering today.'}
        </p>

        {error && <div className="alert-error mt-6">{error}</div>}

        {loading ? (
          <div className="card mt-10 py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
            Loading Rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={DoorOpen}
              title="No Active Rooms"
              description="Ask an administrator to add exam rooms and make sure they are Enabled (not Disabled)."
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => handleSelect(room)}
                className="rounded-xl border border-slate-800 bg-[var(--vas-bg-panel)] p-5 text-left transition-colors hover:border-vas-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-vas-500/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="icon-box h-10 w-10">
                    <DoorOpen className="h-5 w-5 text-vas-400" />
                  </div>
                  <span className="font-block text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">
                    Available
                  </span>
                </div>
                <h2 className="mt-4 font-block text-lg font-bold uppercase tracking-[0.06em] text-white">
                  {room.name}
                </h2>
                {room.location && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {room.location}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-800 pt-3 font-block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Cap {room.capacity}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Camera className="h-3.5 w-3.5" />
                    {room.camera_count ?? 0} Cameras
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
