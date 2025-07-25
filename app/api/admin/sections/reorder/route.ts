import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { sections } = await request.json()

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "无效的数据格式" }, { status: 400 })
    }

    // 使用事务更新排序
    await sql.begin(async (sql) => {
      for (let i = 0; i < sections.length; i++) {
        await sql`
          UPDATE sections 
          SET sort_order = ${i + 1}, updated_at = CURRENT_TIMESTAMP
          WHERE key = ${sections[i].key}
        `
      }
    })

    return NextResponse.json({ message: "排序更新成功" })
  } catch (error) {
    console.error("更新分区排序失败:", error)
    return NextResponse.json({ error: "更新分区排序失败" }, { status: 500 })
  }
}
