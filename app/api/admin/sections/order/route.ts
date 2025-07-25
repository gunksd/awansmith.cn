import { NextResponse } from "next/server"
import { updateSectionsOrder } from "@/lib/database"

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    if (!Array.isArray(data.sections)) {
      return NextResponse.json({ error: "无效的数据格式" }, { status: 400 })
    }

    // 验证数据格式
    for (const section of data.sections) {
      if (!section.id || typeof section.sortOrder !== "number") {
        return NextResponse.json({ error: "无效的分区数据" }, { status: 400 })
      }
    }

    const success = await updateSectionsOrder(data.sections)

    if (success) {
      return NextResponse.json({ message: "排序更新成功" })
    } else {
      return NextResponse.json({ error: "更新失败" }, { status: 500 })
    }
  } catch (error) {
    console.error("更新分区排序失败:", error)
    return NextResponse.json({ error: error.message || "更新失败" }, { status: 500 })
  }
}
