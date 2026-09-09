import { useEffect, useState } from 'react'
import { IconWifi, IconSignal, IconBattery, IconBack, IconBluetooth } from './icons'

function useClock() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const hh = String(t.getHours()).padStart(2, '0')
  const mm = String(t.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export default function StatusBar({ hidden, onBack, showBack }) {
  const time = useClock()
  return (
    <div className={`statusbar ${hidden ? 'hidden' : ''}`}>
      <div className="sb-left">
        {showBack && (
          <button className="sb-back" onClick={onBack} title="Back to home">
            <IconBack width="18" height="18" />
            <span>Home</span>
          </button>
        )}
        <span className="sb-brand">HAVAL</span>
      </div>
      <div className="sb-right">
        <span className="sb-ico"><IconBluetooth width="17" height="17" /></span>
        <span className="sb-ico"><IconWifi width="18" height="18" /></span>
        <span className="sb-ico"><IconSignal width="18" height="18" /></span>
        <span className="sb-ico"><IconBattery level={80} width="22" height="22" /></span>
        <span className="sb-temp">22.5 C</span>
        <span className="sb-clock">{time}</span>
      </div>
    </div>
  )
}
