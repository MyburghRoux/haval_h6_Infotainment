import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function BootScreen({ onDone }) {
  const [pct, setPct] = useState(0)
  const cb = useRef(onDone)
  cb.current = onDone

  useEffect(() => {
    let v = 0
    const id = setInterval(() => {
      v = Math.min(100, v + Math.random() * 14 + 6)
      setPct(Math.floor(v))
      if (v >= 100) {
        clearInterval(id)
        setTimeout(() => cb.current(), 450)
      }
    }, 180)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="boot">
      <motion.div
        className="boot-logo"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 200 44" width="230" height="50">
          <defs>
            <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f5f5f0" />
              <stop offset="1" stopColor="#f5f5f0" />
              <stop offset="0.5" stopColor="#e8a33d">
                <animate attributeName="offset" values="0.08;0.92" dur="2.6s" repeatCount="indefinite" begin="0.4s" />
              </stop>
            </linearGradient>
          </defs>
          <text x="100" y="32" textAnchor="middle" fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" fontSize="34" fontWeight="700" letterSpacing="6" fill="url(#shine)">HAVAL</text>
        </svg>
      </motion.div>
      <motion.p
        className="boot-sub"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 0.75, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Infotainment System
      </motion.p>

      <div className="boot-bar-wrap">
        <div className="boot-bar">
          <motion.div
            className="boot-bar-fill"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div className="boot-pct">{pct}%</div>
      </div>

      <motion.p
        className="boot-tag"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.9 }}
      >
        OBD2 Connectivity POC
      </motion.p>
    </div>
  )
}
