"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavigationSections } from "@/components/navigation-sections"

// 新的Logo组件 - 使用💸表情
function Logo() {
  return (
    <motion.div
      className="flex items-center gap-3"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* 💸表情Logo图标 */}
      <div className="relative">
        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg border-2 border-orange-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <motion.span
            className="text-2xl inline-block"
            style={{ display: "inline-block" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            💸
          </motion.span>
        </motion.div>

        {/* 发光效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-md -z-10"></div>
      </div>

      {/* 文字Logo */}
      <div className="flex flex-col">
        <motion.h1
          className="text-xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          蓬门今始为君开
        </motion.h1>
        <motion.p
          className="text-xs text-slate-500 dark:text-slate-400 font-medium"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          Web3 资源导航门户
        </motion.p>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟加载时间
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          {/* 加载动画 */}
          <div className="relative mb-8">
            {/* 外层旋转圆圈 */}
            <div className="w-20 h-20 border-4 border-orange-200 dark:border-orange-800 rounded-full animate-spin border-t-orange-500"></div>

            {/* 内层反向旋转圆圈 */}
            <div
              className="absolute inset-2 w-16 h-16 border-4 border-red-200 dark:border-red-800 rounded-full animate-spin border-t-transparent border-r-red-500"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>

            {/* 中心💸表情 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-3xl inline-block"
                style={{ display: "inline-block" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                💸
              </motion.span>
            </div>
          </div>

          <motion.h2
            className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            蓬门今始为君开
          </motion.h2>
          <p className="text-slate-500 dark:text-slate-400">正在为您打开Web3世界的大门...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Sidebar />

        <main className="md:ml-20 lg:ml-80 transition-all duration-300">
          {/* 顶部导航栏 */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo区域 */}
                <Logo />

                {/* 搜索栏 */}
                <div className="flex-1 max-w-md mx-8">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="搜索资源..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                    />
                  </div>
                </div>

                {/* 右侧操作区 */}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          {/* 主要内容区域 */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <NavigationSections searchTerm={searchTerm} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
