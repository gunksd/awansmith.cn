import { NextResponse } from "next/server"
import { updateWebsitesOrder } from "@/lib/database"

export async function PUT(request: Request) {
  try {
    const { websites } = await request.json()

    if (!websites || !Array.isArray(websites)) {
      return NextResponse.json({ error: "无效的网站排序数据" }, { status: 400 })
    }

    // 验证数据格式
    for (const website of websites) {
      if (!website.id || typeof website.sortOrder !== "number") {
        return NextResponse.json({ error: "网站排序数据格式错误" }, { status: 400 })
      }
    }

    const success = await updateWebsitesOrder(websites)

    if (success) {
      return NextResponse.json({ message: "网站排序更新成功" })
    } else {
      return NextResponse.json({ error: "更新网站排序失败" }, { status: 500 })
    }
  } catch (error) {
    console.error("更新网站排序失败:", error)
    return NextResponse.json({ error: "更新网站排序失败" }, { status: 500 })
  }
}
