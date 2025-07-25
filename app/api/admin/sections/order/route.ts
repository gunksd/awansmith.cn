import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (!Array.isArray(data.sections)) {
      return NextResponse.json({ error: "无效的数据格式" }, { status: 400 })
    }

    // 验证数据格式
    for (const section of data.sections) {
      if (!section.id || typeof section.sortOrder !== "number") {
        return NextResponse.json({ error: "无效的分区数据" }, { status: 400 })
      }
    }

    // 批量更新分区排序
    for (const section of data.sections) {
      await sql`
        UPDATE sections 
        SET sort_order = ${section.sortOrder}, updated_at = NOW()
        WHERE id = ${section.id}
      `
    }

    return NextResponse.json({ message: "排序更新成功" })
  } catch (error) {
    console.error("更新分区排序失败:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "更新失败",
      },
      { status: 500 },
    )
  }
}
