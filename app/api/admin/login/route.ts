import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const ADMIN_USERNAME = "awan"
const ADMIN_PASSWORD = "awansmith123"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // 验证用户名和密码
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // 生成JWT token
      const token = sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "24h" })

      // 设置cookie
      const cookieStore = await cookies()
      cookieStore.set("admin-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24小时
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "登录失败" }, { status: 500 })
  }
}
