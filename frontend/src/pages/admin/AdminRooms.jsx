import { useEffect, useState } from 'react'
import {
  Plus,
  MapPin,
  Users,
  Camera,
  Pencil,
  Power,
  Trash2,
  X,
  MonitorPlay,
} from 'lucide-react'
import api from '../../api/client'
import AppLayout from '../../components/AppLayout'
import PcCameraTestModal from '../../components/PcCameraTestModal'

const emptyRoom = { name: '', location: '', capacity: 50 }
const emptyCamera = {
  name: '',
  identifier: '',
  position: '',
  ip_address: '',
  stream_port: 554,
  rtsp_url: '',
}

function errorText(err, fallback) {
  const data = err.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
    .join(' · ')
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [roomForm, setRoomForm] = useState(emptyRoom)
  const [roomError, setRoomError] = useState('')
  const [savingRoom, setSavingRoom] = useState(false)

  const [manageRoom, setManageRoom] = useState(null)
  const [cameraForm, setCameraForm] = useState(emptyCamera)
  const [editingCameraId, setEditingCameraId] = useState(null)
  const [cameraError, setCameraError] = useState('')
  const [savingCamera, setSavingCamera] = useState(false)
  const [testCamera, setTestCamera] = useState(null)

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/exams/halls/', { params: { include_inactive: '1' } })
      const list = data.results || data
      setRooms(list)
      if (manageRoom) {
        const updated = list.find((r) => r.id === manageRoom.id)
        setManageRoom(updated || null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const openCreateRoom = () => {
    setEditingRoomId(null)
    setRoomForm(emptyRoom)
    setRoomError('')
    setShowRoomForm(true)
  }

  const openEditRoom = (room) => {
    setEditingRoomId(room.id)
    setRoomForm({
      name: room.name,
      location: room.location || '',
      capacity: room.capacity || 50,
    })
    setRoomError('')
    setShowRoomForm(true)
  }

  const handleSaveRoom = async (e) => {
    e.preventDefault()
    setSavingRoom(true)
    setRoomError('')
    try {
      const payload = {
        name: roomForm.name.trim(),
        location: roomForm.location.trim(),
        capacity: Number(roomForm.capacity) || 0,
      }
      if (editingRoomId) {
        await api.patch(`/exams/halls/${editingRoomId}/`, payload)
      } else {
        await api.post('/exams/halls/', payload)
      }
      setShowRoomForm(false)
      setEditingRoomId(null)
      setRoomForm(emptyRoom)
      await fetchRooms()
    } catch (err) {
      setRoomError(errorText(err, 'Could not save room.'))
    } finally {
      setSavingRoom(false)
    }
  }

  const toggleRoomActive = async (room) => {
    try {
      if (room.is_active) {
        await api.delete(`/exams/halls/${room.id}/`)
      } else {
        await api.patch(`/exams/halls/${room.id}/`, { is_active: true })
      }
      await fetchRooms()
    } catch (err) {
      alert(errorText(err, 'Update failed'))
    }
  }

  const openManageCameras = (room) => {
    setManageRoom(room)
    setCameraForm(emptyCamera)
    setEditingCameraId(null)
    setCameraError('')
  }

  const startEditCamera = (cam) => {
    setEditingCameraId(cam.id)
    setCameraForm({
      name: cam.name || '',
      identifier: cam.identifier || '',
      position: cam.position || '',
      ip_address: cam.ip_address || '',
      stream_port: cam.stream_port || 554,
      rtsp_url: cam.rtsp_url || '',
    })
    setCameraError('')
  }

  const cancelCameraForm = () => {
    setEditingCameraId(null)
    setCameraForm(emptyCamera)
    setCameraError('')
  }

  const handleSaveCamera = async (e) => {
    e.preventDefault()
    if (!manageRoom) return
    setSavingCamera(true)
    setCameraError('')
    try {
      const ip = cameraForm.ip_address.trim()
      const port = Number(cameraForm.stream_port) || 554
      let rtsp = cameraForm.rtsp_url.trim()
      if (!rtsp && ip) {
        rtsp = `rtsp://${ip}:${port}/stream1`
      }

      const payload = {
        hall: manageRoom.id,
        name: cameraForm.name.trim(),
        identifier: cameraForm.identifier.trim(),
        position: cameraForm.position.trim(),
        ip_address: ip || null,
        stream_port: port,
        rtsp_url: rtsp,
      }
      if (editingCameraId) {
        await api.patch(`/exams/cameras/${editingCameraId}/`, payload)
      } else {
        await api.post('/exams/cameras/', payload)
      }
      cancelCameraForm()
      await fetchRooms()
    } catch (err) {
      setCameraError(errorText(err, 'Could not save camera.'))
    } finally {
      setSavingCamera(false)
    }
  }

  const removeCamera = async (cam) => {
    if (!window.confirm(`Remove camera "${cam.name}" (${cam.identifier}) from this room?`)) {
      return
    }
    try {
      await api.delete(`/exams/cameras/${cam.id}/`)
      if (editingCameraId === cam.id) cancelCameraForm()
      await fetchRooms()
    } catch (err) {
      alert(errorText(err, 'Could not remove camera.'))
    }
  }

  return (
    <AppLayout
      eyebrow="Organisation Setup"
      title="Exam Rooms"
      subtitle="Add rooms, assign cameras by IP, and test this PC webcam"
      actions={
        <button type="button" onClick={openCreateRoom} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Room
        </button>
      }
    >
      {showRoomForm && (
        <form onSubmit={handleSaveRoom} className="card mb-6 grid gap-4 sm:grid-cols-2">
          <p className="type-label sm:col-span-2">
            {editingRoomId ? 'Edit Room' : 'New Room'}
          </p>
          {roomError && <div className="alert-error sm:col-span-2">{roomError}</div>}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
              Room Name
            </label>
            <input
              className="input-field"
              placeholder="e.g. Room A"
              value={roomForm.name}
              onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
              Location
            </label>
            <input
              className="input-field"
              placeholder="Main Building, Floor 1"
              value={roomForm.location}
              onChange={(e) => setRoomForm({ ...roomForm, location: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
              Capacity
            </label>
            <input
              type="number"
              min="1"
              className="input-field"
              value={roomForm.capacity}
              onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={savingRoom} className="btn-primary">
              {savingRoom ? 'Saving...' : editingRoomId ? 'Update Room' : 'Create Room'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowRoomForm(false)
                setEditingRoomId(null)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {manageRoom && (
        <div className="card mb-6">
          <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="type-label">Camera Assignment</p>
              <h2 className="section-title mt-1">{manageRoom.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the PC or IP-camera LAN address. Use Test PC Camera on this machine to verify the pipeline.
              </p>
            </div>
            <button type="button" className="btn-secondary py-2" onClick={() => setManageRoom(null)}>
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <form onSubmit={handleSaveCamera} className="mt-5 grid gap-4 sm:grid-cols-2">
            <p className="type-label sm:col-span-2">
              {editingCameraId ? 'Edit Camera' : 'Add Camera'}
            </p>
            {cameraError && <div className="alert-error sm:col-span-2">{cameraError}</div>}

            <div>
              <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                Camera Name
              </label>
              <input
                className="input-field"
                placeholder="PC Webcam / Front Camera"
                value={cameraForm.name}
                onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                Camera ID
              </label>
              <input
                className="input-field"
                placeholder="CAM-A-01"
                value={cameraForm.identifier}
                onChange={(e) => setCameraForm({ ...cameraForm, identifier: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                PC / Camera IP Address
              </label>
              <input
                className="input-field"
                placeholder="192.168.1.45"
                value={cameraForm.ip_address}
                onChange={(e) => setCameraForm({ ...cameraForm, ip_address: e.target.value })}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Your PC LAN IP (run <span className="text-slate-400">ipconfig</span> on Windows).
              </p>
            </div>
            <div>
              <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                Stream Port
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="554"
                value={cameraForm.stream_port}
                onChange={(e) => setCameraForm({ ...cameraForm, stream_port: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                Position
              </label>
              <input
                className="input-field"
                placeholder="Desk PC / Front center"
                value={cameraForm.position}
                onChange={(e) => setCameraForm({ ...cameraForm, position: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                RTSP URL <span className="text-slate-500">(optional)</span>
              </label>
              <input
                className="input-field"
                placeholder="Auto-filled from IP if left blank"
                value={cameraForm.rtsp_url}
                onChange={(e) => setCameraForm({ ...cameraForm, rtsp_url: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" disabled={savingCamera} className="btn-primary">
                {savingCamera
                  ? 'Saving...'
                  : editingCameraId
                    ? 'Update Camera'
                    : 'Add Camera To Room'}
              </button>
              {editingCameraId && (
                <button type="button" className="btn-secondary" onClick={cancelCameraForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <p className="type-label">Cameras In {manageRoom.name}</p>
            {(manageRoom.cameras || []).length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No cameras assigned yet. Add your PC IP camera entry, then run Test PC Camera.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {manageRoom.cameras.map((cam) => (
                  <div
                    key={cam.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#121a26] p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-block text-xs font-bold uppercase tracking-[0.08em] text-white">
                          {cam.name}
                        </p>
                        <span className="font-block text-[10px] font-bold uppercase tracking-[0.12em] text-vas-400">
                          {cam.identifier}
                        </span>
                        <span
                          className={`font-block text-[10px] font-bold uppercase tracking-[0.12em] ${
                            cam.is_online ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {cam.is_online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                        {cam.position && <p>{cam.position}</p>}
                        {cam.ip_address && (
                          <p className="font-mono text-xs text-slate-400">
                            IP {cam.ip_address}
                            {cam.stream_port ? `:${cam.stream_port}` : ''}
                          </p>
                        )}
                        {cam.rtsp_url && (
                          <p className="truncate font-mono text-xs text-slate-600">{cam.rtsp_url}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-primary py-2"
                        onClick={() => setTestCamera(cam)}
                      >
                        <MonitorPlay className="h-3.5 w-3.5" />
                        Test PC Camera
                      </button>
                      <button
                        type="button"
                        className="btn-secondary py-2"
                        onClick={() => startEditCamera(cam)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger py-2"
                        onClick={() => removeCamera(cam)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="card py-16 text-center font-block text-xs uppercase tracking-[0.14em] text-slate-500">
          Loading Rooms...
        </div>
      ) : rooms.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="font-block text-sm font-bold uppercase tracking-[0.1em] text-white">
            No Rooms Yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Add a room, assign your PC IP camera, then test a capture.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-block text-base font-bold uppercase tracking-[0.08em] text-white">
                  {room.name}
                </h3>
                <span
                  className={`font-block text-[10px] font-bold uppercase tracking-[0.12em] ${
                    room.is_active ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {room.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {room.location && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {room.location}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3 font-block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Cap {room.capacity}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" />
                  {room.camera_count ?? room.cameras?.length ?? 0} Cameras
                </span>
              </div>

              {(room.cameras || []).length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-slate-800 pt-3">
                  {room.cameras.slice(0, 3).map((cam) => (
                    <li
                      key={cam.id}
                      className="flex items-center justify-between gap-2 text-xs text-slate-400"
                    >
                      <span className="truncate">{cam.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {cam.ip_address || cam.identifier}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                <button type="button" onClick={() => openManageCameras(room)} className="btn-primary py-2">
                  <Camera className="h-3.5 w-3.5" />
                  Cameras
                </button>
                <button type="button" onClick={() => openEditRoom(room)} className="btn-secondary py-2">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button type="button" onClick={() => toggleRoomActive(room)} className="btn-secondary py-2">
                  <Power className="h-3.5 w-3.5" />
                  {room.is_active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {testCamera && (
        <PcCameraTestModal
          camera={testCamera}
          onClose={() => setTestCamera(null)}
          onSuccess={() => fetchRooms()}
        />
      )}
    </AppLayout>
  )
}
