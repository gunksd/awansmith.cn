import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

function getSql() {
  return neon(process.env.DATABASE_URL!)
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [DEBUG] 开始登录调试...")

    const body = await request.json()
    console.log("🔍 [DEBUG] 请求体:", body)

    const { username, password } = body

    // 1. 检查数据库中的所有管理员用户
    const sql = getSql()
    const allUsers = await sql`SELECT * FROM admin_users`
    console.log("🔍 [DEBUG] 数据库中的所有用户:", allUsers)

    // 2. 查找特定用户
    const users = await sql`
      SELECT * FROM admin_users 
      WHERE username = ${username}
    `
    console.log("🔍 [DEBUG] 查找到的用户:", users)

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "用户不存在",
        debug: {
          username,
          allUsers: allUsers.length,
          foundUsers: users.length,
        },
      })
    }

    const user = users[0]
    console.log("🔍 [DEBUG] 用户信息:", {
      id: user.id,
      username: user.username,
      hashLength: user.password_hash?.length,
      hashPrefix: user.password_hash?.substring(0, 10),
    })

    // 3. 测试密码验证
    console.log("🔍 [DEBUG] 开始密码验证...")
    console.log("🔍 [DEBUG] 输入密码:", password)
    console.log("🔍 [DEBUG] 存储哈希:", user.password_hash)

    const isValid = await bcrypt.compare(password, user.password_hash)
    console.log("🔍 [DEBUG] 密码验证结果:", isValid)

    // 4. 手动测试已知哈希
    const testHash = "$2a$12$LQv3c1yqBwEHXLAw98qDiOvvHPKHHO.BL25WdRC09NPjdgMRUbYvS"
    const testResult = await bcrypt.compare("awansmith123", testHash)
    console.log("🔍 [DEBUG] 测试已知哈希结果:", testResult)

    return NextResponse.json({
      success: true,
      debug: {
        username,
        userFound: users.length > 0,
        passwordValid: isValid,
        userInfo: {
          id: user.id,
          username: user.username,
          hashLength: user.password_hash?.length,
          hashPrefix: user.password_hash?.substring(0, 10),
        },
        testHashResult: testResult,
        allUsersCount: allUsers.length,
      },
    })
  } catch (error) {
    console.error("🔍 [DEBUG] 登录调试错误:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        debug: { error: String(error) },
      },
      { status: 500 },
    )
  }
}
