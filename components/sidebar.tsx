"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Twitter, ExternalLink, Gift, Menu, X, Copy, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/sidebar-context"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"

// 复制按钮组件 - 独立管理状态避免父组件重新渲染
function CopyButton({ address, type }: { address: string; type: string }) {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        await navigator.clipboard.writeText(address)
        setIsCopied(true)
        toast({
          title: "复制成功",
          description: `${type}地址已复制到剪贴板`,
          duration: 2000,
          className: "z-[10000]", // 添加更高的z-index
        })

        // 清除之前的定时器
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // 2秒后重置状态
        timeoutRef.current = setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      } catch (err) {
        toast({
          title: "复制失败",
          description: "请手动复制地址",
          variant: "destructive",
          duration: 2000,
          className: "z-[10000]", // 添加更高的z-index
        })
      }
    },
    [address, type, toast],
  )

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 flex-shrink-0">
      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [showDonation, setShowDonation] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 确保组件已挂载，避免 SSR 问题
  useEffect(() => {
    setMounted(true)
  }, [])

  const sidebarVariants = {
    expanded: { width: 320 },
    collapsed: { width: 80 },
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  }

  // BTC和ETH地址
  const btcAddress = "bc1pwswdr8jand4v8a45wuauzr6tc2fl92k7qxveqxjlk6mphmkyz3cszsj8cl"
  const ethAddress = "0x41d5408ce2b7dfd9490c0e769edd493dc878058f"

  // 切换打赏区域显示状态
  const toggleDonation = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDonation((prev) => !prev)
  }, [])

  // 移动端模态框内容
  const MobileModal = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* 侧边栏 */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-2xl z-[9999]"
            style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 9999 }}
          >
            <div className="p-6 h-full overflow-y-auto">
              {/* 关闭按钮 */}
              <div className="flex justify-end mb-4">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="w-8 h-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* 用户信息 */}
              <div className="text-center mb-6">
                <Image
                  src="/avatar.png"
                  alt="Awan Avatar"
                  width={64}
                  height={64}
                  className="rounded-full mx-auto border-4 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                />
                <div className="mt-3">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Awan Smith</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">永远学无止境</p>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* 社交链接 */}
              <div className="space-y-3 mb-6">
                <Link
                  href="https://x.com/wnyn12075574"
                  target="_blank"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Twitter className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Twitter</span>
                  <ExternalLink className="h-4 w-4 ml-auto opacity-60" />
                </Link>

                <Link
                  href="https://linktr.ee/Awansmith"
                  target="_blank"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Image src="/logos/linktree.png" alt="Linktree" width={20} height={20} />
                  <span className="text-sm font-medium">Linktree</span>
                  <ExternalLink className="h-4 w-4 ml-auto opacity-60" />
                </Link>
              </div>

              <Separator className="mb-6" />

              {/* 打赏区域 */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={toggleDonation}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 min-h-[44px] bg-transparent"
                >
                  <Gift className="h-4 w-4" />
                  支持一下
                </Button>

                {/* 使用CSS控制显示/隐藏，完全避免重新渲染 */}
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    showDonation ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0 overflow-hidden"
                  }`}
                >
                  {/* Bitcoin地址 */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold mb-2 text-orange-600">Bitcoin</h4>
                      <Image
                        src="/btc-qr.png"
                        alt="Bitcoin QR Code"
                        width={96}
                        height={96}
                        className="mx-auto mb-2 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400 break-all leading-relaxed flex-1">
                        {btcAddress}
                      </p>
                      <CopyButton address={btcAddress} type="Bitcoin" />
                    </div>
                  </div>

                  {/* Ethereum地址 */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold mb-2 text-blue-600">Ethereum</h4>
                      <Image
                        src="/eth-qr.png"
                        alt="Ethereum QR Code"
                        width={96}
                        height={96}
                        className="mx-auto mb-2 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400 break-all leading-relaxed flex-1">
                        {ethAddress}
                      </p>
                      <CopyButton address={ethAddress} type="Ethereum" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )

  // 移动端渲染汉堡菜单按钮
  const MobileMenuButton = () => (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="w-8 h-8">
        <Menu className="h-5 w-5" />
      </Button>

      {/* 使用 Portal 将模态框渲染到 body */}
      {mounted && createPortal(<MobileModal />, document.body)}
    </>
  )

  // 桌面端渲染完整侧边栏
  const DesktopSidebar = () => (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl z-50"
    >
      {/* 折叠按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="p-6 h-full overflow-y-auto">
        {/* 用户头像区域 */}
        <motion.div
          variants={contentVariants}
          animate={isCollapsed ? "collapsed" : "expanded"}
          className="text-center mb-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative inline-block">
            <Image
              src="/avatar.png"
              alt="Awan Avatar"
              width={80}
              height={80}
              className="rounded-full mx-auto border-4 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
          </motion.div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Awan Smith</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">永远学无止境</p>
            </motion.div>
          )}
        </motion.div>

        {!isCollapsed && (
          <>
            <Separator className="mb-6" />

            {/* 社交链接 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              <Link
                href="https://x.com/wnyn12075574"
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <Twitter className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Twitter</span>
                <ExternalLink className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href="https://linktr.ee/Awansmith"
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <Image
                  src="/logos/linktree.png"
                  alt="Linktree"
                  width={20}
                  height={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">Linktree</span>
                <ExternalLink className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>

            <Separator className="mb-6" />

            {/* 打赏区域 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button variant="outline" onClick={toggleDonation} className="w-full mb-4 group bg-transparent">
                <Gift className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                支持一下
              </Button>

              {/* 使用CSS控制显示/隐藏，完全避免重新渲染 */}
              <div
                className={`space-y-4 transition-all duration-300 ${
                  showDonation ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold mb-2 text-orange-600">Bitcoin</h4>
                      <Image
                        src="/btc-qr.png"
                        alt="Bitcoin QR Code"
                        width={120}
                        height={120}
                        className="mx-auto mb-2 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400 break-all flex-1">{btcAddress}</p>
                      <CopyButton address={btcAddress} type="Bitcoin" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center mb-3">
                      <h4 className="font-semibold mb-2 text-blue-600">Ethereum</h4>
                      <Image
                        src="/eth-qr.png"
                        alt="Ethereum QR Code"
                        width={120}
                        height={120}
                        className="mx-auto mb-2 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400 break-all flex-1">{ethAddress}</p>
                      <CopyButton address={ethAddress} type="Ethereum" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.aside>
  )

  // 根据屏幕尺寸返回不同组件
  return (
    <>
      <div className="md:hidden">
        <MobileMenuButton />
      </div>
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>
    </>
  )
}
