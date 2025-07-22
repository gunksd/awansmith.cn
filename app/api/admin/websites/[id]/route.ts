import { type NextRequest, NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  try {
    const { id } = await params

    // 这里应该从数据库删除
    console.log("删除网站:", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
