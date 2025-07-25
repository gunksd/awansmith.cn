import { NextResponse } from "next/server"
import { getActiveSections } from "@/lib/database"

export async function GET() {
  try {
    const sections = await getActiveSections()

    // 转换为前端需要的格式
    const sectionMap = sections.reduce(
      (acc, section) => {
        acc[section.key] = `${section.icon} ${section.title}`
        return acc
      },
      {} as Record<string, string>,
    )

    return NextResponse.json(sectionMap)
  } catch (error) {
    console.error("获取分区数据失败:", error)
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
  }
}
