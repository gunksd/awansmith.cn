import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET() {
  console.log("[v0] 管理员登录API GET请求测试")
  return NextResponse.json({
    message: "管理员登录API正常工作",
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("=".repeat(50))
    console.log("[v0] 🚀 开始处理管理员登录请求")
    console.log("=".repeat(50))

    const { username, password } = await request.json()

    console.log("[v0] 📝 接收到的用户名:", username)
    console.log("[v0] 🔐 接收到的密码长度:", password?.length)
    console.log("[v0] 🔐 接收到的密码:", password) // 临时显示密码用于调试

    if (!username || !password) {
      console.log("[v0] 用户名或密码为空")
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    console.log("[v0] 尝试查询管理员用户:", username)

    const result = await sql`SELECT id, username, password_hash FROM admin_users WHERE username = ${username}`

    console.log("[v0] 数据库查询完成")
    console.log("[v0] 查询结果数量:", result.length)

    if (result.length > 0) {
      console.log("[v0] 找到用户:", result[0].username)
      console.log("[v0] 用户ID:", result[0].id)
      console.log("[v0] 密码哈希存在:", !!result[0].password_hash)
      console.log("[v0] 密码哈希长度:", result[0].password_hash?.length)
      console.log("[v0] 密码哈希前20个字符:", result[0].password_hash?.substring(0, 20))
    }

    if (result.length === 0) {
      console.log("[v0] 未找到管理员用户")
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    const admin = result[0]
    console.log("[v0] 开始验证密码")

    if (username === "awan" && password === "awansmith123") {
      console.log("[v0] 🧪 特殊测试：验证awan用户的密码")
      const expectedHash = "$2a$12$LQv3c1yqBwEHXLAw98qDiOvvHPKHHO.BL25WdRC09NPjdgMRUbYvS"
      console.log("[v0] 🧪 数据库中的哈希:", admin.password_hash)
      console.log("[v0] 🧪 期望的哈希:", expectedHash)
      console.log("[v0] 🧪 哈希是否匹配:", admin.password_hash === expectedHash)

      // 手动测试bcrypt
      try {
        const testResult = await bcrypt.compare("awansmith123", expectedHash)
        console.log("[v0] 🧪 手动bcrypt测试结果:", testResult)
      } catch (testError) {
        console.log("[v0] 🧪 手动bcrypt测试失败:", testError)
      }
    }

    let isPasswordValid = false
    try {
      isPasswordValid = await bcrypt.compare(password, admin.password_hash)
      console.log("[v0] bcrypt.compare 执行完成，结果:", isPasswordValid)
    } catch (bcryptError) {
      console.error("[v0] bcrypt.compare 执行失败:", bcryptError)
      return NextResponse.json({ error: "密码验证失败" }, { status: 500 })
    }

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

    console.log("[v0] JWT token 生成成功")

    // 设置cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24小时
    })

    console.log("[v0] Cookie 设置完成，登录成功")

    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: admin.id,
        username: admin.username,
      },
    })
  } catch (error) {
    console.error("=".repeat(50))
    console.error("[v0] ❌ 登录过程中发生错误:", error)
    console.error("=".repeat(50))
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 })
  }
}
