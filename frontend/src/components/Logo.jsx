import VasCameraIcon from './VasCameraIcon'

export default function Logo({ size = 'md', layout = 'horizontal', showText = true }) {
  const sizes = {
    sm: {
      icon: 'h-9 w-9',
      title: 'text-[15px] tracking-[0.18em]',
      sub: 'text-[9px] tracking-[0.18em]',
      gap: 'gap-3',
      showSub: false,
    },
    md: {
      icon: 'h-11 w-11',
      title: 'text-lg tracking-[0.18em]',
      sub: 'text-[10px] tracking-[0.16em]',
      gap: 'gap-3',
      showSub: true,
    },
    lg: {
      icon: 'h-14 w-14',
      title: 'text-xl tracking-[0.2em]',
      sub: 'text-[11px] tracking-[0.16em]',
      gap: 'gap-3.5',
      showSub: true,
    },
    hero: {
      icon: 'h-24 w-24',
      title: 'text-3xl tracking-[0.22em]',
      sub: 'text-xs tracking-[0.18em]',
      gap: 'gap-5',
      showSub: true,
    },
  }
  const s = sizes[size] || sizes.md

  const mark = (
    <span className={`relative inline-flex shrink-0 ${s.icon}`}>
      <VasCameraIcon className="h-full w-full" />
    </span>
  )

  if (!showText) return mark

  const text = (
    <div className={layout === 'vertical' ? 'mt-4 text-center' : 'min-w-0'}>
      <p className={`font-display font-bold uppercase leading-none text-white ${s.title}`}>
        VAS
      </p>
      {s.showSub && (
        <p className={`mt-1.5 font-block font-semibold uppercase text-vas-400 ${s.sub}`}>
          Exam Integrity
        </p>
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
