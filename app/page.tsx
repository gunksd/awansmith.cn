import { Suspense } from "react"
import { SidebarProvider } from "@/components/sidebar-context"
import { DataProvider } from "@/components/data-provider"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { NavigationSections } from "@/components/navigation-sections"
import { WelcomeModalWrapper } from "@/components/welcome-modal-wrapper"
import { getActiveSections, getAllWebsites } from "@/lib/database"

// 页面级 ISR：每 60 秒重新生成
export const revalidate = 60

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-900"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}

export default async function HomePage() {
  // 在服务端直接查数据库，用户收到的 HTML 就已经包含数据
  const [sections, websites] = await Promise.all([
    getActiveSections(),
    getAllWebsites(),
  ])

  const mappedWebsites = websites.map((w) => ({
    id: w.id.toString(),
    name: w.name,
    description: w.description,
    url: w.url,
    tags: w.tags,
    customLogo: w.custom_logo,
    section: w.section,
    sort_order: w.sort_order,
  }))

  return (
    <SidebarProvider>
      <DataProvider initialSections={sections} initialWebsites={mappedWebsites}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <Sidebar />
          <WelcomeModalWrapper />

          <main className="transition-all duration-300 sidebar-expanded">
            {/* Header */}
            <header className="sticky top-0 z-30 glass border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gradient tracking-tight">
                      蓬门今始为君开
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block mt-0.5">
                      最全面的区块链资源导航
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8">
              <Suspense fallback={<LoadingFallback />}>
                <NavigationSections />
              </Suspense>
            </div>
          </main>
        </div>
      </DataProvider>
    </SidebarProvider>
  )
}
