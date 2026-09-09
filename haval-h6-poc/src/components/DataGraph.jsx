import { useEffect, useRef } from 'react'
import { useCar } from '../car'

const MAXPTS = 240

export default function DataGraph() {
  const { s } = useCar()
  const cvRef = useRef(null)
  const store = useRef({ speed: [], maf: [] })

  useEffect(() => {
    const cv = cvRef.current
    const ctx = cv.getContext('2d')
    const W = cv.clientWidth
    const H = cv.clientHeight
    if (cv.width !== W * 2 || cv.height !== H * 2) {
      cv.width = W * 2
      cv.height = H * 2
    }
    ctx.setTransform(2, 0, 0, 2, 0, 0)

    store.current.speed.push(s.speed)
    store.current.maf.push(s.maf)
    if (store.current.speed.length > MAXPTS) store.current.speed.shift()
    if (store.current.maf.length > MAXPTS) store.current.maf.shift()

    ctx.clearRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, (H / 4) * i)
      ctx.lineTo(W, (H / 4) * i)
      ctx.stroke()
    }

    const line = (arr, max, color) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.beginPath()
      arr.forEach((v, i) => {
        const x = (i / (MAXPTS - 1)) * W
        const y = H - (Math.min(v, max) / max) * (H - 8) - 4
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    line(store.current.speed, 220, '#3d8be8')
    line(store.current.maf, 80, '#e8a33d')

    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.font = '11px system-ui'
    ctx.fillText('speed (km/h)', 8, 14)
    ctx.fillStyle = 'rgba(232,163,61,0.8)'
    ctx.fillText('MAF (g/s)', W - 78, 14)
  }, [s])

  return <canvas ref={cvRef} className="graph" />
}
