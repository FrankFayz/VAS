import { useId } from 'react'

/**
 * VAS brand mark — flat shield + lens + V. No glow, no soft bloom.
 */
export default function VasCameraIcon({ className = 'h-full w-full' }) {
  const uid = useId().replace(/:/g, '')
  const face = `vas-face-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={face} x1="12" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3aa39a" />
          <stop offset="1" stopColor="#247470" />
        </linearGradient>
      </defs>

      {/* Flat shield */}
      <path
        d="M32 4 L54 13 V31 C54 45.5 44 55 32 60 C20 55 10 45.5 10 31 V13 L32 4 Z"
        fill={`url(#${face})`}
        stroke="#1e4b4a"
        strokeWidth="1.5"
      />

      {/* Flat lens */}
      <circle cx="32" cy="33" r="16" fill="#f4faf9" />
      <circle cx="32" cy="33" r="13.5" fill="#0b1616" stroke="#1e4b4a" strokeWidth="1" />
      <circle cx="32" cy="33" r="10" stroke="#2f9189" strokeWidth="1.75" fill="none" />

      {/* Bold V */}
      <path
        d="M23 26 L32 44 L41 26"
        stroke="#f4faf9"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Focus ticks */}
      <path
        d="M32 17 V20.5 M32 45.5 V49 M17 33 H20.5 M43.5 33 H47"
        stroke="#f4faf9"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
