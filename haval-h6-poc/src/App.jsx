import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CarContext, useCarSim } from './car'
import StatusBar from './components/StatusBar'
import BootScreen from './components/BootScreen'
import HomeScreen from './components/HomeScreen'
import NavScreen from './components/NavScreen'
import MediaScreen from './components/MediaScreen'
import PhoneScreen from './components/PhoneScreen'
import SettingsScreen from './components/SettingsScreen'
import ObdScreen from './components/ObdScreen'
import OffroadScreen from './components/OffroadScreen'
import Controls from './components/Controls'
import Toast from './components/Toast'

export default function App() {
  const sim = useCarSim()
  const [screen, setScreen] = useState('boot')
  const [scale, setScale] = useState(1)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fit = () => setScale(Math.min((window.innerWidth - 24) / 1920, (window.innerHeight - 24) / 720))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const { act } = sim
      if (e.key === 'i' || e.key === 'I') act.toggleIgnition()
      else if (e.key === 'b' || e.key === 'B') act.setBrake(e.type === 'keydown')
      else if (e.key === 'g' || e.key === 'G') {
        const order = ['P', 'R', 'N', 'D']
        act.setGear(order[(order.indexOf(sim.s.gear) + 1) % order.length])
      } else if (e.key === 'ArrowUp') act.setThrottle(sim.s.throttle + 8)
      else if (e.key === 'ArrowDown') act.setThrottle(sim.s.throttle - 8)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sim])

  const notify = (m) => {
    setToast(m)
    setTimeout(() => setToast(null), 2600)
  }

  const isHome = screen === 'home'
  const showControls = screen !== 'boot'

  const renderScreen = () => {
    switch (screen) {
      case 'boot': return <BootScreen onDone={() => setScreen('home')} />
      case 'nav': return <NavScreen onBack={() => setScreen('home')} />
      case 'media': return <MediaScreen />
      case 'phone': return <PhoneScreen />
      case 'settings': return <SettingsScreen toast={notify} />
      case 'obd': return <ObdScreen />
      case 'offroad': return <OffroadScreen />
      case 'home':
      default: return <HomeScreen onOpen={setScreen} />
    }
  }

  return (
    <CarContext.Provider value={sim}>
      <div className="stage">
        <div className="screen-frame" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          <StatusBar hidden={screen === 'boot'} showBack={!isHome} onBack={() => setScreen('home')} />
          <div className="screen-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                className="screen-shell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
          {showControls && <Controls />}
          <Toast msg={toast} />
        </div>
        <div className="frame-note">Haval H6 OBD POC — 8:3 (1920&times;720)</div>
      </div>
    </CarContext.Provider>
  )
}
