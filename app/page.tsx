"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { SidebarProvider } from "@/components/sidebar-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavigationSections } from "@/components/navigation-sections"

// 新的Logo组件
function Logo() {
  return (
    <motion.div
      className="flex items-center gap-3"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* SVG Logo图标 */}
      <div className="relative">
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="drop-shadow-lg"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {/* 外圈渐变背景 */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* 外圈 */}
          <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" className="drop-shadow-md" />

          {/* 内圈装饰 */}
          <circle
            cx="20"
            cy="20"
            r="14"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
            strokeDasharray="4 2"
          />

          {/* 中心门户图标 */}
          <g transform="translate(20,20)">
            {/* 门的主体 */}
            <rect x="-8" y="-6" width="16" height="12" rx="2" fill="url(#innerGradient)" className="drop-shadow-sm" />

            {/* 门的装饰线条 */}
            <rect x="-6" y="-4" width="12" height="1" fill="rgba(255,255,255,0.8)" rx="0.5" />
            <rect x="-6" y="-1" width="12" height="1" fill="rgba(255,255,255,0.8)" rx="0.5" />
            <rect x="-6" y="2" width="12" height="1" fill="rgba(255,255,255,0.8)" rx="0.5" />

            {/* 门把手 */}
            <circle cx="4" cy="0" r="1.5" fill="rgba(255,255,255,0.9)" />

            {/* 区块链连接点 */}
            <circle cx="-10" cy="-8" r="2" fill="#10b981" className="animate-pulse" />
            <circle cx="10" cy="-8" r="2" fill="#10b981" className="animate-pulse" />
            <circle cx="-10" cy="8" r="2" fill="#10b981" className="animate-pulse" />
            <circle cx="10" cy="8" r="2" fill="#10b981" className="animate-pulse" />

            {/* 连接线 */}
            <line x1="-8" y1="-6" x2="-10" y2="-8" stroke="#10b981" strokeWidth="1" opacity="0.6" />
            <line x1="8" y1="-6" x2="10" y2="-8" stroke="#10b981" strokeWidth="1" opacity="0.6" />
            <line x1="-8" y1="6" x2="-10" y2="8" stroke="#10b981" strokeWidth="1" opacity="0.6" />
            <line x1="8" y1="6" x2="10" y2="8" stroke="#10b981" strokeWidth="1" opacity="0.6" />
          </g>
        </motion.svg>

        {/* 发光效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-md -z-10"></div>
      </div>

      {/* 文字Logo */}
      <div className="flex flex-col">
        <motion.h1
          className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          {/* 加载动画 */}
          <div className="relative mb-8">
            {/* 外层旋转圆圈 */}
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-500"></div>

            {/* 内层反向旋转圆圈 */}
            <div
              className="absolute inset-2 w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-transparent border-r-purple-500"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>

            {/* 中心SVG图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="text-blue-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="url(#starGradient)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              </motion.svg>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
