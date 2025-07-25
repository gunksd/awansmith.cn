import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAllSections, createSection } from "@/lib/sections"

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const sections = await getAllSections()
    return NextResponse.json({ sections })
  } catch (error) {
    console.error("获取分区列表失败:", error)
    return NextResponse.json({ error: "获取分区列表失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = await request.json()
    const { key, title, description, icon, order, visible } = body

    // 数据验证
    if (!key || !title || !description) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 })
    }

    const section = await createSection({
      key,
      title,
      description,
      icon: icon || "📁",
      order,
      visible,
    })

    return NextResponse.json({ section }, { status: 201 })
  } catch (error) {
    console.error("创建分区失败:", error)
    return NextResponse.json({ error: "创建分区失败" }, { status: 500 })
  }
}
