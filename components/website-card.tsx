"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Copy, Check, Globe, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import type { Website } from "@/lib/types"

interface WebsiteCardProps {
  website: Website
  index?: number
}

export function WebsiteCard({ website, index = 0 }: WebsiteCardProps) {
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(website.url)
      setCopied(true)

      toast({
        title: "复制成功！",
        description: `已复制 ${website.name} 的链接到剪贴板`,
        className: "z-[10001]",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("复制失败:", error)
      toast({
        title: "复制失败",
        description: "无法复制链接到剪贴板，请手动复制",
        variant: "destructive",
        className: "z-[10001]",
      })
    }
  }

  const handleVisit = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/50 border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer backdrop-blur-sm">
        <CardContent className="p-6 h-full flex flex-col">
          {/* 顶部装饰条 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

          {/* Logo和标题区域 */}
          <div className="flex items-start gap-4 mb-4">
            {/* Logo容器 - 添加旋转效果和更美观的样式 */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white dark:ring-slate-600 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300"
            >
              {website.customLogo && !imageError ? (
                <img
                  src={website.customLogo || "/placeholder.svg"}
                  alt={website.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Globe className="w-7 h-7 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
              )}

              {/* 悬浮时的光晕效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>

            {/* 标题和描述 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {website.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {website.description}
              </p>
            </div>
          </div>

          {/* 标签区域 */}
          {website.tags && website.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {website.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge
                  key={tagIndex}
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-300 font-medium"
                >
                  {tag}
                </Badge>
              ))}
              {website.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs px-3 py-1 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600"
                >
                  +{website.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 按钮区域 */}
          <div className="flex gap-3 mt-auto pt-4">
            <Button
              onClick={handleVisit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn font-medium"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
              访问网站
            </Button>

            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="px-4 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              )}
            </Button>
          </div>

          {/* 悬浮效果装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* 右上角装饰 */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
