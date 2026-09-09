import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GaugePanel from './Gauges'
import DataGraph from './DataGraph'
import { useCar } from '../car'

const CONNECT_STEPS = [
  'Powering on ELM327 chipset',
  'Scanning WiFi for OBD adapter',
  'Found 192.168.0.10 : 35000',
  'Opening TCP socket',
  'ATZ / ATE0 / ATL0 handshake',
  'Linked to vehicle',
]

const PROBE_PIDS = ['0100', '0120', '0140', '0160', '0180', '01A0']

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export default function ObdScreen({ onBack }) {
  const { s } = useCar()
  const [phase, setPhase] = useState('connect')
  const [step, setStep] = useState(0)
  const [probeDone, setProbeDone] = useState([])
  const [tab, setTab] = useState('live')
  const [dtcScanning, setDtcScanning] = useState(false)
  const [dtcResult, setDtcResult] = useState(null)
  const [injected, setInjected] = useState(false)
  const token = useRef(0)

  const runFlow = async (my) => {
    setPhase('connect')
    setStep(0)
    setProbeDone([])
    setDtcResult(null)
    setTab('live')
    for (let i = 0; i < CONNECT_STEPS.length; i++) {
      if (my !== token.current) return
      setStep(i)
      await wait(i === 1 ? 1500 : i === 5 ? 900 : 650)
    }
    if (my !== token.current) return
    setPhase('probe')
    for (let i = 0; i < PROBE_PIDS.length; i++) {
      if (my !== token.current) return
      await wait(420)
      setProbeDone((d) => [...d, i])
    }
    if (my !== token.current) return
    await wait(500)
    setPhase('live')
  }

  useEffect(() => {
    runFlow(++token.current)
  }, [])

  const reconnect = () => { runFlow(++token.current) }

  const runDtc = async (fake) => {
    setDtcScanning(true)
    setDtcResult(null)
    await wait(2400)
    if (fake) {
      setDtcResult([
        { code: 'P0455', desc: 'Evaporative emission system leak detected (large)' },
        { code: 'P0420', desc: 'Catalyst system efficiency below threshold (Bank 1)' },
      ])
    } else {
      setDtcResult([])
    }
    setDtcScanning(false)
  }

  const pids = [
    { id: '0105', name: 'Engine Coolant Temp', unit: '\u00B0C', v: Math.round(s.coolant) },
    { id: '010C', name: 'Engine RPM', unit: 'rpm', v: Math.round(s.rpm) },
    { id: '010D', name: 'Vehicle Speed', unit: 'km/h', v: Math.round(s.speed) },
    { id: '010E', name: 'Timing Advance', unit: '\u00B0', v: s.timing.toFixed(1) },
    { id: '010F', name: 'Intake Air Temp', unit: '\u00B0C', v: Math.round(s.iat) },
    { id: '0110', name: 'MAF Sensor', unit: 'g/s', v: s.maf.toFixed(1) },
    { id: '012F', name: 'Fuel Level', unit: '%', v: Math.round(s.fuel) },
    { id: '0142', name: 'Control Module Voltage', unit: 'V', v: s.batt.toFixed(1) },
    { id: 'A6', name: 'Gearbox Temp (ext)', unit: '\u00B0C', v: Math.round(s.gearboxTemp) },
    { id: 'A7', name: 'Front Diff Temp (ext)', unit: '\u00B0C', v: Math.round(s.diffTempF) },
    { id: 'A8', name: 'Rear Diff Temp (ext)', unit: '\u00B0C', v: Math.round(s.diffTempR) },
    { id: 'A9', name: 'Turbo Boost (ext)', unit: 'bar', v: s.boost.toFixed(1) },
    { id: 'AA', name: 'Torque Split F/R', unit: '%', v: `${Math.round(s.torqueF)}/${Math.round(s.torqueR)}` },
  ]

  return (
    <div className="obd">
      <div className="obd-top">
        <div className="obd-title">
          <span className="obd-dot" />
          OBD2 Vehicle Diagnostics
        </div>
        <div className="obd-tabs">
          <button className={`obd-tab ${tab === 'live' ? 'on' : ''}`} onClick={() => setTab('live')}>Live</button>
          <button className={`obd-tab ${tab === 'dtc' ? 'on' : ''}`} onClick={() => setTab('dtc')}>DTC</button>
        </div>
        <button className="obd-disc" onClick={reconnect}>Re-scan</button>
      </div>

      <div className="obd-body">
        <AnimatePresence mode="wait">
          {phase !== 'live' ? (
            <motion.div key="setup" className="obd-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }}>
              <div className="setup-card">
                {phase === 'connect' && (
                  <>
                    <div className="setup-head">Establishing ELM327 connection</div>
                    <div className="setup-list">
                      {CONNECT_STEPS.map((label, i) => (
                        <div key={label} className={`setup-item ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                          <span className="setup-ico">{i < step ? '\u2713' : i === step ? <span className="spinner" /> : '\u00B7'}</span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {phase === 'probe' && (
                  <>
                    <div className="setup-head">Probing supported PIDs (Mode 01)</div>
                    <div className="setup-list">
                      {PROBE_PIDS.map((pid, i) => (
                        <div key={pid} className={`setup-item ${probeDone.includes(i) ? 'done' : i === probeDone.length ? 'active' : ''}`}>
                          <span className="setup-ico">{probeDone.includes(i) ? '\u2713' : i === probeDone.length ? <span className="spinner" /> : '\u00B7'}</span>
                          <span>{pid} &rarr; request bitmask</span>
                          {probeDone.includes(i) && <span className="setup-ok">supported</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : tab === 'live' ? (
            <motion.div key="live" className="obd-live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GaugePanel />
              <div className="obd-lower">
                <div className="obd-graph-wrap">
                  <div className="panel-label">Real-time — speed &amp; MAF</div>
                  <DataGraph />
                </div>
                <div className="pid-table-wrap">
                  <div className="panel-label">Live PID data</div>
                  <div className="pid-table">
                    {pids.map((p) => (
                      <div key={p.id} className="pid-row">
                        <span className="pid-id">{p.id}</span>
                        <span className="pid-name">{p.name}</span>
                        <span className="pid-val">{p.v}</span>
                        <span className="pid-unit">{p.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="dtc" className="obd-dtc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="dtc-head">
                <div>
                  <div className="dtc-title">Diagnostic Trouble Codes</div>
                  <div className="dtc-sub">Mode 03 — stored &amp; pending</div>
                </div>
                <div className="dtc-actions">
                  <button className="btn" onClick={() => runDtc(false)} disabled={dtcScanning}>Scan</button>
                  <button className="btn ghost" onClick={() => { setInjected((v) => !v); runDtc(!injected) }} disabled={dtcScanning}>
                    {injected ? 'Clear faults' : 'Inject demo faults'}
                  </button>
                </div>
              </div>
              <div className="dtc-body">
                {dtcScanning ? (
                  <div className="dtc-scan">
                    <span className="spinner big" />
                    <div>Scanning ECUs…</div>
                  </div>
                ) : dtcResult === null ? (
                  <div className="dtc-idle">Press Scan to read fault codes from the engine ECU.</div>
                ) : dtcResult.length === 0 ? (
                  <motion.div className="dtc-none" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    No DTCs found — all systems OK
                  </motion.div>
                ) : (
                  <div className="dtc-list">
                    {dtcResult.map((d, i) => (
                      <motion.div key={d.code} className="dtc-row" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}>
                        <span className="dtc-code">{d.code}</span>
                        <span className="dtc-desc">{d.desc}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
