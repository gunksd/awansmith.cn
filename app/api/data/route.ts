import { NextResponse } from "next/server"
import { getActiveSections, getAllWebsites } from "@/lib/database"

// ISR: revalidate every 60 seconds instead of force-dynamic
export const revalidate = 60

export async function GET() {
  try {
    const [sections, websites] = await Promise.all([getActiveSections(), getAllWebsites()])

    const mappedWebsites = websites.map((website) => ({
      id: website.id.toString(),
      name: website.name,
      description: website.description,
      url: website.url,
      tags: website.tags,
      customLogo: website.custom_logo,
      section: website.section,
      sort_order: website.sort_order,
    }))

    const response = NextResponse.json({ sections, websites: mappedWebsites })

    // Allow CDN caching with stale-while-revalidate
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")

    return response
  } catch (error) {
    console.error("[SERVER] 获取数据失败:", error)

    const errorMessage = error instanceof Error ? error.message : "未知错误"
    return NextResponse.json(
      {
        error: errorMessage.includes("timeout") ? "数据库连接超时，请刷新页面重试" : `获取数据失败: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
