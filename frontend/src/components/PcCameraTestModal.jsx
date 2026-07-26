import { useEffect, useRef, useState } from 'react'
import { Camera, X, Send } from 'lucide-react'
import api from '../api/client'

/**
 * Opens this PC's webcam in the browser, captures a frame,
 * and posts it through the real incident/evidence pipeline.
 */
export default function PcCameraTestModal({ camera, onClose, onSuccess }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setReady(true)
      } catch (err) {
        setError(
          err?.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access in the browser.'
            : 'Could not open this PC camera. Check that a webcam is connected.',
        )
      }
    }

    start()

    return () => {
      active = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const captureAndSend = async () => {
    if (!videoRef.current || !ready) return
    setSending(true)
    setError('')
    setResult(null)
    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
      if (!blob) throw new Error('Could not capture frame')

      const form = new FormData()
      form.append('camera', String(camera.id))
      form.append('file', blob, `${camera.identifier || 'pc-cam'}-test.jpg`)

      const { data } = await api.post('/incidents/camera-pc-test/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      onSuccess?.(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || err.message || 'Test upload failed.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-[#0d1420]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div>
            <p className="type-label">PC Camera Test</p>
            <h3 className="mt-1 font-block text-base font-bold uppercase tracking-[0.06em] text-white">
              {camera.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {camera.identifier}
              {camera.ip_address ? ` · IP ${camera.ip_address}` : ''}
            </p>
          </div>
          <button type="button" className="btn-secondary py-2" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-slate-500">
            Open this page on the PC whose webcam you want to test. Capture sends a real
            evidence frame into that room so a supervisor can confirm the pipeline works.
          </p>

          <div className="overflow-hidden rounded-xl border border-slate-800 bg-black">
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />
          </div>

          {error && <div className="alert-error">{error}</div>}

          {result && (
            <div className="rounded-lg border border-emerald-800 bg-[#0e1a14] px-4 py-3 text-sm text-emerald-300">
              {result.message} Incident #{result.incident_id} created for {result.hall_name}.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!ready || sending}
              onClick={captureAndSend}
              className="btn-primary"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending Evidence...' : 'Capture & Send Test Alert'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Done
            </button>
          </div>

          <p className="flex items-center gap-2 text-xs text-slate-600">
            <Camera className="h-3.5 w-3.5" />
            Uses this browser PC webcam now. Your AI agent will use the saved IP/RTSP later.
          </p>
        </div>
      </div>
    </div>
  )
}
