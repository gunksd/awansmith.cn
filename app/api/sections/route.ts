import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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

    console.log(`[SERVER] 成功获取 ${sections.length} 个分区`)
    return NextResponse.json(sections)
  } catch (error) {
    console.error("[SERVER] 获取分区失败:", error)
    return NextResponse.json({ error: "获取分区失败: " + (error as Error).message }, { status: 500 })
  }
}
