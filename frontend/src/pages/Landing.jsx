import { Link, Navigate } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  HardDrive,
  ShieldCheck,
  Bell,
  MonitorPlay,
  ScanSearch,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import LoadingScreen from '../components/LoadingScreen'
import { VAS_FEATURES, VAS_STEPS, VAS_USERS } from '../data/vasFeatures'

/** NVR-style multi-channel live view console — flat, no glow */
function NvrLiveConsole() {
  const channels = [
    { id: 'CAM-01', label: 'Hall B · Front', status: 'REC', alert: false },
    { id: 'CAM-02', label: 'Hall B · Rear L', status: 'REC', alert: true },
    { id: 'CAM-03', label: 'Hall B · Rear R', status: 'REC', alert: false },
    { id: 'CAM-04', label: 'Hall B · Side', status: 'REC', alert: false },
    { id: 'CAM-05', label: 'Entrance', status: 'LIVE', alert: false },
    { id: 'CAM-06', label: 'Aisle Center', status: 'REC', alert: true },
  ]

  return (
    <div className="relative animate-fade-up-late">
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#0b1018]">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0e1520] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            </div>
            <p className="font-block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              VAS Monitor Center · Live View
            </p>
          </div>
          <div className="flex items-center gap-3 font-block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>6 Channels</span>
            <span className="inline-flex items-center gap-1.5 text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Recording
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-3">
          {channels.map((cam) => (
            <div
              key={cam.id}
              className="relative aspect-[4/3] overflow-hidden bg-[#121a26]"
            >
              <div className="absolute left-2 top-2 flex items-center gap-1.5">
                <span className="rounded border border-slate-700 bg-[#0b1018] px-1.5 py-0.5 font-block text-[10px] font-bold tracking-[0.12em] text-slate-300">
                  {cam.id}
                </span>
                {cam.alert && (
                  <span className="rounded bg-red-700 px-1.5 py-0.5 font-block text-[10px] font-bold tracking-[0.14em] text-white">
                    ALERT
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                <span className="truncate font-block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {cam.label}
                </span>
                <span className="font-block text-[10px] font-bold tracking-[0.14em] text-red-400">
                  {cam.status}
                </span>
              </div>

              {cam.alert && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 border border-red-700" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0e1520] px-4 py-2.5 font-block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
          <span>Exam Session · Hall B · Mathematics Final</span>
          <span className="text-amber-400">2 Active Alerts · Supervisor Review</span>
        </div>
      </div>
    </div>
  )
}

const NVR_CAPABILITIES = [
  { icon: MonitorPlay, title: 'Live View', text: 'Multi-channel camera monitoring in real time' },
  { icon: ScanSearch, title: 'AI Analytics', text: 'Detects copying, phone use and suspicious movement' },
  { icon: HardDrive, title: 'Evidence Archive', text: 'Stores image and video clips for review' },
  { icon: Bell, title: 'Instant Alerts', text: 'Pushes incidents to approved supervisors' },
  { icon: Camera, title: 'Camera Management', text: 'Link halls, cameras and live exam sessions' },
  { icon: ShieldCheck, title: 'Access Control', text: 'Admin-approved supervisor accounts only' },
]

export default function Landing() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080c14] text-slate-100">
      <header className="relative z-40 border-b border-slate-800 bg-[#0a0f18]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden border-l border-slate-700 pl-3 font-block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:inline">
              Network Video Supervision
            </span>
          </Link>

          <nav className="hidden items-center gap-7 font-block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 md:flex">
            <a href="#live-view" className="transition-colors hover:text-white">Live View</a>
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">Workflow</a>
            <a href="#who" className="transition-colors hover:text-white">Users</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-md px-3 py-2 font-block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors hover:text-white"
            >
              Open Console
            </Link>
            <Link to="/signup" className="btn-primary py-2">
              Get Access
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section id="live-view" className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="mx-auto max-w-4xl text-center animate-fade-up">
              <p className="type-eyebrow">Intelligent Video Management</p>

              <h1 className="type-hero mt-6">
                Network Video
                <span className="block">Recorder Software</span>
                <span className="type-hero-accent mt-2 block">For Exam Hall Cameras</span>
              </h1>

              <p className="type-body mx-auto mt-6 max-w-2xl">
                Monitor live camera feeds, detect malpractice with AI, archive evidence,
                and alert approved supervisors — all from one secure console.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/signup" className="btn-primary px-7 py-3">
                  Request Supervisor Access
                </Link>
                <Link to="/login" className="btn-secondary px-7 py-3">
                  Open Live Console
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-5xl">
              <NvrLiveConsole />
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 border-t border-slate-800 pt-8 sm:grid-cols-4">
              {[
                { value: 'Live View', label: 'Multi-channel monitoring' },
                { value: 'AI Events', label: 'Malpractice detection' },
                { value: 'Evidence', label: 'Cloud photo & video' },
                { value: 'Controlled', label: 'Admin-approved access' },
              ].map((item) => (
                <div key={item.label} className="text-center sm:text-left">
                  <p className="font-block text-sm font-bold uppercase tracking-[0.12em] text-vas-400">
                    {item.value}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="type-label">Core Capabilities</p>
              <h2 className="type-section mt-3">
                Everything An NVR Needs
                <span className="type-hero-accent block">Built For Exams</span>
              </h2>
              <p className="type-muted mt-4">
                Live view, analytics, alerts, evidence storage and access control in one platform.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {NVR_CAPABILITIES.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-800 bg-[#0d1420] p-5 transition-colors hover:border-slate-700"
                >
                  <div className="icon-box h-10 w-10">
                    <Icon className="h-5 w-5 text-vas-400" strokeWidth={1.75} />
                  </div>
                  <h3 className="type-card-title mt-4">{title}</h3>
                  <p className="type-muted mt-2">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 grid gap-x-10 gap-y-10 border-t border-slate-800 pt-14 sm:grid-cols-2 lg:grid-cols-3">
              {VAS_FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-vas-400" strokeWidth={1.75} />
                    <h3 className="font-block text-sm font-bold uppercase tracking-[0.08em] text-white">
                      {title}
                    </h3>
                  </div>
                  <p className="type-muted mt-2">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-b border-slate-800 bg-[#0a101a]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="type-label">Operations Workflow</p>
              <h2 className="type-section mt-3">
                From Camera Feed
                <span className="type-hero-accent block">To Supervisor Action</span>
              </h2>
            </div>

            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VAS_STEPS.map(({ step, title, description }) => (
                <li key={step} className="rounded-xl border border-slate-800 bg-[#0d1420] p-5">
                  <span className="font-block text-xs font-bold tracking-[0.2em] text-vas-400">
                    STEP {step}
                  </span>
                  <h3 className="mt-3 font-block text-xl font-bold uppercase tracking-[0.06em] text-white">
                    {title}
                  </h3>
                  <p className="type-muted mt-2">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="who" className="border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="type-label">Operator Roles</p>
              <h2 className="type-section mt-3">
                Who Operates
                <span className="type-hero-accent block">The Console</span>
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {VAS_USERS.map(({ icon: Icon, role, description }) => (
                <div key={role} className="rounded-xl border border-slate-800 bg-[#0d1420] p-6">
                  <Icon className="h-5 w-5 text-vas-400" strokeWidth={1.75} />
                  <h3 className="mt-4 font-block text-lg font-bold uppercase tracking-[0.08em] text-white">
                    {role}
                  </h3>
                  <p className="type-muted mt-2">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div>
              <h2 className="font-block text-2xl font-bold uppercase tracking-[-0.02em] text-white sm:text-3xl">
                Deploy VAS For Your
                <span className="type-hero-accent"> Next Examination</span>
              </h2>
              <p className="type-muted mt-3 max-w-lg">
                Open the live console or request supervisor access for your institution.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="btn-secondary px-6 py-3">
                Open Console
              </Link>
              <Link to="/signup" className="btn-primary inline-flex gap-2 px-6 py-3">
                Get Access
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-[#080c14]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden font-block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:inline">
              Virtual Assistant Supervisor
            </span>
          </div>
          <div className="flex flex-wrap gap-6 font-block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            <a href="#live-view" className="hover:text-white">Live View</a>
            <a href="#features" className="hover:text-white">Features</a>
            <Link to="/login" className="hover:text-white">Console</Link>
            <Link to="/signup" className="hover:text-white">Access</Link>
          </div>
          <p className="font-block text-[11px] uppercase tracking-[0.14em] text-slate-600">© 2026 VAS</p>
        </div>
      </footer>
    </div>
  )
}
