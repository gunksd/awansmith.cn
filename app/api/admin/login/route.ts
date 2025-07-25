import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminPassword, generateToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("[LOGIN API] 收到登录请求")

    const body = await request.json()
    const { username, password } = body

    console.log("[LOGIN API] 用户名:", username)

    // 验证用户名和密码
    if (username !== "awan") {
      console.log("[LOGIN API] 用户名错误")
      return NextResponse.json({ success: false, error: "用户名或密码错误" }, { status: 401 })
    }

    if (!verifyAdminPassword(password)) {
      console.log("[LOGIN API] 密码错误")
      return NextResponse.json({ success: false, error: "用户名或密码错误" }, { status: 401 })
    }

    // 生成JWT令牌
    const token = generateToken({ username, role: "admin" })
    console.log("[LOGIN API] 生成令牌成功")

    // 设置Cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24小时
      path: "/",
    })

    console.log("[LOGIN API] 登录成功")

    return NextResponse.json({
      success: true,
      message: "登录成功",
      token,
    })
  } catch (error) {
    console.error("[LOGIN API] 登录处理失败:", error)
    return NextResponse.json({ success: false, error: "服务器内部错误" }, { status: 500 })
  }
}
