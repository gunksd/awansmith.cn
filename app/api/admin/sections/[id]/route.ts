import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { updateSection, deleteSection } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const id = Number.parseInt(resolvedParams.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的分区ID" }, { status: 400 })
    }

    const data = await request.json()
    console.log(`[API] 更新分区请求 ID=${id}:`, data)

    // 如果更新分区标识，验证格式
    if (data.key && !/^[a-zA-Z0-9_]+$/.test(data.key)) {
      return NextResponse.json({ error: "分区标识只能包含字母、数字和下划线" }, { status: 400 })
    }

    const updateData = {
      key: data.key,
      title: data.title,
      icon: data.icon,
      sortOrder: data.sortOrder,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    }

    console.log(`[API] 准备更新数据库 ID=${id}:`, updateData)

    const section = await updateSection(id, updateData)

    console.log(`[API] 更新成功 ID=${id}`)
    revalidatePath("/api/data")
    revalidatePath("/")
    return NextResponse.json(section)
  } catch (error: any) {
    console.error("更新分区失败 [CRITICAL]:", error)
    return NextResponse.json(
      { error: error.message || "更新失败", details: error.toString(), stack: error.stack },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const id = Number.parseInt(resolvedParams.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的分区ID" }, { status: 400 })
    }

    const success = await deleteSection(id)

    if (success) {
      revalidatePath("/api/data")
      revalidatePath("/")
      return NextResponse.json({ message: "删除成功" })
    } else {
      return NextResponse.json({ error: "分区不存在" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("删除分区失败:", error)
    return NextResponse.json({ error: error.message || "删除失败" }, { status: 500 })
  }
}
