import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TRACKS = [
  { title: 'Neon Highway', artist: 'Synth Drive', dur: 214 },
  { title: 'Midnight Auto', artist: 'Coastline', dur: 188 },
  { title: 'Aurora Skyline', artist: 'The Navigators', dur: 242 },
  { title: 'Gravel Roads', artist: 'Lowbeam', dur: 176 },
]

export default function MediaScreen() {
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [pos, setPos] = useState(0)
  const track = TRACKS[idx]

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setPos((p) => (p + 1) % track.dur), 1000)
    return () => clearInterval(id)
  }, [playing, track])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const pct = (pos / track.dur) * 100

  const next = () => { setIdx((i) => (i + 1) % TRACKS.length); setPos(0) }
  const prev = () => { setIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length); setPos(0) }

  return (
    <div className="media">
      <div className="media-art">
        <div className="art-disc">
          <div className="art-ring art-r1" />
          <div className="art-ring art-r2" />
          <div className="art-ring art-r3" />
        </div>
      </div>

      <div className="media-side">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="media-title"
          >
            <div className="media-track">{track.title}</div>
            <div className="media-artist">{track.artist}</div>
          </motion.div>
        </AnimatePresence>

        <div className="media-progress">
          <div className="media-bar">
            <motion.div className="media-bar-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.2 }} />
          </div>
          <div className="media-times">
            <span>{fmt(pos)}</span>
            <span>{fmt(track.dur)}</span>
          </div>
        </div>

        <div className="media-controls">
          <button className="mc-btn" onClick={prev} title="Previous">|&lt;</button>
          <button className="mc-play" onClick={() => setPlaying((p) => !p)}>
            {playing ? '||' : '>'}
          </button>
          <button className="mc-btn" onClick={next} title="Next">&gt;|</button>
        </div>

        <div className="eq">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} className={`eq-bar ${playing ? 'on' : ''}`} style={{ animationDelay: `${i * 0.09}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
