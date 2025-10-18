import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 60

export async function GET() {
  try {
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

    const response = NextResponse.json({
      sections,
      websites: formattedWebsites,
    })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

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
