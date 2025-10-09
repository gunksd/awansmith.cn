"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Twitter, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { Section, Website } from "@/lib/types"

interface WelcomeModalProps {
  sections: Section[]
  websites: Website[]
  onSectionClick: (sectionKey: string) => void
}

export function WelcomeModal({ sections, websites, onSectionClick }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || sections.length === 0) {
      return
    }

    const dismissed = localStorage.getItem("welcome-modal-dismissed")
    const shouldShow = dismissed !== "true"

    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [mounted, sections.length])

  const handleClose = () => {
    setIsOpen(false)
    if (dontShowAgain) {
      localStorage.setItem("welcome-modal-dismissed", "true")
    }
  }

  const handleSectionClick = (sectionKey: string) => {
    onSectionClick(sectionKey)
    handleClose()
  }

  const [sectionsWithWebsites, setSectionsWithWebsites] = useState<Section[]>([])

  useEffect(() => {
    const filteredSections = sections
      .filter((section) => {
        const sectionWebsites = websites.filter((website) => website.section === section.key)
        return sectionWebsites.length > 0
      })
      .sort((a, b) => a.sort_order - b.sort_order)

    setSectionsWithWebsites(filteredSections)
  }, [sections, websites])

  if (!mounted) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-blue-200 dark:border-blue-700 shadow-2xl">
              <CardHeader className="relative pb-4">
                {/* 关闭按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* 标题区域 */}
                <div className="text-center pr-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="text-6xl mb-4"
                  >
                    🌟
                  </motion.div>
                  <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    欢迎来到Web3的世界
                  </CardTitle>
                  <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                    祝您的梦想和财富都能在这里找到完美答案！
                  </p>
                </div>
              </CardHeader>

              <CardContent className="overflow-y-auto max-h-[60vh] space-y-6">
                {/* 推特关注区域 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* 使用侧边栏的头像图片 */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-lg"
                      >
                        <Image
                          src="/avatar.png"
                          alt="Awan Avatar"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                        {/* Twitter图标叠加 */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                          <Twitter className="w-3 h-3 text-white" />
                        </div>
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">关注我的推特</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">获取最新的Web3资讯和更新</p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <a
                        href="https://x.com/wnyn12075574"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        关注
                        <ExternalLink className="w-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </motion.div>

                <Separator />

                {/* 分区目录 */}
                <div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"
                  >
                    📚 网站分区目录
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">(点击跳转到对应分区)</span>
                  </motion.h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sectionsWithWebsites.map((section, index) => {
                      const sectionWebsites = websites.filter((website) => website.section === section.key)
                      return (
                        <motion.button
                          key={`${section.id}-${section.sort_order}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSectionClick(section.key)}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                        >
                          <div className="text-2xl p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">{section.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{section.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {sectionWebsites.length} 个精选网站
                            </p>
                          </div>
                          <div className="text-blue-500 dark:text-blue-400">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* 底部选项 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dont-show-again"
                      checked={dontShowAgain}
                      onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                      className="border-slate-400 dark:border-slate-500"
                    />
                    <label
                      htmlFor="dont-show-again"
                      className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                    >
                      不再显示此欢迎页面
                    </label>
                  </div>

                  <Button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    开始探索 🚀
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
