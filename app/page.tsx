import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { NavigationSections } from "@/components/navigation-sections"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarProvider } from "@/components/sidebar-context"

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex">
          {/* 侧边栏 */}
          <Sidebar />

          {/* 主内容区域 - 动态调整margin */}
          <main className="flex-1 transition-all duration-300 sidebar-collapsed:ml-20 sidebar-expanded:ml-80">
            {/* 顶部主题切换 */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-end p-4">
                <ThemeToggle />
              </div>
            </div>

            {/* 导航内容 */}
            <div className="p-6">
              <Suspense fallback={<div className="animate-pulse">加载中...</div>}>
                <NavigationSections />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
