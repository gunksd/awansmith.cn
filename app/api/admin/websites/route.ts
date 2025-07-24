import { NextResponse } from "next/server"
import { getAllWebsites, createWebsite } from "@/lib/database"

export async function GET() {
  try {
    const websites = await getAllWebsites()
    return NextResponse.json(websites)
  } catch (error) {
    console.error("获取网站数据失败:", error)
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const website = await createWebsite({
      name: data.name,
      description: data.description,
      url: data.url,
      tags: data.tags || [],
      customLogo: data.customLogo,
      section: data.section,
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error("创建网站失败:", error)
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}
