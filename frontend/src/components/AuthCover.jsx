import { Link } from 'react-router-dom'
import { MonitorPlay, ScanSearch, HardDrive, ShieldCheck } from 'lucide-react'
import { VAS_COVER_HIGHLIGHTS } from '../data/vasFeatures'
import Logo from './Logo'

/** Left panel for login/signup — flat NVR console style */
export default function AuthCover({ variant = 'login' }) {
  const isSignup = variant === 'signup'

  const channels = [
    { id: 'CAM-01', status: 'REC', alert: false },
    { id: 'CAM-02', status: 'REC', alert: true },
    { id: 'CAM-03', status: 'LIVE', alert: false },
    { id: 'CAM-04', status: 'REC', alert: false },
  ]

  return (
    <aside className="hidden w-[44%] flex-col justify-between border-r border-slate-800 bg-[#080c14] p-10 xl:p-12 lg:flex">
      <div>
        <Link to="/" className="inline-flex items-center gap-3">
          <Logo size="sm" />
          <span className="border-l border-slate-700 pl-3 font-block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Network Video Supervision
          </span>
        </Link>

        <p className="type-eyebrow mt-10">
          {isSignup ? 'Supervisor Access' : 'Live Console Access'}
        </p>

        <h2 className="mt-5 font-block text-3xl font-bold uppercase tracking-[-0.02em] text-white xl:text-4xl xl:leading-[1.1]">
          {isSignup ? (
            <>
              Request Access
              <span className="type-hero-accent block">To The Console</span>
            </>
          ) : (
            <>
              Open The Live
              <span className="type-hero-accent block">Monitor Center</span>
            </>
          )}
        </h2>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
          {isSignup
            ? 'Submit your details for administrator approval before you can view live halls and evidence.'
            : 'Sign in to review AI-detected incidents and take action during live examinations.'}
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-700 bg-[#0b1018]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0e1520] px-3 py-2">
            <p className="font-block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              VAS · Live View
            </p>
            <span className="inline-flex items-center gap-1.5 font-block text-[10px] font-semibold uppercase tracking-[0.12em] text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Recording
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-slate-800">
            {channels.map((cam) => (
              <div key={cam.id} className="relative aspect-[16/10] bg-[#121a26]">
                <div className="absolute left-1.5 top-1.5 flex items-center gap-1">
                  <span className="rounded border border-slate-700 bg-[#0b1018] px-1 py-0.5 font-block text-[9px] font-bold tracking-[0.1em] text-slate-300">
                    {cam.id}
                  </span>
                  {cam.alert && (
                    <span className="rounded bg-red-700 px-1 py-0.5 font-block text-[9px] font-bold tracking-[0.1em] text-white">
                      ALERT
                    </span>
                  )}
                </div>
                <span className="absolute bottom-1.5 right-1.5 font-block text-[9px] font-bold tracking-[0.12em] text-red-400">
                  {cam.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {VAS_COVER_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3.5">
              <div className="icon-box h-9 w-9 shrink-0">
                <Icon className="h-4 w-4 text-vas-400" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-block text-xs font-bold uppercase tracking-[0.1em] text-white">
                  {title}
                </p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-800 pt-6">
        {[
          { icon: MonitorPlay, label: 'Live View' },
          { icon: ScanSearch, label: 'AI Events' },
          { icon: HardDrive, label: 'Evidence' },
          { icon: ShieldCheck, label: 'Controlled' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-vas-400" strokeWidth={1.75} />
            <span className="font-block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {label}
            </span>
          </div>
        ))}
      </div>
    </aside>
  )
}
