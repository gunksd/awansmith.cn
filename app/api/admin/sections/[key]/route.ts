import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

// 更新分区
export async function PUT(request: Request, { params }: { params: { key: string } }) {
  try {
    const { key } = params
    const data = await request.json()

    // 验证必填字段
    if (!data.title || !data.icon) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 })
    }

    // 更新分区
    const result = await sql`
      UPDATE sections 
      SET 
        title = ${data.title}, 
        icon = ${data.icon},
        description = ${data.description || ""},
        updated_at = CURRENT_TIMESTAMP
      WHERE key = ${key}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "分区不存在" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("更新分区失败:", error)
    return NextResponse.json({ error: "更新分区失败" }, { status: 500 })
  }
}

// 删除分区
export async function DELETE(request: Request, { params }: { params: { key: string } }) {
  try {
    const { key } = params

    // 检查是否有网站使用此分区
    const websitesCount = await sql`
      SELECT COUNT(*) as count FROM websites WHERE section = ${key}
    `

    if (websitesCount[0].count > 0) {
      return NextResponse.json(
        { error: "无法删除此分区，因为有网站正在使用它", count: websitesCount[0].count },
        { status: 400 },
      )
    }

    // 软删除分区（设置为不活跃）
    const result = await sql`
      UPDATE sections 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE key = ${key}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "分区不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "分区已删除", deletedSection: result[0] })
  } catch (error) {
    console.error("删除分区失败:", error)
    return NextResponse.json({ error: "删除分区失败" }, { status: 500 })
  }
}
