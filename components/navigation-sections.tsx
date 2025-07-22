"use client"

import { motion } from "framer-motion"
import { WebsiteCard } from "@/components/website-card"
import { websiteData } from "@/lib/data"

export function NavigationSections() {
  const sectionTitles = {
    funding: "🚀 融资信息",
    tradingData: "📊 交易数据工具",
    faucet: "💧 领水网站",
    airdrop: "🎁 空投网站",
    tutorial: "📚 小白教程",
    exchange: "💱 交易所邀请",
  }

  return (
    <div className="space-y-8">
      {/* 网站分区 */}
      {Object.entries(websiteData).map(([sectionKey, sites], sectionIndex) => (
        <motion.section
          key={sectionKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">
              {sectionTitles[sectionKey as keyof typeof sectionTitles]}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{sites.length} 个</span>
          </div>

          {/* 响应式网格布局 - 移动端单列，桌面端多列 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sites.map((site, index) => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <WebsiteCard site={site} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  )
}
