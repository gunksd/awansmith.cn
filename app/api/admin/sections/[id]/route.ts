import { NextResponse } from "next/server"
import { updateSection, deleteSection } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的分区ID" }, { status: 400 })
    }

    const data = await request.json()

    // 如果更新分区标识，验证格式
    if (data.key && !/^[a-zA-Z0-9_]+$/.test(data.key)) {
      return NextResponse.json({ error: "分区标识只能包含字母、数字和下划线" }, { status: 400 })
    }

    const section = await updateSection(id, {
      key: data.key,
      title: data.title,
      icon: data.icon,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("更新分区失败:", error)
    return NextResponse.json({ error: error.message || "更新失败" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的分区ID" }, { status: 400 })
    }

    const success = await deleteSection(id)

    if (success) {
      return NextResponse.json({ message: "删除成功" })
    } else {
      return NextResponse.json({ error: "分区不存在" }, { status: 404 })
    }
  } catch (error) {
    console.error("删除分区失败:", error)
    return NextResponse.json({ error: error.message || "删除失败" }, { status: 500 })
  }
}
