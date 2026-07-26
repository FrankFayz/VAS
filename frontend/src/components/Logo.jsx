import VasCameraIcon from './VasCameraIcon'

export default function Logo({ size = 'md', layout = 'horizontal', showText = true }) {
  const sizes = {
    sm: { icon: 'h-9 w-12', title: 'text-sm', sub: 'text-[10px]', gap: 'gap-2.5', showSub: false },
    md: { icon: 'h-10 w-14', title: 'text-base', sub: 'text-[10px]', gap: 'gap-3', showSub: true },
    lg: { icon: 'h-14 w-[4.5rem]', title: 'text-lg', sub: 'text-xs', gap: 'gap-3.5', showSub: true },
    hero: { icon: 'h-28 w-40', title: 'text-2xl', sub: 'text-sm', gap: 'gap-4', showSub: true },
  }
  const s = sizes[size] || sizes.md

  const mark = <VasCameraIcon className={`shrink-0 ${s.icon}`} />

  if (!showText) return mark

  const text = (
    <div className={layout === 'vertical' ? 'mt-3 text-center' : ''}>
      <p className={`font-display font-bold tracking-tight text-white ${s.title}`}>VAS</p>
      {s.showSub && size !== 'sm' && (
        <p className={`text-slate-500 ${s.sub}`}>Virtual Assistant Supervisor</p>
      )}
    </div>
  )

  if (layout === 'vertical') {
    return (
      <div className="flex flex-col items-center">
        {mark}
        {text}
      </div>
    )
  }

  return (
    <div className={`flex items-center ${s.gap}`}>
      {mark}
      {text}
    </div>
  )
}
