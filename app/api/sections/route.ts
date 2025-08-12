import { NextResponse } from "next/server"
import { getSections } from "@/lib/database"

export async function GET() {
  try {
    console.log("[SERVER] 开始获取分区数据...")

    const sections = await getSections()

    console.log("[SERVER] 获取分区成功:", sections.length, "个分区")

    return NextResponse.json(sections)
  } catch (error) {
    console.error("[SERVER] 获取分区失败:", error)
    return NextResponse.json({ error: "获取分区失败: " + (error as Error).message }, { status: 500 })
  }
}
