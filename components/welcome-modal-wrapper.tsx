"use client"

import { useState, useEffect, useRef } from "react"
import { WelcomeModal } from "./welcome-modal"
import type { Section, Website } from "@/lib/types"

export function WelcomeModalWrapper() {
  const [sections, setSections] = useState<Section[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  // 滚动到指定分区
  const scrollToSection = (sectionKey: string) => {
    console.log("尝试滚动到分区:", sectionKey)

    // 尝试通过 ID 查找元素
    const element = document.getElementById(`section-${sectionKey}`)
    if (element) {
      console.log("找到分区元素，开始滚动")
      const offset = 100 // 偏移量，避免被固定头部遮挡
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
    } else {
      console.log("未找到分区元素:", `section-${sectionKey}`)
      // 备用方案：滚动到页面顶部
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  // 加载数据
  const loadData = async () => {
    try {
      console.log("WelcomeModalWrapper: 开始加载数据...")
      setLoading(true)

      // 添加时间戳防止缓存
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

      console.log("WelcomeModalWrapper: 数据加载成功", {
        sections: sectionsData.length,
        websites: websitesData.length,
        sectionsOrder: sectionsData.map((s: Section) => ({ title: s.title, sort_order: s.sort_order })),
      })

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
        console.log("页面重新可见，刷新欢迎弹窗数据")
        loadData()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // 只有在数据加载完成且有分区数据时才渲染 WelcomeModal
  if (loading || sections.length === 0) {
    console.log("WelcomeModalWrapper: 不渲染 WelcomeModal", { loading, sectionsLength: sections.length })
    return null
  }

  console.log("WelcomeModalWrapper: 渲染 WelcomeModal")

  return <WelcomeModal sections={sections} websites={websites} onSectionClick={scrollToSection} />
}
