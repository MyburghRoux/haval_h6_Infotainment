import { createContext, useContext, useEffect, useRef, useState } from 'react'

export const IDLE = 780
export const MAX_RPM = 7000
export const REDLINE = 6000
const GEAR_FACTOR = { P: 0, R: 0.02, N: 0, D: 0.028 }

export const DRIVE_MODES = ['Eco', 'Normal', 'Sport', 'Snow', 'Offroad']
export const SURFACES = ['Dry', 'Wet', 'Snow', 'Mud']

const GRIP = { Dry: 0.1, Wet: 0.35, Snow: 0.5, Mud: 0.45 }
const MODE_TORQUE = { Eco: 0.85, Normal: 1.0, Sport: 1.25, Snow: 0.9, Offroad: 1.1 }

const initial = {
  ignition: false,
  throttle: 0,
  brake: false,
  gear: 'D',
  rpm: 0,
  speed: 0,
  coolant: 22,
  iat: 24,
  maf: 0,
  fuel: 68,
  batt: 12.5,
  timing: 0,
  tps: 0,
  driveMode: 'Normal',
  surface: 'Dry',
  boost: 0,
  gearboxTemp: 62,
  diffTempF: 48,
  diffTempR: 46,
  awdEngaged: false,
  torqueF: 100,
  torqueR: 0,
  slip: 0,
  pitch: 0,
  roll: 0,
}

export const CarContext = createContext(null)
export const useCar = () => useContext(CarContext)

export function useCarSim() {
  const [s, setS] = useState(initial)
  const ref = useRef(s)
  ref.current = s
  const frame = useRef(0)

  useEffect(() => {
    let raf
    let prev = performance.now()
    const loop = (now) => {
      const dt = Math.min(0.1, (now - prev) / 1000)
      prev = now
      const c = ref.current
      const tNow = now / 1000

      let rpm = c.rpm
      let speed = c.speed
      let coolant = c.coolant
      let batt = c.batt
      let iat = c.iat
      let maf = c.maf
      let timing = c.timing
      let boost = c.boost
      let gearboxTemp = c.gearboxTemp
      let diffTempF = c.diffTempF
      let diffTempR = c.diffTempR
      let torqueF = c.torqueF
      let torqueR = c.torqueR
      let slip = c.slip
      let pitch = c.pitch
      let roll = c.roll

      if (c.ignition) {
        let target = IDLE + c.throttle * 60
        if (c.brake) target = Math.min(target, IDLE + 300)
        rpm += (target - rpm) * Math.min(1, dt * 3)

        const f = GEAR_FACTOR[c.gear]
        const ts = rpm * f
        speed += (ts - speed) * Math.min(1, dt * 1.5)
        if (c.brake) speed *= Math.max(0, 1 - dt * 2)
        if (speed < 0) speed = 0

        coolant += (92 - coolant) * Math.min(1, dt * 0.01)
        maf = Math.max(0.9, (rpm / MAX_RPM) * 60 * (0.5 + c.throttle / 200) + c.throttle * 0.2)
        batt += (14.3 - batt) * Math.min(1, dt * 0.2)
        iat = 24 + (coolant - 24) * 0.05
        timing = Math.max(0, (rpm / MAX_RPM) * 18 - c.throttle * 0.02)

        // ---- drivetrain ----
        const tm = MODE_TORQUE[c.driveMode]
        const torque = (c.throttle / 100) * (0.3 + 0.7 * (rpm / MAX_RPM)) * tm

        boost += (c.throttle / 100 * (rpm / MAX_RPM) * 1.7 * (c.driveMode === 'Sport' ? 1.15 : 1) - boost) * Math.min(1, dt * 4)

        let slipT = 0
        if (c.throttle > 15) slipT = c.throttle * GRIP[c.surface] * (c.brake ? 0.2 : 1)
        slip += (slipT - slip) * Math.min(1, dt * 3)

        // intelligent 4WD: engage on slip, mode, or hard throttle
        const awdReq = c.driveMode === 'Offroad' || c.driveMode === 'Snow' || slip > 12 || c.throttle >= 90
        let fT, rT
        if (c.driveMode === 'Offroad') { fT = 50; rT = 50 }
        else if (c.driveMode === 'Snow') { fT = 60; rT = 40 }
        else if (awdReq) {
          rT = Math.min(60, (slip / 55) * 50 + (c.throttle >= 90 ? 30 : 0))
          fT = 100 - rT
        } else { fT = 100; rT = 0 }
        torqueF += (fT - torqueF) * Math.min(1, dt * 2.5)
        torqueR += (rT - torqueR) * Math.min(1, dt * 2.5)

        gearboxTemp += (66 + torque * 48 - gearboxTemp) * Math.min(1, dt * 0.06)
        diffTempF += (46 + (torqueF / 100) * torque * 34 - diffTempF) * Math.min(1, dt * 0.06)
        diffTempR += (44 + (torqueR / 100) * torque * 42 - diffTempR) * Math.min(1, dt * 0.06)
      } else {
        rpm += (0 - rpm) * Math.min(1, dt * 3)
        speed += (0 - speed) * Math.min(1, dt * 1.5)
        coolant += (22 - coolant) * Math.min(1, dt * 0.002)
        batt += (12.4 - batt) * Math.min(1, dt * 0.05)
        maf = 0
        timing = 0
        iat = 24

        boost += (0 - boost) * Math.min(1, dt * 6)
        slip += (0 - slip) * Math.min(1, dt * 3)
        torqueF += (100 - torqueF) * Math.min(1, dt * 2)
        torqueR += (0 - torqueR) * Math.min(1, dt * 2)
        gearboxTemp += (58 - gearboxTemp) * Math.min(1, dt * 0.04)
        diffTempF += (38 - diffTempF) * Math.min(1, dt * 0.04)
        diffTempR += (38 - diffTempR) * Math.min(1, dt * 0.04)
      }

      // simulated terrain motion
      const terrain = c.ignition ? 1 : 0.3
      pitch += (Math.sin(tNow * 0.9) * 2.5 * terrain + (c.brake ? -5 : c.throttle > 55 ? 3.5 : 0) - pitch) * Math.min(1, dt * 1.5)
      roll += (Math.sin(tNow * 1.3) * 4 * terrain - roll) * Math.min(1, dt * 1.5)

      if (rpm < 0.5) rpm = 0
      if (speed < 0.5 && GEAR_FACTOR[c.gear] === 0) speed = 0

      frame.current += 1
      if (frame.current % 2 === 0) {
        setS({
          ...c,
          rpm, speed, coolant, batt, iat, maf, timing,
          tps: c.throttle,
          boost, gearboxTemp, diffTempF, diffTempR,
          torqueF, torqueR, slip, pitch, roll,
          awdEngaged: torqueR > 8,
        })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const act = {
    toggleIgnition: () => setS((st) => ({ ...st, ignition: !st.ignition })),
    setThrottle: (v) => setS((st) => ({ ...st, throttle: Math.max(0, Math.min(100, v)) })),
    setBrake: (b) => setS((st) => ({ ...st, brake: b })),
    setGear: (g) => setS((st) => ({ ...st, gear: g })),
    setDriveMode: (m) => setS((st) => ({ ...st, driveMode: m })),
    setSurface: (x) => setS((st) => ({ ...st, surface: x })),
  }

  return { s, act }
}
