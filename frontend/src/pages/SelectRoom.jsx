import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { MapPin, DoorOpen, Camera, Users } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useSupervision } from '../context/SupervisionContext'
import Logo from '../components/Logo'
import LoadingScreen from '../components/LoadingScreen'

export default function SelectRoom() {
  const { user, loading: authLoading, logout } = useAuth()
  const { selectHall } = useSupervision()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/exams/halls/')
        setRooms(data.results || data)
      } catch {
        setError('Could not load rooms. Ask an admin to add exam rooms.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (authLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.is_admin) return <Navigate to="/admin" replace />
  if (!user.can_access_dashboard) return <Navigate to="/pending" replace />

  // Change Room clears selection first, then this page shows the chooser.
  const handleSelect = (room) => {
    selectHall(room)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#080c14]">
      <header className="border-b border-slate-800 bg-[#0a0f18]">
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
          Choose A Room
          <span className="type-hero-accent block">To Supervise</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-500">
          Select the exam room you are assigned to today. Rooms are managed by your administrator.
        </p>

        {error && <div className="alert-error mt-6">{error}</div>}

        {loading ? (
          <div className="card mt-10 py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
            Loading Rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="card mt-10 py-16 text-center">
            <DoorOpen className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-4 font-block text-sm font-bold uppercase tracking-[0.1em] text-white">
              No Rooms Available
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ask an administrator to add exam rooms for your organisation.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => handleSelect(room)}
                className="rounded-xl border border-slate-800 bg-[#0d1420] p-5 text-left transition-colors hover:border-vas-500"
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
