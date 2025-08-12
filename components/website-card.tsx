"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, Star } from "lucide-react"
import { toast } from "sonner"
import type { Website } from "@/lib/types"

interface WebsiteCardProps {
  website: Website
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // 复制URL到剪贴板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(website.url)
      setIsCopied(true)
      toast.success("链接已复制到剪贴板")
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error("复制失败")
    }
  }

  // 打开网站
  const openWebsite = () => {
    window.open(website.url, "_blank", "noopener,noreferrer")
  }

  // 解析标签
  const tags = website.tags
    ? website.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  return (
    <motion.div
      className="group h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-300">
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* 右上角星星装饰 */}
        <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
          <Star className="w-4 h-4 text-yellow-500" />
        </div>

        <CardContent className="p-6 flex-1 flex flex-col">
          {/* 标题和Logo区域 - 固定高度 */}
          <div className="flex items-start gap-4 mb-4 min-h-[60px]">
            {/* Logo容器 - 修复棱角露出问题 */}
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0 cursor-pointer"
              onMouseEnter={() => setIsLogoHovered(true)}
              onMouseLeave={() => setIsLogoHovered(false)}
              onClick={openWebsite}
            >
              {website.customLogo ? (
                <img
                  src={website.customLogo || "/placeholder.svg"}
                  alt={`${website.name} logo`}
                  className="w-8 h-8 object-contain rounded-lg transition-transform duration-500 ease-in-out"
                  style={{
                    transform: isLogoHovered ? "rotate(360deg) scale(1.1)" : "rotate(0deg) scale(1)",
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">${website.name.charAt(0).toUpperCase()}</div>`
                    }
                  }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm transition-transform duration-500 ease-in-out"
                  style={{
                    transform: isLogoHovered ? "rotate(360deg) scale(1.1)" : "rotate(0deg) scale(1)",
                  }}
                >
                  {website.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* 标题 - 固定2行高度 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 h-[3.5rem] flex items-start line-clamp-2 leading-7">
                {website.name}
              </h3>
            </div>
          </div>

          {/* 描述区域 - 固定3行高度 */}
          <div className="mb-4 h-[4.5rem] flex items-start">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-6">
              {website.description || "暂无描述"}
            </p>
          </div>

          {/* 标签区域 - 固定高度 */}
          <div className="min-h-[2.5rem] flex items-start mb-4">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50"
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮区域 - 推到底部 */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <Copy className="w-4 h-4 mr-1" />
                {isCopied ? "已复制" : "复制"}
              </Button>

              <Button
                size="sm"
                onClick={openWebsite}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                访问
              </Button>
            </div>
          </div>
        </CardContent>

        {/* 底部光效 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  )
}
