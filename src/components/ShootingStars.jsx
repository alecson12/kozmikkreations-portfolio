import { useEffect, useRef } from 'react'

// Now and then a small shooting star crosses the sky. Short, thin and quick,
// so it adds life without pulling the eye. None when reduced motion is on.
export default function ShootingStars() {
  const host = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer = 0
    const fire = () => {
      const el = host.current
      if (el && !document.hidden) {
        const star = document.createElement('span')
        const leftward = Math.random() < 0.4
        const angle = leftward ? 142 + Math.random() * 22 : 16 + Math.random() * 22
        const travel = 150 + Math.random() * 150
        const rad = (angle * Math.PI) / 180
        star.className = 'shooting-star'
        star.style.left = `${(leftward ? 30 : 5) + Math.random() * 65}%`
        star.style.top = `${4 + Math.random() * 50}%`
        star.style.width = `${34 + Math.random() * 40}px`
        star.style.rotate = `${angle}deg`
        star.style.setProperty('--dx', `${Math.cos(rad) * travel}px`)
        star.style.setProperty('--dy', `${Math.sin(rad) * travel}px`)
        star.style.animationDuration = `${0.65 + Math.random() * 0.45}s`
        star.addEventListener('animationend', () => star.remove())
        el.appendChild(star)
      }
      timer = window.setTimeout(fire, 3200 + Math.random() * 5200)
    }
    timer = window.setTimeout(fire, 2600)
    return () => window.clearTimeout(timer)
  }, [])
  return <div ref={host} className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true" />
}
