import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("[SERVER] 开始获取所有数据...")
    const startTime = Date.now()

    // 使用单个事务并行查询sections和websites
    const [sections, websites] = await Promise.all([
      sql`
        SELECT 
          id,
          key,
          title,
          icon,
          sort_order,
          is_active,
          created_at,
          updated_at
        FROM sections 
        WHERE is_active = true
        ORDER BY sort_order ASC
      `,
      sql`
        SELECT 
          id,
          name,
          description,
          url,
          tags,
          custom_logo,
          section,
          sort_order,
          created_at,
          updated_at
        FROM websites 
        ORDER BY sort_order ASC, created_at DESC
      `,
    ])

    const formattedWebsites = websites.map((website: any) => ({
      id: website.id.toString(),
      name: website.name,
      description: website.description,
      url: website.url,
      tags: Array.isArray(website.tags) ? website.tags : [],
      customLogo: website.custom_logo,
      section: website.section,
      sort_order: website.sort_order,
    }))

    const endTime = Date.now()
    console.log(
      `[SERVER] 数据获取成功: ${sections.length} 个分区, ${formattedWebsites.length} 个网站, 耗时: ${endTime - startTime}ms`,
    )

    const response = NextResponse.json({
      sections,
      websites: formattedWebsites,
    })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("[SERVER] 获取数据失败:", error)
    return NextResponse.json(
      {
        error: "获取数据失败: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
