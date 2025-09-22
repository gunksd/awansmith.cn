import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  const debugInfo: any[] = []

  try {
    debugInfo.push("🚀 开始处理管理员登录请求")

    const { username, password } = await request.json()
    debugInfo.push(`📝 接收到的登录参数: username=${username}, passwordLength=${password?.length}`)

    if (!username || !password) {
      debugInfo.push("❌ 用户名或密码为空")
      return NextResponse.json(
        {
          error: "用户名和密码不能为空",
          debug: debugInfo,
        },
        { status: 400 },
      )
    }

    debugInfo.push(`🔍 查询数据库中的用户: ${username}`)
    const result = await sql`SELECT id, username, password_hash FROM admin_users WHERE username = ${username}`
    debugInfo.push(`📊 数据库查询结果: 找到${result.length}个用户`)

    if (result.length === 0) {
      debugInfo.push("❌ 用户不存在")
      return NextResponse.json(
        {
          error: "用户名或密码错误",
          debug: debugInfo,
        },
        { status: 401 },
      )
    }

    const admin = result[0]
    debugInfo.push(`👤 找到用户: id=${admin.id}, username=${admin.username}`)
    debugInfo.push(`🔐 数据库中的密码哈希: ${admin.password_hash}`)

    debugInfo.push("🔐 开始密码验证...")
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash)
    debugInfo.push(`🔐 密码验证结果: ${isPasswordValid}`)

    if (!isPasswordValid) {
      debugInfo.push("❌ 密码验证失败")
      // 测试已知密码
      const testResult = await bcrypt.compare("awansmith123", admin.password_hash)
      debugInfo.push(`🧪 测试已知密码 'awansmith123': ${testResult}`)

      return NextResponse.json(
        {
          error: "用户名或密码错误",
          debug: debugInfo,
          hashInfo: {
            storedHash: admin.password_hash,
            inputPassword: password,
            testPassword: "awansmith123",
            testResult: testResult,
          },
        },
        { status: 401 },
      )
    }

    debugInfo.push("✅ 密码验证成功，生成JWT token")

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

    debugInfo.push("🎉 登录成功")
    return NextResponse.json({
      success: true,
      message: "登录成功",
      debug: debugInfo,
      user: {
        id: admin.id,
        username: admin.username,
      },
    })
  } catch (error) {
    debugInfo.push(`💥 登录过程中发生错误: ${error}`)
    return NextResponse.json(
      {
        error: "登录失败，请重试",
        debug: debugInfo,
        errorDetails: String(error),
      },
      { status: 500 },
    )
  }
}
