import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { updateWebsite, deleteWebsite } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的网站ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, url, tags, customLogo, section } = body

    // URL格式验证（如果提供了URL）
    if (url) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json({ error: "URL格式无效" }, { status: 400 })
      }
    }

    const website = await updateWebsite(id, {
      name,
      description,
      url,
      tags,
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

    return NextResponse.json({ website: formattedWebsite })
  } catch (error) {
    console.error("更新网站失败:", error)
    if (error instanceof Error && error.message === "网站不存在") {
      return NextResponse.json({ error: "网站不存在" }, { status: 404 })
    }
    return NextResponse.json({ error: "更新网站失败" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "无效的网站ID" }, { status: 400 })
    }

    const success = await deleteWebsite(id)
    if (!success) {
      return NextResponse.json({ error: "网站不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "网站删除成功" })
  } catch (error) {
    console.error("删除网站失败:", error)
    return NextResponse.json({ error: "删除网站失败" }, { status: 500 })
  }
}
