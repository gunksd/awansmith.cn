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
    console.log("🚀 开始处理管理员登录请求")

    const { username, password } = await request.json()
    console.log("📝 接收到的登录参数:", {
      username,
      passwordLength: password?.length,
      passwordPreview: password?.substring(0, 3) + "***",
    })

    if (!username || !password) {
      console.log("❌ 用户名或密码为空")
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    console.log("🔍 查询数据库中的用户:", username)
    const result = await sql`SELECT id, username, password_hash FROM admin_users WHERE username = ${username}`
    console.log("📊 数据库查询结果:", {
      found: result.length > 0,
      userCount: result.length,
      userData:
        result.length > 0
          ? {
              id: result[0].id,
              username: result[0].username,
              hashLength: result[0].password_hash?.length,
              hashPrefix: result[0].password_hash?.substring(0, 10),
            }
          : null,
    })

    if (result.length === 0) {
      console.log("❌ 用户不存在")
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    const admin = result[0]

    console.log("🔐 开始密码验证...")
    console.log("🔐 输入密码:", password)
    console.log("🔐 数据库哈希:", admin.password_hash)

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash)
    console.log("🔐 密码验证结果:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("❌ 密码验证失败")
      const testResult = await bcrypt.compare("awansmith123", admin.password_hash)
      console.log("🧪 测试已知密码 'awansmith123':", testResult)
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    console.log("✅ 密码验证成功，生成JWT token")

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

    console.log("🎉 登录成功")
    return NextResponse.json({
      success: true,
      message: "登录成功",
      user: {
        id: admin.id,
        username: admin.username,
      },
    })
  } catch (error) {
    console.error("💥 登录过程中发生错误:", error)
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 })
  }
}
