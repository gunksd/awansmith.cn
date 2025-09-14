import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("[SERVER] 开始获取分区数据...")

    // 使用正确的字段名：key, title而不是name, description
    const sections = await sql`
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
    `

    console.log(
      `[SERVER] 成功获取 ${sections.length} 个分区，排序信息:`,
      sections.map((s) => ({ title: s.title, sort_order: s.sort_order })),
    )

    const response = NextResponse.json(sections)
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("[SERVER] 获取分区失败:", error)
    return NextResponse.json({ error: "获取分区失败: " + (error as Error).message }, { status: 500 })
  }
}
