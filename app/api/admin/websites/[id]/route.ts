import { NextResponse } from "next/server"
import { updateWebsite, deleteWebsite } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const data = await request.json()

    const website = await updateWebsite(id, {
      name: data.name,
      description: data.description,
      url: data.url,
      tags: data.tags,
      customLogo: data.customLogo,
      section: data.section,
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error("更新网站失败:", error)
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const success = await deleteWebsite(id)

    if (success) {
      return NextResponse.json({ message: "删除成功" })
    } else {
      return NextResponse.json({ error: "删除失败" }, { status: 404 })
    }
  } catch (error) {
    console.error("删除网站失败:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
