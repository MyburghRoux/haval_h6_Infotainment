import { motion } from 'framer-motion'
import { IconNav, IconMedia, IconPhone, IconGauge, IconSettings, IconOffroad } from './icons'
import { useCar } from '../car'

const TILES = [
  { id: 'nav', label: 'Navigation', Icon: IconNav, screen: 'nav' },
  { id: 'media', label: 'Media', Icon: IconMedia, screen: 'media' },
  { id: 'phone', label: 'Phone', Icon: IconPhone, screen: 'phone' },
  { id: 'obd', label: 'OBD Vehicle', Icon: IconGauge, screen: 'obd', accent: true },
  { id: 'offroad', label: 'Offroad', Icon: IconOffroad, screen: 'offroad', accent: true },
  { id: 'settings', label: 'Settings', Icon: IconSettings, screen: 'settings' },
]

function HudStrip() {
  const { s } = useCar()
  const speed = Math.round(s.speed).toString().padStart(3, '0')
  return (
    <div className="hud">
      <div className="hud-cell"><span className="hud-v">{speed}</span><span className="hud-u">km/h</span></div>
      <div className="hud-cell"><span className="hud-v">{s.gear}</span><span className="hud-u">gear</span></div>
      <div className="hud-cell"><span className="hud-v">{Math.round(s.rpm)}</span><span className="hud-u">rpm</span></div>
      <div className="hud-cell"><span className="hud-v">{s.boost.toFixed(1)}</span><span className="hud-u">bar</span></div>
      <div className="hud-cell"><span className="hud-v">{Math.round(s.coolant)}</span><span className="hud-u">C coolant</span></div>
      <div className="hud-cell"><span className="hud-v">{s.driveMode}</span><span className="hud-u">mode</span></div>
      <div className={`hud-cell ${s.awdEngaged ? 'awd' : ''}`}><span className="hud-v">{s.awdEngaged ? 'AWD' : '2WD'}</span><span className="hud-u">drive</span></div>
      <div className={`hud-cell ${s.ignition ? 'on' : ''}`}><span className="hud-v">{s.ignition ? 'ON' : 'OFF'}</span><span className="hud-u">ignition</span></div>
    </div>
  )
}

export default function HomeScreen({ onOpen }) {
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
  const item = {
    hidden: { opacity: 0, y: 18, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
  }

  return (
    <div className="home">
      <motion.div className="tiles" variants={container} initial="hidden" animate="show">
        {TILES.map((t) => (
          <motion.button
            key={t.id}
            className={`tile ${t.accent ? 'accent' : ''}`}
            variants={item}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpen(t.screen)}
          >
            <t.Icon width="44" height="44" />
            <span className="tile-label">{t.label}</span>
          </motion.button>
        ))}
      </motion.div>
      <HudStrip />
    </div>
  )
}
