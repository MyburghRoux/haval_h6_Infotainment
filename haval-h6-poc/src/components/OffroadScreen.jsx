import { motion } from 'framer-motion'
import { TempGauge, BoostGauge } from './Gauges'
import { useCar, DRIVE_MODES, SURFACES } from '../car'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function SplitBar({ f, r }) {
  return (
    <div className="split">
      <div className="split-labels">
        <span>FRONT <b>{Math.round(f)}%</b></span>
        <span>REAR <b>{Math.round(r)}%</b></span>
      </div>
      <div className="split-track">
        <motion.div className="split-f" animate={{ width: `${f}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        <motion.div className="split-r" animate={{ width: `${r}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
    </div>
  )
}

function PowerFlow({ ignition, rOn }) {
  return (
    <div className="powerflow">
      <div className="panel-label">Power flow</div>
      <svg viewBox="0 0 520 210" className="pf-svg">
        <rect x="16" y="80" width="96" height="50" rx="10" className="pf-box" />
        <text x="64" y="111" textAnchor="middle" className="pf-label">ENGINE</text>
        <rect x="176" y="80" width="96" height="50" rx="10" className="pf-box" />
        <text x="224" y="111" textAnchor="middle" className="pf-label">GEARBOX</text>
        <rect x="360" y="20" width="130" height="12" rx="6" className="pf-axle" />
        <text x="425" y="52" textAnchor="middle" className="pf-label">FRONT AXLE</text>
        <rect x="360" y="178" width="130" height="12" rx="6" className="pf-axle" />
        <text x="425" y="202" textAnchor="middle" className="pf-label">REAR AXLE</text>
        <circle cx="366" cy="26" r="9" className="pf-wheel" />
        <circle cx="490" cy="26" r="9" className="pf-wheel" />
        <circle cx="366" cy="184" r="9" className="pf-wheel" />
        <circle cx="490" cy="184" r="9" className="pf-wheel" />

        <line x1="112" y1="105" x2="176" y2="105" className={`pf-flow ${ignition ? 'on' : ''}`} />
        <line x1="272" y1="105" x2="360" y2="40" className={`pf-flow ${ignition ? 'on' : ''}`} />
        <line x1="272" y1="105" x2="360" y2="184" className={`pf-flow ${rOn ? 'on' : ''}`} />
      </svg>
    </div>
  )
}

function SlipCell({ label, value }) {
  const pct = clamp(value, 0, 100)
  const col = pct > 40 ? '#e84b3d' : pct > 18 ? '#e8a33d' : '#3d8be8'
  return (
    <div className="slip">
      <span className="slip-label">{label}</span>
      <div className="slip-track">
        <motion.div className="slip-fill" style={{ background: col }} animate={{ height: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
      <span className="slip-val">{Math.round(value)}</span>
    </div>
  )
}

function Inclinometer({ pitch, roll }) {
  const cx = 60, cy = 60, r = 48
  const bx = cx + (roll / 20) * 30
  const by = cy + (pitch / 20) * 30
  return (
    <div className="incl-wrap">
      <div className="panel-label">Inclinometer</div>
      <div className="incl-row">
        <svg viewBox="0 0 120 120" className="incl">
          <circle cx={cx} cy={cy} r={r} className="incl-ring" />
          <line x1="12" y1="60" x2="108" y2="60" className="incl-line" />
          <line x1="60" y1="12" x2="60" y2="108" className="incl-line" />
          <circle cx={cx} cy={cy} r="3" className="incl-center" />
          <motion.circle
            className="incl-ball"
            animate={{ cx: bx, cy: by }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            r="9"
          />
        </svg>
        <div className="incl-reads">
          <div>PITCH <b>{pitch.toFixed(1)}&deg;</b></div>
          <div>ROLL <b>{roll.toFixed(1)}&deg;</b></div>
        </div>
      </div>
    </div>
  )
}

export default function OffroadScreen() {
  const { s, act } = useCar()

  const fl = s.slip * (1 - s.torqueR / 130)
  const fr = s.slip * (1 - s.torqueR / 130)
  const rl = s.slip * (0.25 + (s.torqueR / 100) * 0.75)
  const rr = s.slip * (0.25 + (s.torqueR / 100) * 0.75)

  return (
    <div className="offroad">
      <div className="off-head">
        <div className="obd-title">
          <span className={`obd-dot ${s.awdEngaged ? '' : 'dim'}`} />
          Offroad &amp; Drivetrain
        </div>
        <div className="off-status">
          <span className={`awd-chip ${s.awdEngaged ? 'on' : ''}`}>{s.awdEngaged ? 'AWD ENGAGED' : '2WD'}</span>
          <span className="off-chip">Mode: {s.driveMode}</span>
          <span className="off-chip">Surface: {s.surface}</span>
        </div>
      </div>

      <div className="off-body">
        <div className="off-left">
          <PowerFlow ignition={s.ignition} rOn={s.torqueR > 8} />
          <SplitBar f={s.torqueF} r={s.torqueR} />
          <div className="slip-row">
            <SlipCell label="FL" value={fl} />
            <SlipCell label="FR" value={fr} />
            <SlipCell label="RL" value={rl} />
            <SlipCell label="RR" value={rr} />
            <div className="slip-note">Wheel slip %</div>
          </div>
        </div>

        <div className="off-right">
          <TempGauge label="Gearbox Temp" value={s.gearboxTemp} marker={105} danger={120} />
          <TempGauge label="Front Diff Temp" value={s.diffTempF} marker={95} danger={115} />
          <TempGauge label="Rear Diff Temp" value={s.diffTempR} marker={95} danger={115} />
          <BoostGauge value={s.boost} />
          <Inclinometer pitch={s.pitch} roll={s.roll} />
        </div>
      </div>

      <div className="off-controls">
        <div className="off-ctrl-group">
          <span className="off-ctrl-label">DRIVE MODE</span>
          <div className="mode-btns">
            {DRIVE_MODES.map((m) => (
              <button key={m} className={`mode-btn ${s.driveMode === m ? 'on' : ''}`} onClick={() => act.setDriveMode(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="off-ctrl-group">
          <span className="off-ctrl-label">SURFACE</span>
          <div className="mode-btns">
            {SURFACES.map((x) => (
              <button key={x} className={`mode-btn ${s.surface === x ? 'on' : ''}`} onClick={() => act.setSurface(x)}>
                {x}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
