export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon className="h-10 w-10 text-slate-600" strokeWidth={1.5} />}
      <p className="mt-4 font-block text-sm font-bold uppercase tracking-[0.1em] text-white">
        {title}
      </p>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
