import { useState } from 'react'
import { motion } from 'framer-motion'

const FLAGS = [
  { label: 'Head-Up Display', prop: 'persist.vendor.gwm.cfg.head.up.display', on: true },
  { label: 'Auto High Beam', prop: 'persist.vendor.gwm.cfg.auto.high.beam', on: true },
  { label: 'ADAS Features', prop: 'persist.vendor.gwm.cfg.adas.enable', on: true },
  { label: 'Wireless Charging', prop: 'persist.vendor.gwm.cfg.wireless.charge', on: true },
  { label: 'Ambient Lighting', prop: 'persist.vendor.gwm.cfg.ambient.light', on: false },
  { label: '540 Camera', prop: 'persist.vendor.gwm.cfg.540.camera', on: true },
]

function Toggle({ on, onChange }) {
  return (
    <motion.button
      className={`toggle ${on ? 'on' : ''}`}
      onClick={onChange}
      animate={{ backgroundColor: on ? 'rgba(61,214,140,0.25)' : 'rgba(255,255,255,0.08)' }}
      transition={{ duration: 0.25 }}
    >
      <motion.span
        className="toggle-knob"
        animate={{ x: on ? 22 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )
}

export default function SettingsScreen({ toast }) {
  const [flags, setFlags] = useState(FLAGS)

  const flip = (i) => {
    const f = flags[i]
    const next = !f.on
    setFlags((arr) => arr.map((x, k) => (k === i ? { ...x, on: next } : x)))
    toast(`POC only — ${f.prop} ${next ? '1' : '0'} (read-only on production unit)`)
  }

  return (
    <div className="settings">
      <div className="settings-head">Vehicle Configuration</div>
      <div className="settings-sub">Simulated feature flags — writes blocked on production head unit</div>
      <div className="settings-list">
        {flags.map((f, i) => (
          <motion.div
            key={f.prop}
            className="setting-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="setting-info">
              <div className="setting-label">{f.label}</div>
              <div className="setting-prop">{f.prop}</div>
            </div>
            <Toggle on={f.on} onChange={() => flip(i)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
