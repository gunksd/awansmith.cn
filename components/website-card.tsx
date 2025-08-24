"use client"

import { motion } from "framer-motion"
import { ExternalLink, Tag } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Website } from "@/lib/types"

interface WebsiteCardProps {
  website: Website
  index?: number
}

export function WebsiteCard({ website, index = 0 }: WebsiteCardProps) {
  const handleClick = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Card
        className="group cursor-pointer h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl overflow-hidden"
        onClick={handleClick}
      >
        <CardContent className="p-6 h-full flex flex-col">
          {/* 头部区域 */}
          <div className="flex items-start gap-4 mb-4">
            {/* Logo区域 - 和分区图标相同的旋转速度 */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              {website.customLogo ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                  <Image
                    src={website.customLogo || "/placeholder.svg"}
                    alt={`${website.name} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const fallback = target.parentElement?.querySelector(".fallback-logo") as HTMLElement
                      if (fallback) {
                        fallback.classList.remove("hidden")
                      }
                    }}
                  />
                  <div className="fallback-logo hidden w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {website.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {website.name.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>

            {/* 标题和外链图标 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                  {website.name}
                </h3>
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* 描述 */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
            {website.description}
          </p>

          {/* 标签区域 */}
          {website.tags && website.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {website.tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.div key={tagIndex} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border-0"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {website.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-0"
                >
                  +{website.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 悬停效果遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  )
}
