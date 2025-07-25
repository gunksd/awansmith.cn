import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { getSectionById, updateSection, deleteSection } from "@/lib/sections"

/**
 * 获取单个分区详情
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的分区ID" }, { status: 400 })
    }

    const section = await getSectionById(id)
    if (!section) {
      return NextResponse.json({ error: "分区不存在" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: section,
    })
  } catch (error) {
    console.error("获取分区详情失败:", error)
    return NextResponse.json({ error: "获取分区详情失败" }, { status: 500 })
  }
}

/**
 * 更新分区
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的分区ID" }, { status: 400 })
    }

    const body = await request.json()
    const { key, title, description, icon, sort_order, is_active } = body

    // 验证key格式（如果提供）
    if (key && !/^[a-zA-Z0-9_-]+$/.test(key)) {
      return NextResponse.json({ error: "分区标识符只能包含字母、数字、下划线和连字符" }, { status: 400 })
    }

    const section = await updateSection(id, {
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
      message: "分区更新成功",
    })
  } catch (error) {
    console.error("更新分区失败:", error)
    const message = error instanceof Error ? error.message : "更新分区失败"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * 删除分区
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const cookieStore = await cookies()
    const token = cookieStore.get("admin-token")?.value

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的分区ID" }, { status: 400 })
    }

    await deleteSection(id)

    return NextResponse.json({
      success: true,
      message: "分区删除成功",
    })
  } catch (error) {
    console.error("删除分区失败:", error)
    const message = error instanceof Error ? error.message : "删除分区失败"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
