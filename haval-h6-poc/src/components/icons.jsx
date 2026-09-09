const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconNav = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)

export const IconMedia = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="7" cy="18" r="2.6" />
    <circle cx="17" cy="16" r="2.6" />
  </svg>
)

export const IconPhone = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" />
  </svg>
)

export const IconGauge = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5.6 19a10 10 0 1 1 12.8 0" />
    <path d="M12 14l4-5" />
    <circle cx="12" cy="14" r="2.2" />
  </svg>
)

export const IconSettings = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
    <circle cx="9" cy="7" r="2.4" />
    <circle cx="15" cy="12" r="2.4" />
    <circle cx="8" cy="17" r="2.4" />
  </svg>
)

export const IconOffroad = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 20 10 7l4 7 3-5 4 11z" />
    <circle cx="17" cy="4" r="2.2" />
  </svg>
)

export const IconBack = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

export const IconWifi = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconSignal = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="13" width="3" height="7" rx="1" fill="currentColor" stroke="none" />
    <rect x="8" y="9" width="3" height="11" rx="1" fill="currentColor" stroke="none" />
    <rect x="13" y="5" width="3" height="15" rx="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconBattery = ({ level = 70, ...p }) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="2" y="7" width="18" height="10" rx="2.5" />
    <path d="M22 10.5v3" />
    <rect x="4" y="9" width={level * 0.14} height="6" rx="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconBluetooth = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
  </svg>
)
