import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: NextRequest) {
  try {
    const { sections } = await request.json()

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "无效的分区数据" }, { status: 400 })
    }

    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
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
        retryCount++
        console.error(`更新分区排序失败 (尝试 ${retryCount}/${maxRetries}):`, error)

        if (retryCount >= maxRetries) {
          throw error
        }

        // 等待一段时间后重试
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
      }
    }
  } catch (error) {
    console.error("更新分区排序最终失败:", error)
    return NextResponse.json({ error: "更新分区排序失败" }, { status: 500 })
  }
}
