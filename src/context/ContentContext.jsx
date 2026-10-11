import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ARTICLES } from '../data/articles'
import { CASES } from '../data/cases'

// Articles and cases come from the content API (managed in /admin). The bundled
// data files are only a fallback when the API is not reachable (e.g. static hosting).
const ContentContext = createContext(null)

const CACHE_KEY = 'et-content-v1'
const FALLBACK = { articles: ARTICLES, cases: CASES }

const valid = (d) => d && Array.isArray(d.articles) && Array.isArray(d.cases)

function readCache() {
  try {
    const d = JSON.parse(localStorage.getItem(CACHE_KEY))
    return valid(d) ? d : null
  } catch {
    return null
  }
}

export function ContentProvider({ children }) {
  const [cached] = useState(readCache)
  const [data, setData] = useState(cached || FALLBACK)
  // With a cached copy the page renders at once and is refreshed silently.
  const [ready, setReady] = useState(Boolean(cached))

  const refresh = useCallback(async () => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 3500)
    try {
      const res = await fetch('/api/content', { cache: 'no-store', signal: ctrl.signal })
      const json = res.ok ? await res.json() : null
      if (valid(json)) {
        setData(json)
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(json))
        } catch {
          /* storage full or unavailable */
        }
      }
    } catch {
      /* offline or no API: keep what we have */
    } finally {
      clearTimeout(timer)
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(() => ({ articles: data.articles, cases: data.cases, ready, refresh }), [data, ready, refresh])

  if (!ready) return null
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
