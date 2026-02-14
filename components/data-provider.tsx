"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react"
import type { Section, Website } from "@/lib/types"

interface DataContextType {
  sections: Section[]
  websites: Website[]
  loading: boolean
  error: string | null
  refresh: () => void
}

const DataContext = createContext<DataContextType>({
  sections: [],
  websites: [],
  loading: true,
  error: null,
  refresh: () => {},
})

export const useNavigationData = () => useContext(DataContext)

const CACHE_KEY = "nav_data"
const CACHE_TS_KEY = "nav_data_ts"
const CACHE_VER_KEY = "nav_data_ver"
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour
const CACHE_VERSION = "5"

export function DataProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Section[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadFromCache = (): boolean => {
    try {
      if (localStorage.getItem(CACHE_VER_KEY) !== CACHE_VERSION) {
        clearCache()
        return false
      }
      const raw = localStorage.getItem(CACHE_KEY)
      const ts = localStorage.getItem(CACHE_TS_KEY)
      if (raw && ts && Date.now() - parseInt(ts, 10) < CACHE_DURATION) {
        const data = JSON.parse(raw)
        if (Array.isArray(data.sections) && Array.isArray(data.websites)) {
          setSections(data.sections)
          setWebsites(data.websites)
          return true
        }
      }
    } catch {}
    return false
  }

  const saveToCache = (s: Section[], w: Website[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ sections: s, websites: w }))
      localStorage.setItem(CACHE_TS_KEY, Date.now().toString())
      localStorage.setItem(CACHE_VER_KEY, CACHE_VERSION)
    } catch {}
  }

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TS_KEY)
      localStorage.removeItem(CACHE_VER_KEY)
    } catch {}
  }

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && loadFromCache()) {
      setLoading(false)
      setError(null)
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/data", { signal: abortRef.current.signal })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "获取数据失败")
      }
      const data = await res.json()
      if (!Array.isArray(data.sections) || !Array.isArray(data.websites)) {
        throw new Error("数据格式错误")
      }
      setSections(data.sections)
      setWebsites(data.websites)
      setError(null)
      saveToCache(data.sections, data.websites)
    } catch (err: any) {
      if (err?.name === "AbortError") return
      const msg = err instanceof Error ? err.message : "未知错误"
      setError(msg)
      loadFromCache()
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => {
    clearCache()
    loadData(true)
  }, [loadData])

  useEffect(() => {
    loadData()
    return () => { abortRef.current?.abort() }
  }, [loadData])

  return (
    <DataContext.Provider value={{ sections, websites, loading, error, refresh }}>
      {children}
    </DataContext.Provider>
  )
}
