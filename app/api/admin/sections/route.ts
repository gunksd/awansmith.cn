import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { getAllSections, createSection, getSectionStats } from "@/lib/sections"

/**
 * 获取所有分区
 */
export async function GET() {
  try {
    // 验证管理员权限
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const sections = await getAllSections()
    const stats = await getSectionStats()

    return NextResponse.json({
      success: true,
      data: sections,
      stats,
    })
  } catch (error) {
    console.error("获取分区列表失败:", error)
    return NextResponse.json({ error: "获取分区列表失败" }, { status: 500 })
  }
}

/**
 * 创建新分区
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = await request.json()
    const { key, title, description, icon, sort_order, is_active } = body

    // 验证必填字段
    if (!key || !title || !description || !icon) {
      return NextResponse.json({ error: "请填写所有必填字段" }, { status: 400 })
    }

    // 验证key格式（只允许字母、数字、下划线、连字符）
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      return NextResponse.json({ error: "分区标识符只能包含字母、数字、下划线和连字符" }, { status: 400 })
    }

    const section = await createSection({
      key,
      title,
      description,
      icon,
      sort_order,
      is_active,
    })

    return NextResponse.json({
      success: true,
      data: section,
      message: "分区创建成功",
    })
  } catch (error) {
    console.error("创建分区失败:", error)
    const message = error instanceof Error ? error.message : "创建分区失败"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
