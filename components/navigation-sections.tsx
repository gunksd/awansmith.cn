"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { WebsiteCard } from "@/components/website-card"
import type { Website } from "@/lib/types"

export function NavigationSections() {
  const [websiteData, setWebsiteData] = useState<Record<string, Website[]>>({})
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // 并行获取网站数据和分区信息
        const [websitesResponse, sectionsResponse] = await Promise.all([fetch("/api/websites"), fetch("/api/sections")])

        if (!websitesResponse.ok || !sectionsResponse.ok) {
          throw new Error("获取数据失败")
        }

        const [websites, sections] = await Promise.all([websitesResponse.json(), sectionsResponse.json()])

        console.log("获取到的网站数据:", websites)
        console.log("获取到的分区数据:", sections)

        setWebsiteData(websites)
        setSectionTitles(sections)
        setError(null)
      } catch (error) {
        console.error("加载数据失败:", error)
        setError("加载数据失败，请刷新页面重试")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(sectionTitles).map(([sectionKey, title]) => {
        const sites = websiteData[sectionKey] || []

        if (sites.length === 0) return null

        return (
          <motion.section
            key={sectionKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
              <span className="text-sm text-slate-500 dark:text-slate-400">{sites.length} 个</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
              {sites.map((site, index) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <WebsiteCard website={site} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}
