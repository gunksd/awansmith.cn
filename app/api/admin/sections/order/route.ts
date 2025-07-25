import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest) {
  try {
    const { sections } = await request.json()

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "无效的分区数据" }, { status: 400 })
    }

    // 批量更新分区排序
    for (const section of sections) {
      await sql`
        UPDATE sections 
        SET sort_order = ${section.sortOrder}, updated_at = NOW()
        WHERE id = ${section.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("更新分区排序失败:", error)
    return NextResponse.json({ error: "更新分区排序失败" }, { status: 500 })
  }
}
