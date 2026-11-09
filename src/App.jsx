import { useEffect, useRef, useState } from 'react'
import Nav from './components/Nav.jsx'
import { DirectorContext } from './cosmos/context.js'
import { createDirector } from './cosmos/director.js'
import { routeKey, useRoute } from './lib/router.js'
import About from './scenes/About.jsx'
import Contact from './scenes/Contact.jsx'
import Home from './scenes/Home.jsx'
import Project from './scenes/Project.jsx'
import Universe from './scenes/Universe.jsx'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// How long the old page stays (fading) before the new one appears, so the words
// arrive just as the camera does.
function swapDelay(from, to) {
  if (reducedMotion()) return 200
  if (from.scene === 'universe' && to.scene === 'project') return 820
  if (from.scene === 'project' && to.scene === 'universe') return 640
  if (from.scene === 'project' && to.scene === 'project') return 430
  return 860
}

function useStagedRoute(route) {
  const [shown, setShown] = useState(route)
  const [phase, setPhase] = useState('in')
  const key = routeKey(route)
  const shownKey = routeKey(shown)
  useEffect(() => {
    if (shownKey === key) {
      setPhase('in')
      return
    }
    setPhase('out')
    const id = setTimeout(() => {
      setShown(route)
      setPhase('in')
    }, swapDelay(shown, route))
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, shownKey])
  return { shown, phase }
}

export default function App() {
  const route = useRoute()
  const canvasRef = useRef(null)
  const [director, setDirector] = useState(null)
  const firstLoad = useRef(true)

  useEffect(() => {
    const d = createDirector(canvasRef.current)
    d.start()
    setDirector(d)
    return () => d.stop()
  }, [])

  useEffect(() => {
    director?.setRoute(route.scene, route.projectId)
  }, [director, route])

  // gentle parallax from the mouse (desktop only)
  useEffect(() => {
    if (!director) return
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      director.setMouse((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [director])

  const { shown, phase } = useStagedRoute(route)
  useEffect(() => {
    document.title =
      shown.scene === 'home' ? 'Kozmik Kreations — Graphic Design Portfolio' : `${titleFor(shown)} — Kozmik Kreations`
  }, [shown])

  const intro = firstLoad.current
  useEffect(() => {
    if (phase === 'out') firstLoad.current = false
  }, [phase])

  return (
    <>
      <canvas ref={canvasRef} className="sky-fallback fixed inset-0 h-full w-full" aria-hidden="true" />
      {director && (
        <DirectorContext.Provider value={director}>
          <Nav route={route} />
          <main>
            {shown.scene === 'home' && <Home key="home" phase={phase} intro={intro} />}
            {shown.scene === 'about' && <About key="about" phase={phase} />}
            {shown.scene === 'universe' && <Universe key="universe" phase={phase} />}
            {shown.scene === 'project' && <Project key={shown.projectId} phase={phase} projectId={shown.projectId} />}
            {shown.scene === 'contact' && <Contact key="contact" phase={phase} />}
          </main>
        </DirectorContext.Provider>
      )}
    </>
  )
}

function titleFor(route) {
  if (route.scene === 'about') return 'About'
  if (route.scene === 'universe') return 'Universe'
  if (route.scene === 'contact') return 'Contact'
  return 'Project'
}
