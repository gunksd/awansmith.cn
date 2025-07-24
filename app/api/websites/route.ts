import { NextResponse } from "next/server"
import { getAllWebsites } from "@/lib/database"

export async function GET() {
  try {
    const websites = await getAllWebsites()

    // 按分区组织数据
    const websiteData: Record<string, any[]> = {
      funding: [],
      tradingData: [],
      faucet: [],
      airdrop: [],
      tutorial: [],
      exchange: [],
    }

    websites.forEach((site) => {
      const websiteItem = {
        id: site.id.toString(),
        name: site.name,
        description: site.description,
        url: site.url,
        tags: site.tags || [],
        customLogo: site.custom_logo,
      }

      if (websiteData[site.section]) {
        websiteData[site.section].push(websiteItem)
      }
    })

    return NextResponse.json(websiteData)
  } catch (error) {
    console.error("获取网站数据失败:", error)
    return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
  }
}
