"use client"

import { useState, useEffect, useMemo } from "react"
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

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || sections.length === 0) return
    const dismissed = localStorage.getItem("welcome-modal-dismissed")
    if (dismissed !== "true") {
      const timer = setTimeout(() => setIsOpen(true), 800)
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

  const sectionsWithWebsites = useMemo(() => {
    return sections
      .filter((s) => websites.some((w) => w.section === s.key))
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [sections, websites])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl">
              <CardHeader className="relative pb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute right-3 top-3 w-8 h-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="text-center pr-10">
                  <div className="text-5xl mb-3">🌟</div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gradient mb-1.5">
                    欢迎来到Web3的世界
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    祝您的梦想和财富都能在这里找到完美答案！
                  </p>
                </div>
              </CardHeader>

              <CardContent className="overflow-y-auto max-h-[60vh] space-y-5 pt-0">
                {/* Twitter follow */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400/60 shadow-sm">
                      <Image src="/avatar.png" alt="Awan" width={40} height={40} className="w-full h-full object-cover" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        <Twitter className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">关注我的推特</h3>
                      <p className="text-xs text-muted-foreground">获取最新的Web3资讯</p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
                    <a href="https://x.com/wnyn12075574" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                      关注 <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>

                <Separator />

                {/* Section directory */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    📚 网站分区目录
                    <span className="text-xs font-normal text-muted-foreground">(点击跳转)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sectionsWithWebsites.map((section) => {
                      const count = websites.filter((w) => w.section === section.key).length
                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(section.key)}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/40 hover:border-blue-300/60 dark:hover:border-blue-700/40 transition-all text-left"
                        >
                          <div className="text-xl w-8 h-8 flex items-center justify-center rounded-md bg-slate-50 dark:bg-slate-700/60">
                            {section.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground">{section.title}</h4>
                            <p className="text-xs text-muted-foreground">{count} 个精选网站</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dont-show-again"
                      checked={dontShowAgain}
                      onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                    />
                    <label htmlFor="dont-show-again" className="text-xs text-muted-foreground cursor-pointer select-none">
                      不再显示此欢迎页面
                    </label>
                  </div>
                  <Button onClick={handleClose} size="sm" className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white shadow-sm">
                    开始探索
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
