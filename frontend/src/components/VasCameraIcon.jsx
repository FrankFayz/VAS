import { useId } from 'react'

/**
 * Professional mirrorless / DSLR-style camera mark.
 * Clean body, grip, EVF hump, and glass lens — no brand lettering.
 */
export default function VasCameraIcon({ className = 'h-full w-full' }) {
  const uid = useId().replace(/:/g, '')
  const body = `vas-cam-body-${uid}`
  const top = `vas-cam-top-${uid}`
  const grip = `vas-cam-grip-${uid}`
  const lens = `vas-cam-lens-${uid}`
  const glass = `vas-cam-glass-${uid}`
  const dial = `vas-cam-dial-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={body} x1="18" y1="28" x2="142" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3A3F48" />
          <stop offset="0.45" stopColor="#1F232A" />
          <stop offset="1" stopColor="#0B0D11" />
        </linearGradient>
        <linearGradient id={top} x1="48" y1="14" x2="112" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4B5160" />
          <stop offset="1" stopColor="#1A1E26" />
        </linearGradient>
        <linearGradient id={grip} x1="18" y1="40" x2="48" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A2F38" />
          <stop offset="1" stopColor="#101318" />
        </linearGradient>
        <linearGradient id={lens} x1="78" y1="34" x2="142" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5A6170" />
          <stop offset="0.5" stopColor="#2A303A" />
          <stop offset="1" stopColor="#0E1116" />
        </linearGradient>
        <radialGradient id={glass} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(110 66) rotate(118) scale(22)">
          <stop stopColor="#7DD3FC" stopOpacity="0.35" />
          <stop offset="0.35" stopColor="#1E3A5F" />
          <stop offset="0.75" stopColor="#0B1220" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
        <linearGradient id={dial} x1="118" y1="16" x2="138" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9CA3AF" />
          <stop offset="1" stopColor="#4B5563" />
        </linearGradient>
      </defs>

      {/* Soft ground contact — flat, no glow */}
      <ellipse cx="80" cy="108" rx="46" ry="4" fill="#000000" opacity="0.35" />

      {/* Main body */}
      <path
        d="M22 48 C22 38 30 32 40 32 H118 C130 32 140 40 140 52 V88 C140 98 132 104 122 104 H40 C28 104 22 96 22 86 V48 Z"
        fill={`url(#${body})`}
        stroke="#6B7280"
        strokeWidth="1.2"
      />

      {/* Hand grip */}
      <path
        d="M22 52 C22 44 28 40 36 40 H48 V98 H36 C26 98 22 92 22 84 V52 Z"
        fill={`url(#${grip})`}
        stroke="#4B5563"
        strokeWidth="1"
      />
      <path d="M28 48 H42" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 56 H42" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 64 H42" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 72 H40" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />

      {/* EVF / prism hump */}
      <path
        d="M58 32 C58 22 66 16 76 16 H104 C114 16 122 22 122 32 V40 H58 V32 Z"
        fill={`url(#${top})`}
        stroke="#6B7280"
        strokeWidth="1.1"
      />
      {/* Hot shoe */}
      <rect x="78" y="14" width="24" height="5" rx="1" fill="#111827" stroke="#9CA3AF" strokeWidth="0.8" />
      <rect x="82" y="12" width="16" height="3" rx="0.8" fill="#374151" />

      {/* Mode dial */}
      <circle cx="128" cy="26" r="9" fill={`url(#${dial})`} stroke="#111827" strokeWidth="1" />
      <circle cx="128" cy="26" r="5.5" fill="#1F2937" stroke="#9CA3AF" strokeWidth="0.7" />
      <circle cx="128" cy="26" r="1.6" fill="#E5E7EB" />
      <path d="M128 18.5 V21.5 M128 30.5 V33.5 M119.5 26 H122.5 M133.5 26 H136.5" stroke="#D1D5DB" strokeWidth="1" strokeLinecap="round" />

      {/* Shutter button */}
      <circle cx="112" cy="28" r="4.2" fill="#E5E7EB" stroke="#6B7280" strokeWidth="0.8" />
      <circle cx="112" cy="28" r="2.4" fill="#9CA3AF" />

      {/* Front control panel / AF assist */}
      <rect x="54" y="46" width="14" height="10" rx="2" fill="#111827" stroke="#4B5563" strokeWidth="0.8" />
      <circle cx="61" cy="51" r="2.2" fill="#0EA5E9" />
      <circle cx="61" cy="51" r="1" fill="#E0F2FE" />

      {/* Lens barrel */}
      <circle cx="110" cy="66" r="30" fill={`url(#${lens})`} stroke="#9CA3AF" strokeWidth="1.4" />
      <circle cx="110" cy="66" r="25.5" fill="#151920" stroke="#4B5563" strokeWidth="1" />
      <circle cx="110" cy="66" r="21.5" fill="#0B0F14" stroke="#6B7280" strokeWidth="1.1" />

      {/* Focus ring texture */}
      {[
        -18, -12, -6, 0, 6, 12, 18,
      ].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 110 + Math.cos(rad) * 22.5
        const y1 = 66 + Math.sin(rad) * 22.5
        const x2 = 110 + Math.cos(rad) * 25
        const y2 = 66 + Math.sin(rad) * 25
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#9CA3AF"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )
      })}

      {/* Glass element */}
      <circle cx="110" cy="66" r="16.5" fill={`url(#${glass})`} stroke="#334155" strokeWidth="1.2" />
      <circle cx="110" cy="66" r="10.5" fill="#020617" stroke="#1E293B" strokeWidth="1" />
      <circle cx="110" cy="66" r="5" fill="#020617" stroke="#0EA5E9" strokeWidth="0.9" opacity="0.85" />
      <circle cx="110" cy="66" r="2.2" fill="#0B1220" />

      {/* Crisp glass highlight (flat highlight, not glow) */}
      <path
        d="M100 56 C103 53 108 52 112 53"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />
      <ellipse cx="104" cy="60" rx="4.5" ry="2.2" fill="#FFFFFF" opacity="0.22" />

      {/* Side ports / strap eyelet */}
      <circle cx="26" cy="44" r="2.2" fill="#111827" stroke="#6B7280" strokeWidth="0.8" />
      <rect x="132" y="78" width="6" height="14" rx="1.5" fill="#111827" stroke="#4B5563" strokeWidth="0.8" />

      {/* Brand-free badge plate */}
      <rect x="54" y="84" width="22" height="8" rx="1.5" fill="#111827" stroke="#374151" strokeWidth="0.7" />
      <path d="M58 88 H72" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
