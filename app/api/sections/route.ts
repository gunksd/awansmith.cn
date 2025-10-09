import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
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

        const response = NextResponse.json(sections)
        response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")

        return response
      } catch (error) {
        retryCount++
        console.error(`[SERVER] 获取分区失败 (尝试 ${retryCount}/${maxRetries}):`, error)

        if (retryCount >= maxRetries) {
          throw error
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
      }
    }
  } catch (error) {
    console.error("[SERVER] 获取分区最终失败:", error)
    return NextResponse.json({ error: "获取分区失败: " + (error as Error).message }, { status: 500 })
  }
}
