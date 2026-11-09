import { createContext, useContext, useSyncExternalStore } from 'react'

export const DirectorContext = createContext(null)

// The director that runs the space scene (see director.js).
export const useDirector = () => useContext(DirectorContext)

// Layout, current planet, current page… re-renders only when one of them changes.
export function useCosmos() {
  const director = useContext(DirectorContext)
  return useSyncExternalStore(director.subscribe, director.getSnapshot)
}
