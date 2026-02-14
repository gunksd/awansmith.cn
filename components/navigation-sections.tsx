"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WebsiteCard } from "./website-card"
import { useNavigationData } from "./data-provider"

const MAX_STAGGER_DELAY = 0.4

export function NavigationSections({ className }: { className?: string }) {
  const { sections, websites, loading, error, refresh } = useNavigationData()
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-900"></div>
          <Loader2 className="absolute inset-0 w-10 h-10 text-blue-500 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">正在加载数据...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-semibold">加载失败</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          重试
        </Button>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-semibold">暂无数据</h3>
          <p className="text-sm text-muted-foreground">还没有添加任何分区</p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          刷新
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      {sections.map((section, sectionIndex) => {
        const sectionWebsites = websites.filter((w) => w.section === section.key)
        if (sectionWebsites.length === 0) return null

        const sectionDelay = Math.min(sectionIndex * 0.08, MAX_STAGGER_DELAY)

        return (
          <motion.section
            key={section.id}
            id={`section-${section.key}`}
            ref={(el) => { sectionRefs.current[section.key] = el }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionDelay, duration: 0.4, ease: "easeOut" }}
            className="mb-14"
          >
            {/* Section header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="text-2xl md:text-3xl w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/80 shadow-sm border border-slate-200/80 dark:border-slate-700/60">
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                  {section.title}
                </h2>
              </div>
              <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium tabular-nums">
                {sectionWebsites.length}
              </span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sectionWebsites.map((website, i) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  index={i}
                  sectionDelay={sectionDelay}
                />
              ))}
            </div>
          </motion.section>
        )
      })}
    </div>
  )
}
