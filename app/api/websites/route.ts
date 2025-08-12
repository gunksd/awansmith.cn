import { NextResponse } from "next/server"
import { getWebsites } from "@/lib/database"

export async function GET() {
  try {
    console.log("[SERVER] 开始获取网站数据...")

    const websites = await getWebsites()

    console.log("[SERVER] 获取网站成功:", websites.length, "个网站")

    return NextResponse.json(websites)
  } catch (error) {
    console.error("[SERVER] 获取网站失败:", error)
    return NextResponse.json({ error: "获取网站失败: " + (error as Error).message }, { status: 500 })
  }
}
