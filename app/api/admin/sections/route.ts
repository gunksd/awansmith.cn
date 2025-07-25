import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

// 获取所有分区
export async function GET() {
  try {
    const sections = await sql`
      SELECT * FROM sections 
      WHERE is_active = true
      ORDER BY sort_order ASC
    `
    return NextResponse.json(sections)
  } catch (error) {
    console.error("获取分区数据失败:", error)
    return NextResponse.json({ error: "获取分区数据失败" }, { status: 500 })
  }
}

// 创建新分区
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // 验证必填字段
    if (!data.key || !data.title || !data.icon) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 })
    }

    // 检查key是否已存在
    const existingSection = await sql`
      SELECT id FROM sections WHERE key = ${data.key}
    `

    if (existingSection.length > 0) {
      return NextResponse.json({ error: "分区标识已存在" }, { status: 400 })
    }

    // 获取当前最大排序值
    const maxOrderResult = await sql`
      SELECT COALESCE(MAX(sort_order), 0) as max_order FROM sections
    `
    const nextOrder = maxOrderResult[0].max_order + 1

    // 创建新分区
    const result = await sql`
      INSERT INTO sections (key, title, description, icon, sort_order, is_active)
      VALUES (${data.key}, ${data.title}, ${data.description || ""}, ${data.icon}, ${nextOrder}, true)
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("创建分区失败:", error)
    return NextResponse.json({ error: "创建分区失败" }, { status: 500 })
  }
}
