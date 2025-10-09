"use client"

import { useState, useEffect, useRef } from "react"
import { WelcomeModal } from "./welcome-modal"
import type { Section, Website } from "@/lib/types"

export function WelcomeModalWrapper() {
  const [sections, setSections] = useState<Section[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`)
    if (element) {
      const offset = 100
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)

      const timestamp = Date.now()
      const [sectionsResponse, websitesResponse] = await Promise.all([
        fetch(`/api/sections?t=${timestamp}`),
        fetch(`/api/websites?t=${timestamp}`),
      ])

      if (!sectionsResponse.ok || !websitesResponse.ok) {
        throw new Error("获取数据失败")
      }

      const sectionsData = await sectionsResponse.json()
      const websitesData = await websitesResponse.json()

      setSections(sectionsData)
      setWebsites(websitesData)
    } catch (error) {
      console.error("WelcomeModalWrapper: 加载数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (loading || sections.length === 0) {
    return null
  }

  return <WelcomeModal sections={sections} websites={websites} onSectionClick={scrollToSection} />
}
