export default function StatCard({ label, value, icon: Icon, color = 'vas', trend }) {
  const iconColors = {
    vas: 'text-vas-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[var(--vas-bg-panel)] p-5 transition-colors hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 font-block text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
            {value}
          </p>
          {trend && (
            <p className="mt-1.5 font-block text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="icon-box h-10 w-10">
            <Icon className={`h-5 w-5 ${iconColors[color]}`} strokeWidth={1.75} />
          </div>
        )}
      </div>
    </div>
  )
}
