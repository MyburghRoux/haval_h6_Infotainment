import { motion } from 'framer-motion'
import { useCar } from '../car'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function pt(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}
function arc(cx, cy, r, a0, a1) {
  const s = pt(cx, cy, r, a0)
  const e = pt(cx, cy, r, a1)
  const large = (a1 - a0 + 360) % 360 > 180 ? 1 : 0
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`
}

export function ArcGauge({ value, min, max, redline, unit, label, color, size = 300, major = 11, fmt = (v) => Math.round(v) }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.4
  const frac = clamp((value - min) / (max - min), 0, 1)
  const angle = -225 + frac * 270
  const valCol = redline != null && value >= redline ? '#e84b3d' : color
  const full = arc(cx, cy, r, -225, 45)

  const ticks = []
  for (let i = 0; i <= major; i++) {
    const a = -225 + (i / major) * 270
    const p1 = pt(cx, cy, r - 6, a)
    const p2 = pt(cx, cy, r - 16, a)
    ticks.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="gauge">
      <path d={full} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="13" strokeLinecap="round" />
      {redline != null && (
        <path
          d={arc(cx, cy, r, -225 + (redline / (max - min)) * 270, 45)}
          fill="none" stroke="rgba(232,75,61,0.45)" strokeWidth="13" strokeLinecap="round"
        />
      )}
      <motion.path
        d={full}
        fill="none" stroke={valCol} strokeWidth="13" strokeLinecap="round"
        animate={{ strokeDasharray: `${frac * (1.5 * Math.PI * r)} ${1.5 * Math.PI * r}` }}
        transition={{ type: 'spring', stiffness: 130, damping: 20 }}
      />
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(255,255,255,0.3)" strokeWidth="1.6" />
      ))}
      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box' }}
        animate={{ rotate: angle }}
        transition={{ type: 'spring', stiffness: 110, damping: 17 }}
      >
        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.82} stroke="#f2f2f0" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
      <circle cx={cx} cy={cy} r="9" fill="#e8a33d" />
      <circle cx={cx} cy={cy} r="4" fill="#0e0f12" />
      <text x={cx} y={cy + r * 0.7} textAnchor="middle" className="gauge-val">{fmt(value)}</text>
      <text x={cx} y={cy + r * 0.7 + 15} textAnchor="middle" className="gauge-unit">{unit}</text>
      <text x={cx} y={size - 12} textAnchor="middle" className="gauge-label">{label}</text>
    </svg>
  )
}

export function CoolantGauge({ value }) {
  const min = 40, max = 130
  const pct = clamp(((value - min) / (max - min)) * 100, 0, 100)
  const col = value >= 105 ? '#e84b3d' : value >= 95 ? '#e8a33d' : '#3dd68c'
  return (
    <div className="lgauge">
      <div className="lg-head">
        <span>Engine Coolant</span>
        <span className="lg-val">{Math.round(value)} &deg;C</span>
      </div>
      <div className="lg-track">
        <motion.div
          className="lg-fill"
          style={{ background: col }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        <div className="lg-marker" style={{ left: '53%' }} />
      </div>
      <div className="lg-scale"><span>40</span><span>90</span><span>130</span></div>
    </div>
  )
}

export default function GaugePanel() {
  const { s } = useCar()
  return (
    <div className="gauge-panel" style={{ gap: 18 }}>
      <div className="gauge-cell">
        <ArcGauge value={s.rpm} min={0} max={7000} redline={6000} unit="rpm" label="ENGINE SPEED" color="#e8a33d" size={220} />
      </div>
      <div className="gauge-cell">
        <ArcGauge value={s.speed} min={0} max={220} unit="km/h" label="VEHICLE SPEED" color="#3d8be8" size={220} />
      </div>
      <div className="gauge-col">
        <CoolantGauge value={s.coolant} />
        <ArcGauge value={s.batt} min={10} max={16} unit="V" label="BATTERY" color={s.batt > 13 ? '#3dd68c' : '#e8a33d'} size={130} major={7} fmt={(v) => v.toFixed(1)} />
      </div>
    </div>
  )
}

export function TempGauge({ label, value, min = 40, max = 140, marker, danger }) {
  const pct = clamp(((value - min) / (max - min)) * 100, 0, 100)
  const markerPct = ((marker - min) / (max - min)) * 100
  const col = value >= danger ? '#e84b3d' : value >= marker + 8 ? '#e8a33d' : '#3d8be8'
  return (
    <div className="lgauge">
      <div className="lg-head">
        <span>{label}</span>
        <span className="lg-val">{Math.round(value)} &deg;C</span>
      </div>
      <div className="lg-track">
        <motion.div
          className="lg-fill"
          style={{ background: col }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        <div className="lg-marker" style={{ left: `${markerPct}%` }} />
      </div>
      <div className="lg-scale"><span>{min}</span><span>{Math.round(marker)}</span><span>{max}</span></div>
    </div>
  )
}

export function BoostGauge({ value }) {
  const pct = clamp((value / 2) * 100, 0, 100)
  const col = value > 1.5 ? '#e84b3d' : value > 0.9 ? '#e8a33d' : '#3d8be8'
  return (
    <div className="lgauge">
      <div className="lg-head">
        <span>Turbo Boost</span>
        <span className="lg-val">{value.toFixed(1)} bar</span>
      </div>
      <div className="lg-track">
        <motion.div
          className="lg-fill"
          style={{ background: col }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="lg-scale"><span>0</span><span>1</span><span>2 bar</span></div>
    </div>
  )
}
