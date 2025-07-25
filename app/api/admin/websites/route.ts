import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { getAllWebsites, createWebsite } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const websites = await getAllWebsites()

    // 转换数据格式以匹配前端期望
    const formattedWebsites = websites.map((site) => ({
      id: site.id.toString(),
      name: site.name,
      description: site.description,
      url: site.url,
      tags: site.tags || [],
      customLogo: site.custom_logo,
      section: site.section,
      createdAt: site.created_at,
      updatedAt: site.updated_at,
    }))

    return NextResponse.json({ websites: formattedWebsites })
  } catch (error) {
    console.error("获取网站列表失败:", error)
    return NextResponse.json({ error: "获取网站列表失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, url, tags, customLogo, section } = body

    // 数据验证
    if (!name || !description || !url || !section) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 })
    }

    // URL格式验证
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "URL格式无效" }, { status: 400 })
    }

    const website = await createWebsite({
      name,
      description,
      url,
      tags: tags || [],
      customLogo,
      section,
    })

    // 转换数据格式
    const formattedWebsite = {
      id: website.id.toString(),
      name: website.name,
      description: website.description,
      url: website.url,
      tags: website.tags || [],
      customLogo: website.custom_logo,
      section: website.section,
      createdAt: website.created_at,
      updatedAt: website.updated_at,
    }

    return NextResponse.json({ website: formattedWebsite }, { status: 201 })
  } catch (error) {
    console.error("创建网站失败:", error)
    return NextResponse.json({ error: "创建网站失败" }, { status: 500 })
  }
}
