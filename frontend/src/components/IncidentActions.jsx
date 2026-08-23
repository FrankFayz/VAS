import { CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react'

const ACTIONS = [
  {
    status: 'CONFIRMED',
    label: 'Confirm',
    className: 'btn-danger',
    icon: CheckCircle,
    resolves: true,
  },
  {
    status: 'WARNING',
    label: 'Warn',
    className: 'btn-warn',
    icon: AlertTriangle,
    resolves: true,
  },
  {
    status: 'WATCHING',
    label: 'Watch',
    className: 'btn-secondary',
    icon: Eye,
    resolves: false,
  },
  {
    status: 'DISMISSED',
    label: 'Dismiss',
    className: 'btn-success',
    icon: XCircle,
    resolves: true,
  },
]

const OPEN_STATUSES = new Set(['NEW', 'WATCHING', 'ESCALATED'])

export function isIncidentOpen(status) {
  return OPEN_STATUSES.has(status)
}

export function actionResolves(status) {
  return ACTIONS.find((a) => a.status === status)?.resolves ?? false
}

/**
 * Real supervisor decisions — each button loads independently.
 * @param {string|null} actingStatus - only the active action shows "Saving…"
 */
export default function IncidentActions({
  status,
  actingStatus = null,
  onAction,
  compact = false,
  notesValue,
  onNotesChange,
  showNotes = false,
}) {
  const open = isIncidentOpen(status)
  const busy = Boolean(actingStatus)

  return (
    <div className="space-y-3">
      {showNotes && (
        <textarea
          className={`input-field resize-none ${compact ? 'min-h-[44px] py-2 text-sm' : 'min-h-[72px]'}`}
          placeholder="Notes (optional)"
          value={notesValue}
          onChange={(e) => onNotesChange?.(e.target.value)}
          disabled={busy || !open}
        />
      )}

      <div className={compact ? 'grid grid-cols-2 gap-2' : 'grid gap-2 sm:grid-cols-2'}>
        {ACTIONS.map(({ status: actionStatus, label, className, icon: Icon }) => {
          const isThis = actingStatus === actionStatus
          return (
            <button
              key={actionStatus}
              type="button"
              disabled={!open || busy}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!open || busy) return
                onAction(actionStatus)
              }}
              className={`${className} w-full ${compact && actionStatus === 'CONFIRMED' ? 'col-span-2' : ''}`}
            >
              <Icon className="h-4 w-4" />
              {isThis ? 'Saving…' : label}
            </button>
          )
        })}
      </div>

      {!open && (
        <p className="text-xs text-slate-500">
          This incident is already resolved — no further action needed.
        </p>
      )}
    </div>
  )
}
