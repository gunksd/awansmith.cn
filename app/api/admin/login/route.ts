import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 开始处理管理员登录请求")
    const { username, password } = await request.json()

    if (!username || !password) {
      console.log("[v0] 用户名或密码为空")
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    console.log("[v0] 尝试查询管理员用户:", username)

    const result = await sql`SELECT id, username, password_hash FROM admin_users WHERE username = ${username}`

    console.log("[v0] 数据库查询结果:", result)
    console.log("[v0] 查询到的用户数量:", result.length)
    if (result.length > 0) {
      console.log("[v0] 用户ID:", result[0].id)
      console.log("[v0] 用户名:", result[0].username)
      console.log("[v0] 密码哈希长度:", result[0].password_hash?.length)
      console.log("[v0] 密码哈希前缀:", result[0].password_hash?.substring(0, 10))
    }

    if (result.length === 0) {
      console.log("[v0] 未找到管理员用户")
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    const admin = result[0]
    console.log("[v0] 找到管理员用户，验证密码")
    console.log("[v0] 输入的密码长度:", password.length)
    console.log("[v0] 存储的密码哈希:", admin.password_hash)

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash)

    console.log("[v0] 密码验证结果:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("[v0] 密码验证失败")
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    console.log("[v0] 密码验证成功，生成JWT token")

    // 生成JWT token
    const token = sign(
      {
        id: admin.id,
        username: admin.username,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    // 设置cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24小时
    })

    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: admin.id,
        username: admin.username,
      },
    })
  } catch (error) {
    console.error("[v0] 登录失败:", error)
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 })
  }
}
