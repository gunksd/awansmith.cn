import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("[SERVER] 开始获取网站数据...")

    // 使用正确的字段名：section而不是section_id
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

    // 转换数据格式，确保字段名一致
    const formattedWebsites = websites.map((website: any) => ({
      id: website.id.toString(),
      name: website.name,
      description: website.description,
      url: website.url,
      tags: Array.isArray(website.tags) ? website.tags : [],
      customLogo: website.custom_logo, // 转换字段名
      section: website.section,
      sort_order: website.sort_order,
    }))

    console.log(`[SERVER] 成功获取 ${formattedWebsites.length} 个网站`)
    return NextResponse.json(formattedWebsites)
  } catch (error) {
    console.error("[SERVER] 获取网站失败:", error)
    return NextResponse.json({ error: "获取网站失败: " + (error as Error).message }, { status: 500 })
  }
}
