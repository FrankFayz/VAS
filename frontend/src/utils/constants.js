export const INCIDENT_TYPES = {
  COPYING: 'Possible Copying',
  PEEKING: 'Looking Off Desk',
  PHONE_USE: 'Phone Use',
  UNAUTHORIZED_MATERIAL: 'Unauthorized Material',
  TALKING: 'Talking',
  OTHER: 'Other',
}

export const INCIDENT_STATUS = {
  NEW: 'New',
  WATCHING: 'Watching',
  CONFIRMED: 'Confirmed',
  WARNING: 'Warning Issued',
  DISMISSED: 'False Alarm',
  ESCALATED: 'Escalated',
}

export const SEVERITY_COLORS = {
  LOW: 'border-slate-700 bg-[#121a26] text-slate-300',
  MEDIUM: 'border-amber-800 bg-[#1a160e] text-amber-400',
  HIGH: 'border-orange-800 bg-[#1a120e] text-orange-400',
  CRITICAL: 'border-red-800 bg-[#1a1014] text-red-400',
}

export const STATUS_COLORS = {
  NEW: 'border-red-800 bg-[#1a1014] text-red-400',
  WATCHING: 'border-amber-800 bg-[#1a160e] text-amber-400',
  CONFIRMED: 'border-red-800 bg-[#1a1014] text-red-300',
  WARNING: 'border-yellow-800 bg-[#1a180e] text-yellow-400',
  DISMISSED: 'border-slate-700 bg-[#121a26] text-slate-400',
  ESCALATED: 'border-violet-800 bg-[#14101a] text-violet-300',
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
