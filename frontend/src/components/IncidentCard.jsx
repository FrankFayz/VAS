import { Link } from 'react-router-dom'
import { ChevronRight, MapPin } from 'lucide-react'
import { INCIDENT_TYPES, SEVERITY_COLORS, STATUS_COLORS, timeAgo } from '../utils/constants'

export default function IncidentCard({ incident }) {
  return (
    <Link
      to={`/incidents/${incident.id}`}
      className="group flex gap-4 rounded-xl border border-slate-800 bg-[#0d1420] p-4 transition-colors hover:border-slate-700 sm:p-5"
    >
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-[#121a26] sm:h-20 sm:w-28">
        {incident.primary_evidence_url ? (
          <img
            src={incident.primary_evidence_url}
            alt="Evidence"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-block text-[10px] uppercase tracking-[0.1em] text-slate-600">
            No Preview
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge font-block uppercase tracking-[0.08em] ${STATUS_COLORS[incident.status] || 'bg-slate-800 text-slate-300'}`}>
            {incident.status}
          </span>
          <span className={`badge font-block uppercase tracking-[0.08em] ${SEVERITY_COLORS[incident.severity]}`}>
            {incident.severity}
          </span>
          <span className="font-block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            {timeAgo(incident.detected_at)}
          </span>
        </div>

        <h3 className="mt-2 font-block text-sm font-bold uppercase tracking-[0.06em] text-white transition-colors group-hover:text-vas-400">
          {INCIDENT_TYPES[incident.incident_type] || incident.incident_type}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-vas-400" />
            {incident.seat_label}
          </span>
          <span>{incident.hall_name}</span>
          <span className="font-block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            {incident.confidence}% Confidence
          </span>
        </div>
      </div>

      <ChevronRight className="hidden h-5 w-5 shrink-0 self-center text-slate-600 transition-colors group-hover:text-vas-400 sm:block" />
    </Link>
  )
}
