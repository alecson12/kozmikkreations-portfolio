// Pages are addressed with the part after # in the address bar:
//   #/            home          #/about      about
//   #/universe    the planets   #/contact    contact
//   #/project/<id>  one project
// This works on GitHub Pages without any server setup, and Back / Forward work.

import { useMemo, useSyncExternalStore } from 'react'
import { projectById } from './projects.js'

export const links = {
  home: '#/',
  about: '#/about',
  universe: '#/universe',
  contact: '#/contact',
}

export function parseHash(hash) {
  const [a, b] = hash.replace(/^#\/?/, '').split('/')
  if (a === 'about' || a === 'universe' || a === 'contact') return { scene: a, projectId: null }
  if (a === 'project') {
    const id = decodeURIComponent(b ?? '')
    return projectById[id] ? { scene: 'project', projectId: id } : { scene: 'universe', projectId: null }
  }
  return { scene: 'home', projectId: null }
}

const subscribe = (cb) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return useMemo(() => parseHash(hash), [hash])
}

export const routeKey = (r) => (r.scene === 'project' ? `project:${r.projectId}` : r.scene)
export const go = (hash) => {
  window.location.hash = hash
}
