"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      {sections.map((section, sectionIndex) => {
        // 使用section.key来匹配网站的section字段
        const sectionWebsites = websites.filter((website) => website.section === section.key)

        if (sectionWebsites.length === 0) {
          return null
        }

        return (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
            className="mb-12"
          >
            {/* 分区标题 */}
            <div className="flex items-center gap-4 mb-6">
              {/* 分区图标 - 添加旋转效果 */}
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
