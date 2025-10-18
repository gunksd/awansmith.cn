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

const CACHE_KEY = "navigation_data_cache"
const CACHE_TIMESTAMP_KEY = "navigation_data_cache_timestamp"
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时缓存

export function NavigationSections({ className }: NavigationSectionsProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadFromCache = (): boolean => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

      if (cachedData && cachedTimestamp) {
        const timestamp = Number.parseInt(cachedTimestamp, 10)
        const now = Date.now()

        if (now - timestamp < CACHE_DURATION) {
          const data = JSON.parse(cachedData)
          if (Array.isArray(data.sections) && Array.isArray(data.websites)) {
            setSections(data.sections)
            setWebsites(data.websites)
            return true
          }
        }
      }
    } catch (error) {
      console.error("加载缓存失败:", error)
    }
    return false
  }

  const saveToCache = (sections: Section[], websites: Website[]) => {
    try {
      const data = { sections, websites }
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (error) {
      console.error("保存缓存失败:", error)
    }
  }

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    } catch (error) {
      console.error("清除缓存失败:", error)
    }
  }

  const loadData = async (showLoadingState = true, forceRefresh = false) => {
    try {
      if (!forceRefresh && loadFromCache()) {
        setLoading(false)
        setError(null)
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      if (showLoadingState) {
        setLoading(true)
      }
      setError(null)

      const timestamp = Date.now()
      const response = await fetch(`/api/data?t=${timestamp}`, {
        cache: "no-store",
        signal: abortControllerRef.current.signal,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "获取数据失败")
      }

      const data = await response.json()

      if (!Array.isArray(data.sections) || !Array.isArray(data.websites)) {
        throw new Error("数据格式错误")
      }

      setSections(data.sections)
      setWebsites(data.websites)
      setError(null)

      saveToCache(data.sections, data.websites)
    } catch (error) {
      if (error?.name === "AbortError") {
        return
      }

      console.error("NavigationSections: 加载数据失败:", error)
      setError(error instanceof Error ? error.message : "未知错误")

      if (!loadFromCache()) {
        setError(error instanceof Error ? error.message : "未知错误")
      }
    } finally {
      if (showLoadingState) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadData()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const scrollToSection = (sectionKey: string) => {
    const element = sectionRefs.current[sectionKey]
    if (element) {
      const mobileMenuElement = document.querySelector(".md\\:hidden.sticky")
      const mobileMenuHeight = mobileMenuElement ? mobileMenuElement.getBoundingClientRect().height : 80

      const offset = mobileMenuHeight + 10
      const elementPosition = element.offsetTop - offset

      window.scrollTo({
        top: Math.max(0, elementPosition),
        behavior: "smooth",
      })
      setShowMobileMenu(false)
    }
  }

  const handleRefresh = () => {
    clearCache()
    loadData(true, true)
  }

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
            className="w-full justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium py-3"
          >
            <div className="flex items-center gap-2">
              <Menu className="w-5 h-5" />
              <span>📚 快速导航目录</span>
            </div>
            <motion.div animate={{ rotate: showMobileMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5" />
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
                <Card className="mt-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {sectionsWithWebsites.map((section) => {
                        const sectionWebsites = websites.filter((website) => website.section === section.key)
                        return (
                          <motion.button
                            key={section.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => scrollToSection(section.key)}
                            className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 text-left border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md"
                          >
                            <div className="text-2xl p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                              {section.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                {section.title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {sectionWebsites.length} 个网站
                              </div>
                            </div>
                            <div className="text-blue-500 dark:text-blue-400">
                              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">加载失败</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">这可能是由于数据库连接超时，请稍后重试</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="mt-4 bg-transparent">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">暂无数据</h3>
          <p className="text-slate-600 dark:text-slate-400">还没有添加任何分区</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <MobileNavigationMenu />

      {sections.map((section, sectionIndex) => {
        const sectionWebsites = websites.filter((website) => website.section === section.key)

        if (sectionWebsites.length === 0) {
          return null
        }

        return (
          <motion.section
            key={section.id}
            id={`section-${section.key}`}
            ref={(el) => {
              sectionRefs.current[section.key] = el
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
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
