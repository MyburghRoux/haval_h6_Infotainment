import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CONTACTS = [
  { name: 'Home', num: '012 345 6789' },
  { name: 'Marina', num: '082 111 2233' },
  { name: 'Workshop', num: '011 987 6543' },
  { name: 'Danie', num: '083 555 1212' },
  { name: 'GWM Assist', num: '0860 000 111' },
]

const PAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

export default function PhoneScreen() {
  const [dial, setDial] = useState('')
  const [calling, setCalling] = useState(null)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    if (!calling) return
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [calling])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const dialDisplay = calling ? calling.num : (dial || 'Enter number')

  const startCall = () => {
    if (!dial) return
    const c = CONTACTS.find((x) => x.num === dial)
    setCalling(c || { name: 'Dialing', num: dial })
    setSecs(0)
  }

  return (
    <div className="phone">
      <div className="phone-contacts">
        {CONTACTS.map((c, i) => (
          <motion.button
            key={c.name}
            className="contact"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setDial(c.num)}
          >
            <span className="contact-avatar">{c.name[0]}</span>
            <span className="contact-name">{c.name}</span>
            <span className="contact-num">{c.num}</span>
          </motion.button>
        ))}
      </div>

      <div className="phone-pad">
        <div className="dial-display">{dialDisplay}</div>
        <div className="pad-grid">
          {PAD.map((k) => (
            <button key={k} className="pad-key" onClick={() => setDial((d) => (k === '#' || k === '*') ? d : (d + k).slice(0, 11))}>
              {k}
            </button>
          ))}
        </div>
        <div className="pad-actions">
          <button className="pad-clear" onClick={() => setDial('')}>C</button>
          <button className="pad-call" onClick={startCall}>CALL</button>
          <button className="pad-del" onClick={() => setDial((d) => d.slice(0, -1))}>&lt;</button>
        </div>
      </div>

      <AnimatePresence>
        {calling && (
          <motion.div
            className="call-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="call-avatar">{calling.name[0]}</div>
            <div className="call-name">{calling.name}</div>
            <div className="call-num">{calling.num}</div>
            <div className="call-timer">{fmt(secs)}</div>
            <div className="call-pulse" />
            <button className="call-end" onClick={() => setCalling(null)}>END</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
