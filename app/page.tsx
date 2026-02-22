import { Suspense } from "react";
import { SidebarProvider } from "@/components/sidebar-context";
import { DataProvider } from "@/components/data-provider";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavigationSections } from "@/components/navigation-sections";
import { WelcomeModalWrapper } from "@/components/welcome-modal-wrapper";
import { getActiveSections, getAllWebsites } from "@/lib/database";

// 页面级 ISR：每 60 秒重新生成
export const revalidate = 60;

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
  );
}

async function fetchData() {
  try {
    const [sections, websites] = await Promise.all([
      getActiveSections(),
      getAllWebsites(),
    ]);

    const mappedWebsites = websites.map((w) => ({
      id: w.id.toString(),
      name: w.name,
      description: w.description,
      url: w.url,
      tags: w.tags,
      customLogo: w.custom_logo,
      section: w.section,
      sort_order: w.sort_order,
    }));

    return { sections, websites: mappedWebsites };
  } catch (error) {
    console.error("[SSR] 数据库查询失败，回退到客户端获取:", error);
    return { sections: [], websites: [] };
  }
}

export default async function HomePage() {
  const { sections, websites: mappedWebsites } = await fetchData();

  return (
    <SidebarProvider>
      <DataProvider initialSections={sections} initialWebsites={mappedWebsites}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <Sidebar />
          <WelcomeModalWrapper />

          <main className="transition-all duration-300 sidebar-expanded">
            {/* Header */}
            <header className="sticky top-0 z-30 glass border-b border-slate-200/60 dark:border-slate-800/60 safe-top">
              <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile menu button - rendered inside header */}
                  <div className="md:hidden flex-shrink-0">
                    <Sidebar variant="mobile-trigger" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gradient tracking-tight truncate">
                      蓬门今始为君开
                    </h1>
                    <p className="text-[11px] sm:text-xs text-muted-foreground hidden sm:block mt-0.5">
                      最全面的区块链资源导航
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </header>

            {/* Content */}
            <div className="px-3 sm:px-5 md:container md:mx-auto md:px-6 py-5 sm:py-8">
              <Suspense fallback={<LoadingFallback />}>
                <NavigationSections />
              </Suspense>
            </div>
          </main>
        </div>
      </DataProvider>
    </SidebarProvider>
  );
}
