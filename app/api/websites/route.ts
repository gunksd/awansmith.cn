import { NextResponse } from "next/server"
import { getAllWebsites, getActiveSections } from "@/lib/database"

export async function GET() {
  try {
    const [websites, sections] = await Promise.all([getAllWebsites(), getActiveSections()])

    // 创建分区映射
    const sectionMap = sections.reduce(
      (acc, section) => {
        acc[section.key] = section
        return acc
      },
      {} as Record<string, any>,
    )

    // 按分区组织数据，只包含活跃分区
    const websiteData: Record<string, any[]> = {}

    // 初始化所有活跃分区
    sections.forEach((section) => {
      websiteData[section.key] = []
    })

    // 分配网站到对应分区
    websites.forEach((site) => {
      if (websiteData[site.section]) {
        const websiteItem = {
          id: site.id.toString(),
          name: site.name,
          description: site.description,
          url: site.url,
          tags: site.tags || [],
          customLogo: site.custom_logo,
        }
        websiteData[site.section].push(websiteItem)
      }
    })

    return NextResponse.json(websiteData)
  } catch (error) {
    console.error("获取网站数据失败:", error)
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
  }
}
