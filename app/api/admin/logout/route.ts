import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // 清除认证cookie
    const cookieStore = cookies()
    cookieStore.delete("admin-token")

    return NextResponse.json({ message: "退出登录成功" })
  } catch (error) {
    console.error("退出登录失败:", error)
    return NextResponse.json({ error: "退出登录失败" }, { status: 500 })
  }
}
