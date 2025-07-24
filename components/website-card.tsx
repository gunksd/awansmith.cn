"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Website } from "@/lib/types"

interface WebsiteCardProps {
  website: Website
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(website.url)
      setCopied(true)
      toast({
        title: "链接已复制",
        description: "网站链接已复制到剪贴板",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制链接到剪贴板",
        variant: "destructive",
      })
    }
  }

  const handleVisit = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
  }

  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-start gap-3">
            {/* 网站Logo - 保留旋转效果 */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600"
            >
              {website.customLogo ? (
                <img
                  src={website.customLogo || "/placeholder.svg"}
                  alt={website.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    target.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${website.customLogo ? "hidden" : ""}`}>
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                {website.name}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {website.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
          {/* 标签区域 - 固定高度 */}
          <div className="mb-4">
            {website.tags && website.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                {website.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
                {website.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700">
                    +{website.tags.length - 3}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="min-h-[28px]"></div>
            )}
          </div>

          {/* 操作按钮 - 固定在底部 */}
          <div className="flex gap-2 mt-auto">
            <Button
              onClick={handleVisit}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              访问网站
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="px-3 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors bg-transparent cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
