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
          {/* 桌面端侧边栏 */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* 主内容区域 */}
          <main className="flex-1 w-full md:transition-all md:duration-300 md:sidebar-collapsed:ml-20 md:sidebar-expanded:ml-80">
            {/* 顶部导航栏 */}
            <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {/* 移动端汉堡菜单 */}
                  <div className="md:hidden">
                    <Sidebar />
                  </div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">蓬门今始为君开</h1>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* 导航内容 */}
            <div className="p-4 md:p-6">
              <Suspense fallback={<div className="animate-pulse text-center py-8">加载中...</div>}>
                <NavigationSections />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
