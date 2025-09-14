import { Suspense } from "react"
import { SidebarProvider } from "@/components/sidebar-context"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavigationSections } from "@/components/navigation-sections"
import { WelcomeModalWrapper } from "@/components/welcome-modal-wrapper"

export const dynamic = "force-dynamic"
export const revalidate = 0

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">加载中...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Sidebar />

        {/* 欢迎弹窗 - 移到最外层 */}
        <WelcomeModalWrapper />

        <main className="transition-all duration-300 sidebar-expanded">
          {/* 头部区域 */}
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">蓬门今始为君开</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">最全面的区块链资源导航</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* 主要内容区域 */}
          <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<LoadingFallback />}>
              <NavigationSections />
            </Suspense>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
