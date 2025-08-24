"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, RefreshCw, AlertCircle, ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { WebsiteCard } from "./website-card"
import type { Section, Website } from "@/lib/types"

interface NavigationSectionsProps {
  className?: string
}

export function NavigationSections({ className }: NavigationSectionsProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const loadData = async () => {
    try {
      console.log("开始加载数据...")
      setLoading(true)
      setError(null)

      // 并行获取分区和网站数据
      const [sectionsResponse, websitesResponse] = await Promise.all([fetch("/api/sections"), fetch("/api/websites")])

      if (!sectionsResponse.ok) {
        const errorData = await sectionsResponse.json()
        throw new Error(errorData.error || "获取分区失败")
      }

      if (!websitesResponse.ok) {
        const errorData = await websitesResponse.json()
        throw new Error(errorData.error || "获取网站失败")
      }

      const sectionsData = await sectionsResponse.json()
      const websitesData = await websitesResponse.json()

      console.log("分区数据:", sectionsData)
      console.log("网站数据:", websitesData)

      // 验证数据格式
      if (!Array.isArray(sectionsData)) {
        throw new Error("分区数据格式错误")
      }

      if (!Array.isArray(websitesData)) {
        throw new Error("网站数据格式错误")
      }

      setSections(sectionsData)
      setWebsites(websitesData)
      console.log("数据加载成功:", { sections: sectionsData.length, websites: websitesData.length })
    } catch (error) {
      console.error("加载数据失败:", error)
      setError(error instanceof Error ? error.message : "未知错误")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 滚动到指定分区
  const scrollToSection = (sectionKey: string) => {
    const element = sectionRefs.current[sectionKey]
    if (element) {
      const offset = 100 // 偏移量，避免被固定头部遮挡
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
      setShowMobileMenu(false) // 关闭移动端菜单
    }
  }

  // 移动端导航菜单
  const MobileNavigationMenu = () => {
    const sectionsWithWebsites = sections.filter((section) => {
      const sectionWebsites = websites.filter((website) => website.section === section.key)
      return sectionWebsites.length > 0
    })

    return (
      <div className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 mb-6">
        <div className="px-4 py-3">
          <Button
            variant="outline"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-full justify-between bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              <span>快速导航</span>
            </div>
            <motion.div animate={{ rotate: showMobileMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </Button>

          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="mt-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {sectionsWithWebsites.map((section) => {
                        const sectionWebsites = websites.filter((website) => website.section === section.key)
                        return (
                          <motion.button
                            key={section.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => scrollToSection(section.key)}
                            className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                          >
                            <span className="text-lg">{section.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                {section.title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {sectionWebsites.length} 个
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // 加载状态
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-blue-600" />
        </motion.div>
        <p className="text-slate-600 dark:text-slate-400">正在加载数据...</p>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">加载失败</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
        </div>
        <Button onClick={loadData} variant="outline" className="mt-4 bg-transparent">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  // 空数据状态
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">暂无数据</h3>
          <p className="text-slate-600 dark:text-slate-400">还没有添加任何分区</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 移动端导航菜单 */}
      <MobileNavigationMenu />

      {/* 分区内容 */}
      {sections.map((section, sectionIndex) => {
        // 使用section.key来匹配网站的section字段
        const sectionWebsites = websites.filter((website) => website.section === section.key)

        if (sectionWebsites.length === 0) {
          return null
        }

        return (
          <motion.section
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.key] = el
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
            className="mb-12"
          >
            {/* 分区标题 */}
            <div className="flex items-center gap-4 mb-6">
              {/* 分区图标 - 旋转效果 */}
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="text-3xl p-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-600"
              >
                {section.icon}
              </motion.div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">{section.title}</h2>
                <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full w-20"></div>
              </div>

              <div className="text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                {sectionWebsites.length} 个网站
              </div>
            </div>

            {/* 网站网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sectionWebsites.map((website, websiteIndex) => (
                <WebsiteCard key={website.id} website={website} index={websiteIndex} />
              ))}
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}
