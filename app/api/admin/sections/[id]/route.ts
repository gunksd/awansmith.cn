import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { updateSection, deleteSection } from "@/lib/sections"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = await request.json()
    const { key, title, description, icon, order, visible } = body

    const section = await updateSection(params.id, {
      key,
      title,
      description,
      icon,
      order,
      visible,
    })

    return NextResponse.json({ section })
  } catch (error) {
    console.error("更新分区失败:", error)
    if (error instanceof Error && error.message === "分区不存在") {
      return NextResponse.json({ error: "分区不存在" }, { status: 404 })
    }
    return NextResponse.json({ error: "更新分区失败" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const success = await deleteSection(params.id)
    if (!success) {
      return NextResponse.json({ error: "分区不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "分区删除成功" })
  } catch (error) {
    console.error("删除分区失败:", error)
    if (error instanceof Error && error.message.includes("该分区下还有网站")) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "删除分区失败" }, { status: 500 })
  }
}
