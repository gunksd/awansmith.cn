import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("[SERVER] 开始获取网站数据...")

    const websites = await sql`
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
    `

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

    console.log(`[SERVER] 成功获取 ${formattedWebsites.length} 个网站，按分区排序:`)
    const websitesBySection = formattedWebsites.reduce((acc: any, website: any) => {
      if (!acc[website.section]) acc[website.section] = []
      acc[website.section].push({ name: website.name, sort_order: website.sort_order })
      return acc
    }, {})
    console.log(websitesBySection)

    const response = NextResponse.json(formattedWebsites)
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("[SERVER] 获取网站失败:", error)
    return NextResponse.json({ error: "获取网站失败: " + (error as Error).message }, { status: 500 })
  }
}
