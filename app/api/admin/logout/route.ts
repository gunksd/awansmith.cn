import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // 删除认证cookie
    cookieStore.delete("admin-token")

    return NextResponse.json({
      success: true,
      message: "退出登录成功",
    })
  } catch (error) {
    console.error("退出登录失败:", error)
    return NextResponse.json({ error: "退出登录失败" }, { status: 500 })
  }
}
