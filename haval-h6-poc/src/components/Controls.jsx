import { motion } from 'framer-motion'
import { useCar } from '../car'

const GEARS = ['P', 'R', 'N', 'D']

export default function Controls() {
  const { s, act } = useCar()
  return (
    <motion.div
      className="controls"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <div className="ctrl-label">SIM</div>

      <button className={`ctrl-btn ignition ${s.ignition ? 'on' : ''}`} onClick={act.toggleIgnition}>
        {s.ignition ? 'ENGINE ON' : 'IGNITION'}
      </button>

      <div className="ctrl-gears">
        {GEARS.map((g) => (
          <button key={g} className={`ctrl-btn gear ${s.gear === g ? 'on' : ''}`} onClick={() => act.setGear(g)}>
            {g}
          </button>
        ))}
      </div>

      <div className="ctrl-throttle">
        <span>THROTTLE {Math.round(s.throttle)}%</span>
        <input
          type="range" min="0" max="100" value={s.throttle}
          onChange={(e) => act.setThrottle(Number(e.target.value))}
          className="throttle-slider"
        />
      </div>

      <button
        className={`ctrl-btn brake ${s.brake ? 'on' : ''}`}
        onPointerDown={() => act.setBrake(true)}
        onPointerUp={() => act.setBrake(false)}
        onPointerLeave={() => act.setBrake(false)}
      >
        BRAKE
      </button>

      <span className={`awd-chip ${s.awdEngaged ? 'on' : ''}`}>
        {s.awdEngaged ? 'AWD' : '2WD'}
      </span>
    </motion.div>
  )
}
