"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WebsiteCard } from "./website-card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Grid, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Section, Website } from "@/lib/types"

// 图标映射
const iconMap: Record<string, any> = {
  bitcoin: "₿",
  ethereum: "Ξ",
  defi: "🏦",
  nft: "🎨",
  tools: "🛠️",
  news: "📰",
  education: "📚",
  trading: "📈",
  wallet: "👛",
  bridge: "🌉",
  dao: "🏛️",
  gamefi: "🎮",
  metaverse: "🌐",
  layer2: "⚡",
  analytics: "📊",
  security: "🔒",
  social: "👥",
  infrastructure: "🏗️",
  research: "🔬",
  portfolio: "💼",
}

interface NavigationSectionsProps {
  sectionsData: Section[]
  websitesData: Website[]
}

export function NavigationSections({ sectionsData, websitesData }: NavigationSectionsProps) {
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 数据验证和默认值处理
  const sections = Array.isArray(sectionsData) ? sectionsData : []
  const websites = Array.isArray(websitesData) ? websitesData : []

  // 如果没有数据，显示加载状态
  if (!sectionsData || !websitesData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">正在加载数据...</p>
        </div>
      </div>
    )
  }

  // 如果数据为空，显示空状态
  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>暂无分区数据，请联系管理员添加内容。</AlertDescription>
        </Alert>
      </div>
    )
  }

  // 按分区分组网站
  const websitesBySection = websites.reduce(
    (acc, website) => {
      const sectionKey = website.section || "other"
      if (!acc[sectionKey]) {
        acc[sectionKey] = []
      }
      acc[sectionKey].push(website)
      return acc
    },
    {} as Record<string, Website[]>,
  )

  // 滚动到指定分区
  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(`section-${sectionKey}`)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })

      // 移动端点击后关闭目录
      if (isMobile) {
        setIsDirectoryOpen(false)
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* 移动端目录 */}
      {isMobile && (
        <div className="sticky top-4 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
          <Collapsible open={isDirectoryOpen} onOpenChange={setIsDirectoryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto font-medium">
                <div className="flex items-center gap-2">
                  <Grid className="w-5 h-5 text-blue-500" />
                  <span>浏览分类目录</span>
                </div>
                {isDirectoryOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <AnimatePresence>
                {isDirectoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200/60 dark:border-gray-700/60"
                  >
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {sections.map((section) => {
                        const sectionWebsites = websitesBySection[section.key] || []
                        const icon = iconMap[section.icon] || section.icon || "📁"

                        return (
                          <motion.button
                            key={section.key}
                            onClick={() => scrollToSection(section.key)}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 text-left group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-lg flex-shrink-0">{icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                {section.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {sectionWebsites.length} 个网站
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* 分区内容 */}
      {sections.map((section) => {
        const sectionWebsites = websitesBySection[section.key] || []

        // 如果该分区没有网站，跳过显示
        if (sectionWebsites.length === 0) {
          return null
        }

        const icon = iconMap[section.icon] || section.icon || "📁"

        return (
          <motion.section
            key={section.key}
            id={`section-${section.key}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="scroll-mt-20"
          >
            {/* 分区标题 */}
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="text-2xl">{icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{section.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{sectionWebsites.length} 个网站</p>
              </div>
            </div>

            {/* 网站卡片网格 - 确保等高 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {sectionWebsites.map((website) => (
                <WebsiteCard key={website.id} website={website} />
              ))}
            </div>
          </motion.section>
        )
      })}

      {/* 如果没有任何网站 */}
      {websites.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>暂无网站数据，请联系管理员添加内容。</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
