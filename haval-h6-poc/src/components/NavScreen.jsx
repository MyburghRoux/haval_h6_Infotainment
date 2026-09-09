import { motion } from 'framer-motion'

const ROUTE = 'M70,260 C130,70 220,70 300,190 S430,240 470,120 S650,80 760,150'
const TURNS = [
  'Turn right onto Voortrekker Rd in 400 m',
  'Keep left towards M1 (Johannesburg)',
  'Turn left at the roundabout in 600 m',
  'Arrive at destination on your right',
]

export default function NavScreen() {
  return (
    <div className="nav">
      <div className="nav-search">
        <span className="nav-search-ico" />
        <span>Navigate to: Destination - 18.4 km</span>
        <span className="nav-search-x" />
      </div>

      <div className="nav-body">
        <div className="map">
          <svg viewBox="0 0 800 320" className="map-svg">
            <g className="map-roads">
              <path d="M0,80 H800" />
              <path d="M0,220 H800" />
              <path d="M140,0 V320" />
              <path d="M520,0 V320" />
              <path d="M0,140 H400 V60 H800" />
              <path d="M120,320 L360,0" />
            </g>
            <circle className="map-a" cx="70" cy="260" r="7" />
            <circle className="map-b" cx="760" cy="150" r="7" />
            <path className="map-route" d={ROUTE} />
            <circle className="map-car" r="8">
              <animateMotion dur="7s" repeatCount="indefinite" path={ROUTE} />
            </circle>
          </svg>
        </div>

        <div className="nav-side">
          <div className="nav-eta">
            <div className="nav-eta-time">23 min</div>
            <div className="nav-eta-dist">18.4 km</div>
          </div>
          <div className="nav-turn">
            <motion.div
              key={TURNS[0]}
              className="nav-turn-msg"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {TURNS[0]}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
