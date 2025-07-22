import { type NextRequest, NextResponse } from "next/server"
import { checkAuth } from "@/lib/auth"

export async function GET() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  // 这里应该从数据库获取数据，现在返回模拟数据
  return NextResponse.json({ websites: [] })
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // 这里应该保存到数据库
    // 现在只是模拟成功响应
    console.log("添加网站:", data)

    return NextResponse.json({ success: true, id: Date.now().toString() })
  } catch (error) {
    return NextResponse.json({ error: "添加失败" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }

  try {
    const data = await request.json()

    // 这里应该更新数据库
    console.log("更新网站:", data)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}
