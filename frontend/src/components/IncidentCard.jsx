import { MapPin } from 'lucide-react'
import { INCIDENT_TYPES, SEVERITY_COLORS, STATUS_COLORS, timeAgo } from '../utils/constants'

/** Dense queue row — built for hundreds/thousands of alerts */
export default function IncidentCard({ incident, selected = false, onSelect }) {
  const Comp = onSelect ? 'button' : 'div'
  const props = onSelect
    ? { type: 'button', onClick: () => onSelect(incident) }
    : {}

  return (
    <Comp
      {...props}
      className={`${selected ? 'queue-row-active' : 'queue-row'} w-full`}
    >
      <div className="h-10 w-14 shrink-0 overflow-hidden rounded border border-slate-700 bg-[var(--vas-bg)]">
        {incident.primary_evidence_url ? (
          <img
            src={incident.primary_evidence_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-block text-[8px] uppercase tracking-[0.08em] text-slate-600">
            —
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate font-block text-xs font-bold uppercase tracking-[0.04em] text-white">
            {INCIDENT_TYPES[incident.incident_type] || incident.incident_type}
          </h3>
          <span className="shrink-0 font-block text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            {timeAgo(incident.detected_at)}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className={`badge ${STATUS_COLORS[incident.status] || ''}`}>
            {incident.status}
          </span>
          <span className={`badge ${SEVERITY_COLORS[incident.severity]}`}>
            {incident.severity}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
            <MapPin className="h-3 w-3 text-vas-400" />
            {incident.seat_label}
          </span>
          <span className="font-block text-[10px] font-semibold tabular-nums text-slate-500">
            {incident.confidence}%
          </span>
        </div>
      </div>
    </Comp>
  )
}
