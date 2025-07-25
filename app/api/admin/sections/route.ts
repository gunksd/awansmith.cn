import { NextResponse } from "next/server"
import { getAllSections, createSection } from "@/lib/database"

export async function GET() {
  try {
    const sections = await getAllSections()
    return NextResponse.json(sections)
  } catch (error) {
    console.error("获取分区数据失败:", error)
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // 验证必填字段
    if (!data.key || !data.title) {
      return NextResponse.json({ error: "分区标识和标题为必填项" }, { status: 400 })
    }

    // 验证分区标识格式（只允许字母、数字、下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(data.key)) {
      return NextResponse.json({ error: "分区标识只能包含字母、数字和下划线" }, { status: 400 })
    }

    const section = await createSection({
      key: data.key,
      title: data.title,
      icon: data.icon,
      sortOrder: data.sortOrder,
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("创建分区失败:", error)
    return NextResponse.json({ error: error.message || "创建失败" }, { status: 500 })
  }
}
